import { describe, it, expect, vi } from "vitest";
import { createSignInHandoff } from "@/lib/sign-in-flow";
describe("Google session handoff", () => {
  it("navigates once after session hydration, outside the auth callback", () => {
    const complete = vi.fn(); const tasks: (() => void)[] = [];
    const handoff = createSignInHandoff(complete, task => tasks.push(task));
    handoff.accept(false); expect(tasks.length).toBe(0);
    handoff.accept(true); handoff.accept(true);
    expect(complete).not.toHaveBeenCalled(); expect(tasks.length).toBe(1);
    tasks[0]?.(); expect(complete).toHaveBeenCalledTimes(1);
  });
  it("does not navigate after the sign-in page unmounts", () => {
    const complete = vi.fn(); const tasks: (() => void)[] = [];
    const handoff = createSignInHandoff(complete, task => tasks.push(task));
    handoff.accept(true); handoff.cancel(); tasks[0]?.();
    expect(complete).not.toHaveBeenCalled();
  });
});