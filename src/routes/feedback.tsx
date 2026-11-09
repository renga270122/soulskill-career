import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { PublicPage } from "@/components/PublicPages";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/feedback")({
  staticData: { sitemap: true },
  head: () => ({ meta: [
    { title: "Feedback & bug reports — SoulSkill" },
    { name: "description", content: "Share feedback or report a bug to help improve SoulSkill." },
    { property: "og:title", content: "Feedback & bug reports — SoulSkill" },
    { property: "og:description", content: "Tell the SoulSkill team what works, what doesn't and what to build next." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: FeedbackPage,
});

const schema = z.object({
  kind: z.enum(["feedback", "bug"]),
  message: z.string().trim().min(5, "Please write at least 5 characters").max(2000, "Keep it under 2000 characters"),
  email: z.union([z.literal(""), z.string().trim().email("Enter a valid email").max(255)]),
  page: z.string().trim().max(200),
});

const field = "mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground";

function FeedbackPage() {
  const [form, setForm] = useState({ kind: "feedback", message: "", email: "", page: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const parsed = schema.safeParse(form);
    if (!parsed.success) return setError(parsed.error.issues[0].message);
    setStatus("sending");
    const { data } = await supabase.auth.getSession();
    const v = parsed.data;
    const { error: err } = await supabase.from("feedback").insert({
      kind: v.kind, message: v.message, email: v.email || null, page: v.page || null,
      user_id: data.session?.user.id ?? null,
    });
    if (err) { setStatus("idle"); return setError("Couldn't send right now. Please try again."); }
    setStatus("sent");
  }

  return <PublicPage title="Feedback & bugs" intro="Tell us what's working, what isn't, or what you'd love to see next.">
    {status === "sent" ? <section><h2>Thank you!</h2><p>Your message has reached the SoulSkill team.</p>
      <div className="mt-6"><Button variant="ink" onClick={() => { setForm({ kind: "feedback", message: "", email: "", page: "" }); setStatus("idle"); }}>Send another</Button></div></section> :
    <form onSubmit={submit} className="space-y-5">
      <label className="block text-foreground">Type
        <select className={field} value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>
          <option value="feedback">Feedback or idea</option><option value="bug">Report a bug</option>
        </select></label>
      <label className="block text-foreground">Message
        <textarea required rows={6} maxLength={2000} className={field} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder={form.kind === "bug" ? "What happened, and what did you expect?" : "Your thoughts…"} /></label>
      {form.kind === "bug" && <label className="block text-foreground">Which page? (optional)
        <input maxLength={200} className={field} value={form.page} onChange={(e) => setForm({ ...form, page: e.target.value })} placeholder="e.g. Resume Studio" /></label>}
      <label className="block text-foreground">Email for a reply (optional)
        <input type="email" maxLength={255} className={field} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
      <p className="text-sm">Please don't include passwords or sensitive personal details.</p>
      {error && <p role="alert" className="text-destructive">{error}</p>}
      <Button type="submit" variant="ink" disabled={status === "sending"}>{status === "sending" ? "Sending…" : "Send"}</Button>
    </form>}
  </PublicPage>;
}
