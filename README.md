# KAI-TEQ — Operations Platform

Internal delivery platform for KAI-TEQ (Operational Intelligence & Automation).
React + Vite. Projects are saved in the browser (localStorage) until you connect a database.

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
- Sign-in is a placeholder (accepts anything). For real, protected login use Supabase Auth.
- localStorage keeps data per-browser/per-device — it is NOT shared between you and your
  partner. For shared, live data across devices, move projects/customers/docs to Supabase.
- Add your real logo file and the Aeronik font for full brand fidelity.

## September 2026 workflow update
- Brand updated to **KAI-TEQ** throughout the visible app and browser title.
- Sidebar simplified to reduce duplicated customer information across separate modules.
- Customer records now act as a **Customer 360** hub with Overview, Projects & Tasks, Activity, Commercial, Discovery & AI, and Documents tabs.
- Deleting a customer now removes linked projects, project tasks, meetings, proposals, AI opportunities, discovery data and project costs from the current browser dataset.
- Deleting a project removes its linked tasks, meetings, discovery data, proposals, AI opportunities and project costs.
- Projects now have a lifecycle separate from the delivery stage: Planned, Active, On hold, Maintenance & Support, or Archived.
- Completed delivery should transition to **Maintenance & Support** when recurring work continues, or **Archived** when the engagement is finished. Historic revenue remains included in reporting.
- Costs can be assigned directly to projects and profitability is calculated as recognised revenue minus project costs, with margin shown per project.
- Finance now surfaces project profitability, receivables, costs, customer totals and recurring support revenue.
- This release uses a fresh browser storage key so the updated app starts clean with only New Leaf Oasis as a starter customer and its website project as an archived historic record.
- Calendar is now an aggregate customer meeting view rather than a separate silo. Meetings store customer/project, dates, attendees and location in an Outlook-ready shape and can export an `.ics` file for Outlook today.
- The Map is now **Geographic Intelligence**: customers vs prospects, revenue, recurring revenue, relationship/source/status filters, regional growth signals and links back to Customer 360.

### Important before production use
The current version still uses browser `localStorage` and demo authentication. Cascading deletion is therefore enforced in application state, not by a database. Before using the platform as the shared live business system, move the data to a backend such as Supabase and enforce customer/project relationships with foreign keys and database-level cascade rules. Replace the demo login with real authentication at the same time.

- Geographic Intelligence uses Leaflet/OpenStreetMap tiles loaded from CDN in `index.html`.
