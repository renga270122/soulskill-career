import type { CareerData, ResumeTemplate } from "./career-schema";
import { defaultPresentation, type Presentation } from "./resume-design";
import { buildResume } from "./resume-layout";
export async function exportResumePdf(content: CareerData, template: ResumeTemplate, title: string, presentation: Presentation = defaultPresentation()) {
  const { pdf, pages, width, height } = await buildResume(content, template, presentation);
  // Resolve semantic tokens from the current document so PDF and preview use the same accents.
  const probe = document.createElement("span"); probe.className = `resume-accent-${presentation.accent}`; document.body.append(probe);
  const color = getComputedStyle(probe).getPropertyValue("--resume-accent").trim(); probe.remove();
  const canvas = document.createElement("canvas"); const ctx = canvas.getContext("2d");
  let accent = [80, 50, 130];
  if (ctx) { ctx.fillStyle = color; ctx.fillRect(0, 0, 1, 1); accent = Array.from(ctx.getImageData(0, 0, 1, 1).data).slice(0, 3); }
  pages.forEach((page, index) => {
    if (index) pdf.addPage();
    pdf.setDrawColor(accent[0] ?? 0, accent[1] ?? 0, accent[2] ?? 0); pdf.setFillColor(accent[0] ?? 0, accent[1] ?? 0, accent[2] ?? 0);
    if (["modern", "creative"].includes(template)) pdf.rect(0, 0, width, template === "creative" ? 12 : 6, "F");
    if (template === "contemporary") pdf.rect(20, 30, 3, height - 60, "F");
    if (template === "classic" || template === "executive") pdf.line(44, 24, width - 44, 24);
    if (template === "columns") pdf.line(375, 140, 375, height - 44);
    if (template === "graduate") pdf.rect(width - 60, 30, 16, 16, "F");
    if (template === "projects") pdf.rect(24, 38, 6, 35, "F");
    for (const line of page.lines) { pdf.setFontSize(line.size); pdf.setTextColor(...(line.accent ? [accent[0] ?? 0, accent[1] ?? 0, accent[2] ?? 0] : [30,30,30]) as [number,number,number]); pdf.text(line.text, line.x, line.y, { align: line.center ? "center" : "left" }); }
  });
  pdf.save(`${(title || "resume").replace(/[^\w-]+/g, "-").replace(/^-|-$/g, "") || "resume"}.pdf`);
}