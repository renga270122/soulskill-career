import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, Stat } from "@/components/Dash";
import { DemoBadge } from "@/components/Brand";

export const Route = createFileRoute("/_authenticated/recruiter")({
  head: () => ({ meta: [{ title: "Hiring dashboard — SoulSkill" }] }),
  component: RecruiterDashboard,
});

const jobs = [
  { t: "Senior Backend Engineer", loc: "Bengaluru · Hybrid", n: 14 },
  { t: "Product Marketing Manager", loc: "Remote · India", n: 9 },
  { t: "Data Analyst", loc: "Pune · On-site", n: 21 },
];
const stages = [
  { s: "Shortlisted", n: 12 },
  { s: "Contacted", n: 8 },
  { s: "Interviewing", n: 5 },
  { s: "Offer", n: 1 },
];

function RecruiterDashboard() {
  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <PageHeader eyebrow="Hiring" title="Hiring overview" />
      <div className="flex items-center gap-2 text-xs text-muted-foreground"><DemoBadge /> Sample figures. Candidate search is not live yet.</div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Open roles" value="3" note="Sample" />
        <Stat label="Shortlisted" value="12" note="Sample" />
        <Stat label="In interviews" value="5" note="Sample" />
        <Stat label="Avg. time to shortlist" value="4d" note="Sample" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel title="Open roles" demo>
            <ul className="divide-y divide-border">
              {jobs.map((j) => (
                <li key={j.t} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-foreground">{j.t}</p>
                    <p className="text-sm text-muted-foreground">{j.loc}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">{j.n} matching profiles</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
        <Panel title="Interview pipeline" demo>
          <ol className="space-y-3">
            {stages.map((st) => (
              <li key={st.s} className="flex items-center justify-between rounded-md bg-secondary px-3 py-2.5 text-sm">
                <span className="text-foreground">{st.s}</span>
                <span className="font-display text-xl text-primary">{st.n}</span>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-xs text-muted-foreground">
            Only candidates who opted into visibility appear. Every decision is made by your team — SoulSkill never rejects automatically.
          </p>
        </Panel>
      </div>
    </div>
  );
}
