import fontAsset from "@/assets/resume-font-static.asset.json";
import type { CareerData, ResumeTemplate } from "./career-schema";
import { resumeContact, resumeSections } from "./resume-document";
export async function exportResumePdf(content: CareerData, template: ResumeTemplate, title: string) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const response = await fetch(fontAsset.url); if (!response.ok) throw new Error("Font unavailable");
  const bytes = new Uint8Array(await response.arrayBuffer());
  let binary = ""; for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  pdf.addFileToVFS("ResumeSans.ttf", btoa(binary)); pdf.addFont("ResumeSans.ttf", "ResumeSans", "normal"); pdf.setFont("ResumeSans", "normal");
  const width = pdf.internal.pageSize.getWidth(), height = pdf.internal.pageSize.getHeight(), margin = template === "executive" ? 58 : 48;
  let y = margin;
  const write = (text: string, size: number, gap = 4) => { pdf.setFontSize(size); for (const line of pdf.splitTextToSize(text, width - margin * 2) as string[]) { if (y > height - margin) { pdf.addPage(); pdf.setFont("ResumeSans", "normal"); y = margin; } pdf.text(line, template === "executive" ? width / 2 : margin, y, { align: template === "executive" ? "center" : "left" }); y += size * 1.35; } y += gap; };
  write(content.full_name || "Resume", template === "modern" ? 24 : 22, 2);
  if (content.headline || content.current_role) write(content.headline || content.current_role, 11, 2);
  const contact = resumeContact(content); if (contact) write(contact, 8.5, 10);
  pdf.line(margin, y - 4, width - margin, y - 4); y += 10;
  for (const section of resumeSections(content)) { write(section.title.toUpperCase(), 10, 3); for (const entry of section.entries) { if (entry.heading) write(entry.heading, 10, 1); if (entry.meta) write(entry.meta, 8.5, 1); if (entry.body) write(entry.body, 9, 6); } y += 5; }
  pdf.save(`${(title || "resume").replace(/[^\w-]+/g, "-").replace(/^-|-$/g, "") || "resume"}.pdf`);
}