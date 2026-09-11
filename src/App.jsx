import React, { useState, useEffect, useRef } from "react";
import { supabase, supabaseConfigured } from "./supabase";
import {
  LayoutDashboard, FolderKanban, ListChecks, CalendarDays, Users, ClipboardList,
  Receipt, Sparkles, FileText, Workflow, LogOut, Plus, Clock, CircleCheck, CircleDot,
  Circle, ChevronRight, Phone, Mail, Globe, MapPin, Building2, Paperclip, Upload,
  ArrowRight, ArrowLeft, Brain, Cog, Share2, BarChart3, AlertTriangle, CheckCircle2,
  Video, X, Trash2, Target, Search, Rocket, Lightbulb, Bug, TrendingUp, PoundSterling,
  Wallet, Pencil, BookOpen, Briefcase, CalendarClock, Package, Map, Download
} from "lucide-react";

/* ===========================================================================
   KAI-TEQ — Operating System
   Clients · projects · finance · tasks · meetings · discovery · proposals · AI
   Authentication is connected to Supabase. Business data remains in browser storage until the database migration is completed.
=========================================================================== */

const C = {
  bg: "#070B18", panel: "rgba(15,20,38,0.90)", panel2: "rgba(19,26,48,0.92)", line: "#223154",
  cyan: "#00B8FF", blue: "#4169FF", purple: "#7B3CFF", orange: "#FF8A00", amber: "#FFC433",
  green: "#34D399", red: "#F87171", text: "#EAF0FF", mut: "#8A93AE", mut2: "#5E6788",
};
const GRAD = `linear-gradient(135deg, ${C.cyan} 0%, ${C.blue} 50%, ${C.purple} 100%)`;
const FONT = "Inter, 'Segoe UI', system-ui, -apple-system, sans-serif";
const STORAGE_KEY = "kai_teq_data_v5";
const LEGACY_STORAGE_KEYS = [];

const TEAM = ["Tatenda", "Kudzai"];
const FULLNAME = { Tatenda: "Tatenda Manyepa", Kudzai: "Kudzai Muriro" };
const gbp = (n) => "£" + (Number(n) || 0).toLocaleString();
const CITY_COORDS = { london: [51.5074, -0.1278], birmingham: [52.4862, -1.8904], manchester: [53.4808, -2.2426], leeds: [53.8008, -1.5491], liverpool: [53.4084, -2.9916], bristol: [51.4545, -2.5879], sheffield: [53.3811, -1.4701], newcastle: [54.9783, -1.6178], nottingham: [52.9548, -1.1581], leicester: [52.6369, -1.1398], cardiff: [51.4816, -3.1791], glasgow: [55.8642, -4.2518], edinburgh: [55.9533, -3.1883], belfast: [54.5973, -5.9301], southampton: [50.9097, -1.4044], reading: [51.4543, -0.9781], brighton: [50.8225, -0.1372], oxford: [51.7520, -1.2577], cambridge: [52.2053, 0.1218], coventry: [52.4068, -1.5197], derby: [52.9225, -1.4746] };
function coordsOf(c) { if (c && typeof c.lat === "number" && typeof c.lng === "number" && (c.lat || c.lng)) return [c.lat, c.lng]; const k = ((c && c.city) || "").trim().toLowerCase(); if (CITY_COORDS[k]) return CITY_COORDS[k]; return null; }
function csvCell(x) { const s = String(x == null ? "" : x); const QQ = String.fromCharCode(34); if (s.indexOf(",") >= 0 || s.indexOf(QQ) >= 0) return QQ + s.split(QQ).join(QQ + QQ) + QQ; return s; }
function downloadCSV(filename, rows) { const NL = String.fromCharCode(10); const csv = rows.map((r) => r.map(csvCell).join(",")).join(NL); const blob = new Blob([csv], { type: "text/csv" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = filename; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
function meetingWhen(m) {
  if (m.start) { const d = new Date(m.start); if (!Number.isNaN(d.getTime())) return d.toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }); }
  return m.when || "—";
}
function downloadMeetingICS(m, customerName) {
  const start = m.start ? new Date(m.start) : null; if (!start || Number.isNaN(start.getTime())) return;
  const end = m.end ? new Date(m.end) : new Date(start.getTime() + 3600000);
  const fmt = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const esc = (v) => String(v || "").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
  const lines = ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//KAI-TEQ//Customer Calendar//EN","BEGIN:VEVENT",`UID:${m.id}@kai-teq`,`DTSTAMP:${fmt(new Date())}`,`DTSTART:${fmt(start)}`,`DTEND:${fmt(end)}`,`SUMMARY:${esc(m.title)}`,`DESCRIPTION:${esc(`KAI-TEQ customer meeting — ${customerName}`)}`,`LOCATION:${esc(m.location || "")}`,"END:VEVENT","END:VCALENDAR"];
  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `${m.title.replace(/[^a-z0-9]+/gi,"-").replace(/^-|-$/g,"") || "meeting"}.ics`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}

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
const PROJECT_STATUS = [
  { key: "planned", label: "Planned", color: C.mut },
  { key: "active", label: "Active", color: C.green },
  { key: "hold", label: "On hold", color: C.amber },
  { key: "maintenance", label: "Maintenance & Support", color: C.purple },
  { key: "archived", label: "Archived", color: C.mut2 },
];
const EXPENSE_CATEGORIES = ["Software / Hosting", "Domain", "Contractor", "AI / API", "Travel", "Equipment", "Marketing", "Other"];
const projectStatus = (p) => PROJECT_STATUS.find((x) => x.key === (p.lifecycle || "active")) || PROJECT_STATUS[1];
const projectCosts = (expenses, pid) => expenses.filter((e) => e.projectId === pid).reduce((a, e) => a + (Number(e.amount) || 0), 0);
const projectProfit = (p, expenses) => (Number(p.revenueRecognised) || 0) - projectCosts(expenses, p.id);
const projectMargin = (p, expenses) => { const r = Number(p.revenueRecognised) || 0; return r > 0 ? (projectProfit(p, expenses) / r) * 100 : 0; };
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
  { id: "c1", company: "New Leaf Oasis", industry: "Care / Supported Living", website: "newleafoasis.co.uk", status: "Active", health: "healthy", source: "Referral", city: "", postcode: "", country: "United Kingdom", lat: "", lng: "", contacts: { owner: "", manager: "", accounts: "", technical: "" }, services: ["Website"], notes: "First KAI-TEQ website customer. Add contacts, location and account notes as needed." },
];
const seedProjects = [
  { id: "p1", customerId: "c1", name: "New Leaf Oasis Website", lead: "Tatenda", health: "on", stageIdx: 7, tags: ["Website"], value: 0, paid: 0, retainer: 0, revenueRecognised: 0, invoiceStatus: "none", lifecycle: "archived" },
];
const seedTasks = [];
const seedMeetings = [];
const seedProposals = [];
const seedOpps = [];
const seedDiscovery = {};
const seedExpenses = [];
const seedDocs = [
  { id: "d1", name: "Master Services Agreement.docx", cat: "Internal" },
  { id: "d2", name: "Project proposal template.docx", cat: "Internal" },
  { id: "d3", name: "Discovery call script.pdf", cat: "Internal" },
  { id: "d4", name: "SOW template.docx", cat: "Internal" },
  { id: "d5", name: "Brand guidelines.pdf", cat: "Internal" },
];
const clientDocs = { c1: [] };

const seedProducts = [];
const PRODUCT_STATUS = [
  { key: "idea", label: "Idea", color: C.mut }, { key: "build", label: "In Build", color: C.cyan },
  { key: "live", label: "Live", color: C.green }, { key: "paused", label: "Paused", color: C.amber },
];

/* ----- persistence ----- */
function loadData() {
  const def = { customers: seedCustomers, projects: seedProjects, products: seedProducts, tasks: seedTasks, meetings: seedMeetings,
    proposals: seedProposals, opportunities: seedOpps, discovery: seedDiscovery, expenses: seedExpenses };
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      for (const key of LEGACY_STORAGE_KEYS) { const legacy = localStorage.getItem(key); if (legacy) { raw = legacy; break; } }
    }
    if (raw) {
      const d = JSON.parse(raw);
      const migratedProjects = (d.projects || def.projects).map((p) => ({ ...p, lifecycle: p.lifecycle || (p.stageIdx === STAGES.length - 1 ? "maintenance" : "active") }));
      const migratedExpenses = (d.expenses || def.expenses).map((e) => ({ category: "Other", projectId: "", customerId: "", ...e }));
      return { ...def, ...d, projects: migratedProjects, expenses: migratedExpenses };
    }
  } catch (e) {}
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
  return (<div className="flex items-center" style={{ gap: Math.round(size * 0.16) }}>
    <KMark size={size} />
    <span style={{ letterSpacing: "0.22em", fontWeight: 600, color: C.text, fontSize: size }}>AI-TEQ</span></div>);
}
function FuturisticBackdrop({ strong = false }) {
  const opacity = strong ? 0.85 : 0.42;
  return (<div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0, opacity }}>
    <div style={{ position: "absolute", inset: 0, background: strong
      ? "radial-gradient(900px 560px at 12% 18%, rgba(0,184,255,0.13), transparent 62%), radial-gradient(760px 600px at 82% 78%, rgba(123,60,255,0.16), transparent 65%), radial-gradient(520px 420px at 58% 46%, rgba(65,105,255,0.07), transparent 68%)"
      : "radial-gradient(760px 520px at 88% 8%, rgba(0,184,255,0.055), transparent 64%), radial-gradient(700px 520px at 22% 92%, rgba(123,60,255,0.055), transparent 66%)" }} />
    <svg viewBox="0 0 1600 1000" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
      <defs>
        <linearGradient id={strong ? "kaiLineStrong" : "kaiLineSoft"} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00B8FF" stopOpacity={strong ? "0.34" : "0.13"}/><stop offset="55%" stopColor="#4169FF" stopOpacity={strong ? "0.5" : "0.17"}/><stop offset="100%" stopColor="#7B3CFF" stopOpacity={strong ? "0.42" : "0.12"}/>
        </linearGradient>
        <radialGradient id={strong ? "nodeStrong" : "nodeSoft"}><stop offset="0%" stopColor="#DDF7FF"/><stop offset="25%" stopColor="#00B8FF"/><stop offset="100%" stopColor="#00B8FF" stopOpacity="0"/></radialGradient>
      </defs>
      <g fill="none" stroke={`url(#${strong ? "kaiLineStrong" : "kaiLineSoft"})`} strokeWidth={strong ? "1.4" : "0.9"}>
        <path d="M-80 830 C240 650 350 760 610 585 S1010 330 1690 530"/>
        <path d="M-40 250 C310 70 440 410 760 300 S1190 105 1650 250"/>
        <path d="M80 1030 C420 760 655 820 900 650 S1240 540 1610 715"/>
        <path d="M210 -50 C310 270 610 325 795 500 S1100 705 1500 910"/>
        <path d="M1480 -50 C1250 230 1320 470 1110 635 S710 840 380 1030"/>
      </g>
      {(strong ? [[180,205],[412,350],[638,570],[986,398],[1250,630],[1440,740],[760,300],[1110,635]] : [[412,350],[986,398],[1250,630]]).map(([cx,cy],i)=><circle key={i} cx={cx} cy={cy} r={strong ? 16 : 9} fill={`url(#${strong ? "nodeStrong" : "nodeSoft"})`} opacity={strong ? "0.65" : "0.28"}/>)}
    </svg>
    <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)", backgroundSize: strong ? "72px 72px" : "88px 88px", maskImage: "linear-gradient(to bottom, rgba(0,0,0,.75), transparent 88%)" }} />
  </div>);
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
function Card({ children, style, className = "" }) { return (<div className={"rounded-xl " + className} style={{ background: "linear-gradient(145deg, rgba(15,20,38,.94), rgba(12,17,32,.91))", border: `1px solid ${C.line}`, boxShadow: "inset 0 1px 0 rgba(255,255,255,.018), 0 12px 34px rgba(0,0,0,.10)", backdropFilter: "blur(10px)", ...style }}>{children}</div>); }
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
const projName = (projects, id) => id === "internal" ? "Internal / KAI-TEQ" : (projects.find((p) => p.id === id)?.name || "—");

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

