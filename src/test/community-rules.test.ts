import { describe, it, expect } from "vitest";
import { discussionSchema, replySchema } from "@/lib/community-schema";

describe("member discussions", () => {
  it("accepts a member discussion", () => {
    expect(discussionSchema.safeParse({ display_name: "Member", title: "Career question", body: "How can I prepare?" }).success).toBe(true);
  });
  it("requires a discussion message", () => {
    expect(discussionSchema.safeParse({ display_name: "Member", title: "Career question", body: "" }).success).toBe(false);
  });
  it("requires replies to reference a discussion", () => {
    expect(replySchema.safeParse({ display_name: "Member", body: "Practice your interview answers." }).success).toBe(false);
    expect(replySchema.safeParse({ display_name: "Member", body: "Practice your interview answers.", parent_id: "00000000-0000-4000-8000-000000000001" }).success).toBe(true);
  });
});