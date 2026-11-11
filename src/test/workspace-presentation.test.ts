import { describe, expect, it } from "vitest";
import { homeForRoles } from "@/lib/auth";

describe("Personal career destinations without role mutations", () => {
  it("opens the candidate workspace for job seekers", () => {
    expect(homeForRoles(["candidate"])).toBe("/candidate");
  });
  it("opens a personal profile for historical non-career accounts", () => {
    const roles = ["recruiter"] as const;
    expect(homeForRoles([...roles])).toBe("/profile");
    expect(roles).toEqual(["recruiter"]);
  });
  it("opens career tools for dual-role accounts", () => {
    expect(homeForRoles(["candidate", "recruiter"])).toBe("/candidate");
  });
  it("keeps administrative accounts on owned profile tools", () => {
    expect(homeForRoles(["admin"])).toBe("/profile");
  });
  it("defaults new accounts to the job-seeker destination", () => {
    expect(homeForRoles([])).toBe("/candidate");
  });
});
