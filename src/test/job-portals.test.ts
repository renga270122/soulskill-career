import { describe, expect, it } from 'vitest';
import { portals, portalSearch, isApprovedPortalUrl, jobSearchPreferences, emptyPreferences, type SearchCriteria } from '@/lib/job-portals';

const c: SearchCriteria = { title: 'Solutions Architect', skills: ['AWS', 'Kubernetes'], location: 'Bengaluru', years: 12, work_mode: 'Remote', employment_type: 'Full-time' };
const get = (id: string, x = c) => portalSearch(portals.find(p => p.id === id)!, x);

describe('job portal search links', () => {
  it('every portal opens an approved official https domain', () => {
    for (const p of portals) { const r = portalSearch(p, c); expect(r.url.startsWith('https://')).toBe(true); expect(isApprovedPortalUrl(r.url)).toBe(true); }
  });
  it('LinkedIn uses keywords, location, remote and full-time filters', () => {
    const u = new URL(get('linkedin').url);
    expect(u.searchParams.get('keywords')).toBe('Solutions Architect AWS Kubernetes');
    expect(u.searchParams.get('location')).toBe('Bengaluru');
    expect(u.searchParams.get('f_WT')).toBe('2');
    expect(u.searchParams.get('f_JT')).toBe('F');
  });
  it('Indeed gets q and l only, never experience', () => {
    const u = new URL(get('indeed').url);
    expect(u.hostname).toBe('in.indeed.com'); expect(u.searchParams.get('l')).toBe('Bengaluru'); expect(u.searchParams.has('experience')).toBe(false);
  });
  it('Naukri includes experience; switching it off removes it independently', () => {
    expect(new URL(get('naukri').url).searchParams.get('experience')).toBe('12');
    const off = new URL(get('naukri', { ...c, years: null }).url);
    expect(off.searchParams.has('experience')).toBe(false); expect(off.searchParams.get('l')).toBe('Bengaluru');
  });
  it('portals without prefilled search open their official homepage', () => {
    expect(get('instahyre')).toEqual({ url: 'https://www.instahyre.com/', prefilled: false });
    expect(get('ncs').url).toBe('https://www.ncs.gov.in/');
  });
  it('rejects non-approved or non-https urls', () => {
    expect(isApprovedPortalUrl('http://www.naukri.com/')).toBe(false);
    expect(isApprovedPortalUrl('https://naukri.com.evil.example/')).toBe(false);
  });
  it('rejects minimum salary above maximum', () => {
    expect(jobSearchPreferences.safeParse({ ...emptyPreferences(), salary_min: 30, salary_max: 10 }).success).toBe(false);
  });
});
