import { describe, expect, it } from 'vitest';
import { identityTransition } from '../lib/auth-events';

describe('session identity transitions', () => {
  it('does not restart authenticated pages for same-account session updates', () => {
    expect(identityTransition('candidate-1', 'candidate-1')).toBe(false);
  });
  it('invalidates after genuine sign-in, account switch, and sign-out', () => {
    expect(identityTransition(null, 'candidate-1')).toBe(true);
    expect(identityTransition('candidate-1', 'candidate-2')).toBe(true);
    expect(identityTransition('candidate-1', null)).toBe(true);
  });
  it('does not treat initial session hydration as a change', () => {
    expect(identityTransition(undefined, 'candidate-1')).toBe(false);
  });
});