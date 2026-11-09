import { unzipSync, strFromU8 } from "fflate";
import { XMLParser } from "fast-xml-parser";
import { getDocumentProxy, extractText } from "unpdf";

export async function extractResume(bytes: Uint8Array, filename: string): Promise<string> {
  if (/\.pdf$/i.test(filename)) {
    if (new TextDecoder().decode(bytes.slice(0, 5)) !== "%PDF-") throw new Error("This file is not a valid PDF.");
    const document = await getDocumentProxy(bytes, { isEvalSupported: false, useSystemFonts: false });
    try {
      if (document.numPages > 30) throw new Error("Upload a resume with at most 30 pages.");
      const result = await extractText(document, { mergePages: true });
      if (!result.text.trim()) throw new Error("This PDF has no readable text. Upload a text-based PDF or DOCX, or enter your resume manually.");
      return result.text.slice(0, 40000);
    } finally { await document.destroy(); }
  }
  if (bytes[0] !== 80 || bytes[1] !== 75) throw new Error("This file is not a valid DOCX.");
  let expanded = 0;
  const files = unzipSync(bytes, { filter: file => { expanded += file.originalSize; if (expanded > 20 * 1024 * 1024) throw new Error("This document expands beyond the supported limit."); return file.name === "word/document.xml"; } });
  const xmlBytes = files["word/document.xml"];
  if (!xmlBytes || xmlBytes.length > 5 * 1024 * 1024) throw new Error("The DOCX document is missing readable content.");
  const xml = strFromU8(xmlBytes);
  if (/<!DOCTYPE|<!ENTITY/i.test(xml)) throw new Error("Unsupported document structure.");
  const parsed: unknown = new XMLParser({ preserveOrder: true, ignoreAttributes: true, processEntities: false }).parse(xml);
  function collect(node: unknown): string {
    if (typeof node === "string" || typeof node === "number") return String(node);
    if (Array.isArray(node)) return node.map(collect).join("");
    if (!node || typeof node !== "object") return "";
    return Object.entries(node).map(([key, value]) => key === "w:p" ? collect(value) + "\n" : key === "w:tab" ? " " : key === "w:br" ? "\n" : key === "#text" ? collect(value) : collect(value)).join("");
  }
  return collect(parsed).replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").slice(0, 40000);
}