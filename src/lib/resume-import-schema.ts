import { z } from "zod";
export const MAX_RESUME_BYTES = 10 * 1024 * 1024;
export const uploadSchema = z.object({ filename: z.string().trim().min(1).max(255).refine(v => /\.(pdf|docx)$/i.test(v), "Use a PDF or DOCX file; convert older DOC files to DOCX first"), base64: z.string().min(1).max(Math.ceil(MAX_RESUME_BYTES / 3) * 4).regex(/^[A-Za-z0-9+/]*={0,2}$/) });
export function validateResumeFile(name: string, size: number) {
  if (!/\.(pdf|docx)$/i.test(name)) return "Choose a PDF or DOCX file. Convert older DOC files to DOCX first.";
  if (size <= 0 || size > MAX_RESUME_BYTES) return "Choose a non-empty file under 10 MB.";
  return null;
}