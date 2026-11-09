import { Quote, Sun, Sparkles } from "lucide-react";
import { DemoBadge } from "@/components/Brand";

export function DailyInspiration() {
  return <div className="grid gap-5 md:grid-cols-[1.3fr_1fr]">
    <article className="rounded-xl border border-border bg-secondary p-6 md:p-8">
      <div className="flex items-center justify-between gap-3"><span className="flex items-center gap-2 text-xs font-semibold uppercase"><Quote className="size-4 text-primary" /> Quote of the Day</span><DemoBadge /></div>
      <blockquote className="mt-5 max-w-lg font-display text-3xl leading-snug">“Your next chapter begins with the courage to take one meaningful step.”</blockquote>
      <p className="mt-4 text-xs text-muted-foreground">— SoulSkill · Original inspiration</p>
    </article>
    <article className="rounded-xl border border-border bg-accent p-6 md:p-8">
      <div className="flex items-center justify-between gap-3"><span className="flex items-center gap-2 text-xs font-semibold uppercase"><Sun className="size-4" /> Daily Affirmation</span><Sparkles className="size-4 text-accent-foreground" /></div>
      <p className="mt-5 font-display text-3xl leading-snug">I am confident, capable and ready for meaningful opportunities.</p>
      <div className="mt-4"><DemoBadge /></div>
    </article>
  </div>;
}