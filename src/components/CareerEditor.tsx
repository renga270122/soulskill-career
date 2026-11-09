import type { CareerData } from "@/lib/career-schema";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

export function CareerEditor({ value, onChange }: { value: CareerData; onChange: (v: CareerData) => void }) {
  const d = value;
  function field(key: keyof CareerData, label: string, type = "text", maxLength = 200) {
    return <div className="space-y-2" key={key}><Label htmlFor={`career-${key}`}>{label}</Label><Input id={`career-${key}`} type={type} maxLength={maxLength} min={0} max={80} step="0.5" value={String(d[key])} onChange={e => onChange({ ...d, [key]: type === "number" ? Number(e.target.value) : e.target.value })} /></div>;
  }
  const groups = [
    { key: "skills", title: "Skills", initial: { name: "", level: "Intermediate" }, fields: [["name", "Skill"], ["level", "Proficiency"]] },
    { key: "experience", title: "Work experience", initial: { role: "", company: "", start: "", end: "", description: "" }, fields: [["role", "Role"], ["company", "Company"], ["start", "Start", "month"], ["end", "End (blank if current)", "month"], ["description", "Achievements", "textarea"]] },
    { key: "education", title: "Education", initial: { degree: "", institution: "", start: "", end: "" }, fields: [["degree", "Qualification"], ["institution", "Institution"], ["start", "Start", "month"], ["end", "End", "month"]] },
    { key: "projects", title: "Projects", initial: { name: "", url: "", description: "" }, fields: [["name", "Project name"], ["url", "Project link", "url"], ["description", "Description", "textarea"]] },
    { key: "certifications", title: "Certifications", initial: { name: "", issuer: "", date: "", url: "" }, fields: [["name", "Certification"], ["issuer", "Issuer"], ["date", "Issued", "month"], ["url", "Credential link", "url"]] },
  ] as const;
  return <div className="space-y-8">
    <section className="space-y-5"><h2 className="text-lg font-semibold">Personal details</h2><div className="grid gap-4 sm:grid-cols-2">{field("full_name", "Full name")}{field("headline", "Professional headline")}{field("location", "Location")}{field("current_role", "Current role")}{field("years", "Years of experience", "number")}{field("email", "Contact email", "email", 255)}{field("phone", "Phone", "tel", 40)}</div></section>
    <section className="space-y-3"><Label htmlFor="career-summary">Professional summary</Label><Textarea id="career-summary" rows={5} maxLength={6000} value={d.summary} onChange={e => onChange({ ...d, summary: e.target.value })} /></section>
    {groups.map(g => {
      const entries = d[g.key] as unknown as Record<string, string>[];
      return <section className="space-y-4 border-t border-border pt-6" key={g.key}><div className="flex items-center justify-between gap-2"><h2 className="text-lg font-semibold">{g.title}</h2><Button type="button" size="sm" variant="outline" onClick={() => onChange({ ...d, [g.key]: [...entries, { ...g.initial }] })}><Plus className="size-4" />Add {g.key === "experience" ? "experience" : g.key === "education" ? "education" : g.key.slice(0, -1)}</Button></div>
        {!entries.length && <p className="text-sm text-muted-foreground">No {g.title.toLowerCase()} added.</p>}
        {entries.map((row, index) => <div key={index} className="space-y-4 rounded-md border border-border bg-card p-4"><div className="flex justify-between"><span className="text-xs text-muted-foreground">{g.title} {index + 1}</span><Button type="button" variant="ghost" size="icon" title={`Remove ${g.title} ${index + 1}`} aria-label={`Remove ${g.title} ${index + 1}`} onClick={() => onChange({ ...d, [g.key]: entries.filter((_, i) => i !== index) })}><Trash2 className="size-4" /></Button></div><div className="grid gap-4 sm:grid-cols-2">{g.fields.map(f => {
          const [key, label] = f;
          const kind = f.length > 2 ? f[2] : "text";
          const id = `${g.key}-${index}-${key}`;
          const update = (v: string) => onChange({ ...d, [g.key]: entries.map((r, i) => i === index ? { ...r, [key]: v } : r) });
          return <div key={key} className={`space-y-2 ${kind === "textarea" ? "sm:col-span-2" : ""}`}><Label htmlFor={id}>{label}</Label>{key === "level" ? <select id={id} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={row[key]} onChange={e => update(e.target.value)}>{["Beginner", "Intermediate", "Advanced", "Expert"].map(l => <option key={l}>{l}</option>)}</select> : kind === "textarea" ? <Textarea id={id} maxLength={6000} rows={4} value={row[key]} onChange={e => update(e.target.value)} /> : <Input id={id} type={kind} maxLength={kind === "url" ? 500 : 200} value={row[key]} onChange={e => update(e.target.value)} />}</div>;
        })}</div></div>)}
      </section>;
    })}
    <section className="space-y-4 border-t border-border pt-6"><h2 className="text-lg font-semibold">Professional links</h2><div className="grid gap-4">{field("linkedin", "LinkedIn", "url", 500)}{field("github", "GitHub", "url", 500)}{field("portfolio", "Portfolio", "url", 500)}</div></section>
  </div>;
}