import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Brand } from "@/components/Brand";
import { Button } from "@/components/ui/button";

export function PublicFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-6 py-10 text-sm text-muted-foreground">
        <p>@2026 SoulSkill</p>
        <nav aria-label="Footer" className="flex flex-wrap gap-6">
          <Link to="/about" className="transition-colors hover:text-foreground">About</Link>
          <Link to="/contact" className="transition-colors hover:text-foreground">Contact</Link>
          <Link to="/privacy" className="transition-colors hover:text-foreground">Privacy</Link>
          <Link to="/feedback" className="transition-colors hover:text-foreground">Feedback</Link>
        </nav>
      </div>
    </footer>
  );
}

export function PublicPage({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border">
        <div className="mx-auto grid max-w-6xl gap-4 px-6 py-6 sm:flex sm:items-center sm:justify-between">
          <Brand />
          <nav aria-label="Main navigation" className="flex flex-wrap items-center gap-1">
            <Button asChild variant="ghost"><Link to="/">Home</Link></Button>
            <Button asChild variant="ghost"><Link to="/about">About</Link></Button>
            <Button asChild variant="ghost"><Link to="/contact">Contact</Link></Button>
            <Button asChild variant="ink"><Link to="/auth">Sign in</Link></Button>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-16 md:py-24">
        <p className="text-xs font-semibold uppercase text-primary">SoulSkill by Soulvest.ai</p>
        <h1 className="mt-4 font-display text-5xl text-foreground md:text-6xl">{title}</h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">{intro}</p>
        <div className="mt-12 max-w-3xl space-y-10 text-base leading-relaxed text-muted-foreground [&_h2]:mb-3 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-foreground [&_p+p]:mt-4 [&_a]:underline [&_a]:underline-offset-4 [&_li]:mt-2 [&_ul]:list-disc [&_ul]:pl-5">
          {children}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}