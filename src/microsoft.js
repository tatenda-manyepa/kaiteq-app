import { PublicClientApplication } from "@azure/msal-browser";

const clientId = import.meta.env.VITE_MS_CLIENT_ID;
const tenantId = import.meta.env.VITE_MS_TENANT_ID;
export const microsoftConfigured = Boolean(clientId && tenantId);

const origin = typeof window !== "undefined" ? window.location.origin : "";
const appRedirectUri = origin || undefined;
const popupRedirectUri = origin ? `${origin}/msal-popup.html` : undefined;
const scopes = ["User.Read", "Calendars.ReadWrite", "Calendars.ReadWrite.Shared"];

const msal = microsoftConfigured
  ? new PublicClientApplication({
      auth: {
        clientId,
        authority: `https://login.microsoftonline.com/${tenantId}`,
        redirectUri: appRedirectUri,
        postLogoutRedirectUri: appRedirectUri,
      },
      cache: {
        cacheLocation: "localStorage",
        storeAuthStateInCookie: false,
      },
      system: {
        allowRedirectInIframe: false,
      },
    })
  : null;

let initialized = false;
async function init() {
  if (msal && !initialized) {
    await msal.initialize();
    initialized = true;
    const existing = msal.getActiveAccount() || msal.getAllAccounts()[0];
    if (existing) msal.setActiveAccount(existing);
  }
}

export async function restoreMicrosoftSession() {
  if (!msal) return null;
  await init();
  const account = msal.getActiveAccount() || msal.getAllAccounts()[0] || null;
  if (account) msal.setActiveAccount(account);
  return account;
}

export function microsoftAccount() {
  if (!msal) return null;
  return msal.getActiveAccount?.() || msal.getAllAccounts?.()[0] || null;
}

export async function microsoftSignIn() {
  if (!msal) throw new Error("Microsoft 365 environment variables are not configured.");
  await init();
  const response = await msal.loginPopup({
    scopes,
    prompt: "select_account",
    redirectUri: popupRedirectUri,
  });
  if (!response?.account) throw new Error("Microsoft sign-in completed without an account.");
  msal.setActiveAccount(response.account);
  return response.account;
}

export async function microsoftSignOut() {
  if (!msal) return;
  await init();
  const account = microsoftAccount();
  if (account) {
    await msal.logoutPopup({ account, postLogoutRedirectUri: popupRedirectUri });
  }
}

async function token() {
  if (!msal) throw new Error("Microsoft 365 is not configured.");
  await init();
  const account = msal.getActiveAccount() || microsoftAccount();
  if (!account) throw new Error("Connect Microsoft 365 first.");
  try {
    return (await msal.acquireTokenSilent({ account, scopes })).accessToken;
  } catch {
    return (await msal.acquireTokenPopup({ account, scopes, redirectUri: popupRedirectUri })).accessToken;
  }
}

async function graph(path, options = {}) {
  const accessToken = await token();
  const response = await fetch(`https://graph.microsoft.com/v1.0${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Microsoft Graph ${response.status}: ${text.slice(0, 320)}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

function attendeeList(raw = "") {
  return String(raw)
    .split(/[,;\n]/)
    .map((x) => x.trim())
    .filter((x) => x.includes("@"))
    .map((address) => ({ emailAddress: { address }, type: "required" }));
}

function eventEndpoint({ calendarId = "", mailbox = "" } = {}) {
  if (mailbox.trim()) return `/users/${encodeURIComponent(mailbox.trim())}/events`;
  if (calendarId) return `/me/calendars/${encodeURIComponent(calendarId)}/events`;
  return "/me/events";
}

function calendarViewEndpoint({ calendarId = "", mailbox = "" } = {}) {
  if (mailbox.trim()) return `/users/${encodeURIComponent(mailbox.trim())}/calendarView`;
  if (calendarId) return `/me/calendars/${encodeURIComponent(calendarId)}/calendarView`;
  return "/me/calendarView";
}

export async function listOutlookCalendars() {
  const data = await graph("/me/calendars?$select=id,name,isDefaultCalendar,canEdit,canShare,owner");
  return (data.value || []).map((c) => ({
    id: c.id,
    name: c.name || "Calendar",
    isDefaultCalendar: Boolean(c.isDefaultCalendar),
    canEdit: c.canEdit !== false,
    canShare: Boolean(c.canShare),
    ownerName: c.owner?.name || "",
    ownerAddress: c.owner?.address || "",
  }));
}

export async function createOutlookEvent(m, target = {}) {
  if (!m.start) throw new Error("Meeting needs a start date/time before Outlook sync.");
  const start = new Date(m.start);
  const end = m.end ? new Date(m.end) : new Date(start.getTime() + 60 * 60 * 1000);
  const body = {
    subject: m.title || "KAI-TEQ meeting",
    body: { contentType: "HTML", content: "<p>KAI-TEQ customer meeting.</p>" },
    start: { dateTime: start.toISOString(), timeZone: "UTC" },
    end: { dateTime: end.toISOString(), timeZone: "UTC" },
    location: { displayName: m.location || "Microsoft Teams" },
    attendees: attendeeList(m.attendees),
    isOnlineMeeting: String(m.location || "").toLowerCase().includes("teams"),
    onlineMeetingProvider: "teamsForBusiness",
  };
  return graph(eventEndpoint(target), { method: "POST", body: JSON.stringify(body) });
}

export async function importOutlookEvents({ days = 60, calendarId = "", mailbox = "" } = {}) {
  const start = new Date();
  const end = new Date(Date.now() + days * 86400000);
  const qs = new URLSearchParams({
    startDateTime: start.toISOString(),
    endDateTime: end.toISOString(),
    "$top": "200",
    "$orderby": "start/dateTime",
  });
  const data = await graph(`${calendarViewEndpoint({ calendarId, mailbox })}?${qs.toString()}`, {
    headers: { Prefer: 'outlook.timezone="Europe/London"' },
  });
  return (data.value || []).map((e) => ({
    outlookEventId: e.id,
    outlookWebLink: e.webLink || "",
    outlookSource: mailbox || calendarId || "me",
    title: e.subject || "Outlook meeting",
    start: e.start?.dateTime || "",
    end: e.end?.dateTime || "",
    location: e.location?.displayName || "",
    attendees: (e.attendees || []).map((a) => a.emailAddress?.address).filter(Boolean).join(", "),
    type: "Other",
    outcome: "scheduled",
    notes: { discussion: e.bodyPreview || "" },
  }));
}