function userLabelFromEmail(email = "") {
  const e = email.toLowerCase();
  if (e === "kudzai.muriro@kai-teq.com") return "Kudzai";
  if (e === "tatenda.manyepa@kai-teq.com") return "Tatenda";
  const first = e.split("@")[0].split(".")[0] || "User";
  return first.charAt(0).toUpperCase() + first.slice(1);
}

function AuthLoading() {
  return <div className="min-h-screen relative overflow-hidden flex items-center justify-center" style={{ background: C.bg, fontFamily: FONT, color: C.text }}>
    <FuturisticBackdrop strong />
    <div className="relative text-center" style={{ zIndex: 1 }}><Wordmark size={30} /><div style={{ color: C.mut, fontSize: 12, marginTop: 18, letterSpacing: ".08em" }}>OPENING YOUR KAI-TEQ WORKSPACE…</div></div>
  </div>;
}

/* --------------------------- Login --------------------------- */
function Login({ onLogin }) {
  const [email, setEmail] = useState(""); const [pw, setPw] = useState(""); const [err, setErr] = useState(""); const [loading, setLoading] = useState(false);
  const submit = async () => {
    if (!email || !pw) { setErr("Enter your email and password to continue."); return; }
    if (!supabaseConfigured || !supabase) { setErr("Authentication is not configured yet. Please contact the KAI-TEQ administrator."); return; }
    setErr(""); setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: pw });
    setLoading(false);
    if (error) { setErr("Email or password is incorrect."); return; }
    if (data?.user) onLogin(userLabelFromEmail(data.user.email));
  };
  return (<div className="min-h-screen relative overflow-hidden" style={{ background: C.bg, fontFamily: FONT, color: C.text }}>
    <FuturisticBackdrop strong />
    <div className="relative min-h-screen flex items-center" style={{ zIndex: 1 }}>
      <div className="w-full mx-auto grid lg:grid-cols-2 gap-12 items-center px-6 sm:px-10 lg:px-16 py-10" style={{ maxWidth: 1320 }}>
        <section className="hidden lg:block" style={{ maxWidth: 520 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "6px 10px", border: `1px solid rgba(0,184,255,.22)`, borderRadius: 999, color: C.cyan, fontSize: 10.5, letterSpacing: ".16em", background: "rgba(0,184,255,.045)" }}>KAI-TEQ OPERATING SYSTEM</div>
          <h1 style={{ fontSize: 54, lineHeight: 1.02, letterSpacing: "-0.035em", fontWeight: 650, marginTop: 24 }}>From Ideas to <span style={{ background: GRAD, WebkitBackgroundClip: "text", color: "transparent" }}>Impact.</span></h1>
          <p style={{ color: C.mut, fontSize: 16, lineHeight: 1.75, maxWidth: 440, marginTop: 18 }}>Customers, projects, finances and workflows connected in one place to help KAI-TEQ operate smarter, move faster and scale with confidence.</p>
          <div className="grid grid-cols-3 gap-3 mt-9" style={{ maxWidth: 470 }}>
            {[['01','OPERATE','Everything connected'],['02','AUTOMATE','Less manual work'],['03','SCALE','Built for growth']].map(([n,a,b])=><div key={n} style={{ padding: "14px 14px 13px", borderTop: `1px solid ${C.line}`, background: "linear-gradient(180deg, rgba(255,255,255,.025), transparent)" }}><div style={{ color: C.cyan, fontSize: 9, letterSpacing: ".16em" }}>{n}</div><div style={{ fontSize: 11, letterSpacing: ".12em", marginTop: 8 }}>{a}</div><div style={{ color: C.mut2, fontSize: 10.5, marginTop: 4 }}>{b}</div></div>)}
          </div>
        </section>
        <section className="w-full" style={{ maxWidth: 490, justifySelf: "center" }}>
          <div className="rounded-2xl p-8 sm:p-10 relative" style={{ background: "linear-gradient(180deg, rgba(15,20,38,.92), rgba(11,15,30,.95))", border: `1px solid rgba(65,105,255,.28)`, boxShadow: "0 32px 90px rgba(0,0,0,.48), 0 0 70px rgba(65,105,255,.08)", backdropFilter: "blur(18px)" }}>
            <div style={{ position: "absolute", width: 120, height: 2, left: 32, top: -1, background: GRAD, borderRadius: 2 }} />
            <div className="flex flex-col items-center text-center mb-8"><Wordmark size={31} />
              <div style={{ letterSpacing: "0.20em", fontSize: 10, color: C.cyan, marginTop: 14 }}>INTELLIGENT WORK. POWERED BY AI.</div></div>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Welcome back</div>
            <div style={{ color: C.mut2, fontSize: 12, marginBottom: 22 }}>Sign in to your KAI-TEQ workspace</div>
            <label style={{ fontSize: 12, color: C.mut }}>Work email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="firstname.lastname@kai-teq.com" className="w-full rounded-lg px-3 py-3 mt-1.5 mb-4 outline-none" style={{ background: "rgba(19,26,48,.82)", border: `1px solid ${C.line}`, color: C.text, fontSize: 14, boxShadow: "inset 0 1px 0 rgba(255,255,255,.025)" }} />
            <label style={{ fontSize: 12, color: C.mut }}>Password</label>
            <input value={pw} type="password" onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="••••••••" className="w-full rounded-lg px-3 py-3 mt-1.5 outline-none" style={{ background: "rgba(19,26,48,.82)", border: `1px solid ${C.line}`, color: C.text, fontSize: 14 }} />
            {err && <div style={{ color: C.orange, fontSize: 12, marginTop: 10 }}>{err}</div>}
            <button onClick={submit} disabled={loading} className="w-full rounded-lg py-3 mt-6 font-semibold" style={{ background: GRAD, color: "#fff", fontSize: 14, boxShadow: "0 10px 30px rgba(65,105,255,.20)", opacity: loading ? .72 : 1, cursor: loading ? "wait" : "pointer" }}>{loading ? "Signing in…" : <>Sign in <span style={{ marginLeft: 5 }}>→</span></>}</button>
            <div style={{ minHeight: 22 }} />
          </div>
          <div className="flex items-center justify-center gap-3 mt-6" style={{ color: C.mut2, fontSize: 9.5, letterSpacing: ".15em" }}><span>PLAN</span><span style={{color:C.cyan}}>•</span><span>AUTOMATE</span><span style={{color:C.blue}}>•</span><span>DELIVER</span><span style={{color:C.purple}}>•</span><span>GROW</span></div>
        </section>
      </div>
    </div>
  </div>);
}

/* --------------------------- Sidebar --------------------------- */
const NAV = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "customers", label: "Customers", icon: Users },
  { key: "projects", label: "Projects", icon: FolderKanban },
  { key: "tasks", label: "Tasks", icon: ListChecks },
  { key: "meetings", label: "Calendar", icon: CalendarDays },
  { key: "finance", label: "Finance", icon: PoundSterling },
  { key: "products", label: "Internal Products", icon: Package },
  { key: "map", label: "Map", icon: Map },
  { key: "workflow", label: "Workflow", icon: Workflow },
];
function Sidebar({ view, setView, user, onLogout }) {
  return (<aside className="flex flex-col justify-between relative" style={{ width: 232, background: "linear-gradient(180deg, rgba(15,20,38,.97), rgba(9,14,28,.96))", borderRight: `1px solid ${C.line}`, padding: 18, flexShrink: 0, boxShadow: "18px 0 50px rgba(0,0,0,.12)", zIndex: 2 }}>
    <div><div className="mb-6 px-1"><Wordmark /></div>
      <nav className="flex flex-col gap-0.5">{NAV.map((n) => { const active = view === n.key, Icon = n.icon;
        return (<button key={n.key} onClick={() => setView(n.key)} className="flex items-center gap-3 rounded-lg px-3 py-2 text-left" style={{ color: active ? "#fff" : C.mut, background: active ? "rgba(65,105,255,0.14)" : "transparent", fontSize: 13.5, fontWeight: active ? 600 : 500 }}><Icon size={17} style={{ color: active ? C.cyan : C.mut2 }} />{n.label}</button>); })}</nav></div>
    <div><div className="flex items-center gap-3 rounded-lg px-3 py-2.5 mb-2" style={{ background: C.panel2 }}><Avatar name={user} /><div style={{ lineHeight: 1.2 }}><div style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>{FULLNAME[user]}</div><div style={{ fontSize: 11, color: C.mut2 }}>Founder</div></div></div>
      <button onClick={onLogout} className="flex items-center gap-2 px-3 py-2 rounded-lg w-full" style={{ color: C.mut, fontSize: 13 }}><LogOut size={16} /> Sign out</button></div></aside>);
}

