import React, { useState, useEffect } from "react";
import {
  LayoutDashboard, FolderKanban, CalendarDays, Users, FileText, Workflow,
  LogOut, Search, Plus, Clock, CircleCheck, CircleDot, Circle, ChevronRight,
  Phone, Mail, Globe, MapPin, Building2, Paperclip, Upload, ArrowRight, ArrowLeft,
  Brain, Cog, Share2, BarChart3, AlertTriangle, CheckCircle2, Video, X, Trash2
} from "lucide-react";

/* ---------------------------------------------------------------------------
   KAITEQ — Operational Intelligence & Automation
   Internal delivery platform. Projects persist in the browser (localStorage).
--------------------------------------------------------------------------- */

const C = {
  bg: "#0B0F1E", panel: "#0F1426", panel2: "#131A30", line: "#1E2742",
  cyan: "#00B8FF", blue: "#4169FF", purple: "#7B3CFF", orange: "#FF8A00", amber: "#FFC433",
  text: "#EAF0FF", mut: "#8A93AE", mut2: "#5E6788",
};
const GRAD = `linear-gradient(135deg, ${C.cyan} 0%, ${C.blue} 50%, ${C.purple} 100%)`;
const FONT = "Inter, 'Segoe UI', system-ui, -apple-system, sans-serif";
const STORAGE_KEY = "kaiteq_projects_v1";

const STAGES = [
  { key: "discover", name: "Discovery & Qualify", devops: "Plan", icon: Search,
    desc: "Discovery call, qualify the opportunity, capture goals, pains and current-state operations. Decide if it's a fit." },
  { key: "scope", name: "Scope & Proposal", devops: "Plan", icon: FileText,
    desc: "Define scope and success metrics, write the SOW/proposal, agree pricing and sign the contract." },
  { key: "design", name: "Design & Architecture", devops: "Develop", icon: Workflow,
    desc: "Map the target process, design the automation/integration architecture and the technical delivery plan." },
  { key: "build", name: "Build & Automate", devops: "Build", icon: Cog,
    desc: "Build in short sprints — automations, integrations and dashboards — with a demo at the end of each sprint." },
  { key: "test", name: "Test & Validate", devops: "Test", icon: CircleCheck,
    desc: "QA plus client user-acceptance testing. Validate against the success metrics agreed at scoping." },
  { key: "deploy", name: "Deploy & Integrate", devops: "Release / Deploy", icon: Share2,
    desc: "Go live, integrate into the client's live systems, run hypercare and hand over documentation." },
  { key: "optimise", name: "Optimise & Support", devops: "Operate / Monitor", icon: BarChart3,
    desc: "Monitor in production, measure realised impact, iterate and continuously improve. Feeds the next loop." },
];

const seedProjects = [
  { id: "p1", client: "Northwind Logistics", name: "Warehouse intake automation", lead: "Aaron", value: 42000, health: "on", stageIdx: 3, tags: ["Automation", "Integration"],
    tasks: [ { id: "t1", title: "Connect WMS API", col: "doing" }, { id: "t2", title: "Build intake bot", col: "doing" }, { id: "t3", title: "Exception dashboard", col: "todo" }, { id: "t4", title: "Sprint 1 demo", col: "done" }, { id: "t5", title: "Data model sign-off", col: "review" } ] },
  { id: "p2", client: "Mercia Health Group", name: "Patient referral intelligence", lead: "Priya", value: 68000, health: "risk", stageIdx: 2, tags: ["AI", "Analytics"],
    tasks: [ { id: "t6", title: "Process map workshop", col: "done" }, { id: "t7", title: "Architecture review", col: "review" }, { id: "t8", title: "Compliance check (GDPR)", col: "doing" }, { id: "t9", title: "Define success metrics", col: "todo" } ] },
  { id: "p3", client: "Brixton Retail Co.", name: "Ops reporting dashboard", lead: "Aaron", value: 21500, health: "on", stageIdx: 5, tags: ["Analytics", "Dashboards"],
    tasks: [ { id: "t10", title: "Go-live checklist", col: "doing" }, { id: "t11", title: "Hypercare plan", col: "todo" }, { id: "t12", title: "Handover docs", col: "review" } ] },
  { id: "p4", client: "Solent Manufacturing", name: "Discovery — production scheduling", lead: "Priya", value: 0, health: "on", stageIdx: 0, tags: ["Discovery"],
    tasks: [ { id: "t13", title: "Prep discovery questions", col: "doing" }, { id: "t14", title: "Send pre-call brief", col: "done" } ] },
];

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

