import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: originals, error: originalsError } = await context.supabase.from("resume_originals").select("path").eq("user_id", context.userId);
    if (originalsError) throw new Error("Could not remove your original resumes.");
    if (originals?.length) {
      const { error } = await context.supabase.storage.from("resume-originals").remove(originals.map(o => o.path));
      if (error) throw new Error("Could not remove your original resumes.");
    }
    const { data: assets, error: listError } = await context.supabase.storage.from("candidate-assets").list(context.userId, { limit: 1000 });
    if (listError) throw new Error("Could not remove your profile assets. Please try again.");
    if (assets?.length) {
      const { error } = await context.supabase.storage.from("candidate-assets").remove(assets.map(asset => `${context.userId}/${asset.name}`));
      if (error) throw new Error("Could not remove your profile assets. Please try again.");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