/* --------------------------- Dashboard --------------------------- */
function Dashboard({ customers, projects, proposals, opportunities, meetings, expenses, setView, setActiveProject }) {
  const revenue = projects.reduce((a, p) => a + (Number(p.revenueRecognised) || 0), 0);
  const outstanding = projects.reduce((a, p) => a + Math.max(0, (Number(p.value) || 0) - (Number(p.paid) || 0)), 0);
  const recurring = projects.filter((p) => p.lifecycle === "maintenance").reduce((a, p) => a + (Number(p.retainer) || 0), 0);
  const costs = expenses.reduce((a, e) => a + (Number(e.amount) || 0), 0);
  const profit = revenue - costs;
  const active = projects.filter((p) => (p.lifecycle || "active") !== "archived");
  const stats = [
    { label: "Revenue recognised", value: gbp(revenue), accent: C.green },
    { label: "Costs", value: gbp(costs), accent: C.amber },
    { label: "Profit", value: gbp(profit), accent: C.cyan },
    { label: "Outstanding", value: gbp(outstanding), accent: C.orange },
    { label: "Recurring / mo", value: gbp(recurring), accent: C.purple },
  ];
  return (<div><Topbar title="Dashboard" sub="KAI-TEQ at a glance — delivery, cash and customer activity." />
    <div className="grid grid-cols-5 gap-3 mb-6">{stats.map((x) => <Stat key={x.label} {...x} />)}</div>
    <div className="grid grid-cols-3 gap-5">
      <div className="col-span-2">
        <div className="flex items-center justify-between mb-3"><h2 style={{ fontSize: 15, fontWeight: 600, color: C.text }}>Active engagements</h2><button onClick={() => setView("projects")} style={{ fontSize: 12, color: C.cyan }}>View all</button></div>
        <div className="flex flex-col gap-3">{active.map((p) => { const st = projectStatus(p); const cost = projectCosts(expenses, p.id); return (<Card key={p.id} className="cursor-pointer" style={{ padding: 16 }}><div onClick={() => { setActiveProject(p.id); setView("projects"); }}>
          <div className="flex items-center justify-between mb-1"><div className="flex items-center gap-2"><span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{p.name}</span><Chip label={st.label} color={st.color} /><HealthPill health={p.health} /></div><span style={{ fontSize: 12, color: C.mut }}>{custName(customers, p.customerId)}</span></div>
          <div className="flex items-center justify-between mb-3" style={{ fontSize: 12, color: C.mut2 }}><span>{STAGES[p.stageIdx].name} · {p.value ? gbp(p.value) : "Pre-sales"}</span><span>{gbp(p.revenueRecognised)} revenue · {gbp(cost)} cost · {gbp(projectProfit(p, expenses))} profit</span></div>
          <Pipeline stageIdx={p.stageIdx} compact /></div></Card>); })}{active.length === 0 && <Card style={{padding:16}}><span style={{color:C.mut}}>No active engagements.</span></Card>}</div></div>
      <div><h2 style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 12 }}>Upcoming meetings</h2>
        <div className="flex flex-col gap-2 mb-5">{meetings.slice(0, 4).map((m) => (<Card key={m.id} style={{ padding: 12 }}><div className="flex items-center gap-2 mb-1"><Video size={14} style={{ color: C.cyan }} /><span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{m.title}</span></div><div style={{ fontSize: 12, color: C.mut }}>{custName(customers, m.customerId)}</div><div className="flex items-center gap-1 mt-1" style={{ fontSize: 11, color: C.mut2 }}><Clock size={11} /> {meetingWhen(m)}</div></Card>))}{meetings.length === 0 && <Card style={{ padding: 14 }}><span style={{ fontSize: 12, color: C.mut2 }}>No meetings scheduled.</span></Card>}</div>
        <Card style={{padding:14, background:C.panel2}}><div style={{fontSize:12,fontWeight:600,color:C.text}}>Business pulse</div><div style={{fontSize:11.5,color:C.mut,marginTop:6,lineHeight:1.5}}>{customers.length} customers · {active.length} live engagements · {projects.filter(p=>p.lifecycle==="maintenance").length} in maintenance & support.</div></Card>
      </div></div></div>);
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
      <Field label="City / town"><input style={inputStyle} value={f.city || ""} onChange={(e) => set("city", e.target.value)} placeholder="e.g. Derby" /></Field>
      <Field label="Postcode"><input style={inputStyle} value={f.postcode || ""} onChange={(e) => set("postcode", e.target.value)} placeholder="e.g. DE1" /></Field>
      <Field label="Country"><input style={inputStyle} value={f.country || "United Kingdom"} onChange={(e) => set("country", e.target.value)} /></Field>
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
function Customers({ customers, projects, tasks, meetings, proposals, opportunities = [], discovery, expenses, onNew, onEdit, onDelete, setActiveProject, setView, activeCustomer, setActiveCustomer, onScheduleMeeting }) {
  const openId = activeCustomer; const setOpenId = setActiveCustomer;
  const [tab, setTab] = useState("overview");
  const c = customers.find((x) => x.id === openId);
  const custProjects = (id) => projects.filter((p) => p.customerId === id);
  if (c) {
    const ps = custProjects(c.id); const pids = ps.map((p) => p.id);
    const cms = meetings.filter((m) => m.customerId === c.id);
    const qs = proposals.filter((q) => q.customerId === c.id);
    const opps = opportunities.filter((o) => o.customerId === c.id);
    const cTasks = tasks.filter((t) => pids.includes(t.projectId));
    const cExpenses = expenses.filter((e) => e.customerId === c.id || pids.includes(e.projectId));
    const revenue = ps.reduce((a,p)=>a+(Number(p.revenueRecognised)||0),0);
    const costs = cExpenses.reduce((a,e)=>a+(Number(e.amount)||0),0);
    const profit = revenue-costs;
    const recurring = ps.filter(p=>p.lifecycle==="maintenance").reduce((a,p)=>a+(Number(p.retainer)||0),0);
    const tabs = [["overview","Overview"],["delivery","Projects & Tasks"],["activity","Activity"],["commercial","Commercial"],["growth","Discovery & AI"],["docs","Documents"]];
    return (<div>
      <button onClick={() => { setOpenId(null); setTab("overview"); }} className="flex items-center gap-1 mb-4" style={{ color: C.mut, fontSize: 13 }}><ChevronRight size={14} style={{ transform: "rotate(180deg)" }} /> All customers</button>
      <div className="flex items-start justify-between mb-5"><div><div className="flex items-center gap-3"><h1 style={{ fontSize: 22, fontWeight: 600, color: C.text }}>{c.company}</h1><Chip label={c.status} color={C.cyan} /></div><div className="flex items-center gap-3 mt-1" style={{ fontSize: 13, color: C.mut }}><Briefcase size={14} /> {c.industry || "—"} · <RelHealth h={c.health} />{c.city ? <span className="flex items-center gap-1"> · <MapPin size={13} /> {c.city}</span> : null}</div></div>
        <div className="flex gap-2"><Btn onClick={() => onEdit(c)}><Pencil size={14} /> Edit</Btn><button onClick={() => { const message=`Delete ${c.company}? This permanently removes the customer and all linked projects, tasks, meetings, proposals, discovery, AI opportunities and project costs.`; if(window.confirm(message)){ onDelete(c.id); setOpenId(null); } }} className="flex items-center gap-2 rounded-lg px-3 py-2" style={{background:C.panel2,color:C.red,border:`1px solid ${C.line}`,fontSize:12}}><Trash2 size={14}/> Delete</button></div></div>
      <div className="grid grid-cols-5 gap-3 mb-5"><Stat label="Lifetime revenue" value={gbp(revenue)} accent={C.green}/><Stat label="Costs" value={gbp(costs)} accent={C.amber}/><Stat label="Profit" value={gbp(profit)} accent={C.cyan}/><Stat label="Projects" value={ps.length} accent={C.blue}/><Stat label="Recurring / mo" value={gbp(recurring)} accent={C.purple}/></div>
      <div className="flex gap-2 mb-5 flex-wrap">{tabs.map(([k,l])=><button key={k} onClick={()=>setTab(k)} className="rounded-lg px-3 py-2" style={{fontSize:12,fontWeight:600,color:tab===k?"#fff":C.mut,background:tab===k?"rgba(65,105,255,.18)":C.panel2,border:`1px solid ${tab===k?C.blue:C.line}`}}>{l}</button>)}</div>
      {tab==="overview" && <div className="grid grid-cols-3 gap-5"><Card style={{padding:18}}><h3 style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:12}}>Customer profile</h3>{[["Website",c.website],["Location",[c.city,c.postcode,c.country].filter(Boolean).join(", ")],["Source",c.source],["Owner",c.contacts?.owner],["Manager",c.contacts?.manager],["Accounts",c.contacts?.accounts],["Technical",c.contacts?.technical]].map(([k,v])=><div key={k} className="flex justify-between mb-2.5" style={{fontSize:12.5}}><span style={{color:C.mut2}}>{k}</span><span style={{color:C.text,textAlign:"right"}}>{v||"—"}</span></div>)}<div className="mt-3 pt-3" style={{borderTop:`1px solid ${C.line}`}}><div style={{fontSize:12,color:C.mut2,marginBottom:6}}>Services</div><div className="flex flex-wrap gap-1.5">{(c.services||[]).map(x=><Chip key={x} label={x} color={C.cyan}/>)}</div></div></Card>
        <Card className="col-span-2" style={{padding:18}}><h3 style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:8}}>Account summary</h3><p style={{fontSize:13,color:C.mut,lineHeight:1.6}}>{c.notes||"No account notes yet."}</p>{c.discoverySummary&&<><h3 style={{fontSize:13,fontWeight:600,color:C.text,margin:"18px 0 8px"}}>Discovery summary</h3><div className="rounded-lg p-3" style={{background:C.panel2,border:`1px solid ${C.line}`,fontSize:12.5,color:C.mut,lineHeight:1.6,whiteSpace:"pre-wrap"}}>{c.discoverySummary}</div></>}</Card></div>}
      {tab==="delivery" && <div><h3 style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:10}}>Projects</h3><div className="flex flex-col gap-2 mb-5">{ps.map(p=>{const st=projectStatus(p); return <Card key={p.id} className="cursor-pointer" style={{padding:14}}><div onClick={()=>{setActiveProject(p.id);setView("projects")}} className="flex items-center justify-between"><div><div className="flex items-center gap-2"><span style={{fontSize:13.5,fontWeight:600,color:C.text}}>{p.name}</span><Chip label={st.label} color={st.color}/></div><div style={{fontSize:11.5,color:C.mut,marginTop:4}}>{STAGES[p.stageIdx].name} · {cTasks.filter(t=>t.projectId===p.id&&t.col!=="done").length} open tasks</div></div><span style={{fontSize:12,color:C.cyan}}>{gbp(p.revenueRecognised)} recognised →</span></div></Card>})}{!ps.length&&<Card style={{padding:14}}><span style={{color:C.mut}}>No projects yet.</span></Card>}</div></div>}
      {tab==="activity" && <div className="grid grid-cols-2 gap-4"><Card style={{padding:18}}><div className="flex items-center justify-between mb-3"><h3 style={{fontSize:13,fontWeight:600,color:C.text}}>Meetings</h3><button onClick={()=>onScheduleMeeting(c.id)} style={{fontSize:11.5,color:C.cyan}}><Plus size={12} style={{display:"inline"}}/> Schedule</button></div><div className="flex flex-col gap-2">{cms.map(m=><div key={m.id} className="rounded-lg p-3" style={{background:C.panel2,border:`1px solid ${C.line}`}}><div style={{fontSize:13,color:C.text,fontWeight:600}}>{m.title}</div><div style={{fontSize:11.5,color:C.mut,marginTop:4}}>{m.type} · {meetingWhen(m)} · {m.lead}{m.location ? ` · ${m.location}` : ""}</div></div>)}{!cms.length&&<span style={{fontSize:12,color:C.mut2}}>No meetings yet.</span>}</div></Card><Card style={{padding:18}}><h3 style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:12}}>Open actions</h3><div className="flex flex-col gap-2">{cTasks.filter(t=>t.col!=="done").slice(0,12).map(t=><div key={t.id} className="rounded-lg p-3" style={{background:C.panel2,border:`1px solid ${C.line}`}}><div style={{fontSize:12.5,color:C.text}}>{t.title}</div><div style={{fontSize:11,color:C.mut2,marginTop:3}}>{projName(projects,t.projectId)} · {t.assignee}</div></div>)}{!cTasks.filter(t=>t.col!=="done").length&&<span style={{fontSize:12,color:C.mut2}}>No open actions.</span>}</div></Card></div>}
      {tab==="commercial" && <div className="grid grid-cols-2 gap-4"><Card style={{padding:18}}><h3 style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:12}}>Project profitability</h3>{ps.map(p=><div key={p.id} className="rounded-lg p-3 mb-2" style={{background:C.panel2,border:`1px solid ${C.line}`}}><div className="flex justify-between"><span style={{fontSize:12.5,color:C.text,fontWeight:600}}>{p.name}</span><span style={{fontSize:12,color:projectProfit(p,expenses)>=0?C.green:C.red}}>{gbp(projectProfit(p,expenses))} profit</span></div><div style={{fontSize:11,color:C.mut2,marginTop:4}}>{gbp(p.revenueRecognised)} revenue · {gbp(projectCosts(expenses,p.id))} costs · {projectMargin(p,expenses).toFixed(1)}% margin</div></div>)}</Card><Card style={{padding:18}}><h3 style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:12}}>Proposals / quotations</h3>{qs.map(q=><div key={q.id} className="flex justify-between rounded-lg p-3 mb-2" style={{background:C.panel2,border:`1px solid ${C.line}`}}><div><div style={{fontSize:12.5,color:C.text}}>{q.title}</div><div style={{fontSize:11,color:C.mut2,marginTop:3}}>{(PROPOSAL_STATUS.find(s=>s.key===q.status)||{}).label}</div></div><span style={{fontSize:12.5,color:C.green}}>{gbp(q.value)}</span></div>)}{!qs.length&&<span style={{fontSize:12,color:C.mut2}}>No proposals yet.</span>}</Card></div>}
      {tab==="growth" && <div className="grid grid-cols-2 gap-4"><Card style={{padding:18}}><h3 style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:12}}>AI & automation opportunities</h3>{opps.map(o=><div key={o.id} className="rounded-lg p-3 mb-2" style={{background:C.panel2,border:`1px solid ${C.line}`}}><div className="flex justify-between gap-3"><span style={{fontSize:12.5,color:C.text}}>{o.idea}</span><PriorityPill o={o}/></div>{o.estValue&&<div style={{fontSize:11,color:C.green,marginTop:5}}>{o.estValue}</div>}</div>)}{!opps.length&&<span style={{fontSize:12,color:C.mut2}}>No AI opportunities yet.</span>}</Card><Card style={{padding:18}}><h3 style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:12}}>Discovery by project</h3>{ps.map(p=>{const d=discovery[p.id];const answered=d?Object.values(d.a||{}).filter(v=>v&&String(v).trim()).length:0;return <div key={p.id} className="rounded-lg p-3 mb-2" style={{background:C.panel2,border:`1px solid ${C.line}`}}><div style={{fontSize:12.5,color:C.text,fontWeight:600}}>{p.name}</div><div style={{fontSize:11,color:C.mut2,marginTop:4}}>{answered}/{getQuestions(d).length} questions captured{d?.pain?` · pain ${d.pain}/10`:""}</div></div>})}</Card></div>}
      {tab==="docs" && <div><Card style={{padding:18}}><div className="flex items-center justify-between mb-12"><div><h3 style={{fontSize:13,fontWeight:600,color:C.text}}>Customer documents</h3><p style={{fontSize:12,color:C.mut,marginTop:4}}>Kept inside the customer record to avoid a separate fragmented document area.</p></div><Btn><Upload size={14}/> Upload</Btn></div><div className="grid grid-cols-3 gap-3">{(clientDocs[c.id]||[]).map(d=><div key={d} className="flex items-center gap-2 rounded-lg p-3" style={{background:C.panel2,border:`1px solid ${C.line}`}}><Paperclip size={13} style={{color:C.purple}}/><span style={{fontSize:12.5,color:C.text}}>{d}</span></div>)}{!(clientDocs[c.id]||[]).length&&<span style={{fontSize:12,color:C.mut2}}>No documents yet.</span>}</div></Card></div>}
    </div>);
  }
  return (<div><Topbar title="Customers" sub="One 360° record per customer — delivery, activity, commercial history and growth opportunities." action={<Btn primary onClick={onNew}><Plus size={15}/> Add customer</Btn>}/><div className="grid grid-cols-3 gap-4">{customers.map(c=>{const ps=custProjects(c.id);const rev=ps.reduce((a,p)=>a+(Number(p.revenueRecognised)||0),0);const cost=expenses.filter(e=>e.customerId===c.id||ps.some(p=>p.id===e.projectId)).reduce((a,e)=>a+(Number(e.amount)||0),0);return <Card key={c.id} className="cursor-pointer" style={{padding:18}}><div onClick={()=>setOpenId(c.id)}><div className="flex items-center gap-3 mb-3"><div className="flex items-center justify-center rounded-lg" style={{width:40,height:40,background:GRAD,color:"#fff",fontWeight:700}}>{c.company.slice(0,1)}</div><div><div style={{fontSize:14,fontWeight:600,color:C.text}}>{c.company}</div><div style={{fontSize:12,color:C.mut}}>{c.industry}</div></div></div><div className="flex items-center justify-between mb-2"><Chip label={c.status} color={C.cyan}/><RelHealth h={c.health}/></div><div className="flex items-center justify-between" style={{fontSize:12,color:C.mut2}}><span>{ps.length} projects · {gbp(rev-cost)} profit</span><span className="flex items-center gap-1" style={{color:C.cyan}}>Open 360° <ChevronRight size={13}/></span></div></div></Card>})}</div></div>);
}

