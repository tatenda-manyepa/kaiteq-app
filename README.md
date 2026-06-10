# KAITEQ — Operations Platform

Internal delivery platform for KAITEQ (Operational Intelligence & Automation).
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
