import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicPage } from "@/components/PublicPages";

export const Route = createFileRoute("/privacy")({
  staticData: { sitemap: true },
  head: () => ({ meta: [
    { title: "SoulSkill Privacy Policy — Your information and choices" },
    { name: "description", content: "How SoulSkill handles account information, resumes, private reflections, AI suggestions and recruiter visibility." },
    { property: "og:title", content: "SoulSkill Privacy Policy — Your information and choices" },
    { property: "og:description", content: "Understand information use, optional AI processing, recruiter consent and your account controls." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return <PublicPage title="Privacy Policy" intro="This policy explains how SoulSkill by Soulvest.ai handles information when you use this website and career workspace.">
    <p className="text-sm">Last updated: 9 November 2026</p>
    <section><h2>Information we handle</h2><ul>
      <li>Account and sign-in information, including your email, name and selected candidate or recruiter role.</li>
      <li>Career information you provide: profiles, employment history, education, skills, uploaded documents and saved resumes.</li>
      <li>Your career goals, vision-board content, affirmations, journals, reflections, routines and action plans.</li>
      <li>Job-search preferences, saved searches, search history and application-tracking information.</li>
      <li>Questions and saved sessions when you use the AI Career Coach, and messages you send us.</li>
      <li>Technical information used to operate the website, such as browser, request and error information. Hosting services may also process website-usage information.</li>
    </ul></section>
    <section><h2>How information is used</h2>
      <p>We use information to provide account access, save your career work, prepare documents, display your activity, provide requested AI suggestions, support opt-in recruiter discovery, respond to enquiries and maintain website security and reliability.</p>
    </section>
    <section><h2>Recruiter visibility and private reflections</h2>
      <p>Recruiter discovery is controlled by your profile’s visibility setting. You can turn visibility on or off in your account settings. Private career details and resumes are stored separately from discoverable profile information.</p>
      <p>Your journals, affirmations and personal reflections are not part of recruiter discovery. Share downloaded documents with employers only when you choose to do so.</p>
    </section>
    <section><h2>AI features</h2>
      <p>When you request AI coaching, resume suggestions or document-import assistance, relevant career or document content is processed through Lovable’s AI services and the model provider used for that request. Saved coaching sessions remain in your workspace.</p>
      <p>Journal and reflection entries are excluded from AI coaching unless you explicitly give permission and select entries. AI suggestions can be inaccurate: review them before accepting or using them. Resume suggestions are not applied automatically.</p>
    </section>
    <section><h2>Service providers and external websites</h2>
      <p>SoulSkill uses Lovable Cloud for hosting, account services, information storage and application operations, and Lovable’s AI services for requested AI features. These providers process information to deliver those services. A sign-in provider you choose also handles sign-in information under its own policy.</p>
      <p>Job-search links open external portals or employer websites. Those websites have their own privacy policies and terms. Opening a link does not automatically submit your resume or mark an application as submitted in SoulSkill.</p>
    </section>
    <section><h2>Browser storage and security</h2>
      <p>Browser storage and, where applicable, cookies support your sign-in session and website operation. Clearing them may sign you out. We use account-based access controls to restrict private information, but no online service can guarantee absolute security.</p>
    </section>
    <section><h2>Retention and your choices</h2>
      <p>Your saved career information is retained to provide your workspace until you remove it or delete your account. Account settings include profile visibility and account deletion controls. Operational logs or provider backups may remain subject to the provider’s retention processes; this policy does not promise immediate removal from all backups.</p>
      <p>You can edit your information in the workspace and export resumes. For access, correction, deletion or other privacy questions, email <a href="mailto:soulvest1111@gmail.com">soulvest1111@gmail.com</a>. Account-specific requests may require ownership verification.</p>
    </section>
    <section><h2>Policy updates and contact</h2>
      <p>We may update this policy as the service changes and will update the date shown above. For questions about this policy, visit <Link to="/contact">Contact</Link> or email soulvest1111@gmail.com.</p>
    </section>
  </PublicPage>;
}