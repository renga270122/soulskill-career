import type { CareerData, ResumeTemplate } from "@/lib/career-schema";
import { useEffect, useState } from "react";
import { defaultPresentation, type Presentation } from "@/lib/resume-design";
import { buildResume, type LayoutPage } from "@/lib/resume-layout";
import sans from "@/assets/resume-font-static.asset.json";
import serif from "@/assets/resume-serif.asset.json";
import mono from "@/assets/resume-mono.asset.json";
export function ResumePreview({ content, template, presentation = defaultPresentation() }: { content: CareerData; template: ResumeTemplate; presentation?: Presentation }) {
  const [pages, setPages] = useState<LayoutPage[]>([]), [error, setError] = useState("");
  useEffect(() => { let active = true; buildResume(content, template, presentation).then(result => { if (active) { setPages(result.pages); setError(""); } }).catch(() => { if (active) setError("Preview could not load"); }); return () => { active = false; }; }, [content, template, JSON.stringify(presentation)]);
  useEffect(() => { const face = new FontFace(`Resume-${presentation.font}`, `url(${({ sans, serif, mono })[presentation.font].url})`); face.load().then(f => document.fonts.add(f)).catch(() => {}); }, [presentation.font]);
  return <div aria-label="Resume preview" className={`resume-accent-${presentation.accent} resume-font-${presentation.font} space-y-5`}>
    {error && <p role="alert">{error}</p>}{!pages.length && !error && <p role="status">Preparing preview…</p>}
    {pages.map((p, i) => <div key={i}><p className="mb-2 text-center text-xs text-muted-foreground">Page {i + 1} of {pages.length}</p><svg role="img" aria-label={`Resume page ${i + 1}`} viewBox="0 0 595.28 841.89" className="resume-sheet w-full border border-border shadow-soft">
      <rect width="595.28" height="841.89" className="resume-paper-fill" />
      {["modern", "creative"].includes(template) && <rect width="595.28" height={template === "creative" ? 12 : 6} className="resume-accent-fill" />}
      {template === "contemporary" && <rect x="20" y="30" width="3" height="781.89" className="resume-accent-fill" />}
      {["classic", "executive"].includes(template) && <path d="M44 24 H551" className="resume-accent-stroke" />}
      {template === "columns" && <path d="M375 140 V798" className="resume-accent-stroke" />}
      {template === "graduate" && <rect x="535" y="30" width="16" height="16" className="resume-accent-fill" />}
      {template === "projects" && <rect x="24" y="38" width="6" height="35" className="resume-accent-fill" />}
      {p.lines.map((l, j) => <text key={j} x={l.x} y={l.y} fontSize={l.size} textAnchor={l.center ? "middle" : "start"} className={l.accent ? "resume-accent-fill" : "resume-text-fill"}>{l.text}</text>)}
    </svg></div>)}
  </div>;
}