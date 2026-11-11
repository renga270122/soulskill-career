import { Link, useNavigate, useRouteContext } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard, User, FileText, Target, ListChecks, MessagesSquare,
  Search, Star, Workflow, Settings, LogOut, Menu, X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useRoles, homeForRoles } from "@/lib/auth";
import { Brand } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { PublicFooter } from "@/components/PublicPages";

type NavItem = { label: string; icon: typeof User; to?: "/candidate" | "/profile" | "/resumes" | "/settings" | "/journey" | "/vision-board" | "/affirmations" | "/journal" | "/action-plan" | "/routine" | "/coach" | "/applications" | "/find-jobs" | "/interview-prep" | "/growth-report" | "/ats-check" | "/billing" };

const NAV: NavItem[] = [
    { label: "Dashboard", icon: LayoutDashboard, to: "/candidate" },
    { label: "My Career Journey", icon: Target, to: "/journey" },
    { label: "Vision Board", icon: Star, to: "/vision-board" },
    { label: "Affirmations", icon: MessagesSquare, to: "/affirmations" },
    { label: "Future-Self Journal", icon: FileText, to: "/journal" },
    { label: "Action Plan", icon: ListChecks, to: "/action-plan" },
    { label: "Daily Routine", icon: Workflow, to: "/routine" },
    { label: "Profile", icon: User, to: "/profile" },
    { label: "Resumes", icon: FileText, to: "/resumes" },
    { label: "ATS keyword match", icon: Search, to: "/ats-check" },
    { label: "AI Career Coach", icon: MessagesSquare, to: "/coach" },
    { label: "Find Jobs", icon: Search, to: "/find-jobs" },
    { label: "Applications", icon: ListChecks, to: "/applications" },
    { label: "Interview prep", icon: MessagesSquare, to: "/interview-prep" },
    { label: "Growth Report", icon: LayoutDashboard, to: "/growth-report" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { user } = useRouteContext({ from: "/_authenticated" });
  const { data: roles = [] } = useRoles(user.id);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);
  // Historical non-career roles retain owned document tools, not links to
  // journey features whose existing permissions require the candidate role.
  const personalTools = new Set(["/candidate", "/profile", "/resumes", "/ats-check"]);
  const navigation = NAV.filter(item => roles.includes("candidate") || (item.to && personalTools.has(item.to)))
    .map(item => item.to === "/candidate" ? { ...item, to: homeForRoles(roles) } : item);

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col overflow-y-auto border-r border-sidebar-border bg-sidebar p-5 md:flex">
        <Brand />
        <p className="mt-4 border-b border-sidebar-border pb-4 text-sm font-medium text-sidebar-foreground">Professional workspace</p>
        <nav className="mt-10 flex-1 space-y-8">
          <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Career</p>
          <ul className="mt-2 space-y-0.5">{navigation.map(item => <NavRow key={item.label} item={item} />)}</ul>
        </nav>
        <ul className="space-y-0.5 border-t border-sidebar-border pt-4">
          <NavRow item={{ label: "Plans & billing", icon: Star, to: "/billing" }} />
          <NavRow item={{ label: "Privacy & account", icon: Settings, to: "/settings" }} />
          <li>
            <Button variant="ghost" onClick={signOut} className="w-full justify-start px-2 text-sidebar-foreground">
              <LogOut className="size-4" /> Sign out
            </Button>
          </li>
        </ul>
        <p className="mt-4 truncate px-2 text-xs text-muted-foreground">{user.email}</p>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-4 md:flex md:justify-between md:px-10">
            <div className="min-w-0"><div className="md:hidden"><Brand /><p className="mt-1 text-xs text-muted-foreground">Professional workspace</p></div><p className="hidden text-xs text-muted-foreground md:block">Believe in your potential. Build your future.</p></div>
            <div className="flex shrink-0 items-center gap-2">
              <Button asChild variant="ghost" size="icon" className="rounded-full bg-secondary" title="Your profile"><Link to="/profile" aria-label="Your profile"><User /></Link></Button>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</Button>
            </div>
          </div>
        </header>
        {menuOpen && <nav id="mobile-navigation" aria-label="Mobile navigation" className="border-b border-border bg-sidebar p-4 md:hidden">
          <ul className="grid gap-1 min-[380px]:grid-cols-2" onClick={() => setMenuOpen(false)}>{navigation.map(item => <NavRow key={item.label} item={item} />)}<NavRow item={{label:"Plans & billing",icon:Star,to:"/billing"}} /><NavRow item={{label:"Privacy & account",icon:Settings,to:"/settings"}} /></ul>
          <Button variant="ghost" onClick={signOut} className="mt-3"><LogOut />Sign out</Button>
        </nav>}
        <main className="min-w-0 flex-1 px-5 py-8 md:px-10 md:py-10">{children}</main>
        <PublicFooter />
      </div>
    </div>
  );
}

function NavRow({ item }: { item: NavItem }) {
  const Icon = item.icon;
  if (!item.to) {
    return (
      <li aria-disabled="true" className="flex min-w-0 items-start gap-3 rounded-md px-2 py-2 text-sm text-muted-foreground/70">
        <Icon className="mt-1 size-4 shrink-0" /><span className="min-w-0 flex-1"><span className="block break-words">{item.label}</span><span className="mt-1 block text-[10px] uppercase tracking-wider">Unavailable</span></span>
      </li>
    );
  }
  return (
    <li>
      <Link
        to={item.to}
        className="flex min-h-11 min-w-0 items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
        activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground font-medium" }}
      >
        <Icon className="size-4 shrink-0" /> <span className="min-w-0">{item.label}</span>
      </Link>
    </li>
  );
}
