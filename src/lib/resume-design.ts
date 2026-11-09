import { z } from "zod";

export const designKeys = ["classic", "modern", "executive", "technical", "minimal", "contemporary", "creative", "graduate", "projects", "columns"] as const;
export const sectionKeys = ["summary", "experience", "education", "skills", "projects", "certifications"] as const;
export type SectionKey = typeof sectionKeys[number];
export const presentationSchema = z.object({
  font: z.enum(["sans", "serif", "mono"]).default("sans"),
  accent: z.enum(["purple", "teal", "ruby", "graphite"]).default("purple"),
  order: z.array(z.enum(sectionKeys)).length(6).refine(v => new Set(v).size === 6, "Each section must appear once").default([...sectionKeys]),
  hidden: z.array(z.enum(sectionKeys)).max(6).default([]),
});
export type Presentation = z.infer<typeof presentationSchema>;
export function defaultPresentation(): Presentation { return presentationSchema.parse({}); }
export const sectionLabels: Record<SectionKey, string> = { summary: "Professional summary", experience: "Work experience", education: "Education", skills: "Skills", projects: "Projects", certifications: "Certifications" };
export const templates = [
  { key: "classic", name: "Foundation", category: "Classic ATS", ats: true, motif: "rule", note: "Clear hierarchy. Timeless structure." },
  { key: "modern", name: "Meridian", category: "Modern Professional", ats: true, motif: "band", note: "A confident accent and generous rhythm." },
  { key: "executive", name: "Principle", category: "Executive Leadership", ats: true, motif: "center", note: "A composed, centered introduction." },
  { key: "technical", name: "Stack", category: "Technical / Software", ats: true, motif: "code", note: "Precise typography. Skills in focus." },
  { key: "minimal", name: "Essential", category: "Minimalist", ats: true, motif: "quiet", note: "Only the details that matter." },
  { key: "contemporary", name: "Contour", category: "Contemporary", ats: true, motif: "rail", note: "A slim accent with an editorial feel." },
  { key: "creative", name: "Studio", category: "Creative", ats: true, motif: "block", note: "Expressive headings, readable content." },
  { key: "graduate", name: "First Chapter", category: "Graduate / Entry Level", ats: true, motif: "education", note: "Education and potential take the lead." },
  { key: "projects", name: "Portfolio", category: "Project-focused", ats: true, motif: "projects", note: "Bring your work to the foreground." },
  { key: "columns", name: "Parallel", category: "Two-column Professional", ats: false, motif: "columns", note: "A compact sidebar for supporting details." },
] as const;
export function templateFor(key: typeof designKeys[number]) { return templates.find(t => t.key === key) ?? templates[0]; }
export function selectDesign(p: Presentation, key: typeof designKeys[number]): Presentation {
  const order: SectionKey[] = key === "technical" ? ["summary", "skills", "experience", "projects", "education", "certifications"] : key === "graduate" ? ["summary", "education", "projects", "skills", "experience", "certifications"] : key === "projects" ? ["summary", "projects", "experience", "skills", "education", "certifications"] : [...p.order];
  return { ...p, order };
}