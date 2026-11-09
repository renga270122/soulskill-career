import { z } from "zod";

const short = z.string().trim().max(200);
const long = z.string().trim().max(6000);
const link = z.string().trim().max(500).refine(v => !v || /^https?:\/\//i.test(v) && z.string().url().safeParse(v).success, "Use a full http:// or https:// URL");
const date = z.string().refine(v => !v || /^\d{4}-(0[1-9]|1[0-2])$/.test(v), "Use a valid month");
export const experienceSchema = z.object({ role: short.min(1, "Role is required"), company: short.min(1, "Company is required"), start: date, end: date, description: long }).refine(v => !v.start || !v.end || v.end >= v.start, "End date must be after start date");
export const educationSchema = z.object({ degree: short.min(1, "Qualification is required"), institution: short.min(1, "Institution is required"), start: date, end: date }).refine(v => !v.start || !v.end || v.end >= v.start, "End date must be after start date");
export const skillSchema = z.object({ name: short.min(1, "Skill name is required"), level: z.enum(["Beginner", "Intermediate", "Advanced", "Expert"]) });
export const projectSchema = z.object({ name: short.min(1, "Project name is required"), url: link, description: long });
export const certificationSchema = z.object({ name: short.min(1, "Certification is required"), issuer: short, date, url: link });
export const careerSchema = z.object({
  full_name: short.min(1, "Full name is required"), headline: short, location: short,
  email: z.string().trim().max(255).refine(v => !v || z.string().email().safeParse(v).success, "Enter a valid email address"),
  phone: z.string().trim().max(40).refine(v => !v || /^[+\d\s().-]{5,40}$/.test(v), "Enter a valid phone number"),
  years: z.number().min(0).max(80), current_role: short, summary: long,
  linkedin: link, github: link, portfolio: link,
  skills: z.array(skillSchema).max(100), experience: z.array(experienceSchema).max(50),
  education: z.array(educationSchema).max(30), projects: z.array(projectSchema).max(50), certifications: z.array(certificationSchema).max(50),
});
export type CareerData = z.infer<typeof careerSchema>;
export const templateSchema = z.enum(["classic", "modern", "executive"]);
export type ResumeTemplate = z.infer<typeof templateSchema>;
export const resumeInputSchema = z.object({ id: z.string().uuid().optional(), title: short.min(1, "Resume title is required"), target_role: short, template: templateSchema, content: careerSchema });
export function emptyCareer(): CareerData {
  return { full_name: "", headline: "", location: "", email: "", phone: "", years: 0, current_role: "", summary: "", linkedin: "", github: "", portfolio: "", skills: [], experience: [], education: [], projects: [], certifications: [] };
}
export function completeness(d: CareerData) {
  const fields = [d.full_name, d.headline, d.location, d.email || d.phone, d.current_role, d.summary, d.skills.some(s => s.name), d.experience.some(e => e.role && e.company), d.education.some(e => e.degree && e.institution), d.linkedin || d.github || d.portfolio, d.projects.some(p => p.name), d.certifications.some(c => c.name)];
  return Math.round(fields.filter(Boolean).length / fields.length * 100);
}