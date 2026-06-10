import React, { useState, useEffect } from "react";
import {
  LayoutDashboard, FolderKanban, ListChecks, CalendarDays, Users, ClipboardList,
  Receipt, Sparkles, FileText, Workflow, LogOut, Plus, Clock, CircleCheck, CircleDot,
  Circle, ChevronRight, Phone, Mail, Globe, MapPin, Building2, Paperclip, Upload,
  ArrowRight, ArrowLeft, Brain, Cog, Share2, BarChart3, AlertTriangle, CheckCircle2,
  Video, X, Trash2, Target, Search, Rocket, Lightbulb, Bug, TrendingUp
} from "lucide-react";

/* ---------------------------------------------------------------------------
   KAITEQ — Operating System
   Clients → discovery → proposals → projects → tasks → support → AI ideas.
   Data persists in the browser (localStorage) until a database is connected.
--------------------------------------------------------------------------- */

const C = {
  bg: "#0B0F1E", panel: "#0F1426", panel2: "#131A30", line: "#1E2742",
  cyan: "#00B8FF", blue: "#4169FF", purple: "#7B3CFF", orange: "#FF8A00", amber: "#FFC433",
  green: "#34D399", text: "#EAF0FF", mut: "#8A93AE", mut2: "#5E6788",
};
const GRAD = `linear-gradient(135deg, ${C.cyan} 0%, ${C.blue} 50%, ${C.purple} 100%)`;
const FONT = "Inter, 'Segoe UI', system-ui, -apple-system, sans-serif";
const STORAGE_KEY = "kaiteq_data_v2";

/* ----- KAITEQ delivery lifecycle (8 stages) ----- */
const STAGES = [
  { key: "lead", name: "Lead / Opportunity", devops: "Plan", icon: Target,
    desc: "Who the client is, the problem, budget, urgency, the decision maker, and whether it's a good fit." },
  { key: "discovery", name: "Discovery", devops: "Plan", icon: Search,
    desc: "Meeting notes, pain points, current process, tools they use, risks and success metrics." },
  { key: "proposal", name: "Proposal / Scope", devops: "Plan", icon: FileText,
    desc: "Proposal, pricing, deliverables, timeline, assumptions and approval status." },
  { key: "design", name: "Design", devops: "Develop", icon: Workflow,
    desc: "Process maps, automation ideas, AI workflow design, integrations, data needed and architecture notes." },
  { key: "build", name: "Build Sprint", devops: "Build", icon: Cog,
    desc: "Work broken into small tasks across To Do, In Progress, Blocked, Ready for Review and Done." },
  { key: "review", name: "Testing / Client Review", devops: "Test", icon: CircleCheck,
    desc: "Demo feedback, bugs, requested changes and client sign-off." },
  { key: "deploy", name: "Deploy / Handover", devops: "Release / Deploy", icon: Rocket,
    desc: "Launch checklist, access, documentation, training and the support agreement." },
  { key: "support", name: "Support / Optimise", devops: "Operate / Monitor", icon: BarChart3,
    desc: "Issues, improvements, monthly value delivered and upsell opportunities." },
];

/* ----- task board statuses ----- */
const COLS = [
  { key: "todo", label: "To Do", color: C.mut },
  { key: "doing", label: "In Progress", color: C.cyan },
  { key: "blocked", label: "Blocked", color: C.orange },
  { key: "review", label: "Ready for Review", color: C.purple },
  { key: "done", label: "Done", color: C.green },
];
const TASK_TYPES = [
  { key: "sprint", label: "Sprint", color: C.cyan },
  { key: "bug", label: "Bug", color: C.orange },
  { key: "client", label: "Client action", color: C.purple },
  { key: "internal", label: "Internal", color: C.amber },
];
const PROPOSAL_STATUS = [
  { key: "draft", label: "Draft", color: C.mut },
  { key: "sent", label: "Sent", color: C.cyan },
  { key: "accepted", label: "Accepted", color: C.green },
  { key: "rejected", label: "Rejected", color: C.orange },
];
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
const DEV_FLOW = ["Idea", "Backlog", "Design", "Build", "Test", "Deploy", "Improve"];

/* --------------------------- Seed data --------------------------- */
const seedProjects = [
  { id: "p1", client: "Northwind Logistics", name: "Warehouse intake automation", lead: "Aaron", value: 42000, health: "on", stageIdx: 4, tags: ["Automation", "Integration"] },
  { id: "p2", client: "Mercia Health Group", name: "Patient referral intelligence", lead: "Priya", value: 68000, health: "risk", stageIdx: 3, tags: ["AI", "Analytics"] },
  { id: "p3", client: "Brixton Retail Co.", name: "Ops reporting dashboard", lead: "Aaron", value: 21500, health: "on", stageIdx: 6, tags: ["Analytics", "Dashboards"] },
  { id: "p4", client: "Solent Manufacturing", name: "Production scheduling", lead: "Priya", value: 0, health: "on", stageIdx: 0, tags: ["Discovery"] },
];
const seedTasks = [
  { id: "t1", title: "Connect WMS API", projectId: "p1", type: "sprint", col: "doing" },
  { id: "t2", title: "Intake bot logic", projectId: "p1", type: "sprint", col: "doing" },
  { id: "t3", title: "Exception dashboard", projectId: "p1", type: "sprint", col: "todo" },
  { id: "t4", title: "Duplicate scans bug", projectId: "p1", type: "bug", col: "blocked" },
  { id: "t5", title: "Client to share API keys", projectId: "p1", type: "client", col: "todo" },
  { id: "t6", title: "Sprint 1 demo", projectId: "p1", type: "sprint", col: "done" },
  { id: "t7", title: "Architecture sign-off", projectId: "p2", type: "sprint", col: "review" },
  { id: "t8", title: "GDPR data-flow review", projectId: "p2", type: "sprint", col: "doing" },
  { id: "t9", title: "Define success metrics", projectId: "p2", type: "client", col: "todo" },
  { id: "t10", title: "Go-live checklist", projectId: "p3", type: "sprint", col: "doing" },
  { id: "t11", title: "Handover documentation", projectId: "p3", type: "sprint", col: "review" },
  { id: "t12", title: "Refresh proposal template", projectId: "internal", type: "internal", col: "todo" },
  { id: "t13", title: "Set up Netlify deploy", projectId: "internal", type: "internal", col: "done" },
];
const seedProposals = [
  { id: "q1", client: "Mercia Health Group", title: "Referral intelligence build", value: 68000, status: "accepted", date: "2026-05-20" },
  { id: "q2", client: "Brixton Retail Co.", title: "Ops reporting — Phase 2", value: 18000, status: "sent", date: "2026-06-04" },
  { id: "q3", client: "Solent Manufacturing", title: "Discovery engagement", value: 4500, status: "draft", date: "2026-06-09" },
  { id: "q4", client: "Harbinger Foods", title: "Warehouse automation", value: 30000, status: "rejected", date: "2026-04-12" },
];
const seedOpps = [
  { id: "o1", client: "Northwind Logistics", idea: "Auto-route exception scans to the right team", value: 5, effort: 2, risk: 2 },
  { id: "o2", client: "Brixton Retail Co.", idea: "AI inventory demand forecasting", value: 5, effort: 4, risk: 3 },
  { id: "o3", client: "Mercia Health Group", idea: "LLM auto-summary of referral letters", value: 4, effort: 3, risk: 4 },
  { id: "o4", client: "Northwind Logistics", idea: "Slack alerts for SLA breaches", value: 3, effort: 1, risk: 1 },
];
const seedDiscovery = {
  p2: { 0: "Referrals are slow and inconsistent across sites.", 2: "Manual triage, letters re-keyed by hand.", 4: "Cut triage time by 50%, zero lost referrals." },
};
const seedMeetings = [
  { id: "m1", client: "Solent Manufacturing", title: "Discovery call", type: "Discovery", when: "Today · 14:00", lead: "Priya" },
  { id: "m2", client: "Mercia Health Group", title: "Architecture review", type: "Review", when: "Tomorrow · 10:30", lead: "Aaron" },
  { id: "m3", client: "Northwind Logistics", title: "Sprint 2 demo", type: "Demo", when: "Thu · 16:00", lead: "Aaron" },
  { id: "m4", client: "Brixton Retail Co.", title: "Go-live readiness", type: "Review", when: "Fri · 11:00", lead: "Priya" },
];
const seedCustomers = [
  { id: "c1", company: "Northwind Logistics", contact: "James Okafor", role: "Ops Director", email: "james@northwind.co.uk", phone: "+44 20 7946 0011", site: "northwind.co.uk", location: "Reading, UK", notes: "High-volume intake, legacy WMS. Wants exception handling automated first.", docs: ["Discovery call notes.pdf", "Current process map.png", "Signed SOW.pdf"] },
  { id: "c2", company: "Mercia Health Group", contact: "Dr. Sarah Lin", role: "Transformation Lead", email: "s.lin@merciahealth.nhs.uk", phone: "+44 121 555 0199", site: "merciahealth.org", location: "Birmingham, UK", notes: "GDPR/clinical data sensitive — keep all docs in the secure store. Referral data is the priority.", docs: ["Discovery call notes.pdf", "Data processing requirements.docx"] },
  { id: "c3", company: "Brixton Retail Co.", contact: "Tom Reyes", role: "Head of Operations", email: "tom@brixtonretail.com", phone: "+44 20 7946 0444", site: "brixtonretail.com", location: "London, UK", notes: "Reporting nearly live. Keen on a phase 2 for inventory forecasting.", docs: ["Discovery call notes.pdf", "Dashboard spec.pdf", "Go-live checklist.xlsx"] },
];
const seedDocs = [
  { id: "d1", name: "Master Services Agreement.docx", cat: "Legal" },
  { id: "d2", name: "Project proposal template.docx", cat: "Templates" },
  { id: "d3", name: "Discovery call script.pdf", cat: "Templates" },
  { id: "d4", name: "Company insurance certificate.pdf", cat: "Compliance" },
  { id: "d5", name: "Standard SOW template.docx", cat: "Templates" },
  { id: "d6", name: "Brand guidelines.pdf", cat: "Brand" },
];
const VALUES = [
  { icon: Brain, t: "Intelligent", s: "AI powered" }, { icon: Cog, t: "Automated", s: "Efficiency first" },
  { icon: Share2, t: "Connected", s: "Systems integration" }, { icon: BarChart3, t: "Impact driven", s: "Measurable results" },
];

