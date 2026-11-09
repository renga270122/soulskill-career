import { createFileRoute } from "@tanstack/react-router";
import { GroundedCareerCoach } from "@/components/GroundedCareerCoach";
import { journeyQuery } from "@/lib/journey-queries";
import { resumesQuery, careerQuery } from "@/lib/career-queries";
import { pageMeta } from "@/lib/page-meta";
export const Route = createFileRoute("/_authenticated/coach")({
  staticData: { sitemap: false },
  head: () => pageMeta("AI Career Coach", "Private career guidance grounded in your saved profile and resume, with clearly labeled AI suggestions."),
  loader: ({ context }) => Promise.all([context.queryClient.ensureQueryData(journeyQuery(context.user.id)), context.queryClient.ensureQueryData(resumesQuery(context.user.id)), context.queryClient.ensureQueryData(careerQuery(context.user.id))]),
  pendingComponent: () => <p role="status">Loading your career workspace…</p>,
  errorComponent: () => <p role="alert">This workspace is available for professional accounts. Please refresh or sign in again.</p>,
  component: () => <GroundedCareerCoach />,
});
