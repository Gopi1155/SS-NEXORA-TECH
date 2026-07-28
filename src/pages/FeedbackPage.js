import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star, MessageSquareQuote } from "lucide-react";
import { toast } from "sonner";
import api, { apiError } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { FadeUp, Overline, EmptyState } from "../components/motion";

export default function FeedbackPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get("/feedback").then((r) => setItems(r.data)).catch(() => {});
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!message.trim()) { toast.error("Please write your feedback"); return; }
    setSubmitting(true);
    try {
      await api.post("/feedback", { rating, message });
      setMessage("");
      toast.success("Thank you! Your feedback will appear after admin approval.");
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div data-testid="feedback-page" className="pt-32 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <FadeUp>
        <Overline className="mb-5">Community</Overline>
        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-50 mb-4">Feedback</h1>
        <p className="text-slate-400 max-w-xl mb-16">Real words from real learners and interns of SS Nexora Tech.</p>
      </FadeUp>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          {items.length === 0 ? (
            <EmptyState icon={MessageSquareQuote} title="No feedback yet" testId="feedback-empty-state"
              subtitle="Be the first to share your experience with SS Nexora Tech!" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {items.map((f, i) => (
                <FadeUp key={f.id} delay={(i % 2) * 0.06}>
                  <div className="glass rounded-3xl p-7 h-full" data-testid={`feedback-item-${i}`}>
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: f.rating }).map((_, j) => (
                        <Star key={j} className="w-4 h-4 text-cyan-400 fill-cyan-400" />
                      ))}
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed mb-5">"{f.message}"</p>
                    <p className="text-xs font-medium text-cyan-300">— {f.name}</p>
                  </div>
                </FadeUp>
              ))}
            </div>
          )}
        </div>

        <FadeUp delay={0.15}>
          <div className="glass rounded-3xl p-8 sticky top-24">
            <h2 className="font-heading text-lg font-bold text-slate-50 mb-2">Share your experience</h2>
            {user ? (
              <form onSubmit={submit} className="space-y-5 mt-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-3">Rating</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} type="button" data-testid={`feedback-star-${n}`} onClick={() => setRating(n)}>
                        <Star className={`w-7 h-7 transition-colors ${n <= rating ? "text-cyan-400 fill-cyan-400" : "text-slate-600"}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <textarea data-testid="feedback-message-input" value={message} onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about your experience…" rows={5}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none" />
                <button data-testid="feedback-submit-btn" type="submit" disabled={submitting}
                  className="glow-btn w-full py-3 rounded-full bg-[#007AFF] text-white text-sm font-medium disabled:opacity-50">
                  {submitting ? "Submitting…" : "Submit Feedback"}
                </button>
                <p className="text-xs text-slate-500">Feedback appears publicly after admin approval.</p>
              </form>
            ) : (
              <p className="text-sm text-slate-400 mt-3">
                <Link to="/login" className="text-cyan-300 hover:underline" data-testid="feedback-login-link">Login</Link> or{" "}
                <Link to="/register" className="text-cyan-300 hover:underline">register</Link> to share your feedback.
              </p>
            )}
          </div>
        </FadeUp>
      </div>
    </div>
  );
}
