import { describe, expect, it } from "vitest";
import { workspacePresentation } from "@/lib/workspace-presentation";

describe("Role-specific workspace presentation", () => {
  it("keeps recruiter-only accounts hiring-focused including account settings", () => {
    expect(workspacePresentation(["recruiter"], "/settings")).toEqual({ workspace: "recruiter", canSwitch: false, showCareerConsent: false });
  });
  it("keeps professional accounts in their career workspace", () => {
    expect(workspacePresentation(["candidate"], "/candidate")).toEqual({ workspace: "candidate", canSwitch: false, showCareerConsent: true });
  });
  it("separates hiring navigation for accounts with both roles", () => {
    expect(workspacePresentation(["candidate", "recruiter"], "/recruiter")).toEqual({ workspace: "recruiter", canSwitch: true, showCareerConsent: true });
    expect(workspacePresentation(["candidate", "recruiter"], "/candidate").workspace).toBe("candidate");
  });
});