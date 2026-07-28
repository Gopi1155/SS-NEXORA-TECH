import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, BarChart3, CheckCircle2, Tag } from "lucide-react";
import { toast } from "sonner";
import api, { apiError } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { FadeUp } from "../components/motion";

export default function CourseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api.get(`/courses/${id}`).then((r) => setCourse(r.data)).catch(() => setNotFound(true));
  }, [id]);

  const enroll = async () => {
    if (!user) { navigate("/login"); return; }
    setSubmitting(true);
    try {
      await api.post("/enrollments", { course_id: id, phone });
      toast.success("Enrollment submitted! Our team will contact you.");
    } catch (e) {
      toast.error(apiError(e));
    } finally {
      setSubmitting(false);
    }
  };

  if (notFound) return <div className="pt-40 text-center text-slate-400">Course not found. <Link to="/courses" className="text-cyan-300">Back to courses</Link></div>;
  if (!course) return <div className="pt-40 text-center text-slate-400">Loading…</div>;

  return (
    <div data-testid="course-detail-page" className="pt-28 pb-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <Link to="/courses" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-300 mb-8 transition-colors" data-testid="course-back-link">
        <ArrowLeft className="w-4 h-4" /> All courses
      </Link>

      <FadeUp>
        <div className="glass rounded-[2.5rem] overflow-hidden">
          {course.image && <img src={course.image} alt={course.title} className="h-64 sm:h-80 w-full object-cover opacity-85" />}
          <div className="p-8 sm:p-12">
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-400 mb-4 flex items-center gap-2"><Tag className="w-3.5 h-3.5" /> {course.category}</p>
            <h1 className="font-heading text-3xl sm:text-4xl font-black tracking-tight text-slate-50 mb-6">{course.title}</h1>
            <div className="flex flex-wrap gap-4 mb-8 text-sm text-slate-300">
              <span className="glass px-4 py-2 rounded-full flex items-center gap-2"><Clock className="w-4 h-4 text-cyan-400" /> {course.duration || "Flexible"}</span>
              <span className="glass px-4 py-2 rounded-full flex items-center gap-2"><BarChart3 className="w-4 h-4 text-cyan-400" /> {course.level}</span>
              <span className="glass px-4 py-2 rounded-full text-cyan-300 font-medium">{course.price}</span>
            </div>
            <p className="text-slate-300 leading-relaxed mb-10">{course.description}</p>

            {course.syllabus?.length > 0 && (
              <div className="mb-10">
                <h2 className="font-heading text-lg font-bold text-slate-50 mb-5">What you'll learn</h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {course.syllabus.map((s, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" /> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="glass rounded-3xl p-8">
              <h2 className="font-heading text-lg font-bold text-slate-50 mb-2">Enroll in this course</h2>
              {user ? (
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <input data-testid="enroll-phone-input" value={phone} onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone number (optional)"
                    className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none" />
                  <button data-testid="enroll-submit-btn" onClick={enroll} disabled={submitting}
                    className="glow-btn px-8 py-3 rounded-full bg-[#007AFF] text-white text-sm font-medium disabled:opacity-50">
                    {submitting ? "Submitting…" : "Enroll Now"}
                  </button>
                </div>
              ) : (
                <p className="text-sm text-slate-400 mt-2">
                  <Link to="/login" className="text-cyan-300 hover:underline" data-testid="enroll-login-link">Login</Link> or{" "}
                  <Link to="/register" className="text-cyan-300 hover:underline">register</Link> to enroll in this course.
                </p>
              )}
            </div>
          </div>
        </div>
      </FadeUp>
    </div>
  );
}
