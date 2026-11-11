import { useMemo, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { toast } from 'sonner';
import { ExternalLink, Save, Trash2, Copy } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { portals, portalSearch, criteriaFrom, workModes, employmentTypes, isHttpsUrl, type JobSearchPreferences, type SearchCriteria } from '@/lib/job-portals';
import { saveJobPreferences, recordJobSearch, deleteJobSearch } from '@/lib/job-search.functions';
import { saveApplication } from '@/lib/journey.functions';
import { jobSearchQuery } from '@/lib/job-search-queries';
import { resumesQuery } from '@/lib/career-queries';

const LEAVE = 'You are leaving SoulSkill and opening the selected job portal. Sign-in or paid membership may be required by that portal.';
const list = (s: string) => s.split(',').map(x => x.trim()).filter(Boolean);
const num = (s: string) => (s.trim() === '' ? null : Math.max(0, Number(s) || 0));
type Filters = { title: boolean; skills: boolean; location: boolean; experience: boolean; work_mode: boolean; employment_type: boolean };

export function FindJobs({ userId }: { userId: string }) {
  const { data } = useSuspenseQuery(jobSearchQuery(userId));
  const { data: resumes } = useSuspenseQuery(resumesQuery(userId));
  const qc = useQueryClient();
  const savePrefs = useServerFn(saveJobPreferences), record = useServerFn(recordJobSearch), del = useServerFn(deleteJobSearch), saveApp = useServerFn(saveApplication);
  const [p, setP] = useState<JobSearchPreferences>(data.preferences);
  const [text, setText] = useState({ alt: p.alt_titles.join(', '), skills: p.skills.join(', '), locations: p.locations.join(', '), industries: p.industries.join(', ') });
  const [companies, setCompanies] = useState(p.companies);
  const [co, setCo] = useState({ name: '', careers_url: '' });
  const [title, setTitle] = useState(p.designation), [location, setLocation] = useState(p.locations[0] ?? '');
  const [f, setF] = useState<Filters>({ title: true, skills: true, location: true, experience: true, work_mode: true, employment_type: true });
  const [selected, setSelected] = useState<string[]>(['linkedin', 'naukri', 'indeed']);
  const [open, setOpen] = useState(false);
  const def = resumes.find(r => r.is_default) ?? resumes[0];
  const [job, setJob] = useState({ url: '', role: '', company: '', portal: '', resume_id: def?.id ?? '' });
  const refresh = () => qc.invalidateQueries({ queryKey: ['job-search', userId] });

  const prefs: JobSearchPreferences = { ...p, alt_titles: list(text.alt), skills: list(text.skills), locations: list(text.locations), industries: list(text.industries), companies };
  const criteria: SearchCriteria = useMemo(() => ({
    title: f.title ? title : '', skills: f.skills ? prefs.skills : [], location: f.location ? location : '',
    years: f.experience && prefs.years ? prefs.years : null, work_mode: f.work_mode ? prefs.work_mode : 'Any', employment_type: f.employment_type ? prefs.employment_type : 'Any',
  }), [f, title, location, prefs.skills, prefs.years, prefs.work_mode, prefs.employment_type]);
  const links = portals.filter(x => selected.includes(x.id)).map(x => ({ portal: x, ...portalSearch(x, criteria) }));

  async function persist() {
    try { await savePrefs({ data: { ...prefs, designation: p.designation } }); await refresh(); toast.success('Job preferences saved'); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Could not save'); }
  }
  async function saveSearch(kind: 'saved_search' | 'history') {
    try { await record({ data: { kind, name: '', criteria, portals: selected } }); await refresh(); if (kind === 'saved_search') toast.success('Search saved'); }
    catch (e) { if (kind === 'saved_search') toast.error(e instanceof Error ? e.message : 'Could not save'); }
  }
  function apply(c?: SearchCriteria, ps?: string[]) {
    if (!c) return; setTitle(c.title); setLocation(c.location); if (ps?.length) setSelected(ps.filter(id => portals.some(x => x.id === id)));
  }
  const summary = [criteria.title && `Title: ${criteria.title}`, criteria.skills.length && `Skills: ${criteria.skills.join(', ')}`, criteria.location && `Location: ${criteria.location}`, criteria.years != null && `Experience: ${criteria.years} years`,
    (prefs.salary_min != null || prefs.salary_max != null) && `Salary: ${prefs.salary_min ?? '—'} – ${prefs.salary_max ?? '—'}`, criteria.work_mode !== 'Any' && `Work mode: ${criteria.work_mode}`, criteria.employment_type !== 'Any' && `Type: ${criteria.employment_type}`,
    prefs.industries.length && `Industries: ${prefs.industries.join(', ')}`].filter(Boolean) as string[];

  return <div className="journey-theme mx-auto max-w-6xl space-y-8">
    <header className="border-b border-border pb-6"><p className="text-xs uppercase tracking-widest text-primary">External job portals</p><h1 className="mt-2 font-display text-4xl">Find Jobs</h1>
      <p className="mt-2 max-w-3xl text-sm text-muted-foreground">SoulSkill prepares searches for official job portals and opens them in a new tab. These portals are independent websites, not SoulSkill integrations — SoulSkill does not show or import their live listings.</p></header>

    <section aria-label="Job search preferences" className="space-y-4 rounded-lg border border-border bg-card p-5">
      <h2 className="font-semibold">Job search preferences {!data.saved && <span className="text-xs font-normal text-muted-foreground">· pre-filled from your profile, not saved yet</span>}</h2>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm">Target designation<Input value={p.designation} maxLength={200} onChange={e => { setP({ ...p, designation: e.target.value }); setTitle(e.target.value); }} /></label>
        <label className="text-sm">Alternative titles (comma separated)<Input value={text.alt} onChange={e => setText({ ...text, alt: e.target.value })} /></label>
        <label className="text-sm md:col-span-2">Skills and keywords (comma separated)<Input value={text.skills} onChange={e => setText({ ...text, skills: e.target.value })} /></label>
        <label className="text-sm">Years of experience<Input type="number" min={0} max={60} value={p.years} onChange={e => setP({ ...p, years: Math.min(60, num(e.target.value) ?? 0) })} /></label>
        <label className="text-sm">Preferred locations (comma separated)<Input value={text.locations} onChange={e => setText({ ...text, locations: e.target.value })} /></label>
        <label className="text-sm">Expected minimum salary (per year, INR)<Input type="number" min={0} value={p.salary_min ?? ''} onChange={e => setP({ ...p, salary_min: num(e.target.value) })} /></label>
        <label className="text-sm">Expected maximum salary (per year, INR)<Input type="number" min={0} value={p.salary_max ?? ''} onChange={e => setP({ ...p, salary_max: num(e.target.value) })} /></label>
        <label className="text-sm">Preferred industries (comma separated)<Input value={text.industries} onChange={e => setText({ ...text, industries: e.target.value })} /></label>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-sm">Work mode<Select value={p.work_mode} onValueChange={v => setP({ ...p, work_mode: workModes.find(m => m === v) ?? 'Any' })}><SelectTrigger aria-label="Work mode"><SelectValue /></SelectTrigger><SelectContent>{workModes.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select></div>
          <div className="text-sm">Employment type<Select value={p.employment_type} onValueChange={v => setP({ ...p, employment_type: employmentTypes.find(m => m === v) ?? 'Any' })}><SelectTrigger aria-label="Employment type"><SelectValue /></SelectTrigger><SelectContent>{employmentTypes.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select></div>
        </div>
      </div>
      <div className="space-y-2"><p className="text-sm font-medium">Preferred companies</p>
        <div className="flex flex-wrap gap-2">{companies.map((c, i) => <span key={i} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-sm">{c.name}<button aria-label={`Remove ${c.name}`} onClick={() => setCompanies(companies.filter((_, j) => j !== i))}><Trash2 className="size-3" /></button></span>)}</div>
        <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto]"><Input aria-label="Company name" placeholder="Company name" value={co.name} onChange={e => setCo({ ...co, name: e.target.value })} /><Input aria-label="Official careers page" placeholder="Official careers page (https://…, optional)" value={co.careers_url} onChange={e => setCo({ ...co, careers_url: e.target.value })} />
          <Button variant="outline" disabled={!co.name.trim() || (!!co.careers_url && !isHttpsUrl(co.careers_url))} onClick={() => { setCompanies([...companies, { name: co.name.trim(), careers_url: co.careers_url.trim() }]); setCo({ name: '', careers_url: '' }); }}>Add company</Button></div>
        {co.careers_url && !isHttpsUrl(co.careers_url) && <p className="text-xs text-destructive">Career page links must start with https://</p>}
      </div>
      <Button onClick={persist}><Save className="size-4" />Save preferences</Button>
    </section>

    <section aria-label="Search filters" className="space-y-4">
      <h2 className="font-semibold">This search</h2>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm">Job title<Select value={title || '__none'} onValueChange={v => setTitle(v === '__none' ? '' : v)}><SelectTrigger aria-label="Job title for search"><SelectValue /></SelectTrigger><SelectContent>{!p.designation && <SelectItem value="__none">Choose a title</SelectItem>}{[p.designation, ...prefs.alt_titles].filter(Boolean).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></label>
        <label className="text-sm">Location<Select value={location || '__any'} onValueChange={v => setLocation(v === '__any' ? '' : v)}><SelectTrigger aria-label="Location for search"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="__any">Any location</SelectItem>{prefs.locations.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent></Select></label>
      </div>
      <div className="flex flex-wrap gap-4 text-sm">{(Object.keys(f) as (keyof Filters)[]).map(k => <label key={k} className="flex items-center gap-2"><Checkbox checked={f[k]} onCheckedChange={v => setF({ ...f, [k]: v === true })} />Use {k.replace('_', ' ')}</label>)}</div>
      <div className="rounded-lg border-l-2 border-primary bg-accent p-4"><div className="flex items-center justify-between gap-2"><h3 className="text-sm font-semibold">Search criteria summary</h3><Button size="sm" variant="ghost" onClick={() => navigator.clipboard?.writeText(summary.join('\n')).then(() => toast.success('Copied'))}><Copy className="size-4" />Copy</Button></div>
        {summary.length ? <ul className="mt-2 space-y-1 text-sm">{summary.map(s => <li key={s}>{s}</li>)}</ul> : <p className="mt-2 text-sm text-muted-foreground">Add a target designation to build searches.</p>}</div>
    </section>

    <section aria-label="Job portals" className="space-y-4">
      <h2 className="font-semibold">Job portals</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{portals.map(x => { const s = portalSearch(x, criteria); return <article key={x.id} className="space-y-2 rounded-lg border border-border bg-card p-4">
        <label className="flex items-center gap-2 font-semibold"><Checkbox checked={selected.includes(x.id)} onCheckedChange={v => setSelected(v === true ? [...selected, x.id] : selected.filter(id => id !== x.id))} />{x.name}</label>
        <p className="text-sm text-muted-foreground">{x.description}</p>
        <p className="text-xs">{x.supports.length ? `Prefills: ${x.supports.join(', ').replace(/_/g, ' ')}` : 'No prefilled search — enter criteria from the summary'}</p>
        <p className="break-all text-xs text-muted-foreground">{new URL(x.homepage).hostname}</p>
        <p className="text-xs text-muted-foreground">{s.prefilled ? 'Opens a prefilled search' : 'Opens the official site'}</p>
      </article>; })}</div>
      <div className="flex flex-wrap gap-2"><Button disabled={!selected.length} onClick={() => { setOpen(true); void saveSearch('history'); }}><ExternalLink className="size-4" />Open {selected.length} selected portal{selected.length === 1 ? '' : 's'}</Button><Button variant="outline" disabled={!criteria.title} onClick={() => saveSearch('saved_search')}><Save className="size-4" />Save this search</Button></div>
    </section>

    <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>Open external job portals</DialogTitle><DialogDescription>{LEAVE}</DialogDescription></DialogHeader>
      <div className="space-y-2">{links.map(l => <a key={l.portal.id} href={l.url} target="_blank" rel="noopener noreferrer" onClick={() => setJob(j => ({ ...j, portal: l.portal.name }))} className="flex items-center justify-between rounded-md border border-border p-3 text-sm hover:bg-accent"><span>{l.portal.name}<span className="block text-xs text-muted-foreground">{l.prefilled ? 'Prefilled search' : 'Official site — use your criteria summary'}</span></span><ExternalLink className="size-4" /></a>)}</div>
      <p className="text-xs text-muted-foreground">Opening a portal does not apply to any job. Save a job below once you find one.</p></DialogContent></Dialog>

    {!!companies.length && <section aria-label="Company career pages" className="space-y-3"><h2 className="font-semibold">Company career shortcuts</h2><div className="flex flex-wrap gap-2">{companies.map(c => c.careers_url && isHttpsUrl(c.careers_url)
      ? <Button key={c.name} asChild variant="outline" size="sm"><a href={c.careers_url} target="_blank" rel="noopener noreferrer">{c.name} careers<ExternalLink className="size-3" /></a></Button>
      : <Button key={c.name} asChild variant="outline" size="sm"><a href={portalSearch(portals[1]!, { ...criteria, title: `${criteria.title} ${c.name}`.trim(), skills: [] }).url} target="_blank" rel="noopener noreferrer">{c.name} on LinkedIn<ExternalLink className="size-3" /></a></Button>)}</div><p className="text-xs text-muted-foreground">Add an official careers page to a company to open it directly.</p></section>}

    <section aria-label="Save a job you found" className="space-y-3 rounded-lg border border-border bg-card p-5"><h2 className="font-semibold">Save a job you found</h2>
      <div className="grid gap-3 md:grid-cols-2"><Input aria-label="Found job URL" placeholder="Job posting URL (https://…)" value={job.url} onChange={e => setJob({ ...job, url: e.target.value })} /><Input aria-label="Found job portal" placeholder="Portal" value={job.portal} onChange={e => setJob({ ...job, portal: e.target.value })} />
        <Input aria-label="Found job title" placeholder="Job title" value={job.role} onChange={e => setJob({ ...job, role: e.target.value })} /><Input aria-label="Found job company" placeholder="Company" value={job.company} onChange={e => setJob({ ...job, company: e.target.value })} />
        <Select value={job.resume_id || 'none'} onValueChange={x => setJob({ ...job, resume_id: x === 'none' ? '' : x })}><SelectTrigger aria-label="Resume version used"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">No resume selected</SelectItem>{resumes.map(r => <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>)}</SelectContent></Select></div>
      <div className="flex flex-wrap items-center gap-2"><Button disabled={!job.role || !job.company || (!!job.url && !isHttpsUrl(job.url))} onClick={async () => { try { const r = resumes.find(x => x.id === job.resume_id); await saveApp({ data: { role: job.role, company: job.company, url: job.url, portal: job.portal, resume_id: job.resume_id || null, resume_title: r?.title ?? '', status: 'Preparing', notes: '', follow_up_date: null } }); await qc.invalidateQueries({ queryKey: ['journey', userId] }); setJob({ ...job, url: '', role: '', company: '' }); toast.success('Saved to Applications as Preparing'); } catch (e) { toast.error(e instanceof Error ? e.message : 'Could not save'); } }}>Save to Applications</Button>
        <Button asChild variant="ghost"><Link to="/applications">Track applications</Link></Button></div>
      <p className="text-xs text-muted-foreground">Saved jobs start as “Preparing”. Change the status to Applied in Applications only after you submit on the company’s or portal’s site.</p></section>

    <div className="grid gap-6 md:grid-cols-2">
      <section aria-label="Saved searches"><h2 className="font-semibold">Saved searches</h2>{data.savedSearches.length ? data.savedSearches.map(s => <div key={s.id} className="flex items-center justify-between gap-2 border-b border-border py-2 text-sm"><button className="text-left hover:underline" onClick={() => apply(s.content.criteria as SearchCriteria, s.content.portals)}>{s.name} {s.content.criteria?.location ? `· ${s.content.criteria.location}` : ''}</button><Button size="icon" variant="ghost" aria-label={`Delete ${s.name}`} onClick={() => del({ data: { id: s.id } }).then(refresh)}><Trash2 className="size-4" /></Button></div>) : <p className="mt-2 text-sm text-muted-foreground">No saved searches yet.</p>}</section>
      <section aria-label="Recent searches"><h2 className="font-semibold">Recent searches</h2>{data.history.length ? data.history.map(s => <button key={s.id} className="block w-full border-b border-border py-2 text-left text-sm hover:underline" onClick={() => apply(s.content.criteria as SearchCriteria, s.content.portals)}>{s.name} · {(s.content.portals ?? []).map(id => portals.find(x => x.id === id)?.name).filter(Boolean).join(', ')} · {new Date(s.created_at).toLocaleDateString()}</button>) : <p className="mt-2 text-sm text-muted-foreground">No searches opened yet.</p>}</section>
    </div>
  </div>;
}
