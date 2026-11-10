import type { AppRole } from "@/lib/auth";

// Presentation only: this never grants a role or authorizes access to records.
export function workspacePresentation(roles: AppRole[], pathname: string) {
  const canUseCareer = roles.includes("candidate") || roles.includes("admin");
  const canUseHiring = roles.includes("recruiter") || roles.includes("admin");
  const workspace = pathname === "/recruiter" || (canUseHiring && !canUseCareer) ? "recruiter" : "candidate";
  return { workspace, canSwitch: canUseCareer && canUseHiring, showCareerConsent: canUseCareer } as const;
}