import { useEffect, useState } from "react";
import { Image as ImageIcon, PlayCircle } from "lucide-react";
import api from "../lib/api";
import { FadeUp, Overline, EmptyState } from "../components/motion";

function youtubeEmbed(url) {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

export default function Media() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    api.get("/media").then((r) => setItems(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = items.filter((m) => filter === "all" || m.type === filter);

  return (
    <div data-testid="media-page" className="pt-32 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <FadeUp>
        <Overline className="mb-5">Gallery</Overline>
        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-50 mb-4">Media</h1>
        <p className="text-slate-400 max-w-xl mb-10">Moments from our bootcamps, events, hackathons and student journeys.</p>
        <div className="flex gap-3 mb-14">
          {[["all", "All"], ["image", "Images"], ["video", "Videos"]].map(([val, label]) => (
            <button key={val} data-testid={`media-filter-${val}`} onClick={() => setFilter(val)}
              className={`px-5 py-2 rounded-full text-sm transition-colors ${filter === val ? "bg-cyan-400/15 text-cyan-300 border border-cyan-400/40" : "glass text-slate-300 hover:bg-white/10"}`}>
              {label}
            </button>
          ))}
        </div>
      </FadeUp>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">{[1, 2, 3].map((i) => <div key={i} className="glass rounded-3xl h-64 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={ImageIcon} title="Gallery is being curated" testId="media-empty-state"
          subtitle="Photos and videos from our events will appear here soon." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((m, i) => (
            <FadeUp key={m.id} delay={(i % 3) * 0.06}>
              <div className="glass rounded-3xl overflow-hidden group" data-testid={`media-item-${i}`}>
                {m.type === "video" ? (
                  youtubeEmbed(m.url) ? (
                    <iframe src={youtubeEmbed(m.url)} title={m.title} className="w-full aspect-video" allowFullScreen />
                  ) : (
                    <a href={m.url} target="_blank" rel="noreferrer" className="aspect-video flex items-center justify-center bg-white/5">
                      <PlayCircle className="w-12 h-12 text-cyan-400" strokeWidth={1.2} />
                    </a>
                  )
                ) : (
                  <img src={m.url} alt={m.title} className="w-full aspect-video object-cover opacity-85 group-hover:opacity-100 group-hover:scale-[1.02] transition-all duration-500" />
                )}
                <div className="p-6">
                  <h3 className="font-heading font-semibold text-slate-100">{m.title}</h3>
                  {m.description && <p className="text-sm text-slate-400 mt-1.5">{m.description}</p>}
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      )}
    </div>
  );
}
