import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { FileText, Upload, ArrowRight, Sun } from "lucide-react";
import { Stat } from "@/components/Dash";
import { Button } from "@/components/ui/button";
import { CareerFeatureCards } from "@/components/CareerFeatureCards";
import { BeliefJourney } from "@/components/BeliefJourney";
import { careerQuery, resumesQuery } from "@/lib/career-queries";
import { journeyQuery } from "@/lib/journey-queries";
import { completeness } from "@/lib/career-schema";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/_authenticated/candidate")({
  staticData: { sitemap: false },
  head: () => pageMeta("Career dashboard", "Believe in your potential. Build your future with your SoulSkill career workspace."),
  loader: ({ context }) => Promise.all([
    context.queryClient.ensureQueryData(careerQuery(context.user.id)),
    context.queryClient.ensureQueryData(resumesQuery(context.user.id)),
    context.queryClient.ensureQueryData(journeyQuery(context.user.id)),
  ]),
  component: CandidateDashboard,
});

function CandidateDashboard() {
  const { user } = Route.useRouteContext();
  const { data: career } = useSuspenseQuery(careerQuery(user.id));
  const { data: resumes } = useSuspenseQuery(resumesQuery(user.id));
  const { data } = useSuspenseQuery(journeyQuery(user.id));
  const [greeting, setGreeting] = useState("Welcome");
  useEffect(() => {
    const update = () => { const hour = new Date().getHours(); setGreeting(hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"); };
    update(); const timer = window.setInterval(update, 60000); return () => window.clearInterval(timer);
  }, []);
  const firstName = career.content.full_name?.split(" ")[0];
  return <div className="soul-enter mx-auto max-w-6xl space-y-8">
    <header className="grid min-w-0 gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
      <div className="min-w-0"><p className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground"><Sun className="size-4 text-primary" /> Manifest. Believe. Achieve.</p>
        <h1 className="mt-3 break-words font-display text-4xl leading-tight md:text-5xl">{greeting}{firstName ? `, ${firstName}` : ""}.</h1>
        <p className="mt-3 text-muted-foreground">Believe in the possibilities ahead.</p>
      </div>
      <Button asChild variant="outline"><Link to={data.intentions[0]?.completed_at ? "/journey" : "/career-onboarding"}>Continue my journey <ArrowRight /></Link></Button>
    </header>
    <CareerFeatureCards />
    <section><h2 className="mb-5 font-display text-3xl">Small steps. Real progress.</h2><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Stat label="Profile completeness" value={`${completeness(career.content)}%`} note="Based on your saved profile" />
      <Stat label="Resumes" value={String(resumes.length)} note="Saved in Resume Studio" />
      <Stat label="Applications" value={String(data.applications.filter(a => a.applied_at).length)} note="Recorded by you" />
      <Stat label="Career tasks completed" value={String(data.tasks.filter(t => t.completed_at).length)} note="Your confirmed actions" />
    </div></section>
    <section className="space-y-5 border-y border-border py-8">
      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"><div className="min-w-0"><h2 className="flex items-center gap-2 font-display text-3xl"><FileText className="size-6 text-primary" />Your resumes</h2><p className="mt-2 text-sm text-muted-foreground">Your experience, ready for its next chapter.</p></div>
        <div className="flex flex-wrap gap-2"><Button asChild><Link to="/resumes"><Upload />Upload or edit resume</Link></Button><Button asChild variant="outline"><Link to="/applications">Apply to jobs</Link></Button></div>
      </div>
      {resumes.length ? <ul className="divide-y divide-border">{resumes.slice(0,5).map(r => <li key={r.id} className="grid min-w-0 gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"><div className="min-w-0"><p className="break-words font-semibold">{r.title}{r.is_default ? " · Default" : ""}</p><p className="text-sm text-muted-foreground">{r.target_role || "No target role selected"}</p></div><Button asChild size="sm" variant="outline"><Link to="/resumes">Edit in Resume Studio</Link></Button></li>)}</ul> : <p className="text-sm text-muted-foreground">Your first resume starts with your experience. Upload a PDF or DOCX to get started.</p>}
    </section>
    <section className="grid gap-8 md:grid-cols-2"><div><h2 className="font-display text-2xl">Recent applications</h2>{data.applications.slice(0,3).map(a => <p key={a.id} className="mt-3 break-words text-sm">{a.role} · {a.company} · {a.status}</p>)}{!data.applications.length && <p className="mt-3 text-sm text-muted-foreground">Your next opportunity is worth exploring. No applications recorded yet.</p>}</div><div><h2 className="font-display text-2xl">Strengthen your profile</h2><p className="mt-3 text-sm text-muted-foreground">Keep your skills, experience and professional story up to date.</p><Button asChild variant="outline" className="mt-4"><Link to="/profile">Edit profile</Link></Button></div></section>
    <BeliefJourney />
  </div>;
}