/* ----- persistence ----- */
function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) { const d = JSON.parse(raw); return {
      projects: d.projects || seedProjects, tasks: d.tasks || seedTasks,
      proposals: d.proposals || seedProposals, opportunities: d.opportunities || seedOpps,
      discovery: d.discovery || {} }; }
  } catch (e) {}
  return { projects: seedProjects, tasks: seedTasks, proposals: seedProposals, opportunities: seedOpps, discovery: seedDiscovery };
}

/* --------------------------- UI helpers --------------------------- */
function Logo({ size = 34 }) {
  const id = "kg" + size;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
      <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={C.cyan} /><stop offset="50%" stopColor={C.blue} /><stop offset="100%" stopColor={C.purple} />
      </linearGradient></defs>
      <rect x="6" y="6" width="88" height="88" rx="22" fill={`url(#${id})`} opacity="0.16" />
      <g fill={`url(#${id})`}><rect x="26" y="20" width="13" height="60" rx="3" />
        <polygon points="44,50 66,20 80,20 56,52" /><polygon points="56,52 80,80 65,80 47,56" /></g>
    </svg>
  );
}
function Wordmark() {
  return (<div className="flex items-center gap-3"><Logo size={30} />
    <span style={{ letterSpacing: "0.28em", fontWeight: 600, color: C.text, fontSize: 18 }}>KAITEQ</span></div>);
}
function HealthPill({ health }) {
  const on = health === "on";
  return (<span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5"
    style={{ fontSize: 11, background: on ? "rgba(0,184,255,0.12)" : "rgba(255,138,0,0.14)", color: on ? C.cyan : C.orange }}>
    {on ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}{on ? "On track" : "At risk"}</span>);
}
function Chip({ label, color }) {
  return (<span style={{ fontSize: 10.5, color, background: "rgba(255,255,255,0.04)", padding: "2px 8px", borderRadius: 6, border: `1px solid ${color}33` }}>{label}</span>);
}
function Avatar({ name, size = 26 }) {
  return (<span className="inline-flex items-center justify-center rounded-full font-semibold"
    style={{ width: size, height: size, fontSize: size * 0.42, color: "#fff",
      background: name === "Aaron" ? `linear-gradient(135deg,${C.cyan},${C.blue})` : `linear-gradient(135deg,${C.blue},${C.purple})` }}>
    {name.slice(0, 1)}</span>);
}
const progressOf = (p) => Math.round((p.stageIdx / (STAGES.length - 1)) * 100);

function Pipeline({ stageIdx, compact = false }) {
  return (<div className="flex items-center" style={{ gap: compact ? 4 : 6 }}>
    {STAGES.map((s, i) => {
      const done = i < stageIdx, active = i === stageIdx, dot = compact ? 8 : 10;
      return (<React.Fragment key={s.key}>
        <div className="flex items-center justify-center rounded-full" title={s.name}
          style={{ width: dot, height: dot, flexShrink: 0, background: done || active ? GRAD : "transparent",
            border: done || active ? "none" : `1.5px solid ${C.line}`, boxShadow: active ? `0 0 0 3px rgba(0,184,255,0.18)` : "none" }} />
        {i < STAGES.length - 1 && (<div style={{ height: 2, flex: 1, borderRadius: 2, background: i < stageIdx ? GRAD : C.line }} />)}
      </React.Fragment>);
    })}</div>);
}
function Card({ children, style, className = "" }) {
  return (<div className={"rounded-xl " + className} style={{ background: C.panel, border: `1px solid ${C.line}`, ...style }}>{children}</div>);
}
function Field({ label, children }) {
  return (<div><label style={{ fontSize: 12, color: C.mut, display: "block", marginBottom: 5 }}>{label}</label>{children}</div>);
}
const inputStyle = { background: C.panel2, border: `1px solid ${C.line}`, color: C.text, fontSize: 14, borderRadius: 8, padding: "9px 11px", width: "100%", outline: "none", fontFamily: FONT };
function Btn({ children, onClick, primary }) {
  return (<button onClick={onClick} className="flex items-center gap-2 rounded-lg px-4 py-2 font-semibold"
    style={{ background: primary ? GRAD : C.panel2, color: primary ? "#fff" : C.text, fontSize: 13, border: primary ? "none" : `1px solid ${C.line}` }}>{children}</button>);
}
function Modal({ title, onClose, children, onSave, saveLabel = "Save" }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center px-4" style={{ background: "rgba(5,8,18,0.7)", zIndex: 50 }}>
      <Card style={{ padding: 24, width: 460, maxWidth: "100%" }}>
        <div className="flex items-center justify-between mb-5">
          <h2 style={{ fontSize: 17, fontWeight: 600, color: C.text }}>{title}</h2>
          <button onClick={onClose} style={{ color: C.mut }}><X size={18} /></button>
        </div>
        <div className="flex flex-col gap-4">{children}</div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="rounded-lg px-4 py-2" style={{ background: C.panel2, color: C.text, fontSize: 13, border: `1px solid ${C.line}` }}>Cancel</button>
          <button onClick={onSave} className="rounded-lg px-4 py-2 font-semibold" style={{ background: GRAD, color: "#fff", fontSize: 13 }}>{saveLabel}</button>
        </div>
      </Card>
    </div>
  );
}
function Topbar({ title, sub, action }) {
  return (<div className="flex items-end justify-between mb-6"><div>
    <h1 style={{ fontSize: 24, fontWeight: 600, color: C.text, letterSpacing: "-0.01em" }}>{title}</h1>
    {sub && <p style={{ color: C.mut, fontSize: 13, marginTop: 4 }}>{sub}</p>}</div>{action}</div>);
}
const projName = (projects, id) => id === "internal" ? "Internal / KAITEQ" : (projects.find((p) => p.id === id)?.name || "—");

