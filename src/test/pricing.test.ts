import { describe, expect, it } from "vitest";
import { createHmac } from "node:crypto";
import { effectiveMonthlyPaise, expiryFrom, resolveAccess, savingsVsMonthly, renewalDue } from "@/lib/pricing";
import { verifyHmac } from "@/lib/razorpay.server";

const monthly = { price_paise: 9900, duration_days: 30 };
const plans = { quarterly: { price_paise: 29900, duration_days: 90 }, half: { price_paise: 49900, duration_days: 180 }, annual: { price_paise: 69900, duration_days: 365 } };

describe("premium durations", () => {
  it("monthly ₹99 lasts 30 days", () => expect(expiryFrom(new Date("2026-01-01T00:00:00Z"), 30).toISOString()).toBe("2026-01-31T00:00:00.000Z"));
  it("quarterly ₹299 saves nothing vs 3×₹99", () => expect(savingsVsMonthly(plans.quarterly, monthly).paise).toBe(0));
  it("half-yearly ₹499 saves ₹95 vs 6×₹99", () => expect(savingsVsMonthly(plans.half, monthly).paise).toBe(9500));
  it("annual ₹699 is about ₹57/month", () => expect(effectiveMonthlyPaise(plans.annual)).toBe(5745));
});

describe("access categories", () => {
  const now = new Date("2026-06-01T00:00:00Z");
  it("active paid entitlement is PREMIUM_PAID", () => expect(resolveAccess({ entitlements: [{ starts_at: "2026-05-01T00:00:00Z", expires_at: "2026-06-30T00:00:00Z" }] }, now)).toBe("PREMIUM_PAID"));
  it("expired paid entitlement reverts to basic", () => expect(resolveAccess({ entitlements: [{ starts_at: "2026-04-01T00:00:00Z", expires_at: "2026-05-01T00:00:00Z" }] }, now)).toBe("BASIC_FREE"));
  it("valid declaration is ELIGIBLE_FREE", () => expect(resolveAccess({ eligibility: { declared: true, expires_at: "2026-11-01T00:00:00Z" }, entitlements: [] }, now)).toBe("ELIGIBLE_FREE"));
  it("withdrawn declaration is basic", () => expect(resolveAccess({ eligibility: { declared: false, expires_at: "2026-11-01T00:00:00Z" }, entitlements: [] }, now)).toBe("BASIC_FREE"));
  it("renewal prompt shows within 7 days of expiry", () => { expect(renewalDue("2026-06-05T00:00:00Z", now)).toBe(true); expect(renewalDue("2026-07-05T00:00:00Z", now)).toBe(false); });
});

describe("razorpay signatures", () => {
  it("accepts the correct signature and rejects a tampered one", async () => {
    const sig = createHmac("sha256", "secret").update("order_1|pay_1").digest("hex");
    expect(await verifyHmac("secret", "order_1|pay_1", sig)).toBe(true);
    expect(await verifyHmac("secret", "order_1|pay_2", sig)).toBe(false);
  });
});