/* ----- persistence (graceful: silently uses seed data if storage is blocked) ----- */
function loadProjects() {
  try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) return JSON.parse(raw); } catch (e) {}
  return seedProjects;
}

/* --------------------------- UI helpers --------------------------- */
function Logo({ size = 34 }) {
  const id = "kg" + size;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={C.cyan} /><stop offset="50%" stopColor={C.blue} /><stop offset="100%" stopColor={C.purple} />
        </linearGradient>
      </defs>
      <rect x="6" y="6" width="88" height="88" rx="22" fill={`url(#${id})`} opacity="0.16" />
      <g fill={`url(#${id})`}>
        <rect x="26" y="20" width="13" height="60" rx="3" />
        <polygon points="44,50 66,20 80,20 56,52" />
        <polygon points="56,52 80,80 65,80 47,56" />
      </g>
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
function Avatar({ name, size = 26 }) {
  return (<span className="inline-flex items-center justify-center rounded-full font-semibold"
    style={{ width: size, height: size, fontSize: size * 0.42, color: "#fff",
      background: name === "Aaron" ? `linear-gradient(135deg,${C.cyan},${C.blue})` : `linear-gradient(135deg,${C.blue},${C.purple})` }}>
    {name.slice(0, 1)}</span>);
}
const progressOf = (p) => Math.round((p.stageIdx / (STAGES.length - 1)) * 100);

function Pipeline({ stageIdx, compact = false }) {
  return (<div className="flex items-center" style={{ gap: compact ? 4 : 8 }}>
    {STAGES.map((s, i) => {
      const done = i < stageIdx, active = i === stageIdx, dot = compact ? 8 : 11;
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
const inputStyle = { background: C.panel2, border: `1px solid ${C.line}`, color: C.text, fontSize: 14, borderRadius: 8, padding: "9px 11px", width: "100%", outline: "none" };

/* --------------------------- New project modal --------------------------- */
function NewProjectModal({ onClose, onCreate }) {
  const [f, setF] = useState({ name: "", client: "", lead: "Aaron", value: "", tags: "", stageIdx: 0 });
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const save = () => {
    if (!f.name.trim() || !f.client.trim()) return;
    onCreate({
      id: "p" + Date.now(), name: f.name.trim(), client: f.client.trim(), lead: f.lead,
      value: Number(f.value) || 0, health: "on", stageIdx: Number(f.stageIdx),
      tags: f.tags.split(",").map((t) => t.trim()).filter(Boolean), tasks: [],
    });
    onClose();
  };
  return (
    <div className="fixed inset-0 flex items-center justify-center px-4" style={{ background: "rgba(5,8,18,0.7)", zIndex: 50 }}>
      <Card style={{ padding: 24, width: 460, maxWidth: "100%" }}>
        <div className="flex items-center justify-between mb-5">
          <h2 style={{ fontSize: 17, fontWeight: 600, color: C.text }}>New project</h2>
          <button onClick={onClose} style={{ color: C.mut }}><X size={18} /></button>
        </div>
        <div className="flex flex-col gap-4">
          <Field label="Project name"><input style={inputStyle} value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Invoice processing automation" /></Field>
          <Field label="Client / company"><input style={inputStyle} value={f.client} onChange={(e) => set("client", e.target.value)} placeholder="e.g. Acme Ltd" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Lead">
              <select style={inputStyle} value={f.lead} onChange={(e) => set("lead", e.target.value)}>
                <option>Aaron</option><option>Priya</option>
              </select>
            </Field>
            <Field label="Value (£)"><input style={inputStyle} type="number" value={f.value} onChange={(e) => set("value", e.target.value)} placeholder="0" /></Field>
          </div>
          <Field label="Starting stage">
            <select style={inputStyle} value={f.stageIdx} onChange={(e) => set("stageIdx", e.target.value)}>
              {STAGES.map((s, i) => <option key={s.key} value={i}>{i + 1}. {s.name}</option>)}
            </select>
          </Field>
          <Field label="Tags (comma separated)"><input style={inputStyle} value={f.tags} onChange={(e) => set("tags", e.target.value)} placeholder="Automation, AI" /></Field>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="rounded-lg px-4 py-2" style={{ background: C.panel2, color: C.text, fontSize: 13, border: `1px solid ${C.line}` }}>Cancel</button>
          <button onClick={save} className="rounded-lg px-4 py-2 font-semibold" style={{ background: GRAD, color: "#fff", fontSize: 13 }}>Create project</button>
        </div>
      </Card>
    </div>
  );
}

/* --------------------------- Login --------------------------- */
function Login({ onLogin }) {
  const [email, setEmail] = useState(""); const [pw, setPw] = useState(""); const [err, setErr] = useState("");
  const submit = () => {
    if (!email || !pw) { setErr("Enter your email and password to continue."); return; }
    onLogin(email.toLowerCase().includes("priya") ? "Priya" : "Aaron");
  };
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: C.bg, fontFamily: FONT }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none",
        background: `radial-gradient(600px 400px at 30% 20%, rgba(0,184,255,0.10), transparent 60%), radial-gradient(600px 500px at 80% 90%, rgba(123,60,255,0.12), transparent 60%)` }} />
      <div className="w-full max-w-md rounded-2xl p-8 relative" style={{ background: C.panel, border: `1px solid ${C.line}`, boxShadow: "0 24px 80px rgba(0,0,0,0.5)" }}>
        <div className="flex flex-col items-center text-center mb-7">
          <Logo size={52} />
          <div style={{ letterSpacing: "0.3em", fontWeight: 600, fontSize: 22, color: C.text, marginTop: 14 }}>KAITEQ</div>
          <div style={{ letterSpacing: "0.18em", fontSize: 10, color: C.cyan, marginTop: 4 }}>OPERATIONAL INTELLIGENCE & AUTOMATION</div>
        </div>
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

/* --------------------------- Shell --------------------------- */
const NAV = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard }, { key: "projects", label: "Projects", icon: FolderKanban },
  { key: "meetings", label: "Meetings", icon: CalendarDays }, { key: "customers", label: "Customers", icon: Users },
  { key: "documents", label: "Documents", icon: FileText }, { key: "workflow", label: "Workflow", icon: Workflow },
];
function Sidebar({ view, setView, user, onLogout }) {
  return (
    <aside className="flex flex-col justify-between" style={{ width: 232, background: C.panel, borderRight: `1px solid ${C.line}`, padding: 18 }}>
      <div>
        <div className="mb-7 px-1"><Wordmark /></div>
        <nav className="flex flex-col gap-1">
          {NAV.map((n) => {
            const active = view === n.key, Icon = n.icon;
            return (<button key={n.key} onClick={() => setView(n.key)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left"
              style={{ color: active ? "#fff" : C.mut, background: active ? "rgba(65,105,255,0.14)" : "transparent", fontSize: 14, fontWeight: active ? 600 : 500 }}>
              <Icon size={18} style={{ color: active ? C.cyan : C.mut2 }} />{n.label}</button>);
          })}
        </nav>
      </div>
      <div>
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 mb-2" style={{ background: C.panel2 }}>
          <Avatar name={user} /><div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>{user}</div>
            <div style={{ fontSize: 11, color: C.mut2 }}>Founder</div></div>
        </div>
        <button onClick={onLogout} className="flex items-center gap-2 px-3 py-2 rounded-lg w-full" style={{ color: C.mut, fontSize: 13 }}><LogOut size={16} /> Sign out</button>
      </div>
    </aside>
  );
}
function Topbar({ title, sub, action }) {
  return (<div className="flex items-end justify-between mb-6"><div>
    <h1 style={{ fontSize: 24, fontWeight: 600, color: C.text, letterSpacing: "-0.01em" }}>{title}</h1>
    {sub && <p style={{ color: C.mut, fontSize: 13, marginTop: 4 }}>{sub}</p>}</div>{action}</div>);
}

/* --------------------------- Dashboard --------------------------- */
function Dashboard({ projects, setView, setActiveProject }) {
  const atRisk = projects.filter((p) => p.health === "risk").length;
  const pipelineValue = projects.reduce((a, p) => a + p.value, 0);
  const stats = [
    { label: "Active projects", value: projects.length, accent: C.cyan },
    { label: "At risk", value: atRisk, accent: C.orange },
    { label: "Pipeline value", value: "£" + pipelineValue.toLocaleString(), accent: C.purple },
    { label: "Meetings this week", value: seedMeetings.length, accent: C.amber },
  ];
  return (
    <div>
      <Topbar title="Dashboard" sub="Where every engagement is, right now." />
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
            <button onClick={() => setView("projects")} style={{ fontSize: 12, color: C.cyan }}>View all</button>
          </div>
          <div className="flex flex-col gap-3">
            {projects.length === 0 && <Card style={{ padding: 20 }}><span style={{ color: C.mut, fontSize: 13 }}>No projects yet. Add one from the Projects tab.</span></Card>}
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
          <div className="flex flex-col gap-2 mb-6">
            {seedMeetings.slice(0, 4).map((m) => (<Card key={m.id} style={{ padding: 12 }}>
              <div className="flex items-center gap-2 mb-1"><Video size={14} style={{ color: C.cyan }} /><span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{m.title}</span></div>
              <div style={{ fontSize: 12, color: C.mut }}>{m.client}</div>
              <div className="flex items-center gap-1 mt-1" style={{ fontSize: 11, color: C.mut2 }}><Clock size={11} /> {m.when}</div></Card>))}
          </div>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 12 }}>What we stand for</h2>
          <Card style={{ padding: 14 }}>{VALUES.map((v, i) => (
            <div key={v.t} className="flex items-center gap-3" style={{ padding: "7px 0", borderTop: i ? `1px solid ${C.line}` : "none" }}>
              <v.icon size={18} style={{ color: C.cyan }} /><div>
                <div style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>{v.t}</div>
                <div style={{ fontSize: 11, color: C.mut2 }}>{v.s}</div></div></div>))}</Card>
        </div>
      </div>
    </div>
  );
}

/* --------------------------- Projects --------------------------- */
const COLS = [ { key: "todo", label: "Backlog" }, { key: "doing", label: "In progress" }, { key: "review", label: "Review" }, { key: "done", label: "Done" } ];

function ProjectDetail({ project, onBack, onSetStage, onMoveTask, onDelete }) {
  const p = project;
  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1 mb-4" style={{ color: C.mut, fontSize: 13 }}>
        <ChevronRight size={14} style={{ transform: "rotate(180deg)" }} /> All projects</button>
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="flex items-center gap-3"><h1 style={{ fontSize: 22, fontWeight: 600, color: C.text }}>{p.name}</h1><HealthPill health={p.health} /></div>
          <div className="flex items-center gap-2 mt-1" style={{ fontSize: 13, color: C.mut }}>
            <Building2 size={14} /> {p.client} · Lead <Avatar name={p.lead} size={18} /> {p.lead}</div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onSetStage(p.id, p.stageIdx - 1)} disabled={p.stageIdx === 0}
            className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: C.panel2, color: p.stageIdx === 0 ? C.mut2 : C.text, fontSize: 13, border: `1px solid ${C.line}`, cursor: p.stageIdx === 0 ? "default" : "pointer" }}>
            <ArrowLeft size={15} /> Previous</button>
          <button onClick={() => onSetStage(p.id, p.stageIdx + 1)} disabled={p.stageIdx === STAGES.length - 1}
            className="flex items-center gap-2 rounded-lg px-4 py-2 font-semibold" style={{ background: p.stageIdx === STAGES.length - 1 ? C.panel2 : GRAD, color: p.stageIdx === STAGES.length - 1 ? C.mut2 : "#fff", fontSize: 13, cursor: p.stageIdx === STAGES.length - 1 ? "default" : "pointer" }}>
            Advance stage <ArrowRight size={15} /></button>
          <button onClick={() => { if (window.confirm("Delete this project?")) { onDelete(p.id); onBack(); } }}
            className="flex items-center justify-center rounded-lg" style={{ width: 38, height: 38, background: C.panel2, color: C.mut, border: `1px solid ${C.line}` }} title="Delete project"><Trash2 size={15} /></button>
        </div>
      </div>

      <Card style={{ padding: 20, marginBottom: 20 }}>
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Delivery pipeline</h2>
          <span style={{ fontSize: 12, color: C.mut }}>{progressOf(p)}% complete · click a stage to jump</span>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {STAGES.map((s, i) => {
            const done = i < p.stageIdx, active = i === p.stageIdx;
            return (<div key={s.key} className="text-center cursor-pointer" onClick={() => onSetStage(p.id, i)}>
              <div className="mx-auto flex items-center justify-center rounded-full mb-2"
                style={{ width: 34, height: 34, background: done || active ? GRAD : C.panel2, border: done || active ? "none" : `1px solid ${C.line}`, boxShadow: active ? "0 0 0 4px rgba(0,184,255,0.16)" : "none" }}>
                {done ? <CircleCheck size={17} color="#fff" /> : active ? <CircleDot size={17} color="#fff" /> : <Circle size={15} color={C.mut2} />}</div>
              <div style={{ fontSize: 10.5, lineHeight: 1.25, color: done || active ? C.text : C.mut2 }}>{s.name}</div></div>);
          })}
        </div>
        <div className="mt-4 rounded-lg p-3" style={{ background: C.panel2 }}>
          <div style={{ fontSize: 12, color: C.cyan, fontWeight: 600 }}>Current: {STAGES[p.stageIdx].name}</div>
          <div style={{ fontSize: 12.5, color: C.mut, marginTop: 3 }}>{STAGES[p.stageIdx].desc}</div>
        </div>
      </Card>

      <h2 style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 12 }}>Work board (DevOps)</h2>
      <div className="grid grid-cols-4 gap-3">
        {COLS.map((col) => {
          const items = p.tasks.filter((t) => t.col === col.key);
          return (<div key={col.key} className="rounded-xl p-3" style={{ background: C.panel, border: `1px solid ${C.line}` }}>
            <div className="flex items-center justify-between mb-3"><span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{col.label}</span><span style={{ fontSize: 11, color: C.mut2 }}>{items.length}</span></div>
            <div className="flex flex-col gap-2">
              {items.map((t) => (<div key={t.id} className="rounded-lg p-2.5" style={{ background: C.panel2, border: `1px solid ${C.line}` }}>
                <div style={{ fontSize: 12.5, color: C.text, marginBottom: 6 }}>{t.title}</div>
                <div className="flex gap-1">{COLS.map((c) => (<button key={c.key} onClick={() => onMoveTask(p.id, t.id, c.key)} title={"Move to " + c.label}
                  style={{ width: 16, height: 4, borderRadius: 3, border: "none", cursor: "pointer", background: c.key === t.col ? GRAD : C.line }} />))}</div></div>))}
              {items.length === 0 && <div style={{ fontSize: 11, color: C.mut2, padding: "6px 0" }}>Nothing here</div>}
            </div></div>);
        })}
      </div>
    </div>
  );
}

