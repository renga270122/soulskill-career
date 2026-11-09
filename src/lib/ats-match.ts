import { getStopwords } from "keyword-extractor";
import type { CareerData } from "./career-schema";
import { resumeSections } from "./resume-document";
import { defaultPresentation, type Presentation } from "./resume-design";

const stopwords = new Set([...getStopwords({ language: "english" }), ..."candidate candidates job role team company work working required requirements responsibilities preferred opportunity experience years year skills ability excellent strong join seeking looking including must will qualifications description benefits salary apply employer equal employment position successful ideal minimum provide looking knowledge understanding".split(" ")]);
export function normalizeTerms(text: string) {
  return text.normalize("NFKC").toLowerCase().replace(/[‐‑–—]/g, "-").match(/[\p{L}\p{N}]+(?:[.+#/-][\p{L}\p{N}]+)*(?:\+\+|#)?/gu) ?? [];
}
export function extractJDKeywords(jd: string): string[] {
  return [...new Set(normalizeTerms(jd).filter(t => !stopwords.has(t) && !/^\d+$/.test(t) && (t.length > 1 || t === "r")))].slice(0, 100);
}
export function parseKeywords(value: string) {
  return [...new Set(value.split(/[,;\n]/).map(t => normalizeTerms(t).join(" ")).filter(Boolean))].slice(0, 100);
}
function countMatches(text: string, keyword: string) {
  const tokens = normalizeTerms(text), term = normalizeTerms(keyword);
  if (!term.length) return 0;
  let count = 0;
  for (let i = 0; i <= tokens.length - term.length; i++) if (term.every((t, j) => tokens[i + j] === t)) count++;
  return count;
}
export function analyzeKeywordMatch(content: CareerData, keywords: string[], presentation: Presentation = defaultPresentation()) {
  const sources = [
    { section: "Headline", text: content.headline },
    ...resumeSections(content, presentation).flatMap(s => s.entries.map(e => ({ section: s.title, text: `${e.heading} ${e.body}` }))),
  ];
  const terms = parseKeywords(keywords.join(","));
  const results = terms.map(keyword => {
    const evidence = sources.flatMap(s => {
      const count = countMatches(s.text, keyword);
      return count ? [{ section: s.section, count }] : [];
    });
    return { keyword, count: evidence.reduce((n, s) => n + s.count, 0), sections: [...new Set(evidence.map(s => s.section))] };
  });
  const matched = results.filter(r => r.count > 0), missing = results.filter(r => r.count === 0);
  return { score: terms.length ? Math.round(matched.length / terms.length * 100) : null, matched, missing, total: terms.length };
}