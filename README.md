# KAI-TEQ Operating System — V9

V9 is the **Connected Business Workflow** release. It preserves the existing KAI-TEQ visual identity/login and builds on V8 shared Supabase authentication/data.

## V9 deliverables

- Connected business pipeline: Customer -> Discovery -> Opportunity -> Proposal -> Project -> Delivery -> Support.
- Customer-level / pre-sales tasks and costs before a project exists.
- Lifecycle automation: proposal and project state changes update customer lifecycle and accepted proposals can create delivery projects.
- Customer 360 remains the account hub for commercial, delivery, activity and growth information.
- Shared Supabase Storage for receipts, invoices, proposals, contracts, discovery and evidence, with links to customers/projects/products/costs.
- Finance additions: pre-sales costs, vendor/VAT/payment/reference/notes, revenue types, company profitability and cost classification.
- Microsoft 365 / Outlook integration using MSAL + Microsoft Graph. See `MICROSOFT-365-SETUP.md`.
- Owner/Admin/Member roles and tightened Supabase RLS. V9 seeds Tatenda as Owner and Kudzai as Admin when the migration is run.
- Automatic workspace snapshots in `workspace_backups`.
- KAI-TEQ Manager Agent monitoring layer for overdue work, proposals, customer health, opportunities, outstanding balances and business performance.
- Production checklist for testing, security, responsive UX, backup verification and `app.kai-teq.com`.

## Upgrade from V8

1. Upload these V9 repository files to GitHub and commit to `main`.
2. Let Netlify deploy. Existing Supabase variables remain unchanged.
3. In Supabase SQL Editor run **`supabase-v9-migration.sql` once**.
4. Confirm the app still loads for Tatenda and Kudzai.
5. Complete `MICROSOFT-365-SETUP.md` when ready for live Outlook sync.
6. Run `PRODUCTION-CHECKLIST.md`.

## Existing V8 schema

Keep `supabase-schema.sql`. V9 does not replace the V8 `workspace_state` table; it secures and extends it.

## Environment variables

Already present from V8:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

New for live Microsoft integration:
- `VITE_MS_CLIENT_ID`
- `VITE_MS_TENANT_ID`

No service-role key, Microsoft client secret, or AI provider secret should ever be placed in frontend Vite variables.

## Manager Agent note

V9's Manager Agent is a live deterministic management/monitoring layer based on KAI-TEQ data. This is intentional for reliable business alerts. A later secure server-side AI service can add conversational briefings and specialist-agent orchestration without exposing AI API secrets in the browser.
