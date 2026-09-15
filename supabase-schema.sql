-- KAI-TEQ shared workspace state
-- Run this once in Supabase: SQL Editor -> New query -> paste -> Run.

create table if not exists public.workspace_state (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

alter table public.workspace_state enable row level security;

drop policy if exists "KAI-TEQ authenticated read" on public.workspace_state;
drop policy if exists "KAI-TEQ authenticated insert" on public.workspace_state;
drop policy if exists "KAI-TEQ authenticated update" on public.workspace_state;

create policy "KAI-TEQ authenticated read"
on public.workspace_state
for select
to authenticated
using (true);

create policy "KAI-TEQ authenticated insert"
on public.workspace_state
for insert
to authenticated
with check (true);

create policy "KAI-TEQ authenticated update"
on public.workspace_state
for update
to authenticated
using (true)
with check (true);

grant select, insert, update on public.workspace_state to authenticated;

create or replace function public.kai_teq_set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists kai_teq_workspace_updated_at on public.workspace_state;
create trigger kai_teq_workspace_updated_at
before update on public.workspace_state
for each row execute function public.kai_teq_set_updated_at();

-- Add the table to Supabase Realtime only if it is not already present.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'workspace_state'
  ) then
    alter publication supabase_realtime add table public.workspace_state;
  end if;
end $$;
