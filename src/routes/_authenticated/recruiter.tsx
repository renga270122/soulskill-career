import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  ArrowRight, BriefcaseBusiness, Building2, Search, ShieldCheck,
  Sparkles, Users, UserRoundSearch,
} from "lucide-react";
import { PageHeader, Stat } from "@/components/Dash";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useRoles } from "@/lib/auth";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/_authenticated/recruiter")({
  staticData: { sitemap: false },
  head: () => pageMeta(
    "Recruiter hiring workspace",
    "Discover professionals who have chosen to make their SoulSkill profile visible to recruiters.",
  ),
  component: RecruiterDashboard,
});

type DiscoverableProfile = {
  id: string;
  full_name: string | null;
  headline: string | null;
  updated_at: string;
};

function RecruiterDashboard() {
  const { user } = Route.useRouteContext();
  const { data: roles = [], isLoading: rolesLoading } = useRoles(user.id);
  const [activeView, setActiveView] = useState<"overview" | "talent">("overview");
  const [search, setSearch] = useState("");
  const canHire = roles.includes("recruiter") || roles.includes("admin");

  const talentQuery = useQuery({
    queryKey: ["recruiter-discoverable-professionals"],
    enabled: canHire,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, headline, updated_at")
        .eq("discoverable", true)
        .order("updated_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as DiscoverableProfile[];
    },
  });

  const filteredProfiles = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    const profiles = talentQuery.data ?? [];
    if (!term) return profiles;
    return profiles.filter(profile =>
      [profile.full_name, profile.headline]
        .some(value => value?.toLocaleLowerCase().includes(term)),
    );
  }, [search, talentQuery.data]);

  if (rolesLoading) {
    return <div className="mx-auto max-w-6xl py-12 text-sm text-muted-foreground">Loading your hiring workspace…</div>;
  }

  if (!canHire) {
    return (
      <section className="mx-auto max-w-2xl space-y-4 rounded-xl border border-border bg-card p-8">
        <ShieldCheck className="size-8 text-primary" />
        <h1 className="font-display text-3xl">Recruiter access required</h1>
        <p className="text-sm text-muted-foreground">This workspace is available to accounts with the recruiter role. Your Professional workspace and saved career data remain unchanged.</p>
        <Button asChild variant="outline"><Link to="/candidate">Go to Professional workspace</Link></Button>
      </section>
    );
  }

  return (
    <div className="soul-enter mx-auto max-w-6xl space-y-8">
      <PageHeader eyebrow="SoulSkill · Hiring workspace" title="Build a team that moves forward">
        <Badge variant="outline" className="gap-1.5 px-3 py-1.5"><ShieldCheck className="size-3.5" /> Consent-first talent discovery</Badge>
      </PageHeader>

      <section className="relative overflow-hidden rounded-2xl border border-border bg-card">
        <div className="absolute inset-y-0 right-0 hidden w-2/5 bg-gradient-to-l from-primary/10 to-transparent md:block" />
        <div className="relative grid gap-6 p-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:p-9">
          <div className="max-w-2xl space-y-3">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary"><Sparkles className="size-4" /> Human-first hiring</p>
            <h2 className="font-display text-3xl leading-tight md:text-4xl">Find potential. Start meaningful conversations.</h2>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">Explore professionals who have actively opted in to profile discovery. SoulSkill keeps private career work private and leaves every hiring decision with your team.</p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button onClick={() => setActiveView("talent")}><UserRoundSearch className="size-4" /> Explore discoverable talent</Button>
              <Button asChild variant="outline"><Link to="/settings">Workspace settings <ArrowRight className="size-4" /></Link></Button>
            </div>
          </div>
          <div className="hidden size-32 items-center justify-center rounded-full border border-primary/20 bg-primary/5 md:flex"><Users className="size-14 text-primary" strokeWidth={1.2} /></div>
        </div>
      </section>

      <div className="flex flex-wrap gap-2 border-b border-border pb-3" role="tablist" aria-label="Hiring workspace views">
        <button type="button" role="tab" aria-selected={activeView === "overview"} onClick={() => setActiveView("overview")} className={`rounded-full px-4 py-2 text-sm transition-colors ${activeView === "overview" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>Overview</button>
        <button type="button" role="tab" aria-selected={activeView === "talent"} onClick={() => setActiveView("talent")} className={`rounded-full px-4 py-2 text-sm transition-colors ${activeView === "talent" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>Talent discovery</button>
      </div>

      {activeView === "overview" ? (
        <div className="space-y-8">
          <section className="grid gap-4 sm:grid-cols-2">
            <Stat label="Discoverable professionals" value={talentQuery.isLoading ? "—" : String(talentQuery.data?.length ?? 0)} note="Profiles shared by their owners" />
            <Stat label="Private career records" value="Protected" note="Resumes, contact details and reflections stay private" />
          </section>
          <section className="space-y-4">
            <div><h2 className="font-display text-2xl">Your hiring workflow</h2><p className="mt-1 text-sm text-muted-foreground">A focused workspace for the work recruiters do every day.</p></div>
            <div className="grid gap-4 md:grid-cols-2">
              <WorkflowCard icon={Building2} title="Set up your hiring team" description="Define your company identity and who participates in hiring." status="Planned next" />
              <WorkflowCard icon={BriefcaseBusiness} title="Create a role brief" description="Capture responsibilities, must-have skills, location and experience expectations." status="Planned next" />
              <WorkflowCard icon={UserRoundSearch} title="Discover opted-in talent" description="Search public professional headlines without exposing private resumes or contact details." status="Available now" onClick={() => setActiveView("talent")} />
              <WorkflowCard icon={Users} title="Review and coordinate" description="Build human-reviewed shortlists, interview plans and decision records." status="Planned next" />
            </div>
          </section>
          <section className="rounded-xl border border-border p-5">
            <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" /><div><h2 className="font-semibold">A clear privacy boundary</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Talent discovery displays only a professional's name and headline when they have enabled discoverability. It does not reveal their saved resumes, phone number, email, salary expectations, journal, affirmations or private career reflections.</p></div></div>
          </section>
        </div>
      ) : (
        <section className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div><h2 className="font-display text-2xl">Discoverable professionals</h2><p className="mt-1 text-sm text-muted-foreground">Search the profiles people have chosen to make visible.</p></div>
            <div className="w-full sm:max-w-sm"><label htmlFor="talent-search" className="sr-only">Search professionals by name or headline</label><div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input id="talent-search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search name, role or skills…" className="pl-9" /></div></div>
          </div>
          {talentQuery.isLoading ? <p className="py-10 text-center text-sm text-muted-foreground">Loading opted-in profiles…</p> : null}
          {talentQuery.isError ? <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-5 text-sm"><p className="font-medium">We couldn't load the talent directory.</p><p className="mt-1 text-muted-foreground">Please try again in a moment. No private candidate data has been exposed.</p><Button className="mt-3" variant="outline" size="sm" onClick={() => void talentQuery.refetch()}>Try again</Button></div> : null}
          {!talentQuery.isLoading && !talentQuery.isError && filteredProfiles.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
              <UserRoundSearch className="mx-auto size-9 text-muted-foreground" />
              <h3 className="mt-4 font-display text-xl">{search.trim() ? "No matching professionals" : "Your talent directory is ready"}</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{search.trim() ? "Try a different name, role or skill keyword." : "When professionals enable profile discoverability, their name and headline will appear here. Their private resumes and contact information remain protected."}</p>
              {search.trim() ? <Button className="mt-4" variant="outline" onClick={() => setSearch("")}>Clear search</Button> : null}
            </div>
          ) : null}
          {filteredProfiles.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
              {filteredProfiles.map(profile => (
                <article key={profile.id} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-display text-lg text-primary">{(profile.full_name?.trim().charAt(0) || "P").toLocaleUpperCase()}</div>
                    <div className="min-w-0 flex-1"><h3 className="break-words font-semibold">{profile.full_name || "Professional"}</h3><p className="mt-1 break-words text-sm text-muted-foreground">{profile.headline || "Professional profile"}</p><p className="mt-3 text-xs text-muted-foreground">Profile shared by choice</p></div>
                    <Badge variant="outline">Opted in</Badge>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
          <p className="border-t border-border pt-4 text-xs leading-5 text-muted-foreground">Showing up to 100 recently updated discoverable profiles. This directory is not a ranking and does not infer candidate suitability. Contact and resume access are not part of this view.</p>
        </section>
      )}
    </div>
  );
}

function WorkflowCard({ icon: Icon, title, description, status, onClick }: {
  icon: typeof Users;
  title: string;
  description: string;
  status: "Available now" | "Planned next";
  onClick?: () => void;
}) {
  const content = (
    <div className="flex h-full items-start gap-4">
      <div className="rounded-lg bg-primary/10 p-2.5"><Icon className="size-5 text-primary" /></div>
      <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{title}</h3><Badge variant={status === "Available now" ? "default" : "secondary"}>{status}</Badge></div><p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p></div>
      {onClick ? <ArrowRight className="mt-1 size-4 shrink-0 text-primary" /> : null}
    </div>
  );
  return onClick ? <button type="button" onClick={onClick} className="rounded-xl border border-primary/30 bg-card p-5 text-left transition-colors hover:bg-muted">{content}</button> : <article className="rounded-xl border border-border bg-card p-5">{content}</article>;
}
