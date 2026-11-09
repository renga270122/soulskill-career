import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, ArrowUpRight } from "lucide-react";
import { PublicPage } from "@/components/PublicPages";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/contact")({
  staticData: { sitemap: true },
  head: () => ({ meta: [
    { title: "Contact SoulSkill — Support and privacy enquiries" },
    { name: "description", content: "Contact SoulSkill at soulvest1111@gmail.com for support, feedback and privacy enquiries." },
    { property: "og:title", content: "Contact SoulSkill — Support and privacy enquiries" },
    { property: "og:description", content: "Get in touch with SoulSkill by Soulvest.ai for help, feedback or privacy questions." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ContactPage,
});

function ContactPage() {
  return <PublicPage title="Contact SoulSkill" intro="Questions, feedback or a concern about your information? Get in touch.">
    <section><h2>Email us</h2>
      <p className="break-words"><a href="mailto:soulvest1111@gmail.com">soulvest1111@gmail.com</a></p>
      <div className="mt-6"><Button asChild variant="ink"><a href="mailto:soulvest1111@gmail.com"><Mail /> Email SoulSkill <ArrowUpRight /></a></Button></div>
    </section>
    <section><h2>Support and feedback</h2>
      <p>Tell us which page you were using, what happened and what you expected. If your question concerns your account, include the email address you use to sign in.</p>
      <p>Please do not send passwords, verification codes, identity documents or sensitive resume details by email.</p>
    </section>
    <section><h2>Privacy enquiries</h2>
      <p>Use the same email for questions about your personal information or requests for access, correction or deletion. We may need to verify account ownership before acting on an account-specific request.</p>
      <p>Read the <Link to="/privacy">Privacy Policy</Link> for more information.</p>
    </section>
  </PublicPage>;
}