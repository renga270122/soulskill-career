import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { homeForRoles, type AppRole } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/app")({
  beforeLoad: async ({ context }) => {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", context.user.id);
    throw redirect({ to: homeForRoles((data ?? []).map((r) => r.role as AppRole)), replace: true });
  },
  head: () => ({ meta: [{ title: "Workspace — SoulSkill" }] }),
});
