import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, MapPin, Clock, Wallet } from "lucide-react";
import api from "../lib/api";
import { FadeUp, Overline, EmptyState } from "../components/motion";

export default function Internships() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/internships").then((r) => setItems(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div data-testid="internships-page" className="pt-32 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <FadeUp>
        <Overline className="mb-5">Careers</Overline>
        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-50 mb-4">Internships</h1>
        <p className="text-slate-400 max-w-xl mb-16">Gain real-world experience, mentorship, and certificates with hands-on internship programs.</p>
      </FadeUp>

      {loading ? (
        <div className="space-y-6">{[1, 2].map((i) => <div key={i} className="glass rounded-3xl h-40 animate-pulse" />)}</div>
      ) : items.length === 0 ? (
        <EmptyState icon={Briefcase} title="No openings right now" testId="internships-empty-state"
          subtitle="New internship opportunities are posted here regularly. Follow us or contact us to get notified first." />
      ) : (
        <div className="space-y-6">
          {items.map((it, i) => (
            <FadeUp key={it.id} delay={(i % 3) * 0.06}>
              <Link to={`/internships/${it.id}`} data-testid={`internship-card-${i}`}
                className="glass rounded-3xl p-8 flex flex-col md:flex-row md:items-center gap-6 hover:bg-white/[0.06] hover:-translate-y-0.5 transition-all duration-300 block">
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-400 mb-2">{it.department}</p>
                  <h3 className="font-heading text-xl font-bold text-slate-50 mb-2">{it.title}</h3>
                  <p className="text-sm text-slate-400 line-clamp-2 max-w-2xl">{it.description}</p>
                </div>
                <div className="flex flex-wrap md:flex-col gap-3 text-xs text-slate-300 shrink-0">
                  <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-cyan-400" /> {it.location} · {it.mode}</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-cyan-400" /> {it.duration}</span>
                  {it.stipend && <span className="flex items-center gap-1.5"><Wallet className="w-3.5 h-3.5 text-cyan-400" /> {it.stipend}</span>}
                </div>
              </Link>
            </FadeUp>
          ))}
        </div>
      )}
    </div>
  );
}
