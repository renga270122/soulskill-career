import { describe, expect, it } from "vitest";
import { zipSync, strToU8 } from "fflate";
import { extractResume } from "@/lib/resume-extract.server";
describe("Server upload validation and extraction", () => {
  it("preserves DOCX paragraphs and actual facts", async () => {
    const file = zipSync({ "word/document.xml": strToU8('<w:document><w:body><w:p><w:r><w:t>Candidate Name</w:t></w:r></w:p><w:p><w:r><w:t>Built TypeScript services.</w:t></w:r></w:p></w:body></w:document>') });
    expect(await extractResume(file, "resume.docx")).toBe("Candidate Name\nBuilt TypeScript services.\n");
  });
  it("rejects executable bytes labeled as PDF", async () => expect(extractResume(strToU8("MZ executable"), "resume.pdf")).rejects.toThrow("valid PDF"));
  it("rejects non-DOCX archives", async () => expect(extractResume(zipSync({ "other.txt": strToU8("text") }), "resume.docx")).rejects.toThrow("missing readable content"));
  it("rejects document entity declarations", async () => expect(extractResume(zipSync({ "word/document.xml": strToU8('<!DOCTYPE malicious><w:document/>') }), "resume.docx")).rejects.toThrow("Unsupported document structure"));
});