function Projects({ projects, activeProject, setActiveProject, onSetStage, onMoveTask, onDelete, onNew }) {
  const p = projects.find((x) => x.id === activeProject);
  if (p) return <ProjectDetail project={p} onBack={() => setActiveProject(null)} onSetStage={onSetStage} onMoveTask={onMoveTask} onDelete={onDelete} />;
  return (
    <div>
      <Topbar title="Projects" sub="Every engagement and the stages left to complete."
        action={<button onClick={onNew} className="flex items-center gap-2 rounded-lg px-4 py-2 font-semibold" style={{ background: GRAD, color: "#fff", fontSize: 13 }}><Plus size={15} /> New project</button>} />
      <div className="flex flex-col gap-3">
        {projects.length === 0 && <Card style={{ padding: 24 }}><span style={{ color: C.mut, fontSize: 13 }}>No projects yet — click “New project” to add your first one.</span></Card>}
        {projects.map((p) => (<Card key={p.id} className="cursor-pointer" style={{ padding: 18 }}>
          <div onClick={() => setActiveProject(p.id)}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{p.name}</span><HealthPill health={p.health} />
                {p.tags.map((t) => (<span key={t} style={{ fontSize: 10.5, color: C.mut, background: C.panel2, padding: "2px 8px", borderRadius: 6 }}>{t}</span>))}</div>
              <div className="flex items-center gap-2"><Avatar name={p.lead} size={20} /><span style={{ fontSize: 12, color: C.mut }}>{p.client}</span></div></div>
            <div className="flex items-center justify-between mb-3">
              <span style={{ fontSize: 12, color: C.cyan }}>{STAGES[p.stageIdx].name}</span>
              <span style={{ fontSize: 12, color: C.mut2 }}>{progressOf(p)}% · {p.value ? "£" + p.value.toLocaleString() : "Pre-sales"}</span></div>
            <Pipeline stageIdx={p.stageIdx} /></div></Card>))}
      </div>
    </div>
  );
}

