import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { careerSchema, emptyCareer, resumeInputSchema } from "./career-schema";

export const getCareer = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data: profile, error: pError } = await context.supabase.from("profiles").select("full_name, headline").eq("id", context.userId).single();
  if (pError) throw new Error("Could not load your profile");
  const { data, error } = await context.supabase.from("candidate_details").select("content, photo_path").eq("user_id", context.userId).maybeSingle();
  if (error) throw new Error("Could not load your profile");
  const parsed = careerSchema.safeParse(data?.content);
  let photoUrl: string | null = null;
  if (data?.photo_path) {
    const result = await context.supabase.storage.from("candidate-assets").createSignedUrl(data.photo_path, 3600);
    // Return only the storage-relative path; the browser uses its reachable Cloud URL.
    if (result.data) photoUrl = new URL(result.data.signedUrl).pathname + new URL(result.data.signedUrl).search;
  }
  return { content: parsed.success ? parsed.data : { ...emptyCareer(), full_name: profile.full_name ?? "", headline: profile.headline ?? "" }, photoPath: data?.photo_path ?? null, photoUrl };
});
export const saveCareer = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(careerSchema).handler(async ({ context, data }) => {
  const { error } = await context.supabase.from("candidate_details").upsert({ user_id: context.userId, content: data, updated_at: new Date().toISOString() });
  if (error) throw new Error("Could not save your profile");
  const { error: profileError } = await context.supabase.from("profiles").update({ full_name: data.full_name, headline: data.headline, updated_at: new Date().toISOString() }).eq("id", context.userId);
  if (profileError) throw new Error("Could not update your display name");
  return { ok: true };
});
export const savePhoto = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(z.object({ path: z.string().max(300).nullable() })).handler(async ({ context, data }) => {
  if (data.path && (!data.path.startsWith(`${context.userId}/`) || !/^[\w/-]+\.(png|jpe?g|webp)$/i.test(data.path))) throw new Error("Invalid photo");
  if (data.path) {
    const filename = data.path.split("/").at(-1) ?? "";
    const { data: files, error } = await context.supabase.storage.from("candidate-assets").list(context.userId, { search: filename });
    if (error || !files?.some(f => f.name === filename)) throw new Error("Uploaded photo not found");
  }
  const { data: previous } = await context.supabase.from("candidate_details").select("photo_path").eq("user_id", context.userId).maybeSingle();
  const { error } = await context.supabase.from("candidate_details").upsert({ user_id: context.userId, photo_path: data.path, updated_at: new Date().toISOString() });
  if (error) throw new Error("Could not save your photo");
  if (previous?.photo_path && previous.photo_path !== data.path) await context.supabase.storage.from("candidate-assets").remove([previous.photo_path]);
  return { ok: true };
});
export const listResumes = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data, error } = await context.supabase.from("resumes").select("*").eq("user_id", context.userId).order("updated_at", { ascending: false });
  if (error) throw new Error("Could not load your resumes");
  return data;
});
export const saveResume = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(resumeInputSchema).handler(async ({ context, data }) => {
  const row = { title: data.title, target_role: data.target_role, template: data.template, content: data.content, updated_at: new Date().toISOString() };
  const result = data.id
    ? await context.supabase.from("resumes").update(row).eq("id", data.id).eq("user_id", context.userId).select("id").single()
    : await context.supabase.from("resumes").insert({ ...row, user_id: context.userId }).select("id").single();
  if (result.error) throw new Error("Could not save your resume");
  return result.data;
});
export const deleteResume = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(z.object({ id: z.string().uuid() })).handler(async ({ context, data }) => {
  const { error } = await context.supabase.from("resumes").delete().eq("id", data.id).eq("user_id", context.userId);
  if (error) throw new Error("Could not delete your resume");
  return { ok: true };
});
export const defaultResume = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(z.object({ id: z.string().uuid() })).handler(async ({ context, data }) => {
  const { error } = await context.supabase.rpc("set_default_resume", { resume_id: data.id });
  if (error) throw new Error("Could not set your default resume");
  return { ok: true };
});