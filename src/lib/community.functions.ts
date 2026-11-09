import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { discussionSchema, replySchema, entryIdSchema } from "./community-schema";

export const listDiscussions = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data: posts, error } = await context.supabase.from("community_entries").select("*").is("parent_id", null).order("created_at", { ascending: false }).limit(50);
  if (error) throw new Error("Could not load discussions. Please try again.");
  const ids = posts.map(p => p.id);
  const replies = ids.length ? await context.supabase.from("community_entries").select("*").in("parent_id", ids).order("created_at", { ascending: true }) : { data: [], error: null };
  if (replies.error) throw new Error("Could not load replies. Please try again.");
  const { data: admin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  return { posts, replies: replies.data ?? [], userId: context.userId, admin: admin === true };
});
export const createDiscussion = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(discussionSchema).handler(async ({ context, data }) => {
  const { error } = await context.supabase.from("community_entries").insert({ ...data, user_id: context.userId });
  if (error) throw new Error("Could not publish your discussion. Please try again.");
  return { ok: true };
});
export const createReply = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(replySchema).handler(async ({ context, data }) => {
  const { error } = await context.supabase.from("community_entries").insert({ ...data, user_id: context.userId });
  if (error) throw new Error("Could not publish your reply. Please try again.");
  return { ok: true };
});
export const deleteCommunityEntry = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(entryIdSchema).handler(async ({ context, data }) => {
  const { data: removed, error } = await context.supabase.from("community_entries").delete().eq("id", data.id).select("id").maybeSingle();
  if (error || !removed) throw new Error("This message could not be deleted.");
  return { ok: true };
});