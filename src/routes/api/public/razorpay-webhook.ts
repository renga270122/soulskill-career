import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const event = z.object({ event: z.string(), payload: z.object({ payment: z.object({ entity: z.object({ id: z.string(), order_id: z.string().nullable() }) }).optional() }) });

export const Route = createFileRoute("/api/public/razorpay-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["RAZORPAY_WEBHOOK_SECRET"];
        const signature = request.headers.get("x-razorpay-signature") ?? "";
        const body = await request.text();
        if (!secret) return new Response("Not configured", { status: 503 });
        const { verifyHmac } = await import("@/lib/razorpay.server");
        if (!(await verifyHmac(secret, body, signature))) return new Response("Invalid signature", { status: 401 });
        const parsed = event.safeParse(JSON.parse(body));
        if (!parsed.success) return new Response("ignored");
        const payment = parsed.data.payload.payment?.entity;
        if (!["payment.captured", "order.paid"].includes(parsed.data.event) || !payment?.order_id) return new Response("ignored");
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        // activate_paid_order locks the order row and is a no-op for already-paid orders (idempotent).
        const { error } = await supabaseAdmin.rpc("activate_paid_order", { _razorpay_order_id: payment.order_id, _razorpay_payment_id: payment.id });
        if (error && !error.message.includes("Order not found")) return new Response("retry", { status: 500 });
        return new Response("ok");
      },
    },
  },
});
