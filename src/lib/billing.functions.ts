import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { resolveAccess, AI_MONTHLY_LIMIT, type Plan } from "./pricing";

export const getPlans = createServerFn({ method: "GET" }).handler(async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const sb = createClient(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => { const h = new Headers(init?.headers); if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization"); h.set("apikey", key); return fetch(input, { ...init, headers: h }); } },
  });
  const { data, error } = await sb.from("premium_plans").select("id,name,price_paise,duration_days,badge,sort_order").eq("active", true).order("sort_order");
  if (error) throw new Error("Plans could not load");
  return data as Plan[];
});

export const getAccess = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { supabase, userId } = context;
  const month = new Date().toISOString().slice(0, 7);
  const [elig, ents, pays, usage] = await Promise.all([
    supabase.from("eligibility_declarations").select("category,declared,declared_at,expires_at").eq("user_id", userId).maybeSingle(),
    supabase.from("premium_entitlements").select("plan_name,starts_at,expires_at").eq("user_id", userId).order("expires_at", { ascending: false }),
    supabase.from("payment_orders").select("id,plan_name,amount_paise,status,created_at,paid_at,razorpay_payment_id").eq("user_id", userId).order("created_at", { ascending: false }).limit(50),
    supabase.from("ai_usage").select("used").eq("user_id", userId).eq("month", month).maybeSingle(),
  ]);
  if (elig.error || ents.error || pays.error || usage.error) throw new Error("Your plan details could not load");
  const category = resolveAccess({ eligibility: elig.data, entitlements: ents.data ?? [] });
  const now = new Date();
  const current = (ents.data ?? []).find(e => new Date(e.starts_at) <= now && new Date(e.expires_at) > now) ?? null;
  const latest = ents.data?.[0] ?? null;
  return { category, eligibility: elig.data, currentEntitlement: current, latestEntitlement: latest, payments: pays.data ?? [], aiUsed: usage.data?.used ?? 0, aiLimit: AI_MONTHLY_LIMIT };
});

export const declareEligibility = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator(z.object({ category: z.enum(["fresh_graduate", "first_time_job_seeker", "layoff_affected"]), confirmed: z.literal(true) }))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.rpc("declare_eligibility", { _category: data.category });
    if (error) throw new Error("Your declaration could not be saved");
    return { ok: true };
  });

export const withdrawEligibility = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { error } = await context.supabase.rpc("withdraw_eligibility");
  if (error) throw new Error("Your declaration could not be updated");
  return { ok: true };
});

export const startCheckout = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator(z.object({ planId: z.string().min(1).max(40) }))
  .handler(async ({ context, data }) => {
    const { data: plan, error } = await context.supabase.from("premium_plans").select("*").eq("id", data.planId).eq("active", true).maybeSingle();
    if (error || !plan) throw new Error("That plan is not available");
    const { createRazorpayOrder } = await import("./razorpay.server");
    const order = await createRazorpayOrder(plan.price_paise, `ss_${Date.now()}`, { user_id: context.userId, plan_id: plan.id });
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error: insErr } = await supabaseAdmin.from("payment_orders").insert({ user_id: context.userId, plan_id: plan.id, plan_name: plan.name, duration_days: plan.duration_days, amount_paise: plan.price_paise, razorpay_order_id: order.orderId });
    if (insErr) throw new Error("Checkout could not start. You have not been charged.");
    return { orderId: order.orderId, keyId: order.keyId, amount: plan.price_paise, planName: plan.name, email: (context.claims as { email?: string }).email ?? "" };
  });

export const confirmCheckout = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator(z.object({ orderId: z.string().min(5).max(80), paymentId: z.string().min(5).max(80), signature: z.string().regex(/^[a-f0-9]{64}$/) }))
  .handler(async ({ context, data }) => {
    const { razorpayKeys, verifyHmac } = await import("./razorpay.server");
    if (!(await verifyHmac(razorpayKeys().keySecret, `${data.orderId}|${data.paymentId}`, data.signature))) throw new Error("Payment could not be verified. If money was deducted, it will be confirmed automatically or refunded by Razorpay.");
    const { data: own } = await context.supabase.from("payment_orders").select("id").eq("razorpay_order_id", data.orderId).maybeSingle();
    if (!own) throw new Error("Order not found");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.rpc("activate_paid_order", { _razorpay_order_id: data.orderId, _razorpay_payment_id: data.paymentId });
    if (error) throw new Error("Payment received but activation is pending. It will update shortly.");
    const { data: ent } = await context.supabase.from("premium_entitlements").select("plan_name,starts_at,expires_at").eq("order_id", own.id).single();
    return ent;
  });
