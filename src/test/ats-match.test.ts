import { describe, expect, it } from "vitest";
import { analyzeKeywordMatch, extractJDKeywords, parseKeywords } from "@/lib/ats-match";
import { emptyCareer } from "@/lib/career-schema";
import { defaultPresentation } from "@/lib/resume-design";
describe("JD resume keyword scoring", () => {
  it("scores concrete JD keyword coverage", () => {
    const content = { ...emptyCareer(), summary: "Python and SQL development" };
    const keywords = extractJDKeywords("Python SQL Kubernetes");
    expect(analyzeKeywordMatch(content, keywords).score).toBe(67);
    expect(analyzeKeywordMatch(content, keywords).missing.map(r => r.keyword)).toEqual(["kubernetes"]);
  });
  it("counts a keyword only once for scoring, regardless of repetition", () => {
    expect(analyzeKeywordMatch({ ...emptyCareer(), summary: "SQL SQL SQL" }, ["SQL", "sql", "Python"]).score).toBe(50);
  });
  it("matches whole technical tokens and phrases, not substrings", () => {
    const result = analyzeKeywordMatch({ ...emptyCareer(), summary: "C++ C# JavaScript project management" }, ["C++", "C#", "Java", "project management"]);
    expect(result.score).toBe(75);
    expect(result.missing.map(r => r.keyword)).toEqual(["java"]);
  });
  it("excludes hidden sections and private contact fields", () => {
    const content = { ...emptyCareer(), email: "sql@example.com", summary: "Python" };
    const presentation = { ...defaultPresentation(), hidden: ["summary" as const] };
    expect(analyzeKeywordMatch(content, ["Python", "sql"], presentation).score).toBe(0);
  });
  it("returns no score without keywords", () => { expect(analyzeKeywordMatch(emptyCareer(), []).score).toBeNull(); });
  it("extracts distinct JD terms without common recruitment filler", () => {
    expect(extractJDKeywords("Required skills: SQL SQL and Python experience")).toEqual(["sql", "python"]);
    expect(parseKeywords("SQL, sql, project management")).toEqual(["sql", "project management"]);
  });
});