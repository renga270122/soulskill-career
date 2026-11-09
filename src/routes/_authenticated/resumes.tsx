import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Copy, Download, FilePlus2, Save, Star, Trash2 } from "lucide-react";
import { careerQuery, resumesQuery } from "@/lib/career-queries";
import { careerSchema, resumeInputSchema, templateSchema, type CareerData, type ResumeTemplate } from "@/lib/career-schema";
import { defaultResume, deleteResume, saveResume } from "@/lib/career.functions";
import { exportResumePdf } from "@/lib/resume-pdf";
import { pageMeta } from "@/lib/page-meta";
import { CareerEditor } from "@/components/CareerEditor";
import { ResumePreview } from "@/components/ResumePreview";
import { PageHeader } from "@/components/Dash";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

type Draft = { id?: string; title: string; target_role: string; template: ResumeTemplate; content: CareerData };
export const Route = createFileRoute("/_authenticated/resumes")({
  head: () => pageMeta("Resume Studio", "Create, preview and export private resumes for different target roles."),
  loader: async ({ context }) => Promise.all([context.queryClient.ensureQueryData(resumesQuery(context.user.id)), context.queryClient.ensureQueryData(careerQuery(context.user.id))]),
  pendingComponent: () => <p role="status">Loading Resume Studio…</p>,
  errorComponent: ({ reset }) => <div role="alert">Your resumes could not load. <Button variant="outline" onClick={reset}>Try again</Button></div>,
  component: ResumeStudio,
});
function toDraft(r: { id: string; title: string; target_role: string; template: string; content: unknown }, fallback: CareerData): Draft {
  const content = careerSchema.safeParse(r.content), template = templateSchema.safeParse(r.template);
  return { id: r.id, title: r.title, target_role: r.target_role, template: template.success ? template.data : "classic", content: content.success ? content.data : fallback };
}
function ResumeStudio() {
  const { user } = Route.useRouteContext(); const qc = useQueryClient();
  const { data: resumes } = useSuspenseQuery(resumesQuery(user.id)); const { data: career } = useSuspenseQuery(careerQuery(user.id));
  const save = useServerFn(saveResume), remove = useServerFn(deleteResume), setDefault = useServerFn(defaultResume);
  const [draft, setDraft] = useState<Draft | null>(resumes[0] ? toDraft(resumes[0], career.content) : null);
  const [dirty, setDirty] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState("");
  const current = resumes.find(r => r.id === draft?.id);
  async function refresh() { await qc.invalidateQueries({ queryKey: ["resumes", user.id] }); }
  async function persist(value = draft) {
    if (!value) return;
    const result = resumeInputSchema.safeParse(value);
    if (!result.success) { setError(result.error.issues.map(i => `${i.path.join(" › ")}: ${i.message}`).join("; ")); return; }
    setBusy(true); setError("");
    try { const saved = await save({ data: result.data }); setDirty(false); setDraft({ ...result.data, id: saved.id }); await refresh(); toast.success("Resume saved"); }
    catch { setError("Your resume could not be saved. Please try again."); }
    finally { setBusy(false); }
  }
  function leave() { return !dirty || window.confirm("Discard unsaved changes?"); }
  function create(source?: Draft) {
    if (!leave()) return;
    setDraft(source ? { title: `${source.title} copy`.slice(0, 200), target_role: source.target_role, template: source.template, content: structuredClone(source.content) } : { title: "New resume", target_role: "", template: "classic", content: structuredClone(career.content) }); setDirty(true); setError("");
  }
  function update(next: Draft) { setDirty(true); setDraft(next); }
  return <div className="mx-auto max-w-7xl space-y-8"><PageHeader eyebrow="Career" title="Resume Studio"><Button onClick={() => create()} disabled={busy}><FilePlus2 className="size-4" />New resume</Button></PageHeader>
    {!draft ? <div className="border border-dashed border-border bg-card p-10 text-center"><h2 className="font-display text-3xl">Create your first resume</h2><Button className="mt-6" onClick={() => create()}><FilePlus2 className="size-4" />Create resume</Button></div> :
    <div className="grid gap-6 xl:grid-cols-[200px_minmax(0,1fr)_minmax(320px,0.9fr)]">
      <aside className="space-y-2"><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your resumes</p>{resumes.map(r => <Button variant={r.id === draft.id ? "secondary" : "outline"} key={r.id} onClick={() => { if (!leave()) return; setDraft(toDraft(r, career.content)); setDirty(false); setError(""); }} className="h-auto w-full justify-start whitespace-normal p-3 text-left"><span className="min-w-0 flex-1 break-words"><span className="block font-medium">{r.title}</span><span className="mt-1 block text-xs text-muted-foreground">{r.target_role || "No target role"}</span></span>{r.is_default && <Star className="size-4 shrink-0 fill-primary text-primary" aria-label="Default resume" />}</Button>)}</aside>
      <section className="min-w-0 space-y-6"><div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="resume-title">Resume title</Label><Input id="resume-title" maxLength={200} value={draft.title} onChange={e => update({ ...draft, title: e.target.value })} /></div><div className="space-y-2"><Label htmlFor="resume-role">Target role</Label><Input id="resume-role" maxLength={200} value={draft.target_role} onChange={e => update({ ...draft, target_role: e.target.value })} /></div></div>
        <fieldset><legend className="mb-2 text-sm font-medium">Template</legend><div className="grid grid-cols-3 gap-2">{(["classic", "modern", "executive"] as const).map(t => <Button key={t} variant={draft.template === t ? "secondary" : "outline"} type="button" aria-pressed={draft.template === t} onClick={() => update({ ...draft, template: t })} className="capitalize">{t}</Button>)}</div></fieldset>
        <div className="flex flex-wrap gap-2"><Button onClick={() => persist()} disabled={busy}><Save className="size-4" />{busy ? "Saving…" : "Save resume"}</Button><Button variant="outline" onClick={() => create(draft)} disabled={busy}><Copy className="size-4" />Duplicate</Button><Button variant="outline" disabled={!draft.id || current?.is_default || busy} onClick={async () => { if (!draft.id) return; try { await setDefault({ data: { id: draft.id } }); await refresh(); toast.success("Default resume updated"); } catch { toast.error("Could not set default"); } }}><Star className="size-4" />{current?.is_default ? "Default" : "Make default"}</Button><Button variant="outline" onClick={async () => { try { await exportResumePdf(draft.content, draft.template, draft.title); toast.success("PDF downloaded"); } catch { toast.error("PDF export failed"); } }}><Download className="size-4" />Export PDF</Button>{draft.id && <AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" disabled={busy}><Trash2 className="size-4" />Delete</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete this resume?</AlertDialogTitle><AlertDialogDescription>This permanently removes “{draft.title}”.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={async () => { if (!draft.id) return; try { await remove({ data: { id: draft.id } }); setDraft(null); setDirty(false); await refresh(); toast.success("Resume deleted"); } catch { toast.error("Could not delete resume"); } }}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>}{!draft.id && <Button variant="ghost" onClick={() => { setDraft(resumes[0] ? toDraft(resumes[0], career.content) : null); setDirty(false); }}>Cancel</Button>}</div>
        <p role="status" className="text-xs text-muted-foreground">{busy ? "Saving…" : dirty ? "Unsaved changes" : "All changes saved"}</p>{error && <p role="alert" className="break-words text-sm text-destructive">{error}</p>}
        <CareerEditor value={draft.content} onChange={content => update({ ...draft, content })} />
      </section>
      <section className="min-w-0 xl:sticky xl:top-8 xl:self-start"><p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Live preview</p><ResumePreview content={draft.content} template={draft.template} /></section>
    </div>}
  </div>;
}