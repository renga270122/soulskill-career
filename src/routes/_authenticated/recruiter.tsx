import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Settings, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/Dash";
import { Button } from "@/components/ui/button";
import { pageMeta } from "@/lib/page-meta";
import interviewAsset from "@/assets/interview-handshake.webp.asset.json";
import { hiringGroups } from "@/lib/hiring-presentation";

export const Route = createFileRoute("/_authenticated/recruiter")({
  staticData: { sitemap: false },
  head: () => pageMeta("Recruiter hiring workspace", "Review SoulSkill hiring options for job requisitions, candidate sourcing, screening, interviews and hiring decisions."),
  component: RecruiterDashboard,
});

function RecruiterDashboard() {
  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <PageHeader eyebrow="Recruiter workspace" title="Hiring overview"><Button asChild variant="outline"><Link to="/settings"><Settings className="size-4" />Account settings</Link></Button></PageHeader>
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

      {hiringGroups.map(group => <section key={group.title} aria-label={group.title} className="space-y-5">
        <h2 className="font-display text-3xl">{group.title}</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {group.tools.map(({ title, icon: Icon, options, unavailable }) => <article key={title} className="min-w-0 rounded-lg border border-border bg-card p-6 shadow-soft"><div className="flex items-center justify-between gap-3"><Icon className="size-5 text-primary" /><span className="text-xs text-muted-foreground">Unavailable</span></div><h3 className="mt-5 break-words font-display text-2xl">{title}</h3><ul className="mt-4 divide-y divide-border">{options.map(option => <li key={option} className="py-2 text-sm text-foreground">{option}</li>)}</ul><p className="mt-4 border-t border-border pt-4 text-sm text-muted-foreground">{unavailable}</p></article>)}
        </div>
      </section>)}
      <section className="flex items-start gap-4 border-t border-border pt-6"><ShieldCheck className="mt-1 size-5 shrink-0 text-primary" /><div><h2 className="font-display text-xl">Consent comes first</h2><p className="mt-2 text-sm text-muted-foreground">Professionals choose whether their name and headline are discoverable. Private resumes, contact details, journals and reflections are not shared with recruiters.</p></div></section>
    </div>
  );
}