/* --------------------------- Login --------------------------- */
function Login({ onLogin }) {
  const [email, setEmail] = useState(""); const [pw, setPw] = useState(""); const [err, setErr] = useState("");
  const submit = () => { if (!email || !pw) { setErr("Enter your email and password to continue."); return; }
    onLogin(email.toLowerCase().includes("priya") ? "Priya" : "Aaron"); };
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: C.bg, fontFamily: FONT }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none",
        background: `radial-gradient(600px 400px at 30% 20%, rgba(0,184,255,0.10), transparent 60%), radial-gradient(600px 500px at 80% 90%, rgba(123,60,255,0.12), transparent 60%)` }} />
      <div className="w-full max-w-md rounded-2xl p-8 relative" style={{ background: C.panel, border: `1px solid ${C.line}`, boxShadow: "0 24px 80px rgba(0,0,0,0.5)" }}>
        <div className="flex flex-col items-center text-center mb-7"><Logo size={52} />
          <div style={{ letterSpacing: "0.3em", fontWeight: 600, fontSize: 22, color: C.text, marginTop: 14 }}>KAITEQ</div>
          <div style={{ letterSpacing: "0.18em", fontSize: 10, color: C.cyan, marginTop: 4 }}>OPERATIONAL INTELLIGENCE & AUTOMATION</div></div>
        <label style={{ fontSize: 12, color: C.mut }}>Work email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="aaron@kaiteq.com"
          className="w-full rounded-lg px-3 py-2.5 mt-1.5 mb-4 outline-none" style={{ background: C.panel2, border: `1px solid ${C.line}`, color: C.text, fontSize: 14 }} />
        <label style={{ fontSize: 12, color: C.mut }}>Password</label>
        <input value={pw} type="password" onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="••••••••"
          className="w-full rounded-lg px-3 py-2.5 mt-1.5 outline-none" style={{ background: C.panel2, border: `1px solid ${C.line}`, color: C.text, fontSize: 14 }} />
        {err && <div style={{ color: C.orange, fontSize: 12, marginTop: 10 }}>{err}</div>}
        <button onClick={submit} className="w-full rounded-lg py-2.5 mt-6 font-semibold" style={{ background: GRAD, color: "#fff", fontSize: 14 }}>Sign in</button>
        <div style={{ fontSize: 11, color: C.mut2, marginTop: 16, textAlign: "center" }}>Demo sign-in — any email works. Replace with real auth (Supabase) for live use.</div>
      </div>
    </div>
  );
}

/* --------------------------- Sidebar --------------------------- */
const NAV = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "projects", label: "Projects", icon: FolderKanban },
  { key: "tasks", label: "Tasks", icon: ListChecks },
  { key: "meetings", label: "Meetings", icon: CalendarDays },
  { key: "customers", label: "Customers", icon: Users },
  { key: "discovery", label: "Discovery Notes", icon: ClipboardList },
  { key: "proposals", label: "Proposals", icon: Receipt },
  { key: "ai", label: "AI Opportunities", icon: Sparkles },
  { key: "documents", label: "Documents", icon: FileText },
  { key: "workflow", label: "Workflow", icon: Workflow },
];
function Sidebar({ view, setView, user, onLogout }) {
  return (
    <aside className="flex flex-col justify-between" style={{ width: 232, background: C.panel, borderRight: `1px solid ${C.line}`, padding: 18, flexShrink: 0 }}>
      <div>
        <div className="mb-6 px-1"><Wordmark /></div>
        <nav className="flex flex-col gap-0.5">
          {NAV.map((n) => { const active = view === n.key, Icon = n.icon;
            return (<button key={n.key} onClick={() => setView(n.key)} className="flex items-center gap-3 rounded-lg px-3 py-2 text-left"
              style={{ color: active ? "#fff" : C.mut, background: active ? "rgba(65,105,255,0.14)" : "transparent", fontSize: 13.5, fontWeight: active ? 600 : 500 }}>
              <Icon size={17} style={{ color: active ? C.cyan : C.mut2 }} />{n.label}</button>); })}
        </nav>
      </div>
      <div>
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 mb-2" style={{ background: C.panel2 }}>
          <Avatar name={user} /><div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>{user}</div>
            <div style={{ fontSize: 11, color: C.mut2 }}>Founder</div></div></div>
        <button onClick={onLogout} className="flex items-center gap-2 px-3 py-2 rounded-lg w-full" style={{ color: C.mut, fontSize: 13 }}><LogOut size={16} /> Sign out</button>
      </div>
    </aside>
  );
}

