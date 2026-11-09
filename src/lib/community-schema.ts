import { z } from "zod";

export const discussionSchema = z.object({
  display_name: z.string().trim().min(2).max(60),
  title: z.string().trim().min(5).max(160),
  body: z.string().trim().min(5).max(3000),
});
export const replySchema = discussionSchema.omit({ title: true }).extend({ parent_id: z.string().uuid() });
export const entryIdSchema = z.object({ id: z.string().uuid() });