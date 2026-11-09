/** A refreshed/re-established session for the same account is not an identity change. */
export function identityTransition(previous: string | null | undefined, next: string | null) {
  return previous !== undefined && previous !== next;
}