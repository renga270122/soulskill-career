import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, Panel, Stat } from "@/components/Dash";
import { DemoBadge } from "@/components/Brand";
import { Progress } from "@/components/ui/progress";
import { pageMeta } from "@/lib/page-meta";
import bannerAsset from "@/assets/career-growth-banner.webp.asset.json";

export const Route = createFileRoute("/_authenticated/candidate")({
  staticData: { sitemap: false },
  head: () => pageMeta("Career dashboard", "Your SoulSkill career workspace, profile and application overview."),
  component: CandidateDashboard,
});

const apps = [
  { role: "Senior Product Designer", co: "Northwind Labs", stage: "Interview" },
  { role: "Design Lead", co: "Lumen Health", stage: "Applied" },
  { role: "UX Strategist", co: "Atlas Finance", stage: "Screening" },
];

function CandidateDashboard() {
  const { user } = Route.useRouteContext();
  const { data: profile } = useQuery({
    queryKey: ["profile", user.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      return data;
    },
  });
  const first = profile?.full_name?.split(" ")[0];

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <PageHeader eyebrow="Career" title={first ? `Good to see you, ${first}.` : "Your career dashboard"}>
        <Link to="/settings" className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:bg-secondary">
          Recruiter visibility: <strong className={profile?.discoverable ? "text-primary" : "text-foreground"}>{profile?.discoverable ? "On" : "Off"}</strong>
        </Link>
      </PageHeader>

      <div className="flex items-center gap-2 text-xs text-muted-foreground"><DemoBadge /> Figures below are sample data until resumes and applications are connected.</div>

      <section className="relative overflow-hidden rounded-2xl border border-border shadow-soft">
        <img
          src={bannerAsset.url}
          alt="A professional reviewing career documents at a bright desk by a window"
          width={1600}
          height={640}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="relative flex flex-col gap-4 bg-gradient-to-r from-background via-background/90 to-background/20 p-8 md:max-w-lg md:p-10">
          <h2 className="font-display text-3xl text-foreground">Your next chapter starts with a strong profile.</h2>
          <p className="text-sm text-muted-foreground">
            Complete your experience, skills and projects so your resumes — and your visibility to recruiters — work harder for you.
          </p>
          <div>
            <Link to="/profile" className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
              Complete your profile
            </Link>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Profile strength" value="68%" note="Sample" />
        <Stat label="Resumes" value="2" note="Sample" />
        <Stat label="Active applications" value="3" note="Sample" />
        <Stat label="Interviews this week" value="1" note="Sample" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel title="Application tracker" demo>
            <ul className="divide-y divide-border">
              {apps.map((a) => (
                <li key={a.role} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-foreground">{a.role}</p>
                    <p className="text-sm text-muted-foreground">{a.co}</p>
                  </div>
                  <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">{a.stage}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
        <Panel title="Strengthen your profile" demo>
          <ul className="space-y-4 text-sm">
            {[["Work experience", 90], ["Skills", 70], ["Projects", 40], ["Certifications", 20]].map(([k, v]) => (
              <li key={k as string}>
                <div className="mb-1.5 flex justify-between"><span className="text-foreground">{k}</span><span className="text-muted-foreground">{v}%</span></div>
                <Progress value={v as number} />
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
