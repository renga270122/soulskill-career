import { createFileRoute } from "@tanstack/react-router";
import { CareerJourney } from "@/components/CareerJourney";
import { journeyQuery } from "@/lib/journey-queries";
import { resumesQuery, careerQuery } from "@/lib/career-queries";
import { pageMeta } from "@/lib/page-meta";
export const Route = createFileRoute("/_authenticated/journey")({
  staticData: { sitemap: false },
  head: () => pageMeta("My Career Journey", "Private SoulSkill career development workspace."),
  loader: ({ context }) => Promise.all([context.queryClient.ensureQueryData(journeyQuery(context.user.id)), context.queryClient.ensureQueryData(resumesQuery(context.user.id)), context.queryClient.ensureQueryData(careerQuery(context.user.id))]),
  pendingComponent: () => <p role="status">Loading your career workspace…</p>,
  errorComponent: () => <p role="alert">This workspace is available for professional accounts. Please refresh or sign in again.</p>,
  component: () => <CareerJourney />,
});
