import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  LayoutDashboard, GraduationCap, Briefcase, Image as ImageIcon, MessageSquareQuote,
  Mail, Users, ClipboardList, FileText, Plus, Pencil, Trash2, Check, X, Star, Settings,
  Globe, LogOut
} from "lucide-react";
import api, { apiError } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { LOGO_URL } from "../components/motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";

const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none";
const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "courses", label: "Courses", icon: GraduationCap },
  { id: "internships", label: "Internships", icon: Briefcase },
  { id: "media", label: "Media", icon: ImageIcon },
  { id: "feedback", label: "Feedback", icon: MessageSquareQuote },
  { id: "enrollments", label: "Enrollments", icon: ClipboardList },
  { id: "applications", label: "Applications", icon: FileText },
  { id: "contacts", label: "Messages", icon: Mail },
  { id: "users", label: "Users", icon: Users },
  { id: "settings", label: "Site Settings", icon: Settings },
];

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-[0.15em] text-slate-400 block mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const COURSE_FIELDS = [
  ["title", "Title"], ["category", "Category"], ["duration", "Duration (e.g. 12 Weeks)"],
  ["price", "Price (e.g. ₹14,999)"], ["level", "Level"], ["image", "Image URL"],
];
const INTERNSHIP_FIELDS = [
  ["title", "Title"], ["department", "Department"], ["duration", "Duration"],
  ["stipend", "Stipend"], ["location", "Location"], ["mode", "Mode (Remote/On-site/Hybrid)"], ["image", "Image URL"],
];

