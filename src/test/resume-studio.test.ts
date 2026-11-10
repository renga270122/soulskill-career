import { describe, expect, it } from "vitest";
import { Packer } from "docx";
import { unzipSync } from "fflate";
import { defaultPresentation, presentationSchema, selectDesign } from "@/lib/resume-design";
import { emptyCareer } from "@/lib/career-schema";
import { buildResumeDocx } from "@/lib/resume-docx";

describe("Resume Studio upgrade rules", () => {
  it("defaults to A4 and accepts US Letter page size", () => {
    expect(defaultPresentation().pageSize).toBe("a4");
    expect(presentationSchema.parse({ pageSize: "letter" }).pageSize).toBe("letter");
    expect(presentationSchema.safeParse({ pageSize: "legal" }).success).toBe(false);
  });
  it("defaults new resumes to the navy accent and keeps legacy accents valid", () => {
    expect(defaultPresentation().accent).toBe("navy");
    expect(presentationSchema.safeParse({ accent: "purple" }).success).toBe(true);
    expect(presentationSchema.safeParse({ accent: "slate" }).success).toBe(true);
  });
  it("orders innovator sections for emerging-tech roles without touching content", () => {
    const p = selectDesign(defaultPresentation(), "innovator");
    expect(p.order).toEqual(["summary", "skills", "projects", "experience", "education", "certifications"]);
  });
  it("keeps corporate section order conservative", () => {
    const p = selectDesign(defaultPresentation(), "corporate");
    expect(p.order).toEqual(["summary", "experience", "education", "skills", "projects", "certifications"]);
  });
  it("generates a real DOCX document, not a renamed PDF", async () => {
    const content = { ...emptyCareer(), full_name: "Asha Rao", summary: "Built data platforms", experience: [{ role: "Engineer", company: "Acme", start: "2020-01", end: "", description: "Shipped pipelines" }] };
    const base64 = await Packer.toBase64String(buildResumeDocx(content, "classic", defaultPresentation()));
    expect(base64.startsWith("UEsDB")).toBe(true); // ZIP (DOCX) signature, PDFs start with JVBERi
    expect(base64.length).toBeGreaterThan(5000);
  });
  it("uses US Letter dimensions in DOCX when selected", async () => {
    const content = { ...emptyCareer(), full_name: "Asha Rao" };
    const base64 = await Packer.toBase64String(buildResumeDocx(content, "modern", { ...defaultPresentation(), pageSize: "letter" }));
    const files = unzipSync(Uint8Array.from(atob(base64), c => c.charCodeAt(0)));
    const xml = new TextDecoder().decode(files["word/document.xml"]);
    expect(xml).toContain('w:w="12240"');
    expect(xml).toContain('w:h="15840"');
  });
});
