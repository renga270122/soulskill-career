import { createFileRoute } from "@tanstack/react-router";
import { ActionPlan } from "@/components/CareerPages";
import { journeyQuery } from "@/lib/journey-queries";
import { resumesQuery, careerQuery } from "@/lib/career-queries";
import { pageMeta } from "@/lib/page-meta";
export const Route = createFileRoute("/_authenticated/action-plan")({
  staticData: { sitemap: false },
  head: () => pageMeta("30-Day Career Action Plan", "Private SoulSkill career development workspace."),
  loader: ({ context }) => Promise.all([context.queryClient.ensureQueryData(journeyQuery(context.user.id)), context.queryClient.ensureQueryData(resumesQuery(context.user.id)), context.queryClient.ensureQueryData(careerQuery(context.user.id))]),
  pendingComponent: () => <p role="status">Loading your career workspace…</p>,
  errorComponent: () => <p role="alert">This workspace is available for professional accounts. Please refresh or sign in again.</p>,
  component: () => <ActionPlan />,
});
