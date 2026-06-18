import React, { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard, FolderKanban, ListChecks, CalendarDays, Users, ClipboardList,
  Receipt, Sparkles, FileText, Workflow, LogOut, Plus, Clock, CircleCheck, CircleDot,
  Circle, ChevronRight, Phone, Mail, Globe, MapPin, Building2, Paperclip, Upload,
  ArrowRight, ArrowLeft, Brain, Cog, Share2, BarChart3, AlertTriangle, CheckCircle2,
  Video, X, Trash2, Target, Search, Rocket, Lightbulb, Bug, TrendingUp, PoundSterling,
  Wallet, Pencil, BookOpen, Briefcase, CalendarClock, Package, Map, Download
} from "lucide-react";

/* ===========================================================================
   KAITEQ — Operating System
   Clients · projects · finance · tasks · meetings · discovery · proposals · AI
   Data persists in the browser (localStorage) until a database is connected.
=========================================================================== */

const C = {
  bg: "#0B0F1E", panel: "#0F1426", panel2: "#131A30", line: "#1E2742",
  cyan: "#00B8FF", blue: "#4169FF", purple: "#7B3CFF", orange: "#FF8A00", amber: "#FFC433",
  green: "#34D399", red: "#F87171", text: "#EAF0FF", mut: "#8A93AE", mut2: "#5E6788",
};
const GRAD = `linear-gradient(135deg, ${C.cyan} 0%, ${C.blue} 50%, ${C.purple} 100%)`;
const FONT = "Inter, 'Segoe UI', system-ui, -apple-system, sans-serif";
const STORAGE_KEY = "kaiteq_data_v3";

const TEAM = ["Tatenda", "Kudzai"];
const FULLNAME = { Tatenda: "Tatenda Manyepa", Kudzai: "Kudzai Muriro" };
const gbp = (n) => "£" + (Number(n) || 0).toLocaleString();
const CITY_COORDS = { london: [51.5074, -0.1278], birmingham: [52.4862, -1.8904], manchester: [53.4808, -2.2426], leeds: [53.8008, -1.5491], liverpool: [53.4084, -2.9916], bristol: [51.4545, -2.5879], sheffield: [53.3811, -1.4701], newcastle: [54.9783, -1.6178], nottingham: [52.9548, -1.1581], leicester: [52.6369, -1.1398], cardiff: [51.4816, -3.1791], glasgow: [55.8642, -4.2518], edinburgh: [55.9533, -3.1883], belfast: [54.5973, -5.9301], southampton: [50.9097, -1.4044], reading: [51.4543, -0.9781], brighton: [50.8225, -0.1372], oxford: [51.7520, -1.2577], cambridge: [52.2053, 0.1218], coventry: [52.4068, -1.5197] };
function coordsOf(c) { if (c && typeof c.lat === "number" && typeof c.lng === "number" && (c.lat || c.lng)) return [c.lat, c.lng]; const k = ((c && c.city) || "").trim().toLowerCase(); if (CITY_COORDS[k]) return CITY_COORDS[k]; return null; }
function csvCell(x) { const s = String(x == null ? "" : x); const QQ = String.fromCharCode(34); if (s.indexOf(",") >= 0 || s.indexOf(QQ) >= 0) return QQ + s.split(QQ).join(QQ + QQ) + QQ; return s; }
function downloadCSV(filename, rows) { const NL = String.fromCharCode(10); const csv = rows.map((r) => r.map(csvCell).join(",")).join(NL); const blob = new Blob([csv], { type: "text/csv" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = filename; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }

/* ----- delivery lifecycle (8 stages) ----- */
const STAGES = [
  { key: "lead", name: "Lead / Opportunity", devops: "Plan", icon: Target, desc: "Who the client is, the problem, budget, urgency, the decision maker, and whether it's a good fit." },
  { key: "discovery", name: "Discovery", devops: "Plan", icon: Search, desc: "Meeting notes, pain points, current process, tools, risks and success metrics." },
  { key: "proposal", name: "Proposal / Scope", devops: "Plan", icon: FileText, desc: "Proposal, pricing, deliverables, timeline, assumptions and approval status." },
  { key: "design", name: "Design", devops: "Develop", icon: Workflow, desc: "Process maps, automation ideas, AI workflow design, integrations and architecture." },
  { key: "build", name: "Build Sprint", devops: "Build", icon: Cog, desc: "Work broken into small tasks across the board." },
  { key: "review", name: "Testing / Client Review", devops: "Test", icon: CircleCheck, desc: "Demo feedback, bugs, requested changes and client sign-off." },
  { key: "deploy", name: "Deploy / Handover", devops: "Release / Deploy", icon: Rocket, desc: "Launch checklist, access, documentation, training and the support agreement." },
  { key: "support", name: "Support / Optimise", devops: "Operate / Monitor", icon: BarChart3, desc: "Issues, improvements, monthly value delivered and upsell opportunities." },
];

const COLS = [
  { key: "todo", label: "To Do", color: C.mut },
  { key: "doing", label: "In Progress", color: C.cyan },
  { key: "waiting", label: "Waiting on Customer", color: C.orange },
  { key: "review", label: "Ready for Review", color: C.purple },
  { key: "done", label: "Done", color: C.green },
];
const TASK_TYPES = [
  { key: "internal", label: "Internal", color: C.amber },
  { key: "client", label: "Client action", color: C.purple },
  { key: "bug", label: "Bug", color: C.orange },
  { key: "feature", label: "Feature", color: C.cyan },
  { key: "meeting", label: "Meeting action", color: C.blue },
];
const PROPOSAL_STATUS = [
  { key: "draft", label: "Draft", color: C.mut }, { key: "sent", label: "Sent", color: C.cyan },
  { key: "accepted", label: "Accepted", color: C.green }, { key: "rejected", label: "Rejected", color: C.orange },
];
const INVOICE_STATUS = [
  { key: "none", label: "Not invoiced", color: C.mut2 }, { key: "outstanding", label: "Outstanding", color: C.orange },
  { key: "part", label: "Part-paid", color: C.amber }, { key: "paid", label: "Paid", color: C.green },
];
const OPP_STATUS = [
  { key: "idea", label: "Idea", color: C.mut }, { key: "proposed", label: "Proposed", color: C.cyan },
  { key: "approved", label: "Approved", color: C.blue }, { key: "build", label: "In Build", color: C.purple },
  { key: "delivered", label: "Delivered", color: C.green },
];
const HEALTH = { healthy: { label: "Healthy", color: C.green }, attention: { label: "Needs attention", color: C.amber }, risk: { label: "At risk", color: C.red } };
const SOURCES = ["Referral", "Social media", "Website", "Networking", "Repeat client", "Other"];
const SOURCE_COLOR = { "Referral": C.green, "Social media": C.cyan, "Website": C.blue, "Networking": C.purple, "Repeat client": C.amber, "Other": C.mut2 };
const STATUS_COLOR = { "Lead": C.mut2, "Discovery": C.cyan, "Proposal": C.blue, "Active": C.green, "Retainer": C.purple, "Closed": C.mut };
const DISCOVERY_QUESTIONS = [
  "What problem are we solving, in the client's own words?",
  "What's the current process, and which tools do they use?",
  "Where does it break down — the main pain points?",
  "Who are the stakeholders and the decision maker?",
  "What does success look like? (measurable metrics)",
  "What's the budget range?",
  "What's the urgency and timeline?",
  "What risks, constraints or compliance needs exist?",
];
/* default question set; ids match the legacy numeric answer keys so existing notes stay aligned */
const defaultQuestions = () => DISCOVERY_QUESTIONS.map((q, i) => ({ id: String(i), q }));
const getQuestions = (disc) => (disc && Array.isArray(disc.questions) && disc.questions.length) ? disc.questions : defaultQuestions();
const DEV_FLOW = ["Idea", "Backlog", "Design", "Build", "Test", "Deploy", "Improve"];

/* --------------------------- Seed data (your real clients) --------------------------- */
const seedCustomers = [
  { id: "c1", company: "New Leaf Oasis", industry: "Care / Supported Living", website: "newleafoasis.co.uk", status: "Active", health: "healthy", city: "Birmingham", lat: 52.4862, lng: -1.8904,
    contacts: { owner: "", manager: "", accounts: "", technical: "" }, services: ["Website", "Email", "Branding"],
    notes: "Care / supported-living provider. Engaged for website, email and branding. Website in handover." },
  { id: "c2", company: "The Hair Studio", industry: "Beauty", website: "", status: "Discovery", health: "attention", city: "London", lat: 51.5074, lng: -0.1278,
    contacts: { owner: "", manager: "", accounts: "", technical: "" }, services: ["Social Media Growth", "Content Management", "AI Marketing Automation"],
    notes: "Hair & accessories business, ~4 years, sole operator. Was a side hustle; now wants to grow into a visible brand. Most profitable line: making hair. Goal (6–12 months): more customers and social-media visibility. Business name to be confirmed — update once the client provides it." },
];
const seedProjects = [
  { id: "p1", customerId: "c1", name: "New Leaf Oasis Website", lead: "Tatenda", health: "on", stageIdx: 6, tags: ["Website"],
    value: 1500, paid: 750, retainer: 0, revenueRecognised: 750, invoiceStatus: "part" },
  { id: "p2", customerId: "c1", name: "Branding & Email Setup", lead: "Kudzai", health: "on", stageIdx: 4, tags: ["Branding", "Email"],
    value: 800, paid: 800, retainer: 25, revenueRecognised: 800, invoiceStatus: "paid" },
  { id: "p3", customerId: "c2", name: "Social Media Growth & AI Marketing", lead: "Kudzai", health: "on", stageIdx: 1, tags: ["Social", "AI"],
    value: 0, paid: 0, retainer: 0, revenueRecognised: 0, invoiceStatus: "none" },
];
const seedTasks = [
  { id: "t1", title: "Final go-live checklist", projectId: "p1", type: "feature", col: "doing", assignee: "Tatenda", due: "" },
  { id: "t2", title: "Handover documentation pack", projectId: "p1", type: "feature", col: "review", assignee: "Tatenda", due: "" },
  { id: "t3", title: "Client to confirm domain access", projectId: "p1", type: "client", col: "waiting", assignee: "Client", due: "" },
  { id: "t4", title: "Logo variations sign-off", projectId: "p2", type: "client", col: "waiting", assignee: "Client", due: "" },
  { id: "t5", title: "Set up branded email accounts", projectId: "p2", type: "feature", col: "doing", assignee: "Kudzai", due: "" },
  { id: "t6", title: "Prep discovery questions", projectId: "p3", type: "internal", col: "done", assignee: "Kudzai", due: "" },
  { id: "t7", title: "Confirm business name from client", projectId: "p3", type: "client", col: "waiting", assignee: "Client", due: "" },
  { id: "t8", title: "Draft social media growth proposal", projectId: "p3", type: "internal", col: "todo", assignee: "Kudzai", due: "" },
  { id: "t9", title: "Refresh proposal template", projectId: "internal", type: "internal", col: "todo", assignee: "Tatenda", due: "" },
];
const seedMeetings = [
  { id: "m1", customerId: "c2", title: "Discovery call", type: "Discovery", when: "Today · 14:00", lead: "Kudzai", outcome: "scheduled",
    notes: { discussion: "", actions: "", decisions: "", followups: "" } },
  { id: "m2", customerId: "c1", title: "Website go-live review", type: "Review", when: "Tomorrow · 10:30", lead: "Tatenda", outcome: "scheduled",
    notes: { discussion: "", actions: "", decisions: "", followups: "" } },
];
const seedProposals = [
  { id: "q1", customerId: "c1", title: "New Leaf Oasis — Website", value: 1500, status: "accepted", date: "2026-05-02" },
  { id: "q2", customerId: "c1", title: "Branding & Email setup", value: 800, status: "accepted", date: "2026-05-10" },
  { id: "q3", customerId: "c2", title: "Social media growth & AI marketing", value: 2000, status: "draft", date: "2026-06-09" },
];
const seedOpps = [
  { id: "o1", customerId: "c2", idea: "AI social content engine — auto captions, hashtags and scheduling", value: 5, effort: 3, risk: 2, status: "proposed", estValue: "~10 hrs/week saved", projectValue: 2000, monthly: 250 },
  { id: "o2", customerId: "c2", idea: "AI marketing campaign generator (offers, posts, reminders)", value: 4, effort: 3, risk: 3, status: "idea", estValue: "More repeat bookings", projectValue: 1500, monthly: 150 },
  { id: "o3", customerId: "c1", idea: "Automated resident onboarding & enquiry emails", value: 4, effort: 2, risk: 2, status: "idea", estValue: "~£200/mo admin saved", projectValue: 1200, monthly: 100 },
];
const seedDiscovery = {
  p3: { pain: 6, cost: "Slow growth — few new customers because there's almost no online visibility.",
    a: { 0: "Turn a 4-year hair & accessories side hustle into a visible, growing brand.",
      1: "Sole operator, mostly word-of-mouth and occasional posts; no consistent social presence.",
      2: "Low visibility, inconsistent posting, little time for marketing while making hair.",
      4: "More customers and a stronger, consistent social media reach over the next 6–12 months." } },
};
const seedExpenses = [
  { id: "e1", label: "Netlify hosting", amount: 15, date: "2026-06-01" },
  { id: "e2", label: "Domain — New Leaf Oasis", amount: 12, date: "2026-05-04" },
  { id: "e3", label: "Design assets / fonts", amount: 40, date: "2026-05-18" },
];
const seedDocs = [
  { id: "d1", name: "Master Services Agreement.docx", cat: "Internal" },
  { id: "d2", name: "Project proposal template.docx", cat: "Internal" },
  { id: "d3", name: "Discovery call script.pdf", cat: "Internal" },
  { id: "d4", name: "SOW template.docx", cat: "Internal" },
  { id: "d5", name: "Brand guidelines.pdf", cat: "Internal" },
];
const clientDocs = {
  c1: ["Discovery notes.pdf", "Website proposal.pdf", "Signed contract.pdf", "Brand assets.zip"],
  c2: ["Discovery notes.pdf"],
};

const seedProducts = [
  { id: "prod1", name: "Care Compliance Tracker", lead: "Tatenda", health: "on", stageIdx: 4, tags: ["SaaS", "Care"], oneOff: 0, monthly: 49, customersActive: 0, status: "build", notes: "Subscription tool for supported-living providers to track safeguarding tasks and compliance. Spun out of the New Leaf Oasis work." },
  { id: "prod2", name: "Social Content Engine", lead: "Kudzai", health: "on", stageIdx: 3, tags: ["AI", "Marketing"], oneOff: 299, monthly: 25, customersActive: 0, status: "build", notes: "Productised version of the AI social-content idea — captions, hashtags and a scheduler small businesses can buy off the shelf." },
  { id: "prod3", name: "KAITEQ Booking Bot", lead: "Tatenda", health: "on", stageIdx: 1, tags: ["Automation"], oneOff: 149, monthly: 15, customersActive: 0, status: "idea", notes: "Reusable appointment / booking automation with reminders. Idea stage." },
];
const PRODUCT_STATUS = [
  { key: "idea", label: "Idea", color: C.mut }, { key: "build", label: "In Build", color: C.cyan },
  { key: "live", label: "Live", color: C.green }, { key: "paused", label: "Paused", color: C.amber },
];

/* ----- persistence ----- */
function loadData() {
  const def = { customers: seedCustomers, projects: seedProjects, products: seedProducts, tasks: seedTasks, meetings: seedMeetings,
    proposals: seedProposals, opportunities: seedOpps, discovery: seedDiscovery, expenses: seedExpenses };
  try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) { const d = JSON.parse(raw); return { ...def, ...d }; } } catch (e) {}
  return def;
}

