import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FileText, Target, ShieldCheck, Users, Briefcase, MessagesSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Brand } from "@/components/Brand";
import { useSession } from "@/lib/auth";
import heroAsset from "@/assets/hero-collaboration.webp.asset.json";
import jobDiscoveryAsset from "@/assets/job-discovery.webp.asset.json";
import coachingAsset from "@/assets/interview-coaching.webp.asset.json";

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "SoulSkill — Career intelligence for professionals & recruiters" },
      {
        name: "description",
        content:
          "Build a compelling career profile, sharpen your resume, and get discovered — only when you choose to be.",
      },
      { property: "og:title", content: "SoulSkill — Career intelligence by Soulvest.ai" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        property: "og:description",
        content: "Career profiles, resumes, interview prep and consent-based recruiting.",
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
const recruiter = [
  { icon: Briefcase, t: "Structured roles", d: "Create and manage openings with clear requirements." },
  { icon: Users, t: "Consent-based discovery", d: "Only candidates who opt in are ever visible." },
  { icon: ShieldCheck, t: "Humans decide", d: "No automated rejection. Shortlists stay in your hands." },
];

function Landing() {
  const { session } = useSession();
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Brand />
        <nav className="flex items-center gap-2">
          {session ? (
            <Button asChild variant="ink">
              <Link to="/app">Open workspace</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link to="/auth">Sign in</Link>
              </Button>
              <Button asChild variant="ink">
                <Link to="/auth" search={{ mode: "signup" }}>Get started</Link>
              </Button>
            </>
          )}
        </nav>
      </header>

      <section className="bg-hero">
        <div className="mx-auto max-w-6xl px-6 pb-24 pt-16 md:pt-28">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Career intelligence</p>
          <h1 className="mt-6 max-w-4xl font-display text-5xl leading-[1.02] text-foreground md:text-7xl">
            Your career, told clearly.
            <br />
            <em className="text-primary">Discovered on your terms.</em>
          </h1>
          <p className="mt-8 max-w-xl text-lg text-muted-foreground">
            SoulSkill helps professionals craft profiles and resumes that land — and gives recruiters a
            respectful, consent-based way to find them.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="ink">
              <Link to="/auth" search={{ mode: "signup" }}>
                I'm a professional <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/auth" search={{ mode: "signup", as: "recruiter" }}>I'm hiring</Link>
            </Button>
          </div>
          <figure className="mt-16 overflow-hidden rounded-2xl border border-border shadow-soft">
            <img
              src={heroAsset.url}
              alt="A team of professionals collaborating around a table in a bright modern office"
              width={1600}
              height={1008}
              className="aspect-[16/9] w-full object-cover"
            />
          </figure>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-16 px-6 py-24 md:grid-cols-2">
        {[
          { label: "For professionals", items: candidate, img: jobDiscoveryAsset, alt: "A professional exploring job opportunities on a laptop in a modern coworking lounge" },
          { label: "For recruiters", items: recruiter, img: coachingAsset, alt: "A career coach mentoring a professional one-on-one in a bright office" },
        ].map((col) => (
          <div key={col.label}>
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
            <h2 className="font-display text-3xl text-foreground">{col.label}</h2>
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
            </ul>
          </div>
        ))}
      </section>

      <section className="bg-ink text-ink-foreground">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="max-w-2xl font-display text-4xl">Privacy is the default, not a setting.</h2>
          <p className="mt-6 max-w-2xl text-ink-foreground/70">
            Your resumes and personal details stay private. Recruiters see you only after you opt into
            visibility — and you can withdraw consent or delete your account at any time.
          </p>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-6 py-10 text-sm text-muted-foreground">
        © {new Date().getFullYear()} Soulvest.ai · SoulSkill 3.0
      </footer>
    </div>
  );
}
