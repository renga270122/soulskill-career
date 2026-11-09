import { describe, expect, it } from 'vitest';
import { careerEvidence, groundedCoachOutput } from '../lib/coach-schema';
import { emptyCareer } from '../lib/career-schema';

describe('coach grounding', () => {
  const content = { ...emptyCareer(), full_name: 'Candidate', email: 'private@example.com', phone: '+919999999999', current_role: 'Senior Engineer', skills: [{ name: 'Python', level: 'Advanced' as const }] };
  it('uses actual saved role and skills and omits private contact information', () => {
    const evidence = careerEvidence(content, 'Saved profile', 'profile');
    expect(evidence.map(e => e.text)).toEqual(['Senior Engineer', 'Python (Advanced)']);
  });
  it('renders factual claims from exact stored evidence, not AI-written achievements', () => {
    const evidence = careerEvidence(content, 'Saved profile', 'profile');
    const result = groundedCoachOutput({ evidenceIds: ['profile-0'], suggestions: [{ title: 'Prepare', action: 'Document a real project if true.', evidenceIds: ['profile-0'] }], unknowns: ['What outcomes can you verify?'], nextAction: 'Review one actual project.' }, evidence);
    expect(result.facts).toEqual([{ id: 'profile-0', source: 'Saved profile', text: 'Senior Engineer' }]);
  });
  it('rejects fabricated or unknown evidence references', () => {
    expect(() => groundedCoachOutput({ evidenceIds: ['invented-promotion'], suggestions: [{ title: 'Prepare', action: 'Review.', evidenceIds: [] }], unknowns: [], nextAction: 'Review.' }, [])).toThrow('unsupported source');
  });
});