import { useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { Link } from '@tanstack/react-router';
import { Sparkles, Send, FileText } from 'lucide-react';
import { useJourney, parsedRecords } from './JourneyShared';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';
import { resumesQuery, careerQuery } from '@/lib/career-queries';
import { askGroundedCoach } from '@/lib/coach.functions';
import { coachModes, careerEvidence } from '@/lib/coach-schema';

export function GroundedCareerCoach() {
  const { user, data, refresh } = useJourney();
  const { data: resumes } = useSuspenseQuery(resumesQuery(user.id));
  const { data: profile } = useSuspenseQuery(careerQuery(user.id));
  const ask = useServerFn(askGroundedCoach);
  const [resumeId, setResumeId] = useState(resumes.find(r => r.is_default)?.id ?? resumes[0]?.id ?? 'none');
  const [mode, setMode] = useState<(typeof coachModes)[number]>('Career clarity');
  const [question, setQuestion] = useState('');
  const [consent, setConsent] = useState(false), [ids, setIds] = useState<string[]>([]);
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const [result, setResult] = useState<Awaited<ReturnType<typeof askGroundedCoach>> | null>(null);
  const selected = resumes.find(r => r.id === resumeId);
  const hasEvidence = careerEvidence(profile.content, 'Profile', 'p').length + careerEvidence(selected?.content, 'Resume', 'r').length > 0;
  const journals = [...parsedRecords(data.records, 'journal'), ...parsedRecords(data.records, 'reflection')];
  async function submit() {
    setBusy(true); setError(''); setResult(null);
    try {
      const r = await ask({ data: { question, mode, resumeId: resumeId === 'none' ? null : resumeId, journalConsent: consent, journalIds: ids } });
      setResult(r); await refresh();
    } catch (e) { setError(e instanceof Error ? e.message : 'Guidance unavailable. Your question has been preserved.'); }
    finally { setBusy(false); }
  }
  return <div className="journey-theme mx-auto max-w-5xl space-y-8">
    <header className="border-b border-border pb-6"><p className="text-xs uppercase tracking-widest text-primary">Your next career move</p><h1 className="mt-2 font-display text-4xl">AI Career Coach</h1></header>
    <section className="space-y-4 border-b border-border pb-6"><h2 className="flex items-center gap-2 font-semibold"><FileText className="size-4"/>Saved career context</h2><div className="grid gap-4 sm:grid-cols-2"><div><p className="mb-2 text-sm">Resume</p><Select value={resumeId} onValueChange={setResumeId} disabled={busy}><SelectTrigger aria-label="Resume for coaching"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="none">Default or most recent resume</SelectItem>{resumes.map(r => <SelectItem key={r.id} value={r.id}>{r.title}{r.is_default ? ' · Default' : ''}</SelectItem>)}</SelectContent></Select></div><div className="flex flex-wrap items-end gap-2"><Button asChild variant="outline"><Link to="/profile">Review profile</Link></Button><Button asChild variant="outline"><Link to="/resumes">Review resumes</Link></Button></div></div>{!hasEvidence && <p role="status" className="text-sm text-muted-foreground">No career evidence is available yet. Add your experience or save a resume.</p>}</section>
    <section className="space-y-4"><Select value={mode} onValueChange={v => { const m = coachModes.find(m => m === v); if(m) setMode(m); }} disabled={busy}><SelectTrigger aria-label="Coaching focus"><SelectValue/></SelectTrigger><SelectContent>{coachModes.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select><Textarea aria-label="Coaching question" value={question} onChange={e => setQuestion(e.target.value)} rows={6} maxLength={6000} placeholder="What should I focus on for my next career move?" disabled={busy}/><label className="flex items-center gap-2 text-sm"><Checkbox checked={consent} disabled={busy} onCheckedChange={v => {setConsent(v === true); if(v !== true) setIds([]);}}/>Include selected private journal entries</label>{consent && <div className="space-y-2">{journals.length ? journals.slice(0,20).map(j => <label key={j.id} className="flex items-center gap-2 text-sm"><Checkbox checked={ids.includes(j.id)} disabled={busy || (!ids.includes(j.id) && ids.length >= 5)} onCheckedChange={v => setIds(old => v === true ? [...old,j.id] : old.filter(id => id !== j.id))}/>{j.event_date} · {j.value.title}</label>) : <p className="text-sm text-muted-foreground">No journal entries saved.</p>}</div>}<Button disabled={busy || !hasEvidence || question.trim().length < 5} onClick={submit}><Send className="size-4"/>{busy ? 'Preparing guidance…' : 'Ask coach'}</Button>{busy && <p role="status" className="text-sm text-muted-foreground">Reviewing your saved career evidence…</p>}{error && <p role="alert" className="text-sm text-destructive">{error}</p>}</section>
    {result && <section aria-label="Coach guidance" className="space-y-6 border-t border-border pt-6"><p className="text-xs text-muted-foreground">{result.resumeTitle ? `Resume used: ${result.resumeTitle}` : 'Saved profile used'} · {result.journalCount ? `${result.journalCount} approved journal entries` : 'Journals excluded'}</p><div><h2 className="font-semibold">Facts from your saved data</h2><ul className="mt-3 space-y-3">{result.guidance.facts.map(f => <li key={f.id} className="border-l-2 border-primary pl-4"><p className="text-xs text-muted-foreground">{f.source}</p><p className="whitespace-pre-wrap break-words text-sm">{f.text}</p></li>)}</ul></div><div><h2 className="flex items-center gap-2 font-semibold"><Sparkles className="size-4"/>AI suggestions</h2><p className="mt-1 text-xs text-muted-foreground">Proposed actions, not verified achievements or changes to your resume.</p><div className="mt-4 grid gap-3 sm:grid-cols-2">{result.guidance.suggestions.map((s,i) => <article key={i} className="space-y-2 rounded-lg border border-border bg-card p-4"><h3 className="font-semibold">{s.title}</h3><p className="text-sm">{s.action}</p><p className="text-xs text-muted-foreground">{s.sources.length ? `Based on: ${[...new Set(s.sources.map(e => e.source))].join(', ')}` : 'General career suggestion'}</p></article>)}</div></div>{!!result.guidance.unknowns.length && <div><h2 className="font-semibold">Unknowns to clarify</h2><ul className="mt-2 list-disc space-y-2 pl-5 text-sm">{result.guidance.unknowns.map((q,i) => <li key={i}>{q}</li>)}</ul></div>}<div className="border-l-2 border-primary bg-accent p-4"><h2 className="font-semibold">Suggested next action</h2><p className="mt-2 text-sm">{result.guidance.nextAction}</p></div>{!result.historySaved && <p role="alert" className="text-sm text-muted-foreground">Guidance is shown, but could not be saved to history.</p>}</section>}
    <section className="border-t border-border pt-6"><h2 className="font-semibold">Private session history</h2>{parsedRecords(data.records,'coaching').slice(0,10).map(r => <details key={r.id} className="border-b border-border py-4"><summary className="cursor-pointer text-sm">{r.value.mode} · {r.event_date} · {r.value.question.slice(0,80)}</summary><p className="mt-4 whitespace-pre-wrap break-words text-sm">{r.value.answer}</p></details>)}</section>
  </div>;
}