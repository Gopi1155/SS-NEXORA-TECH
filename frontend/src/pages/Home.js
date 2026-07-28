import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import Marquee from "react-fast-marquee";
import { ArrowRight, GraduationCap, Briefcase, Star, Sparkles, Rocket, Users } from "lucide-react";
import api from "../lib/api";
import { FadeUp, MaskedLines, Overline, SectionHeading, LOGO_URL } from "../components/motion";

const HERO_BG = "https://images.unsplash.com/photo-1683064325134-3acfdef9c6d7?w=1920&q=80";

const MANIFESTO = [
  { num: "01", title: "INNOVATION", text: "We teach technology the way the industry uses it — not from outdated textbooks. Every course is rebuilt with what's shipping in the real world right now.", icon: Sparkles },
  { num: "02", title: "LEADERSHIP", text: "Skills get you hired. Leadership gets you promoted. Our mentors shape communicators, problem-solvers, and future tech leads — not just coders.", icon: Rocket },
  { num: "03", title: "COMMUNITY", text: "Learning alone is hard. Our interns and students build together, review each other's work, and graduate into a network that opens doors for life.", icon: Users },
];

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [internships, setInternships] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [settings, setSettings] = useState({});
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    api.get("/courses").then((r) => setCourses(r.data.slice(0, 3))).catch(() => {});
    api.get("/internships").then((r) => setInternships(r.data.slice(0, 2))).catch(() => {});
    api.get("/feedback").then((r) => setFeedback(r.data.slice(0, 3))).catch(() => {});
    api.get("/settings").then((r) => setSettings(r.data)).catch(() => {});
  }, []);

  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section ref={heroRef} className="relative min-h-[92vh] flex items-center overflow-hidden">
        <motion.div style={{ y: bgY }} className="absolute inset-0">
          <img src={HERO_BG} alt="" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#05050A]/60 via-[#05050A]/40 to-[#05050A]" />
        </motion.div>

        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-32 pb-24">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <Overline className="mb-6">SS Nexora Tech — Courses &amp; Internships</Overline>
          </motion.div>

          <h1 className="font-heading font-black tracking-tight text-4xl sm:text-6xl lg:text-7xl leading-[1.05] mb-8">
            <MaskedLines
              lines={[settings.hero_line1 || "Empowering", settings.hero_line2 || "Future Tech"]}
              lineClassName="text-slate-50"
              startDelay={0.2}
            />
            <MaskedLines
              lines={[settings.hero_line3 || "Leaders."]}
              lineClassName="text-transparent bg-clip-text bg-gradient-to-r from-[#007AFF] to-[#00F0FF]"
              startDelay={0.5}
            />
          </h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.7 }}
            className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed mb-10">
            {settings.hero_tagline || "Industry-grade courses and real-world internships that turn ambition into careers. Learn, build, and lead with SS Nexora Tech."}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.7 }}
            className="flex flex-wrap gap-4">
            <Link to="/courses" data-testid="hero-explore-courses-btn"
              className="glow-btn inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#007AFF] text-white font-medium">
              Explore Courses <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/internships" data-testid="hero-internships-btn"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full glass text-slate-100 font-medium hover:bg-white/10 transition-colors">
              View Internships
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3, duration: 1 }}
            className="mt-20 grid grid-cols-2 sm:grid-cols-4 max-w-2xl gap-6">
            {[
              [settings.stat_enrolled || "20+", "Enrolled Students"],
              [settings.stat_projects || "10+", "Real Projects"],
              [settings.stat_course_completions || "15+", "Course Completions"],
              [settings.stat_internship_completions || "10+", "Internship Completions"],
            ].map(([num, label]) => (
              <div key={label}>
                <p className="font-heading text-2xl sm:text-3xl font-bold text-cyan-300">{num}</p>
                <p className="text-xs text-slate-400 mt-1">{label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.img
          src={LOGO_URL} alt="SS Nexora Tech emblem"
          initial={{ opacity: 0, scale: 0.8, rotate: -6 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.9, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="hidden xl:block absolute right-24 top-1/2 -translate-y-1/2 w-72 h-72 rounded-full object-cover ring-1 ring-cyan-400/30 shadow-[0_0_80px_rgba(0,122,255,0.35)]"
        />
      </section>

      {/* MARQUEE */}
      <section className="border-y border-white/10 py-5 bg-white/[0.02]">
        <Marquee speed={35} gradient={false} pauseOnHover>
          {["WEB DEVELOPMENT", "AI & MACHINE LEARNING", "DATA SCIENCE", "CLOUD COMPUTING", "CYBER SECURITY", "UI/UX DESIGN", "INTERNSHIPS", "PLACEMENT SUPPORT"].map((t) => (
            <span key={t} className="mx-8 font-heading text-sm tracking-[0.3em] text-slate-400 flex items-center gap-8">
              {t} <Star className="w-3 h-3 text-cyan-400/60 fill-cyan-400/60" />
            </span>
          ))}
        </Marquee>
      </section>

      {/* MANIFESTO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <SectionHeading overline="Our Manifesto" title="What we stand for" className="mb-16" />
        <div className="space-y-10">
          {MANIFESTO.map((m, i) => (
            <FadeUp key={m.num} delay={i * 0.08}>
              <div className="glass rounded-3xl p-8 sm:p-12 flex flex-col sm:flex-row gap-8 items-start hover:bg-white/[0.06] transition-colors duration-300 group">
                <span className="font-heading text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-cyan-400/60 to-cyan-400/10 shrink-0">
                  {m.num}
                </span>
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <m.icon className="w-5 h-5 text-cyan-400" />
                    <h3 className="font-heading text-xl sm:text-2xl font-bold tracking-[0.15em] text-slate-50">{m.title}</h3>
                  </div>
                  <p className="text-slate-400 leading-relaxed max-w-2xl">{m.text}</p>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* FEATURED COURSES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex items-end justify-between mb-12 gap-6 flex-wrap">
          <SectionHeading overline="Programs" title="Featured Courses" />
          <Link to="/courses" data-testid="home-all-courses-link" className="text-sm text-cyan-300 hover:text-cyan-200 inline-flex items-center gap-1.5 transition-colors">
            All courses <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {courses.map((c, i) => (
              <FadeUp key={c.id} delay={i * 0.1}>
                <Link to={`/courses/${c.id}`} data-testid={`home-course-card-${i}`}
                  className="glass rounded-3xl overflow-hidden block group hover:-translate-y-1 transition-transform duration-300">
                  {c.image && <img src={c.image} alt={c.title} className="h-44 w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />}
                  <div className="p-7">
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan-400 mb-3">{c.category}</p>
                    <h3 className="font-heading text-lg font-bold text-slate-50 mb-2">{c.title}</h3>
                    <p className="text-sm text-slate-400 line-clamp-2">{c.description}</p>
                    <p className="mt-4 text-sm font-medium text-cyan-300">{c.price} · {c.duration}</p>
                  </div>
                </Link>
              </FadeUp>
            ))}
          </div>
        ) : (
          <FadeUp>
            <div className="glass rounded-3xl p-16 text-center" data-testid="home-courses-empty">
              <GraduationCap className="w-10 h-10 text-cyan-400/70 mx-auto mb-4" strokeWidth={1.2} />
              <p className="font-heading text-lg text-slate-100 mb-2">New courses launching soon</p>
              <p className="text-sm text-slate-400">Our team is curating industry-grade programs. Check back shortly.</p>
            </div>
          </FadeUp>
        )}
      </section>

      {/* INTERNSHIPS TEASER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="glass rounded-[2.5rem] p-10 sm:p-16 relative overflow-hidden">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#007AFF]/20 blur-[100px]" />
          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <FadeUp>
              <Overline className="mb-4">Work Experience</Overline>
              <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-50 mb-6">
                Real internships.<br />Real portfolios.
              </h2>
              <p className="text-slate-400 leading-relaxed mb-8 max-w-md">
                Ship production features alongside mentors, earn certificates, and graduate with work that speaks louder than any resume.
              </p>
              <Link to="/internships" data-testid="home-internships-cta"
                className="glow-btn inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#007AFF] text-white text-sm font-medium">
                <Briefcase className="w-4 h-4" /> Browse Internships
              </Link>
            </FadeUp>
            <div className="space-y-4">
              {internships.length > 0 ? internships.map((it, i) => (
                <FadeUp key={it.id} delay={i * 0.1}>
                  <Link to={`/internships/${it.id}`} className="glass rounded-2xl p-6 flex items-center justify-between gap-4 hover:bg-white/[0.07] transition-colors block">
                    <div>
                      <h3 className="font-heading font-semibold text-slate-100">{it.title}</h3>
                      <p className="text-xs text-slate-400 mt-1">{it.department} · {it.mode} · {it.duration}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-cyan-400 shrink-0" />
                  </Link>
                </FadeUp>
              )) : (
                <FadeUp>
                  <div className="glass rounded-2xl p-8 text-center">
                    <Briefcase className="w-8 h-8 text-cyan-400/70 mx-auto mb-3" strokeWidth={1.2} />
                    <p className="text-sm text-slate-400">Internship openings will be posted here soon.</p>
                  </div>
                </FadeUp>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      {feedback.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <SectionHeading overline="Voices" title="What our learners say" className="mb-14" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {feedback.map((f, i) => (
              <FadeUp key={f.id} delay={i * 0.1}>
                <div className="glass rounded-3xl p-8">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: f.rating }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 text-cyan-400 fill-cyan-400" />
                    ))}
                  </div>
                  <p className="text-slate-300 leading-relaxed mb-6">"{f.message}"</p>
                  <p className="text-sm font-medium text-cyan-300">— {f.name}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <FadeUp>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-50 mb-6">
            Ready to build your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#007AFF] to-[#00F0FF]">future</span>?
          </h2>
          <p className="text-slate-400 mb-10 max-w-xl mx-auto">Join SS Nexora Tech today. Register free and start your journey toward a tech career that matters.</p>
          <Link to="/register" data-testid="home-cta-register-btn"
            className="glow-btn inline-flex items-center gap-2 px-10 py-4 rounded-full bg-[#007AFF] text-white font-medium">
            Get Started <ArrowRight className="w-5 h-5" />
          </Link>
        </FadeUp>
      </section>
    </div>
  );
}
