# KAI-TEQ — Operations Platform

Internal delivery platform for KAI-TEQ (Operational Intelligence & Automation).
React + Vite. Authentication and the shared KAI-TEQ business workspace are connected to Supabase.

## Run locally
1. Install Node.js 18+ (https://nodejs.org)
2. In this folder:
   npm install
   npm run dev
3. Open the URL it prints (usually http://localhost:5173)

## Deploy to the web (Netlify)

### Option A — fastest, no account setup beyond Netlify
1. npm install
2. npm run build         (creates a `dist` folder)
3. Go to https://app.netlify.com/drop and drag the `dist` folder onto the page.
   It's live in seconds on a free *.netlify.app URL.

### Option B — auto-deploy on every change (recommended)
1. Push this folder to a GitHub repo.
2. In Netlify: "Add new site" -> "Import from Git" -> pick the repo.
3. Build command: npm run build   |   Publish directory: dist
   (already set in netlify.toml, so Netlify fills these in automatically)
4. Every git push redeploys.

Vercel and Cloudflare Pages work the same way with the same settings.

## Notes / next steps
- Sign-in now uses Supabase Auth with email/password accounts created by the KAI-TEQ administrator.
- Business data is stored in the shared Supabase workspace so authorised KAI-TEQ users see the same operational data. Browser localStorage is retained only as a local fallback/cache.
- Add your real logo file and the Aeronik font for full brand fidelity.

## September 2026 workflow update
- Brand updated to **KAI-TEQ** throughout the visible app and browser title.
- Sidebar simplified to reduce duplicated customer information across separate modules.
- Customer records now act as a **Customer 360** hub with Overview, Projects & Tasks, Activity, Commercial, Discovery & AI, and Documents tabs.
- Deleting a customer now removes linked projects, project tasks, meetings, proposals, AI opportunities, discovery data and project costs from the current browser dataset.
- Deleting a project removes its linked tasks, meetings, discovery data, proposals, AI opportunities and project costs.
- Projects now have a lifecycle separate from the delivery stage: Planned, Active, On hold, Maintenance & Support, or Archived.
- Completed delivery should transition to **Maintenance & Support** when recurring work continues, or **Archived** when the engagement is finished. Historic revenue remains included in reporting.
- Costs are classified as **Business overhead**, **Project cost**, or **Internal product cost**. General KAI-TEQ expenses such as domains, Microsoft 365/email licences, accounting, insurance, banking fees and shared software can be recorded independently of client projects and internal products.
- Finance now surfaces recognised revenue, project costs, business overheads, internal product costs, total costs, operating profit, margin, receivables, customer contribution and recurring support revenue. Project profitability remains based only on direct project costs.
- This release uses a fresh browser storage key so the updated app starts clean with only New Leaf Oasis as a starter customer and its website project as an archived historic record.
- Calendar is now an aggregate customer meeting view rather than a separate silo. Meetings store customer/project, dates, attendees and location in an Outlook-ready shape and can export an `.ics` file for Outlook today.
- The Map is now **Geographic Intelligence**: customers vs prospects, revenue, recurring revenue, relationship/source/status filters, regional growth signals and links back to Customer 360.

### Important before production use
The current two-user version stores the operational dataset in a shared Supabase workspace row with Row Level Security and realtime enabled. Cascading deletion is still enforced by the application rather than relational foreign keys. As KAI-TEQ grows, normalise customers, projects, tasks, finance and documents into dedicated relational tables, add database-level cascade rules, audit history and role-based permissions.

- Geographic Intelligence uses Leaflet/OpenStreetMap tiles loaded from CDN in `index.html`.


## Supabase authentication setup
Netlify needs these build-time environment variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

The frontend uses the publishable Supabase key only. Never add a Supabase secret/service-role key or database password to frontend code or GitHub.


## v8 — Shared Supabase workspace

This version keeps the existing KAI-TEQ UI and Supabase authentication, and moves the app's persisted business state into a shared Supabase table so authorised users see the same customers, projects, tasks, meetings, finance, products, proposals, opportunities and discovery data. Realtime is enabled for the shared row. Browser localStorage remains only as a local fallback/cache.

### One-time database setup
1. In Supabase open **SQL Editor**.
2. Create a new query.
3. Paste the contents of `supabase-schema.sql`.
4. Run it once.
5. Deploy this code to Netlify.
6. First sign in from the browser that contains the most up-to-date KAI-TEQ data. If the cloud workspace is empty, that browser's current data becomes the initial shared workspace.

### Security
Row Level Security is enabled. Only authenticated Supabase users can read or change the shared workspace. Public sign-up should remain disabled in Supabase Authentication.

### Current collaboration model
For the current two-user stage, edits use a single shared workspace state with realtime updates and last-write-wins behaviour if two people change data at exactly the same time. A later version can normalise each business entity into separate relational tables and add audit history/roles as the team grows.

## v8 final — Company finance

The final v8 release adds company-level financial tracking without changing the Supabase schema because finance remains part of the shared workspace JSON. The Finance screen separates:
- **Business overheads** — KAI-TEQ running costs not tied to a project or product.
- **Project costs** — direct client delivery costs.
- **Internal product costs** — investment into KAI-TEQ-owned products.

Top-level reporting now shows recognised revenue, each cost class, total costs, operating profit, margin and outstanding receivables. Existing expenses are automatically classified from their current project/product links, so older data remains compatible.
