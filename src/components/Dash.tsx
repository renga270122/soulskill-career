import type { ReactNode } from "react";
import { DemoBadge } from "@/components/Brand";

export function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">{eyebrow}</p>
        <h1 className="mt-3 font-display text-4xl text-foreground md:text-5xl">{title}</h1>
      </div>
      {children}
    </div>
  );
}

export function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-soft">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-3 font-display text-4xl text-foreground">{value}</p>
      {note && <p className="mt-1 text-xs text-muted-foreground">{note}</p>}
    </div>
  );
}

export function Panel({ title, demo, children }: { title: string; demo?: boolean; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-card p-6 shadow-soft">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="font-semibold text-foreground">{title}</h2>
        {demo && <DemoBadge />}
      </div>
      {children}
    </section>
  );
}
