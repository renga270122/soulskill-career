import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Building2, Briefcase, Search, Star, Workflow, Settings, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/Dash";
import { Button } from "@/components/ui/button";
import { pageMeta } from "@/lib/page-meta";
import interviewAsset from "@/assets/interview-handshake.webp.asset.json";

export const Route = createFileRoute("/_authenticated/recruiter")({
  staticData: { sitemap: false },
  head: () => pageMeta("Hiring dashboard", "Your SoulSkill hiring workspace and recruitment overview."),
  component: RecruiterDashboard,
});

function RecruiterDashboard() {
  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <PageHeader eyebrow="Recruiter workspace" title="Build your next great team."><Button asChild variant="outline"><Link to="/settings"><Settings className="size-4" />Account settings</Link></Button></PageHeader>
      <p className="text-sm text-muted-foreground">Hiring overview · Recruitment tools are not available yet.</p>

      <section className="relative min-h-64 overflow-hidden border-y border-border">
        <img
          src={interviewAsset.url}
          alt="A recruiter and a candidate shaking hands at the start of an interview"
          width={1600}
          height={912}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="relative flex flex-col gap-3 bg-gradient-to-r from-background via-background/90 to-background/20 p-8 md:max-w-lg md:p-10">
          <h2 className="font-display text-3xl text-foreground">Great hiring is human.</h2>
          <p className="text-sm text-muted-foreground">
            Candidate visibility is a choice. Every hiring decision belongs with your team.
          </p>
        </div>
      </section>

      <section aria-labelledby="hiring-tools" className="space-y-5">
        <h2 id="hiring-tools" className="font-display text-3xl">Your hiring workspace</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "Company", icon: Building2, text: "Company profiles and hiring-team management are not available yet." },
            { title: "Open roles", icon: Briefcase, text: "Job posting is not available yet. No live roles are displayed." },
            { title: "Candidate discovery", icon: Search, text: "Candidate search is not available yet. No candidate directory is displayed." },
            { title: "Shortlist", icon: Star, text: "Saved candidate shortlists are not available yet." },
            { title: "Interview pipeline", icon: Workflow, text: "Interview tracking is not available yet. No pipeline activity is displayed." },
          ].map(({ title, icon: Icon, text }) => <article key={title} className="rounded-lg border border-border bg-card p-6 shadow-soft"><div className="flex items-center justify-between gap-3"><Icon className="size-5 text-primary" /><span className="text-xs text-muted-foreground">Unavailable</span></div><h3 className="mt-5 font-display text-xl">{title}</h3><p className="mt-2 text-sm text-muted-foreground">{text}</p></article>)}
        </div>
      </section>
      <section className="flex items-start gap-4 border-t border-border pt-6"><ShieldCheck className="mt-1 size-5 shrink-0 text-primary" /><div><h2 className="font-display text-xl">Consent comes first</h2><p className="mt-2 text-sm text-muted-foreground">Professionals choose whether their name and headline are discoverable. Private resumes, contact details, journals and reflections are not shared with recruiters.</p></div></section>
    </div>
  );
}
