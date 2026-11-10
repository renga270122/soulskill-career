import type { CareerData, ResumeTemplate } from "./career-schema";
import { defaultPresentation, type Presentation } from "./resume-design";
import { buildResume } from "./resume-layout";
export async function exportResumePdf(content: CareerData, template: ResumeTemplate, title: string, presentation: Presentation = defaultPresentation()) {
  const { pdf, pages } = await buildResume(content, template, presentation);
  // Resolve semantic tokens from the current document so PDF and preview use the same accents.
  const probe = document.createElement("span"); probe.className = `resume-accent-${presentation.accent}`; document.body.append(probe);
  const color = getComputedStyle(probe).getPropertyValue("--resume-accent").trim(); probe.remove();
  const canvas = document.createElement("canvas"); const ctx = canvas.getContext("2d");
  let accent = [31, 58, 95];
  if (ctx) { ctx.fillStyle = color; ctx.fillRect(0, 0, 1, 1); accent = Array.from(ctx.getImageData(0, 0, 1, 1).data).slice(0, 3); }
  pages.forEach((page, index) => {
    if (index) pdf.addPage();
    pdf.setDrawColor(accent[0] ?? 0, accent[1] ?? 0, accent[2] ?? 0); pdf.setFillColor(accent[0] ?? 0, accent[1] ?? 0, accent[2] ?? 0);
    for (const shape of page.shapes) {
      if (shape.kind === "rect") pdf.rect(shape.x, shape.y, shape.w, shape.h, "F");
      else pdf.line(shape.x, shape.y, shape.x + shape.w, shape.y + shape.h);
    }
    for (const line of page.lines) { pdf.setFontSize(line.size); pdf.setTextColor(...(line.accent ? [accent[0] ?? 0, accent[1] ?? 0, accent[2] ?? 0] : [30,30,30]) as [number,number,number]); pdf.text(line.text, line.x, line.y, { align: line.center ? "center" : "left" }); }
  });
  pdf.save(`${(title || "resume").replace(/[^\w-]+/g, "-").replace(/^-|-$/g, "") || "resume"}.pdf`);
}
