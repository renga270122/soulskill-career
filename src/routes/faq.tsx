import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicPage } from "@/components/PublicPages";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { pageMeta } from "@/lib/page-meta";

const faqs = [
  ["What is SoulSkill?", "SoulSkill brings together resume building, career planning and practical mindset support. Believe in your potential, then turn that belief into action."],
  ["How do I start?", "Create an account or sign in, complete your career profile, then open Resume Studio or your career journey."],
  ["Can I upload an existing resume?", "Yes. Resume Studio accepts PDF and DOCX files. Review the extracted details before creating your editable resume."],
  ["Can I download my resume?", "Yes. Choose a template, review the preview and export your resume as a PDF."],
  ["Does SoulSkill provide an ATS score?", "SoulSkill provides a JD keyword match estimate: select a resume, paste a job description and review the keywords to compare. The percentage shows how many selected terms appear in your visible resume content. It is not an employer’s actual ATS score, a formatting assessment or a hiring guarantee."],
  ["Can recruiters see my private information?", "Recruiter discovery is opt-in. Your private career details, resumes, journals and reflections are kept separate from your discoverable name and headline. Community messages are visible to signed-in members, so share only what you want others to read."],
  ["Does SoulSkill apply for jobs for me?", "No. Employer and job-portal links open external websites. You submit applications there and confirm your application status yourself in SoulSkill."],
  ["Will manifestation guarantee a job?", "No. Belief, visualization and affirmations support confidence and focus; they do not guarantee interviews, employment or salary outcomes. Pair them with practical career action."],
  ["Should I review AI suggestions?", "Always. Check accuracy and relevance before accepting suggestions. Never add qualifications, experience or achievements you cannot support."],
  ["Who can join Community discussions?", "Signed-in members can start discussions and reply using a chosen display name. Members can delete their own messages, and administrators can remove inappropriate content."],
];

export const Route = createFileRoute("/faq")({
  staticData: { sitemap: true },
  head: () => pageMeta("Frequently asked questions", "Answers about SoulSkill resumes, career tools, privacy, AI suggestions and member discussions."),
  component: FAQPage,
});

function FAQPage() {
  return <PublicPage title="Frequently asked questions" intro="A little clarity for your next step.">
    <Accordion type="multiple">{faqs.map(([q, a], i) => <AccordionItem key={q} value={String(i)}><AccordionTrigger className="gap-4 text-base text-foreground">{q}</AccordionTrigger><AccordionContent className="text-base leading-relaxed">{a}</AccordionContent></AccordionItem>)}</Accordion>
    <section><h2>Still have a question?</h2><p><Link to="/contact">Contact us</Link>, or <Link to="/feedback">share feedback or report a bug</Link>.</p></section>
  </PublicPage>;
}