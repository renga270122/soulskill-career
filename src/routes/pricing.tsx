import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Brand } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { PublicFooter } from "@/components/PublicPages";
import { BASIC_FEATURES, FeatureList, FULL_FEATURES, PlanCards } from "@/components/PlanCards";
import { plansQuery } from "@/lib/billing-queries";
import { AI_MONTHLY_LIMIT } from "@/lib/pricing";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/pricing")({
  staticData: { sitemap: true },
  head: () => pageMeta("Pricing", "Free full access for fresh graduates, first-time job seekers and people affected by layoffs. Premium from ₹99, no auto-renewal."),
  loader: ({ context }) => context.queryClient.ensureQueryData(plansQuery),
  component: PricingPage,
});

function PricingPage() {
  const { data: plans } = useSuspenseQuery(plansQuery);
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border"><div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-6"><Brand /><Button asChild variant="ink"><Link to="/auth">Sign in</Link></Button></div></header>
      <main className="mx-auto w-full max-w-6xl flex-1 space-y-16 px-6 py-16 md:py-24">
        <section className="max-w-3xl">
          <p className="text-xs font-semibold uppercase text-primary">Our social-impact commitment</p>
          <h1 className="mt-4 font-display text-4xl text-foreground md:text-6xl">Your Career Shouldn't Be Limited by Your Wallet.</h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">Whether you're starting your first job or rebuilding after a layoff, SoulSkill is here to support your journey.</p>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-primary bg-card p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase text-primary">Career Support · ₹0</p>
            <h2 className="mt-2 font-display text-2xl text-foreground">Free for eligible job seekers</h2>
            <p className="mt-2 text-muted-foreground">Start your career journey with us. Eligible job seekers receive complete access at no cost.</p>
            <p className="mt-3 text-sm text-muted-foreground">For fresh graduates, first-time job seekers and professionals affected by layoffs. A simple self-declaration — no documents. Access lasts 6 months and can be re-confirmed; you are never charged automatically.</p>
            <div className="mt-5"><FeatureList items={FULL_FEATURES} /></div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase text-primary">Premium · from ₹99</p>
            <h2 className="mt-2 font-display text-2xl text-foreground">Affordable career support for every professional.</h2>
            <p className="mt-2 text-muted-foreground">The same complete toolkit as Career Support, for a fixed period you choose.</p>
            <div className="mt-5"><FeatureList items={FULL_FEATURES} /></div>
          </div>
        </section>

        <section>
          <h2 className="font-display text-3xl text-foreground">Premium durations</h2>
          <p className="mt-2 text-muted-foreground">One-time payments via Razorpay. No recurring charges, no automatic deductions — renew only when you choose.</p>
          <div className="mt-8"><PlanCards plans={plans} action={() => <Button asChild className="w-full"><Link to="/auth">Get started</Link></Button>} /></div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-6"><h3 className="font-display text-xl text-foreground">Basic (free for everyone)</h3><div className="mt-4"><FeatureList items={BASIC_FEATURES} /></div></div>
          <div className="rounded-2xl border border-border bg-card p-6 md:col-span-2 text-muted-foreground">
            <h3 className="font-display text-xl text-foreground">Fair use and your data</h3>
            <p className="mt-3">To keep costs low for everyone, Career Support and Premium include {AI_MONTHLY_LIMIT} AI actions per month (resume suggestions, document import and coaching). The limit resets on the 1st. Everything else is unlimited.</p>
            <p className="mt-3">When access ends, your resumes, applications and journals stay saved — you simply return to the Basic plan until you renew or re-confirm eligibility.</p>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