function ItemFormDialog({ open, onClose, kind, initial, onSaved }) {
  const isCourse = kind === "courses";
  const isMedia = kind === "media";
  const fields = isCourse ? COURSE_FIELDS : INTERNSHIP_FIELDS;
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      const base = initial || {};
      setForm({
        ...base,
        syllabus: (base.syllabus || []).join("\n"),
        requirements: (base.requirements || []).join("\n"),
      });
    }
  }, [open, initial]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async () => {
    setSaving(true);
    try {
      let payload;
      if (isMedia) {
        payload = { title: form.title || "", type: form.type || "image", url: form.url || "", description: form.description || "" };
      } else {
        payload = {};
        fields.forEach(([k]) => (payload[k] = form[k] || ""));
        payload.description = form.description || "";
        const listKey = isCourse ? "syllabus" : "requirements";
        payload[listKey] = (form[listKey] || "").split("\n").map((s) => s.trim()).filter(Boolean);
      }
      if (initial?.id) await api.put(`/admin/${kind}/${initial.id}`, payload);
      else await api.post(`/admin/${kind}`, payload);
      toast.success(initial?.id ? "Updated" : "Created");
      onSaved();
      onClose();
    } catch (e) {
      toast.error(apiError(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-[#0A0A14] border-white/10 text-slate-100 max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">{initial?.id ? "Edit" : "Add"} {kind.slice(0, -1)}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {isMedia ? (
            <>
              <Field label="Title"><input data-testid="media-form-title" className={inputCls} value={form.title || ""} onChange={set("title")} /></Field>
              <Field label="Type">
                <select data-testid="media-form-type" className={inputCls} value={form.type || "image"} onChange={set("type")}>
                  <option value="image">Image</option>
                  <option value="video">Video (YouTube)</option>
                </select>
              </Field>
              <Field label="URL (image link or YouTube link)"><input data-testid="media-form-url" className={inputCls} value={form.url || ""} onChange={set("url")} /></Field>
              <Field label="Description"><textarea className={inputCls} rows={2} value={form.description || ""} onChange={set("description")} /></Field>
            </>
          ) : (
            <>
              {fields.map(([k, label]) => (
                <Field key={k} label={label}>
                  <input data-testid={`${kind}-form-${k}`} className={inputCls} value={form[k] || ""} onChange={set(k)} />
                </Field>
              ))}
              <Field label="Description">
                <textarea data-testid={`${kind}-form-description`} className={inputCls} rows={3} value={form.description || ""} onChange={set("description")} />
              </Field>
              <Field label={isCourse ? "Syllabus (one item per line)" : "Requirements (one item per line)"}>
                <textarea data-testid={`${kind}-form-list`} className={inputCls} rows={4}
                  value={form[isCourse ? "syllabus" : "requirements"] || ""}
                  onChange={set(isCourse ? "syllabus" : "requirements")} />
              </Field>
            </>
          )}
          <button data-testid="admin-form-save-btn" onClick={save} disabled={saving}
            className="glow-btn w-full py-3 rounded-full bg-[#007AFF] text-white text-sm font-medium disabled:opacity-50">
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ContentManager({ kind }) {
  const [items, setItems] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = useCallback(() => {
    api.get(`/${kind}`).then((r) => setItems(r.data)).catch(() => {});
  }, [kind]);

  useEffect(load, [load]);

  const remove = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      await api.delete(`/admin/${kind}/${id}`);
      toast.success("Deleted");
      load();
    } catch (e) {
      toast.error(apiError(e));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-xl font-bold text-slate-50 capitalize">{kind}</h2>
        <button data-testid={`admin-add-${kind}-btn`} onClick={() => { setEditing(null); setDialogOpen(true); }}
          className="glow-btn inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#007AFF] text-white text-sm font-medium">
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>
      {items.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center text-sm text-slate-400" data-testid={`admin-${kind}-empty`}>
          Nothing here yet. Click "Add" to create your first {kind.slice(0, -1)}.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={item.id} data-testid={`admin-${kind}-row-${i}`} className="glass rounded-2xl px-6 py-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-100 truncate">{item.title}</p>
                <p className="text-xs text-slate-400 truncate">
                  {kind === "media" ? `${item.type} · ${item.url}` : (item.category || item.department || "")}{item.duration ? ` · ${item.duration}` : ""}
                </p>
              </div>
              <button data-testid={`admin-${kind}-edit-${i}`} onClick={() => { setEditing(item); setDialogOpen(true); }}
                className="p-2 rounded-full text-slate-300 hover:text-cyan-300 hover:bg-white/10 transition-colors"><Pencil className="w-4 h-4" /></button>
              <button data-testid={`admin-${kind}-delete-${i}`} onClick={() => remove(item.id)}
                className="p-2 rounded-full text-slate-300 hover:text-red-400 hover:bg-white/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      )}
      <ItemFormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} kind={kind} initial={editing} onSaved={load} />
    </div>
  );
}

function FeedbackManager() {
  const [items, setItems] = useState([]);
  const load = () => api.get("/admin/feedback").then((r) => setItems(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const toggle = async (id) => {
    try { await api.put(`/admin/feedback/${id}/approve`); load(); } catch (e) { toast.error(apiError(e)); }
  };
  const remove = async (id) => {
    if (!window.confirm("Delete this feedback?")) return;
    try { await api.delete(`/admin/feedback/${id}`); load(); } catch (e) { toast.error(apiError(e)); }
  };

  return (
    <div>
      <h2 className="font-heading text-xl font-bold text-slate-50 mb-6">Feedback Moderation</h2>
      {items.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center text-sm text-slate-400" data-testid="admin-feedback-empty">No feedback submitted yet.</div>
      ) : (
        <div className="space-y-3">
          {items.map((f, i) => (
            <div key={f.id} data-testid={`admin-feedback-row-${i}`} className="glass rounded-2xl px-6 py-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-slate-100">{f.name}</p>
                  <span className="flex">{Array.from({ length: f.rating }).map((_, j) => <Star key={j} className="w-3 h-3 text-cyan-400 fill-cyan-400" />)}</span>
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${f.approved ? "bg-emerald-400/10 text-emerald-300" : "bg-amber-400/10 text-amber-300"}`}>
                    {f.approved ? "Approved" : "Pending"}
                  </span>
                </div>
                <p className="text-sm text-slate-400 truncate">{f.message}</p>
              </div>
              <button data-testid={`admin-feedback-toggle-${i}`} onClick={() => toggle(f.id)} title={f.approved ? "Unapprove" : "Approve"}
                className={`p-2 rounded-full transition-colors ${f.approved ? "text-amber-300 hover:bg-white/10" : "text-emerald-300 hover:bg-white/10"}`}>
                {f.approved ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
              </button>
              <button data-testid={`admin-feedback-delete-${i}`} onClick={() => remove(f.id)} className="p-2 rounded-full text-slate-300 hover:text-red-400 hover:bg-white/10 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RequestsManager({ kind, titleKey }) {
  const [items, setItems] = useState([]);
  const load = () => api.get(`/admin/${kind}`).then((r) => setItems(r.data)).catch(() => {});
  useEffect(() => { load(); }, [kind]); // eslint-disable-line

  const setStatus = async (id, status) => {
    try { await api.put(`/admin/${kind}/${id}/status`, { status }); load(); } catch (e) { toast.error(apiError(e)); }
  };

  const colors = { pending: "bg-amber-400/10 text-amber-300", approved: "bg-emerald-400/10 text-emerald-300", rejected: "bg-red-400/10 text-red-300" };

  return (
    <div>
      <h2 className="font-heading text-xl font-bold text-slate-50 mb-6 capitalize">{kind}</h2>
      {items.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center text-sm text-slate-400" data-testid={`admin-${kind}-empty`}>No {kind} yet.</div>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={item.id} data-testid={`admin-${kind}-row-${i}`} className="glass rounded-2xl px-6 py-4">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-100">{item.name} <span className="text-slate-400 font-normal">· {item.email}</span></p>
                  <p className="text-sm text-cyan-300 mt-0.5">{item[titleKey]}</p>
                  {item.phone && <p className="text-xs text-slate-400 mt-0.5">Phone: {item.phone}</p>}
                  {item.resume_link && <a href={item.resume_link} target="_blank" rel="noreferrer" className="text-xs text-cyan-400 hover:underline">Resume link</a>}
                  {item.message && <p className="text-xs text-slate-400 mt-1">{item.message}</p>}
                </div>
                <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full ${colors[item.status] || colors.pending}`}>{item.status}</span>
                <div className="flex gap-2">
                  <button data-testid={`admin-${kind}-approve-${i}`} onClick={() => setStatus(item.id, "approved")} className="px-3 py-1.5 rounded-full text-xs bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20 transition-colors">Approve</button>
                  <button data-testid={`admin-${kind}-reject-${i}`} onClick={() => setStatus(item.id, "rejected")} className="px-3 py-1.5 rounded-full text-xs bg-red-400/10 text-red-300 hover:bg-red-400/20 transition-colors">Reject</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ContactsManager() {
  const [items, setItems] = useState([]);
  const load = () => api.get("/admin/contacts").then((r) => setItems(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const markRead = async (id) => { try { await api.put(`/admin/contacts/${id}/read`); load(); } catch (e) { toast.error(apiError(e)); } };
  const remove = async (id) => {
    if (!window.confirm("Delete this message?")) return;
    try { await api.delete(`/admin/contacts/${id}`); load(); } catch (e) { toast.error(apiError(e)); }
  };

  return (
    <div>
      <h2 className="font-heading text-xl font-bold text-slate-50 mb-6">Contact Messages</h2>
      {items.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center text-sm text-slate-400" data-testid="admin-contacts-empty">No messages yet.</div>
      ) : (
        <div className="space-y-3">
          {items.map((c, i) => (
            <div key={c.id} data-testid={`admin-contact-row-${i}`} className={`glass rounded-2xl px-6 py-4 ${!c.read ? "border-cyan-400/30" : ""}`}>
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-100">{c.name} <span className="text-slate-400 font-normal">· {c.email}</span>
                    {!c.read && <span className="ml-2 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-400/10 text-cyan-300">New</span>}
                  </p>
                  {c.subject && <p className="text-sm text-cyan-300 mt-0.5">{c.subject}</p>}
                  <p className="text-sm text-slate-400 mt-1">{c.message}</p>
                </div>
                {!c.read && (
                  <button data-testid={`admin-contact-read-${i}`} onClick={() => markRead(c.id)} className="px-3 py-1.5 rounded-full text-xs bg-cyan-400/10 text-cyan-300 hover:bg-cyan-400/20 transition-colors shrink-0">Mark read</button>
                )}
                <button data-testid={`admin-contact-delete-${i}`} onClick={() => remove(c.id)} className="p-2 rounded-full text-slate-300 hover:text-red-400 hover:bg-white/10 transition-colors shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function UsersManager() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get("/admin/users").then((r) => setItems(r.data)).catch(() => {}); }, []);
  return (
    <div>
      <h2 className="font-heading text-xl font-bold text-slate-50 mb-6">Registered Users</h2>
      <div className="space-y-3">
        {items.map((u, i) => (
          <div key={u.id} data-testid={`admin-user-row-${i}`} className="glass rounded-2xl px-6 py-4 flex items-center gap-4">
            <div className="flex-1">
              <p className="font-medium text-slate-100">{u.name}</p>
              <p className="text-xs text-slate-400">{u.email}</p>
            </div>
            <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full ${u.role === "admin" ? "bg-cyan-400/10 text-cyan-300" : "bg-white/5 text-slate-300"}`}>{u.role}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Overview({ onNavigate }) {
  const [stats, setStats] = useState(null);
  useEffect(() => { api.get("/admin/stats").then((r) => setStats(r.data)).catch(() => {}); }, []);
  if (!stats) return <div className="text-slate-400 text-sm">Loading stats…</div>;
  const cards = [
    ["courses", "Courses", GraduationCap], ["internships", "Internships", Briefcase],
    ["media", "Media Items", ImageIcon], ["users", "Users", Users],
    ["enrollments", "Enrollments", ClipboardList], ["applications", "Applications", FileText],
    ["pending_feedback", "Pending Feedback", MessageSquareQuote], ["unread_contacts", "Unread Messages", Mail],
  ];
  const tabMap = { pending_feedback: "feedback", unread_contacts: "contacts", media: "media" };
  return (
    <div>
      <h2 className="font-heading text-xl font-bold text-slate-50 mb-6">Overview</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(([key, label, Icon]) => (
          <button key={key} data-testid={`admin-stat-${key}`} onClick={() => onNavigate(tabMap[key] || key)}
            className="glass rounded-2xl p-6 text-left hover:bg-white/[0.06] transition-colors">
            <Icon className="w-5 h-5 text-cyan-400 mb-3" strokeWidth={1.5} />
            <p className="font-heading text-3xl font-bold text-slate-50">{stats[key] ?? 0}</p>
            <p className="text-xs text-slate-400 mt-1">{label}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function SettingsManager() {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => { api.get("/settings").then((r) => setForm(r.data)).catch(() => {}); }, []);
  if (!form) return <div className="text-slate-400 text-sm">Loading settings…</div>;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const save = async () => {
    setSaving(true);
    try { await api.put("/admin/settings", form); toast.success("Settings saved"); }
    catch (e) { toast.error(apiError(e)); }
    finally { setSaving(false); }
  };

  const FIELDS = [
    ["contact_email", "Contact Email"],
    ["contact_phone", "Contact Phone"],
    ["contact_address", "Contact Address / Location"],
    ["hero_line1", "Home Hero — Line 1 (e.g. Empowering)"],
    ["hero_line2", "Home Hero — Line 2 (e.g. Future Tech)"],
    ["hero_line3", "Home Hero — Line 3, highlighted (e.g. Leaders.)"],
    ["stat_enrolled", "Home Stat — Enrolled Students (e.g. 20+)"],
    ["stat_projects", "Home Stat — Real Projects (e.g. 10+)"],
    ["stat_course_completions", "Home Stat — Course Completions (e.g. 15+)"],
    ["stat_internship_completions", "Home Stat — Internship Completions (e.g. 10+)"],
  ];

  const TEXTAREAS = [
    ["hero_tagline", "Home Hero Tagline", 3],
    ["about_story", "About Us — Our Story", 4],
    ["about_mission", "About Us — Our Mission", 3],
    ["about_vision", "About Us — Our Vision", 3],
  ];

  return (
    <div className="max-w-2xl">
      <h2 className="font-heading text-xl font-bold text-slate-50 mb-2">Site Settings</h2>
      <p className="text-sm text-slate-400 mb-6">Contact details, Home page and About Us content shown across the website.</p>
      <div className="glass rounded-3xl p-8 space-y-5">
        {FIELDS.map(([k, label]) => (
          <Field key={k} label={label}>
            <input data-testid={`settings-${k}-input`} className={inputCls} value={form[k] || ""} onChange={set(k)} />
          </Field>
        ))}
        {TEXTAREAS.map(([k, label, rows]) => (
          <Field key={k} label={label}>
            <textarea data-testid={`settings-${k}-input`} className={inputCls} rows={rows} value={form[k] || ""} onChange={set(k)} />
          </Field>
        ))}
        <button data-testid="settings-save-btn" onClick={save} disabled={saving}
          className="glow-btn px-8 py-3 rounded-full bg-[#007AFF] text-white text-sm font-medium disabled:opacity-50">
          {saving ? "Saving…" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}

export default function Admin() {
  const [tab, setTab] = useState("overview");
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div data-testid="admin-dashboard" className="min-h-screen">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#05050A]/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="SS Nexora Tech logo" className="h-9 w-9 rounded-full object-cover ring-1 ring-cyan-400/40" />
            <span className="font-heading font-bold text-slate-50">SS NEXORA <span className="text-cyan-400">TECH</span></span>
            <span className="text-[10px] uppercase tracking-[0.2em] px-2.5 py-1 rounded-full bg-cyan-400/10 text-cyan-300 border border-cyan-400/30">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" data-testid="admin-view-site-link" className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm glass text-slate-200 hover:bg-white/10 transition-colors">
              <Globe className="w-4 h-4 text-cyan-400" /> View Website
            </Link>
            <button data-testid="admin-logout-btn" onClick={() => { logout(); navigate("/admin/login"); }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-colors">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="pt-10 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <p className="text-xs uppercase tracking-[0.3em] text-cyan-400/90 mb-3">Admin Control Center</p>
      <h1 className="font-heading text-3xl sm:text-4xl font-black tracking-tight text-slate-50 mb-10">Dashboard</h1>

      <div className="flex gap-2 flex-wrap mb-10">
        {TABS.map((t) => (
          <button key={t.id} data-testid={`admin-tab-${t.id}`} onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-colors ${
              tab === t.id ? "bg-cyan-400/15 text-cyan-300 border border-cyan-400/40" : "glass text-slate-300 hover:bg-white/10"
            }`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && <Overview onNavigate={setTab} />}
      {tab === "courses" && <ContentManager kind="courses" />}
      {tab === "internships" && <ContentManager kind="internships" />}
      {tab === "media" && <ContentManager kind="media" />}
      {tab === "feedback" && <FeedbackManager />}
      {tab === "enrollments" && <RequestsManager kind="enrollments" titleKey="course_title" />}
      {tab === "applications" && <RequestsManager kind="applications" titleKey="internship_title" />}
      {tab === "contacts" && <ContactsManager />}
      {tab === "users" && <UsersManager />}
      {tab === "settings" && <SettingsManager />}
      </div>
    </div>
  );
}
