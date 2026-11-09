import { resumeContact, resumeSections } from "@/lib/resume-document";
import type { CareerData, ResumeTemplate } from "@/lib/career-schema";

export function ResumePreview({ content: d, template }: { content: CareerData; template: ResumeTemplate }) {
  return <article aria-label="Resume preview" className={`resume-paper resume-${template} min-h-[650px] w-full break-words border border-border bg-card p-6 text-card-foreground shadow-soft sm:p-9`}>
    <header className="border-b border-border pb-5"><h2 className="resume-name text-3xl font-semibold leading-tight">{d.full_name || "Your name"}</h2>{(d.headline || d.current_role) && <p className="mt-2 text-sm">{d.headline || d.current_role}</p>}<p className="mt-3 whitespace-pre-wrap text-xs leading-relaxed">{resumeContact(d)}</p></header>
    {resumeSections(d).map(s => <section key={s.title} className="mt-5"><h3 className="resume-section mb-3 text-xs font-semibold uppercase tracking-wider">{s.title}</h3>{s.entries.map((e, i) => <div key={i} className="mb-4">{e.heading && <h4 className="text-sm font-semibold">{e.heading}</h4>}{e.meta && <p className="mt-1 text-xs text-muted-foreground">{e.meta}</p>}{e.body && <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed">{e.body}</p>}</div>)}</section>)}
  </article>;
}