/* --------------------------- Meetings --------------------------- */
function Meetings() {
  const typeColor = { Discovery: C.cyan, Review: C.purple, Demo: C.amber };
  return (
    <div>
      <Topbar title="Meetings" sub="Scheduled sessions with your customers."
        action={<button className="flex items-center gap-2 rounded-lg px-4 py-2 font-semibold" style={{ background: GRAD, color: "#fff", fontSize: 13 }}><Plus size={15} /> Schedule</button>} />
      <div className="flex flex-col gap-3">{seedMeetings.map((m) => (<Card key={m.id} style={{ padding: 16 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4"><div className="flex items-center justify-center rounded-lg" style={{ width: 42, height: 42, background: C.panel2 }}><Video size={20} style={{ color: typeColor[m.type] }} /></div>
            <div><div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{m.title}</div><div style={{ fontSize: 12, color: C.mut }}>{m.client}</div></div></div>
          <div className="flex items-center gap-5">
            <span style={{ fontSize: 11, color: typeColor[m.type], background: C.panel2, padding: "3px 10px", borderRadius: 6 }}>{m.type}</span>
            <div className="flex items-center gap-1" style={{ fontSize: 12.5, color: C.text }}><Clock size={13} style={{ color: C.mut }} /> {m.when}</div>
            <div className="flex items-center gap-1.5" style={{ fontSize: 12, color: C.mut }}><Avatar name={m.lead} size={18} /> {m.lead}</div></div></div></Card>))}
      </div>
    </div>
  );
}

/* --------------------------- Customers --------------------------- */
function Customers() {
  const [open, setOpen] = useState(null);
  const c = seedCustomers.find((x) => x.id === open);
  if (c) return (
    <div>
      <button onClick={() => setOpen(null)} className="flex items-center gap-1 mb-4" style={{ color: C.mut, fontSize: 13 }}><ChevronRight size={14} style={{ transform: "rotate(180deg)" }} /> All customers</button>
      <div className="grid grid-cols-3 gap-5">
        <Card style={{ padding: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: C.text }}>{c.company}</h2>
          <div style={{ fontSize: 13, color: C.mut, marginBottom: 16 }}>{c.contact} · {c.role}</div>
          {[[Mail, c.email], [Phone, c.phone], [Globe, c.site], [MapPin, c.location]].map(([Ic, v], i) => (
            <div key={i} className="flex items-center gap-2.5 mb-2.5" style={{ fontSize: 13, color: C.text }}><Ic size={15} style={{ color: C.cyan }} /> {v}</div>))}
        </Card>
        <Card className="col-span-2" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 8 }}>Account notes</h3>
          <p style={{ fontSize: 13, color: C.mut, lineHeight: 1.6, marginBottom: 20 }}>{c.notes}</p>
          <div className="flex items-center justify-between mb-3">
            <h3 style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Documents from meetings</h3>
            <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5" style={{ background: C.panel2, color: C.text, fontSize: 12, border: `1px solid ${C.line}` }}><Upload size={13} /> Upload</button></div>
          <div className="flex flex-col gap-2">{c.docs.map((d) => (<div key={d} className="flex items-center gap-2 rounded-lg px-3 py-2.5" style={{ background: C.panel2, border: `1px solid ${C.line}` }}>
            <Paperclip size={14} style={{ color: C.purple }} /><span style={{ fontSize: 13, color: C.text }}>{d}</span></div>))}</div>
        </Card>
      </div>
    </div>
  );
  return (
    <div>
      <Topbar title="Customers" sub="Contacts, context and the docs you gather along the way."
        action={<button className="flex items-center gap-2 rounded-lg px-4 py-2 font-semibold" style={{ background: GRAD, color: "#fff", fontSize: 13 }}><Plus size={15} /> Add customer</button>} />
      <div className="grid grid-cols-3 gap-4">{seedCustomers.map((c) => (<Card key={c.id} className="cursor-pointer" style={{ padding: 18 }}>
        <div onClick={() => setOpen(c.id)}>
          <div className="flex items-center gap-3 mb-3"><div className="flex items-center justify-center rounded-lg" style={{ width: 40, height: 40, background: GRAD, color: "#fff", fontWeight: 700 }}>{c.company.slice(0, 1)}</div>
            <div><div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{c.company}</div><div style={{ fontSize: 12, color: C.mut }}>{c.contact}</div></div></div>
          <div className="flex items-center justify-between" style={{ fontSize: 12, color: C.mut2 }}>
            <span className="flex items-center gap-1"><Paperclip size={12} /> {c.docs.length} docs</span>
            <span className="flex items-center gap-1" style={{ color: C.cyan }}>Open <ChevronRight size={13} /></span></div></div></Card>))}
      </div>
    </div>
  );
}

