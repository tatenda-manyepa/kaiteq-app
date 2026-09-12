# KAI-TEQ V9 — Connected Business Workflow

## Included in the code

1. **Connected workflow** — Business Pipeline view for Customer -> Discovery -> Opportunity -> Proposal -> Project -> Delivery -> Support, with lifecycle automation.
2. **Customer 360** — combined activity timeline, customer-level tasks/cost visibility and links into shared documents.
3. **Shared documents & receipts** — private Supabase Storage plus document metadata linked to customers, projects, internal products and costs.
4. **Finance completion** — business overheads, customer/pre-sales costs, project costs, product costs, richer expense fields, revenue types and full company totals.
5. **Microsoft 365 / Outlook** — MSAL/Graph integration for connecting an account, importing Outlook calendar events and sending KAI-TEQ meetings to Outlook.
6. **Roles & security** — Owner/Admin/Member model, member-only workspace RLS, Admin/Owner document deletion and UI delete restrictions for Members.
7. **Manager Agent** — live management-monitoring layer for overdue tasks, proposal follow-ups, customer risk, high-priority opportunities, outstanding balances and profitability.
8. **Production hardening** — automatic workspace backup snapshots, security headers, responsive adjustments and a production checklist.
9. **Production-domain awareness** — Team & Security reports LIVE when the app is actually running at `app.kai-teq.com`.

## One-time external activation after upload

Some V9 features depend on services outside the repository and cannot be activated by frontend code alone:

- Run `supabase-v9-migration.sql` once in Supabase.
- Complete `MICROSOFT-365-SETUP.md` and add the two Microsoft IDs to Netlify.
- In Netlify/GoDaddy confirm `app.kai-teq.com` is verified, primary and serving HTTPS.

No KAI-TEQ visual branding was changed in V9.
