import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Save, Camera, UserRound, Trash2 } from "lucide-react";
import { careerQuery } from "@/lib/career-queries";
import { careerSchema, completeness } from "@/lib/career-schema";
import { saveCareer, savePhoto } from "@/lib/career.functions";
import { pageMeta } from "@/lib/page-meta";
import { supabase } from "@/integrations/supabase/client";
import { CareerEditor } from "@/components/CareerEditor";
import { PageHeader } from "@/components/Dash";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_authenticated/profile")({
  staticData: { sitemap: false },
  head: () => pageMeta("Candidate profile", "Manage your private career details, skills, experience and professional profile."),
  loader: ({ context }) => context.queryClient.ensureQueryData(careerQuery(context.user.id)),
  pendingComponent: () => <p role="status">Loading your profile…</p>,
  errorComponent: ({ reset }) => <div role="alert">Your profile could not load. <Button onClick={reset} variant="outline">Try again</Button></div>,
  component: ProfilePage,
});
function ProfilePage() {
  const { user } = Route.useRouteContext();
  const { data } = useSuspenseQuery(careerQuery(user.id));
  const qc = useQueryClient();
  const save = useServerFn(saveCareer);
  const photo = useServerFn(savePhoto);
  const [draft, setDraft] = useState(data.content);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit() {
    const result = careerSchema.safeParse(draft);
    if (!result.success) { setError(result.error.issues.map(i => `${i.path.join(" › ")}: ${i.message}`).join("; ")); return; }
    setBusy(true); setError("");
    try { await save({ data: result.data }); setDirty(false); await qc.invalidateQueries({ queryKey: ["career", user.id] }); await qc.invalidateQueries({ queryKey: ["profile", user.id] }); toast.success("Profile saved"); }
    catch { setError("Your profile could not be saved. Please try again."); }
    finally { setBusy(false); }
  }
  async function upload(file: File | undefined) {
    if (!file) return;
    if (!/image\/(jpeg|png|webp)/.test(file.type) || file.size > 5 * 1024 * 1024) { toast.error("Choose a JPG, PNG or WebP photo under 5 MB"); return; }
    setPhotoBusy(true);
    const ext = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1];
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    try {
      const result = await supabase.storage.from("candidate-assets").upload(path, file, { contentType: file.type });
      if (result.error) throw result.error;
      await photo({ data: { path } }); await qc.invalidateQueries({ queryKey: ["career", user.id] }); toast.success("Photo saved");
    } catch { await supabase.storage.from("candidate-assets").remove([path]); toast.error("Photo could not be saved"); }
    finally { setPhotoBusy(false); }
  }
  return <div className="mx-auto max-w-5xl space-y-8"><PageHeader eyebrow="Career" title="Your profile"><Button onClick={submit} disabled={busy}><Save className="size-4" />{busy ? "Saving…" : "Save profile"}</Button></PageHeader>
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_220px]">
      <div className="min-w-0"><div className="mb-8 flex flex-wrap items-center gap-4 border-b border-border pb-6">{data.photoUrl ? <img className="size-20 rounded-md object-cover" src={`${import.meta.env["VITE_SUPABASE_URL"]}${data.photoUrl}`} alt="Profile photo" /> : <div className="flex size-20 items-center justify-center rounded-md bg-accent text-primary"><UserRound className="size-9" /></div>}<div className="space-y-2"><div className="flex gap-2"><Button variant="outline" size="sm" disabled={photoBusy} asChild><label htmlFor="profile-photo"><Camera className="size-4" />{photoBusy ? "Uploading…" : "Upload photo"}</label></Button><input id="profile-photo" type="file" className="sr-only" accept="image/png,image/jpeg,image/webp" disabled={photoBusy} onChange={e => { void upload(e.target.files?.[0]); e.target.value = ""; }} />{data.photoPath && <Button size="icon" variant="ghost" aria-label="Remove photo" title="Remove photo" disabled={photoBusy} onClick={async () => { setPhotoBusy(true); try { await photo({ data: { path: null } }); await qc.invalidateQueries({ queryKey: ["career", user.id] }); toast.success("Photo removed"); } catch { toast.error("Could not remove photo"); } finally { setPhotoBusy(false); } }}><Trash2 className="size-4" /></Button>}</div><p className="text-xs text-muted-foreground">JPG, PNG or WebP · Up to 5 MB</p></div></div>
      {error && <p role="alert" className="mb-5 break-words text-sm text-destructive">{error}</p>}<CareerEditor value={draft} onChange={v => { setDraft(v); setDirty(true); }} /><div className="mt-8 flex items-center gap-4 border-t border-border pt-6"><Button onClick={submit} disabled={busy}><Save className="size-4" />{busy ? "Saving…" : "Save profile"}</Button><p role="status" className="text-xs text-muted-foreground">{dirty ? "Unsaved changes" : "All changes saved"}</p></div></div>
      <aside className="space-y-3 lg:sticky lg:top-8 lg:self-start"><p className="text-sm font-semibold">Profile completeness</p><p className="font-display text-4xl text-primary">{completeness(draft)}%</p><Progress value={completeness(draft)} /><p className="text-xs text-muted-foreground">{dirty ? "Unsaved changes" : "Saved profile"}</p></aside>
    </div></div>;
}