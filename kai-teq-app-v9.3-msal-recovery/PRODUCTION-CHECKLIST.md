# KAI-TEQ V9 — production checklist

## Database and security
- [ ] Run `supabase-v9-migration.sql` after the existing V8 schema.
- [ ] Confirm Team & Security shows Tatenda as Owner and Kudzai as Admin.
- [ ] Confirm both users can load the shared workspace.
- [ ] Confirm a signed-out browser cannot read `workspace_state`, `documents`, or storage files.
- [ ] Confirm only Owner/Admin can delete shared documents.

## Documents
- [ ] Upload a harmless test receipt.
- [ ] Link it to a customer/cost and open it from another account.
- [ ] Delete the test receipt as Owner/Admin.

## Workflow
- [ ] Create lead/customer -> discovery -> opportunity -> proposal.
- [ ] Mark proposal Sent and confirm customer moves to Proposal.
- [ ] Mark proposal Accepted and confirm customer becomes Active and a delivery project is created once.
- [ ] Move project to Maintenance & Support and confirm customer becomes Retainer.
- [ ] Add a customer/pre-sales task and a customer/pre-sales cost.

## Finance
- [ ] Record one business overhead, one pre-sales cost, one project cost and one internal-product cost.
- [ ] Confirm company totals and customer profitability are correct.
- [ ] Confirm revenue type is available on projects.

## Microsoft 365
- [ ] Complete `MICROSOFT-365-SETUP.md`.
- [ ] Connect each KAI-TEQ Microsoft account.
- [ ] Import an Outlook event.
- [ ] Create a KAI-TEQ meeting and send it to Outlook.

## Responsive / UX
- [ ] Test Edge/Chrome desktop at 100% and 125% zoom.
- [ ] Test narrow laptop width and mobile browser.
- [ ] Confirm dialogs remain scrollable and all buttons are reachable.
- [ ] Confirm empty states and error messages are understandable.

## Backups
- [ ] Edit a workspace record and confirm `workspace_backups` receives a snapshot.
- [ ] Keep Supabase project recovery credentials separate from the app.

## Production domain
- [ ] Netlify shows `app.kai-teq.com` as verified and primary.
- [ ] HTTPS certificate is active.
- [ ] `https://app.kai-teq.com` opens the KAI-TEQ login page.
- [ ] Add `https://app.kai-teq.com` as the Microsoft SPA redirect URI.