/* --------------------------- Documents --------------------------- */
function Documents() {
  const cats = [...new Set(seedDocs.map((d) => d.cat))];
  const catColor = { Legal: C.purple, Templates: C.cyan, Compliance: C.orange, Brand: C.amber };
  return (
    <div>
      <Topbar title="Documents" sub="Your own paperwork, templates and records."
        action={<button className="flex items-center gap-2 rounded-lg px-4 py-2 font-semibold" style={{ background: GRAD, color: "#fff", fontSize: 13 }}><Upload size={15} /> Upload</button>} />
      {cats.map((cat) => (<div key={cat} className="mb-6">
        <h2 style={{ fontSize: 13, fontWeight: 600, color: C.mut, marginBottom: 10, letterSpacing: "0.04em" }}>{cat.toUpperCase()}</h2>
        <div className="grid grid-cols-3 gap-3">{seedDocs.filter((d) => d.cat === cat).map((d) => (<Card key={d.id} style={{ padding: 14 }}>
          <div className="flex items-center gap-3"><div className="flex items-center justify-center rounded-lg" style={{ width: 38, height: 38, background: C.panel2 }}><FileText size={18} style={{ color: catColor[cat] }} /></div>
            <span style={{ fontSize: 13, color: C.text }}>{d.name}</span></div></Card>))}</div></div>))}
    </div>
  );
}

