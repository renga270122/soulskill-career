import { useState } from "react";
import { Eye, Check, Search } from "lucide-react";
import { templates, type Presentation, defaultPresentation } from "@/lib/resume-design";
import type { CareerData, ResumeTemplate } from "@/lib/career-schema";
import { ResumePreview } from "./ResumePreview";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

function Thumbnail({ template }: { template: typeof templates[number] }) {
  return <div aria-label={`${template.name} thumbnail`} className={`template-thumb template-${template.key}`}><div className="thumb-name" /><div className="thumb-role" /><div className="thumb-rule" /><div className="thumb-body">{[0,1,2].map(i => <div key={i} className="thumb-section"><div className="thumb-heading" /><div className="thumb-line" /><div className="thumb-line" /><div className="thumb-short" /></div>)}</div></div>;
}
export function TemplateGallery({ selected, content, presentation = defaultPresentation(), onSelect }: { selected?: ResumeTemplate; content: CareerData; presentation?: Presentation; onSelect: (key: ResumeTemplate) => void }) {
  const [query, setQuery] = useState(""), [preview, setPreview] = useState<ResumeTemplate | null>(null);
  const filtered = templates.filter(t => `${t.name} ${t.category}`.toLowerCase().includes(query.toLowerCase()));
  return <section className="space-y-6"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wider text-primary">SoulSkill originals</p><h2 className="mt-2 font-display text-3xl">Find your format</h2></div><div className="relative w-full sm:w-64"><Search className="absolute left-3 top-3 size-4 text-muted-foreground" /><Input aria-label="Search templates" placeholder="Search names or categories" className="pl-9" value={query} onChange={e => setQuery(e.target.value)} /></div></div>
    <div className="template-gallery-grid">{filtered.map(t => <article key={t.key} className={`overflow-hidden rounded-md border bg-card ${selected === t.key ? "border-primary" : "border-border"}`}><div className="relative flex justify-center bg-secondary p-6"><Thumbnail template={t} />{selected === t.key && <span className="absolute right-3 top-3 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground"><Check className="size-4" /></span>}</div><div className="space-y-3 p-4"><div><h3 className="font-semibold">{t.name}</h3><p className="mt-1 text-xs text-muted-foreground">{t.category}</p></div><p className="text-xs text-muted-foreground">{t.ats ? "ATS-friendly · Single column" : "Two columns · ATS reading order may vary"}</p><div className="flex gap-2"><Button size="sm" variant="outline" className="flex-1" onClick={() => setPreview(t.key)} aria-label={`Preview ${t.name}`}><Eye className="size-4" />Preview</Button><Button size="sm" className="flex-1" variant={selected === t.key ? "secondary" : "default"} onClick={() => onSelect(t.key)} aria-label={`Select ${t.name}`}>{selected === t.key ? "Selected" : "Select"}</Button></div></div></article>)}</div>
    {!filtered.length && <p className="text-sm text-muted-foreground">No templates match your search.</p>}
    <Dialog open={!!preview} onOpenChange={v => { if (!v) setPreview(null); }}><DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto"><DialogHeader><DialogTitle>{templates.find(t => t.key === preview)?.name} · Full-size preview</DialogTitle></DialogHeader>{preview && <><ResumePreview content={content} template={preview} presentation={presentation} /><Button onClick={() => { onSelect(preview); setPreview(null); }}>Select template</Button></>}</DialogContent></Dialog>
  </section>;
}