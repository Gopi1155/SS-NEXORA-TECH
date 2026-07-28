import { useEffect, useState } from "react";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { toast } from "sonner";
import api, { apiError } from "../lib/api";
import { FadeUp, Overline } from "../components/motion";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [settings, setSettings] = useState({});

  useEffect(() => { api.get("/settings").then((r) => setSettings(r.data)).catch(() => {}); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { toast.error("Please fill name, email and message"); return; }
    setSubmitting(true);
    try {
      await api.post("/contact", form);
      setForm({ name: "", email: "", subject: "", message: "" });
      toast.success("Message sent! We'll get back to you soon.");
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none";

  return (
    <div data-testid="contact-page" className="pt-32 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <FadeUp>
        <Overline className="mb-5">Get in Touch</Overline>
        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-50 mb-4">Contact Us</h1>
        <p className="text-slate-400 max-w-xl mb-16">Questions about courses, internships or partnerships? We'd love to hear from you.</p>
      </FadeUp>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        <FadeUp className="lg:col-span-3">
          <form onSubmit={submit} className="glass rounded-[2rem] p-8 sm:p-10 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <input data-testid="contact-name-input" value={form.name} onChange={set("name")} placeholder="Your name *" className={inputCls} />
              <input data-testid="contact-email-input" type="email" value={form.email} onChange={set("email")} placeholder="Email address *" className={inputCls} />
            </div>
            <input data-testid="contact-subject-input" value={form.subject} onChange={set("subject")} placeholder="Subject" className={inputCls} />
            <textarea data-testid="contact-message-input" value={form.message} onChange={set("message")} placeholder="Your message *" rows={6} className={inputCls} />
            <button data-testid="contact-submit-btn" type="submit" disabled={submitting}
              className="glow-btn inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#007AFF] text-white text-sm font-medium disabled:opacity-50">
              <Send className="w-4 h-4" /> {submitting ? "Sending…" : "Send Message"}
            </button>
          </form>
        </FadeUp>

        <FadeUp delay={0.15} className="lg:col-span-2">
          <div className="space-y-6">
            {[
              { icon: Mail, label: "Email", value: settings.contact_email || "—" },
              { icon: Phone, label: "Phone", value: settings.contact_phone || "—" },
              { icon: MapPin, label: "Location", value: settings.contact_address || "—" },
            ].map((c) => (
              <div key={c.label} className="glass rounded-3xl p-7 flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center shrink-0">
                  <c.icon className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-1">{c.label}</p>
                  <p className="text-sm text-slate-100">{c.value}</p>
                </div>
              </div>
            ))}
          </div>
        </FadeUp>
      </div>
    </div>
  );
}