/* --------------------------- Dashboard --------------------------- */
function Dashboard({ projects, proposals, opportunities, setView, setActiveProject }) {
  const atRisk = projects.filter((p) => p.health === "risk").length;
  const pipelineValue = projects.reduce((a, p) => a + p.value, 0);
  const openProposals = proposals.filter((q) => q.status === "draft" || q.status === "sent").length;
  const topOpp = [...opportunities].sort((a, b) => oppScore(b) - oppScore(a))[0];
  const stats = [
    { label: "Active projects", value: projects.length, accent: C.cyan },
    { label: "At risk", value: atRisk, accent: C.orange },
    { label: "Pipeline value", value: "£" + pipelineValue.toLocaleString(), accent: C.purple },
    { label: "Open proposals", value: openProposals, accent: C.amber },
  ];
  return (
    <div>
      <Topbar title="Dashboard" sub="The whole business at a glance." />
      <div className="grid grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (<Card key={s.label} style={{ padding: 18 }}>
          <div style={{ fontSize: 12, color: C.mut }}>{s.label}</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: C.text, marginTop: 6 }}>{s.value}</div>
          <div style={{ height: 3, width: 40, borderRadius: 3, marginTop: 10, background: s.accent }} /></Card>))}
      </div>
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 style={{ fontSize: 15, fontWeight: 600, color: C.text }}>Active engagements</h2>
            <button onClick={() => setView("projects")} style={{ fontSize: 12, color: C.cyan }}>View all</button></div>
          <div className="flex flex-col gap-3">
            {projects.length === 0 && <Card style={{ padding: 20 }}><span style={{ color: C.mut, fontSize: 13 }}>No projects yet.</span></Card>}
            {projects.map((p) => (<Card key={p.id} className="cursor-pointer" style={{ padding: 16 }}>
              <div onClick={() => { setActiveProject(p.id); setView("projects"); }}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2"><span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{p.name}</span><HealthPill health={p.health} /></div>
                  <span style={{ fontSize: 12, color: C.mut }}>{p.client}</span></div>
                <div className="flex items-center gap-2 mb-3" style={{ fontSize: 12, color: C.mut2 }}>
                  <span>{STAGES[p.stageIdx].name}</span><span>·</span><span>{progressOf(p)}% complete</span></div>
                <Pipeline stageIdx={p.stageIdx} compact /></div></Card>))}
          </div>
        </div>
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 12 }}>Upcoming meetings</h2>
          <div className="flex flex-col gap-2 mb-5">
            {seedMeetings.slice(0, 3).map((m) => (<Card key={m.id} style={{ padding: 12 }}>
              <div className="flex items-center gap-2 mb-1"><Video size={14} style={{ color: C.cyan }} /><span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{m.title}</span></div>
              <div style={{ fontSize: 12, color: C.mut }}>{m.client}</div>
              <div className="flex items-center gap-1 mt-1" style={{ fontSize: 11, color: C.mut2 }}><Clock size={11} /> {m.when}</div></Card>))}
          </div>
          {topOpp && (<><h2 style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 10 }}>Top AI opportunity</h2>
            <Card style={{ padding: 14 }}>
              <div className="flex items-center gap-2 mb-1"><Sparkles size={15} style={{ color: C.amber }} /><span style={{ fontSize: 12, color: C.mut }}>{topOpp.client}</span></div>
              <div style={{ fontSize: 13, color: C.text, marginBottom: 8 }}>{topOpp.idea}</div>
              <PriorityPill o={topOpp} /></Card></>)}
        </div>
      </div>
    </div>
  );
}

/* --------------------------- Projects --------------------------- */
function NewProjectModal({ onClose, onCreate }) {
  const [f, setF] = useState({ name: "", client: "", lead: "Aaron", value: "", tags: "", stageIdx: 0 });
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const save = () => { if (!f.name.trim() || !f.client.trim()) return;
    onCreate({ id: "p" + Date.now(), name: f.name.trim(), client: f.client.trim(), lead: f.lead,
      value: Number(f.value) || 0, health: "on", stageIdx: Number(f.stageIdx),
      tags: f.tags.split(",").map((t) => t.trim()).filter(Boolean) }); onClose(); };
  return (<Modal title="New project" onClose={onClose} onSave={save} saveLabel="Create project">
    <Field label="Project name"><input style={inputStyle} value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Invoice processing automation" /></Field>
    <Field label="Client / company"><input style={inputStyle} value={f.client} onChange={(e) => set("client", e.target.value)} placeholder="e.g. Acme Ltd" /></Field>
    <div className="grid grid-cols-2 gap-3">
      <Field label="Lead"><select style={inputStyle} value={f.lead} onChange={(e) => set("lead", e.target.value)}><option>Aaron</option><option>Priya</option></select></Field>
      <Field label="Value (£)"><input style={inputStyle} type="number" value={f.value} onChange={(e) => set("value", e.target.value)} placeholder="0" /></Field></div>
    <Field label="Starting stage"><select style={inputStyle} value={f.stageIdx} onChange={(e) => set("stageIdx", e.target.value)}>
      {STAGES.map((s, i) => <option key={s.key} value={i}>{i + 1}. {s.name}</option>)}</select></Field>
    <Field label="Tags (comma separated)"><input style={inputStyle} value={f.tags} onChange={(e) => set("tags", e.target.value)} placeholder="Automation, AI" /></Field>
  </Modal>);
}
function TaskCard({ t, onMove }) {
  const type = TASK_TYPES.find((x) => x.key === t.type);
  return (<div className="rounded-lg p-2.5" style={{ background: C.panel2, border: `1px solid ${C.line}` }}>
    <div style={{ fontSize: 12.5, color: C.text, marginBottom: 6 }}>{t.title}</div>
    <div className="flex items-center justify-between">
      <Chip label={type.label} color={type.color} />
      <div className="flex gap-1">{COLS.map((c) => (<button key={c.key} onClick={() => onMove(t.id, c.key)} title={"Move to " + c.label}
        style={{ width: 13, height: 4, borderRadius: 3, border: "none", cursor: "pointer", background: c.key === t.col ? GRAD : C.line }} />))}</div></div></div>);
}
function ProjectDetail({ project, tasks, onBack, onSetStage, onMoveTask, onDelete, onAddTask, discovery, setView }) {
  const p = project;
  const ptasks = tasks.filter((t) => t.projectId === p.id);
  const discAnswered = Object.keys(discovery[p.id] || {}).length;
  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1 mb-4" style={{ color: C.mut, fontSize: 13 }}><ChevronRight size={14} style={{ transform: "rotate(180deg)" }} /> All projects</button>
      <div className="flex items-start justify-between mb-5">
        <div><div className="flex items-center gap-3"><h1 style={{ fontSize: 22, fontWeight: 600, color: C.text }}>{p.name}</h1><HealthPill health={p.health} /></div>
          <div className="flex items-center gap-2 mt-1" style={{ fontSize: 13, color: C.mut }}><Building2 size={14} /> {p.client} · Lead <Avatar name={p.lead} size={18} /> {p.lead}</div></div>
        <div className="flex items-center gap-2">
          <button onClick={() => onSetStage(p.id, p.stageIdx - 1)} disabled={p.stageIdx === 0} className="flex items-center gap-2 rounded-lg px-3 py-2"
            style={{ background: C.panel2, color: p.stageIdx === 0 ? C.mut2 : C.text, fontSize: 13, border: `1px solid ${C.line}`, cursor: p.stageIdx === 0 ? "default" : "pointer" }}><ArrowLeft size={15} /> Previous</button>
          <button onClick={() => onSetStage(p.id, p.stageIdx + 1)} disabled={p.stageIdx === STAGES.length - 1} className="flex items-center gap-2 rounded-lg px-4 py-2 font-semibold"
            style={{ background: p.stageIdx === STAGES.length - 1 ? C.panel2 : GRAD, color: p.stageIdx === STAGES.length - 1 ? C.mut2 : "#fff", fontSize: 13, cursor: p.stageIdx === STAGES.length - 1 ? "default" : "pointer" }}>Advance stage <ArrowRight size={15} /></button>
          <button onClick={() => { if (window.confirm("Delete this project?")) { onDelete(p.id); onBack(); } }} className="flex items-center justify-center rounded-lg"
            style={{ width: 38, height: 38, background: C.panel2, color: C.mut, border: `1px solid ${C.line}` }} title="Delete project"><Trash2 size={15} /></button>
        </div>
      </div>
      <Card style={{ padding: 20, marginBottom: 20 }}>
        <div className="flex items-center justify-between mb-4"><h2 style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Delivery pipeline</h2>
          <span style={{ fontSize: 12, color: C.mut }}>{progressOf(p)}% complete · click a stage to jump</span></div>
        <div className="grid grid-cols-8 gap-1">
          {STAGES.map((s, i) => { const done = i < p.stageIdx, active = i === p.stageIdx;
            return (<div key={s.key} className="text-center cursor-pointer" onClick={() => onSetStage(p.id, i)}>
              <div className="mx-auto flex items-center justify-center rounded-full mb-2" style={{ width: 32, height: 32, background: done || active ? GRAD : C.panel2, border: done || active ? "none" : `1px solid ${C.line}`, boxShadow: active ? "0 0 0 4px rgba(0,184,255,0.16)" : "none" }}>
                {done ? <CircleCheck size={16} color="#fff" /> : active ? <CircleDot size={16} color="#fff" /> : <Circle size={14} color={C.mut2} />}</div>
              <div style={{ fontSize: 9.5, lineHeight: 1.2, color: done || active ? C.text : C.mut2 }}>{s.name}</div></div>); })}
        </div>
        <div className="mt-4 rounded-lg p-3" style={{ background: C.panel2 }}>
          <div style={{ fontSize: 12, color: C.cyan, fontWeight: 600 }}>Current: {STAGES[p.stageIdx].name}</div>
          <div style={{ fontSize: 12.5, color: C.mut, marginTop: 3 }}>{STAGES[p.stageIdx].desc}</div></div>
        {discAnswered > 0 && <button onClick={() => setView("discovery")} className="flex items-center gap-1.5 mt-3" style={{ fontSize: 12, color: C.cyan }}>
          <ClipboardList size={13} /> Discovery notes: {discAnswered}/{DISCOVERY_QUESTIONS.length} captured</button>}
      </Card>
      <div className="flex items-center justify-between mb-3">
        <h2 style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Build board</h2>
        <button onClick={() => onAddTask(p.id)} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5" style={{ background: C.panel2, color: C.text, fontSize: 12, border: `1px solid ${C.line}` }}><Plus size={13} /> Add task</button></div>
      <div className="grid grid-cols-5 gap-2.5">
        {COLS.map((col) => { const items = ptasks.filter((t) => t.col === col.key);
          return (<div key={col.key} className="rounded-xl p-2.5" style={{ background: C.panel, border: `1px solid ${C.line}` }}>
            <div className="flex items-center justify-between mb-3"><span style={{ fontSize: 11.5, fontWeight: 600, color: col.color }}>{col.label}</span><span style={{ fontSize: 11, color: C.mut2 }}>{items.length}</span></div>
            <div className="flex flex-col gap-2">{items.map((t) => <TaskCard key={t.id} t={t} onMove={onMoveTask} />)}
              {items.length === 0 && <div style={{ fontSize: 11, color: C.mut2, padding: "4px 0" }}>—</div>}</div></div>); })}
      </div>
    </div>
  );
}
function Projects({ projects, tasks, discovery, activeProject, setActiveProject, onSetStage, onMoveTask, onDelete, onNew, onAddTask, setView }) {
  const p = projects.find((x) => x.id === activeProject);
  if (p) return <ProjectDetail project={p} tasks={tasks} discovery={discovery} onBack={() => setActiveProject(null)} onSetStage={onSetStage} onMoveTask={onMoveTask} onDelete={onDelete} onAddTask={onAddTask} setView={setView} />;
  return (
    <div>
      <Topbar title="Projects" sub="Every engagement and the stages left to complete." action={<Btn primary onClick={onNew}><Plus size={15} /> New project</Btn>} />
      <div className="flex flex-col gap-3">
        {projects.length === 0 && <Card style={{ padding: 24 }}><span style={{ color: C.mut, fontSize: 13 }}>No projects yet — click “New project”.</span></Card>}
        {projects.map((p) => (<Card key={p.id} className="cursor-pointer" style={{ padding: 18 }}>
          <div onClick={() => setActiveProject(p.id)}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3"><span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{p.name}</span><HealthPill health={p.health} />
                {p.tags.map((t) => <Chip key={t} label={t} color={C.mut} />)}</div>
              <div className="flex items-center gap-2"><Avatar name={p.lead} size={20} /><span style={{ fontSize: 12, color: C.mut }}>{p.client}</span></div></div>
            <div className="flex items-center justify-between mb-3">
              <span style={{ fontSize: 12, color: C.cyan }}>{STAGES[p.stageIdx].name}</span>
              <span style={{ fontSize: 12, color: C.mut2 }}>{progressOf(p)}% · {p.value ? "£" + p.value.toLocaleString() : "Pre-sales"}</span></div>
            <Pipeline stageIdx={p.stageIdx} /></div></Card>))}
      </div>
    </div>
  );
}

