import sans from "@/assets/resume-font-static.asset.json";
import serif from "@/assets/resume-serif.asset.json";
import mono from "@/assets/resume-mono.asset.json";
import type { CareerData, ResumeTemplate } from "./career-schema";
import { defaultPresentation, type Presentation } from "./resume-design";
import { resumeContact, resumeSections } from "./resume-document";

export type LayoutLine = { text: string; x: number; y: number; size: number; accent: boolean; center: boolean };
export type LayoutPage = { lines: LayoutLine[] };
let cachedFonts: Partial<Record<Presentation["font"], string>> = {};
export async function buildResume(content: CareerData, template: ResumeTemplate, presentation = defaultPresentation()) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const font = presentation.font;
  let binary = cachedFonts[font];
  if (!binary) {
    const response = await fetch(({ sans, serif, mono })[font].url); if (!response.ok) throw new Error("Resume font unavailable");
    const bytes = new Uint8Array(await response.arrayBuffer()); let raw = "";
    for (let i = 0; i < bytes.length; i += 0x8000) raw += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    binary = btoa(raw); cachedFonts[font] = binary;
  }
  pdf.addFileToVFS("ResumeFont.ttf", binary); pdf.addFont("ResumeFont.ttf", "ResumeFont", "normal"); pdf.setFont("ResumeFont");
  const width = 595.28, height = 841.89, margin = template === "minimal" ? 60 : 44;
  const pages: LayoutPage[] = [{ lines: [] }];
  let page = 0, y = margin;
  const center = template === "executive";
  const write = (text: string, size: number, accent = false, x = margin, available = width - 2 * margin, centered = false) => {
    pdf.setFontSize(size);
    const lines = pdf.splitTextToSize(text, available) as string[];
    for (const text of lines) {
      if (y + size * 0.35 > height - margin) { page++; if (!pages[page]) pages.push({ lines: [] }); y = margin; }
      pages[page]?.lines.push({ text, x: centered ? width / 2 : x, y, size, accent, center: centered });
      y += size * 1.45;
    }
    y += 5;
  };
  write(content.full_name || "Your name", template === "creative" ? 30 : template === "minimal" ? 23 : 27, template !== "classic" && template !== "minimal", margin, width - 2 * margin, center);
  if (content.headline || content.current_role) write(content.headline || content.current_role, 11, false, margin, width - 2 * margin, center);
  if (resumeContact(content)) write(resumeContact(content), 8, false, margin, width - 2 * margin, center);
  y += template === "minimal" ? 18 : 14;
  const headerEnd = y;
  const sections = resumeSections(content, presentation);
  const columns = template === "columns";
  const renderSections = (selected: typeof sections, x: number, available: number) => {
    for (const section of selected) {
      if (y + 55 > height - margin) { page++; if (!pages[page]) pages.push({ lines: [] }); y = margin; }
      write(template === "technical" ? `// ${section.title}` : section.title.toUpperCase(), 10, true, x, available);
      for (const e of section.entries) { if (e.heading) write(e.heading, 10, false, x, available); if (e.meta) write(e.meta, 8, false, x, available); if (e.body) write(e.body, 9.5, false, x, available); y += 5; }
      y += 10;
    }
  };
  if (columns) {
    renderSections(sections.filter(s => !["skills", "education", "certifications"].includes(s.key)), margin, 317);
    page = 0; y = headerEnd;
    renderSections(sections.filter(s => ["skills", "education", "certifications"].includes(s.key)), 389, 162);
  } else renderSections(sections, margin, width - margin * 2);
  return { pdf, pages, width, height, template, presentation };
}