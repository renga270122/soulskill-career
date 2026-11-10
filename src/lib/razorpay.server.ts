const enc = new TextEncoder();
async function hmacHex(secret: string, message: string) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, "0")).join("");
}
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
export async function verifyHmac(secret: string, message: string, signature: string) {
  return safeEqual(await hmacHex(secret, message), signature);
}
export function razorpayKeys() {
  const keyId = process.env["RAZORPAY_KEY_ID"], keySecret = process.env["RAZORPAY_KEY_SECRET"];
  if (!keyId || !keySecret) throw new Error("Payments are not set up yet. Please try again later.");
  return { keyId, keySecret };
}
export async function createRazorpayOrder(amountPaise: number, receipt: string, notes: Record<string, string>) {
  const { keyId, keySecret } = razorpayKeys();
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}` },
    body: JSON.stringify({ amount: amountPaise, currency: "INR", receipt, notes }),
  });
  if (!res.ok) { console.error("Razorpay order failed", res.status, await res.text()); throw new Error("Checkout could not start. You have not been charged."); }
  const body = (await res.json()) as { id: string; amount: number };
  return { orderId: body.id, keyId };
}
