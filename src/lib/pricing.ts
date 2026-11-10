// Shared, browser-safe pricing and access rules. The database remains the source of prices and entitlements.
export type Plan = { id: string; name: string; price_paise: number; duration_days: number; badge: string | null; sort_order: number };
export type AccessCategory = "ELIGIBLE_FREE" | "PREMIUM_PAID" | "BASIC_FREE";
export const AI_MONTHLY_LIMIT = 50;
export const ELIGIBILITY_DAYS = 180;
export const BASIC_TEMPLATES = ["classic", "modern"] as const;
export const BASIC_RESUME_LIMIT = 1;
export const ELIGIBILITY_CATEGORIES = [
  { id: "fresh_graduate", label: "Fresh graduate" },
  { id: "first_time_job_seeker", label: "First-time job seeker" },
  { id: "layoff_affected", label: "Affected by a layoff" },
] as const;
export type EligibilityCategory = (typeof ELIGIBILITY_CATEGORIES)[number]["id"];

export const rupees = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
export function effectiveMonthlyPaise(p: Pick<Plan, "price_paise" | "duration_days">) {
  return Math.round((p.price_paise / p.duration_days) * 30);
}
export function savingsVsMonthly(p: Pick<Plan, "price_paise" | "duration_days">, monthly: Pick<Plan, "price_paise" | "duration_days">) {
  const equivalent = Math.round(monthly.price_paise * (p.duration_days / monthly.duration_days));
  const paise = Math.max(0, equivalent - p.price_paise);
  return { paise, percent: equivalent ? Math.round((paise / equivalent) * 100) : 0 };
}
export function expiryFrom(start: Date, durationDays: number) {
  return new Date(start.getTime() + durationDays * 86_400_000);
}
export function resolveAccess(input: { eligibility?: { declared: boolean; expires_at: string } | null; entitlements: { starts_at: string; expires_at: string }[] }, now = new Date()): AccessCategory {
  if (input.entitlements.some(e => new Date(e.starts_at) <= now && new Date(e.expires_at) > now)) return "PREMIUM_PAID";
  if (input.eligibility?.declared && new Date(input.eligibility.expires_at) > now) return "ELIGIBLE_FREE";
  return "BASIC_FREE";
}
export const fullAccess = (c: AccessCategory) => c !== "BASIC_FREE";
export const RENEWAL_WINDOW_DAYS = 7;
export function renewalDue(expiresAt: string | null, now = new Date()) {
  return !!expiresAt && new Date(expiresAt).getTime() - now.getTime() < RENEWAL_WINDOW_DAYS * 86_400_000;
}