/* --------------------------- Workflow --------------------------- */
function WorkflowView() {
  return (
    <div>
      <Topbar title="Workflow" sub="The KAITEQ delivery lifecycle — a continuous, DevOps-style loop." />
      <div className="flex flex-col gap-3">{STAGES.map((s, i) => (<Card key={s.key} style={{ padding: 18 }}>
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center rounded-xl flex-shrink-0" style={{ width: 46, height: 46, background: GRAD }}><s.icon size={22} color="#fff" /></div>
          <div className="flex-1">
            <div className="flex items-center gap-3"><span style={{ fontSize: 12, color: C.mut2, fontWeight: 700 }}>{String(i + 1).padStart(2, "0")}</span>
              <span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{s.name}</span>
              <span style={{ fontSize: 10.5, color: C.cyan, background: "rgba(0,184,255,0.10)", padding: "2px 8px", borderRadius: 6 }}>DevOps · {s.devops}</span></div>
            <p style={{ fontSize: 13, color: C.mut, marginTop: 6, lineHeight: 1.55 }}>{s.desc}</p></div></div></Card>))}
      </div>
      <Card style={{ padding: 16, marginTop: 16, background: C.panel2 }}>
        <p style={{ fontSize: 13, color: C.mut, lineHeight: 1.6 }}><span style={{ color: C.cyan, fontWeight: 600 }}>It's a loop, not a line.</span> Stage 7 feeds the next discovery — monitoring in production surfaces the next opportunity, which restarts the cycle. Ship small, measure impact, improve continuously.</p>
      </Card>
    </div>
  );
}

