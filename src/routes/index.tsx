import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FileText, Target, MessagesSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Brand } from "@/components/Brand";
import { PublicFooter } from "@/components/PublicPages";
import { useSession } from "@/lib/auth";
import heroAsset from "@/assets/hero-collaboration.webp.asset.json";
import jobDiscoveryAsset from "@/assets/job-discovery.webp.asset.json";
import { BeliefJourney } from "@/components/BeliefJourney";

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "SoulSkill — Believe in Your Potential. Build Your Future." },
      {
        name: "description",
        content:
          "An affordable AI-powered career platform for individual job seekers and professionals: build resumes, explore jobs and plan your next step.",
      },
      { property: "og:title", content: "SoulSkill — Believe in Your Potential. Build Your Future." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        property: "og:description",
        content: "AI-powered resume tools, ATS keyword matching, job discovery and career guidance for individuals.",
      },
    ],
  }),
  component: Landing,
});

const candidate = [
  { icon: FileText, t: "Resumes that read well", d: "Manage multiple resumes, templates and PDF export." },
  { icon: Target, t: "Match to the role", d: "Compare your experience against any job description." },
  { icon: MessagesSquare, t: "Prepare with intent", d: "Track applications and rehearse for interviews." },
];
function Landing() {
  const { session } = useSession();
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-5 py-5 md:flex md:justify-between md:px-6">
        <div className="min-w-0"><Brand /></div>
        <nav className="flex shrink-0 items-center gap-1">
          <Button asChild variant="ghost" className="hidden md:inline-flex"><Link to="/about">About</Link></Button>
          <Button asChild variant="ghost" className="hidden md:inline-flex"><Link to="/contact">Contact</Link></Button>
          {session ? (
            <Button asChild variant="ink">
              <Link to="/app">Open workspace</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" className="hidden sm:inline-flex">
                <Link to="/auth">Sign in</Link>
              </Button>
              <Button asChild variant="ink">
                <Link to="/auth" search={{ mode: "signup" }}>Get started</Link>
              </Button>
            </>
          )}
        </nav>
      </header>

      <section className="relative isolate overflow-hidden">
        <img src={heroAsset.url} alt="Professionals collaborating in a bright office" width={1600} height={1008} className="absolute inset-0 -z-20 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-background/90" />
        <div className="soul-enter mx-auto max-w-6xl px-6 py-16 md:py-24">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Manifest. Believe. Achieve.</p>
          <h1 className="mt-5 font-display text-6xl leading-tight text-foreground md:text-7xl">SoulSkill</h1>
          <p className="mt-5 max-w-3xl font-display text-4xl leading-tight text-foreground md:text-5xl">
            Believe in Your Potential.<br /><em>Build Your Future.</em>
          </p>
          <p className="mt-8 max-w-xl text-lg text-muted-foreground">
            Turn career clarity into confident action. Shape your resume, explore possibilities and take your next meaningful step — on your terms.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="ink">
              <Link to="/auth" search={{ mode: "signup" }}>
                Build my career <ArrowRight />
              </Link>
            </Button>

          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 pt-8"><BeliefJourney /></div>

      <section className="mx-auto max-w-6xl px-6 py-16">
        {[
          { label: "For professionals", items: candidate, img: jobDiscoveryAsset, alt: "A professional exploring job opportunities on a laptop in a modern coworking lounge" },
        ].map((col) => (
          <div key={col.label} className="grid items-start gap-10 md:grid-cols-2">
            <figure className="mb-8 overflow-hidden rounded-xl border border-border shadow-soft">
              <img
                src={col.img.url}
                alt={col.alt}
                width={1408}
                height={912}
                loading="lazy"
                className="aspect-[3/2] w-full object-cover"
              />
            </figure>
            <div><h2 className="font-display text-3xl text-foreground">{col.label}</h2>
            <ul className="mt-8 divide-y divide-border border-y border-border">
              {col.items.map(({ icon: Icon, t, d }) => (
                <li key={t} className="flex gap-4 py-6">
                  <Icon className="mt-1 size-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">{t}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{d}</p>
                  </div>
                </li>
              ))}
            </ul></div>
          </div>
        ))}
      </section>

      <section className="bg-ink text-ink-foreground">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="max-w-2xl font-display text-4xl">Privacy is the default, not a setting.</h2>
          <p className="mt-6 max-w-2xl text-ink-foreground/70">
            Your resumes, career details and personal reflections belong to your personal workspace.
            You choose when to export documents and share them outside SoulSkill.
          </p>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
