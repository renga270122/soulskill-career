import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { resumesQuery } from "@/lib/career-queries";
import { careerSchema } from "@/lib/career-schema";
import { presentationSchema } from "@/lib/resume-design";
import { pageMeta } from "@/lib/page-meta";
import { ATSChecker } from "@/components/ATSChecker";
import { PageHeader } from "@/components/Dash";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/ats-check")({
  staticData: { sitemap: false },
  head: () => pageMeta("ATS keyword match", "Compare your private resume against a job description with a transparent keyword coverage estimate."),
  loader: ({ context }) => context.queryClient.ensureQueryData(resumesQuery(context.user.id)),
  pendingComponent: () => <p role="status">Loading your resumes…</p>,
  errorComponent: ATSError,
  notFoundComponent: () => <p>Resume not found.</p>,
  component: ATSPage,
});
function ATSError() { const router = useRouter(); return <div role="alert"><p>Your resumes couldn’t load.</p><Button onClick={() => void router.invalidate()}>Try again</Button></div>; }
function ATSPage() {
  const { user } = Route.useRouteContext();
  const { data: resumes } = useSuspenseQuery(resumesQuery(user.id));
  const [id, setId] = useState(resumes.find(r => r.is_default)?.id ?? resumes[0]?.id ?? "");
  const resume = resumes.find(r => r.id === id);
  const content = careerSchema.safeParse(resume?.content);
  return <div className="mx-auto max-w-3xl space-y-8"><PageHeader eyebrow="Career" title="ATS keyword match"><Button asChild variant="outline"><Link to="/resumes">Resume Studio</Link></Button></PageHeader>
    {!resumes.length ? <section className="space-y-4 border-y border-border py-8"><h2 className="font-display text-2xl">Start with a resume</h2><p className="text-muted-foreground">Create or import a resume in Resume Studio, then compare it with a job description.</p><Button asChild variant="ink"><Link to="/resumes">Create or import resume</Link></Button></section> : <>
      <div className="space-y-2"><Label htmlFor="ats-resume">Resume to check</Label><Select value={id} onValueChange={setId}><SelectTrigger id="ats-resume"><SelectValue placeholder="Select a resume" /></SelectTrigger><SelectContent>{resumes.map(r => <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>)}</SelectContent></Select><p className="text-xs text-muted-foreground">Uses saved content and visible sections. For unsaved edits, use the ATS match tab in Resume Studio.</p></div>
      {content.success && resume ? <ATSChecker key={resume.id} content={content.data} presentation={presentationSchema.parse(resume.presentation ?? {})} /> : <p role="alert">Open this resume in Resume Studio and save valid content before checking.</p>}
    </>}
  </div>;
}