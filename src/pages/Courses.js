import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, Clock, BarChart3 } from "lucide-react";
import api from "../lib/api";
import { FadeUp, Overline, EmptyState } from "../components/motion";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/courses").then((r) => setCourses(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div data-testid="courses-page" className="pt-32 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <FadeUp>
        <Overline className="mb-5">Programs</Overline>
        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-50 mb-4">Courses</h1>
        <p className="text-slate-400 max-w-xl mb-16">Industry-grade programs designed to take you from learner to professional.</p>
      </FadeUp>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => <div key={i} className="glass rounded-3xl h-80 animate-pulse" />)}
        </div>
      ) : courses.length === 0 ? (
        <EmptyState icon={GraduationCap} title="Courses coming soon" testId="courses-empty-state"
          subtitle="Our team is preparing new industry-grade programs. Check back shortly or contact us to be notified." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((c, i) => (
            <FadeUp key={c.id} delay={(i % 3) * 0.08}>
              <Link to={`/courses/${c.id}`} data-testid={`course-card-${i}`}
                className="glass rounded-3xl overflow-hidden block group hover:-translate-y-1 transition-transform duration-300 h-full">
                {c.image ? (
                  <img src={c.image} alt={c.title} className="h-48 w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                ) : (
                  <div className="h-48 w-full bg-gradient-to-br from-[#007AFF]/20 to-[#00F0FF]/10 flex items-center justify-center">
                    <GraduationCap className="w-12 h-12 text-cyan-400/50" strokeWidth={1.2} />
                  </div>
                )}
                <div className="p-7">
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-400 mb-3">{c.category}</p>
                  <h3 className="font-heading text-lg font-bold text-slate-50 mb-2">{c.title}</h3>
                  <p className="text-sm text-slate-400 line-clamp-2 mb-5">{c.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-cyan-400" /> {c.duration || "Flexible"}</span>
                    <span className="flex items-center gap-1.5"><BarChart3 className="w-3.5 h-3.5 text-cyan-400" /> {c.level}</span>
                    <span className="ml-auto font-medium text-cyan-300 text-sm">{c.price}</span>
                  </div>
                </div>
              </Link>
            </FadeUp>
          ))}
        </div>
      )}
    </div>
  );
}