/* --------------------------- Tasks --------------------------- */
function TaskModal({ projects, preset, onClose, onCreate }) {
  const [f, setF] = useState({ title: "", projectId: preset || (projects[0]?.id || "internal"), type: "sprint", col: "todo" });
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const save = () => { if (!f.title.trim()) return; onCreate({ id: "t" + Date.now(), title: f.title.trim(), projectId: f.projectId, type: f.type, col: f.col }); onClose(); };
  return (<Modal title="Add task" onClose={onClose} onSave={save} saveLabel="Add task">
    <Field label="Task"><input style={inputStyle} value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Build intake bot logic" /></Field>
    <Field label="Project"><select style={inputStyle} value={f.projectId} onChange={(e) => set("projectId", e.target.value)}>
      {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}<option value="internal">Internal / KAITEQ</option></select></Field>
    <div className="grid grid-cols-2 gap-3">
      <Field label="Type"><select style={inputStyle} value={f.type} onChange={(e) => set("type", e.target.value)}>{TASK_TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}</select></Field>
      <Field label="Status"><select style={inputStyle} value={f.col} onChange={(e) => set("col", e.target.value)}>{COLS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}</select></Field></div>
  </Modal>);
}
function Tasks({ projects, tasks, onMoveTask, onDeleteTask, onNew }) {
  const [filter, setFilter] = useState("all");
  const shown = filter === "all" ? tasks : tasks.filter((t) => t.projectId === filter);
  return (
    <div>
      <Topbar title="Tasks" sub="Sprint work, bugs, client actions and internal actions — across everything."
        action={<Btn primary onClick={() => onNew(null)}><Plus size={15} /> Add task</Btn>} />
      <div className="flex items-center gap-2 mb-4">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ ...inputStyle, width: "auto", padding: "7px 11px" }}>
          <option value="all">All projects</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}<option value="internal">Internal / KAITEQ</option></select>
      </div>
      <div className="grid grid-cols-5 gap-2.5">
        {COLS.map((col) => { const items = shown.filter((t) => t.col === col.key);
          return (<div key={col.key} className="rounded-xl p-2.5" style={{ background: C.panel, border: `1px solid ${C.line}` }}>
            <div className="flex items-center justify-between mb-3"><span style={{ fontSize: 11.5, fontWeight: 600, color: col.color }}>{col.label}</span><span style={{ fontSize: 11, color: C.mut2 }}>{items.length}</span></div>
            <div className="flex flex-col gap-2">{items.map((t) => { const type = TASK_TYPES.find((x) => x.key === t.type);
              return (<div key={t.id} className="rounded-lg p-2.5 group" style={{ background: C.panel2, border: `1px solid ${C.line}` }}>
                <div className="flex items-start justify-between gap-1"><div style={{ fontSize: 12.5, color: C.text, marginBottom: 4 }}>{t.title}</div>
                  <button onClick={() => onDeleteTask(t.id)} style={{ color: C.mut2 }} title="Delete"><X size={13} /></button></div>
                <div style={{ fontSize: 10.5, color: C.mut2, marginBottom: 6 }}>{projName(projects, t.projectId)}</div>
                <div className="flex items-center justify-between"><Chip label={type.label} color={type.color} />
                  <div className="flex gap-1">{COLS.map((c) => (<button key={c.key} onClick={() => onMoveTask(t.id, c.key)} title={"Move to " + c.label}
                    style={{ width: 12, height: 4, borderRadius: 3, border: "none", cursor: "pointer", background: c.key === t.col ? GRAD : C.line }} />))}</div></div></div>); })}
              {items.length === 0 && <div style={{ fontSize: 11, color: C.mut2, padding: "4px 0" }}>—</div>}</div></div>); })}
      </div>
    </div>
  );
}

