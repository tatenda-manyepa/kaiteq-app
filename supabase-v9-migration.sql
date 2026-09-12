-- KAI-TEQ V9 migration
-- Run AFTER the existing v8 supabase-schema.sql.
-- Supabase Dashboard -> SQL Editor -> New query -> paste this file -> Run.

-- ---------------------------------------------------------------------------
-- 1) Workspace members / roles
-- ---------------------------------------------------------------------------
create table if not exists public.workspace_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  role text not null default 'member' check (role in ('owner','admin','member')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.workspace_members (user_id, email, display_name, role, active)
select id, email,
  case lower(email)
    when 'tatenda.manyepa@kai-teq.com' then 'Tatenda Manyepa'
    when 'kudzai.muriro@kai-teq.com' then 'Kudzai Muriro'
    else coalesce(raw_user_meta_data->>'full_name', split_part(email,'@',1))
  end,
  case lower(email)
    when 'tatenda.manyepa@kai-teq.com' then 'owner'
    when 'kudzai.muriro@kai-teq.com' then 'admin'
    else 'member'
  end,
  true
from auth.users
where email is not null
on conflict (user_id) do update set
  email = excluded.email,
  display_name = excluded.display_name,
  role = excluded.role,
  active = excluded.active,
  updated_at = now();

alter table public.workspace_members enable row level security;

create or replace function public.kai_teq_is_active_member()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.workspace_members m
    where m.user_id = auth.uid() and m.active = true
  );
$$;

create or replace function public.kai_teq_current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select m.role from public.workspace_members m where m.user_id = auth.uid() and m.active = true), 'none');
$$;

grant execute on function public.kai_teq_is_active_member() to authenticated;
grant execute on function public.kai_teq_current_role() to authenticated;

drop policy if exists "Members can view team" on public.workspace_members;
create policy "Members can view team" on public.workspace_members
for select to authenticated using (public.kai_teq_is_active_member());

grant select on public.workspace_members to authenticated;

-- Tighten the v8 shared workspace from "any authenticated user" to active KAI-TEQ members.
drop policy if exists "KAI-TEQ authenticated read" on public.workspace_state;
drop policy if exists "KAI-TEQ authenticated insert" on public.workspace_state;
drop policy if exists "KAI-TEQ authenticated update" on public.workspace_state;
drop policy if exists "KAI-TEQ member read" on public.workspace_state;
drop policy if exists "KAI-TEQ member insert" on public.workspace_state;
drop policy if exists "KAI-TEQ member update" on public.workspace_state;

create policy "KAI-TEQ member read" on public.workspace_state
for select to authenticated using (public.kai_teq_is_active_member());
create policy "KAI-TEQ member insert" on public.workspace_state
for insert to authenticated with check (public.kai_teq_is_active_member());
create policy "KAI-TEQ member update" on public.workspace_state
for update to authenticated using (public.kai_teq_is_active_member()) with check (public.kai_teq_is_active_member());

-- ---------------------------------------------------------------------------
-- 2) Shared document metadata
-- ---------------------------------------------------------------------------
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  storage_path text not null unique,
  mime_type text,
  size_bytes bigint,
  document_type text not null default 'Other',
  customer_id text,
  project_id text,
  product_id text,
  expense_id text,
  notes text,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

alter table public.documents enable row level security;
drop policy if exists "KAI-TEQ documents read" on public.documents;
drop policy if exists "KAI-TEQ documents insert" on public.documents;
drop policy if exists "KAI-TEQ documents delete" on public.documents;
create policy "KAI-TEQ documents read" on public.documents
for select to authenticated using (public.kai_teq_is_active_member());
create policy "KAI-TEQ documents insert" on public.documents
for insert to authenticated with check (public.kai_teq_is_active_member() and created_by = auth.uid());
create policy "KAI-TEQ documents delete" on public.documents
for delete to authenticated using (public.kai_teq_current_role() in ('owner','admin'));
grant select, insert, delete on public.documents to authenticated;

-- Private Supabase Storage bucket for receipts, proposals, contracts and evidence.
insert into storage.buckets (id, name, public, file_size_limit)
values ('kai-teq-documents', 'kai-teq-documents', false, 26214400)
on conflict (id) do update set public = false, file_size_limit = 26214400;

drop policy if exists "KAI-TEQ storage read" on storage.objects;
drop policy if exists "KAI-TEQ storage insert" on storage.objects;
drop policy if exists "KAI-TEQ storage delete" on storage.objects;
create policy "KAI-TEQ storage read" on storage.objects
for select to authenticated using (bucket_id = 'kai-teq-documents' and public.kai_teq_is_active_member());
create policy "KAI-TEQ storage insert" on storage.objects
for insert to authenticated with check (bucket_id = 'kai-teq-documents' and public.kai_teq_is_active_member());
create policy "KAI-TEQ storage delete" on storage.objects
for delete to authenticated using (bucket_id = 'kai-teq-documents' and public.kai_teq_current_role() in ('owner','admin'));

-- ---------------------------------------------------------------------------
-- 3) Automatic workspace backups
-- ---------------------------------------------------------------------------
create table if not exists public.workspace_backups (
  id bigint generated always as identity primary key,
  workspace_id text not null,
  data jsonb not null,
  backed_up_at timestamptz not null default now(),
  backed_up_by uuid references auth.users(id) on delete set null
);
alter table public.workspace_backups enable row level security;
drop policy if exists "Owner admin backup read" on public.workspace_backups;
create policy "Owner admin backup read" on public.workspace_backups
for select to authenticated using (public.kai_teq_current_role() in ('owner','admin'));
grant select on public.workspace_backups to authenticated;

create or replace function public.kai_teq_backup_workspace()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.data is distinct from new.data then
    insert into public.workspace_backups(workspace_id, data, backed_up_by)
    values(old.id, old.data, auth.uid());
  end if;
  return new;
end;
$$;

drop trigger if exists kai_teq_workspace_backup on public.workspace_state;
create trigger kai_teq_workspace_backup
before update on public.workspace_state
for each row execute function public.kai_teq_backup_workspace();

-- Retain a manageable history: keep the newest 500 snapshots.
-- This is intentionally not scheduled here; periodic cleanup can be added later.