/* --------------------------- Projects --------------------------- */
function ProjectModal({ customers, project, onClose, onSave }) {
  const [f, setF] = useState(project || { id: "p" + Date.now(), customerId: customers[0]?.id || "", name: "", lead: "Tatenda", health: "on", stageIdx: 0, lifecycle: "planned", tags: [], value: 0, paid: 0, retainer: 0, revenueRecognised: 0, invoiceStatus: "none" });
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const save = () => { if (!f.name.trim() || !f.customerId) return; onSave({ ...f, name:f.name.trim(), value:Number(f.value)||0, paid:Number(f.paid)||0, retainer:Number(f.retainer)||0, revenueRecognised:Number(f.revenueRecognised)||0, stageIdx:Number(f.stageIdx), lifecycle:f.lifecycle||"active", tags:Array.isArray(f.tags)?f.tags:String(f.tags).split(",").map(t=>t.trim()).filter(Boolean) }); onClose(); };
  const tagsStr=Array.isArray(f.tags)?f.tags.join(", "):f.tags;
  return (<Modal wide title={project?"Edit project":"New project"} onClose={onClose} onSave={save} saveLabel={project?"Save project":"Create project"}>
    <div className="grid grid-cols-2 gap-3"><Field label="Project name"><input style={inputStyle} value={f.name} onChange={e=>set("name",e.target.value)}/></Field><Field label="Customer"><select style={inputStyle} value={f.customerId} onChange={e=>set("customerId",e.target.value)}>{customers.map(c=><option key={c.id} value={c.id}>{c.company}</option>)}</select></Field><Field label="Lead"><select style={inputStyle} value={f.lead} onChange={e=>set("lead",e.target.value)}>{TEAM.map(t=><option key={t}>{t}</option>)}</select></Field><Field label="Delivery stage"><select style={inputStyle} value={f.stageIdx} onChange={e=>set("stageIdx",e.target.value)}>{STAGES.map((x,i)=><option key={x.key} value={i}>{i+1}. {x.name}</option>)}</select></Field><Field label="Project status"><select style={inputStyle} value={f.lifecycle||"active"} onChange={e=>set("lifecycle",e.target.value)}>{PROJECT_STATUS.map(x=><option key={x.key} value={x.key}>{x.label}</option>)}</select></Field><Field label="Tags"><input style={inputStyle} value={tagsStr} onChange={e=>set("tags",e.target.value)}/></Field></div>
    <div style={{fontSize:12,color:C.cyan,fontWeight:600,marginTop:4}}>Commercials</div><div className="grid grid-cols-3 gap-3"><Field label="Project value (£)"><input style={inputStyle} type="number" value={f.value} onChange={e=>set("value",e.target.value)}/></Field><Field label="Paid so far (£)"><input style={inputStyle} type="number" value={f.paid} onChange={e=>set("paid",e.target.value)}/></Field><Field label="Revenue recognised (£)"><input style={inputStyle} type="number" value={f.revenueRecognised} onChange={e=>set("revenueRecognised",e.target.value)}/></Field><Field label="Monthly support (£)"><input style={inputStyle} type="number" value={f.retainer} onChange={e=>set("retainer",e.target.value)}/></Field><Field label="Invoice status"><select style={inputStyle} value={f.invoiceStatus} onChange={e=>set("invoiceStatus",e.target.value)}>{INVOICE_STATUS.map(x=><option key={x.key} value={x.key}>{x.label}</option>)}</select></Field></div>
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
function ProjectDetail({ project, customers, tasks, discovery, expenses, onBack, onSetStage, onMoveTask, onDelete, onEdit, onAddTask, onAddCost, onSetLifecycle }) {
  const p=project; const ptasks=tasks.filter(t=>t.projectId===p.id); const pexp=expenses.filter(e=>e.projectId===p.id); const outstanding=Math.max(0,(p.value||0)-(p.paid||0)); const disc=discovery[p.id]; const answered=disc?Object.values(disc.a||{}).filter(v=>v&&String(v).trim()).length:0; const inv=INVOICE_STATUS.find(s=>s.key===p.invoiceStatus)||INVOICE_STATUS[0]; const st=projectStatus(p); const costs=projectCosts(expenses,p.id); const profit=projectProfit(p,expenses); const margin=projectMargin(p,expenses);
  return (<div><button onClick={onBack} className="flex items-center gap-1 mb-4" style={{color:C.mut,fontSize:13}}><ChevronRight size={14} style={{transform:"rotate(180deg)"}}/> All projects</button>
    <div className="flex items-start justify-between mb-5"><div><div className="flex items-center gap-3"><h1 style={{fontSize:22,fontWeight:600,color:C.text}}>{p.name}</h1><Chip label={st.label} color={st.color}/><HealthPill health={p.health}/></div><div className="flex items-center gap-2 mt-1" style={{fontSize:13,color:C.mut}}><Building2 size={14}/> {custName(customers,p.customerId)} · Lead <Avatar name={p.lead} size={18}/> {p.lead}</div></div><div className="flex items-center gap-2"><Btn onClick={()=>onEdit(p)}><Pencil size={14}/> Edit</Btn><button onClick={()=>{if(window.confirm(`Delete ${p.name}? This permanently deletes linked tasks, meetings, discovery records, proposals, AI opportunities and project costs.`)){onDelete(p.id);onBack();}}} className="flex items-center justify-center rounded-lg" style={{width:38,height:38,background:C.panel2,color:C.red,border:`1px solid ${C.line}`}}><Trash2 size={15}/></button></div></div>
    <div className="grid grid-cols-6 gap-3 mb-5"><Stat label="Contract value" value={gbp(p.value)} accent={C.blue}/><Stat label="Revenue" value={gbp(p.revenueRecognised)} accent={C.green}/><Stat label="Costs" value={gbp(costs)} accent={C.amber}/><Stat label="Profit" value={gbp(profit)} accent={profit>=0?C.cyan:C.red}/><Stat label="Margin" value={`${margin.toFixed(1)}%`} accent={C.purple}/><Stat label="Outstanding" value={gbp(outstanding)} accent={C.orange}/></div>
    <Card style={{padding:18,marginBottom:18}}><div className="flex items-center justify-between gap-4"><div><div style={{fontSize:12,color:C.mut}}>Project lifecycle</div><div style={{fontSize:15,fontWeight:600,color:st.color,marginTop:4}}>{st.label}</div><div style={{fontSize:11.5,color:C.mut2,marginTop:4}}>{p.lifecycle==="maintenance"?`${gbp(p.retainer)}/mo support revenue`:p.lifecycle==="archived"?"Historic record retained for reporting":"Delivery and commercial history remain attached to this project."}</div></div><div className="flex gap-2 flex-wrap justify-end">{["active","maintenance","archived"].map(k=>{const x=PROJECT_STATUS.find(s=>s.key===k);return <button key={k} onClick={()=>onSetLifecycle(p.id,k)} className="rounded-lg px-3 py-2" style={{fontSize:11.5,fontWeight:600,background:p.lifecycle===k?`${x.color}22`:C.panel2,color:x.color,border:`1px solid ${p.lifecycle===k?x.color:C.line}`}}>{x.label}</button>})}</div></div></Card>
    <Card style={{padding:20,marginBottom:20}}><div className="flex items-center justify-between mb-4"><h2 style={{fontSize:14,fontWeight:600,color:C.text}}>Delivery pipeline</h2><span style={{fontSize:12,color:C.mut}}>{progressOf(p)}% complete</span></div><div className="grid grid-cols-8 gap-1">{STAGES.map((x,i)=>{const done=i<p.stageIdx,active=i===p.stageIdx;return <div key={x.key} className="text-center cursor-pointer" onClick={()=>onSetStage(p.id,i)}><div className="mx-auto flex items-center justify-center rounded-full mb-2" style={{width:32,height:32,background:done||active?GRAD:C.panel2,border:done||active?"none":`1px solid ${C.line}`,boxShadow:active?"0 0 0 4px rgba(0,184,255,.16)":"none"}}>{done?<CircleCheck size={16} color="#fff"/>:active?<CircleDot size={16} color="#fff"/>:<Circle size={14} color={C.mut2}/>}</div><div style={{fontSize:9.5,lineHeight:1.2,color:done||active?C.text:C.mut2}}>{x.name}</div></div>})}</div><div className="mt-4 rounded-lg p-3" style={{background:C.panel2}}><div style={{fontSize:12,color:C.cyan,fontWeight:600}}>Current: {STAGES[p.stageIdx].name}</div><div style={{fontSize:12.5,color:C.mut,marginTop:3}}>{STAGES[p.stageIdx].desc}</div></div>{answered>0&&<div className="flex items-center gap-1.5 mt-3" style={{fontSize:12,color:C.mut}}><ClipboardList size={13}/> Discovery captured: {answered}/{getQuestions(disc).length}{disc?.pain?` · pain ${disc.pain}/10`:""}</div>}</Card>
    <div className="grid grid-cols-3 gap-5 mb-20"><div className="col-span-2"><div className="flex items-center justify-between mb-3"><h2 style={{fontSize:14,fontWeight:600,color:C.text}}>Build board</h2><button onClick={()=>onAddTask(p.id)} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5" style={{background:C.panel2,color:C.text,fontSize:12,border:`1px solid ${C.line}`}}><Plus size={13}/> Add task</button></div><div className="grid grid-cols-5 gap-2.5">{COLS.map(col=>{const items=ptasks.filter(t=>t.col===col.key);return <div key={col.key} className="rounded-xl p-2.5" style={{background:C.panel,border:`1px solid ${C.line}`}}><div className="flex justify-between mb-3"><span style={{fontSize:11,fontWeight:600,color:col.color}}>{col.label}</span><span style={{fontSize:11,color:C.mut2}}>{items.length}</span></div><div className="flex flex-col gap-2">{items.map(t=><TaskMini key={t.id} t={t} onMove={onMoveTask}/>)}{!items.length&&<div style={{fontSize:11,color:C.mut2}}>—</div>}</div></div>})}</div></div>
      <div><div className="flex items-center justify-between mb-3"><h2 style={{fontSize:14,fontWeight:600,color:C.text}}>Project costs</h2><button onClick={()=>onAddCost(p.id)} style={{fontSize:12,color:C.cyan}}><Plus size={13} style={{display:"inline"}}/> Add cost</button></div><Card style={{padding:14}}>{pexp.map(e=><div key={e.id} className="flex justify-between gap-3 py-2" style={{borderBottom:`1px solid ${C.line}`}}><div><div style={{fontSize:12,color:C.text}}>{e.label}</div><div style={{fontSize:10.5,color:C.mut2}}>{e.category||"Other"} · {e.date}</div></div><span style={{fontSize:12,color:C.amber}}>{gbp(e.amount)}</span></div>)}{!pexp.length&&<span style={{fontSize:12,color:C.mut2}}>No project costs recorded.</span>}<div className="flex justify-between mt-3 pt-3" style={{borderTop:`1px solid ${C.line}`,fontSize:12.5,fontWeight:600}}><span>Total costs</span><span>{gbp(costs)}</span></div></Card><Card style={{padding:14,marginTop:12}}><div style={{fontSize:12,color:C.mut}}>Invoice</div><div style={{fontSize:14,fontWeight:600,color:inv.color,marginTop:4}}>{inv.label}</div>{p.retainer>0&&<div style={{fontSize:11,color:C.purple,marginTop:4}}>{gbp(p.retainer)}/mo maintenance & support</div>}</Card></div></div></div>);
}
function Projects({ customers, projects, tasks, discovery, expenses, activeProject, setActiveProject, onSetStage, onMoveTask, onDelete, onNew, onEdit, onAddTask, onAddCost, onSetLifecycle }) {
  const p=projects.find(x=>x.id===activeProject); const [filter,setFilter]=useState("live");
  if(p) return <ProjectDetail project={p} customers={customers} tasks={tasks} discovery={discovery} expenses={expenses} onBack={()=>setActiveProject(null)} onSetStage={onSetStage} onMoveTask={onMoveTask} onDelete={onDelete} onEdit={onEdit} onAddTask={onAddTask} onAddCost={onAddCost} onSetLifecycle={onSetLifecycle}/>;
  const shown=projects.filter(p=>filter==="all"?true:filter==="live"?(p.lifecycle||"active")!=="archived":(p.lifecycle||"active")===filter);
  return (<div><Topbar title="Projects" sub="Delivery, lifecycle and profitability in one place." action={<Btn primary onClick={onNew}><Plus size={15}/> New project</Btn>}/><div className="flex gap-2 mb-4">{[["live","Live"],["maintenance","Maintenance & Support"],["archived","Archived"],["all","All"]].map(([k,l])=><button key={k} onClick={()=>setFilter(k)} className="rounded-lg px-3 py-2" style={{fontSize:12,background:filter===k?"rgba(65,105,255,.18)":C.panel2,color:filter===k?C.text:C.mut,border:`1px solid ${filter===k?C.blue:C.line}`}}>{l}</button>)}</div><div className="flex flex-col gap-3">{shown.map(p=>{const out=Math.max(0,(p.value||0)-(p.paid||0));const st=projectStatus(p);return <Card key={p.id} className="cursor-pointer" style={{padding:18}}><div onClick={()=>setActiveProject(p.id)}><div className="flex items-center justify-between mb-2"><div className="flex items-center gap-3"><span style={{fontSize:15,fontWeight:600,color:C.text}}>{p.name}</span><Chip label={st.label} color={st.color}/><HealthPill health={p.health}/>{(p.tags||[]).map(t=><Chip key={t} label={t} color={C.mut}/>)}</div><div className="flex items-center gap-2"><Avatar name={p.lead} size={20}/><span style={{fontSize:12,color:C.mut}}>{custName(customers,p.customerId)}</span></div></div><div className="flex items-center justify-between mb-3"><span style={{fontSize:12,color:C.cyan}}>{STAGES[p.stageIdx].name}</span><span style={{fontSize:12,color:C.mut2}}>{gbp(p.revenueRecognised)} revenue · {gbp(projectCosts(expenses,p.id))} costs · <span style={{color:projectProfit(p,expenses)>=0?C.green:C.red}}>{gbp(projectProfit(p,expenses))} profit</span>{out>0?` · ${gbp(out)} outstanding`:""}</span></div><Pipeline stageIdx={p.stageIdx}/></div></Card>})}{!shown.length&&<Card style={{padding:16}}><span style={{color:C.mut}}>No projects in this view.</span></Card>}</div></div>);
}

/* --------------------------- Finance --------------------------- */
function ExpenseModal({ projects, customers, presetProjectId="", onClose, onCreate }) {
  const preset=projects.find(p=>p.id===presetProjectId);
  const [f,setF]=useState({label:"",amount:"",date:new Date().toISOString().slice(0,10),category:"Other",projectId:presetProjectId,customerId:preset?.customerId||""});
  const set=(k,v)=>setF(s=>({...s,[k]:v}));
  const save=()=>{if(!f.label.trim())return;const p=projects.find(x=>x.id===f.projectId);onCreate({id:"e"+Date.now(),label:f.label.trim(),amount:Number(f.amount)||0,date:f.date,category:f.category,projectId:f.projectId||"",customerId:p?.customerId||f.customerId||""});onClose();};
  return <Modal title="Add cost / expense" onClose={onClose} onSave={save} saveLabel="Add cost"><Field label="Description"><input style={inputStyle} value={f.label} onChange={e=>set("label",e.target.value)} placeholder="e.g. Hosting, contractor, API usage"/></Field><div className="grid grid-cols-2 gap-3"><Field label="Amount (£)"><input style={inputStyle} type="number" value={f.amount} onChange={e=>set("amount",e.target.value)}/></Field><Field label="Date"><input style={inputStyle} type="date" value={f.date} onChange={e=>set("date",e.target.value)}/></Field><Field label="Category"><select style={inputStyle} value={f.category} onChange={e=>set("category",e.target.value)}>{EXPENSE_CATEGORIES.map(x=><option key={x}>{x}</option>)}</select></Field><Field label="Project (optional)"><select style={inputStyle} value={f.projectId} onChange={e=>{const pid=e.target.value;const p=projects.find(x=>x.id===pid);setF(s=>({...s,projectId:pid,customerId:p?.customerId||s.customerId}))}}><option value="">Business overhead / no project</option>{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></Field></div></Modal>;
}
function Finance({ customers, projects, proposals, expenses, onInvoiceStatus, onAddExpense, onDeleteExpense }) {
  const revenue=projects.reduce((a,p)=>a+(Number(p.revenueRecognised)||0),0), outstanding=projects.reduce((a,p)=>a+Math.max(0,(p.value||0)-(p.paid||0)),0), recurring=projects.filter(p=>p.lifecycle==="maintenance").reduce((a,p)=>a+(p.retainer||0),0), exp=expenses.reduce((a,e)=>a+(e.amount||0),0), profit=revenue-exp, margin=revenue?profit/revenue*100:0;
  const [showExp,setShowExp]=useState(false);
  const stats=[{label:"Revenue",value:gbp(revenue),accent:C.green},{label:"Costs",value:gbp(exp),accent:C.amber},{label:"Profit",value:gbp(profit),accent:C.cyan},{label:"Margin",value:`${margin.toFixed(1)}%`,accent:C.purple},{label:"Outstanding",value:gbp(outstanding),accent:C.orange},{label:"Recurring / mo",value:gbp(recurring),accent:C.blue}];
  const exportCustomer=(c)=>{const cps=projects.filter(p=>p.customerId===c.id);const rows=[["KAI-TEQ finance breakdown",c.company],[],["Projects"],["Name","Lifecycle","Stage","Revenue","Costs","Profit","Margin %","Outstanding","Support/mo"]];cps.forEach(p=>rows.push([p.name,projectStatus(p).label,STAGES[p.stageIdx].name,p.revenueRecognised,projectCosts(expenses,p.id),projectProfit(p,expenses),projectMargin(p,expenses).toFixed(1),Math.max(0,(p.value||0)-(p.paid||0)),p.retainer||0]));downloadCSV("KAI-TEQ-"+c.company.replace(/ /g,"_")+"-finance.csv",rows)};
  return <div><Topbar title="Finance" sub="Business and project profitability — revenue, costs, margin, invoices and recurring support." action={<Btn onClick={()=>setShowExp(true)}><Plus size={15}/> Add cost</Btn>}/><div className="grid grid-cols-6 gap-3 mb-6">{stats.map(x=><Stat key={x.label} {...x}/>)}</div><h2 style={{fontSize:14,fontWeight:600,color:C.text,marginBottom:12}}>Project profitability</h2><Card style={{padding:0,marginBottom:24,overflow:"hidden"}}><div className="grid" style={{gridTemplateColumns:"1.7fr 1.2fr .8fr .8fr .8fr .7fr .9fr",padding:"12px 16px",fontSize:11,color:C.mut2,borderBottom:`1px solid ${C.line}`}}><span>PROJECT</span><span>CUSTOMER</span><span>REVENUE</span><span>COSTS</span><span>PROFIT</span><span>MARGIN</span><span>STATUS</span></div>{projects.map(p=>{const st=projectStatus(p),pr=projectProfit(p,expenses);return <div key={p.id} className="grid items-center" style={{gridTemplateColumns:"1.7fr 1.2fr .8fr .8fr .8fr .7fr .9fr",padding:"12px 16px",fontSize:12.5,color:C.text,borderBottom:`1px solid ${C.line}`}}><span>{p.name}</span><span style={{color:C.mut}}>{custName(customers,p.customerId)}</span><span>{gbp(p.revenueRecognised)}</span><span style={{color:C.amber}}>{gbp(projectCosts(expenses,p.id))}</span><span style={{color:pr>=0?C.green:C.red}}>{gbp(pr)}</span><span>{projectMargin(p,expenses).toFixed(1)}%</span><Chip label={st.label} color={st.color}/></div>})}</Card><h2 style={{fontSize:14,fontWeight:600,color:C.text,marginBottom:12}}>Invoices & receivables</h2><Card style={{padding:0,marginBottom:24,overflow:"hidden"}}>{projects.map(p=>{const out=Math.max(0,(p.value||0)-(p.paid||0));const st=INVOICE_STATUS.find(s=>s.key===p.invoiceStatus)||INVOICE_STATUS[0];return <div key={p.id} className="grid items-center" style={{gridTemplateColumns:"2fr 1.3fr 1fr 1fr 1.2fr",padding:"12px 16px",fontSize:12.5,color:C.text,borderBottom:`1px solid ${C.line}`}}><span>{p.name}</span><span style={{color:C.mut}}>{custName(customers,p.customerId)}</span><span>{gbp(p.paid)} paid</span><span style={{color:out?C.orange:C.mut2}}>{gbp(out)} due</span><select value={p.invoiceStatus} onChange={e=>onInvoiceStatus(p.id,e.target.value)} style={{background:C.panel2,color:st.color,border:`1px solid ${st.color}44`,borderRadius:6,fontSize:12,padding:"4px 6px",outline:"none"}}>{INVOICE_STATUS.map(x=><option key={x.key} value={x.key} style={{background:C.panel2,color:C.text}}>{x.label}</option>)}</select></div>})}</Card><div className="grid grid-cols-2 gap-5"><div><h2 style={{fontSize:14,fontWeight:600,color:C.text,marginBottom:12}}>Costs & expenses</h2><Card style={{padding:0,overflow:"hidden"}}>{expenses.map(e=><div key={e.id} className="flex items-center justify-between" style={{padding:"11px 14px",borderBottom:`1px solid ${C.line}`}}><div><div style={{fontSize:12.5,color:C.text}}>{e.label}</div><div style={{fontSize:10.5,color:C.mut2}}>{e.category||"Other"} · {e.projectId?projName(projects,e.projectId):"Business overhead"} · {e.date}</div></div><div className="flex items-center gap-3"><span style={{fontSize:12.5,color:C.amber}}>{gbp(e.amount)}</span><button onClick={()=>onDeleteExpense(e.id)} style={{color:C.mut2}}><X size={14}/></button></div></div>)}</Card></div><div><h2 style={{fontSize:14,fontWeight:600,color:C.text,marginBottom:12}}>By customer</h2><Card style={{padding:0,overflow:"hidden"}}>{customers.map(c=>{const ps=projects.filter(p=>p.customerId===c.id);const rev=ps.reduce((a,p)=>a+(p.revenueRecognised||0),0);const cost=expenses.filter(e=>e.customerId===c.id||ps.some(p=>p.id===e.projectId)).reduce((a,e)=>a+(e.amount||0),0);return <div key={c.id} className="flex items-center justify-between" style={{padding:"12px 16px",borderBottom:`1px solid ${C.line}`}}><div><div style={{fontSize:12.5,color:C.text,fontWeight:600}}>{c.company}</div><div style={{fontSize:10.5,color:C.mut2}}>{gbp(rev)} revenue · {gbp(cost)} costs · {gbp(rev-cost)} profit</div></div><button onClick={()=>exportCustomer(c)} style={{fontSize:11.5,color:C.cyan}}><Download size={13} style={{display:"inline"}}/> Export</button></div>})}</Card></div></div>{showExp&&<ExpenseModal projects={projects} customers={customers} onClose={()=>setShowExp(false)} onCreate={onAddExpense}/>}</div>;
}

/* --------------------------- Tasks --------------------------- */
function TaskModal({ projects, products = [], preset, onClose, onCreate }) {
  const [f, setF] = useState({ title: "", projectId: preset || (projects[0]?.id || "internal"), type: "feature", col: "todo", assignee: "Tatenda", due: "" });
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const save = () => { if (!f.title.trim()) return; onCreate({ id: "t" + Date.now(), ...f, title: f.title.trim() }); onClose(); };
  return (<Modal title="Add task" onClose={onClose} onSave={save} saveLabel="Add task">
    <Field label="Task"><input style={inputStyle} value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Build social content calendar" /></Field>
    <Field label="Project / product"><select style={inputStyle} value={f.projectId} onChange={(e) => set("projectId", e.target.value)}>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}{products.map((p) => <option key={p.id} value={p.id}>{p.name} (product)</option>)}<option value="internal">Internal / KAI-TEQ</option></select></Field>
    <div className="grid grid-cols-2 gap-3">
      <Field label="Assignee"><select style={inputStyle} value={f.assignee} onChange={(e) => set("assignee", e.target.value)}>{TEAM.map((t) => <option key={t}>{t}</option>)}<option>Client</option></select></Field>
      <Field label="Due date"><input style={inputStyle} type="date" value={f.due} onChange={(e) => set("due", e.target.value)} /></Field>
      <Field label="Type"><select style={inputStyle} value={f.type} onChange={(e) => set("type", e.target.value)}>{TASK_TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}</select></Field>
      <Field label="Status"><select style={inputStyle} value={f.col} onChange={(e) => set("col", e.target.value)}>{COLS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}</select></Field></div></Modal>);
}
function Tasks({ projects, products = [], tasks, onMoveTask, onDeleteTask, onNew }) {
  const [filter, setFilter] = useState("all");
  const [who, setWho] = useState("all");
  const nameFor = (id) => id === "internal" ? "Internal / KAI-TEQ" : ((projects.find((p) => p.id === id) || {}).name || (products.find((p) => p.id === id) || {}).name || "—");
  let shown = filter === "all" ? tasks : tasks.filter((t) => t.projectId === filter);
  if (who !== "all") shown = shown.filter((t) => t.assignee === who);
  return (<div><Topbar title="Tasks" sub="Sprint work, bugs, client and meeting actions — across everything." action={<Btn primary onClick={() => onNew(null)}><Plus size={15} /> Add task</Btn>} />
    <div className="flex items-center gap-2 mb-4">
      <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ ...inputStyle, width: "auto", padding: "7px 11px" }}><option value="all">All projects &amp; products</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}{products.map((p) => <option key={p.id} value={p.id}>{p.name} (product)</option>)}<option value="internal">Internal / KAI-TEQ</option></select>
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

/* --------------------------- Calendar / Meetings --------------------------- */
const MEET_OUTCOME = { scheduled: { label: "Scheduled", color: C.cyan }, completed: { label: "Completed", color: C.green }, cancelled: { label: "Cancelled", color: C.red }, rescheduled: { label: "Rescheduled", color: C.amber } };
function MeetingModal({ customers, projects = [], presetCustomerId = "", onClose, onCreate }) {
  const [f, setF] = useState({ customerId: presetCustomerId || customers[0]?.id || "", projectId: "", title: "", type: "Discovery", start: "", end: "", location: "Microsoft Teams", lead: "Tatenda", attendees: "" });
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const customerProjects = projects.filter((p) => p.customerId === f.customerId);
  const save = () => { if (!f.title.trim() || !f.customerId) return; const start = f.start ? new Date(f.start).toISOString() : ""; const end = f.end ? new Date(f.end).toISOString() : (f.start ? new Date(new Date(f.start).getTime() + 3600000).toISOString() : ""); onCreate({ id: "m" + Date.now(), ...f, title: f.title.trim(), start, end, when: "", source: "kai-teq", outlookEventId: "", syncStatus: "local", outcome: "scheduled", notes: { discussion: "", actions: "", decisions: "", followups: "" } }); onClose(); };
  return (<Modal wide title="Schedule customer meeting" onClose={onClose} onSave={save} saveLabel="Schedule meeting">
    <div className="grid grid-cols-2 gap-3"><Field label="Customer"><select style={inputStyle} value={f.customerId} onChange={(e) => { set("customerId", e.target.value); set("projectId", ""); }}><option value="">Select customer</option>{customers.map((c) => <option key={c.id} value={c.id}>{c.company}</option>)}</select></Field>
      <Field label="Project (optional)"><select style={inputStyle} value={f.projectId} onChange={(e) => set("projectId", e.target.value)}><option value="">Customer-level meeting</option>{customerProjects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field></div>
    <Field label="Meeting title"><input style={inputStyle} value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Discovery call" /></Field>
    <div className="grid grid-cols-2 gap-3"><Field label="Type"><select style={inputStyle} value={f.type} onChange={(e) => set("type", e.target.value)}>{["Discovery", "Review", "Demo", "Kick-off", "Support", "Commercial", "Other"].map((t) => <option key={t}>{t}</option>)}</select></Field><Field label="Lead"><select style={inputStyle} value={f.lead} onChange={(e) => set("lead", e.target.value)}>{TEAM.map((t) => <option key={t}>{t}</option>)}</select></Field></div>
    <div className="grid grid-cols-2 gap-3"><Field label="Start"><input style={inputStyle} type="datetime-local" value={f.start} onChange={(e) => set("start", e.target.value)} /></Field><Field label="End (optional)"><input style={inputStyle} type="datetime-local" value={f.end} onChange={(e) => set("end", e.target.value)} /></Field></div>
    <div className="grid grid-cols-2 gap-3"><Field label="Location / Teams link"><input style={inputStyle} value={f.location} onChange={(e) => set("location", e.target.value)} placeholder="Microsoft Teams / address" /></Field><Field label="Attendees"><input style={inputStyle} value={f.attendees} onChange={(e) => set("attendees", e.target.value)} placeholder="names or emails" /></Field></div>
    <div className="rounded-lg p-3" style={{background:C.panel2,border:`1px solid ${C.line}`,fontSize:11.5,color:C.mut,lineHeight:1.5}}>Outlook-ready data is captured now: customer, optional project, start/end time, attendees and location. When Microsoft 365 is connected later, Outlook events can sync into this same calendar without changing the customer workflow.</div>
  </Modal>);
}
function Meetings({ customers, projects = [], meetings, onUpdate, onDelete, onNew, onCreateTask }) {
  const [openId, setOpenId] = useState(null); const [filter, setFilter] = useState("upcoming");
  const m = meetings.find((x) => x.id === openId);
  const typeColor = { Discovery: C.cyan, Review: C.purple, Demo: C.amber, "Kick-off": C.blue, Support: C.green, Commercial: C.orange, Other: C.mut };
  if (m) {
    const setNote = (k, v) => onUpdate(m.id, { notes: { ...(m.notes || {}), [k]: v } });
    return (<div><button onClick={() => setOpenId(null)} className="flex items-center gap-1 mb-4" style={{ color: C.mut, fontSize: 13 }}><ChevronRight size={14} style={{ transform: "rotate(180deg)" }} /> Calendar</button>
      <div className="flex items-start justify-between mb-5"><div><div className="flex items-center gap-3"><h1 style={{ fontSize: 22, fontWeight: 600, color: C.text }}>{m.title}</h1><Chip label={m.type} color={typeColor[m.type] || C.cyan} /></div><div className="flex items-center gap-2 mt-1" style={{ fontSize: 13, color: C.mut }}><Building2 size={14} /> {custName(customers, m.customerId)} · <Clock size={13} /> {meetingWhen(m)} · <Avatar name={m.lead} size={18} /> {m.lead}</div>{m.location && <div className="flex items-center gap-1 mt-1" style={{fontSize:12,color:C.mut2}}><MapPin size={12}/>{m.location}</div>}</div>
        <div className="flex items-center gap-2"><button onClick={() => downloadMeetingICS(m, custName(customers,m.customerId))} disabled={!m.start} className="rounded-lg px-3 py-2" style={{background:C.panel2,color:m.start?C.cyan:C.mut2,border:`1px solid ${C.line}`,fontSize:12}}><CalendarDays size={13} style={{display:"inline",marginRight:6}}/>Add to Outlook</button><select value={m.outcome} onChange={(e) => onUpdate(m.id, { outcome: e.target.value })} style={{ ...inputStyle, width: "auto", padding: "7px 10px", color: (MEET_OUTCOME[m.outcome] || {}).color }}>{Object.keys(MEET_OUTCOME).map((k) => <option key={k} value={k} style={{ color: C.text }}>{MEET_OUTCOME[k].label}</option>)}</select><button onClick={() => { if (window.confirm("Delete meeting?")) { onDelete(m.id); setOpenId(null); } }} className="flex items-center justify-center rounded-lg" style={{ width: 38, height: 38, background: C.panel2, color: C.mut, border: `1px solid ${C.line}` }}><Trash2 size={15} /></button></div></div>
      <div className="grid grid-cols-2 gap-4">{[["discussion", "Discussion"], ["decisions", "Decisions"], ["actions", "Actions"], ["followups", "Follow-ups"]].map(([k, label]) => (<Card key={k} style={{ padding: 16 }}><div className="flex items-center justify-between mb-2"><h3 style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{label}</h3>{k === "actions" && <button onClick={() => onCreateTask(m)} className="flex items-center gap-1" style={{ fontSize: 11, color: C.cyan }}><Plus size={12} /> Turn into task</button>}</div><textarea rows={5} value={(m.notes || {})[k] || ""} onChange={(e) => setNote(k, e.target.value)} placeholder={`Capture ${label.toLowerCase()}…`} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }} /></Card>))}</div>
      <div style={{ fontSize: 12, color: C.mut2, marginTop: 12 }}>Meeting notes stay attached to the customer. Action items can become tasks. Outlook sync will later use the stored <code>outlookEventId</code> without creating a second meeting record.</div></div>);
  }
  const now = Date.now(); const sorted=[...meetings].sort((a,b)=>new Date(a.start||0)-new Date(b.start||0));
  const shown=sorted.filter(m=>filter==="all"?true:filter==="past"?(m.start&&new Date(m.start).getTime()<now):( !m.start || new Date(m.start).getTime()>=now));
  return (<div><Topbar title="Calendar" sub="One customer calendar — ready for future Outlook / Microsoft 365 sync." action={<Btn primary onClick={onNew}><Plus size={15} /> Schedule meeting</Btn>} />
    <Card style={{padding:14,marginBottom:16,background:C.panel2}}><div className="flex items-center justify-between gap-4"><div><div style={{fontSize:12.5,fontWeight:600,color:C.text}}>Outlook integration path</div><div style={{fontSize:11.5,color:C.mut,marginTop:4}}>For now meetings are stored in KAI-TEQ and can be exported to Outlook as .ics. Later Microsoft Graph can sync Outlook events automatically into the same records.</div></div><Chip label="Integration ready" color={C.cyan}/></div></Card>
    <div className="flex gap-2 mb-4">{[["upcoming","Upcoming"],["past","Past"],["all","All"]].map(([k,l])=><button key={k} onClick={()=>setFilter(k)} className="rounded-lg px-3 py-2" style={{fontSize:12,background:filter===k?"rgba(65,105,255,.18)":C.panel2,color:filter===k?C.text:C.mut,border:`1px solid ${filter===k?C.blue:C.line}`}}>{l}</button>)}</div>
    <div className="flex flex-col gap-3">{shown.map((m) => { const oc = MEET_OUTCOME[m.outcome] || MEET_OUTCOME.scheduled; return (<Card key={m.id} className="cursor-pointer" style={{ padding: 16 }}><div className="flex items-center justify-between" onClick={() => setOpenId(m.id)}><div className="flex items-center gap-4"><div className="flex items-center justify-center rounded-lg" style={{ width: 42, height: 42, background: C.panel2 }}><Video size={20} style={{ color: typeColor[m.type] || C.cyan }} /></div><div><div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{m.title}</div><div style={{ fontSize: 12, color: C.mut }}>{custName(customers, m.customerId)}{m.projectId ? ` · ${projName(projects,m.projectId)}` : ""}</div><div style={{fontSize:11,color:C.mut2,marginTop:3}}>{m.location || "Location not set"}</div></div></div><div className="flex items-center gap-5"><Chip label={oc.label} color={oc.color} /><div className="flex items-center gap-1" style={{ fontSize: 12.5, color: C.text }}><Clock size={13} style={{ color: C.mut }} /> {meetingWhen(m)}</div><div className="flex items-center gap-1.5" style={{ fontSize: 12, color: C.mut }}><Avatar name={m.lead} size={18} /> {m.lead}</div></div></div></Card>); })}{!shown.length&&<Card style={{padding:16}}><span style={{fontSize:12.5,color:C.mut2}}>No meetings in this view.</span></Card>}</div></div>);
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
  return (<div><Topbar title="Workflow" sub="How KAI-TEQ runs — client delivery, and how we build the platform itself." />
    <h2 style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 12 }}>Client delivery lifecycle</h2>
    <div className="flex flex-col gap-3">{STAGES.map((s, i) => (<Card key={s.key} style={{ padding: 16 }}>
      <div className="flex items-start gap-4"><div className="flex items-center justify-center rounded-xl flex-shrink-0" style={{ width: 44, height: 44, background: GRAD }}><s.icon size={20} color="#fff" /></div>
        <div className="flex-1"><div className="flex items-center gap-3"><span style={{ fontSize: 12, color: C.mut2, fontWeight: 700 }}>{String(i + 1).padStart(2, "0")}</span><span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{s.name}</span><Chip label={"DevOps · " + s.devops} color={C.cyan} /></div>
          <p style={{ fontSize: 13, color: C.mut, marginTop: 6, lineHeight: 1.55 }}>{s.desc}</p></div></div></Card>))}</div>
    <h2 style={{ fontSize: 14, fontWeight: 600, color: C.text, margin: "28px 0 12px" }}>How we build KAI-TEQ</h2>
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

