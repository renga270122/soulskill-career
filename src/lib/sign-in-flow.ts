/** Deduplicate competing session-hydration and sign-in events; navigate outside auth locks. */
export function createSignInHandoff(complete: () => void, defer: (task: () => void) => void = queueMicrotask) {
  let scheduled = false;
  let active = true;
  return {
    accept: (hasSession: boolean) => {
      if (!hasSession || scheduled || !active) return;
      scheduled = true;
      defer(() => { if (active) complete(); });
    },
    cancel: () => { active = false; },
  };
}