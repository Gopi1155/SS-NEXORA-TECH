import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";
import api from "../lib/api";
import { LOGO_URL } from "./motion";

export function Footer() {
  const [s, setS] = useState({});
  useEffect(() => { api.get("/settings").then((r) => setS(r.data)).catch(() => {}); }, []);
  return (
    <footer className="border-t border-white/10 bg-[#03030710] backdrop-blur-xl mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-5">
            <img src={LOGO_URL} alt="SS Nexora Tech logo" className="h-12 w-12 rounded-full object-cover ring-1 ring-cyan-400/40" />
            <div>
              <p className="font-heading font-bold text-slate-50">SS NEXORA <span className="text-cyan-400">TECH</span></p>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Empowering Future Tech Leaders</p>
            </div>
          </div>
          <p className="text-sm text-slate-400 max-w-md leading-relaxed">
            We build careers, not just skills. Industry-driven courses and hands-on internships designed to launch the next generation of technology leaders.
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400 mb-5">Explore</p>
          <ul className="space-y-3 text-sm">
            {[["Courses", "/courses"], ["Internships", "/internships"], ["Media", "/media"], ["Feedback", "/feedback"], ["About Us", "/about"]].map(([label, to]) => (
              <li key={to}><Link to={to} className="text-slate-300 hover:text-cyan-300 transition-colors">{label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400 mb-5">Contact</p>
          <ul className="space-y-3 text-sm text-slate-300">
            <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-cyan-400" /> {s.contact_email || "ssnexoratech.19@gmail.com"}</li>
            <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-cyan-400" /> {s.contact_phone || ""}</li>
            <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-cyan-400" /> {s.contact_address || ""}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} SS NEXORA TECH. All rights reserved.
      </div>
    </footer>
  );
}
