import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/Dash";
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
      <PageHeader eyebrow="Hiring" title="Hiring overview" />
      <p className="text-sm text-muted-foreground">Candidate discovery and recruitment tracking are not available yet.</p>

      <section className="relative overflow-hidden rounded-2xl border border-border shadow-soft">
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

      <div className="grid gap-6 md:grid-cols-2">
        <Panel title="Open roles">
          <p className="text-sm text-muted-foreground">Job posting is not available yet. No live roles are displayed.</p>
        </Panel>
        <Panel title="Interview pipeline">
          <p className="text-sm text-muted-foreground">Interview tracking is not available yet. No pipeline activity is displayed.</p>
        </Panel>
      </div>
    </div>
  );
}
