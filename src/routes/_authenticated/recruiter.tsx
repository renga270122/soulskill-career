import { createFileRoute, redirect } from "@tanstack/react-router";
import { pageMeta } from "@/lib/page-meta";

// Compatibility only: published bookmarks must not lead to a retired screen.
export const Route = createFileRoute("/_authenticated/recruiter")({
  staticData: { sitemap: false },
  beforeLoad: () => { throw redirect({ to: "/app", replace: true }); },
  head: () => pageMeta("Personal career workspace", "Continue to your SoulSkill career tools."),
});
