import { createFileRoute } from "@tanstack/react-router";
import { FindJobs } from "@/components/FindJobs";
import { jobSearchQuery } from "@/lib/job-search-queries";
import { resumesQuery } from "@/lib/career-queries";
import { pageMeta } from "@/lib/page-meta";
export const Route = createFileRoute("/_authenticated/find-jobs")({
  staticData: { sitemap: false },
  head: () => pageMeta("Find Jobs", "Open prefilled searches on official job portals from your saved SoulSkill job preferences."),
  loader: ({ context }) => Promise.all([context.queryClient.ensureQueryData(jobSearchQuery(context.user.id)), context.queryClient.ensureQueryData(resumesQuery(context.user.id))]),
  pendingComponent: () => <p role="status">Loading job search…</p>,
  errorComponent: () => <p role="alert">Find Jobs is available for professional accounts. Please refresh or sign in again.</p>,
  component: function FindJobsPage() { const { user } = Route.useRouteContext(); return <FindJobs userId={user.id} />; },
});