/* --------------------------- Discovery Notes --------------------------- */
function Discovery({ projects, discovery, onAnswer }) {
  const [pid, setPid] = useState(projects[0]?.id || "");
  const answers = discovery[pid] || {};
  const answered = Object.values(answers).filter((v) => v && v.trim()).length;
  if (projects.length === 0) return (<div><Topbar title="Discovery Notes" /><Card style={{ padding: 24 }}><span style={{ color: C.mut, fontSize: 13 }}>Add a project first.</span></Card></div>);
  return (
    <div>
      <Topbar title="Discovery Notes" sub="Structured questions and answers, captured per client." />
      <div className="flex items-center justify-between mb-5">
        <select value={pid} onChange={(e) => setPid(e.target.value)} style={{ ...inputStyle, width: "auto", padding: "8px 12px" }}>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.client} — {p.name}</option>)}</select>
        <span style={{ fontSize: 12, color: answered === DISCOVERY_QUESTIONS.length ? C.green : C.mut }}>{answered}/{DISCOVERY_QUESTIONS.length} answered</span>
      </div>
      <div className="flex flex-col gap-3">
        {DISCOVERY_QUESTIONS.map((q, i) => (<Card key={i} style={{ padding: 16 }}>
          <div className="flex items-start gap-2 mb-2"><span style={{ fontSize: 12, color: C.cyan, fontWeight: 700, marginTop: 1 }}>{i + 1}</span>
            <span style={{ fontSize: 13.5, color: C.text, fontWeight: 500 }}>{q}</span></div>
          <textarea value={answers[i] || ""} onChange={(e) => onAnswer(pid, i, e.target.value)} placeholder="Type the client's answer…" rows={2}
            style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }} /></Card>))}
      </div>
      <div style={{ fontSize: 12, color: C.mut2, marginTop: 12 }}>Answers save automatically as you type.</div>
    </div>
  );
}

/* --------------------------- Proposals --------------------------- */
function ProposalModal({ onClose, onCreate }) {
  const [f, setF] = useState({ client: "", title: "", value: "", status: "draft", date: new Date().toISOString().slice(0, 10) });
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const save = () => { if (!f.client.trim() || !f.title.trim()) return; onCreate({ id: "q" + Date.now(), client: f.client.trim(), title: f.title.trim(), value: Number(f.value) || 0, status: f.status, date: f.date }); onClose(); };
  return (<Modal title="New proposal" onClose={onClose} onSave={save} saveLabel="Create proposal">
    <Field label="Client"><input style={inputStyle} value={f.client} onChange={(e) => set("client", e.target.value)} placeholder="e.g. Acme Ltd" /></Field>
    <Field label="Title"><input style={inputStyle} value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Warehouse automation — Phase 1" /></Field>
    <div className="grid grid-cols-2 gap-3">
      <Field label="Value (£)"><input style={inputStyle} type="number" value={f.value} onChange={(e) => set("value", e.target.value)} placeholder="0" /></Field>
      <Field label="Status"><select style={inputStyle} value={f.status} onChange={(e) => set("status", e.target.value)}>{PROPOSAL_STATUS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}</select></Field></div>
    <Field label="Date"><input style={inputStyle} type="date" value={f.date} onChange={(e) => set("date", e.target.value)} /></Field>
  </Modal>);
}
function Proposals({ proposals, onNew, onStatus, onDelete }) {
  const sumByStatus = (keys) => proposals.filter((q) => keys.includes(q.status)).reduce((a, q) => a + q.value, 0);
  const stats = [
    { label: "Out for decision", value: "£" + sumByStatus(["draft", "sent"]).toLocaleString(), accent: C.cyan },
    { label: "Won", value: "£" + sumByStatus(["accepted"]).toLocaleString(), accent: C.green },
    { label: "Total proposals", value: proposals.length, accent: C.purple },
  ];
  return (
    <div>
      <Topbar title="Proposals" sub="Track every quote from draft to decision." action={<Btn primary onClick={onNew}><Plus size={15} /> New proposal</Btn>} />
      <div className="grid grid-cols-3 gap-4 mb-5">{stats.map((s) => (<Card key={s.label} style={{ padding: 16 }}>
        <div style={{ fontSize: 12, color: C.mut }}>{s.label}</div><div style={{ fontSize: 22, fontWeight: 700, color: C.text, marginTop: 4 }}>{s.value}</div>
        <div style={{ height: 3, width: 36, borderRadius: 3, marginTop: 8, background: s.accent }} /></Card>))}</div>
      <div className="flex flex-col gap-2">{proposals.map((q) => { const st = PROPOSAL_STATUS.find((s) => s.key === q.status);
        return (<Card key={q.id} style={{ padding: 16 }}>
          <div className="flex items-center justify-between">
            <div><div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{q.title}</div>
              <div style={{ fontSize: 12, color: C.mut, marginTop: 2 }}>{q.client} · {q.date}</div></div>
            <div className="flex items-center gap-4">
              <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>£{q.value.toLocaleString()}</span>
              <select value={q.status} onChange={(e) => onStatus(q.id, e.target.value)} style={{ background: C.panel2, color: st.color, border: `1px solid ${st.color}44`, borderRadius: 6, fontSize: 12, padding: "5px 8px", outline: "none" }}>
                {PROPOSAL_STATUS.map((s) => <option key={s.key} value={s.key} style={{ color: C.text, background: C.panel2 }}>{s.label}</option>)}</select>
              <button onClick={() => onDelete(q.id)} style={{ color: C.mut2 }} title="Delete"><Trash2 size={15} /></button></div></div></Card>); })}
      </div>
    </div>
  );
}