/* --------------------------- Root --------------------------- */
export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("dashboard");
  const [projects, setProjects] = useState(loadProjects);
  const [activeProject, setActiveProject] = useState(null);
  const [newOpen, setNewOpen] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(projects)); } catch (e) {}
  }, [projects]);

  const setStage = (id, idx) => setProjects((ps) => ps.map((p) =>
    p.id === id ? { ...p, stageIdx: Math.max(0, Math.min(STAGES.length - 1, idx)) } : p));
  const moveTask = (pid, tid, col) => setProjects((ps) => ps.map((p) =>
    p.id === pid ? { ...p, tasks: p.tasks.map((t) => t.id === tid ? { ...t, col } : t) } : p));
  const addProject = (proj) => setProjects((ps) => [proj, ...ps]);
  const deleteProject = (id) => setProjects((ps) => ps.filter((p) => p.id !== id));

  if (!user) return <Login onLogin={setUser} />;

  return (
    <div className="flex min-h-screen" style={{ background: C.bg, fontFamily: FONT, color: C.text }}>
      <Sidebar view={view} setView={(v) => { setView(v); setActiveProject(null); }} user={user} onLogout={() => { setUser(null); setView("dashboard"); }} />
      <main className="flex-1 overflow-auto" style={{ padding: "28px 32px" }}>
        {view === "dashboard" && <Dashboard projects={projects} setView={setView} setActiveProject={setActiveProject} />}
        {view === "projects" && <Projects projects={projects} activeProject={activeProject} setActiveProject={setActiveProject}
          onSetStage={setStage} onMoveTask={moveTask} onDelete={deleteProject} onNew={() => setNewOpen(true)} />}
        {view === "meetings" && <Meetings />}
        {view === "customers" && <Customers />}
        {view === "documents" && <Documents />}
        {view === "workflow" && <WorkflowView />}
      </main>
      {newOpen && <NewProjectModal onClose={() => setNewOpen(false)} onCreate={addProject} />}
    </div>
  );
}
