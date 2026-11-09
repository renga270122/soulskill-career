import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicPage } from "@/components/PublicPages";
import { Button } from "@/components/ui/button";
import { MessagesSquare } from "lucide-react";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/community")({
  staticData: { sitemap: true },
  head: () => pageMeta("Community", "Join SoulSkill members to share career questions, practical advice and encouragement."),
  component: CommunityPage,
});
function CommunityPage() {
  return <PublicPage title="Grow together." intro="The SoulSkill Community — career questions, lessons learned and encouragement for the journey ahead.">
    <section><h2>Believe. Share. Take action.</h2><p>Bring a question about your next career step, share something that helped you, or encourage someone finding their way.</p><div className="mt-6"><Button asChild variant="ink"><Link to="/discussions"><MessagesSquare />Member discussions</Link></Button></div><p className="mt-3 text-sm">Discussions are visible to signed-in members.</p></section>
    <section><h2>Our community guidelines</h2><ul><li>Be respectful, constructive and welcoming.</li><li>Share honest experiences; no job guarantees, spam or misleading offers.</li><li>Keep passwords, contact details, private resumes and journal entries out of posts.</li><li>Do not share someone else’s personal information.</li><li>Administrators may remove inappropriate messages. Deleting a discussion also removes its replies.</li></ul></section>
    <section><h2>Something doesn’t feel right?</h2><p><Link to="/feedback">Report a concern</Link> with the discussion title and what happened. For private enquiries, <Link to="/contact">contact the team</Link>.</p></section>
  </PublicPage>;
}