/* --------------------------- AI Opportunities --------------------------- */
function oppScore(o) { return o.value * 2 - o.effort - o.risk; }
function oppPriority(o) { const s = oppScore(o); return s >= 4 ? { label: "High priority", color: C.green } : s >= 0 ? { label: "Medium", color: C.amber } : { label: "Low", color: C.mut }; }
function Meter({ label, n, color }) {
  return (<div className="flex items-center gap-2"><span style={{ fontSize: 11, color: C.mut, width: 42 }}>{label}</span>
    <div className="flex gap-1">{[1, 2, 3, 4, 5].map((i) => <div key={i} style={{ width: 14, height: 5, borderRadius: 2, background: i <= n ? color : C.line }} />)}</div></div>);
}
function PriorityPill({ o }) { const p = oppPriority(o);
  return (<span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5" style={{ fontSize: 11, color: p.color, background: `${p.color}1f` }}><TrendingUp size={12} /> {p.label}</span>); }
function OppModal({ onClose, onCreate }) {
  const [f, setF] = useState({ client: "", idea: "", value: 3, effort: 3, risk: 3 });
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const save = () => { if (!f.client.trim() || !f.idea.trim()) return; onCreate({ id: "o" + Date.now(), client: f.client.trim(), idea: f.idea.trim(), value: Number(f.value), effort: Number(f.effort), risk: Number(f.risk) }); onClose(); };
  const sel = (k) => (<select style={inputStyle} value={f[k]} onChange={(e) => set(k, e.target.value)}>{[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}</select>);
  return (<Modal title="New AI opportunity" onClose={onClose} onSave={save} saveLabel="Add opportunity">
    <Field label="Client"><input style={inputStyle} value={f.client} onChange={(e) => set("client", e.target.value)} placeholder="e.g. Acme Ltd" /></Field>
    <Field label="Automation / AI idea"><input style={inputStyle} value={f.idea} onChange={(e) => set("idea", e.target.value)} placeholder="e.g. Auto-summarise inbound emails" /></Field>
    <div className="grid grid-cols-3 gap-3"><Field label="Value (1–5)">{sel("value")}</Field><Field label="Effort (1–5)">{sel("effort")}</Field><Field label="Risk (1–5)">{sel("risk")}</Field></div>
  </Modal>);
}
function AIOpportunities({ opportunities, onNew, onDelete }) {
  const sorted = [...opportunities].sort((a, b) => oppScore(b) - oppScore(a));
  return (
    <div>
      <Topbar title="AI Opportunities" sub="Automation ideas per client, ranked by value, effort and risk." action={<Btn primary onClick={onNew}><Plus size={15} /> New opportunity</Btn>} />
      <div className="grid grid-cols-2 gap-4">{sorted.map((o) => (<Card key={o.id} style={{ padding: 18 }}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2"><Lightbulb size={16} style={{ color: C.amber }} /><span style={{ fontSize: 12, color: C.mut }}>{o.client}</span></div>
          <div className="flex items-center gap-2"><PriorityPill o={o} /><button onClick={() => onDelete(o.id)} style={{ color: C.mut2 }} title="Delete"><Trash2 size={14} /></button></div></div>
        <div style={{ fontSize: 14, color: C.text, fontWeight: 500, marginBottom: 12 }}>{o.idea}</div>
        <div className="flex flex-col gap-1.5"><Meter label="Value" n={o.value} color={C.green} /><Meter label="Effort" n={o.effort} color={C.cyan} /><Meter label="Risk" n={o.risk} color={C.orange} /></div></Card>))}
      </div>
    </div>
  );
}

/* --------------------------- Meetings / Customers / Documents --------------------------- */
function Meetings() {
  const typeColor = { Discovery: C.cyan, Review: C.purple, Demo: C.amber };
  return (<div><Topbar title="Meetings" sub="Scheduled sessions with your customers." action={<Btn primary><Plus size={15} /> Schedule</Btn>} />
    <div className="flex flex-col gap-3">{seedMeetings.map((m) => (<Card key={m.id} style={{ padding: 16 }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4"><div className="flex items-center justify-center rounded-lg" style={{ width: 42, height: 42, background: C.panel2 }}><Video size={20} style={{ color: typeColor[m.type] }} /></div>
          <div><div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{m.title}</div><div style={{ fontSize: 12, color: C.mut }}>{m.client}</div></div></div>
        <div className="flex items-center gap-5"><Chip label={m.type} color={typeColor[m.type]} />
          <div className="flex items-center gap-1" style={{ fontSize: 12.5, color: C.text }}><Clock size={13} style={{ color: C.mut }} /> {m.when}</div>
          <div className="flex items-center gap-1.5" style={{ fontSize: 12, color: C.mut }}><Avatar name={m.lead} size={18} /> {m.lead}</div></div></div></Card>))}</div></div>);
}
function Customers() {
  const [open, setOpen] = useState(null);
  const c = seedCustomers.find((x) => x.id === open);
  if (c) return (<div>
    <button onClick={() => setOpen(null)} className="flex items-center gap-1 mb-4" style={{ color: C.mut, fontSize: 13 }}><ChevronRight size={14} style={{ transform: "rotate(180deg)" }} /> All customers</button>
    <div className="grid grid-cols-3 gap-5">
      <Card style={{ padding: 20 }}><h2 style={{ fontSize: 18, fontWeight: 600, color: C.text }}>{c.company}</h2>
        <div style={{ fontSize: 13, color: C.mut, marginBottom: 16 }}>{c.contact} · {c.role}</div>
        {[[Mail, c.email], [Phone, c.phone], [Globe, c.site], [MapPin, c.location]].map(([Ic, v], i) => (
          <div key={i} className="flex items-center gap-2.5 mb-2.5" style={{ fontSize: 13, color: C.text }}><Ic size={15} style={{ color: C.cyan }} /> {v}</div>))}</Card>
      <Card className="col-span-2" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 8 }}>Account notes</h3>
        <p style={{ fontSize: 13, color: C.mut, lineHeight: 1.6, marginBottom: 20 }}>{c.notes}</p>
        <div className="flex items-center justify-between mb-3"><h3 style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Documents from meetings</h3>
          <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5" style={{ background: C.panel2, color: C.text, fontSize: 12, border: `1px solid ${C.line}` }}><Upload size={13} /> Upload</button></div>
        <div className="flex flex-col gap-2">{c.docs.map((d) => (<div key={d} className="flex items-center gap-2 rounded-lg px-3 py-2.5" style={{ background: C.panel2, border: `1px solid ${C.line}` }}>
          <Paperclip size={14} style={{ color: C.purple }} /><span style={{ fontSize: 13, color: C.text }}>{d}</span></div>))}</div></Card></div></div>);
  return (<div><Topbar title="Customers" sub="Contacts, context and the docs you gather along the way." action={<Btn primary><Plus size={15} /> Add customer</Btn>} />
    <div className="grid grid-cols-3 gap-4">{seedCustomers.map((c) => (<Card key={c.id} className="cursor-pointer" style={{ padding: 18 }}>
      <div onClick={() => setOpen(c.id)}><div className="flex items-center gap-3 mb-3"><div className="flex items-center justify-center rounded-lg" style={{ width: 40, height: 40, background: GRAD, color: "#fff", fontWeight: 700 }}>{c.company.slice(0, 1)}</div>
        <div><div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{c.company}</div><div style={{ fontSize: 12, color: C.mut }}>{c.contact}</div></div></div>
        <div className="flex items-center justify-between" style={{ fontSize: 12, color: C.mut2 }}>
          <span className="flex items-center gap-1"><Paperclip size={12} /> {c.docs.length} docs</span>
          <span className="flex items-center gap-1" style={{ color: C.cyan }}>Open <ChevronRight size={13} /></span></div></div></Card>))}</div></div>);
}
function Documents() {
  const cats = [...new Set(seedDocs.map((d) => d.cat))];
  const catColor = { Legal: C.purple, Templates: C.cyan, Compliance: C.orange, Brand: C.amber };
  return (<div><Topbar title="Documents" sub="Your own paperwork, templates and records." action={<Btn primary><Upload size={15} /> Upload</Btn>} />
    {cats.map((cat) => (<div key={cat} className="mb-6"><h2 style={{ fontSize: 13, fontWeight: 600, color: C.mut, marginBottom: 10, letterSpacing: "0.04em" }}>{cat.toUpperCase()}</h2>
      <div className="grid grid-cols-3 gap-3">{seedDocs.filter((d) => d.cat === cat).map((d) => (<Card key={d.id} style={{ padding: 14 }}>
        <div className="flex items-center gap-3"><div className="flex items-center justify-center rounded-lg" style={{ width: 38, height: 38, background: C.panel2 }}><FileText size={18} style={{ color: catColor[cat] }} /></div>
          <span style={{ fontSize: 13, color: C.text }}>{d.name}</span></div></Card>))}</div></div>))}</div>);
}

/* --------------------------- Workflow --------------------------- */
function WorkflowView() {
  return (<div><Topbar title="Workflow" sub="How KAITEQ runs — client delivery, and how we build the app itself." />
    <h2 style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 12 }}>Client delivery lifecycle</h2>
    <div className="flex flex-col gap-3">{STAGES.map((s, i) => (<Card key={s.key} style={{ padding: 16 }}>
      <div className="flex items-start gap-4"><div className="flex items-center justify-center rounded-xl flex-shrink-0" style={{ width: 44, height: 44, background: GRAD }}><s.icon size={20} color="#fff" /></div>
        <div className="flex-1"><div className="flex items-center gap-3"><span style={{ fontSize: 12, color: C.mut2, fontWeight: 700 }}>{String(i + 1).padStart(2, "0")}</span>
          <span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{s.name}</span><Chip label={"DevOps · " + s.devops} color={C.cyan} /></div>
          <p style={{ fontSize: 13, color: C.mut, marginTop: 6, lineHeight: 1.55 }}>{s.desc}</p></div></div></Card>))}</div>
    <h2 style={{ fontSize: 14, fontWeight: 600, color: C.text, margin: "28px 0 12px" }}>How we build KAITEQ</h2>
    <Card style={{ padding: 18 }}>
      <div className="flex items-center flex-wrap gap-2 mb-4">{DEV_FLOW.map((d, i) => (<React.Fragment key={d}>
        <span style={{ fontSize: 13, fontWeight: 600, color: C.text, background: C.panel2, padding: "6px 14px", borderRadius: 8, border: `1px solid ${C.line}` }}>{d}</span>
        {i < DEV_FLOW.length - 1 && <ArrowRight size={14} style={{ color: C.mut2 }} />}</React.Fragment>))}</div>
      <p style={{ fontSize: 13, color: C.mut, lineHeight: 1.6 }}>Keep every feature small and shippable — e.g. “Add meeting notes form”, “Add project status dropdown”, “Add proposal generator”. Ship it, see it working, then pick the next one.</p></Card>
    <Card style={{ padding: 16, marginTop: 16, background: C.panel2 }}>
      <p style={{ fontSize: 13, color: C.mut, lineHeight: 1.6 }}><span style={{ color: C.cyan, fontWeight: 600 }}>It's a loop, not a line.</span> Stage 8 (Support / Optimise) surfaces the next AI opportunity, which becomes the next lead — and the cycle restarts.</p></Card>
  </div>);
}

