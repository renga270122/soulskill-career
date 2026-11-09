import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { jobSearchPreferences, emptyPreferences, portals } from './job-portals';
import { careerSchema } from './career-schema';

type Ctx = { supabase: any; userId: string };
async function candidate({ supabase, userId }: Ctx) {
  const r = await supabase.from('user_roles').select('role').eq('user_id', userId);
  if (r.error || !r.data?.some((x: { role: string }) => x.role === 'candidate')) throw new Error('Job search is available for professional accounts.');
}
const criteria = z.object({ title: z.string().trim().max(200), skills: z.array(z.string().trim().max(200)).max(30), location: z.string().trim().max(200), years: z.number().min(0).max(60).nullable(), work_mode: z.string().max(20), employment_type: z.string().max(20) });
const portalIds = z.array(z.enum(portals.map(p => p.id) as [string, ...string[]])).max(portals.length);

export const getJobSearch = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  await candidate(context);
  const [items, career] = await Promise.all([
    context.supabase.from('job_search_items').select('id,kind,name,content,created_at').eq('user_id', context.userId).order('created_at', { ascending: false }).limit(60),
    context.supabase.from('candidate_details').select('content').eq('user_id', context.userId).maybeSingle(),
  ]);
  if (items.error) throw new Error('Could not load your job search.');
  const prefRow = items.data?.find(i => i.kind === 'preferences');
  const parsed = jobSearchPreferences.safeParse(prefRow?.content);
  let preferences = parsed.success ? parsed.data : emptyPreferences();
  if (!prefRow) { // first visit: start from the saved candidate profile
    const c = careerSchema.safeParse(career.data?.content);
    if (c.success) preferences = { ...preferences, designation: c.data.current_role, skills: c.data.skills.map(s => s.name).slice(0, 15), years: c.data.years, locations: c.data.location ? [c.data.location] : [] };
  }
  const rows = (items.data ?? []).map(i => ({ kind: i.kind, id: i.id, name: i.name, created_at: i.created_at, content: i.content as { criteria?: z.infer<typeof criteria>; portals?: string[] } }));
  return { preferences, saved: !!prefRow, savedSearches: rows.filter(r => r.kind === 'saved_search'), history: rows.filter(r => r.kind === 'history').slice(0, 15) };
});

export const saveJobPreferences = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(jobSearchPreferences).handler(async ({ context, data }) => {
  await candidate(context);
  const existing = await context.supabase.from('job_search_items').select('id').eq('user_id', context.userId).eq('kind', 'preferences').maybeSingle();
  const row = { content: data, updated_at: new Date().toISOString() };
  const r = existing.data ? await context.supabase.from('job_search_items').update(row).eq('id', existing.data.id).eq('user_id', context.userId) : await context.supabase.from('job_search_items').insert({ ...row, user_id: context.userId, kind: 'preferences' });
  if (r.error) throw new Error('Could not save your preferences.');
  return { ok: true };
});

export const recordJobSearch = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(z.object({ kind: z.enum(['saved_search', 'history']), name: z.string().trim().max(120).default(''), criteria, portals: portalIds })).handler(async ({ context, data }) => {
  await candidate(context);
  const r = await context.supabase.from('job_search_items').insert({ user_id: context.userId, kind: data.kind, name: data.name || data.criteria.title || 'Search', content: { criteria: data.criteria, portals: data.portals } });
  if (r.error) throw new Error('Could not save this search.');
  return { ok: true };
});

export const deleteJobSearch = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(z.object({ id: z.string().uuid() })).handler(async ({ context, data }) => {
  await candidate(context);
  const r = await context.supabase.from('job_search_items').delete().eq('id', data.id).eq('user_id', context.userId).neq('kind', 'preferences');
  if (r.error) throw new Error('Could not delete this search.');
  return { ok: true };
});
