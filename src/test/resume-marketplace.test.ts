import { describe, expect, it } from "vitest";
import { templates, defaultPresentation, presentationSchema, selectDesign } from "@/lib/resume-design";
import { emptyCareer, resumeInputSchema } from "@/lib/career-schema";
import { resumeSections } from "@/lib/resume-document";
import { validateResumeFile, MAX_RESUME_BYTES } from "@/lib/resume-import-schema";
describe("Resume marketplace rules", () => {
  it("offers ten distinct reusable templates", () => expect(new Set(templates.map(t => t.key)).size).toBe(10));
  it("switches templates without changing resume facts", () => { const content = { ...emptyCareer(), full_name: "Candidate", summary: "Built software" }; for (const t of templates) { const saved = resumeInputSchema.parse({ title: "Resume", target_role: "", content, template: t.key, presentation: selectDesign(defaultPresentation(), t.key) }); expect(saved.content).toEqual(content); } });
  it("rejects duplicate section order", () => expect(presentationSchema.safeParse({ order: ["summary","summary","education","skills","projects","certifications"] }).success).toBe(false));
  it("hides optional sections without deleting their content", () => { const content = { ...emptyCareer(), summary: "Actual summary" }; expect(resumeSections(content, { ...defaultPresentation(), hidden: ["summary"] })).toEqual([]); expect(content.summary).toBe("Actual summary"); });
  it("accepts PDF and DOCX uploads", () => { expect(validateResumeFile("resume.pdf",1024)).toBeNull(); expect(validateResumeFile("resume.docx",1024)).toBeNull(); });
  it("rejects files over 10 MB", () => expect(validateResumeFile("resume.pdf",MAX_RESUME_BYTES+1)).not.toBeNull());
  it("rejects legacy DOC and executable uploads", () => { expect(validateResumeFile("resume.doc",1024)).not.toBeNull(); expect(validateResumeFile("resume.exe",1024)).not.toBeNull(); });
});