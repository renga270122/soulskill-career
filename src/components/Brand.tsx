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

