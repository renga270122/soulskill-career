import { Heart, Compass, Footprints } from "lucide-react";

export function BeliefJourney() {
  return <section className="border-t border-border py-8">
    <p className="text-xs font-semibold uppercase text-muted-foreground">Possibility meets purpose</p>
    <h2 className="mt-2 font-display text-3xl text-foreground">Your Journey Starts With Belief</h2>
    <div className="mt-6 grid gap-4 sm:grid-cols-3">
      {[
        { title: "Believe", text: "Recognize your potential.", icon: Heart },
        { title: "Visualize", text: "Get clarity about your career goals.", icon: Compass },
        { title: "Act", text: "Take meaningful steps towards your aspirations.", icon: Footprints },
      ].map(({title,text,icon:Icon}) => <article key={title} className="rounded-xl border border-border bg-card p-6">
        <Icon className="size-5 text-primary" aria-hidden="true" />
        <h3 className="mt-4 text-sm font-semibold uppercase">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{text}</p>
      </article>)}
    </div>
  </section>;
}