import { Link, useNavigate, useRouteContext } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  LayoutDashboard, User, FileText, Target, ListChecks, MessagesSquare,
  Building2, Briefcase, Search, Star, Workflow, Settings, LogOut,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useRoles, type AppRole } from "@/lib/auth";
import { Brand } from "@/components/Brand";
import { Button } from "@/components/ui/button";

type NavItem = { label: string; icon: typeof User; to?: "/candidate" | "/profile" | "/resumes" | "/recruiter" | "/settings" | "/journey" | "/vision-board" | "/affirmations" | "/journal" | "/action-plan" | "/routine" | "/coach" | "/applications" | "/interview-prep" | "/growth-report" };

const NAV: Record<"candidate" | "recruiter", NavItem[]> = {
  candidate: [
    { label: "Dashboard", icon: LayoutDashboard, to: "/candidate" },
    { label: "My Career Journey", icon: Target, to: "/journey" },
    { label: "Vision Board", icon: Star, to: "/vision-board" },
    { label: "Affirmations", icon: MessagesSquare, to: "/affirmations" },
    { label: "Future-Self Journal", icon: FileText, to: "/journal" },
    { label: "Action Plan", icon: ListChecks, to: "/action-plan" },
    { label: "Daily Routine", icon: Workflow, to: "/routine" },
    { label: "Profile", icon: User, to: "/profile" },
    { label: "Resumes", icon: FileText, to: "/resumes" },
    { label: "AI Career Coach", icon: MessagesSquare, to: "/coach" },
    { label: "Job matching", icon: Target },
    { label: "Applications", icon: ListChecks, to: "/applications" },
    { label: "Interview prep", icon: MessagesSquare, to: "/interview-prep" },
    { label: "Growth Report", icon: LayoutDashboard, to: "/growth-report" },
  ],
  recruiter: [
    { label: "Dashboard", icon: LayoutDashboard, to: "/recruiter" },
    { label: "Company", icon: Building2 },
    { label: "Jobs", icon: Briefcase },
    { label: "Discover", icon: Search },
    { label: "Shortlist", icon: Star },
    { label: "Pipeline", icon: Workflow },
  ],
};

export function AppShell({ children }: { children: ReactNode }) {
  const { user } = useRouteContext({ from: "/_authenticated" });
  const { data: roles = [] } = useRoles(user.id);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const sections: ("candidate" | "recruiter")[] = [];
  if (roles.includes("candidate") || roles.includes("admin")) sections.push("candidate");
  if (roles.includes("recruiter") || roles.includes("admin")) sections.push("recruiter");

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar p-5 md:flex">
        <Brand />
        <nav className="mt-10 flex-1 space-y-8">
          {sections.map((s) => (
            <div key={s}>
              <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {s === "candidate" ? "Career" : "Hiring"}
              </p>
              <ul className="mt-2 space-y-0.5">
                {NAV[s].map((item) => <NavRow key={item.label} item={item} />)}
              </ul>
            </div>
          ))}
        </nav>
        <ul className="space-y-0.5 border-t border-sidebar-border pt-4">
          <NavRow item={{ label: "Privacy & account", icon: Settings, to: "/settings" }} />
          <li>
            <button onClick={signOut} className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent">
              <LogOut className="size-4" /> Sign out
            </button>
          </li>
        </ul>
        <p className="mt-4 truncate px-2 text-xs text-muted-foreground">{user.email}</p>
        <RoleTag roles={roles} />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border px-5 py-4 md:hidden">
          <Brand />
          <Button size="sm" variant="ghost" onClick={signOut}>Sign out</Button>
        </header>
        <nav className="flex gap-1 overflow-x-auto border-b border-border px-4 py-2 md:hidden">
          {sections.map((s) => {
            const to = s === "candidate" ? "/candidate" : "/recruiter";
            return (
              <Link key={s} to={to} className="whitespace-nowrap rounded-md px-3 py-1.5 text-sm text-muted-foreground" activeProps={{ className: "bg-accent text-accent-foreground" }}>
                {s === "candidate" ? "Career" : "Hiring"}
              </Link>
            );
          })}
          {sections.includes("candidate") && NAV.candidate.filter(item => item.to && item.to !== "/candidate").map(item => <Button key={item.label} variant="ghost" size="sm" asChild><Link to={item.to}>{item.label}</Link></Button>)}
          <Link to="/settings" className="whitespace-nowrap rounded-md px-3 py-1.5 text-sm text-muted-foreground" activeProps={{ className: "bg-accent text-accent-foreground" }}>Privacy</Link>
        </nav>
        <main className="flex-1 px-5 py-8 md:px-10 md:py-12">{children}</main>
      </div>
    </div>
  );
}

function RoleTag({ roles }: { roles: AppRole[] }) {
  if (!roles.length) return null;
  return <p className="px-2 text-[10px] uppercase tracking-wider text-primary">{roles.join(" · ")}</p>;
}

function NavRow({ item }: { item: NavItem }) {
  const Icon = item.icon;
  if (!item.to) {
    return (
      <li className="flex items-center justify-between rounded-md px-2 py-2 text-sm text-muted-foreground/70">
        <span className="flex items-center gap-3"><Icon className="size-4" /> {item.label}</span>
        <span className="text-[10px] uppercase tracking-wider">Soon</span>
      </li>
    );
  }
  return (
    <li>
      <Link
        to={item.to}
        className="flex items-center gap-3 rounded-md px-2 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent"
        activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground font-medium" }}
      >
        <Icon className="size-4" /> {item.label}
      </Link>
    </li>
  );
}
