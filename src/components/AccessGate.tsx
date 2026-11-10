import type { ReactNode } from "react";
import { Link, useRouteContext } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccess } from "@/lib/billing-queries";
import { fullAccess } from "@/lib/pricing";

export function AccessGate({ feature, children }: { feature: string; children: ReactNode }) {
  const { user } = useRouteContext({ from: "/_authenticated" });
  const { data, isLoading } = useAccess(user.id);
  if (isLoading) return <p role="status" className="text-sm text-muted-foreground">Checking your access…</p>;
  if (data && fullAccess(data.category)) return <>{children}</>;
  return (
    <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
      <Lock className="mx-auto size-6 text-primary" />
      <h3 className="mt-3 font-display text-xl">{feature} is part of full access</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">Eligible job seekers get it free. Everyone else can unlock it with Premium from ₹99. Your saved work is always kept.</p>
      <Button asChild className="mt-4"><Link to="/billing">See plans & eligibility</Link></Button>
    </div>
  );
}
