import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { effectiveMonthlyPaise, expiryFrom, rupees, savingsVsMonthly, type Plan } from "@/lib/pricing";

export const FULL_FEATURES = ["All eight premium resume templates", "AI resume creation and improvement", "ATS keyword analysis", "Job-specific resume tailoring", "Multiple resume versions", "Job discovery and application tracking", "Interview preparation and AI career coach", "Skill-gap and career guidance"];
export const BASIC_FEATURES = ["Classic and Modern templates", "One resume with PDF and Word export", "Career profile", "Job discovery and application tracking", "Vision board, journal and action plan"];

export function PlanCards({ plans, startFrom = new Date(), action }: { plans: Plan[]; startFrom?: Date; action?: (plan: Plan) => ReactNode }) {
  const monthly = plans.find(p => p.id === "monthly") ?? plans[0];
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {plans.map(plan => {
        const save = monthly && plan.id !== monthly.id ? savingsVsMonthly(plan, monthly) : null;
        return (
          <article key={plan.id} className={`relative flex flex-col rounded-2xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md ${plan.badge ? "border-primary" : "border-border"}`}>
            {plan.badge && <Badge className="absolute -top-3 left-5">{plan.badge}</Badge>}
            <h3 className="font-display text-xl text-foreground">{plan.name}</h3>
            <p className="mt-3 text-3xl font-semibold text-foreground">{rupees(plan.price_paise)}</p>
            <p className="text-sm text-muted-foreground">{plan.duration_days} days · one-time payment</p>
            <dl className="mt-4 space-y-1 text-sm text-muted-foreground">
              <div className="flex justify-between gap-2"><dt>Effective monthly</dt><dd className="text-foreground">{rupees(effectiveMonthlyPaise(plan))}</dd></div>
              <div className="flex justify-between gap-2"><dt>You save</dt><dd className="text-foreground">{save && save.paise > 0 ? `${rupees(save.paise)} (${save.percent}%)` : "—"}</dd></div>
              <div className="flex justify-between gap-2"><dt>Valid until</dt><dd className="text-foreground">{expiryFrom(startFrom, plan.duration_days).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</dd></div>
            </dl>
            {action && <div className="mt-5 pt-1">{action(plan)}</div>}
          </article>
        );
      })}
    </div>
  );
}

export function FeatureList({ items }: { items: string[] }) {
  return <ul className="space-y-2 text-sm">{items.map(i => <li key={i} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-primary" /><span>{i}</span></li>)}</ul>;
}