/* --------------------------- shared UI --------------------------- */
function Logo({ size = 34 }) {
  const id = "kg" + size;
  return (<svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
    <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={C.cyan} /><stop offset="50%" stopColor={C.blue} /><stop offset="100%" stopColor={C.purple} /></linearGradient></defs>
    <rect x="6" y="6" width="88" height="88" rx="22" fill={`url(#${id})`} opacity="0.16" />
    <g fill={`url(#${id})`}><rect x="26" y="20" width="13" height="60" rx="3" /><polygon points="44,50 66,20 80,20 56,52" /><polygon points="56,52 80,80 65,80 47,56" /></g></svg>);
}
/* Tight gradient K glyph (no box) used as the first letter of the wordmark */
function KMark({ size = 22 }) {
  const id = "kw" + size;
  return (<svg width={Math.round(size * 0.84)} height={size} viewBox="24 16 60 68" xmlns="http://www.w3.org/2000/svg" aria-hidden style={{ display: "block", flex: "none" }}>
    <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={C.cyan} /><stop offset="50%" stopColor={C.blue} /><stop offset="100%" stopColor={C.purple} /></linearGradient></defs>
    <g fill={`url(#${id})`}><rect x="26" y="20" width="13" height="60" rx="3" /><polygon points="44,50 66,20 80,20 56,52" /><polygon points="56,52 80,80 65,80 47,56" /></g></svg>);
}
function Wordmark({ size = 18 }) {
  return (<div className="flex items-center" style={{ gap: Math.round(size * 0.2) }}>
    <KMark size={size} />
    <span style={{ letterSpacing: "0.26em", fontWeight: 600, color: C.text, fontSize: size }}>AITEQ</span></div>);
}
function Avatar({ name, size = 26 }) {
  const initial = (name || "?").slice(0, 1);
  const grad = name === "Tatenda" ? `linear-gradient(135deg,${C.cyan},${C.blue})` : name === "Kudzai" ? `linear-gradient(135deg,${C.blue},${C.purple})` : `linear-gradient(135deg,${C.mut2},${C.mut})`;
  return (<span className="inline-flex items-center justify-center rounded-full font-semibold" style={{ width: size, height: size, fontSize: size * 0.42, color: "#fff", background: grad }}>{initial}</span>);
}
function Chip({ label, color }) { return (<span style={{ fontSize: 10.5, color, background: "rgba(255,255,255,0.04)", padding: "2px 8px", borderRadius: 6, border: `1px solid ${color}33`, whiteSpace: "nowrap" }}>{label}</span>); }
function Dot({ color }) { return <span style={{ width: 8, height: 8, borderRadius: 8, background: color, display: "inline-block" }} />; }
function HealthPill({ health }) {
  const on = health === "on"; return (<span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5" style={{ fontSize: 11, background: on ? "rgba(0,184,255,0.12)" : "rgba(255,138,0,0.14)", color: on ? C.cyan : C.orange }}>{on ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}{on ? "On track" : "At risk"}</span>);
}
function RelHealth({ h }) { const x = HEALTH[h] || HEALTH.healthy; return (<span className="inline-flex items-center gap-1.5" style={{ fontSize: 12, color: x.color }}><Dot color={x.color} /> {x.label}</span>); }
const progressOf = (p) => Math.round((p.stageIdx / (STAGES.length - 1)) * 100);
function Pipeline({ stageIdx, compact = false }) {
  return (<div className="flex items-center" style={{ gap: compact ? 4 : 6 }}>{STAGES.map((s, i) => {
    const done = i < stageIdx, active = i === stageIdx, dot = compact ? 8 : 10;
    return (<React.Fragment key={s.key}>
      <div className="rounded-full" title={s.name} style={{ width: dot, height: dot, flexShrink: 0, background: done || active ? GRAD : "transparent", border: done || active ? "none" : `1.5px solid ${C.line}`, boxShadow: active ? `0 0 0 3px rgba(0,184,255,0.18)` : "none" }} />
      {i < STAGES.length - 1 && (<div style={{ height: 2, flex: 1, borderRadius: 2, background: i < stageIdx ? GRAD : C.line }} />)}</React.Fragment>); })}</div>);
}
function Card({ children, style, className = "" }) { return (<div className={"rounded-xl " + className} style={{ background: C.panel, border: `1px solid ${C.line}`, ...style }}>{children}</div>); }
function Field({ label, children }) { return (<div><label style={{ fontSize: 12, color: C.mut, display: "block", marginBottom: 5 }}>{label}</label>{children}</div>); }
const inputStyle = { background: C.panel2, border: `1px solid ${C.line}`, color: C.text, fontSize: 14, borderRadius: 8, padding: "9px 11px", width: "100%", outline: "none", fontFamily: FONT, boxSizing: "border-box" };
function Btn({ children, onClick, primary }) { return (<button onClick={onClick} className="flex items-center gap-2 rounded-lg px-4 py-2 font-semibold" style={{ background: primary ? GRAD : C.panel2, color: primary ? "#fff" : C.text, fontSize: 13, border: primary ? "none" : `1px solid ${C.line}` }}>{children}</button>); }
function Modal({ title, onClose, children, onSave, saveLabel = "Save", wide }) {
  return (<div className="fixed inset-0 flex items-center justify-center px-4 py-8 overflow-auto" style={{ background: "rgba(5,8,18,0.72)", zIndex: 50 }}>
    <Card style={{ padding: 24, width: wide ? 600 : 460, maxWidth: "100%" }}>
      <div className="flex items-center justify-between mb-5"><h2 style={{ fontSize: 17, fontWeight: 600, color: C.text }}>{title}</h2><button onClick={onClose} style={{ color: C.mut }}><X size={18} /></button></div>
      <div className="flex flex-col gap-4">{children}</div>
      <div className="flex justify-end gap-2 mt-6"><button onClick={onClose} className="rounded-lg px-4 py-2" style={{ background: C.panel2, color: C.text, fontSize: 13, border: `1px solid ${C.line}` }}>Cancel</button>
        <button onClick={onSave} className="rounded-lg px-4 py-2 font-semibold" style={{ background: GRAD, color: "#fff", fontSize: 13 }}>{saveLabel}</button></div></Card></div>);
}
function Topbar({ title, sub, action }) { return (<div className="flex items-end justify-between mb-6"><div><h1 style={{ fontSize: 24, fontWeight: 600, color: C.text, letterSpacing: "-0.01em" }}>{title}</h1>{sub && <p style={{ color: C.mut, fontSize: 13, marginTop: 4 }}>{sub}</p>}</div>{action}</div>); }
function Stat({ label, value, accent }) { return (<Card style={{ padding: 16 }}><div style={{ fontSize: 12, color: C.mut }}>{label}</div><div style={{ fontSize: 23, fontWeight: 700, color: C.text, marginTop: 4 }}>{value}</div><div style={{ height: 3, width: 36, borderRadius: 3, marginTop: 8, background: accent }} /></Card>); }
const custName = (customers, id) => customers.find((c) => c.id === id)?.company || "—";
const projName = (projects, id) => id === "internal" ? "Internal / KAITEQ" : (projects.find((p) => p.id === id)?.name || "—");

/* due-date helper */
function dueInfo(due) {
  if (!due) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d = new Date(due + "T00:00:00"); const diff = Math.round((d - today) / 86400000);
  if (diff < 0) return { label: "Overdue", color: C.red };
  if (diff === 0) return { label: "Due today", color: C.orange };
  if (diff <= 7) return { label: "Due this week", color: C.amber };
  return { label: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), color: C.mut };
}

/* --------------------------- Login --------------------------- */
function Login({ onLogin }) {
  const [email, setEmail] = useState(""); const [pw, setPw] = useState(""); const [err, setErr] = useState("");
  const submit = () => { if (!email || !pw) { setErr("Enter your email and password to continue."); return; } onLogin(email.toLowerCase().includes("kudzai") ? "Kudzai" : "Tatenda"); };
  return (<div className="min-h-screen flex items-center justify-center px-4" style={{ background: C.bg, fontFamily: FONT }}>
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", background: `radial-gradient(600px 400px at 30% 20%, rgba(0,184,255,0.10), transparent 60%), radial-gradient(600px 500px at 80% 90%, rgba(123,60,255,0.12), transparent 60%)` }} />
    <div className="w-full max-w-md rounded-2xl p-8 relative" style={{ background: C.panel, border: `1px solid ${C.line}`, boxShadow: "0 24px 80px rgba(0,0,0,0.5)" }}>
      <div className="flex flex-col items-center text-center mb-7"><Wordmark size={30} />
        <div style={{ letterSpacing: "0.18em", fontSize: 10, color: C.cyan, marginTop: 12 }}>OPERATIONAL INTELLIGENCE & AUTOMATION</div></div>
      <label style={{ fontSize: 12, color: C.mut }}>Work email</label>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tatenda@kaiteq.com" className="w-full rounded-lg px-3 py-2.5 mt-1.5 mb-4 outline-none" style={{ background: C.panel2, border: `1px solid ${C.line}`, color: C.text, fontSize: 14 }} />
      <label style={{ fontSize: 12, color: C.mut }}>Password</label>
      <input value={pw} type="password" onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="••••••••" className="w-full rounded-lg px-3 py-2.5 mt-1.5 outline-none" style={{ background: C.panel2, border: `1px solid ${C.line}`, color: C.text, fontSize: 14 }} />
      {err && <div style={{ color: C.orange, fontSize: 12, marginTop: 10 }}>{err}</div>}
      <button onClick={submit} className="w-full rounded-lg py-2.5 mt-6 font-semibold" style={{ background: GRAD, color: "#fff", fontSize: 14 }}>Sign in</button>
      <div style={{ fontSize: 11, color: C.mut2, marginTop: 16, textAlign: "center" }}>Demo sign-in — any email works (use “kudzai” to sign in as Kudzai). Replace with Supabase auth for live use.</div></div></div>);
}

/* --------------------------- Sidebar --------------------------- */
const NAV = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "projects", label: "Projects", icon: FolderKanban },
  { key: "products", label: "Internal Products", icon: Package },
  { key: "customers", label: "Customers", icon: Users },
  { key: "map", label: "Map", icon: Map },
  { key: "finance", label: "Finance", icon: PoundSterling },
  { key: "tasks", label: "Tasks", icon: ListChecks },
  { key: "meetings", label: "Meetings", icon: CalendarDays },
  { key: "discovery", label: "Discovery Notes", icon: ClipboardList },
  { key: "proposals", label: "Proposals", icon: Receipt },
  { key: "ai", label: "AI Opportunities", icon: Sparkles },
  { key: "documents", label: "Documents", icon: FileText },
  { key: "workflow", label: "Workflow", icon: Workflow },
];
function Sidebar({ view, setView, user, onLogout }) {
  return (<aside className="flex flex-col justify-between" style={{ width: 232, background: C.panel, borderRight: `1px solid ${C.line}`, padding: 18, flexShrink: 0 }}>
    <div><div className="mb-6 px-1"><Wordmark /></div>
      <nav className="flex flex-col gap-0.5">{NAV.map((n) => { const active = view === n.key, Icon = n.icon;
        return (<button key={n.key} onClick={() => setView(n.key)} className="flex items-center gap-3 rounded-lg px-3 py-2 text-left" style={{ color: active ? "#fff" : C.mut, background: active ? "rgba(65,105,255,0.14)" : "transparent", fontSize: 13.5, fontWeight: active ? 600 : 500 }}><Icon size={17} style={{ color: active ? C.cyan : C.mut2 }} />{n.label}</button>); })}</nav></div>
    <div><div className="flex items-center gap-3 rounded-lg px-3 py-2.5 mb-2" style={{ background: C.panel2 }}><Avatar name={user} /><div style={{ lineHeight: 1.2 }}><div style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>{FULLNAME[user]}</div><div style={{ fontSize: 11, color: C.mut2 }}>Founder</div></div></div>
      <button onClick={onLogout} className="flex items-center gap-2 px-3 py-2 rounded-lg w-full" style={{ color: C.mut, fontSize: 13 }}><LogOut size={16} /> Sign out</button></div></aside>);
}

/* --------------------------- Dashboard --------------------------- */
function Dashboard({ customers, projects, proposals, opportunities, meetings, expenses, setView, setActiveProject }) {
  const revenue = projects.reduce((a, p) => a + (p.revenueRecognised || 0), 0);
  const outstanding = projects.reduce((a, p) => a + Math.max(0, (p.value || 0) - (p.paid || 0)), 0);
  const recurring = projects.reduce((a, p) => a + (p.retainer || 0), 0);
  const stats = [
    { label: "Revenue recognised", value: gbp(revenue), accent: C.green },
    { label: "Outstanding", value: gbp(outstanding), accent: C.orange },
    { label: "Recurring / mo", value: gbp(recurring), accent: C.purple },
    { label: "Active customers", value: customers.length, accent: C.cyan },
  ];
  return (<div><Topbar title="Dashboard" sub="The whole business at a glance." />
    <div className="grid grid-cols-4 gap-4 mb-6">{stats.map((s) => <Stat key={s.label} {...s} />)}</div>
    <div className="grid grid-cols-3 gap-5">
      <div className="col-span-2">
        <div className="flex items-center justify-between mb-3"><h2 style={{ fontSize: 15, fontWeight: 600, color: C.text }}>Active engagements</h2><button onClick={() => setView("projects")} style={{ fontSize: 12, color: C.cyan }}>View all</button></div>
        <div className="flex flex-col gap-3">{projects.map((p) => (<Card key={p.id} className="cursor-pointer" style={{ padding: 16 }}><div onClick={() => { setActiveProject(p.id); setView("projects"); }}>
          <div className="flex items-center justify-between mb-1"><div className="flex items-center gap-2"><span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{p.name}</span><HealthPill health={p.health} /></div><span style={{ fontSize: 12, color: C.mut }}>{custName(customers, p.customerId)}</span></div>
          <div className="flex items-center gap-2 mb-3" style={{ fontSize: 12, color: C.mut2 }}><span>{STAGES[p.stageIdx].name}</span><span>·</span><span>{p.value ? gbp(p.value) : "Pre-sales"}</span></div>
          <Pipeline stageIdx={p.stageIdx} compact /></div></Card>))}</div></div>
      <div>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 12 }}>Upcoming meetings</h2>
        <div className="flex flex-col gap-2 mb-5">{meetings.slice(0, 3).map((m) => (<Card key={m.id} style={{ padding: 12 }}>
          <div className="flex items-center gap-2 mb-1"><Video size={14} style={{ color: C.cyan }} /><span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{m.title}</span></div>
          <div style={{ fontSize: 12, color: C.mut }}>{custName(customers, m.customerId)}</div>
          <div className="flex items-center gap-1 mt-1" style={{ fontSize: 11, color: C.mut2 }}><Clock size={11} /> {m.when}</div></Card>))}
          {meetings.length === 0 && <Card style={{ padding: 14 }}><span style={{ fontSize: 12, color: C.mut2 }}>No meetings scheduled.</span></Card>}</div></div></div></div>);
}

