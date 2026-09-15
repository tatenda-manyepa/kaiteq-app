# KAI-TEQ V9 — Microsoft 365 / Outlook setup

V9 includes browser-based Microsoft Graph calendar integration. No Microsoft client secret belongs in the frontend.

## One-time Microsoft Entra setup

1. Open Microsoft Entra admin center and create an **App registration** named `KAI-TEQ Operating System`.
2. Choose the KAI-TEQ Microsoft 365 tenant only (single tenant).
3. Under **Authentication**, add a **Single-page application (SPA)** redirect URI:
   - `https://app.kai-teq.com`
   - while the Netlify address is still used, also add `https://kaiteq-app.netlify.app`
4. Under **API permissions**, add delegated Microsoft Graph permissions:
   - `User.Read`
   - `Calendars.ReadWrite`
5. Copy the **Application (client) ID** and **Directory (tenant) ID**.
6. In Netlify -> Site configuration -> Environment variables, add:
   - `VITE_MS_CLIENT_ID`
   - `VITE_MS_TENANT_ID`
7. Redeploy the site.

The Calendar screen will then show **Connect**, **Import Outlook**, and **Send to Outlook** controls.

## Security

Do not create or expose a Microsoft client secret in Vite/Netlify frontend variables. V9 uses delegated SPA authentication through MSAL.
