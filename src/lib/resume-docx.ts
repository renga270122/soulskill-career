import { AlignmentType, Document, Packer, Paragraph, TextRun } from "docx";
import type { CareerData, ResumeTemplate } from "./career-schema";
import { defaultPresentation, type Presentation } from "./resume-design";
import { resumeContact, resumeSections } from "./resume-document";

const accentHex: Record<Presentation["accent"], string> = { navy: "1F3A5F", teal: "2E7D74", ruby: "8E3B4E", graphite: "3A3A3A", slate: "5B6470", purple: "6D4AA0" };
const docxFonts: Record<Presentation["font"], string> = { sans: "Arial", serif: "Georgia", mono: "Courier New" };
const ink = "333333";

export function buildResumeDocx(content: CareerData, template: ResumeTemplate, presentation: Presentation = defaultPresentation()): Document {
  const accent = accentHex[presentation.accent] ?? accentHex.navy;
  const font = docxFonts[presentation.font];
  const align = template === "executive" ? AlignmentType.CENTER : AlignmentType.LEFT;
  const children: Paragraph[] = [];
  children.push(new Paragraph({ alignment: align, children: [new TextRun({ text: content.full_name || "Your name", size: 52, bold: true, color: accent, font })] }));
  if (content.headline || content.current_role) children.push(new Paragraph({ alignment: align, children: [new TextRun({ text: content.headline || content.current_role, size: 24, color: ink, font })] }));
  const contact = resumeContact(content);
  if (contact) children.push(new Paragraph({ alignment: align, spacing: { after: 240 }, children: [new TextRun({ text: contact, size: 18, color: "666666", font })] }));
  for (const section of resumeSections(content, presentation)) {
    children.push(new Paragraph({ spacing: { before: 280, after: 120 }, children: [new TextRun({ text: section.title.toUpperCase(), size: 22, bold: true, color: accent, font })] }));
    for (const e of section.entries) {
      if (e.heading) children.push(new Paragraph({ spacing: { before: 140 }, children: [new TextRun({ text: e.heading, size: 21, bold: true, color: ink, font })] }));
      if (e.meta) children.push(new Paragraph({ children: [new TextRun({ text: e.meta, size: 18, italics: true, color: "666666", font })] }));
      if (e.body) for (const para of e.body.split(/\n+/).map(p => p.trim()).filter(Boolean)) children.push(new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: para, size: 20, color: ink, font })] }));
    }
  }
  const letter = presentation.pageSize === "letter";
  return new Document({
    sections: [{
      properties: { page: { size: { width: letter ? 12240 : 11906, height: letter ? 15840 : 16838 }, margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } } },
      children,
    }],
  });
}

export async function exportResumeDocx(content: CareerData, template: ResumeTemplate, title: string, presentation: Presentation = defaultPresentation()) {
  const blob = await Packer.toBlob(buildResumeDocx(content, template, presentation));
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${(title || "resume").replace(/[^\w-]+/g, "-").replace(/^-|-$/g, "") || "resume"}.docx`;
  anchor.click();
  URL.revokeObjectURL(url);
}
