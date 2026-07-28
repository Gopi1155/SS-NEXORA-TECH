import { useEffect, useState } from "react";
import { Target, Eye, Award, Users2, Cpu, HeartHandshake } from "lucide-react";
import api from "../lib/api";
import { FadeUp, Overline, SectionHeading, LOGO_URL } from "../components/motion";

const VALUES = [
  { icon: Cpu, title: "Industry-First Curriculum", text: "Courses designed with hiring managers, updated every quarter to match real market demand." },
  { icon: Users2, title: "Mentor-Led Learning", text: "Every learner gets guidance from engineers who've built and shipped at scale." },
  { icon: Award, title: "Certified Outcomes", text: "Recognized certifications and portfolio projects that prove your capability." },
  { icon: HeartHandshake, title: "Career Support", text: "Resume reviews, mock interviews, and placement assistance until you land the role." },
];

export default function About() {
  const [s, setS] = useState({});
  useEffect(() => { api.get("/settings").then((r) => setS(r.data)).catch(() => {}); }, []);
  return (
    <div data-testid="about-page" className="pt-32 pb-12">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeUp>
          <Overline className="mb-5">About Us</Overline>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-50 max-w-3xl leading-[1.08]">
            We exist to make tech careers <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#007AFF] to-[#00F0FF]">achievable</span>.
          </h1>
        </FadeUp>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-20 items-center">
          <FadeUp>
            <div className="glass rounded-[2.5rem] p-10 sm:p-14 relative overflow-hidden">
              <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-cyan-400/10 blur-[80px]" />
              <img src={LOGO_URL} alt="SS Nexora Tech logo" className="w-40 h-40 rounded-full object-cover ring-1 ring-cyan-400/30 mb-8 shadow-[0_0_60px_rgba(0,122,255,0.3)]" />
              <p className="text-slate-300 leading-relaxed">
                {s.about_story || "SS NEXORA TECH was founded with a single conviction: talent is everywhere, but opportunity is not. We bridge that gap with practical, affordable, industry-driven education and hands-on internships that convert learning into employment."}
              </p>
            </div>
          </FadeUp>
          <div className="space-y-8">
            <FadeUp delay={0.1}>
              <div className="glass rounded-3xl p-8 flex gap-5">
                <Target className="w-8 h-8 text-cyan-400 shrink-0" strokeWidth={1.5} />
                <div>
                  <h2 className="font-heading text-lg font-bold text-slate-50 mb-2">Our Mission</h2>
                  <p className="text-sm text-slate-400 leading-relaxed">{s.about_mission || "To empower students and professionals with future-ready technology skills through courses and internships built on real industry needs."}</p>
                </div>
              </div>
            </FadeUp>
            <FadeUp delay={0.2}>
              <div className="glass rounded-3xl p-8 flex gap-5">
                <Eye className="w-8 h-8 text-cyan-400 shrink-0" strokeWidth={1.5} />
                <div>
                  <h2 className="font-heading text-lg font-bold text-slate-50 mb-2">Our Vision</h2>
                  <p className="text-sm text-slate-400 leading-relaxed">{s.about_vision || "A world where every ambitious learner — regardless of background — can become a tech leader shaping tomorrow's innovation."}</p>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <SectionHeading overline="Why SS Nexora Tech" title="What makes us different" className="mb-14" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {VALUES.map((v, i) => (
            <FadeUp key={v.title} delay={i * 0.08}>
              <div className="glass rounded-3xl p-8 h-full hover:bg-white/[0.06] hover:-translate-y-1 transition-all duration-300">
                <v.icon className="w-7 h-7 text-cyan-400 mb-5" strokeWidth={1.5} />
                <h3 className="font-heading text-lg font-bold text-slate-50 mb-3">{v.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{v.text}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>
    </div>
  );
}
