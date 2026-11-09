import { z } from 'zod';

/**
 * External job portal directory. Configuration only — no portal here is a
 * SoulSkill integration. SoulSkill builds search links from documented public
 * URL parameters and never scrapes or fetches portal results. A future
 * authorized API adapter can be attached via `adapter` without UI changes.
 */
export const workModes = ['Any', 'On-site', 'Hybrid', 'Remote'] as const;
export const employmentTypes = ['Any', 'Full-time', 'Part-time', 'Contract', 'Internship'] as const;

const short = z.string().trim().max(200);
export const jobSearchPreferences = z.object({
  designation: short,
  alt_titles: z.array(short).max(10).default([]),
  skills: z.array(short).max(30).default([]),
  years: z.number().min(0).max(60).default(0),
  locations: z.array(short).max(10).default([]),
  salary_min: z.number().min(0).max(100000000).nullable().default(null),
  salary_max: z.number().min(0).max(100000000).nullable().default(null),
  industries: z.array(short).max(10).default([]),
  companies: z.array(z.object({ name: short.min(1), careers_url: z.string().trim().max(500).default('') })).max(20).default([]),
  work_mode: z.enum(workModes).default('Any'),
  employment_type: z.enum(employmentTypes).default('Any'),
}).refine(v => v.salary_min == null || v.salary_max == null || v.salary_min <= v.salary_max, { message: 'Minimum salary must not exceed maximum salary', path: ['salary_max'] })
  .refine(v => v.companies.every(c => !c.careers_url || isHttpsUrl(c.careers_url)), { message: 'Company career links must start with https://', path: ['companies'] });
export type JobSearchPreferences = z.infer<typeof jobSearchPreferences>;
export const emptyPreferences = (): JobSearchPreferences => ({ designation: '', alt_titles: [], skills: [], years: 0, locations: [], salary_min: null, salary_max: null, industries: [], companies: [], work_mode: 'Any', employment_type: 'Any' });

/** Criteria actually used for one search; each filter can be switched off independently. */
export type SearchCriteria = { title: string; skills: string[]; location: string; years: number | null; work_mode: (typeof workModes)[number]; employment_type: (typeof employmentTypes)[number] };

export type Supported = 'keywords' | 'location' | 'experience' | 'work_mode' | 'employment_type';
export type Portal = {
  id: string; name: string; description: string; homepage: string; hosts: string[];
  /** Filters the portal's public search URL accepts. Empty = landing page only. */
  supports: Supported[];
  build?: (c: SearchCriteria) => string;
  adapter?: 'none';
};

const keywords = (c: SearchCriteria) => [c.title, ...c.skills.slice(0, 3)].filter(Boolean).join(' ').trim();
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
function url(base: string, params: Record<string, string | undefined>) {
  const u = new URL(base);
  for (const [k, v] of Object.entries(params)) if (v) u.searchParams.set(k, v);
  return u.toString();
}

export const portals: Portal[] = [
  { id: 'naukri', name: 'Naukri', description: 'India’s large general job board across industries and experience levels.', homepage: 'https://www.naukri.com/', hosts: ['www.naukri.com'], supports: ['keywords', 'location', 'experience'],
    build: c => url(`https://www.naukri.com/${slug(keywords(c)) || 'jobs'}-jobs${c.location ? `-in-${slug(c.location)}` : ''}`, { k: keywords(c), l: c.location, experience: c.years == null ? undefined : String(Math.round(c.years)) }) },
  { id: 'linkedin', name: 'LinkedIn Jobs', description: 'Professional network job search with company insights.', homepage: 'https://www.linkedin.com/jobs/', hosts: ['www.linkedin.com'], supports: ['keywords', 'location', 'work_mode', 'employment_type'],
    build: c => url('https://www.linkedin.com/jobs/search/', { keywords: keywords(c), location: c.location, f_WT: { Any: undefined, 'On-site': '1', Remote: '2', Hybrid: '3' }[c.work_mode], f_JT: { Any: undefined, 'Full-time': 'F', 'Part-time': 'P', Contract: 'C', Internship: 'I' }[c.employment_type] }) },
  { id: 'indeed', name: 'Indeed India', description: 'Aggregated listings from employers and career sites in India.', homepage: 'https://in.indeed.com/', hosts: ['in.indeed.com'], supports: ['keywords', 'location'],
    build: c => url('https://in.indeed.com/jobs', { q: keywords(c), l: c.location }) },
  { id: 'foundit', name: 'Foundit', description: 'Formerly Monster India; mid-to-senior roles across India and APAC.', homepage: 'https://www.foundit.in/', hosts: ['www.foundit.in'], supports: ['keywords', 'location'],
    build: c => url('https://www.foundit.in/srp/results', { query: keywords(c), locations: c.location }) },
  { id: 'instahyre', name: 'Instahyre', description: 'Curated tech and business roles; employers reach out to candidates.', homepage: 'https://www.instahyre.com/', hosts: ['www.instahyre.com'], supports: [] },
  { id: 'cutshort', name: 'Cutshort', description: 'Tech-focused hiring with skill-based matching.', homepage: 'https://cutshort.io/', hosts: ['cutshort.io'], supports: [] },
  { id: 'wellfound', name: 'Wellfound', description: 'Startup jobs, formerly AngelList Talent.', homepage: 'https://wellfound.com/', hosts: ['wellfound.com'], supports: [] },
  { id: 'ncs', name: 'National Career Service', description: 'Government of India employment portal (Ministry of Labour & Employment).', homepage: 'https://www.ncs.gov.in/', hosts: ['www.ncs.gov.in'], supports: [] },
];

export const approvedHosts = new Set(portals.flatMap(p => p.hosts));
export function isHttpsUrl(v: string) { try { return new URL(v).protocol === 'https:'; } catch { return false; } }
export function isApprovedPortalUrl(v: string) { try { const u = new URL(v); return u.protocol === 'https:' && approvedHosts.has(u.hostname); } catch { return false; } }

/** Returns the safe URL to open and whether criteria were prefilled. Falls back to the official homepage. */
export function portalSearch(p: Portal, c: SearchCriteria): { url: string; prefilled: boolean } {
  const built = p.build && keywords(c) ? p.build(c) : null;
  if (built && isApprovedPortalUrl(built)) return { url: built, prefilled: true };
  return { url: isApprovedPortalUrl(p.homepage) ? p.homepage : 'about:blank', prefilled: false };
}
export const criteriaFrom = (p: JobSearchPreferences): SearchCriteria => ({ title: p.designation, skills: p.skills, location: p.locations[0] ?? '', years: p.years || null, work_mode: p.work_mode, employment_type: p.employment_type });