/* --------------------------- Geographic intelligence --------------------------- */
function TerritoryMap({ customers, projects, meetings = [], onOpenCustomer }) {
  const mapEl = useRef(null), mapRef = useRef(null), layerRef = useRef(null);
  const revOf = (id) => projects.filter((p) => p.customerId === id).reduce((a, p) => a + (Number(p.revenueRecognised) || 0), 0);
  const mrrOf = (id) => projects.filter((p) => p.customerId === id && p.lifecycle === "maintenance").reduce((a,p)=>a+(Number(p.retainer)||0),0);
  const isProspect = (c) => ["Lead","Discovery","Proposal"].includes(c.status);
  const placed = customers.map((c) => ({ c, co: coordsOf(c), rev: revOf(c.id), mrr:mrrOf(c.id), prospect:isProspect(c) })).filter((x) => x.co);
  const noCoords = customers.filter((c) => !coordsOf(c));
  const totalRev = placed.reduce((a, x) => a + x.rev, 0), totalMrr=placed.reduce((a,x)=>a+x.mrr,0);
  const maxRev = Math.max(1, ...placed.map((x) => x.rev));
  const hasL = typeof window !== "undefined" && window.L;
  const [colorMode, setColorMode] = useState("health"); const [filterVal, setFilterVal] = useState("all"); const [audience,setAudience]=useState("all");
  const DIMS = {
    health: { label: "Relationship health", opts: Object.keys(HEALTH).map((k) => ({ val: k, label: HEALTH[k].label, color: HEALTH[k].color })), get: (c) => c.health || "healthy" },
    source: { label: "Acquisition source", opts: SOURCES.map((x) => ({ val: x, label: x, color: SOURCE_COLOR[x] })), get: (c) => c.source || "Other" },
    status: { label: "Customer stage", opts: ["Lead", "Discovery", "Proposal", "Active", "Retainer", "Closed"].map((x) => ({ val: x, label: x, color: STATUS_COLOR[x] || C.mut2 })), get: (c) => c.status || "Lead" },
  };
  const dim=DIMS[colorMode];
  const audiencePlaced=placed.filter(x=>audience==="all"||audience==="prospects"? (audience==="all"||x.prospect) : !x.prospect);
  const shown=audiencePlaced.filter(({c})=>filterVal==="all"||dim.get(c)===filterVal);

  useEffect(()=>{
    if(!hasL||!mapEl.current)return; const L=window.L;
    if(!mapRef.current){ mapRef.current=L.map(mapEl.current,{zoomControl:true,scrollWheelZoom:true,worldCopyJump:true}).setView([54.5,-3],5); L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",{maxZoom:19,subdomains:"abcd",attribution:"&copy; OpenStreetMap &copy; CARTO"}).addTo(mapRef.current); layerRef.current=L.layerGroup().addTo(mapRef.current); }
    const map=mapRef.current,grp=layerRef.current;grp.clearLayers();const pts=[];
    shown.forEach(({c,co,rev,mrr,prospect})=>{const ov=dim.opts.find(x=>x.val===dim.get(c));const col=ov?ov.color:C.cyan;const radius=prospect?9:9+Math.round((rev/maxRev)*18);const m=L.circleMarker([co[0],co[1]],{radius,color:prospect?col:"#ffffff",weight:prospect?2:1.5,dashArray:prospect?"4 3":null,fillColor:col,fillOpacity:prospect ? .45 : .9});m.bindPopup(`<b>${c.company}</b><br>${c.city||""}<br>${prospect?"Prospect":"Customer"} · ${gbp(rev)} revenue · ${gbp(mrr)}/mo`);m.addTo(grp);m.bindTooltip(c.company,{direction:"top",offset:[0,-radius]});pts.push([co[0],co[1]]);});
    if(pts.length===1)map.setView(pts[0],7);else if(pts.length>1)map.fitBounds(pts,{padding:[50,50],maxZoom:9});const t=setTimeout(()=>map.invalidateSize(),120);return()=>clearTimeout(t);
  },[customers,projects,hasL,colorMode,filterVal,audience]);
  useEffect(()=>()=>{if(mapRef.current){mapRef.current.remove();mapRef.current=null;}},[]);

  const byCity={}; placed.forEach(x=>{const city=(x.c.city||"Unknown").trim()||"Unknown";byCity[city]??={city,customers:0,prospects:0,rev:0,mrr:0};byCity[city][x.prospect?"prospects":"customers"]++;byCity[city].rev+=x.rev;byCity[city].mrr+=x.mrr;});
  const cityRows=Object.values(byCity).filter(x=>x.city!=="Unknown").sort((a,b)=>b.rev-a.rev);
  const topRevenue=cityRows[0]; const growth=[...cityRows].sort((a,b)=>(b.prospects*2+b.customers)-(a.prospects*2+a.customers)).find(x=>x.prospects>0);
  const upcoming=meetings.filter(m=>m.start&&new Date(m.start).getTime()>=Date.now()).slice(0,4);
  const prospects=customers.filter(isProspect).length, established=customers.length-prospects;

  return (<div><Topbar title="Geographic Intelligence" sub="Where KAI-TEQ customers, prospects, revenue and future opportunity are concentrated." />
    <div className="grid grid-cols-5 gap-3 mb-5"><Stat label="Customers" value={established} accent={C.cyan}/><Stat label="Prospects" value={prospects} accent={C.purple}/><Stat label="Revenue mapped" value={gbp(totalRev)} accent={C.green}/><Stat label="Recurring / mo" value={gbp(totalMrr)} accent={C.blue}/><Stat label="Needs location" value={noCoords.length} accent={C.orange}/></div>
    <div className="grid grid-cols-3 gap-5"><Card className="col-span-2" style={{padding:12}}>
      <div className="flex items-center justify-between mb-2.5 flex-wrap gap-2"><div className="flex items-center gap-2 flex-wrap"><span style={{fontSize:11,color:C.mut2}}>Show</span><select value={audience} onChange={e=>setAudience(e.target.value)} style={{...inputStyle,width:"auto",padding:"5px 8px",fontSize:12}}><option value="all">Customers + prospects</option><option value="customers">Customers only</option><option value="prospects">Prospects only</option></select><span style={{fontSize:11,color:C.mut2,marginLeft:6}}>Colour by</span><select value={colorMode} onChange={e=>{setColorMode(e.target.value);setFilterVal("all")}} style={{...inputStyle,width:"auto",padding:"5px 8px",fontSize:12}}>{Object.keys(DIMS).map(k=><option key={k} value={k}>{DIMS[k].label}</option>)}</select><select value={filterVal} onChange={e=>setFilterVal(e.target.value)} style={{...inputStyle,width:"auto",padding:"5px 8px",fontSize:12}}><option value="all">All</option>{dim.opts.map(o=><option key={o.val} value={o.val}>{o.label}</option>)}</select></div><div style={{fontSize:10.5,color:C.mut2}}>Solid = customer · outlined = prospect · customer marker size = revenue</div></div>
      {hasL?<div ref={mapEl} style={{width:"100%",height:540,borderRadius:10,overflow:"hidden"}}/>:<MapFallback placed={shown} maxRev={maxRev} dim={dim}/>}</Card>
      <div><h3 style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:10}}>Geographic insights</h3>
        <Card style={{padding:14,marginBottom:10}}><div style={{fontSize:11,color:C.mut2}}>Highest-value area</div><div style={{fontSize:15,fontWeight:600,color:C.text,marginTop:4}}>{topRevenue?topRevenue.city:"—"}</div><div style={{fontSize:11.5,color:C.green,marginTop:3}}>{topRevenue?`${gbp(topRevenue.rev)} recognised · ${gbp(topRevenue.mrr)}/mo recurring`:"Add customer locations to unlock this."}</div></Card>
        <Card style={{padding:14,marginBottom:10}}><div style={{fontSize:11,color:C.mut2}}>Growth signal</div><div style={{fontSize:14,fontWeight:600,color:C.text,marginTop:4}}>{growth?growth.city:"No prospect cluster yet"}</div><div style={{fontSize:11.5,color:C.mut,marginTop:3}}>{growth?`${growth.prospects} prospect${growth.prospects===1?"":"s"} · ${growth.customers} current customer${growth.customers===1?"":"s"}`:"As leads are added, this highlights areas worth targeted outreach."}</div></Card>
        <Card style={{padding:14,marginBottom:10}}><div style={{fontSize:11,color:C.mut2}}>Upcoming customer activity</div>{upcoming.map(m=><div key={m.id} style={{marginTop:7,fontSize:11.5,color:C.text}}>{meetingWhen(m)} · {custName(customers,m.customerId)}</div>)}{!upcoming.length&&<div style={{fontSize:11.5,color:C.mut,marginTop:5}}>No upcoming mapped meetings yet.</div>}</Card>
        <h3 style={{fontSize:13,fontWeight:600,color:C.text,margin:"16px 0 9px"}}>Mapped accounts</h3><div className="flex flex-col gap-2">{[...placed].sort((a,b)=>b.rev-a.rev).slice(0,8).map(({c,rev,mrr,prospect})=><Card key={c.id} style={{padding:11}}><div className="flex items-center justify-between gap-2"><div><div style={{fontSize:12.5,fontWeight:600,color:C.text}}>{c.company}</div><div style={{fontSize:10.5,color:C.mut2,marginTop:3}}>{c.city||"—"} · {prospect?"Prospect":"Customer"} · {gbp(rev)} revenue{mrr?` · ${gbp(mrr)}/mo`:""}</div></div><button onClick={()=>onOpenCustomer(c.id)} style={{fontSize:11,color:C.cyan}}>360° →</button></div></Card>)}{!placed.length&&<Card style={{padding:14}}><span style={{fontSize:12,color:C.mut2}}>No accounts mapped yet.</span></Card>}</div>
        {noCoords.length>0&&<div style={{fontSize:11,color:C.mut2,marginTop:10}}>Add city/postcode to map: {noCoords.map(c=>c.company).join(", ")}.</div>}
      </div></div>
    <Card style={{padding:14,marginTop:16,background:C.panel2}}><div style={{fontSize:12.5,fontWeight:600,color:C.text}}>Why this view matters</div><div style={{fontSize:11.5,color:C.mut,marginTop:5,lineHeight:1.55}}>Use geography to spot customer concentration, prospect gaps, regional revenue dependence, opportunities for targeted outreach, and clusters of meetings that could be combined into efficient onsite days. The map is business intelligence, not just decoration.</div></Card>
  </div>);
}
function MapFallback({ placed, maxRev, dim }) {
  const W=460,H=540,B={latMin:49.9,latMax:58.8,lngMin:-8.3,lngMax:1.9};const proj=(lat,lng)=>({x:((lng-B.lngMin)/(B.lngMax-B.lngMin))*W,y:H-((lat-B.latMin)/(B.latMax-B.latMin))*H});
  return (<svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:"auto",maxHeight:540,background:C.panel2,borderRadius:10}}>{placed.map(({c,co,rev,prospect})=>{const q=proj(co[0],co[1]),rad=prospect?8:8+(rev/maxRev)*18,ov=dim?dim.opts.find(x=>x.val===dim.get(c)):null,col=ov?ov.color:C.cyan;return <g key={c.id}><circle cx={q.x} cy={q.y} r={rad} fill={prospect?"transparent":col} stroke={col} strokeWidth={prospect?2:0} opacity={prospect ? .8 : .3}/><circle cx={q.x} cy={q.y} r={4} fill={col}/><text x={q.x+rad+3} y={q.y+4} fill={C.text} style={{fontSize:11,fontWeight:600}}>{c.company}</text></g>})}<text x={W/2} y={H-10} fill={C.mut2} textAnchor="middle" style={{fontSize:10}}>Live map loads on the deployed site</text></svg>);
}

