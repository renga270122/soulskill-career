import type { CareerData } from "./career-schema";
export function resumeSections(d: CareerData) {
  return [
    { title: "Professional summary", entries: d.summary ? [{ heading: "", meta: "", body: d.summary }] : [] },
    { title: "Work experience", entries: d.experience.map(e => ({ heading: `${e.role} · ${e.company}`, meta: [e.start, e.end || (e.start ? "Present" : "")].filter(Boolean).join(" — "), body: e.description })) },
    { title: "Education", entries: d.education.map(e => ({ heading: `${e.degree} · ${e.institution}`, meta: [e.start, e.end].filter(Boolean).join(" — "), body: "" })) },
    { title: "Skills", entries: d.skills.length ? [{ heading: "", meta: "", body: d.skills.map(s => `${s.name} (${s.level})`).join(" · ") }] : [] },
    { title: "Projects", entries: d.projects.map(p => ({ heading: p.name, meta: p.url, body: p.description })) },
    { title: "Certifications", entries: d.certifications.map(c => ({ heading: c.name, meta: [c.issuer, c.date, c.url].filter(Boolean).join(" · "), body: "" })) },
  ].filter(s => s.entries.length);
}
export function resumeContact(d: CareerData) {
  return [d.location, d.email, d.phone, d.linkedin, d.github, d.portfolio].filter(Boolean).join(" · ");
}