/* --------------------------- Root --------------------------- */
export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("dashboard");
  const init = loadData();
  const [projects, setProjects] = useState(init.projects);
  const [tasks, setTasks] = useState(init.tasks);
  const [proposals, setProposals] = useState(init.proposals);
  const [opportunities, setOpportunities] = useState(init.opportunities);
  const [discovery, setDiscovery] = useState(init.discovery);
  const [activeProject, setActiveProject] = useState(null);
  const [modal, setModal] = useState(null); // {type, preset}

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ projects, tasks, proposals, opportunities, discovery })); } catch (e) {}
  }, [projects, tasks, proposals, opportunities, discovery]);

  const setStage = (id, idx) => setProjects((ps) => ps.map((p) => p.id === id ? { ...p, stageIdx: Math.max(0, Math.min(STAGES.length - 1, idx)) } : p));
  const addProject = (proj) => setProjects((ps) => [proj, ...ps]);
  const deleteProject = (id) => { setProjects((ps) => ps.filter((p) => p.id !== id)); setTasks((ts) => ts.filter((t) => t.projectId !== id)); };
  const addTask = (task) => setTasks((ts) => [task, ...ts]);
  const moveTask = (id, col) => setTasks((ts) => ts.map((t) => t.id === id ? { ...t, col } : t));
  const deleteTask = (id) => setTasks((ts) => ts.filter((t) => t.id !== id));
  const addProposal = (q) => setProposals((qs) => [q, ...qs]);
  const setProposalStatus = (id, status) => setProposals((qs) => qs.map((q) => q.id === id ? { ...q, status } : q));
  const deleteProposal = (id) => setProposals((qs) => qs.filter((q) => q.id !== id));
  const addOpp = (o) => setOpportunities((os) => [o, ...os]);
  const deleteOpp = (id) => setOpportunities((os) => os.filter((o) => o.id !== id));
  const setAnswer = (pid, i, text) => setDiscovery((d) => ({ ...d, [pid]: { ...(d[pid] || {}), [i]: text } }));

  if (!user) return <Login onLogin={setUser} />;

  return (
    <div className="flex min-h-screen" style={{ background: C.bg, fontFamily: FONT, color: C.text }}>
      <Sidebar view={view} setView={(v) => { setView(v); setActiveProject(null); }} user={user} onLogout={() => { setUser(null); setView("dashboard"); }} />
      <main className="flex-1 overflow-auto" style={{ padding: "28px 32px" }}>
        {view === "dashboard" && <Dashboard projects={projects} proposals={proposals} opportunities={opportunities} setView={setView} setActiveProject={setActiveProject} />}
        {view === "projects" && <Projects projects={projects} tasks={tasks} discovery={discovery} activeProject={activeProject} setActiveProject={setActiveProject}
          onSetStage={setStage} onMoveTask={moveTask} onDelete={deleteProject} onNew={() => setModal({ type: "project" })} onAddTask={(pid) => setModal({ type: "task", preset: pid })} setView={setView} />}
        {view === "tasks" && <Tasks projects={projects} tasks={tasks} onMoveTask={moveTask} onDeleteTask={deleteTask} onNew={() => setModal({ type: "task" })} />}
        {view === "meetings" && <Meetings />}
        {view === "customers" && <Customers />}
        {view === "discovery" && <Discovery projects={projects} discovery={discovery} onAnswer={setAnswer} />}
        {view === "proposals" && <Proposals proposals={proposals} onNew={() => setModal({ type: "proposal" })} onStatus={setProposalStatus} onDelete={deleteProposal} />}
        {view === "ai" && <AIOpportunities opportunities={opportunities} onNew={() => setModal({ type: "opp" })} onDelete={deleteOpp} />}
        {view === "documents" && <Documents />}
        {view === "workflow" && <WorkflowView />}
      </main>
      {modal?.type === "project" && <NewProjectModal onClose={() => setModal(null)} onCreate={addProject} />}
      {modal?.type === "task" && <TaskModal projects={projects} preset={modal.preset} onClose={() => setModal(null)} onCreate={addTask} />}
      {modal?.type === "proposal" && <ProposalModal onClose={() => setModal(null)} onCreate={addProposal} />}
      {modal?.type === "opp" && <OppModal onClose={() => setModal(null)} onCreate={addOpp} />}
    </div>
  );
}