/* --------------------------- Customers --------------------------- */
function CustomerModal({ customer, onClose, onSave }) {
  const [f, setF] = useState(customer || { id: "c" + Date.now(), company: "", industry: "", website: "", status: "Discovery", health: "healthy", source: "Referral", contacts: { owner: "", manager: "", accounts: "", technical: "" }, services: [], notes: "" });
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const setC = (k, v) => setF((s) => ({ ...s, contacts: { ...s.contacts, [k]: v } }));
  const save = () => { if (!f.company.trim()) return; onSave({ ...f, company: f.company.trim(), services: Array.isArray(f.services) ? f.services : String(f.services).split(",").map((x) => x.trim()).filter(Boolean) }); onClose(); };
  const servicesStr = Array.isArray(f.services) ? f.services.join(", ") : f.services;
  return (<Modal wide title={customer ? "Edit customer" : "New customer"} onClose={onClose} onSave={save} saveLabel="Save customer">
    <div className="grid grid-cols-2 gap-3">
      <Field label="Company name"><input style={inputStyle} value={f.company} onChange={(e) => set("company", e.target.value)} placeholder="e.g. The Hair Studio" /></Field>
      <Field label="Industry"><input style={inputStyle} value={f.industry} onChange={(e) => set("industry", e.target.value)} placeholder="e.g. Beauty" /></Field>
      <Field label="Website"><input style={inputStyle} value={f.website} onChange={(e) => set("website", e.target.value)} placeholder="example.co.uk" /></Field>
      <Field label="Status"><select style={inputStyle} value={f.status} onChange={(e) => set("status", e.target.value)}>{["Lead", "Discovery", "Proposal", "Active", "Retainer", "Closed"].map((s) => <option key={s}>{s}</option>)}</select></Field>
      <Field label="Relationship health"><select style={inputStyle} value={f.health} onChange={(e) => set("health", e.target.value)}>{Object.keys(HEALTH).map((k) => <option key={k} value={k}>{HEALTH[k].label}</option>)}</select></Field>
      <Field label="How we won them (source)"><select style={inputStyle} value={f.source || "Other"} onChange={(e) => set("source", e.target.value)}>{SOURCES.map((s) => <option key={s}>{s}</option>)}</select></Field>
      <Field label="Services (comma separated)"><input style={inputStyle} value={servicesStr} onChange={(e) => set("services", e.target.value)} placeholder="Website, Branding" /></Field>
    </div>
    <div className="grid grid-cols-3 gap-3">
      <Field label="City / town"><input style={inputStyle} value={f.city || ""} onChange={(e) => set("city", e.target.value)} placeholder="e.g. London" /></Field>
      <Field label="Latitude (optional)"><input style={inputStyle} type="number" value={f.lat ?? ""} onChange={(e) => set("lat", e.target.value === "" ? "" : Number(e.target.value))} /></Field>
      <Field label="Longitude (optional)"><input style={inputStyle} type="number" value={f.lng ?? ""} onChange={(e) => set("lng", e.target.value === "" ? "" : Number(e.target.value))} /></Field>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <Field label="Owner contact"><input style={inputStyle} value={f.contacts.owner} onChange={(e) => setC("owner", e.target.value)} /></Field>
      <Field label="Manager"><input style={inputStyle} value={f.contacts.manager} onChange={(e) => setC("manager", e.target.value)} /></Field>
      <Field label="Accounts"><input style={inputStyle} value={f.contacts.accounts} onChange={(e) => setC("accounts", e.target.value)} /></Field>
      <Field label="Technical contact"><input style={inputStyle} value={f.contacts.technical} onChange={(e) => setC("technical", e.target.value)} /></Field>
    </div>
    <Field label="Notes"><textarea rows={3} style={{ ...inputStyle, resize: "vertical" }} value={f.notes} onChange={(e) => set("notes", e.target.value)} /></Field>
  </Modal>);
}
function Customers({ customers, projects, opportunities = [], onNew, onEdit, onDelete, setActiveProject, setView }) {
  const [openId, setOpenId] = useState(null);
  const c = customers.find((x) => x.id === openId);
  const custProjects = (id) => projects.filter((p) => p.customerId === id);
  if (c) {
    const ps = custProjects(c.id);
    const opps = opportunities.filter((o) => o.customerId === c.id);
    const totalRev = ps.reduce((a, p) => a + (p.revenueRecognised || 0), 0);
    const retainer = ps.reduce((a, p) => a + (p.retainer || 0), 0);
    return (<div>
      <button onClick={() => setOpenId(null)} className="flex items-center gap-1 mb-4" style={{ color: C.mut, fontSize: 13 }}><ChevronRight size={14} style={{ transform: "rotate(180deg)" }} /> All customers</button>
      <div className="flex items-start justify-between mb-5">
        <div><div className="flex items-center gap-3"><h1 style={{ fontSize: 22, fontWeight: 600, color: C.text }}>{c.company}</h1><Chip label={c.status} color={C.cyan} /></div>
          <div className="flex items-center gap-3 mt-1" style={{ fontSize: 13, color: C.mut }}><Briefcase size={14} /> {c.industry || "—"} · <RelHealth h={c.health} />{c.city ? <span className="flex items-center gap-1"> · <MapPin size={13} /> {c.city}</span> : null}</div></div>
        <Btn onClick={() => onEdit(c)}><Pencil size={14} /> Edit</Btn></div>
      <div className="grid grid-cols-3 gap-4 mb-5">
        <Stat label="Total revenue" value={gbp(totalRev)} accent={C.green} />
        <Stat label="Open projects" value={ps.length} accent={C.cyan} />
        <Stat label="Retainer / mo" value={gbp(retainer)} accent={C.purple} /></div>
      <div className="grid grid-cols-3 gap-5">
        <Card style={{ padding: 18 }}><h3 style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 12 }}>Profile</h3>
          {[["Website", c.website], ["Source", c.source], ["Owner", c.contacts.owner], ["Manager", c.contacts.manager], ["Accounts", c.contacts.accounts], ["Technical", c.contacts.technical]].map(([k, v]) => (
            <div key={k} className="flex justify-between mb-2.5" style={{ fontSize: 12.5 }}><span style={{ color: C.mut2 }}>{k}</span><span style={{ color: C.text }}>{v || "—"}</span></div>))}
          <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${C.line}` }}><div style={{ fontSize: 12, color: C.mut2, marginBottom: 6 }}>Services</div>
            <div className="flex flex-wrap gap-1.5">{(c.services || []).map((s) => <Chip key={s} label={s} color={C.cyan} />)}</div></div></Card>
        <Card className="col-span-2" style={{ padding: 18 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8 }}>Account notes</h3>
          <p style={{ fontSize: 13, color: C.mut, lineHeight: 1.6, marginBottom: 18 }}>{c.notes || "—"}</p>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 10 }}>Projects</h3>
          <div className="flex flex-col gap-2">{ps.map((p) => (<div key={p.id} className="flex items-center justify-between rounded-lg px-3 py-2.5 cursor-pointer" style={{ background: C.panel2, border: `1px solid ${C.line}` }} onClick={() => { setActiveProject(p.id); setView("projects"); }}>
            <span style={{ fontSize: 13, color: C.text }}>{p.name}</span><span style={{ fontSize: 12, color: C.cyan }}>{STAGES[p.stageIdx].name} · {p.value ? gbp(p.value) : "TBD"}</span></div>))}
            {ps.length === 0 && <div style={{ fontSize: 12, color: C.mut2 }}>No projects yet.</div>}</div>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: C.text, margin: "16px 0 10px" }}>AI opportunities</h3>
          <div className="flex flex-col gap-2">{opps.map((o) => (<div key={o.id} className="flex items-center justify-between rounded-lg px-3 py-2.5" style={{ background: C.panel2, border: `1px solid ${C.line}` }}>
            <div className="flex items-center gap-2"><Lightbulb size={14} style={{ color: C.amber }} /><span style={{ fontSize: 13, color: C.text }}>{o.idea}</span></div>
            <div className="flex items-center gap-3">{(o.projectValue || o.monthly) ? <span style={{ fontSize: 12, color: C.green }}>{o.projectValue ? gbp(o.projectValue) : ""}{o.monthly ? " +" + gbp(o.monthly) + "/mo" : ""}</span> : null}<PriorityPill o={o} /></div></div>))}
            {opps.length === 0 && <div style={{ fontSize: 12, color: C.mut2 }}>No AI opportunities yet — add them in the AI Opportunities section.</div>}</div>
          {c.discoverySummary && (<><h3 style={{ fontSize: 13, fontWeight: 600, color: C.text, margin: "16px 0 8px" }}>Discovery summary</h3>
            <div className="rounded-lg p-3" style={{ background: C.panel2, border: `1px solid ${C.line}`, fontSize: 12.5, color: C.mut, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{c.discoverySummary}</div></>)}</Card></div></div>);
  }
  return (<div><Topbar title="Customers" sub="Company profiles, contacts, revenue and relationship health." action={<Btn primary onClick={onNew}><Plus size={15} /> Add customer</Btn>} />
    <div className="grid grid-cols-3 gap-4">{customers.map((c) => { const ps = custProjects(c.id); const rev = ps.reduce((a, p) => a + (p.revenueRecognised || 0), 0);
      return (<Card key={c.id} className="cursor-pointer" style={{ padding: 18 }}><div onClick={() => setOpenId(c.id)}>
        <div className="flex items-center gap-3 mb-3"><div className="flex items-center justify-center rounded-lg" style={{ width: 40, height: 40, background: GRAD, color: "#fff", fontWeight: 700 }}>{c.company.slice(0, 1)}</div>
          <div><div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{c.company}</div><div style={{ fontSize: 12, color: C.mut }}>{c.industry}</div></div></div>
        <div className="flex items-center justify-between mb-2"><Chip label={c.status} color={C.cyan} /><RelHealth h={c.health} /></div>
        <div className="flex items-center justify-between" style={{ fontSize: 12, color: C.mut2 }}><span>{ps.length} projects · {gbp(rev)}</span><span className="flex items-center gap-1" style={{ color: C.cyan }}>Open <ChevronRight size={13} /></span></div></div></Card>); })}</div></div>);
}

/* --------------------------- Projects --------------------------- */
function ProjectModal({ customers, project, onClose, onSave }) {
  const [f, setF] = useState(project || { id: "p" + Date.now(), customerId: customers[0]?.id || "", name: "", lead: "Tatenda", health: "on", stageIdx: 0, tags: [], value: 0, paid: 0, retainer: 0, revenueRecognised: 0, invoiceStatus: "none" });
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const save = () => { if (!f.name.trim() || !f.customerId) return; onSave({ ...f, name: f.name.trim(), value: Number(f.value) || 0, paid: Number(f.paid) || 0, retainer: Number(f.retainer) || 0, revenueRecognised: Number(f.revenueRecognised) || 0, stageIdx: Number(f.stageIdx), tags: Array.isArray(f.tags) ? f.tags : String(f.tags).split(",").map((t) => t.trim()).filter(Boolean) }); onClose(); };
  const tagsStr = Array.isArray(f.tags) ? f.tags.join(", ") : f.tags;
  return (<Modal wide title={project ? "Edit project" : "New project"} onClose={onClose} onSave={save} saveLabel={project ? "Save project" : "Create project"}>
    <div className="grid grid-cols-2 gap-3">
      <Field label="Project name"><input style={inputStyle} value={f.name} onChange={(e) => set("name", e.target.value)} /></Field>
      <Field label="Customer"><select style={inputStyle} value={f.customerId} onChange={(e) => set("customerId", e.target.value)}>{customers.map((c) => <option key={c.id} value={c.id}>{c.company}</option>)}</select></Field>
      <Field label="Lead"><select style={inputStyle} value={f.lead} onChange={(e) => set("lead", e.target.value)}>{TEAM.map((t) => <option key={t}>{t}</option>)}</select></Field>
      <Field label="Stage"><select style={inputStyle} value={f.stageIdx} onChange={(e) => set("stageIdx", e.target.value)}>{STAGES.map((s, i) => <option key={s.key} value={i}>{i + 1}. {s.name}</option>)}</select></Field>
    </div>
    <div style={{ fontSize: 12, color: C.cyan, fontWeight: 600, marginTop: 4 }}>Revenue</div>
    <div className="grid grid-cols-3 gap-3">
      <Field label="Project value (£)"><input style={inputStyle} type="number" value={f.value} onChange={(e) => set("value", e.target.value)} /></Field>
      <Field label="Paid so far (£)"><input style={inputStyle} type="number" value={f.paid} onChange={(e) => set("paid", e.target.value)} /></Field>
      <Field label="Monthly retainer (£)"><input style={inputStyle} type="number" value={f.retainer} onChange={(e) => set("retainer", e.target.value)} /></Field>
      <Field label="Revenue recognised (£)"><input style={inputStyle} type="number" value={f.revenueRecognised} onChange={(e) => set("revenueRecognised", e.target.value)} /></Field>
      <Field label="Invoice status"><select style={inputStyle} value={f.invoiceStatus} onChange={(e) => set("invoiceStatus", e.target.value)}>{INVOICE_STATUS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}</select></Field>
      <Field label="Tags"><input style={inputStyle} value={tagsStr} onChange={(e) => set("tags", e.target.value)} /></Field>
    </div>
  </Modal>);
}
function MiniMeter() { return null; }
function TaskMini({ t, onMove }) {
  const type = TASK_TYPES.find((x) => x.key === t.type) || TASK_TYPES[0]; const di = dueInfo(t.due);
  return (<div className="rounded-lg p-2.5" style={{ background: C.panel2, border: `1px solid ${C.line}` }}>
    <div style={{ fontSize: 12.5, color: C.text, marginBottom: 6 }}>{t.title}</div>
    <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-1.5"><Avatar name={t.assignee} size={16} /><Chip label={type.label} color={type.color} /></div>{di && <span style={{ fontSize: 10, color: di.color }}>{di.label}</span>}</div>
    <div className="flex gap-1">{COLS.map((c) => (<button key={c.key} onClick={() => onMove(t.id, c.key)} title={"Move to " + c.label} style={{ width: 11, height: 4, borderRadius: 3, border: "none", cursor: "pointer", background: c.key === t.col ? GRAD : C.line }} />))}</div></div>);
}
function ProjectDetail({ project, customers, tasks, discovery, onBack, onSetStage, onMoveTask, onDelete, onEdit, onAddTask, setView }) {
  const p = project;
  const ptasks = tasks.filter((t) => t.projectId === p.id);
  const outstanding = Math.max(0, (p.value || 0) - (p.paid || 0));
  const disc = discovery[p.id];
  const discTotal = getQuestions(disc).length;
  const answered = disc ? Object.values(disc.a || {}).filter((v) => v && v.trim()).length : 0;
  const inv = INVOICE_STATUS.find((s) => s.key === p.invoiceStatus) || INVOICE_STATUS[0];
  return (<div>
    <button onClick={onBack} className="flex items-center gap-1 mb-4" style={{ color: C.mut, fontSize: 13 }}><ChevronRight size={14} style={{ transform: "rotate(180deg)" }} /> All projects</button>
    <div className="flex items-start justify-between mb-5">
      <div><div className="flex items-center gap-3"><h1 style={{ fontSize: 22, fontWeight: 600, color: C.text }}>{p.name}</h1><HealthPill health={p.health} /></div>
        <div className="flex items-center gap-2 mt-1" style={{ fontSize: 13, color: C.mut }}><Building2 size={14} /> {custName(customers, p.customerId)} · Lead <Avatar name={p.lead} size={18} /> {p.lead}</div></div>
      <div className="flex items-center gap-2">
        <button onClick={() => onSetStage(p.id, p.stageIdx - 1)} disabled={p.stageIdx === 0} className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: C.panel2, color: p.stageIdx === 0 ? C.mut2 : C.text, fontSize: 13, border: `1px solid ${C.line}`, cursor: p.stageIdx === 0 ? "default" : "pointer" }}><ArrowLeft size={15} /> Previous</button>
        <button onClick={() => onSetStage(p.id, p.stageIdx + 1)} disabled={p.stageIdx === STAGES.length - 1} className="flex items-center gap-2 rounded-lg px-4 py-2 font-semibold" style={{ background: p.stageIdx === STAGES.length - 1 ? C.panel2 : GRAD, color: p.stageIdx === STAGES.length - 1 ? C.mut2 : "#fff", fontSize: 13, cursor: p.stageIdx === STAGES.length - 1 ? "default" : "pointer" }}>Advance <ArrowRight size={15} /></button>
        <button onClick={() => onEdit(p)} className="flex items-center justify-center rounded-lg" style={{ width: 38, height: 38, background: C.panel2, color: C.mut, border: `1px solid ${C.line}` }} title="Edit"><Pencil size={15} /></button>
        <button onClick={() => { if (window.confirm("Delete this project?")) { onDelete(p.id); onBack(); } }} className="flex items-center justify-center rounded-lg" style={{ width: 38, height: 38, background: C.panel2, color: C.mut, border: `1px solid ${C.line}` }} title="Delete"><Trash2 size={15} /></button></div></div>

    <div className="grid grid-cols-4 gap-4 mb-5">
      <Stat label="Value" value={gbp(p.value)} accent={C.cyan} />
      <Stat label="Paid" value={gbp(p.paid)} accent={C.green} />
      <Stat label="Outstanding" value={gbp(outstanding)} accent={C.orange} />
      <Card style={{ padding: 16 }}><div style={{ fontSize: 12, color: C.mut }}>Invoice</div><div style={{ fontSize: 16, fontWeight: 600, color: inv.color, marginTop: 6 }}>{inv.label}</div>{p.retainer > 0 && <div style={{ fontSize: 11, color: C.mut2, marginTop: 4 }}>+ {gbp(p.retainer)}/mo retainer</div>}</Card></div>

    <Card style={{ padding: 20, marginBottom: 20 }}>
      <div className="flex items-center justify-between mb-4"><h2 style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Delivery pipeline</h2><span style={{ fontSize: 12, color: C.mut }}>{progressOf(p)}% complete · click a stage to jump</span></div>
      <div className="grid grid-cols-8 gap-1">{STAGES.map((s, i) => { const done = i < p.stageIdx, active = i === p.stageIdx;
        return (<div key={s.key} className="text-center cursor-pointer" onClick={() => onSetStage(p.id, i)}>
          <div className="mx-auto flex items-center justify-center rounded-full mb-2" style={{ width: 32, height: 32, background: done || active ? GRAD : C.panel2, border: done || active ? "none" : `1px solid ${C.line}`, boxShadow: active ? "0 0 0 4px rgba(0,184,255,0.16)" : "none" }}>{done ? <CircleCheck size={16} color="#fff" /> : active ? <CircleDot size={16} color="#fff" /> : <Circle size={14} color={C.mut2} />}</div>
          <div style={{ fontSize: 9.5, lineHeight: 1.2, color: done || active ? C.text : C.mut2 }}>{s.name}</div></div>); })}</div>
      <div className="mt-4 rounded-lg p-3" style={{ background: C.panel2 }}><div style={{ fontSize: 12, color: C.cyan, fontWeight: 600 }}>Current: {STAGES[p.stageIdx].name}</div><div style={{ fontSize: 12.5, color: C.mut, marginTop: 3 }}>{STAGES[p.stageIdx].desc}</div></div>
      {answered > 0 && <button onClick={() => setView("discovery")} className="flex items-center gap-1.5 mt-3" style={{ fontSize: 12, color: C.cyan }}><ClipboardList size={13} /> Discovery: {answered}/{discTotal} captured{disc?.pain ? ` · pain ${disc.pain}/10` : ""}</button>}
    </Card>
    <div className="flex items-center justify-between mb-3"><h2 style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Build board</h2><button onClick={() => onAddTask(p.id)} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5" style={{ background: C.panel2, color: C.text, fontSize: 12, border: `1px solid ${C.line}` }}><Plus size={13} /> Add task</button></div>
    <div className="grid grid-cols-5 gap-2.5">{COLS.map((col) => { const items = ptasks.filter((t) => t.col === col.key);
      return (<div key={col.key} className="rounded-xl p-2.5" style={{ background: C.panel, border: `1px solid ${C.line}` }}>
        <div className="flex items-center justify-between mb-3"><span style={{ fontSize: 11, fontWeight: 600, color: col.color }}>{col.label}</span><span style={{ fontSize: 11, color: C.mut2 }}>{items.length}</span></div>
        <div className="flex flex-col gap-2">{items.map((t) => <TaskMini key={t.id} t={t} onMove={onMoveTask} />)}{items.length === 0 && <div style={{ fontSize: 11, color: C.mut2, padding: "4px 0" }}>—</div>}</div></div>); })}</div></div>);
}
function Projects({ customers, projects, tasks, discovery, activeProject, setActiveProject, onSetStage, onMoveTask, onDelete, onNew, onEdit, onAddTask, setView }) {
  const p = projects.find((x) => x.id === activeProject);
  if (p) return <ProjectDetail project={p} customers={customers} tasks={tasks} discovery={discovery} onBack={() => setActiveProject(null)} onSetStage={onSetStage} onMoveTask={onMoveTask} onDelete={onDelete} onEdit={onEdit} onAddTask={onAddTask} setView={setView} />;
  return (<div><Topbar title="Projects" sub="Every engagement, its stage and its revenue." action={<Btn primary onClick={onNew}><Plus size={15} /> New project</Btn>} />
    <div className="flex flex-col gap-3">{projects.map((p) => { const out = Math.max(0, (p.value || 0) - (p.paid || 0));
      return (<Card key={p.id} className="cursor-pointer" style={{ padding: 18 }}><div onClick={() => setActiveProject(p.id)}>
        <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-3"><span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{p.name}</span><HealthPill health={p.health} />{(p.tags || []).map((t) => <Chip key={t} label={t} color={C.mut} />)}</div>
          <div className="flex items-center gap-2"><Avatar name={p.lead} size={20} /><span style={{ fontSize: 12, color: C.mut }}>{custName(customers, p.customerId)}</span></div></div>
        <div className="flex items-center justify-between mb-3"><span style={{ fontSize: 12, color: C.cyan }}>{STAGES[p.stageIdx].name}</span>
          <span style={{ fontSize: 12, color: C.mut2 }}>{p.value ? gbp(p.value) : "Pre-sales"}{out > 0 ? ` · ${gbp(out)} outstanding` : ""}</span></div>
        <Pipeline stageIdx={p.stageIdx} /></div></Card>); })}</div></div>);
}

/* --------------------------- Finance --------------------------- */
function ExpenseModal({ onClose, onCreate }) {
  const [f, setF] = useState({ label: "", amount: "", date: new Date().toISOString().slice(0, 10) });
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const save = () => { if (!f.label.trim()) return; onCreate({ id: "e" + Date.now(), label: f.label.trim(), amount: Number(f.amount) || 0, date: f.date }); onClose(); };
  return (<Modal title="Add expense" onClose={onClose} onSave={save} saveLabel="Add expense">
    <Field label="Description"><input style={inputStyle} value={f.label} onChange={(e) => set("label", e.target.value)} placeholder="e.g. Software subscription" /></Field>
    <div className="grid grid-cols-2 gap-3"><Field label="Amount (£)"><input style={inputStyle} type="number" value={f.amount} onChange={(e) => set("amount", e.target.value)} /></Field>
      <Field label="Date"><input style={inputStyle} type="date" value={f.date} onChange={(e) => set("date", e.target.value)} /></Field></div></Modal>);
}
function Finance({ customers, projects, proposals, expenses, onInvoiceStatus, onAddExpense, onDeleteExpense, setView }) {
  const revenue = projects.reduce((a, p) => a + (p.revenueRecognised || 0), 0);
  const outstanding = projects.reduce((a, p) => a + Math.max(0, (p.value || 0) - (p.paid || 0)), 0);
  const recurring = projects.reduce((a, p) => a + (p.retainer || 0), 0);
  const exp = expenses.reduce((a, e) => a + (e.amount || 0), 0);
  const profit = revenue - exp;
  const stats = [
    { label: "Revenue recognised", value: gbp(revenue), accent: C.green },
    { label: "Outstanding invoices", value: gbp(outstanding), accent: C.orange },
    { label: "Recurring / mo", value: gbp(recurring), accent: C.purple },
    { label: "Expenses", value: gbp(exp), accent: C.amber },
    { label: "Profit", value: gbp(profit), accent: C.cyan },
  ];
  const [showExp, setShowExp] = useState(false);
  const exportCustomer = (c) => {
    const cps = projects.filter((p) => p.customerId === c.id);
    const cq = proposals.filter((q) => q.customerId === c.id);
    const rows = [["KAITEQ finance breakdown", c.company], [], ["Projects"], ["Name", "Stage", "Value", "Paid", "Outstanding", "Retainer/mo", "Invoice status"]];
    cps.forEach((p) => rows.push([p.name, STAGES[p.stageIdx].name, p.value, p.paid, Math.max(0, (p.value || 0) - (p.paid || 0)), p.retainer, (INVOICE_STATUS.find((s) => s.key === p.invoiceStatus) || {}).label]));
    rows.push([], ["Quotations"], ["Title", "Value", "Status"]);
    cq.forEach((q) => rows.push([q.title, q.value, (PROPOSAL_STATUS.find((s) => s.key === q.status) || {}).label]));
    const rev = cps.reduce((a, p) => a + (p.revenueRecognised || 0), 0);
    const out = cps.reduce((a, p) => a + Math.max(0, (p.value || 0) - (p.paid || 0)), 0);
    const ret = cps.reduce((a, p) => a + (p.retainer || 0), 0);
    rows.push([], ["Totals", "Revenue", rev, "Outstanding", out, "Retainer/mo", ret]);
    downloadCSV("KAITEQ-" + c.company.replace(/ /g, "_") + "-finance.csv", rows);
  };
  return (<div><Topbar title="Finance" sub="Revenue, invoices, retainers and profit — fed automatically from projects." />
    <div className="grid grid-cols-5 gap-3 mb-6">{stats.map((s) => <Stat key={s.label} {...s} />)}</div>
    <div className="flex items-center justify-between mb-3"><h2 style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Invoices</h2><button onClick={() => setView("documents")} className="flex items-center gap-1" style={{ fontSize: 12, color: C.cyan }}><FileText size={13} /> Invoice templates</button></div>
    <Card style={{ padding: 0, marginBottom: 24, overflow: "hidden" }}>
      <div className="grid" style={{ gridTemplateColumns: "2fr 1.4fr 1fr 1fr 1fr 1.3fr", padding: "12px 16px", fontSize: 11, color: C.mut2, borderBottom: `1px solid ${C.line}`, letterSpacing: "0.03em" }}>
        <span>PROJECT</span><span>CUSTOMER</span><span>VALUE</span><span>PAID</span><span>OUTSTANDING</span><span>STATUS</span></div>
      {projects.map((p) => { const out = Math.max(0, (p.value || 0) - (p.paid || 0)); const st = INVOICE_STATUS.find((s) => s.key === p.invoiceStatus) || INVOICE_STATUS[0];
        return (<div key={p.id} className="grid items-center" style={{ gridTemplateColumns: "2fr 1.4fr 1fr 1fr 1fr 1.3fr", padding: "12px 16px", fontSize: 13, color: C.text, borderBottom: `1px solid ${C.line}` }}>
          <span>{p.name}</span><span style={{ color: C.mut }}>{custName(customers, p.customerId)}</span><span>{gbp(p.value)}</span><span style={{ color: C.green }}>{gbp(p.paid)}</span><span style={{ color: out ? C.orange : C.mut2 }}>{gbp(out)}</span>
          <select value={p.invoiceStatus} onChange={(e) => onInvoiceStatus(p.id, e.target.value)} style={{ background: C.panel2, color: st.color, border: `1px solid ${st.color}44`, borderRadius: 6, fontSize: 12, padding: "4px 6px", outline: "none", width: "fit-content" }}>{INVOICE_STATUS.map((s) => <option key={s.key} value={s.key} style={{ color: C.text, background: C.panel2 }}>{s.label}</option>)}</select></div>); })}</Card>
    <div className="flex items-center justify-between mb-3"><h2 style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Quotations</h2><button onClick={() => setView("proposals")} className="flex items-center gap-1" style={{ fontSize: 12, color: C.cyan }}><Receipt size={13} /> Quotation templates</button></div>
    <Card style={{ padding: 0, marginBottom: 24, overflow: "hidden" }}>
      <div className="grid" style={{ gridTemplateColumns: "2fr 1.4fr 1fr 1.2fr", padding: "12px 16px", fontSize: 11, color: C.mut2, borderBottom: `1px solid ${C.line}`, letterSpacing: "0.03em" }}><span>QUOTATION</span><span>CUSTOMER</span><span>VALUE</span><span>STATUS</span></div>
      {proposals.map((q) => { const st = PROPOSAL_STATUS.find((s) => s.key === q.status) || PROPOSAL_STATUS[0];
        return (<div key={q.id} className="grid items-center" style={{ gridTemplateColumns: "2fr 1.4fr 1fr 1.2fr", padding: "12px 16px", fontSize: 13, color: C.text, borderBottom: `1px solid ${C.line}` }}>
          <span>{q.title}</span><span style={{ color: C.mut }}>{custName(customers, q.customerId)}</span><span>{gbp(q.value)}</span><span style={{ color: st.color }}>{st.label}</span></div>); })}
      {proposals.length === 0 && <div style={{ padding: 16, fontSize: 13, color: C.mut2 }}>No quotations yet.</div>}</Card>
    <h2 style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 12 }}>By customer</h2>
    <Card style={{ padding: 0, marginBottom: 24, overflow: "hidden" }}>{customers.map((c) => { const cps = projects.filter((p) => p.customerId === c.id); const rev = cps.reduce((a, p) => a + (p.revenueRecognised || 0), 0); const out = cps.reduce((a, p) => a + Math.max(0, (p.value || 0) - (p.paid || 0)), 0); const ret = cps.reduce((a, p) => a + (p.retainer || 0), 0);
      return (<div key={c.id} className="flex items-center justify-between" style={{ padding: "12px 16px", fontSize: 13, color: C.text, borderBottom: `1px solid ${C.line}` }}>
        <div><div style={{ fontWeight: 600 }}>{c.company}</div><div style={{ fontSize: 11, color: C.mut2 }}>{cps.length} projects · {gbp(rev)} earned · {gbp(out)} outstanding · {gbp(ret)}/mo</div></div>
        <button onClick={() => exportCustomer(c)} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5" style={{ background: C.panel2, color: C.text, fontSize: 12, border: `1px solid ${C.line}` }}><Download size={13} /> Download breakdown</button></div>); })}</Card>
    <div className="flex items-center justify-between mb-3"><h2 style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Expenses</h2><Btn onClick={() => setShowExp(true)}><Plus size={15} /> Add expense</Btn></div>
    <Card style={{ padding: 0, overflow: "hidden" }}>{expenses.map((e) => (<div key={e.id} className="flex items-center justify-between" style={{ padding: "12px 16px", fontSize: 13, color: C.text, borderBottom: `1px solid ${C.line}` }}>
      <div className="flex items-center gap-3"><Wallet size={15} style={{ color: C.amber }} /> {e.label}<span style={{ fontSize: 11, color: C.mut2 }}>{e.date}</span></div>
      <div className="flex items-center gap-4"><span>{gbp(e.amount)}</span><button onClick={() => onDeleteExpense(e.id)} style={{ color: C.mut2 }}><X size={14} /></button></div></div>))}
      {expenses.length === 0 && <div style={{ padding: 16, fontSize: 13, color: C.mut2 }}>No expenses logged.</div>}</Card>
    {showExp && <ExpenseModal onClose={() => setShowExp(false)} onCreate={onAddExpense} />}</div>);
}

/* --------------------------- Tasks --------------------------- */
function TaskModal({ projects, products = [], preset, onClose, onCreate }) {
  const [f, setF] = useState({ title: "", projectId: preset || (projects[0]?.id || "internal"), type: "feature", col: "todo", assignee: "Tatenda", due: "" });
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const save = () => { if (!f.title.trim()) return; onCreate({ id: "t" + Date.now(), ...f, title: f.title.trim() }); onClose(); };
  return (<Modal title="Add task" onClose={onClose} onSave={save} saveLabel="Add task">
    <Field label="Task"><input style={inputStyle} value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Build social content calendar" /></Field>
    <Field label="Project / product"><select style={inputStyle} value={f.projectId} onChange={(e) => set("projectId", e.target.value)}>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}{products.map((p) => <option key={p.id} value={p.id}>{p.name} (product)</option>)}<option value="internal">Internal / KAITEQ</option></select></Field>
    <div className="grid grid-cols-2 gap-3">
      <Field label="Assignee"><select style={inputStyle} value={f.assignee} onChange={(e) => set("assignee", e.target.value)}>{TEAM.map((t) => <option key={t}>{t}</option>)}<option>Client</option></select></Field>
      <Field label="Due date"><input style={inputStyle} type="date" value={f.due} onChange={(e) => set("due", e.target.value)} /></Field>
      <Field label="Type"><select style={inputStyle} value={f.type} onChange={(e) => set("type", e.target.value)}>{TASK_TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}</select></Field>
      <Field label="Status"><select style={inputStyle} value={f.col} onChange={(e) => set("col", e.target.value)}>{COLS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}</select></Field></div></Modal>);
}
function Tasks({ projects, products = [], tasks, onMoveTask, onDeleteTask, onNew }) {
  const [filter, setFilter] = useState("all");
  const [who, setWho] = useState("all");
  const nameFor = (id) => id === "internal" ? "Internal / KAITEQ" : ((projects.find((p) => p.id === id) || {}).name || (products.find((p) => p.id === id) || {}).name || "—");
  let shown = filter === "all" ? tasks : tasks.filter((t) => t.projectId === filter);
  if (who !== "all") shown = shown.filter((t) => t.assignee === who);
  return (<div><Topbar title="Tasks" sub="Sprint work, bugs, client and meeting actions — across everything." action={<Btn primary onClick={() => onNew(null)}><Plus size={15} /> Add task</Btn>} />
    <div className="flex items-center gap-2 mb-4">
      <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ ...inputStyle, width: "auto", padding: "7px 11px" }}><option value="all">All projects &amp; products</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}{products.map((p) => <option key={p.id} value={p.id}>{p.name} (product)</option>)}<option value="internal">Internal / KAITEQ</option></select>
      <select value={who} onChange={(e) => setWho(e.target.value)} style={{ ...inputStyle, width: "auto", padding: "7px 11px" }}><option value="all">Everyone</option>{TEAM.map((t) => <option key={t}>{t}</option>)}<option>Client</option></select></div>
    <div className="grid grid-cols-5 gap-2.5">{COLS.map((col) => { const items = shown.filter((t) => t.col === col.key);
      return (<div key={col.key} className="rounded-xl p-2.5" style={{ background: C.panel, border: `1px solid ${C.line}` }}>
        <div className="flex items-center justify-between mb-3"><span style={{ fontSize: 11, fontWeight: 600, color: col.color }}>{col.label}</span><span style={{ fontSize: 11, color: C.mut2 }}>{items.length}</span></div>
        <div className="flex flex-col gap-2">{items.map((t) => { const type = TASK_TYPES.find((x) => x.key === t.type) || TASK_TYPES[0]; const di = dueInfo(t.due);
          return (<div key={t.id} className="rounded-lg p-2.5" style={{ background: C.panel2, border: `1px solid ${C.line}` }}>
            <div className="flex items-start justify-between gap-1"><div style={{ fontSize: 12.5, color: C.text, marginBottom: 4 }}>{t.title}</div><button onClick={() => onDeleteTask(t.id)} style={{ color: C.mut2 }}><X size={13} /></button></div>
            <div style={{ fontSize: 10.5, color: C.mut2, marginBottom: 6 }}>{nameFor(t.projectId)}</div>
            <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-1.5"><Avatar name={t.assignee} size={15} /><Chip label={type.label} color={type.color} /></div>{di && <span style={{ fontSize: 10, color: di.color }}>{di.label}</span>}</div>
            <div className="flex gap-1">{COLS.map((c) => (<button key={c.key} onClick={() => onMoveTask(t.id, c.key)} title={"Move to " + c.label} style={{ width: 11, height: 4, borderRadius: 3, border: "none", cursor: "pointer", background: c.key === t.col ? GRAD : C.line }} />))}</div></div>); })}
          {items.length === 0 && <div style={{ fontSize: 11, color: C.mut2, padding: "4px 0" }}>—</div>}</div></div>); })}</div></div>);
}

/* --------------------------- Meetings --------------------------- */
const MEET_OUTCOME = { scheduled: { label: "Scheduled", color: C.cyan }, completed: { label: "Completed", color: C.green }, cancelled: { label: "Cancelled", color: C.red }, rescheduled: { label: "Rescheduled", color: C.amber } };
function MeetingModal({ customers, onClose, onCreate }) {
  const [f, setF] = useState({ customerId: customers[0]?.id || "", title: "", type: "Discovery", when: "", lead: "Tatenda" });
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const save = () => { if (!f.title.trim()) return; onCreate({ id: "m" + Date.now(), ...f, title: f.title.trim(), outcome: "scheduled", notes: { discussion: "", actions: "", decisions: "", followups: "" } }); onClose(); };
  return (<Modal title="Schedule meeting" onClose={onClose} onSave={save} saveLabel="Schedule">
    <Field label="Title"><input style={inputStyle} value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Discovery call" /></Field>
    <Field label="Customer"><select style={inputStyle} value={f.customerId} onChange={(e) => set("customerId", e.target.value)}>{customers.map((c) => <option key={c.id} value={c.id}>{c.company}</option>)}</select></Field>
    <div className="grid grid-cols-2 gap-3"><Field label="Type"><select style={inputStyle} value={f.type} onChange={(e) => set("type", e.target.value)}>{["Discovery", "Review", "Demo", "Kick-off", "Support"].map((t) => <option key={t}>{t}</option>)}</select></Field>
      <Field label="Lead"><select style={inputStyle} value={f.lead} onChange={(e) => set("lead", e.target.value)}>{TEAM.map((t) => <option key={t}>{t}</option>)}</select></Field></div>
    <Field label="When"><input style={inputStyle} value={f.when} onChange={(e) => set("when", e.target.value)} placeholder="e.g. Mon 16 Jun · 14:00" /></Field></Modal>);
}
function Meetings({ customers, meetings, onUpdate, onDelete, onNew, onCreateTask }) {
  const [openId, setOpenId] = useState(null);
  const m = meetings.find((x) => x.id === openId);
  const typeColor = { Discovery: C.cyan, Review: C.purple, Demo: C.amber, "Kick-off": C.blue, Support: C.green };
  if (m) {
    const setNote = (k, v) => onUpdate(m.id, { notes: { ...m.notes, [k]: v } });
    return (<div>
      <button onClick={() => setOpenId(null)} className="flex items-center gap-1 mb-4" style={{ color: C.mut, fontSize: 13 }}><ChevronRight size={14} style={{ transform: "rotate(180deg)" }} /> All meetings</button>
      <div className="flex items-start justify-between mb-5">
        <div><div className="flex items-center gap-3"><h1 style={{ fontSize: 22, fontWeight: 600, color: C.text }}>{m.title}</h1><Chip label={m.type} color={typeColor[m.type] || C.cyan} /></div>
          <div className="flex items-center gap-2 mt-1" style={{ fontSize: 13, color: C.mut }}><Building2 size={14} /> {custName(customers, m.customerId)} · <Clock size={13} /> {m.when || "—"} · <Avatar name={m.lead} size={18} /> {m.lead}</div></div>
        <div className="flex items-center gap-2">
          <select value={m.outcome} onChange={(e) => onUpdate(m.id, { outcome: e.target.value })} style={{ ...inputStyle, width: "auto", padding: "7px 10px", color: (MEET_OUTCOME[m.outcome] || {}).color }}>{Object.keys(MEET_OUTCOME).map((k) => <option key={k} value={k} style={{ color: C.text }}>{MEET_OUTCOME[k].label}</option>)}</select>
          <button onClick={() => { if (window.confirm("Delete meeting?")) { onDelete(m.id); setOpenId(null); } }} className="flex items-center justify-center rounded-lg" style={{ width: 38, height: 38, background: C.panel2, color: C.mut, border: `1px solid ${C.line}` }}><Trash2 size={15} /></button></div></div>
      <div className="grid grid-cols-2 gap-4">
        {[["discussion", "Discussion"], ["decisions", "Decisions"], ["actions", "Actions"], ["followups", "Follow-ups"]].map(([k, label]) => (
          <Card key={k} style={{ padding: 16 }}><div className="flex items-center justify-between mb-2"><h3 style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{label}</h3>
            {k === "actions" && <button onClick={() => onCreateTask(m)} className="flex items-center gap-1" style={{ fontSize: 11, color: C.cyan }}><Plus size={12} /> Turn into task</button>}</div>
            <textarea rows={5} value={m.notes[k] || ""} onChange={(e) => setNote(k, e.target.value)} placeholder={`Capture ${label.toLowerCase()}…`} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }} /></Card>))}</div>
      <div style={{ fontSize: 12, color: C.mut2, marginTop: 12 }}>Notes save automatically. “Turn into task” opens a task pre-linked to this customer.</div></div>);
  }
  return (<div><Topbar title="Meetings" sub="Schedule, then capture outcomes and actions." action={<Btn primary onClick={onNew}><Plus size={15} /> Schedule</Btn>} />
    <div className="flex flex-col gap-3">{meetings.map((m) => { const oc = MEET_OUTCOME[m.outcome] || MEET_OUTCOME.scheduled;
      return (<Card key={m.id} className="cursor-pointer" style={{ padding: 16 }}><div className="flex items-center justify-between" onClick={() => setOpenId(m.id)}>
        <div className="flex items-center gap-4"><div className="flex items-center justify-center rounded-lg" style={{ width: 42, height: 42, background: C.panel2 }}><Video size={20} style={{ color: typeColor[m.type] || C.cyan }} /></div>
          <div><div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{m.title}</div><div style={{ fontSize: 12, color: C.mut }}>{custName(customers, m.customerId)}</div></div></div>
        <div className="flex items-center gap-5"><Chip label={oc.label} color={oc.color} /><div className="flex items-center gap-1" style={{ fontSize: 12.5, color: C.text }}><Clock size={13} style={{ color: C.mut }} /> {m.when || "—"}</div><div className="flex items-center gap-1.5" style={{ fontSize: 12, color: C.mut }}><Avatar name={m.lead} size={18} /> {m.lead}</div></div></div></Card>); })}</div></div>);
}

/* --------------------------- Discovery --------------------------- */
function QuickClientModal({ onClose, onCreate }) {
  const [f, setF] = useState({ company: "", industry: "", projectName: "" });
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const save = () => { if (!f.company.trim()) return; onCreate({ company: f.company.trim(), industry: f.industry.trim(), projectName: f.projectName.trim() }); };
  return (<Modal title="New client" onClose={onClose} onSave={save} saveLabel="Create & start discovery">
    <Field label="Company name"><input style={inputStyle} value={f.company} onChange={(e) => set("company", e.target.value)} placeholder="e.g. Bright Dental" /></Field>
    <Field label="Industry"><input style={inputStyle} value={f.industry} onChange={(e) => set("industry", e.target.value)} placeholder="e.g. Healthcare" /></Field>
    <Field label="First project / engagement name"><input style={inputStyle} value={f.projectName} onChange={(e) => set("projectName", e.target.value)} placeholder="Defaults to ‘Company — Discovery’" /></Field>
    <div style={{ fontSize: 12, color: C.mut2 }}>Creates the client and a project at the Discovery stage, then opens its discovery notes. You can fill in the full profile later under Customers.</div>
  </Modal>);
}
function Discovery({ customers, projects, discovery, onAnswer, onMeta, onAddQuestion, onEditQuestion, onDeleteQuestion, onMoveQuestion, onApply, onAddClient }) {
  const [pid, setPid] = useState(projects[0]?.id || "");
  const [editing, setEditing] = useState(false);
  const [result, setResult] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const createClient = (payload) => { const np = onAddClient(payload); if (np) { setPid(np); setResult(""); } setShowAdd(false); };
  if (projects.length === 0) return (<div><Topbar title="Discovery Notes" sub="Editable questions per client, plus signals that flow into the rest of the app." />
    <Card style={{ padding: 22 }}><div className="flex items-center justify-between"><span style={{ color: C.mut, fontSize: 13 }}>No clients yet — add your first to start a discovery.</span>
      <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 rounded-lg px-4 py-2 font-semibold" style={{ background: GRAD, color: "#fff", fontSize: 13 }}><Plus size={15} /> New client</button></div></Card>
    {showAdd && <QuickClientModal onClose={() => setShowAdd(false)} onCreate={createClient} />}</div>);
  const disc = discovery[pid] || { a: {}, pain: 0, cost: "" };
  const questions = getQuestions(disc);
  const answered = Object.values(disc.a || {}).filter((v) => v && v.trim()).length;
  const apply = () => { const r = onApply(pid); const bits = []; if (r.opp) bits.push("1 AI opportunity"); if (r.tasks) bits.push(r.tasks + (r.tasks === 1 ? " task" : " tasks")); if (r.advanced) bits.push("advanced to Proposal"); bits.push("customer summary updated"); setResult("Populated: " + bits.join(" · ")); };
  return (<div><Topbar title="Discovery Notes" sub="Editable questions per client, plus signals that flow into the rest of the app." />
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <select value={pid} onChange={(e) => { setPid(e.target.value); setResult(""); }} style={{ ...inputStyle, width: "auto", padding: "8px 12px" }}>{projects.map((p) => <option key={p.id} value={p.id}>{custName(customers, p.customerId)} — {p.name}</option>)}</select>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 rounded-lg px-3 py-2" style={{ background: C.panel2, color: C.text, fontSize: 12.5, border: `1px solid ${C.line}` }}><Plus size={14} /> New client</button></div>
      <div className="flex items-center gap-3"><span style={{ fontSize: 12, color: answered === questions.length ? C.green : C.mut }}>{answered}/{questions.length} answered</span>
        <button onClick={() => setEditing((v) => !v)} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5" style={{ background: editing ? GRAD : C.panel2, color: editing ? "#fff" : C.text, fontSize: 12, border: editing ? "none" : `1px solid ${C.line}` }}><Pencil size={13} /> {editing ? "Done editing" : "Edit questions"}</button></div></div>

    <div className="grid grid-cols-2 gap-4 mb-4">
      <Card style={{ padding: 16 }}><div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8 }}>Pain score</div>
        <div className="flex items-center gap-1.5">{Array.from({ length: 10 }).map((_, i) => (<button key={i} onClick={() => onMeta(pid, "pain", i + 1)} style={{ width: 22, height: 22, borderRadius: 5, border: "none", cursor: "pointer", color: "#fff", fontSize: 11, background: i < (disc.pain || 0) ? (disc.pain >= 7 ? C.red : disc.pain >= 4 ? C.amber : C.green) : C.line }}>{i + 1}</button>))}</div>
        <div style={{ fontSize: 11, color: C.mut2, marginTop: 8 }}>How painful is this problem? Higher = prioritise the proposal.</div></Card>
      <Card style={{ padding: 16 }}><div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8 }}>Current cost of the problem</div>
        <textarea rows={2} value={disc.cost || ""} onChange={(e) => onMeta(pid, "cost", e.target.value)} placeholder="How much time or money is this costing today?" style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }} /></Card></div>

    <Card style={{ padding: 18, marginBottom: 20 }}>
      <div className="flex items-center justify-between mb-3"><div><div style={{ fontSize: 13.5, fontWeight: 600, color: C.text }}>Turn this discovery into the rest of the app</div>
        <div style={{ fontSize: 11.5, color: C.mut2, marginTop: 2 }}>Fill these in, then populate — it creates an AI opportunity, tasks and a customer summary, and moves the project to Proposal.</div></div>
        <button onClick={apply} className="flex items-center gap-2 rounded-lg px-4 py-2 font-semibold" style={{ background: GRAD, color: "#fff", fontSize: 13 }}><Sparkles size={15} /> Populate app</button></div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <Field label="Budget / project value (£)"><input style={inputStyle} type="number" value={disc.budget || ""} onChange={(e) => onMeta(pid, "budget", e.target.value)} placeholder="e.g. 2000" /></Field>
        <Field label="Monthly potential (£)"><input style={inputStyle} type="number" value={disc.monthly || ""} onChange={(e) => onMeta(pid, "monthly", e.target.value)} placeholder="e.g. 250" /></Field></div>
      <Field label="Automation / AI opportunity spotted"><input style={inputStyle} value={disc.opp || ""} onChange={(e) => onMeta(pid, "opp", e.target.value)} placeholder="e.g. AI social content engine with scheduling" /></Field>
      <div className="mt-3"><Field label="Agreed next actions (one per line → becomes tasks)"><textarea rows={3} value={disc.actions || ""} onChange={(e) => onMeta(pid, "actions", e.target.value)} placeholder={"Send proposal by Friday\nCollect brand assets from client\nDraft content calendar"} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }} /></Field></div>
      {result && <div style={{ fontSize: 12.5, color: C.green, marginTop: 12 }}>{result}</div>}
    </Card>

    {editing && <button onClick={() => onAddQuestion(pid)} className="flex items-center gap-1.5 rounded-lg px-3 py-2 mb-3" style={{ background: C.panel2, color: C.text, fontSize: 12.5, border: `1px dashed ${C.line}` }}><Plus size={14} /> Add question</button>}
    <div className="flex flex-col gap-3">{questions.map((q, i) => (<Card key={q.id} style={{ padding: 16 }}>
      <div className="flex items-start gap-2 mb-2"><span style={{ fontSize: 12, color: C.cyan, fontWeight: 700, marginTop: 9 }}>{i + 1}</span>
        {editing ? (<div className="flex items-center gap-1.5 flex-1">
          <input value={q.q} onChange={(e) => onEditQuestion(pid, q.id, e.target.value)} placeholder="Question text…" style={{ ...inputStyle, fontWeight: 500 }} />
          <button onClick={() => onMoveQuestion(pid, q.id, -1)} disabled={i === 0} className="flex items-center justify-center rounded-lg" style={{ width: 32, height: 32, background: C.panel2, color: i === 0 ? C.mut2 : C.mut, border: `1px solid ${C.line}` }} title="Move up"><ArrowLeft size={14} style={{ transform: "rotate(90deg)" }} /></button>
          <button onClick={() => onMoveQuestion(pid, q.id, 1)} disabled={i === questions.length - 1} className="flex items-center justify-center rounded-lg" style={{ width: 32, height: 32, background: C.panel2, color: i === questions.length - 1 ? C.mut2 : C.mut, border: `1px solid ${C.line}` }} title="Move down"><ArrowLeft size={14} style={{ transform: "rotate(-90deg)" }} /></button>
          <button onClick={() => onDeleteQuestion(pid, q.id)} className="flex items-center justify-center rounded-lg" style={{ width: 32, height: 32, background: C.panel2, color: C.mut, border: `1px solid ${C.line}` }} title="Delete question"><Trash2 size={14} /></button>
        </div>) : (<span style={{ fontSize: 13.5, color: C.text, fontWeight: 500 }}>{q.q || "Untitled question"}</span>)}</div>
      <textarea value={(disc.a || {})[q.id] || ""} onChange={(e) => onAnswer(pid, q.id, e.target.value)} placeholder="Type the client's answer…" rows={2} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }} /></Card>))}
      {questions.length === 0 && <Card style={{ padding: 20 }}><span style={{ color: C.mut, fontSize: 13 }}>No questions — add one above.</span></Card>}</div>
    <div style={{ fontSize: 12, color: C.mut2, marginTop: 12 }}>Questions and answers are saved per client, automatically. Editing questions here only changes them for this project.</div>
    {showAdd && <QuickClientModal onClose={() => setShowAdd(false)} onCreate={createClient} />}</div>);
}

/* --------------------------- Proposals --------------------------- */
function ProposalModal({ customers, onClose, onCreate }) {
  const [f, setF] = useState({ customerId: customers[0]?.id || "", title: "", value: "", status: "draft", date: new Date().toISOString().slice(0, 10) });
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const save = () => { if (!f.title.trim()) return; onCreate({ id: "q" + Date.now(), ...f, title: f.title.trim(), value: Number(f.value) || 0 }); onClose(); };
  return (<Modal title="New proposal" onClose={onClose} onSave={save} saveLabel="Create proposal">
    <Field label="Customer"><select style={inputStyle} value={f.customerId} onChange={(e) => set("customerId", e.target.value)}>{customers.map((c) => <option key={c.id} value={c.id}>{c.company}</option>)}</select></Field>
    <Field label="Title"><input style={inputStyle} value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Social media growth — Phase 1" /></Field>
    <div className="grid grid-cols-2 gap-3"><Field label="Value (£)"><input style={inputStyle} type="number" value={f.value} onChange={(e) => set("value", e.target.value)} /></Field>
      <Field label="Status"><select style={inputStyle} value={f.status} onChange={(e) => set("status", e.target.value)}>{PROPOSAL_STATUS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}</select></Field></div>
    <Field label="Date"><input style={inputStyle} type="date" value={f.date} onChange={(e) => set("date", e.target.value)} /></Field></Modal>);
}
function Proposals({ customers, proposals, onNew, onStatus, onDelete }) {
  const [show, setShow] = useState(false);
  const sumBy = (keys) => proposals.filter((q) => keys.includes(q.status)).reduce((a, q) => a + (q.value || 0), 0);
  const stats = [
    { label: "Out for decision", value: gbp(sumBy(["draft", "sent"])), accent: C.cyan },
    { label: "Won", value: gbp(sumBy(["accepted"])), accent: C.green },
    { label: "Total proposals", value: proposals.length, accent: C.purple },
  ];
  return (<div><Topbar title="Proposals" sub="Track every quote from draft to decision." action={<Btn primary onClick={() => setShow(true)}><Plus size={15} /> New proposal</Btn>} />
    <div className="grid grid-cols-3 gap-4 mb-5">{stats.map((s) => <Stat key={s.label} {...s} />)}</div>
    <div className="flex flex-col gap-2">{proposals.map((q) => { const st = PROPOSAL_STATUS.find((s) => s.key === q.status) || PROPOSAL_STATUS[0];
      return (<Card key={q.id} style={{ padding: 16 }}><div className="flex items-center justify-between">
        <div><div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{q.title}</div><div style={{ fontSize: 12, color: C.mut, marginTop: 2 }}>{custName(customers, q.customerId)} · {q.date}</div></div>
        <div className="flex items-center gap-4"><span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{gbp(q.value)}</span>
          <select value={q.status} onChange={(e) => onStatus(q.id, e.target.value)} style={{ background: C.panel2, color: st.color, border: `1px solid ${st.color}44`, borderRadius: 6, fontSize: 12, padding: "5px 8px", outline: "none" }}>{PROPOSAL_STATUS.map((s) => <option key={s.key} value={s.key} style={{ color: C.text, background: C.panel2 }}>{s.label}</option>)}</select>
          <button onClick={() => onDelete(q.id)} style={{ color: C.mut2 }}><Trash2 size={15} /></button></div></div></Card>); })}
      {proposals.length === 0 && <Card style={{ padding: 20 }}><span style={{ color: C.mut, fontSize: 13 }}>No proposals yet.</span></Card>}</div>
    {show && <ProposalModal customers={customers} onClose={() => setShow(false)} onCreate={onNew} />}</div>);
}

/* --------------------------- AI Opportunities --------------------------- */
function oppScore(o) { return (o.value || 0) * 2 - (o.effort || 0) - (o.risk || 0); }
function oppPriority(o) { const s = oppScore(o); return s >= 4 ? { label: "High priority", color: C.green } : s >= 0 ? { label: "Medium", color: C.amber } : { label: "Low", color: C.mut }; }
function PriorityPill({ o }) { const p = oppPriority(o); return (<span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5" style={{ fontSize: 11, color: p.color, background: `${p.color}1f` }}><TrendingUp size={12} /> {p.label}</span>); }
function Meter({ label, n, color }) { return (<div className="flex items-center gap-2"><span style={{ fontSize: 11, color: C.mut, width: 46 }}>{label}</span><div className="flex gap-1">{[1, 2, 3, 4, 5].map((i) => (<div key={i} style={{ width: 13, height: 5, borderRadius: 2, background: i <= n ? color : C.line }} />))}</div></div>); }
function OppModal({ customers, onClose, onCreate }) {
  const [f, setF] = useState({ customerId: customers[0]?.id || "", idea: "", value: 3, effort: 3, risk: 3, status: "idea", estValue: "", projectValue: "", monthly: "" });
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const save = () => { if (!f.idea.trim()) return; onCreate({ id: "o" + Date.now(), ...f, idea: f.idea.trim(), value: Number(f.value), effort: Number(f.effort), risk: Number(f.risk), projectValue: Number(f.projectValue) || 0, monthly: Number(f.monthly) || 0 }); onClose(); };
  const sel = (k) => (<select style={inputStyle} value={f[k]} onChange={(e) => set(k, e.target.value)}>{[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}</select>);
  return (<Modal wide title="New AI opportunity" onClose={onClose} onSave={save} saveLabel="Add opportunity">
    <div className="grid grid-cols-2 gap-3">
      <Field label="Customer"><select style={inputStyle} value={f.customerId} onChange={(e) => set("customerId", e.target.value)}>{customers.map((c) => <option key={c.id} value={c.id}>{c.company}</option>)}</select></Field>
      <Field label="Status"><select style={inputStyle} value={f.status} onChange={(e) => set("status", e.target.value)}>{OPP_STATUS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}</select></Field></div>
    <Field label="Automation / AI idea"><input style={inputStyle} value={f.idea} onChange={(e) => set("idea", e.target.value)} placeholder="e.g. AI social content engine" /></Field>
    <Field label="Estimated impact"><input style={inputStyle} value={f.estValue} onChange={(e) => set("estValue", e.target.value)} placeholder="e.g. ~10 hrs/week saved" /></Field>
    <div className="grid grid-cols-2 gap-3">
      <Field label="Project value (£)"><input style={inputStyle} type="number" value={f.projectValue} onChange={(e) => set("projectValue", e.target.value)} /></Field>
      <Field label="Monthly value (£)"><input style={inputStyle} type="number" value={f.monthly} onChange={(e) => set("monthly", e.target.value)} /></Field></div>
    <div style={{ fontSize: 12, color: C.cyan, fontWeight: 600 }}>AI score</div>
    <div className="grid grid-cols-3 gap-3"><Field label="Business impact (1–5)">{sel("value")}</Field><Field label="Effort (1–5)">{sel("effort")}</Field><Field label="Risk (1–5)">{sel("risk")}</Field></div>
  </Modal>);
}
function AIOpportunities({ customers, opportunities, onNew, onStatus, onDelete }) {
  const [show, setShow] = useState(false);
  const sorted = [...opportunities].sort((a, b) => oppScore(b) - oppScore(a));
  return (<div><Topbar title="AI Opportunities" sub="Automation ideas per client, scored by impact, effort and risk." action={<Btn primary onClick={() => setShow(true)}><Plus size={15} /> New opportunity</Btn>} />
    <div className="grid grid-cols-2 gap-4">{sorted.map((o) => { const st = OPP_STATUS.find((s) => s.key === o.status) || OPP_STATUS[0];
      return (<Card key={o.id} style={{ padding: 18 }}>
        <div className="flex items-start justify-between mb-2"><div className="flex items-center gap-2"><Lightbulb size={16} style={{ color: C.amber }} /><span style={{ fontSize: 12, color: C.mut }}>{custName(customers, o.customerId)}</span></div>
          <div className="flex items-center gap-2"><PriorityPill o={o} /><button onClick={() => onDelete(o.id)} style={{ color: C.mut2 }}><Trash2 size={14} /></button></div></div>
        <div style={{ fontSize: 14, color: C.text, fontWeight: 500, marginBottom: 6 }}>{o.idea}</div>
        {o.estValue && <div style={{ fontSize: 12, color: C.green, marginBottom: 8 }}>{o.estValue}</div>}
        {(o.projectValue || o.monthly) ? <div className="flex items-center gap-2 mb-3" style={{ fontSize: 12, color: C.mut2 }}>{o.projectValue ? <span>{gbp(o.projectValue)} project</span> : null}{o.monthly ? <span>· {gbp(o.monthly)}/mo</span> : null}</div> : <div style={{ marginBottom: 10 }} />}
        <div className="flex flex-col gap-1.5 mb-3"><Meter label="Impact" n={o.value} color={C.green} /><Meter label="Effort" n={o.effort} color={C.cyan} /><Meter label="Risk" n={o.risk} color={C.orange} /></div>
        <select value={o.status} onChange={(e) => onStatus(o.id, e.target.value)} style={{ background: C.panel2, color: st.color, border: `1px solid ${st.color}44`, borderRadius: 6, fontSize: 12, padding: "5px 8px", outline: "none" }}>{OPP_STATUS.map((s) => <option key={s.key} value={s.key} style={{ color: C.text, background: C.panel2 }}>{s.label}</option>)}</select></Card>); })}
      {opportunities.length === 0 && <Card style={{ padding: 20 }}><span style={{ color: C.mut, fontSize: 13 }}>No opportunities yet.</span></Card>}</div>
    {show && <OppModal customers={customers} onClose={() => setShow(false)} onCreate={onNew} />}</div>);
}

/* --------------------------- Documents --------------------------- */
function Documents({ customers }) {
  const kb = ["Best practices", "Prompt library", "Lessons learned", "Case studies"];
  return (<div><Topbar title="Documents" sub="Client files, internal templates, and a future AI knowledge base." action={<Btn primary><Upload size={15} /> Upload</Btn>} />
    <h2 style={{ fontSize: 13, fontWeight: 600, color: C.mut, marginBottom: 10, letterSpacing: "0.04em" }}>CLIENT DOCUMENTS</h2>
    <div className="grid grid-cols-2 gap-4 mb-7">{customers.map((c) => (<Card key={c.id} style={{ padding: 16 }}>
      <div className="flex items-center gap-2 mb-3"><div className="flex items-center justify-center rounded-lg" style={{ width: 30, height: 30, background: GRAD, color: "#fff", fontWeight: 700, fontSize: 13 }}>{c.company.slice(0, 1)}</div><span style={{ fontSize: 13.5, fontWeight: 600, color: C.text }}>{c.company}</span></div>
      <div className="flex flex-col gap-2">{(clientDocs[c.id] || []).map((d) => (<div key={d} className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: C.panel2, border: `1px solid ${C.line}` }}><Paperclip size={13} style={{ color: C.purple }} /><span style={{ fontSize: 12.5, color: C.text }}>{d}</span></div>))}
        {(clientDocs[c.id] || []).length === 0 && <span style={{ fontSize: 12, color: C.mut2 }}>No documents yet.</span>}</div></Card>))}</div>
    <h2 style={{ fontSize: 13, fontWeight: 600, color: C.mut, marginBottom: 10, letterSpacing: "0.04em" }}>INTERNAL</h2>
    <div className="grid grid-cols-3 gap-3 mb-7">{seedDocs.map((d) => (<Card key={d.id} style={{ padding: 14 }}><div className="flex items-center gap-3"><div className="flex items-center justify-center rounded-lg" style={{ width: 36, height: 36, background: C.panel2 }}><FileText size={17} style={{ color: C.cyan }} /></div><span style={{ fontSize: 13, color: C.text }}>{d.name}</span></div></Card>))}</div>
    <h2 style={{ fontSize: 13, fontWeight: 600, color: C.mut, marginBottom: 10, letterSpacing: "0.04em" }}>AI KNOWLEDGE BASE · COMING SOON</h2>
    <div className="grid grid-cols-4 gap-3">{kb.map((k) => (<Card key={k} style={{ padding: 16, opacity: 0.55 }}><div className="flex items-center gap-2"><BookOpen size={15} style={{ color: C.purple }} /><span style={{ fontSize: 13, color: C.text }}>{k}</span></div></Card>))}</div>
    <div style={{ fontSize: 12, color: C.mut2, marginTop: 10 }}>The AI knowledge base will let a future co-pilot search your best practices, prompts and past work — it needs the database + AI step.</div></div>);
}

/* --------------------------- Workflow --------------------------- */
function WorkflowView() {
  return (<div><Topbar title="Workflow" sub="How KAITEQ runs — client delivery, and how we build the platform itself." />
    <h2 style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 12 }}>Client delivery lifecycle</h2>
    <div className="flex flex-col gap-3">{STAGES.map((s, i) => (<Card key={s.key} style={{ padding: 16 }}>
      <div className="flex items-start gap-4"><div className="flex items-center justify-center rounded-xl flex-shrink-0" style={{ width: 44, height: 44, background: GRAD }}><s.icon size={20} color="#fff" /></div>
        <div className="flex-1"><div className="flex items-center gap-3"><span style={{ fontSize: 12, color: C.mut2, fontWeight: 700 }}>{String(i + 1).padStart(2, "0")}</span><span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{s.name}</span><Chip label={"DevOps · " + s.devops} color={C.cyan} /></div>
          <p style={{ fontSize: 13, color: C.mut, marginTop: 6, lineHeight: 1.55 }}>{s.desc}</p></div></div></Card>))}</div>
    <h2 style={{ fontSize: 14, fontWeight: 600, color: C.text, margin: "28px 0 12px" }}>How we build KAITEQ</h2>
    <Card style={{ padding: 18 }}>
      <div className="flex items-center flex-wrap gap-2 mb-4">{DEV_FLOW.map((d, i) => (<React.Fragment key={d}>
        <span style={{ fontSize: 13, fontWeight: 600, color: C.text, background: C.panel2, padding: "6px 14px", borderRadius: 8, border: `1px solid ${C.line}` }}>{d}</span>
        {i < DEV_FLOW.length - 1 && <ArrowRight size={14} style={{ color: C.mut2 }} />}</React.Fragment>))}</div>
      <p style={{ fontSize: 13, color: C.mut, lineHeight: 1.6 }}>Keep every feature small and shippable — e.g. “Add finance module”, “Add customer profiles”, “Add meeting actions”. Ship it, see it working, then pick the next one.</p></Card>
    <Card style={{ padding: 16, marginTop: 16, background: C.panel2 }}>
      <p style={{ fontSize: 13, color: C.mut, lineHeight: 1.6 }}><span style={{ color: C.cyan, fontWeight: 600 }}>It's a loop, not a line.</span> Stage 8 (Support / Optimise) surfaces the next AI opportunity, which becomes the next lead — and the cycle restarts.</p></Card>
    <Card style={{ padding: 16, marginTop: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 }}>On the roadmap (needs a backend / AI step)</div>
      <p style={{ fontSize: 12.5, color: C.mut, lineHeight: 1.6 }}>Project creation from an uploaded pack (proposal/SOW/notes → auto-create customer, project, tasks), a client portal, and an AI co-pilot. These need a database and a secure AI connection, which is the Supabase + serverless step.</p></Card>
  </div>);
}

/* --------------------------- Internal Products --------------------------- */
function ProductModal({ product, onClose, onSave }) {
  const [f, setF] = useState(product || { id: "prod" + Date.now(), name: "", lead: "Tatenda", health: "on", stageIdx: 0, tags: [], oneOff: 0, monthly: 0, customersActive: 0, status: "idea", notes: "" });
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const save = () => { if (!f.name.trim()) return; onSave({ ...f, name: f.name.trim(), oneOff: Number(f.oneOff) || 0, monthly: Number(f.monthly) || 0, customersActive: Number(f.customersActive) || 0, stageIdx: Number(f.stageIdx), tags: Array.isArray(f.tags) ? f.tags : String(f.tags).split(",").map((t) => t.trim()).filter(Boolean) }); onClose(); };
  const tagsStr = Array.isArray(f.tags) ? f.tags.join(", ") : f.tags;
  return (<Modal wide title={product ? "Edit product" : "New internal product"} onClose={onClose} onSave={save} saveLabel={product ? "Save product" : "Create product"}>
    <div className="grid grid-cols-2 gap-3">
      <Field label="Product name"><input style={inputStyle} value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Social Content Engine" /></Field>
      <Field label="Lead"><select style={inputStyle} value={f.lead} onChange={(e) => set("lead", e.target.value)}>{TEAM.map((t) => <option key={t}>{t}</option>)}</select></Field>
      <Field label="Stage"><select style={inputStyle} value={f.stageIdx} onChange={(e) => set("stageIdx", e.target.value)}>{STAGES.map((s, i) => <option key={s.key} value={i}>{i + 1}. {s.name}</option>)}</select></Field>
      <Field label="Status"><select style={inputStyle} value={f.status} onChange={(e) => set("status", e.target.value)}>{PRODUCT_STATUS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}</select></Field>
    </div>
    <div style={{ fontSize: 12, color: C.cyan, fontWeight: 600, marginTop: 4 }}>Monetisation</div>
    <div className="grid grid-cols-3 gap-3">
      <Field label="One-off price (£)"><input style={inputStyle} type="number" value={f.oneOff} onChange={(e) => set("oneOff", e.target.value)} /></Field>
      <Field label="Monthly price (£)"><input style={inputStyle} type="number" value={f.monthly} onChange={(e) => set("monthly", e.target.value)} /></Field>
      <Field label="Paying customers"><input style={inputStyle} type="number" value={f.customersActive} onChange={(e) => set("customersActive", e.target.value)} /></Field>
    </div>
    <Field label="Tags"><input style={inputStyle} value={tagsStr} onChange={(e) => set("tags", e.target.value)} placeholder="SaaS, AI" /></Field>
    <Field label="Notes"><textarea rows={3} style={{ ...inputStyle, resize: "vertical" }} value={f.notes} onChange={(e) => set("notes", e.target.value)} /></Field>
  </Modal>);
}
function ProductDetail({ product, tasks, onBack, onSetStage, onMoveTask, onDelete, onEdit, onAddTask }) {
  const p = product;
  const ptasks = tasks.filter((t) => t.projectId === p.id);
  const st = PRODUCT_STATUS.find((s) => s.key === p.status) || PRODUCT_STATUS[0];
  const mrr = (p.monthly || 0) * (p.customersActive || 0);
  return (<div>
    <button onClick={onBack} className="flex items-center gap-1 mb-4" style={{ color: C.mut, fontSize: 13 }}><ChevronRight size={14} style={{ transform: "rotate(180deg)" }} /> All products</button>
    <div className="flex items-start justify-between mb-5">
      <div><div className="flex items-center gap-3"><h1 style={{ fontSize: 22, fontWeight: 600, color: C.text }}>{p.name}</h1><Chip label={st.label} color={st.color} /></div>
        <div className="flex items-center gap-2 mt-1" style={{ fontSize: 13, color: C.mut }}><Package size={14} /> Internal product · Lead <Avatar name={p.lead} size={18} /> {p.lead}</div></div>
      <div className="flex items-center gap-2">
        <button onClick={() => onSetStage(p.id, p.stageIdx - 1)} disabled={p.stageIdx === 0} className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: C.panel2, color: p.stageIdx === 0 ? C.mut2 : C.text, fontSize: 13, border: `1px solid ${C.line}`, cursor: p.stageIdx === 0 ? "default" : "pointer" }}><ArrowLeft size={15} /> Previous</button>
        <button onClick={() => onSetStage(p.id, p.stageIdx + 1)} disabled={p.stageIdx === STAGES.length - 1} className="flex items-center gap-2 rounded-lg px-4 py-2 font-semibold" style={{ background: p.stageIdx === STAGES.length - 1 ? C.panel2 : GRAD, color: p.stageIdx === STAGES.length - 1 ? C.mut2 : "#fff", fontSize: 13, cursor: p.stageIdx === STAGES.length - 1 ? "default" : "pointer" }}>Advance <ArrowRight size={15} /></button>
        <button onClick={() => onEdit(p)} className="flex items-center justify-center rounded-lg" style={{ width: 38, height: 38, background: C.panel2, color: C.mut, border: `1px solid ${C.line}` }} title="Edit"><Pencil size={15} /></button>
        <button onClick={() => { if (window.confirm("Delete this product?")) { onDelete(p.id); onBack(); } }} className="flex items-center justify-center rounded-lg" style={{ width: 38, height: 38, background: C.panel2, color: C.mut, border: `1px solid ${C.line}` }} title="Delete"><Trash2 size={15} /></button></div></div>
    <div className="grid grid-cols-4 gap-4 mb-5">
      <Stat label="One-off price" value={gbp(p.oneOff)} accent={C.cyan} />
      <Stat label="Monthly price" value={gbp(p.monthly)} accent={C.purple} />
      <Stat label="Paying customers" value={p.customersActive || 0} accent={C.amber} />
      <Stat label="MRR" value={gbp(mrr)} accent={C.green} /></div>
    <Card style={{ padding: 20, marginBottom: 20 }}>
      <div className="flex items-center justify-between mb-4"><h2 style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Development pipeline</h2><span style={{ fontSize: 12, color: C.mut }}>{progressOf(p)}% complete · click a stage to jump</span></div>
      <div className="grid grid-cols-8 gap-1">{STAGES.map((s, i) => { const done = i < p.stageIdx, active = i === p.stageIdx;
        return (<div key={s.key} className="text-center cursor-pointer" onClick={() => onSetStage(p.id, i)}>
          <div className="mx-auto flex items-center justify-center rounded-full mb-2" style={{ width: 32, height: 32, background: done || active ? GRAD : C.panel2, border: done || active ? "none" : `1px solid ${C.line}`, boxShadow: active ? "0 0 0 4px rgba(0,184,255,0.16)" : "none" }}>{done ? <CircleCheck size={16} color="#fff" /> : active ? <CircleDot size={16} color="#fff" /> : <Circle size={14} color={C.mut2} />}</div>
          <div style={{ fontSize: 9.5, lineHeight: 1.2, color: done || active ? C.text : C.mut2 }}>{s.name}</div></div>); })}</div>
      <div className="mt-4 rounded-lg p-3" style={{ background: C.panel2 }}><div style={{ fontSize: 12, color: C.cyan, fontWeight: 600 }}>Current: {STAGES[p.stageIdx].name}</div><div style={{ fontSize: 12.5, color: C.mut, marginTop: 3 }}>{STAGES[p.stageIdx].desc}</div></div>
      {p.notes && <div className="mt-3" style={{ fontSize: 13, color: C.mut, lineHeight: 1.6 }}>{p.notes}</div>}
    </Card>
    <div className="flex items-center justify-between mb-3"><h2 style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Build board</h2><button onClick={() => onAddTask(p.id)} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5" style={{ background: C.panel2, color: C.text, fontSize: 12, border: `1px solid ${C.line}` }}><Plus size={13} /> Add task</button></div>
    <div className="grid grid-cols-5 gap-2.5">{COLS.map((col) => { const items = ptasks.filter((t) => t.col === col.key);
      return (<div key={col.key} className="rounded-xl p-2.5" style={{ background: C.panel, border: `1px solid ${C.line}` }}>
        <div className="flex items-center justify-between mb-3"><span style={{ fontSize: 11, fontWeight: 600, color: col.color }}>{col.label}</span><span style={{ fontSize: 11, color: C.mut2 }}>{items.length}</span></div>
        <div className="flex flex-col gap-2">{items.map((t) => <TaskMini key={t.id} t={t} onMove={onMoveTask} />)}{items.length === 0 && <div style={{ fontSize: 11, color: C.mut2, padding: "4px 0" }}>—</div>}</div></div>); })}</div></div>);
}
function Products({ products, tasks, activeProduct, setActiveProduct, onSetStage, onMoveTask, onDelete, onNew, onEdit, onAddTask }) {
  const p = products.find((x) => x.id === activeProduct);
  if (p) return <ProductDetail product={p} tasks={tasks} onBack={() => setActiveProduct(null)} onSetStage={onSetStage} onMoveTask={onMoveTask} onDelete={onDelete} onEdit={onEdit} onAddTask={onAddTask} />;
  const mrrTotal = products.reduce((a, p) => a + (p.monthly || 0) * (p.customersActive || 0), 0);
  return (<div><Topbar title="Internal Products" sub="Products we build and monetise ourselves — not requested by clients." action={<Btn primary onClick={onNew}><Plus size={15} /> New product</Btn>} />
    <div className="grid grid-cols-3 gap-4 mb-5"><Stat label="Products" value={products.length} accent={C.cyan} /><Stat label="Live" value={products.filter((x) => x.status === "live").length} accent={C.green} /><Stat label="Total MRR" value={gbp(mrrTotal)} accent={C.purple} /></div>
    <div className="flex flex-col gap-3">{products.map((pr) => { const st = PRODUCT_STATUS.find((s) => s.key === pr.status) || PRODUCT_STATUS[0];
      return (<Card key={pr.id} className="cursor-pointer" style={{ padding: 18 }}><div onClick={() => setActiveProduct(pr.id)}>
        <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-3"><span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{pr.name}</span><Chip label={st.label} color={st.color} />{(pr.tags || []).map((t) => <Chip key={t} label={t} color={C.mut} />)}</div>
          <div className="flex items-center gap-2"><Avatar name={pr.lead} size={20} /><span style={{ fontSize: 12, color: C.mut }}>{pr.monthly ? gbp(pr.monthly) + "/mo" : gbp(pr.oneOff)}</span></div></div>
        <div className="flex items-center justify-between mb-3"><span style={{ fontSize: 12, color: C.cyan }}>{STAGES[pr.stageIdx].name}</span><span style={{ fontSize: 12, color: C.mut2 }}>{pr.customersActive || 0} paying · {gbp((pr.monthly || 0) * (pr.customersActive || 0))} MRR</span></div>
        <Pipeline stageIdx={pr.stageIdx} /></div></Card>); })}
      {products.length === 0 && <Card style={{ padding: 20 }}><span style={{ color: C.mut, fontSize: 13 }}>No products yet — click “New product”.</span></Card>}</div></div>);
}

/* --------------------------- Map --------------------------- */
function TerritoryMap({ customers, projects }) {
  const mapEl = useRef(null), mapRef = useRef(null), layerRef = useRef(null);
  const revOf = (id) => projects.filter((p) => p.customerId === id).reduce((a, p) => a + (p.revenueRecognised || 0), 0);
  const placed = customers.map((c) => ({ c, co: coordsOf(c), rev: revOf(c.id) })).filter((x) => x.co);
  const noCoords = customers.filter((c) => !coordsOf(c));
  const totalRev = placed.reduce((a, x) => a + x.rev, 0);
  const maxRev = Math.max(1, ...placed.map((x) => x.rev));
  const hasL = typeof window !== "undefined" && window.L;
  const [colorMode, setColorMode] = useState("health");
  const [filterVal, setFilterVal] = useState("all");
  const DIMS = {
    health: { label: "Health", opts: Object.keys(HEALTH).map((k) => ({ val: k, label: HEALTH[k].label, color: HEALTH[k].color })), get: (c) => c.health || "healthy" },
    source: { label: "Source", opts: SOURCES.map((s) => ({ val: s, label: s, color: SOURCE_COLOR[s] })), get: (c) => c.source || "Other" },
    status: { label: "Status", opts: ["Lead", "Discovery", "Proposal", "Active", "Retainer", "Closed"].map((s) => ({ val: s, label: s, color: STATUS_COLOR[s] || C.mut2 })), get: (c) => c.status || "Lead" },
  };
  const dim = DIMS[colorMode];
  const shown = placed.filter(({ c }) => filterVal === "all" || dim.get(c) === filterVal);

  useEffect(() => {
    if (!hasL || !mapEl.current) return;
    const L = window.L;
    if (!mapRef.current) {
      mapRef.current = L.map(mapEl.current, { zoomControl: true, scrollWheelZoom: true, worldCopyJump: true }).setView([54.5, -3], 5);
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", { maxZoom: 19, subdomains: "abcd", attribution: "&copy; OpenStreetMap &copy; CARTO" }).addTo(mapRef.current);
      layerRef.current = L.layerGroup().addTo(mapRef.current);
    }
    const map = mapRef.current, grp = layerRef.current; grp.clearLayers();
    const pts = [];
    shown.forEach(({ c, co, rev }) => {
      const ov = dim.opts.find((x) => x.val === dim.get(c)); const col = ov ? ov.color : C.cyan;
      const radius = 9 + Math.round((rev / maxRev) * 18);
      L.circleMarker([co[0], co[1]], { radius: radius + 6, color: col, weight: 0, fillColor: col, fillOpacity: 0.18 }).addTo(grp);
      const m = L.circleMarker([co[0], co[1]], { radius, color: "#ffffff", weight: 1.5, fillColor: col, fillOpacity: 0.9 });
      m.bindPopup(`<b>${c.company}</b><br>${c.city || ""}<br>${gbp(rev)} earned · ${ov ? ov.label : ""}`);
      m.addTo(grp); m.bindTooltip(c.company, { direction: "top", offset: [0, -radius] });
      pts.push([co[0], co[1]]);
    });
    if (pts.length === 1) map.setView(pts[0], 7);
    else if (pts.length > 1) map.fitBounds(pts, { padding: [50, 50], maxZoom: 9 });
    const t = setTimeout(() => map.invalidateSize(), 150);
    return () => clearTimeout(t);
  }, [customers, projects, hasL, colorMode, filterVal]);
  useEffect(() => () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } }, []);

  const topPlace = [...placed].sort((a, b) => b.rev - a.rev)[0];
  return (<div><Topbar title="Map" sub="Where your customers are — and where you're winning." />
    <div className="grid grid-cols-4 gap-4 mb-5">
      <Stat label="Clients mapped" value={placed.length} accent={C.cyan} />
      <Stat label="Revenue mapped" value={gbp(totalRev)} accent={C.green} />
      <Stat label="Top location" value={topPlace ? (topPlace.c.city || topPlace.c.company) : "—"} accent={C.purple} />
      <Stat label="Needs a location" value={noCoords.length} accent={C.orange} />
    </div>
    <div className="grid grid-cols-3 gap-5">
      <Card className="col-span-2" style={{ padding: 12 }}>
        <div className="flex items-center justify-between mb-2.5 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 11, color: C.mut2 }}>Colour by</span>
            <select value={colorMode} onChange={(e) => { setColorMode(e.target.value); setFilterVal("all"); }} style={{ ...inputStyle, width: "auto", padding: "5px 8px", fontSize: 12 }}>{Object.keys(DIMS).map((k) => <option key={k} value={k}>{DIMS[k].label}</option>)}</select>
            <span style={{ fontSize: 11, color: C.mut2, marginLeft: 6 }}>Show</span>
            <select value={filterVal} onChange={(e) => setFilterVal(e.target.value)} style={{ ...inputStyle, width: "auto", padding: "5px 8px", fontSize: 12 }}><option value="all">All</option>{dim.opts.map((o) => <option key={o.val} value={o.val}>{o.label}</option>)}</select>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">{dim.opts.map((o) => (<span key={o.val} className="flex items-center gap-1" style={{ fontSize: 10.5, color: C.mut }}><span style={{ width: 8, height: 8, borderRadius: 8, background: o.color, display: "inline-block" }} /> {o.label}</span>))}</div>
        </div>
        {hasL
          ? <div ref={mapEl} style={{ width: "100%", height: 540, borderRadius: 10, overflow: "hidden" }} />
          : <MapFallback placed={shown} maxRev={maxRev} dim={dim} />}
      </Card>
      <div>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 10 }}>Customers by revenue</h3>
        <div className="flex flex-col gap-2">{[...placed].sort((a, b) => b.rev - a.rev).map(({ c, rev }) => (<Card key={c.id} style={{ padding: 12 }}>
          <div className="flex items-center justify-between"><span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{c.company}</span><RelHealth h={c.health} /></div>
          <div className="flex items-center gap-1 mt-1" style={{ fontSize: 11, color: C.mut2 }}><MapPin size={11} /> {c.city || "—"} · {gbp(rev)} earned</div></Card>))}
          {placed.length === 0 && <Card style={{ padding: 14 }}><span style={{ fontSize: 12, color: C.mut2 }}>No customers placed yet.</span></Card>}</div>
        {noCoords.length > 0 && <div style={{ fontSize: 11, color: C.mut2, marginTop: 10 }}>No location set for: {noCoords.map((c) => c.company).join(", ")}. Add a city (or lat/lng) in the customer profile to map them.</div>}
        <div style={{ fontSize: 11, color: C.mut2, marginTop: 10 }}>Marker size = revenue recognised; colour = relationship health. Drag to pan, scroll to zoom. Seeded cities are placeholders — edit a customer to set the real location.</div>
      </div>
    </div>
  </div>);
}
/* Lightweight scatter shown only if the map library hasn't loaded (e.g. offline preview) */
function MapFallback({ placed, maxRev, dim }) {
  const W = 460, H = 540, B = { latMin: 49.9, latMax: 58.8, lngMin: -8.3, lngMax: 1.9 };
  const proj = (lat, lng) => ({ x: ((lng - B.lngMin) / (B.lngMax - B.lngMin)) * W, y: H - ((lat - B.latMin) / (B.latMax - B.latMin)) * H });
  return (<svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", maxHeight: 540, background: C.panel2, borderRadius: 10 }}>
    {placed.map(({ c, co, rev }) => { const q = proj(co[0], co[1]); const rad = 8 + (rev / maxRev) * 18; const ov = dim ? dim.opts.find((x) => x.val === dim.get(c)) : null; const col = ov ? ov.color : (HEALTH[c.health] ? HEALTH[c.health].color : C.cyan);
      return (<g key={c.id}><circle cx={q.x} cy={q.y} r={rad} fill={col} opacity={0.22} /><circle cx={q.x} cy={q.y} r={5} fill={col} /><text x={q.x + rad + 3} y={q.y + 4} fill={C.text} style={{ fontSize: 11, fontWeight: 600 }}>{c.company}</text></g>); })}
    <text x={W / 2} y={H - 10} fill={C.mut2} textAnchor="middle" style={{ fontSize: 10 }}>Live map loads on the deployed site</text>
  </svg>);
}

/* --------------------------- Root --------------------------- */
export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("dashboard");
  const init = loadData();
  const [customers, setCustomers] = useState(init.customers);
  const [projects, setProjects] = useState(init.projects);
  const [tasks, setTasks] = useState(init.tasks);
  const [meetings, setMeetings] = useState(init.meetings);
  const [proposals, setProposals] = useState(init.proposals);
  const [opportunities, setOpportunities] = useState(init.opportunities);
  const [discovery, setDiscovery] = useState(init.discovery);
  const [expenses, setExpenses] = useState(init.expenses);
  const [products, setProducts] = useState(init.products);
  const [activeProject, setActiveProject] = useState(null);
  const [activeProduct, setActiveProduct] = useState(null);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ customers, projects, products, tasks, meetings, proposals, opportunities, discovery, expenses })); } catch (e) {}
  }, [customers, projects, products, tasks, meetings, proposals, opportunities, discovery, expenses]);

  /* projects */
  const setStage = (id, idx) => setProjects((ps) => ps.map((p) => p.id === id ? { ...p, stageIdx: Math.max(0, Math.min(STAGES.length - 1, idx)) } : p));
  const saveProject = (proj) => setProjects((ps) => ps.some((p) => p.id === proj.id) ? ps.map((p) => p.id === proj.id ? proj : p) : [proj, ...ps]);
  const deleteProject = (id) => { setProjects((ps) => ps.filter((p) => p.id !== id)); setTasks((ts) => ts.filter((t) => t.projectId !== id)); setDiscovery((d) => { const n = { ...d }; delete n[id]; return n; }); };
  const setInvoiceStatus = (id, status) => setProjects((ps) => ps.map((p) => { if (p.id !== id) return p; let paid = p.paid; if (status === "paid") paid = p.value; else if (status === "outstanding") paid = 0; return { ...p, invoiceStatus: status, paid, revenueRecognised: paid }; }));
  /* customers */
  const saveCustomer = (cust) => setCustomers((cs) => cs.some((c) => c.id === cust.id) ? cs.map((c) => c.id === cust.id ? cust : c) : [cust, ...cs]);
  const deleteCustomer = (id) => { const pids = projects.filter((p) => p.customerId === id).map((p) => p.id); setCustomers((cs) => cs.filter((c) => c.id !== id)); setProjects((ps) => ps.filter((p) => p.customerId !== id)); setTasks((ts) => ts.filter((t) => !pids.includes(t.projectId))); };
  /* tasks */
  const addTask = (task) => setTasks((ts) => [task, ...ts]);
  const moveTask = (id, col) => setTasks((ts) => ts.map((t) => t.id === id ? { ...t, col } : t));
  const deleteTask = (id) => setTasks((ts) => ts.filter((t) => t.id !== id));
  /* meetings */
  const addMeeting = (m) => setMeetings((ms) => [m, ...ms]);
  const updateMeeting = (id, patch) => setMeetings((ms) => ms.map((m) => m.id === id ? { ...m, ...patch } : m));
  const deleteMeeting = (id) => setMeetings((ms) => ms.filter((m) => m.id !== id));
  const taskFromMeeting = (m) => { const proj = projects.find((p) => p.customerId === m.customerId); setModal({ type: "task", preset: proj ? proj.id : "internal" }); };
  /* proposals */
  const addProposal = (q) => setProposals((qs) => [q, ...qs]);
  const setProposalStatus = (id, status) => setProposals((qs) => qs.map((q) => q.id === id ? { ...q, status } : q));
  const deleteProposal = (id) => setProposals((qs) => qs.filter((q) => q.id !== id));
  /* opportunities */
  const addOpp = (o) => setOpportunities((os) => [o, ...os]);
  const setOppStatus = (id, status) => setOpportunities((os) => os.map((o) => o.id === id ? { ...o, status } : o));
  const deleteOpp = (id) => setOpportunities((os) => os.filter((o) => o.id !== id));
  /* discovery */
  const setAnswer = (pid, i, text) => setDiscovery((d) => { const cur = d[pid] || { a: {}, pain: 0, cost: "" }; return { ...d, [pid]: { ...cur, a: { ...(cur.a || {}), [i]: text } } }; });
  const setMeta = (pid, key, val) => setDiscovery((d) => { const cur = d[pid] || { a: {}, pain: 0, cost: "" }; return { ...d, [pid]: { ...cur, [key]: val } }; });
  const addQuestion = (pid) => setDiscovery((d) => { const cur = d[pid] || { a: {}, pain: 0, cost: "" }; const qs = getQuestions(cur); return { ...d, [pid]: { ...cur, questions: [...qs, { id: "q" + Date.now(), q: "" }] } }; });
  const editQuestion = (pid, qid, text) => setDiscovery((d) => { const cur = d[pid] || { a: {}, pain: 0, cost: "" }; const qs = getQuestions(cur).map((x) => x.id === qid ? { ...x, q: text } : x); return { ...d, [pid]: { ...cur, questions: qs } }; });
  const deleteQuestion = (pid, qid) => setDiscovery((d) => { const cur = d[pid] || { a: {}, pain: 0, cost: "" }; const qs = getQuestions(cur).filter((x) => x.id !== qid); const a = { ...(cur.a || {}) }; delete a[qid]; return { ...d, [pid]: { ...cur, questions: qs, a } }; });
  const moveQuestion = (pid, qid, dir) => setDiscovery((d) => { const cur = d[pid] || { a: {}, pain: 0, cost: "" }; const qs = [...getQuestions(cur)]; const i = qs.findIndex((x) => x.id === qid); const j = i + dir; if (i < 0 || j < 0 || j >= qs.length) return d; const t = qs[i]; qs[i] = qs[j]; qs[j] = t; return { ...d, [pid]: { ...cur, questions: qs } }; });
  const addClientWithProject = ({ company, industry, projectName }) => {
    const cid = "c" + Date.now(); const pid = "p" + Date.now();
    const cust = { id: cid, company, industry: industry || "", website: "", status: "Discovery", health: "attention", contacts: { owner: "", manager: "", accounts: "", technical: "" }, services: [], notes: "" };
    const proj = { id: pid, customerId: cid, name: projectName || (company + " — Discovery"), lead: "Tatenda", health: "on", stageIdx: 1, tags: [], value: 0, paid: 0, retainer: 0, revenueRecognised: 0, invoiceStatus: "none" };
    setCustomers((cs) => [cust, ...cs]); setProjects((ps) => [proj, ...ps]);
    return pid;
  };
  const applyDiscovery = (pid) => {    const p = projects.find((x) => x.id === pid); if (!p) return { tasks: 0, opp: false, advanced: false };
    const disc = discovery[pid] || {};
    const qs = getQuestions(disc);
    const lines = qs.filter((q) => (disc.a || {})[q.id] && disc.a[q.id].trim()).map((q) => "• " + q.q + " — " + disc.a[q.id].trim());
    if (disc.pain) lines.push("• Pain score: " + disc.pain + "/10");
    if (disc.cost) lines.push("• Cost of the problem: " + disc.cost);
    if (disc.budget) lines.push("• Budget / value: " + gbp(disc.budget));
    const summary = lines.join("\n");
    setCustomers((cs) => cs.map((x) => x.id === p.customerId ? { ...x, discoverySummary: summary } : x));
    /* AI opportunity (create once, then update) */
    let oppId = disc.oppId; const hasOpp = disc.opp && disc.opp.trim();
    if (hasOpp) {
      if (oppId && opportunities.some((o) => o.id === oppId)) {
        setOpportunities((os) => os.map((o) => o.id === oppId ? { ...o, idea: disc.opp.trim(), projectValue: Number(disc.budget) || o.projectValue || 0, monthly: Number(disc.monthly) || o.monthly || 0 } : o));
      } else {
        oppId = "o" + Date.now();
        const newOpp = { id: oppId, customerId: p.customerId, idea: disc.opp.trim(), value: 4, effort: 3, risk: 2, status: "idea", estValue: disc.cost ? "From discovery" : "", projectValue: Number(disc.budget) || 0, monthly: Number(disc.monthly) || 0 };
        setOpportunities((os) => [newOpp, ...os]);
      }
    }
    /* tasks from next actions (dedup against ones already created) */
    const made = disc.madeActions || [];
    const actionLines = (disc.actions || "").split("\n").map((s) => s.trim()).filter(Boolean);
    const newLines = actionLines.filter((l) => !made.includes(l));
    if (newLines.length) { const newTasks = newLines.map((l, k) => ({ id: "t" + Date.now() + k, title: l, projectId: p.id, type: "internal", col: "todo", assignee: p.lead, due: "" })); setTasks((ts) => [...newTasks, ...ts]); }
    /* project value + stage */
    const willAdvance = p.stageIdx < 2;
    setProjects((ps) => ps.map((x) => { if (x.id !== p.id) return x; const value = (!x.value && Number(disc.budget)) ? Number(disc.budget) : x.value; return { ...x, value, stageIdx: x.stageIdx < 2 ? 2 : x.stageIdx }; }));
    setDiscovery((d) => { const cur = d[pid] || {}; return { ...d, [pid]: { ...cur, oppId, madeActions: [...made, ...newLines] } }; });
    return { tasks: newLines.length, opp: !!hasOpp, advanced: willAdvance };
  };
  /* expenses */
  const addExpense = (e) => setExpenses((es) => [e, ...es]);
  const deleteExpense = (id) => setExpenses((es) => es.filter((e) => e.id !== id));
  /* products */
  const saveProduct = (prod) => setProducts((ps) => ps.some((p) => p.id === prod.id) ? ps.map((p) => p.id === prod.id ? prod : p) : [prod, ...ps]);
  const setProductStage = (id, idx) => setProducts((ps) => ps.map((p) => p.id === id ? { ...p, stageIdx: Math.max(0, Math.min(STAGES.length - 1, idx)) } : p));
  const deleteProduct = (id) => { setProducts((ps) => ps.filter((p) => p.id !== id)); setTasks((ts) => ts.filter((t) => t.projectId !== id)); };

  if (!user) return <Login onLogin={setUser} />;

  return (
    <div className="flex min-h-screen" style={{ background: C.bg, fontFamily: FONT, color: C.text }}>
      <Sidebar view={view} setView={(v) => { setView(v); setActiveProject(null); setActiveProduct(null); }} user={user} onLogout={() => { setUser(null); setView("dashboard"); }} />
      <main className="flex-1 overflow-auto" style={{ padding: "28px 32px" }}>
        {view === "dashboard" && <Dashboard customers={customers} projects={projects} proposals={proposals} opportunities={opportunities} meetings={meetings} expenses={expenses} setView={setView} setActiveProject={setActiveProject} />}
        {view === "customers" && <Customers customers={customers} projects={projects} opportunities={opportunities} onNew={() => setModal({ type: "customer" })} onEdit={(c) => setModal({ type: "customer", data: c })} onDelete={deleteCustomer} setActiveProject={setActiveProject} setView={setView} />}
        {view === "products" && <Products products={products} tasks={tasks} activeProduct={activeProduct} setActiveProduct={setActiveProduct} onSetStage={setProductStage} onMoveTask={moveTask} onDelete={deleteProduct} onNew={() => setModal({ type: "product" })} onEdit={(p) => setModal({ type: "product", data: p })} onAddTask={(pid) => setModal({ type: "task", preset: pid })} />}
        {view === "map" && <TerritoryMap customers={customers} projects={projects} />}
        {view === "projects" && <Projects customers={customers} projects={projects} tasks={tasks} discovery={discovery} activeProject={activeProject} setActiveProject={setActiveProject} onSetStage={setStage} onMoveTask={moveTask} onDelete={deleteProject} onNew={() => setModal({ type: "project" })} onEdit={(p) => setModal({ type: "project", data: p })} onAddTask={(pid) => setModal({ type: "task", preset: pid })} setView={setView} />}
        {view === "finance" && <Finance customers={customers} projects={projects} proposals={proposals} expenses={expenses} onInvoiceStatus={setInvoiceStatus} onAddExpense={addExpense} onDeleteExpense={deleteExpense} setView={setView} />}
        {view === "tasks" && <Tasks projects={projects} products={products} tasks={tasks} onMoveTask={moveTask} onDeleteTask={deleteTask} onNew={(pid) => setModal({ type: "task", preset: pid })} />}
        {view === "meetings" && <Meetings customers={customers} meetings={meetings} onUpdate={updateMeeting} onDelete={deleteMeeting} onNew={() => setModal({ type: "meeting" })} onCreateTask={taskFromMeeting} />}
        {view === "discovery" && <Discovery customers={customers} projects={projects} discovery={discovery} onAnswer={setAnswer} onMeta={setMeta} onAddQuestion={addQuestion} onEditQuestion={editQuestion} onDeleteQuestion={deleteQuestion} onMoveQuestion={moveQuestion} onApply={applyDiscovery} onAddClient={addClientWithProject} />}
        {view === "proposals" && <Proposals customers={customers} proposals={proposals} onNew={addProposal} onStatus={setProposalStatus} onDelete={deleteProposal} />}
        {view === "ai" && <AIOpportunities customers={customers} opportunities={opportunities} onNew={addOpp} onStatus={setOppStatus} onDelete={deleteOpp} />}
        {view === "documents" && <Documents customers={customers} />}
        {view === "workflow" && <WorkflowView />}
      </main>
      {modal?.type === "project" && <ProjectModal customers={customers} project={modal.data} onClose={() => setModal(null)} onSave={saveProject} />}
      {modal?.type === "customer" && <CustomerModal customer={modal.data} onClose={() => setModal(null)} onSave={saveCustomer} />}
      {modal?.type === "task" && <TaskModal projects={projects} products={products} preset={modal.preset} onClose={() => setModal(null)} onCreate={addTask} />}
      {modal?.type === "meeting" && <MeetingModal customers={customers} onClose={() => setModal(null)} onCreate={addMeeting} />}
      {modal?.type === "product" && <ProductModal product={modal.data} onClose={() => setModal(null)} onSave={saveProduct} />}
    </div>
  );
}
