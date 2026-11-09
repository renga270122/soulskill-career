import { useState } from "react";
import { ScanText, RefreshCw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { CareerData } from "@/lib/career-schema";
import type { Presentation } from "@/lib/resume-design";
import { analyzeKeywordMatch, extractJDKeywords, parseKeywords } from "@/lib/ats-match";

export function ATSChecker({ content, presentation }: { content: CareerData; presentation?: Presentation }) {
  const [jd, setJD] = useState("");
  const [keywords, setKeywords] = useState("");
  const [error, setError] = useState("");
  const [snapshot, setSnapshot] = useState<{ result: ReturnType<typeof analyzeKeywordMatch>; source: string } | null>(null);
  const source = JSON.stringify({ content, presentation, jd, keywords });
  const result = snapshot?.source === source ? snapshot.result : null;
  function extract() {
    setError(""); setSnapshot(null);
    if (jd.trim().length < 20) { setError("Paste a job description of at least 20 characters."); return; }
    setKeywords(extractJDKeywords(jd).join(", "));
  }
  function check(e: React.FormEvent) {
    e.preventDefault(); setError("");
    if (jd.trim().length < 20) { setError("Paste the job description first."); return; }
    const terms = parseKeywords(keywords);
    if (!terms.length) { setError("Extract or enter the job’s keywords before checking."); return; }
    const jdTokens = extractJDKeywords(jd); // Review-only terms may include phrases and stopwords.
    if (!jdTokens.length) { setError("Use a job description containing meaningful career terms."); return; }
    setSnapshot({ result: analyzeKeywordMatch(content, terms, presentation), source });
  }
  return <section className="min-w-0 space-y-6">
    <div><h2 className="font-display text-2xl">Match your resume to the role</h2><p className="mt-2 text-sm text-muted-foreground">Keyword coverage estimate, not an employer ATS result or hiring prediction. English keyword extraction; no AI upload and no changes to your resume.</p></div>
    <form onSubmit={check} className="space-y-4">
      <div className="space-y-2"><Label htmlFor="ats-jd">Job description</Label><Textarea id="ats-jd" rows={7} maxLength={20000} value={jd} onChange={e => { setJD(e.target.value); setKeywords(""); setSnapshot(null); }} placeholder="Paste the responsibilities, required skills and qualifications…" /></div>
      <Button type="button" variant="outline" onClick={extract}><RefreshCw />Extract JD keywords</Button>
      <div className="space-y-2"><Label htmlFor="ats-keywords">Keywords to check</Label><Textarea id="ats-keywords" rows={4} maxLength={6000} value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="SQL, project management, communication…" /><p className="text-xs text-muted-foreground">Review the extracted terms. Remove irrelevant words or add exact phrases from the JD, separated by commas. Up to 100 unique terms.</p></div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button variant="ink"><ScanText />Check match score</Button>
    </form>
    {snapshot && !result && <p role="status" className="text-sm text-muted-foreground">Inputs changed. Check again for an updated score.</p>}
    {result && <div className="space-y-6" aria-live="polite">
      <section className="border-y border-border py-6"><p className="text-sm text-muted-foreground">JD keyword match score</p><p className="mt-2 font-display text-5xl" data-testid="ats-score">{result.score}%</p><p className="mt-3 text-sm">{result.matched.length} of {result.total} keywords matched</p><p className="mt-2 text-xs text-muted-foreground">Matched unique terms ÷ selected unique terms × 100, rounded. Equal weight, case-insensitive whole-token or exact-phrase matching. Repeating a word does not raise the score. Hidden resume sections and contact details are excluded. No synonym, seniority, formatting or employer screening assessment.</p></section>
      <section><h3 className="font-display text-2xl">Matched keywords</h3>{!result.matched.length ? <p className="mt-3 text-sm text-muted-foreground">No selected keywords found.</p> : <ul className="mt-3 divide-y divide-border">{result.matched.map(r => <li key={r.keyword} className="flex min-w-0 items-start gap-3 py-3"><CheckCircle2 className="mt-1 size-4 shrink-0 text-primary" /><div className="min-w-0"><p className="break-words font-medium">{r.keyword}</p><p className="break-words text-xs text-muted-foreground">{r.count} occurrence{r.count === 1 ? "" : "s"} · {r.sections.join(", ")}</p></div></li>)}</ul>}</section>
      <section><h3 className="font-display text-2xl">Missing keywords</h3><p className="mt-2 text-sm text-muted-foreground">Add a term only if it honestly reflects your experience. A missing keyword may be a wording gap, not a missing skill.</p><div className="mt-3 flex flex-wrap gap-2">{result.missing.map(r => <span key={r.keyword} className="max-w-full break-words rounded-md border border-border bg-secondary px-3 py-2 text-sm">{r.keyword}</span>)}{!result.missing.length && <p className="text-sm">All selected keywords appear in your resume.</p>}</div></section>
    </div>}
  </section>;
}