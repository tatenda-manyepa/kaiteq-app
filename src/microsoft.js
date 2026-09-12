import { PublicClientApplication } from "@azure/msal-browser";

const clientId = import.meta.env.VITE_MS_CLIENT_ID;
const tenantId = import.meta.env.VITE_MS_TENANT_ID;
export const microsoftConfigured = Boolean(clientId && tenantId);

const redirectUri = typeof window !== "undefined" ? window.location.origin : undefined;
const msal = microsoftConfigured ? new PublicClientApplication({
  auth: { clientId, authority: `https://login.microsoftonline.com/${tenantId}`, redirectUri },
  cache: { cacheLocation: "localStorage" },
}) : null;
let initialized = false;
async function init(){ if(msal && !initialized){ await msal.initialize(); initialized=true; } }
const scopes=["User.Read","Calendars.ReadWrite"];
export function microsoftAccount(){ return msal?.getAllAccounts?.()[0] || null; }
export async function microsoftSignIn(){ if(!msal) throw new Error("Microsoft 365 environment variables are not configured."); await init(); const r=await msal.loginPopup({scopes,prompt:"select_account"}); msal.setActiveAccount(r.account); return r.account; }
export async function microsoftSignOut(){ if(!msal)return; await init(); const a=microsoftAccount(); if(a) await msal.logoutPopup({account:a,postLogoutRedirectUri:redirectUri}); }
async function token(){ if(!msal) throw new Error("Microsoft 365 is not configured."); await init(); const account=msal.getActiveAccount()||microsoftAccount(); if(!account) throw new Error("Connect Microsoft 365 first."); try{return (await msal.acquireTokenSilent({account,scopes})).accessToken}catch{return (await msal.acquireTokenPopup({account,scopes})).accessToken} }
async function graph(path, options={}){ const accessToken=await token(); const r=await fetch(`https://graph.microsoft.com/v1.0${path}`,{...options,headers:{Authorization:`Bearer ${accessToken}`,"Content-Type":"application/json",...(options.headers||{})}}); if(!r.ok){const txt=await r.text();throw new Error(`Microsoft Graph ${r.status}: ${txt.slice(0,240)}`)} if(r.status===204)return null; return r.json(); }
function attendeeList(raw=""){return String(raw).split(/[,;\n]/).map(x=>x.trim()).filter(x=>x.includes("@")).map(address=>({emailAddress:{address},type:"required"}))}
export async function createOutlookEvent(m){
  if(!m.start) throw new Error("Meeting needs a start date/time before Outlook sync.");
  const start=new Date(m.start); const end=m.end?new Date(m.end):new Date(start.getTime()+60*60*1000);
  const body={subject:m.title||"KAI-TEQ meeting",body:{contentType:"HTML",content:`<p>KAI-TEQ customer meeting.</p>`},start:{dateTime:start.toISOString(),timeZone:"UTC"},end:{dateTime:end.toISOString(),timeZone:"UTC"},location:{displayName:m.location||"Microsoft Teams"},attendees:attendeeList(m.attendees),isOnlineMeeting:String(m.location||"").toLowerCase().includes("teams"),onlineMeetingProvider:"teamsForBusiness"};
  return graph("/me/events",{method:"POST",body:JSON.stringify(body)});
}
export async function importOutlookEvents(days=60){
  const a=new Date(); const b=new Date(Date.now()+days*86400000);
  const qs=new URLSearchParams({startDateTime:a.toISOString(),endDateTime:b.toISOString(),"$top":"200","$orderby":"start/dateTime"});
  const data=await graph(`/me/calendarView?${qs.toString()}`,{headers:{Prefer:'outlook.timezone="Europe/London"'}});
  return (data.value||[]).map(e=>({outlookEventId:e.id,outlookWebLink:e.webLink||"",title:e.subject||"Outlook meeting",start:e.start?.dateTime||"",end:e.end?.dateTime||"",location:e.location?.displayName||"",attendees:(e.attendees||[]).map(a=>a.emailAddress?.address).filter(Boolean).join(", "),type:"Other",outcome:"scheduled",notes:{discussion:e.bodyPreview||""}}));
}
