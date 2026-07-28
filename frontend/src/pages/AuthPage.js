import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { apiError } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { FadeUp, LOGO_URL } from "../components/motion";

export default function AuthPage({ mode }) {
  const isLogin = mode === "login";
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const user = isLogin
        ? await login(form.email, form.password)
        : await register(form.name, form.email, form.password);
      toast.success(`Welcome${user.name ? ", " + user.name : ""}!`);
      navigate(user.role === "admin" ? "/admin" : (location.state?.from || "/"));
    } catch (err) {
      setError(apiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none";

  return (
    <div data-testid={`${mode}-page`} className="min-h-screen flex items-center justify-center px-4 pt-24 pb-16">
      <FadeUp className="w-full max-w-md">
        <div className="glass rounded-[2.5rem] p-10">
          <img src={LOGO_URL} alt="SS Nexora Tech logo" className="w-16 h-16 rounded-full object-cover ring-1 ring-cyan-400/40 mx-auto mb-6" />
          <h1 className="font-heading text-2xl font-bold text-slate-50 text-center mb-2">
            {isLogin ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-sm text-slate-400 text-center mb-8">
            {isLogin ? "Login to SS Nexora Tech" : "Join SS Nexora Tech for free"}
          </p>

          <form onSubmit={submit} className="space-y-4">
            {!isLogin && (
              <input data-testid="auth-name-input" value={form.name} onChange={set("name")} placeholder="Full name" required className={inputCls} />
            )}
            <input data-testid="auth-email-input" type="email" value={form.email} onChange={set("email")} placeholder="Email address" required className={inputCls} />
            <div className="relative">
              <input data-testid="auth-password-input" type={showPassword ? "text" : "password"} value={form.password} onChange={set("password")} placeholder="Password" required className={`${inputCls} pr-12`} />
              <button type="button" data-testid="auth-password-toggle" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-300 transition-colors">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && <p data-testid="auth-error-message" className="text-sm text-red-400">{error}</p>}
            <button data-testid="auth-submit-btn" type="submit" disabled={submitting}
              className="glow-btn w-full py-3.5 rounded-full bg-[#007AFF] text-white font-medium disabled:opacity-50">
              {submitting ? "Please wait…" : isLogin ? "Login" : "Register"}
            </button>
          </form>

          <p className="text-sm text-slate-400 text-center mt-7">
            {isLogin ? (
              <>New here? <Link to="/register" data-testid="auth-switch-register" className="text-cyan-300 hover:underline">Create an account</Link></>
            ) : (
              <>Already have an account? <Link to="/login" data-testid="auth-switch-login" className="text-cyan-300 hover:underline">Login</Link></>
            )}
          </p>
        </div>
      </FadeUp>
    </div>
  );
}
