import { Link } from "@tanstack/react-router";
import { FileText, ScanText, Search, Compass, MessagesSquare, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CareerFeatureCards() {
  const tools = [
    { title: "AI Resume Builder", text: "Shape your real experience into a clear professional story.", icon: FileText, to: "/resumes", cta: "Open Resume Studio" },
    { title: "ATS Resume Analysis", text: "Review structure and readability in Resume Studio. Automated ATS scoring is not available.", icon: ScanText, to: "/resumes", cta: "Review resume" },
    { title: "Job Discovery", text: "Explore opportunities through trusted external job portals.", icon: Search, to: "/find-jobs", cta: "Find jobs" },
    { title: "Career Recommendations", text: "Explore next steps grounded in your profile and resume.", icon: Compass, to: "/coach", cta: "Meet your coach" },
    { title: "Interview Preparation", text: "Organize thoughtful preparation for your next conversation.", icon: MessagesSquare, to: "/interview-prep", cta: "Prepare for interviews" },
  ] as const;
  return <section>
    <div className="mb-6"><p className="text-xs font-semibold uppercase text-muted-foreground">Create your next opportunity</p><h2 className="mt-2 font-display text-3xl">Your career toolkit</h2></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {tools.map(({title,text,icon:Icon,to,cta}) => <article key={title} className="career-tile flex min-w-0 flex-col rounded-xl border border-border bg-card p-6">
        <span className="grid size-11 place-items-center rounded-lg bg-secondary"><Icon className="size-5 text-foreground" /></span>
        <h3 className="mt-5 font-display text-2xl">{title}</h3>
        <p className="mb-6 mt-2 text-sm text-muted-foreground">{text}</p>
        <Button asChild variant="ghost" className="mt-auto w-fit justify-start px-0 hover:bg-transparent"><Link to={to}>{cta}<ArrowUpRight /></Link></Button>
      </article>)}
    </div>
  </section>;
}