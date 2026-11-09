import { Link } from "@tanstack/react-router";

export function Brand() {
  return (
    <Link to="/" className="flex items-baseline gap-2">
      <span className="font-display text-2xl text-foreground">SoulSkill</span>
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        by Soulvest.ai
      </span>
    </Link>
  );
}

export function DemoBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-demo px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-demo-foreground">
      Demo data
    </span>
  );
}
