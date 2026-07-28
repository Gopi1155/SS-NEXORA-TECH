import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, Wallet, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import api, { apiError } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { FadeUp } from "../components/motion";

export default function InternshipDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [form, setForm] = useState({ phone: "", resume_link: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/internships/${id}`).then((r) => setItem(r.data)).catch(() => setNotFound(true));
  }, [id]);

  const apply = async () => {
    if (!user) { navigate("/login"); return; }
    setSubmitting(true);
    try {
      await api.post("/applications", { internship_id: id, ...form });
      toast.success("Application submitted! We'll review and get back to you.");
    } catch (e) {
      toast.error(apiError(e));
    } finally {
      setSubmitting(false);
    }
  };

  if (notFound) return <div className="pt-40 text-center text-slate-400">Internship not found. <Link to="/internships" className="text-cyan-300">Back</Link></div>;
  if (!item) return <div className="pt-40 text-center text-slate-400">Loading…</div>;

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none";

  return (
    <div data-testid="internship-detail-page" className="pt-28 pb-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <Link to="/internships" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-300 mb-8 transition-colors" data-testid="internship-back-link">
        <ArrowLeft className="w-4 h-4" /> All internships
      </Link>

      <FadeUp>
        <div className="glass rounded-[2.5rem] overflow-hidden">
          {item.image && <img src={item.image} alt={item.title} className="h-64 sm:h-72 w-full object-cover opacity-85" />}
          <div className="p-8 sm:p-12">
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-400 mb-4">{item.department}</p>
            <h1 className="font-heading text-3xl sm:text-4xl font-black tracking-tight text-slate-50 mb-6">{item.title}</h1>
            <div className="flex flex-wrap gap-4 mb-8 text-sm text-slate-300">
              <span className="glass px-4 py-2 rounded-full flex items-center gap-2"><MapPin className="w-4 h-4 text-cyan-400" /> {item.location} · {item.mode}</span>
              <span className="glass px-4 py-2 rounded-full flex items-center gap-2"><Clock className="w-4 h-4 text-cyan-400" /> {item.duration}</span>
              {item.stipend && <span className="glass px-4 py-2 rounded-full flex items-center gap-2"><Wallet className="w-4 h-4 text-cyan-400" /> {item.stipend}</span>}
            </div>
            <p className="text-slate-300 leading-relaxed mb-10">{item.description}</p>

            {item.requirements?.length > 0 && (
              <div className="mb-10">
                <h2 className="font-heading text-lg font-bold text-slate-50 mb-5">Requirements</h2>
                <ul className="space-y-3">
                  {item.requirements.map((r, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" /> {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="glass rounded-3xl p-8">
              <h2 className="font-heading text-lg font-bold text-slate-50 mb-4">Apply for this internship</h2>
              {user ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input data-testid="apply-phone-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" className={inputCls} />
                    <input data-testid="apply-resume-input" value={form.resume_link} onChange={(e) => setForm({ ...form, resume_link: e.target.value })} placeholder="Resume link (Drive/LinkedIn)" className={inputCls} />
                  </div>
                  <textarea data-testid="apply-message-input" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Why are you a great fit?" rows={3} className={inputCls} />
                  <button data-testid="apply-submit-btn" onClick={apply} disabled={submitting}
                    className="glow-btn px-8 py-3 rounded-full bg-[#007AFF] text-white text-sm font-medium disabled:opacity-50">
                    {submitting ? "Submitting…" : "Submit Application"}
                  </button>
                </div>
              ) : (
                <p className="text-sm text-slate-400">
                  <Link to="/login" className="text-cyan-300 hover:underline" data-testid="apply-login-link">Login</Link> or{" "}
                  <Link to="/register" className="text-cyan-300 hover:underline">register</Link> to apply.
                </p>
              )}
            </div>
          </div>
        </div>
      </FadeUp>
    </div>
  );
}
