import { z } from 'zod';
import { careerSchema } from './career-schema';

export const coachModes = ['Career clarity', 'Professional value', 'Resume improvement', 'Career planning', 'Confidence coaching', 'Job description analysis', 'Weekly reflection'] as const;
export const coachInput = z.object({ question: z.string().trim().min(5).max(6000), mode: z.enum(coachModes), resumeId: z.string().uuid().nullable().default(null), journalConsent: z.boolean(), journalIds: z.array(z.string().uuid()).max(5) });
export type Evidence = { id: string; source: string; text: string };
export function careerEvidence(content: unknown, source: string, prefix: string): Evidence[] {
  const parsed = careerSchema.safeParse(content);
  if (!parsed.success) return [];
  const c = parsed.data;
  // Send career facts, not contact details. Defaults and ambitions are not achievements.
  const facts = [c.headline, c.current_role, c.summary, ...c.skills.map(s => `${s.name} (${s.level})`), ...c.experience.map(e => `${e.role} at ${e.company}; ${e.start}–${e.end || 'end date not supplied'}. ${e.description}`), ...c.education.map(e => `${e.degree}, ${e.institution}`), ...c.projects.map(p => `${p.name}: ${p.description}`), ...c.certifications.map(c => `${c.name}${c.issuer ? ` — ${c.issuer}` : ''}`)].filter(t => t.trim());
  return facts.map((text, i) => ({ id: `${prefix}-${i}`, source, text }));
}
export const coachOutput = z.object({
  evidenceIds: z.array(z.string()).max(8),
  suggestions: z.array(z.object({ title: z.string().min(1).max(200), action: z.string().min(1).max(1000), evidenceIds: z.array(z.string()).max(8) })).min(1).max(5),
  unknowns: z.array(z.string().min(1).max(500)).max(6),
  nextAction: z.string().min(1).max(1000),
});
export function groundedCoachOutput(raw: unknown, evidence: Evidence[]) {
  const output = coachOutput.parse(raw);
  const byId = new Map(evidence.map(e => [e.id, e]));
  const ids = [...output.evidenceIds, ...output.suggestions.flatMap(s => s.evidenceIds)];
  if (ids.some(id => !byId.has(id))) throw new Error('The coach returned an unsupported source. Please try a new question.');
  return { facts: output.evidenceIds.flatMap(id => { const e = byId.get(id); return e ? [e] : []; }), suggestions: output.suggestions.map(s => ({ title: s.title, action: s.action, sources: s.evidenceIds.flatMap(id => { const e = byId.get(id); return e ? [e] : []; }) })), unknowns: output.unknowns, nextAction: output.nextAction };
}
export type CoachGuidance = ReturnType<typeof groundedCoachOutput>;