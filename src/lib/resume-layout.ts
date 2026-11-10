import sans from "@/assets/resume-font-static.asset.json";
import serif from "@/assets/resume-serif.asset.json";
import mono from "@/assets/resume-mono.asset.json";
import type { CareerData, ResumeTemplate } from "./career-schema";
import { defaultPresentation, type Presentation } from "./resume-design";
import { resumeContact, resumeSections } from "./resume-document";

export type LayoutLine = { text: string; x: number; y: number; size: number; accent: boolean; center: boolean };
export type LayoutShape = { kind: "rect" | "line"; x: number; y: number; w: number; h: number };
export type LayoutPage = { lines: LayoutLine[]; shapes: LayoutShape[] };

type TemplateConfig = {
  margin: number;
  nameSize: number;
  nameAccent: boolean;
  centerHeader: boolean;
  heading: (title: string) => string;
  headingSize: number;
  headingRule: boolean;
  bodySize: number;
  headerGap: number;
  twoColumn: boolean;
  pageShapes: (width: number, height: number, margin: number) => LayoutShape[];
};

const upper = (t: string) => t.toUpperCase();
const noShapes = () => [] as LayoutShape[];
const topRule = (w: number, _h: number, m: number): LayoutShape[] => [{ kind: "line", x: m, y: 24, w: w - 2 * m, h: 0 }];

const configs: Record<ResumeTemplate, TemplateConfig> = {
  classic: { margin: 44, nameSize: 27, nameAccent: false, centerHeader: false, heading: upper, headingSize: 10, headingRule: false, bodySize: 9.5, headerGap: 14, twoColumn: false, pageShapes: topRule },
  modern: { margin: 44, nameSize: 27, nameAccent: true, centerHeader: false, heading: upper, headingSize: 10, headingRule: false, bodySize: 9.5, headerGap: 14, twoColumn: false, pageShapes: w => [{ kind: "rect", x: 0, y: 0, w, h: 6 }] },
  executive: { margin: 44, nameSize: 27, nameAccent: true, centerHeader: true, heading: upper, headingSize: 10, headingRule: false, bodySize: 9.5, headerGap: 16, twoColumn: false, pageShapes: topRule },
  technical: { margin: 44, nameSize: 25, nameAccent: true, centerHeader: false, heading: t => `// ${t}`, headingSize: 10, headingRule: false, bodySize: 9.5, headerGap: 14, twoColumn: false, pageShapes: noShapes },
  innovator: { margin: 48, nameSize: 28, nameAccent: true, centerHeader: false, heading: upper, headingSize: 11, headingRule: true, bodySize: 9.5, headerGap: 16, twoColumn: false, pageShapes: noShapes },
  corporate: { margin: 50, nameSize: 25, nameAccent: false, centerHeader: false, heading: upper, headingSize: 10, headingRule: true, bodySize: 9.5, headerGap: 14, twoColumn: false, pageShapes: noShapes },
  creative: { margin: 44, nameSize: 30, nameAccent: true, centerHeader: false, heading: upper, headingSize: 10, headingRule: false, bodySize: 9.5, headerGap: 14, twoColumn: false, pageShapes: w => [{ kind: "rect", x: 0, y: 0, w, h: 12 }] },
  graduate: { margin: 44, nameSize: 26, nameAccent: true, centerHeader: false, heading: upper, headingSize: 10, headingRule: false, bodySize: 9.5, headerGap: 14, twoColumn: false, pageShapes: w => [{ kind: "rect", x: w - 60, y: 30, w: 16, h: 16 }] },
  minimal: { margin: 60, nameSize: 23, nameAccent: false, centerHeader: false, heading: upper, headingSize: 10, headingRule: false, bodySize: 9.5, headerGap: 18, twoColumn: false, pageShapes: noShapes },
  contemporary: { margin: 44, nameSize: 27, nameAccent: true, centerHeader: false, heading: upper, headingSize: 10, headingRule: false, bodySize: 9.5, headerGap: 14, twoColumn: false, pageShapes: (_w, h) => [{ kind: "rect", x: 20, y: 30, w: 3, h: h - 60 }] },
  projects: { margin: 44, nameSize: 27, nameAccent: true, centerHeader: false, heading: upper, headingSize: 10, headingRule: false, bodySize: 9.5, headerGap: 14, twoColumn: false, pageShapes: () => [{ kind: "rect", x: 24, y: 38, w: 6, h: 35 }] },
  columns: { margin: 44, nameSize: 27, nameAccent: true, centerHeader: false, heading: upper, headingSize: 10, headingRule: false, bodySize: 9.5, headerGap: 14, twoColumn: true, pageShapes: (w, h, m) => [{ kind: "line", x: w - m - (w - 2 * m) * 0.32 - 14, y: 140, w: 0, h: h - 140 - m }] },
};

const cachedFonts: Partial<Record<Presentation["font"], string>> = {};

