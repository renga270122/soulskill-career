import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brand } from "@/components/Brand";

type Search = { mode?: "signin" | "signup" | undefined; as?: "candidate" | "recruiter" | undefined };

export const Route = createFileRoute("/auth")({
  staticData: { sitemap: false },
  validateSearch: (s: Record<string, unknown>): Search => ({
    mode: s["mode"] === "signup" ? "signup" : undefined,
    as: s["as"] === "recruiter" ? "recruiter" : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — SoulSkill" },
      { name: "description", content: "Sign in or create your SoulSkill account." },
      { property: "og:title", content: "Sign in — SoulSkill" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:description", content: "Access your SoulSkill workspace." },
    ],
  }),
  component: AuthPage,
});

function GoogleLogo() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.930-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.060 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.310 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>
  );
}

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">(search.mode ?? "signin");
  const [accountType, setAccountType] = useState<"candidate" | "recruiter">(search.as ?? "candidate");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/app", replace: true });
    });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => {
      if (s) navigate({ to: "/app", replace: true });
    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + "/app",
            data: { full_name: fullName, account_type: accountType },
          },
        });
        if (error) throw error;
        setSent(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function signInWithGoogle() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (r.error) toast.error(r.error.message ?? "Sign-in failed");
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <aside className="hidden flex-col justify-between bg-ink p-12 text-ink-foreground md:flex">
        <span className="font-display text-2xl">SoulSkill</span>
        <blockquote className="font-display text-4xl leading-tight">
          “The right opportunity finds you when your story is clear.”
        </blockquote>
        <p className="text-sm text-ink-foreground/60">Private by default. Visible only with your consent.</p>
      </aside>
      <main className="flex flex-col px-6 py-8">
        <div className="md:hidden"><Brand /></div>
        <div className="m-auto w-full max-w-sm py-10">
          {sent ? (
            <div>
              <h1 className="font-display text-4xl text-foreground">Check your inbox</h1>
              <p className="mt-4 text-muted-foreground">
                We sent a confirmation link to <strong className="text-foreground">{email}</strong>. Open it to
                finish creating your account.
              </p>
            </div>
          ) : (
            <>
              <h1 className="font-display text-4xl text-foreground">
                {mode === "signup" ? "Create your account" : "Welcome back"}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {mode === "signup" ? "Already have an account? " : "New to SoulSkill? "}
                <button
                  type="button"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                  onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
                >
                  {mode === "signup" ? "Sign in" : "Create one"}
                </button>
              </p>

              {mode === "signup" && (
                <div className="mt-8 grid grid-cols-2 gap-2 rounded-lg bg-secondary p-1" role="radiogroup" aria-label="Account type">
                  {(["candidate", "recruiter"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      role="radio"
                      aria-checked={accountType === t}
                      onClick={() => setAccountType(t)}
                      className={`rounded-md py-2 text-sm font-medium transition ${accountType === t ? "bg-card text-foreground shadow-soft" : "text-muted-foreground"}`}
                    >
                      {t === "candidate" ? "Professional" : "Recruiter"}
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-6 space-y-3">
                <Button type="button" variant="outline" className="h-10 w-full" onClick={signInWithGoogle}>
                  <GoogleLogo /> Continue with Google
                </Button>
                {mode === "signup" && (
                  <p className="text-xs text-muted-foreground">Social sign-up creates a professional account.</p>
                )}
              </div>

              <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
                <span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" />
              </div>

              <form onSubmit={submit} className="space-y-4">
                {mode === "signup" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Full name</Label>
                    <Input id="name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" variant="ink" className="h-10 w-full" disabled={busy}>
                  {busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
                </Button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
