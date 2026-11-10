import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader, Panel } from "@/components/Dash";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PlanCards } from "@/components/PlanCards";
import { confirmCheckout, declareEligibility, startCheckout, withdrawEligibility } from "@/lib/billing.functions";
import { plansQuery, useAccess } from "@/lib/billing-queries";
import { ELIGIBILITY_CATEGORIES, renewalDue, rupees, type EligibilityCategory, type Plan } from "@/lib/pricing";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/_authenticated/billing")({
  staticData: { sitemap: false },
  head: () => pageMeta("Plans & billing", "Your SoulSkill access, eligibility, payments and renewal options."),
  component: BillingPage,
});

const fmt = (d?: string | null) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";
const label = { ELIGIBLE_FREE: "Career Support (eligible, free)", PREMIUM_PAID: "Premium (paid)", BASIC_FREE: "Basic (free)" } as const;

declare global { interface Window { Razorpay?: new (o: Record<string, unknown>) => { open: () => void; on: (e: string, cb: () => void) => void } } }
function loadRazorpay() {
  return new Promise<void>((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(); s.onerror = () => reject(new Error("Checkout could not load. Check your connection."));
    document.body.appendChild(s);
  });
}

function BillingPage() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const { data: access, isLoading, error } = useAccess(user.id);
  const { data: plans = [] } = useQuery(plansQuery);
  const declare = useServerFn(declareEligibility), withdraw = useServerFn(withdrawEligibility);
  const start = useServerFn(startCheckout), confirm = useServerFn(confirmCheckout);
  const [category, setCategory] = useState<EligibilityCategory | "">("");
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const refresh = () => qc.invalidateQueries({ queryKey: ["access", user.id] });

  if (isLoading) return <p role="status">Loading your plan…</p>;
  if (error || !access) return <p role="alert">Your plan details couldn't load. Please refresh.</p>;
  const elig = access.eligibility;
  const eligActive = access.category === "ELIGIBLE_FREE" || (elig?.declared && new Date(elig.expires_at) > new Date());
  const latestExpiry = access.latestEntitlement?.expires_at ?? null;
  const renewFrom = latestExpiry && new Date(latestExpiry) > new Date() ? new Date(latestExpiry) : new Date();

  async function submitDeclaration() {
    if (!category || !agreed) return;
    setBusy("declare");
    try { await declare({ data: { category, confirmed: true } }); toast.success("Career Support access is active."); await refresh(); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Could not save"); }
    finally { setBusy(null); }
  }
  async function buy(plan: Plan) {
    setBusy(plan.id);
    try {
      await loadRazorpay();
      const order = await start({ data: { planId: plan.id } });
      const rz = new window.Razorpay!({
        key: order.keyId, order_id: order.orderId, amount: order.amount, currency: "INR",
        name: "SoulSkill", description: `Premium · ${order.planName}`, prefill: { email: order.email }, theme: { color: "#B89558" },
        handler: async (r: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            const ent = await confirm({ data: { orderId: r.razorpay_order_id, paymentId: r.razorpay_payment_id, signature: r.razorpay_signature } });
            toast.success(`Payment confirmed. Premium is active until ${fmt(ent?.expires_at)}.`);
          } catch (e) { toast.error(e instanceof Error ? e.message : "Verification pending"); }
          await refresh(); setBusy(null);
        },
        modal: { ondismiss: () => setBusy(null) },
      });
      rz.on("payment.failed", () => { toast.error("Payment failed. You have not been charged."); setBusy(null); });
      rz.open();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Checkout could not start"); setBusy(null); }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader eyebrow="Account" title="Plans & billing" />
      {access.category === "ELIGIBLE_FREE" && <p className="rounded-2xl border border-primary bg-card p-5 font-display text-lg text-foreground">Your SoulSkill Career Support access is active. Keep building your future.</p>}
      <Panel title="Your access">
        <dl className="grid gap-4 text-sm sm:grid-cols-3">
          <div><dt className="text-muted-foreground">Access category</dt><dd className="font-medium text-foreground">{access.category}</dd></div>
          <div><dt className="text-muted-foreground">Current plan</dt><dd className="font-medium text-foreground">{access.category === "PREMIUM_PAID" ? `Premium · ${access.currentEntitlement?.plan_name}` : label[access.category]}</dd></div>
          <div><dt className="text-muted-foreground">Payment status</dt><dd className="font-medium text-foreground">{access.category === "PREMIUM_PAID" ? "Paid" : access.category === "ELIGIBLE_FREE" ? "No payment needed" : "No active payment"}</dd></div>
          <div><dt className="text-muted-foreground">Start date</dt><dd className="text-foreground">{fmt(access.category === "PREMIUM_PAID" ? access.currentEntitlement?.starts_at : access.category === "ELIGIBLE_FREE" ? elig?.declared_at : null)}</dd></div>
          <div><dt className="text-muted-foreground">Expiry date</dt><dd className="text-foreground">{fmt(access.category === "PREMIUM_PAID" ? latestExpiry : access.category === "ELIGIBLE_FREE" ? elig?.expires_at : null)}</dd></div>
          <div><dt className="text-muted-foreground">AI actions this month</dt><dd className="text-foreground">{access.category === "BASIC_FREE" ? "Not included" : `${access.aiUsed} of ${access.aiLimit}`}</dd></div>
        </dl>
        {access.category === "PREMIUM_PAID" && renewalDue(latestExpiry) && <p className="mt-4 text-sm text-primary">Your Premium access ends soon. Renew below — new time is added after your current expiry. Nothing renews automatically.</p>}
        {access.category === "BASIC_FREE" && latestExpiry && <p className="mt-4 text-sm text-muted-foreground">Your Premium access ended on {fmt(latestExpiry)}. All your resumes and applications are still saved.</p>}
      </Panel>

      <Panel title="Career Support eligibility">
        {eligActive && elig ? (
          <div className="space-y-3 text-sm">
            <p>You declared: <strong>{ELIGIBILITY_CATEGORIES.find(c => c.id === elig.category)?.label}</strong> on {fmt(elig.declared_at)}. Free access runs until {fmt(elig.expires_at)}.</p>
            <p className="text-muted-foreground">Made a mistake? Choose a different category below to correct it, or withdraw your declaration.</p>
            <Button variant="outline" size="sm" disabled={busy === "withdraw"} onClick={async () => { setBusy("withdraw"); try { await withdraw(); toast.success("Declaration withdrawn"); await refresh(); } finally { setBusy(null); } }}>Withdraw declaration</Button>
          </div>
        ) : <p className="text-sm text-muted-foreground">Fresh graduates, first-time job seekers and people affected by layoffs get full access free for 6 months. No documents needed — just a self-declaration. We store only your category and the date you declared.</p>}
        <div className="mt-5 space-y-4">
          <RadioGroup value={category} onValueChange={v => setCategory(v as EligibilityCategory)} className="grid gap-2 sm:grid-cols-3">
            {ELIGIBILITY_CATEGORIES.map(c => <Label key={c.id} htmlFor={c.id} className="flex cursor-pointer items-center gap-2 rounded-xl border border-border p-3"><RadioGroupItem id={c.id} value={c.id} />{c.label}</Label>)}
          </RadioGroup>
          <Label className="flex items-start gap-2 text-sm font-normal"><Checkbox checked={agreed} onCheckedChange={v => setAgreed(v === true)} className="mt-0.5" />I confirm this information is true to the best of my knowledge.</Label>
          <Button disabled={!category || !agreed || busy === "declare"} onClick={submitDeclaration}>{eligActive ? "Update my category" : "Activate free Career Support"}</Button>
        </div>
      </Panel>

      <section className="space-y-4">
        <h2 className="font-display text-2xl text-foreground">{access.category === "PREMIUM_PAID" ? "Renewal options" : "Premium plans"}</h2>
        <p className="text-sm text-muted-foreground">One-time payment through Razorpay. No recurring charges or automatic deductions.{access.category === "ELIGIBLE_FREE" && " You already have full access free — Premium is optional."}</p>
        <PlanCards plans={plans} startFrom={renewFrom} action={plan => <Button className="w-full" disabled={!!busy} onClick={() => buy(plan)}>{busy === plan.id ? "Opening checkout…" : `Pay ${rupees(plan.price_paise)}`}</Button>} />
      </section>

      <Panel title="Payment history">
        {access.payments.length === 0 ? <p className="text-sm text-muted-foreground">No payments yet.</p> : (
          <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-muted-foreground"><tr><th className="py-2 pr-4">Date</th><th className="pr-4">Plan</th><th className="pr-4">Amount</th><th className="pr-4">Status</th><th>Payment ID</th></tr></thead>
            <tbody>{access.payments.map(p => <tr key={p.id} className="border-t border-border"><td className="py-2 pr-4">{fmt(p.paid_at ?? p.created_at)}</td><td className="pr-4">{p.plan_name}</td><td className="pr-4">{rupees(p.amount_paise)}</td><td className="pr-4">{p.status === "paid" ? "Paid" : p.status === "failed" ? "Failed" : "Not completed"}</td><td className="font-mono text-xs">{p.razorpay_payment_id ?? "—"}</td></tr>)}</tbody></table></div>
        )}
      </Panel>
    </div>
  );
}
