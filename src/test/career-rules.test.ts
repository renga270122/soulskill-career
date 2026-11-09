import { describe, expect, it } from "vitest";
import { careerSchema, completeness, emptyCareer, resumeInputSchema } from "@/lib/career-schema";
describe("candidate profile rules", () => {
  it("requires a full name", () => expect(careerSchema.safeParse(emptyCareer()).success).toBe(false));
  it("rejects unsafe professional links", () => expect(careerSchema.safeParse({ ...emptyCareer(), full_name: "A", linkedin: "javascript:alert(1)" }).success).toBe(false));
  it("counts one of twelve completeness items as 8%", () => expect(completeness({ ...emptyCareer(), full_name: "A" })).toBe(8));
  it("supports three professional templates", () => { for (const template of ["classic", "modern", "executive"]) expect(resumeInputSchema.safeParse({ title: "Target resume", target_role: "", template, content: { ...emptyCareer(), full_name: "A" } }).success).toBe(true); });
  it("rejects reversed employment dates", () => expect(careerSchema.safeParse({ ...emptyCareer(), full_name: "A", experience: [{ role: "Engineer", company: "Example", start: "2025-06", end: "2024-01", description: "" }] }).success).toBe(false));
});