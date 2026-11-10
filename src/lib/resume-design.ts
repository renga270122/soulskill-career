import { z } from "zod";

export const designKeys = ["classic", "modern", "executive", "technical", "innovator", "corporate", "creative", "graduate", "minimal", "contemporary", "projects", "columns"] as const;
export const sectionKeys = ["summary", "experience", "education", "skills", "projects", "certifications"] as const;
export type SectionKey = typeof sectionKeys[number];
export const pageSizes = ["a4", "letter"] as const;
export type PageSize = typeof pageSizes[number];
export const accentKeys = ["navy", "teal", "ruby", "graphite", "slate", "purple"] as const;
export const presentationSchema = z.object({
  font: z.enum(["sans", "serif", "mono"]).default("sans"),
  accent: z.enum(accentKeys).default("navy"),
  order: z.array(z.enum(sectionKeys)).length(6).refine(v => new Set(v).size === 6, "Each section must appear once").default([...sectionKeys]),
  hidden: z.array(z.enum(sectionKeys)).max(6).default([]),
  pageSize: z.enum(pageSizes).default("a4"),
});
export type Presentation = z.infer<typeof presentationSchema>;
export function defaultPresentation(): Presentation { return presentationSchema.parse({}); }
export const sectionLabels: Record<SectionKey, string> = { summary: "Professional summary", experience: "Work experience", education: "Education", skills: "Skills", projects: "Projects", certifications: "Certifications" };
export const templates = [
  { key: "classic", name: "Classic", category: "ATS-first Professional", ats: true, motif: "rule", note: "Single-column structure that parses cleanly." },
  { key: "modern", name: "Modern", category: "Modern Professional", ats: true, motif: "band", note: "A confident accent and generous rhythm." },
  { key: "executive", name: "Executive", category: "Leadership & Management", ats: true, motif: "center", note: "A composed, centered introduction." },
  { key: "technical", name: "Tech Professional", category: "Software & Engineering", ats: true, motif: "code", note: "Precise typography. Skills in focus." },
  { key: "innovator", name: "Innovator", category: "AI, Data & Emerging Tech", ats: true, motif: "ruled", note: "Forward-looking structure for emerging fields." },
  { key: "corporate", name: "Corporate", category: "Finance, HR & Operations", ats: true, motif: "underline", note: "Conservative, boardroom-ready presentation." },
  { key: "creative", name: "Creative", category: "Marketing & Design", ats: true, motif: "block", note: "Expressive headings, readable content." },
  { key: "graduate", name: "Graduate", category: "Entry Level & Internships", ats: true, motif: "education", note: "Education and potential take the lead." },
  { key: "minimal", name: "Essential", category: "Minimalist", ats: true, motif: "quiet", note: "Only the details that matter." },
  { key: "contemporary", name: "Contour", category: "Contemporary", ats: true, motif: "rail", note: "A slim accent with an editorial feel." },
  { key: "projects", name: "Portfolio", category: "Project-focused", ats: true, motif: "projects", note: "Bring your work to the foreground." },
  { key: "columns", name: "Parallel", category: "Two-column Professional", ats: false, motif: "columns", note: "A compact sidebar for supporting details." },
] as const;
export function templateFor(key: typeof designKeys[number]) { return templates.find(t => t.key === key) ?? templates[0]; }
export function selectDesign(p: Presentation, key: typeof designKeys[number]): Presentation {
  const order: SectionKey[] =
    key === "technical" ? ["summary", "skills", "experience", "projects", "education", "certifications"] :
    key === "innovator" ? ["summary", "skills", "projects", "experience", "education", "certifications"] :
    key === "graduate" ? ["summary", "education", "projects", "skills", "experience", "certifications"] :
    key === "projects" ? ["summary", "projects", "experience", "skills", "education", "certifications"] : [...p.order];
  return { ...p, order };
}
