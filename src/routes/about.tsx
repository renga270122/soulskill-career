import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicPage } from "@/components/PublicPages";

export const Route = createFileRoute("/about")({
  staticData: { sitemap: true },
  head: () => ({ meta: [
    { title: "About SoulSkill — Career clarity, confidence and action" },
    { name: "description", content: "Learn about SoulSkill by Soulvest.ai and our practical, privacy-conscious approach to career development." },
    { property: "og:title", content: "About SoulSkill — Career clarity, confidence and action" },
    { property: "og:description", content: "Our purpose: connect career vision with real experience and practical action." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: AboutPage,
});

function AboutPage() {
  return <PublicPage title="About SoulSkill" intro="From career clarity to confidence, from confidence to action.">
    <section><h2>Manifest your career. Build your future.</h2>
      <p>SoulSkill is a career-development platform by Soulvest.ai, built for professionals who want to present their experience clearly and take purposeful steps toward their next opportunity.</p>
      <p>Our approach brings visualization, affirmations and reflection together with practical career work: developing a resume, exploring opportunities, preparing for interviews and tracking next steps.</p>
    </section>
    <section><h2>Real experience, purposeful action</h2>
      <p>Resume Studio helps you upload, review, edit and export resumes. The AI Career Coach offers suggestions grounded in your saved profile and resume. Goals are aspirations, not achievements, and AI suggestions require your review.</p>
      <p>Find Jobs opens external job portals. Applications are submitted on the employer’s or portal’s website; SoulSkill helps you track your progress, not submit applications on your behalf.</p>
    </section>
    <section><h2>Your career, your choice</h2>
      <p>Recruiter discovery is opt-in. Your private career reflections and journals are separate from your discoverable profile. Read our <Link to="/privacy">Privacy Policy</Link> for how information is handled.</p>
    </section>
    <section><h2>No promises of guaranteed outcomes</h2>
      <p>Mindset practices support reflection and action; they do not guarantee a job, interview, salary or other result. SoulSkill is not an employer or a job-placement guarantee service.</p>
      <p>Questions or feedback? <Link to="/contact">Contact SoulSkill</Link>.</p>
    </section>
  </PublicPage>;
}