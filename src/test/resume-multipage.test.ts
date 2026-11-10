import { describe, expect, it } from "vitest";
import { buildResume } from "@/lib/resume-layout";
import { emptyCareer } from "@/lib/career-schema";
import { defaultPresentation } from "@/lib/resume-design";

const long = "Led design and delivery of distributed IoT telemetry pipelines across twelve product lines, mentoring a team of eight engineers. ";
const content = {
  ...emptyCareer(),
  full_name: "Asha Rao",
  headline: "Senior Engineering Manager",
  summary: long.repeat(4),
  experience: Array.from({ length: 12 }, (_, i) => ({ role: `Staff Engineer ${i + 1}`, company: "Acme Systems", start: "2010-01", end: "2012-01", description: long.repeat(3) })),
  skills: Array.from({ length: 20 }, (_, i) => ({ name: `Skill ${i + 1}`, level: "Advanced" as const })),
};

describe("multipage layout", () => {
  it("breaks long resumes into numbered pages without clipping", async () => {
    const a4 = await buildResume(content, "classic", defaultPresentation());
    expect(a4.pages.length).toBeGreaterThan(1);
    const lastLine = a4.pages[0].lines.at(-1);
    expect(lastLine?.text).toBe(`Page 1 of ${a4.pages.length}`);
    for (const p of a4.pages) for (const l of p.lines) expect(l.y).toBeLessThan(a4.height - 20);
  }, 30000);
  it("keeps entries together and uses US Letter dimensions", async () => {
    const letter = await buildResume(content, "corporate", { ...defaultPresentation(), pageSize: "letter" });
    expect(letter.width).toBe(612);
    expect(letter.height).toBe(792);
    expect(letter.pages.length).toBeGreaterThan(1);
  }, 30000);
});
