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
import { TemplateGallery } from "@/components/TemplateGallery";
import { ResumeCustomization } from "@/components/ResumeCustomization";
import { ResumeImport } from "@/components/ResumeImport";
import { ResumeAssistant } from "@/components/ResumeAssistant";
import { templates, defaultPresentation, presentationSchema, selectDesign, type Presentation } from "@/lib/resume-design";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

type Draft = { id?: string; title: string; target_role: string; template: ResumeTemplate; content: CareerData; presentation: Presentation; original_id: string | null };
export const Route = createFileRoute("/_authenticated/resumes")({
  head: () => pageMeta("Resume Studio", "Create, preview and export private resumes for different target roles."),
  loader: async ({ context }) => Promise.all([context.queryClient.ensureQueryData(resumesQuery(context.user.id)), context.queryClient.ensureQueryData(careerQuery(context.user.id))]),
  pendingComponent: () => <p role="status">Loading Resume Studio…</p>,
  errorComponent: ({ reset }) => <div role="alert">Your resumes could not load. <Button variant="outline" onClick={reset}>Try again</Button></div>,
  component: ResumeStudio,
});
function toDraft(r: { id: string; title: string; target_role: string; template: string; design_key: string; presentation: unknown; original_id: string | null; content: unknown }, fallback: CareerData): Draft {
  const content = careerSchema.safeParse(r.content), template = templateSchema.safeParse(r.design_key);
  return { id: r.id, title: r.title, target_role: r.target_role, template: template.success ? template.data : "classic", content: content.success ? content.data : fallback, presentation: presentationSchema.parse(r.presentation ?? {}), original_id: r.original_id };
}
function ResumeStudio() {
  const { user } = Route.useRouteContext(); const qc = useQueryClient();
  const { data: resumes } = useSuspenseQuery(resumesQuery(user.id)); const { data: career } = useSuspenseQuery(careerQuery(user.id));
  const save = useServerFn(saveResume), remove = useServerFn(deleteResume), setDefault = useServerFn(defaultResume);
  const [draft, setDraft] = useState<Draft | null>(resumes[0] ? toDraft(resumes[0], career.content) : null);
  const [dirty, setDirty] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState("");
  const [view, setView] = useState("content");
  const [review, setReview] = useState<{ warnings: string[]; text: string } | null>(null);
  const current = resumes.find(r => r.id === draft?.id);
  async function refresh() { await qc.invalidateQueries({ queryKey: ["resumes", user.id] }); }
  async function persist(value = draft) {
    if (!value) return;
    const result = resumeInputSchema.safeParse(value);
    if (!result.success) { setError(result.error.issues.map(i => `${i.path.join(" › ")}: ${i.message}`).join("; ")); return; }
    setBusy(true); setError("");
    try { const saved = await save({ data: result.data }); setDirty(false); setDraft({ ...result.data, id: saved.id }); await refresh(); setReview(null); toast.success("Resume saved"); }
    catch { setError("Your resume could not be saved. Please try again."); }
    finally { setBusy(false); }
  }
  function leave() { return !dirty || window.confirm("Discard unsaved changes?"); }
  function create(source?: Draft) {
    if (!leave()) return;
    setDraft(source ? { title: `${source.title} copy`.slice(0, 200), target_role: source.target_role, template: source.template, content: structuredClone(source.content), presentation: structuredClone(source.presentation), original_id: source.original_id } : { title: "New resume", target_role: "", template: "classic", content: structuredClone(career.content), presentation: defaultPresentation(), original_id: null }); setDirty(true); setError(""); setView("content"); setReview(null);
  }
  function update(next: Draft) { setDirty(true); setDraft(next); }
  return <div className="mx-auto max-w-7xl space-y-8"><PageHeader eyebrow="Career" title="Resume Studio"><div className="flex flex-wrap gap-2"><ResumeImport userId={user.id} onReview={r => { if (!leave()) return; setDraft({ title: r.title.slice(0,200), target_role: "", template: "classic", content: r.content, presentation: defaultPresentation(), original_id: r.originalId }); setReview({ warnings: r.warnings, text: r.text }); setDirty(true); setView("content"); }} /><Button onClick={() => create()} disabled={busy}><FilePlus2 className="size-4" />New resume</Button></div></PageHeader>
    {!draft ? <div className="border border-dashed border-border bg-card p-10 text-center"><h2 className="font-display text-3xl">Create your first resume</h2><Button className="mt-6" onClick={() => create()}><FilePlus2 className="size-4" />Create resume</Button></div> :
    <div className="grid gap-6 2xl:grid-cols-[180px_minmax(0,1fr)_minmax(340px,0.85fr)] lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.8fr)]">
      <aside className="space-y-2 lg:col-span-2 2xl:col-span-1"><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your resumes</p>{resumes.map(r => <Button variant={r.id === draft.id ? "secondary" : "outline"} key={r.id} onClick={() => { if (!leave()) return; setDraft(toDraft(r, career.content)); setDirty(false); setError(""); }} className="h-auto w-full justify-start whitespace-normal p-3 text-left"><span className="min-w-0 flex-1 break-words"><span className="block font-medium">{r.title}</span><span className="mt-1 block text-xs text-muted-foreground">{r.target_role || "No target role"}</span></span>{r.is_default && <Star className="size-4 shrink-0 fill-primary text-primary" aria-label="Default resume" />}</Button>)}</aside>
      <section className="min-w-0 space-y-6"><div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="resume-title">Resume title</Label><Input id="resume-title" maxLength={200} value={draft.title} onChange={e => update({ ...draft, title: e.target.value })} /></div><div className="space-y-2"><Label htmlFor="resume-role">Target role</Label><Input id="resume-role" maxLength={200} value={draft.target_role} onChange={e => update({ ...draft, target_role: e.target.value })} /></div></div>
        <div className="flex items-center justify-between border-y border-border py-3"><p className="text-sm">{templates.find(t => t.key === draft.template)?.name} <span className="text-muted-foreground">· {draft.presentation.font} · {draft.presentation.accent}</span></p><Button size="sm" variant="outline" onClick={() => setView("templates")}>Change template</Button></div>
        <div className="flex flex-wrap gap-2"><Button onClick={() => persist()} disabled={busy}><Save className="size-4" />{busy ? "Saving…" : "Save resume"}</Button><Button variant="outline" onClick={() => create(draft)} disabled={busy}><Copy className="size-4" />Duplicate</Button><Button variant="outline" disabled={!draft.id || current?.is_default || busy} onClick={async () => { if (!draft.id) return; try { await setDefault({ data: { id: draft.id } }); await refresh(); toast.success("Default resume updated"); } catch { toast.error("Could not set default"); } }}><Star className="size-4" />{current?.is_default ? "Default" : "Make default"}</Button><Button variant="outline" onClick={async () => { try { await exportResumePdf(draft.content, draft.template, draft.title, draft.presentation); toast.success("PDF downloaded"); } catch { toast.error("PDF export failed"); } }}><Download className="size-4" />Export PDF</Button>{draft.id && <AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" disabled={busy}><Trash2 className="size-4" />Delete</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete this resume?</AlertDialogTitle><AlertDialogDescription>This permanently removes “{draft.title}”.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={async () => { if (!draft.id) return; try { await remove({ data: { id: draft.id } }); setDraft(null); setDirty(false); await refresh(); toast.success("Resume deleted"); } catch { toast.error("Could not delete resume"); } }}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>}{!draft.id && <Button variant="ghost" onClick={() => { setDraft(resumes[0] ? toDraft(resumes[0], career.content) : null); setDirty(false); }}>Cancel</Button>}</div>
        <p role="status" className="text-xs text-muted-foreground">{busy ? "Saving…" : dirty ? "Unsaved changes" : "All changes saved"}</p>{error && <p role="alert" className="break-words text-sm text-destructive">{error}</p>}
        <Tabs value={view} onValueChange={setView}><TabsList className="flex h-auto w-full flex-wrap justify-start"><TabsTrigger value="content">Content</TabsTrigger><TabsTrigger value="templates">Templates</TabsTrigger><TabsTrigger value="customize">Customize</TabsTrigger><TabsTrigger value="assistant">AI assistant</TabsTrigger></TabsList></Tabs>
        {review && <section className="space-y-3 border-l-2 border-primary bg-accent p-4"><h2 className="font-semibold">Review imported information</h2><ul className="list-disc space-y-1 pl-5 text-sm">{review.warnings.map((w,i) => <li key={i}>{w}</li>)}</ul><details><summary className="cursor-pointer text-sm font-medium">Extracted original text</summary><pre className="mt-3 max-h-60 overflow-y-auto whitespace-pre-wrap break-words text-xs">{review.text || "No readable text extracted."}</pre></details><p className="text-xs">Correct missing or uncertain information, then save as a new resume.</p></section>}
        {view === "content" && <CareerEditor value={draft.content} onChange={content => update({ ...draft, content })} />}
        {view === "customize" && <ResumeCustomization value={draft.presentation} onChange={presentation => update({ ...draft, presentation })} />}
        {view === "assistant" && <ResumeAssistant content={draft.content} onChange={content => update({ ...draft, content })} />}
        {view === "templates" && <TemplateGallery selected={draft.template} content={draft.content} presentation={draft.presentation} onSelect={template => update({ ...draft, template, presentation: selectDesign(draft.presentation, template) })} />}

      </section>
      <section className="min-w-0 lg:sticky lg:top-8 lg:self-start"><p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Live preview</p><ResumePreview content={draft.content} template={draft.template} presentation={draft.presentation} /></section>
    </div>}
    {!draft && <TemplateGallery content={career.content} onSelect={template => { setDraft({ title: "New resume", target_role: "", template, content: structuredClone(career.content), presentation: selectDesign(defaultPresentation(), template), original_id: null }); setDirty(true); }} />}
  </div>;
}