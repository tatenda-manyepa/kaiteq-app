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
        temporaryCacheLocation: "sessionStorage",
        storeAuthStateInCookie: false,
      },
      system: {
        allowRedirectInIframe: false,
      },
    })
  : null;

let initPromise = null;
async function init() {
  if (!msal) return;
  if (!initPromise) {
    initPromise = (async () => {
      await msal.initialize();
      // Safe no-op for popup flows, but cleans up any redirect response if one exists.
      try {
        const redirectResult = await msal.handleRedirectPromise();
        if (redirectResult?.account) msal.setActiveAccount(redirectResult.account);
      } catch {
        // Popup auth is the primary flow; redirect cleanup failure must not block startup.
      }
      const existing = msal.getActiveAccount() || msal.getAllAccounts()[0];
      if (existing) msal.setActiveAccount(existing);
    })();
  }
  await initPromise;
}

function clearStaleInteractionState() {
  if (typeof window === "undefined") return;
  // MSAL can leave a temporary interaction lock behind after an interrupted/failed popup.
  // Remove only temporary interaction/request keys, not durable account/token cache entries.
  const stores = [window.sessionStorage, window.localStorage];
  for (const store of stores) {
    const remove = [];
    for (let i = 0; i < store.length; i += 1) {
      const key = store.key(i) || "";
      const lower = key.toLowerCase();
      if (
        lower.includes("msal") &&
        (lower.includes("interaction.status") ||
          lower.includes("request.state") ||
          lower.includes("request.params") ||
          lower.includes("nonce.id_token") ||
          lower.includes("origin.uri") ||
          lower.includes("urlhash") ||
          lower.includes("correlation.id"))
      ) {
        remove.push(key);
      }
    }
    remove.forEach((key) => store.removeItem(key));
  }
}

function isInteractionInProgress(error) {
  const code = String(error?.errorCode || error?.code || "").toLowerCase();
  const message = String(error?.message || error || "").toLowerCase();
  return code.includes("interaction_in_progress") || message.includes("interaction_in_progress");
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

async function runLoginPopup() {
  const response = await msal.loginPopup({
    scopes,
    prompt: "select_account",
    redirectUri: popupRedirectUri,
  });
  if (!response?.account) throw new Error("Microsoft sign-in completed without an account.");
  msal.setActiveAccount(response.account);
  return response.account;
}

export async function microsoftSignIn() {
  if (!msal) throw new Error("Microsoft 365 environment variables are not configured.");
  await init();

  // If an earlier failed popup left MSAL locked, recover automatically and retry once.
  try {
    return await runLoginPopup();
  } catch (error) {
    if (!isInteractionInProgress(error)) throw error;
    clearStaleInteractionState();
    await new Promise((resolve) => setTimeout(resolve, 150));
    return runLoginPopup();
  }
}

export async function microsoftSignOut() {
  if (!msal) return;
  await init();
  const account = microsoftAccount();
  try {
    if (account) {
      await msal.logoutPopup({ account, postLogoutRedirectUri: popupRedirectUri });
    }
  } finally {
    clearStaleInteractionState();
  }
}

async function token() {
  if (!msal) throw new Error("Microsoft 365 is not configured.");
  await init();
  const account = msal.getActiveAccount() || microsoftAccount();
  if (!account) throw new Error("Connect Microsoft 365 first.");
  try {
    return (await msal.acquireTokenSilent({ account, scopes })).accessToken;
  } catch (silentError) {
    try {
      return (await msal.acquireTokenPopup({ account, scopes, redirectUri: popupRedirectUri })).accessToken;
    } catch (popupError) {
      if (!isInteractionInProgress(popupError)) throw popupError;
      clearStaleInteractionState();
      await new Promise((resolve) => setTimeout(resolve, 150));
      return (await msal.acquireTokenPopup({ account, scopes, redirectUri: popupRedirectUri })).accessToken;
    }
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