export async function buildResume(content: CareerData, template: ResumeTemplate, presentation = defaultPresentation()) {
  const { jsPDF } = await import("jspdf");
  const pageSize = presentation.pageSize ?? "a4";
  const pdf = new jsPDF({ unit: "pt", format: pageSize });
  const font = presentation.font;
  let binary = cachedFonts[font];
  if (!binary) {
    const response = await fetch(({ sans, serif, mono })[font].url); if (!response.ok) throw new Error("Resume font unavailable");
    const bytes = new Uint8Array(await response.arrayBuffer()); let raw = "";
    for (let i = 0; i < bytes.length; i += 0x8000) raw += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    binary = btoa(raw); cachedFonts[font] = binary;
  }
  pdf.addFileToVFS("ResumeFont.ttf", binary); pdf.addFont("ResumeFont.ttf", "ResumeFont", "normal"); pdf.setFont("ResumeFont");

  const cfg = configs[template] ?? configs.classic;
  const width = pageSize === "letter" ? 612 : 595.28;
  const height = pageSize === "letter" ? 792 : 841.89;
  const margin = cfg.margin;
  const bottom = height - margin;
  const pageShapes = cfg.pageShapes(width, height, margin);
  const pages: LayoutPage[] = [{ lines: [], shapes: [...pageShapes] }];
  let page = 0, y = margin;
  const newPage = () => { page++; pages.push({ lines: [], shapes: [...pageShapes] }); y = margin; };
  const lineHeight = (size: number) => size * 1.45;
  const wrap = (text: string, size: number, available: number) => { pdf.setFontSize(size); return pdf.splitTextToSize(text, available) as string[]; };
  const measure = (text: string, size: number, available: number) => wrap(text, size, available).length * lineHeight(size) + 5;
  const entryHeight = (e: { heading: string; meta: string; body: string }, available: number) =>
    (e.heading ? measure(e.heading, 10, available) : 0) + (e.meta ? measure(e.meta, 8, available) : 0) + (e.body ? measure(e.body, cfg.bodySize, available) : 0) + 5;
  const write = (text: string, size: number, accent = false, x = margin, available = width - 2 * margin, centered = false) => {
    for (const line of wrap(text, size, available)) {
      if (y + size * 0.35 > bottom) newPage();
      pages[page]?.lines.push({ text: line, x: centered ? width / 2 : x, y, size, accent, center: centered });
      y += lineHeight(size);
    }
    y += 5;
  };

  write(content.full_name || "Your name", cfg.nameSize, cfg.nameAccent, margin, width - 2 * margin, cfg.centerHeader);
  if (content.headline || content.current_role) write(content.headline || content.current_role, 11, false, margin, width - 2 * margin, cfg.centerHeader);
  if (resumeContact(content)) write(resumeContact(content), 8, false, margin, width - 2 * margin, cfg.centerHeader);
  y += cfg.headerGap;
  const headerEnd = y;

  const sections = resumeSections(content, presentation);
  const renderSections = (selected: typeof sections, x: number, available: number) => {
    for (const section of selected) {
      const headingText = cfg.heading(section.title);
      const headingH = measure(headingText, cfg.headingSize, available) + (cfg.headingRule ? 6 : 0);
      const first = section.entries[0];
      // Never leave a section heading isolated at the bottom of a page.
      if (y > margin && y + headingH + (first ? entryHeight(first, available) : 0) > bottom) newPage();
      const headingPage = page, headingY = y;
      write(headingText, cfg.headingSize, true, x, available);
      if (cfg.headingRule) pages[headingPage]?.shapes.push({ kind: "line", x, y: headingY + lineHeight(cfg.headingSize) - 4, w: available, h: 0 });
      for (const e of section.entries) {
        // Keep each entry together when it fits on one page.
        if (y > margin && y + entryHeight(e, available) > bottom && entryHeight(e, available) < bottom - margin) newPage();
        if (e.heading) write(e.heading, 10, false, x, available);
        if (e.meta) write(e.meta, 8, false, x, available);
        if (e.body) write(e.body, cfg.bodySize, false, x, available);
        y += 5;
      }
      y += 10;
    }
  };

  if (cfg.twoColumn) {
    const sidebarW = (width - 2 * margin) * 0.32;
    const mainW = width - 2 * margin - sidebarW - 28;
    renderSections(sections.filter(s => !["skills", "education", "certifications"].includes(s.key)), margin, mainW);
    page = 0; y = headerEnd;
    renderSections(sections.filter(s => ["skills", "education", "certifications"].includes(s.key)), width - margin - sidebarW, sidebarW);
  } else renderSections(sections, margin, width - margin * 2);

  if (pages.length > 1) pages.forEach((p, i) => p.lines.push({ text: `Page ${i + 1} of ${pages.length}`, x: width / 2, y: height - margin / 2 - 6, size: 7.5, accent: false, center: true }));
  return { pdf, pages, width, height, template, presentation };
}
