import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { homeForRoles, type AppRole } from "@/lib/auth";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/_authenticated/app")({
  staticData: { sitemap: false },
  beforeLoad: async ({ context }) => {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", context.user.id);
    throw redirect({ to: homeForRoles((data ?? []).map((r) => r.role as AppRole)), replace: true });
  },
  head: () => pageMeta("Workspace", "Open your personal SoulSkill career workspace."),
});