/* --------------------------- Root --------------------------- */
export default function App() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
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
  const [activeCustomer, setActiveCustomer] = useState(null);
  const [modal, setModal] = useState(null);


  useEffect(() => {
    if (!supabaseConfigured || !supabase) { setAuthReady(true); return; }
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setUser(data?.session?.user ? userLabelFromEmail(data.session.user.email) : null);
      setAuthReady(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUser(session?.user ? userLabelFromEmail(session.user.email) : null);
      setAuthReady(true);
    });
    return () => { active = false; listener?.subscription?.unsubscribe(); };
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ customers, projects, products, tasks, meetings, proposals, opportunities, discovery, expenses })); } catch (e) {}
  }, [customers, projects, products, tasks, meetings, proposals, opportunities, discovery, expenses]);

  /* projects */
  const setStage = (id, idx) => setProjects((ps) => ps.map((p) => p.id === id ? { ...p, stageIdx: Math.max(0, Math.min(STAGES.length - 1, idx)) } : p));
  const setProjectLifecycle = (id, lifecycle) => setProjects((ps) => ps.map((p) => p.id === id ? { ...p, lifecycle } : p));
  const saveProject = (proj) => setProjects((ps) => ps.some((p) => p.id === proj.id) ? ps.map((p) => p.id === proj.id ? proj : p) : [proj, ...ps]);
  const deleteProject = (id) => { setProjects((ps) => ps.filter((p) => p.id !== id)); setTasks((ts) => ts.filter((t) => t.projectId !== id)); setMeetings((ms) => ms.filter((m) => m.projectId !== id)); setProposals((qs) => qs.filter((q) => q.projectId !== id)); setOpportunities((os) => os.filter((o) => o.projectId !== id)); setExpenses((es) => es.filter((e) => e.projectId !== id)); setDiscovery((d) => { const n = { ...d }; delete n[id]; return n; }); };
  const setInvoiceStatus = (id, status) => setProjects((ps) => ps.map((p) => { if (p.id !== id) return p; let paid = p.paid; if (status === "paid") paid = p.value; else if (status === "outstanding") paid = 0; return { ...p, invoiceStatus: status, paid, revenueRecognised: paid }; }));
  /* customers */
  const saveCustomer = (cust) => setCustomers((cs) => cs.some((c) => c.id === cust.id) ? cs.map((c) => c.id === cust.id ? cust : c) : [cust, ...cs]);
  const deleteCustomer = (id) => { const pids = projects.filter((p) => p.customerId === id).map((p) => p.id); setCustomers((cs) => cs.filter((c) => c.id !== id)); setProjects((ps) => ps.filter((p) => p.customerId !== id)); setTasks((ts) => ts.filter((t) => !pids.includes(t.projectId))); setMeetings((ms) => ms.filter((m) => m.customerId !== id)); setProposals((qs) => qs.filter((q) => q.customerId !== id)); setOpportunities((os) => os.filter((o) => o.customerId !== id)); setExpenses((es) => es.filter((e) => e.customerId !== id && !pids.includes(e.projectId))); setDiscovery((d) => { const n={...d}; pids.forEach((pid)=>delete n[pid]); return n; }); };
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
    const proj = { id: pid, customerId: cid, name: projectName || (company + " — Discovery"), lead: "Tatenda", health: "on", stageIdx: 1, tags: [], value: 0, paid: 0, retainer: 0, revenueRecognised: 0, invoiceStatus: "none", lifecycle: "planned" };
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

  if (!authReady) return <AuthLoading />;
  if (!user) return <Login onLogin={setUser} />;

  const logout = async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null); setView("dashboard");
  };

  return (
    <div className="flex min-h-screen relative overflow-hidden" style={{ background: C.bg, fontFamily: FONT, color: C.text }}>
      <FuturisticBackdrop />
      <Sidebar view={view} setView={(v) => { setView(v); setActiveProject(null); setActiveProduct(null); if(v !== "customers") setActiveCustomer(null); }} user={user} onLogout={logout} />
      <main className="flex-1 overflow-auto relative" style={{ padding: "28px 32px", zIndex: 1 }}>
        {view === "dashboard" && <Dashboard customers={customers} projects={projects} proposals={proposals} opportunities={opportunities} meetings={meetings} expenses={expenses} setView={setView} setActiveProject={setActiveProject} />}
        {view === "customers" && <Customers customers={customers} projects={projects} tasks={tasks} meetings={meetings} proposals={proposals} opportunities={opportunities} discovery={discovery} expenses={expenses} onNew={() => setModal({ type: "customer" })} onEdit={(c) => setModal({ type: "customer", data: c })} onDelete={deleteCustomer} setActiveProject={setActiveProject} setView={setView} activeCustomer={activeCustomer} setActiveCustomer={setActiveCustomer} onScheduleMeeting={(customerId)=>setModal({type:"meeting",presetCustomerId:customerId})} />}
        {view === "products" && <Products products={products} tasks={tasks} activeProduct={activeProduct} setActiveProduct={setActiveProduct} onSetStage={setProductStage} onMoveTask={moveTask} onDelete={deleteProduct} onNew={() => setModal({ type: "product" })} onEdit={(p) => setModal({ type: "product", data: p })} onAddTask={(pid) => setModal({ type: "task", preset: pid })} />}
        {view === "map" && <TerritoryMap customers={customers} projects={projects} meetings={meetings} onOpenCustomer={(id)=>{setActiveCustomer(id);setView("customers")}} />}
        {view === "projects" && <Projects customers={customers} projects={projects} tasks={tasks} discovery={discovery} expenses={expenses} activeProject={activeProject} setActiveProject={setActiveProject} onSetStage={setStage} onMoveTask={moveTask} onDelete={deleteProject} onNew={() => setModal({ type: "project" })} onEdit={(p) => setModal({ type: "project", data: p })} onAddTask={(pid) => setModal({ type: "task", preset: pid })} onAddCost={(pid) => setModal({ type: "expense", preset: pid })} onSetLifecycle={setProjectLifecycle} />}
        {view === "finance" && <Finance customers={customers} projects={projects} proposals={proposals} expenses={expenses} onInvoiceStatus={setInvoiceStatus} onAddExpense={addExpense} onDeleteExpense={deleteExpense} />}
        {view === "tasks" && <Tasks projects={projects} products={products} tasks={tasks} onMoveTask={moveTask} onDeleteTask={deleteTask} onNew={(pid) => setModal({ type: "task", preset: pid })} />}
        {view === "meetings" && <Meetings customers={customers} projects={projects} meetings={meetings} onUpdate={updateMeeting} onDelete={deleteMeeting} onNew={() => setModal({ type: "meeting" })} onCreateTask={taskFromMeeting} />}
        {view === "discovery" && <Discovery customers={customers} projects={projects} discovery={discovery} onAnswer={setAnswer} onMeta={setMeta} onAddQuestion={addQuestion} onEditQuestion={editQuestion} onDeleteQuestion={deleteQuestion} onMoveQuestion={moveQuestion} onApply={applyDiscovery} onAddClient={addClientWithProject} />}
        {view === "proposals" && <Proposals customers={customers} proposals={proposals} onNew={addProposal} onStatus={setProposalStatus} onDelete={deleteProposal} />}
        {view === "ai" && <AIOpportunities customers={customers} opportunities={opportunities} onNew={addOpp} onStatus={setOppStatus} onDelete={deleteOpp} />}
        {view === "documents" && <Documents customers={customers} />}
        {view === "workflow" && <WorkflowView />}
      </main>
      {modal?.type === "project" && <ProjectModal customers={customers} project={modal.data} onClose={() => setModal(null)} onSave={saveProject} />}
      {modal?.type === "customer" && <CustomerModal customer={modal.data} onClose={() => setModal(null)} onSave={saveCustomer} />}
      {modal?.type === "task" && <TaskModal projects={projects} products={products} preset={modal.preset} onClose={() => setModal(null)} onCreate={addTask} />}
      {modal?.type === "meeting" && <MeetingModal customers={customers} projects={projects} presetCustomerId={modal.presetCustomerId || ""} onClose={() => setModal(null)} onCreate={addMeeting} />}
      {modal?.type === "product" && <ProductModal product={modal.data} onClose={() => setModal(null)} onSave={saveProduct} />}
      {modal?.type === "expense" && <ExpenseModal projects={projects} customers={customers} presetProjectId={modal.preset || ""} onClose={() => setModal(null)} onCreate={addExpense} />}
    </div>
  );
}
