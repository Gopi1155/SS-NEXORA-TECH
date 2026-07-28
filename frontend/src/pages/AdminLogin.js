import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, Eye, EyeOff } from "lucide-react";
import { apiError } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { FadeUp, LOGO_URL } from "../components/motion";

export default function AdminLogin() {
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role !== "admin") {
        logout();
        setError("This portal is for administrators only. Please use the main website login.");
        return;
      }
      navigate("/admin");
    } catch (err) {
      setError(apiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none";

  return (
    <div data-testid="admin-login-page" className="min-h-screen flex items-center justify-center px-4">
      <FadeUp className="w-full max-w-md">
        <div className="glass rounded-[2.5rem] p-10">
          <img src={LOGO_URL} alt="SS Nexora Tech logo" className="w-16 h-16 rounded-full object-cover ring-1 ring-cyan-400/40 mx-auto mb-6" />
          <div className="flex items-center justify-center gap-2 mb-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <h1 className="font-heading text-2xl font-bold text-slate-50 text-center">Admin Portal</h1>
          </div>
          <p className="text-sm text-slate-400 text-center mb-8">SS Nexora Tech — Control Center</p>

          <form onSubmit={submit} className="space-y-4">
            <input data-testid="admin-login-email-input" type="email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Admin email" required className={inputCls} />
            <div className="relative">
              <input data-testid="admin-login-password-input" type={showPassword ? "text" : "password"} value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password" required className={`${inputCls} pr-12`} />
              <button type="button" data-testid="admin-login-password-toggle" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-300 transition-colors">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && <p data-testid="admin-login-error" className="text-sm text-red-400">{error}</p>}
            <button data-testid="admin-login-submit-btn" type="submit" disabled={submitting}
              className="glow-btn w-full py-3.5 rounded-full bg-[#007AFF] text-white font-medium disabled:opacity-50">
              {submitting ? "Please wait…" : "Login to Admin Panel"}
            </button>
          </form>

          <p className="text-xs text-slate-500 text-center mt-7">
            Not an admin? <Link to="/" className="text-cyan-300 hover:underline" data-testid="admin-login-back-link">Go to website</Link>
          </p>
        </div>
      </FadeUp>
    </div>
  );
}
