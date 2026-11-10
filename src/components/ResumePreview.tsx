import type { CareerData, ResumeTemplate } from "@/lib/career-schema";
import { useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { defaultPresentation, type Presentation } from "@/lib/resume-design";
import { buildResume, type LayoutPage } from "@/lib/resume-layout";
import { Button } from "./ui/button";
import sans from "@/assets/resume-font-static.asset.json";
import serif from "@/assets/resume-serif.asset.json";
import mono from "@/assets/resume-mono.asset.json";
export function ResumePreview({ content, template, presentation = defaultPresentation() }: { content: CareerData; template: ResumeTemplate; presentation?: Presentation }) {
  const [result, setResult] = useState<{ pages: LayoutPage[]; width: number; height: number } | null>(null), [error, setError] = useState("");
  const [zoom, setZoom] = useState(1);
  useEffect(() => { let active = true; buildResume(content, template, presentation).then(r => { if (active) { setResult({ pages: r.pages, width: r.width, height: r.height }); setError(""); } }).catch(() => { if (active) setError("Preview could not load"); }); return () => { active = false; }; }, [content, template, JSON.stringify(presentation)]);
  useEffect(() => { const face = new FontFace(`Resume-${presentation.font}`, `url(${({ sans, serif, mono })[presentation.font].url})`); face.load().then(f => document.fonts.add(f)).catch(() => {}); }, [presentation.font]);
  const pages = result?.pages ?? [];
  return <div aria-label="Resume preview" className={`resume-accent-${presentation.accent} resume-font-${presentation.font} space-y-5`}>
    <div className="flex items-center justify-between gap-3">
      <p className="text-xs text-muted-foreground">{pages.length ? `${pages.length} page${pages.length === 1 ? "" : "s"} · ${presentation.pageSize === "letter" ? "US Letter" : "A4"}` : " "}</p>
      <div className="flex items-center gap-1">
        <Button size="icon" variant="outline" aria-label="Zoom out" disabled={zoom <= 0.6} onClick={() => setZoom(z => Math.max(0.6, Math.round((z - 0.2) * 10) / 10))}><Minus className="size-4" /></Button>
        <span className="w-12 text-center text-xs text-muted-foreground">{Math.round(zoom * 100)}%</span>
        <Button size="icon" variant="outline" aria-label="Zoom in" disabled={zoom >= 1.4} onClick={() => setZoom(z => Math.min(1.4, Math.round((z + 0.2) * 10) / 10))}><Plus className="size-4" /></Button>
      </div>
    </div>
    {error && <p role="alert">{error}</p>}{!pages.length && !error && <p role="status">Preparing preview…</p>}
    <div style={{ width: `${zoom * 100}%` }} className="mx-auto space-y-5">
    {result && pages.map((p, i) => <div key={i}><p className="mb-2 text-center text-xs text-muted-foreground">Page {i + 1} of {pages.length}</p><svg role="img" aria-label={`Resume page ${i + 1}`} viewBox={`0 0 ${result.width} ${result.height}`} className="resume-sheet w-full border border-border shadow-soft">
      <rect width={result.width} height={result.height} className="resume-paper-fill" />
      {p.shapes.map((s, k) => s.kind === "rect"
        ? <rect key={k} x={s.x} y={s.y} width={s.w} height={s.h} className="resume-accent-fill" />
        : <line key={k} x1={s.x} y1={s.y} x2={s.x + s.w} y2={s.y + s.h} strokeWidth={1} className="resume-accent-stroke" />)}
      {p.lines.map((l, j) => <text key={j} x={l.x} y={l.y} fontSize={l.size} textAnchor={l.center ? "middle" : "start"} className={l.accent ? "resume-accent-fill" : "resume-text-fill"}>{l.text}</text>)}
    </svg></div>)}
    </div>
  </div>;
}
