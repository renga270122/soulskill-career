import { useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { saveResume } from '@/lib/career.functions';
import { careerSchema, templateSchema, type CareerData } from '@/lib/career-schema';
import { presentationSchema } from '@/lib/resume-design';
import { ResumeAssistant } from './ResumeAssistant';
import { Input } from './ui/input';

type ResumeRow = { id: string; title: string; target_role: string | null; content: unknown; design_key?: string | null; presentation?: unknown };

/** Role-specific summary/bullet suggestions from a real saved resume. Accepted changes are saved as a new tailored copy; the original is never overwritten. */
export function CoachResumeSuggestions({ resume, userId, defaultRole }: { resume: ResumeRow; userId: string; defaultRole: string }) {
  const parsed = careerSchema.safeParse(resume.content);
  const [role, setRole] = useState(resume.target_role || defaultRole);
  const [status, setStatus] = useState('');
  const save = useServerFn(saveResume);
  const qc = useQueryClient();
  if (!parsed.success) return <p className="text-sm text-muted-foreground">This resume could not be read. Open it in Resume Studio to review it.</p>;
  async function saveCopy(content: CareerData) {
    setStatus('Saving tailored copy…');
    try {
      const t = templateSchema.safeParse(resume.design_key);
      const p = presentationSchema.safeParse(resume.presentation ?? {});
      await save({ data: { title: `${resume.title} – ${role || 'tailored'}`.slice(0, 200), target_role: role.slice(0, 200), template: t.success ? t.data : templateSchema.options[0], presentation: p.success ? p.data : {}, content, original_id: null } });
      await qc.invalidateQueries({ queryKey: ['resumes', userId] });
      setStatus('Saved as a new tailored resume. Your original is unchanged.');
    } catch { setStatus('The tailored copy could not be saved. Your original resume is unchanged.'); }
  }
  return <section aria-label="Resume Studio suggestions" className="space-y-4 border-t border-border pt-6">
    <p className="text-sm text-muted-foreground">Using <strong>{resume.title}</strong>. Accepted suggestions are saved as a new tailored copy in <Link to="/resumes" className="underline">Resume Studio</Link>.</p>
    <label className="block space-y-1 text-sm">Target role<Input value={role} maxLength={200} onChange={e => setRole(e.target.value)} placeholder="e.g. Senior Solutions Architect" /></label>
    <ResumeAssistant key={resume.id} content={parsed.data} targetRole={role} onChange={saveCopy} onTailoredCopy={saveCopy} />
    {status && <p role="status" className="text-sm">{status}</p>}
  </section>;
}
