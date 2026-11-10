import { Building2, Briefcase, Search, ListChecks, CalendarDays, ClipboardCheck } from "lucide-react";

// Display-only catalogue. None of these entries enables a hiring operation.
export const hiringGroups = [
  {
    title: "Define the role",
    tools: [
      { title: "Company & hiring team", icon: Building2, options: ["Company details", "Hiring managers", "Team responsibilities"], unavailable: "Company setup and team management are not available yet." },
      { title: "Job requisitions & JDs", icon: Briefcase, options: ["Role requirements", "Essential skills & JD keywords", "Job description & openings"], unavailable: "Requisition creation, JD editing and job publishing are not available yet." },
    ],
  },
  {
    title: "Source & assess",
    tools: [
      { title: "Candidate sourcing", icon: Search, options: ["Opt-in professional profiles", "Skills & experience filters", "Role-specific talent search"], unavailable: "Candidate search and sourcing filters are not available yet." },
      { title: "Screening & shortlists", icon: ListChecks, options: ["Review against role requirements", "Candidate shortlist", "Hiring-team review notes"], unavailable: "Candidate screening, shortlisting and review notes are not available yet." },
    ],
  },
  {
    title: "Interview & decide",
    tools: [
      { title: "Interviews & scorecards", icon: CalendarDays, options: ["Interview rounds", "Role-specific evaluation criteria", "Interviewer feedback"], unavailable: "Interview scheduling, scorecards and interviewer feedback are not available yet." },
      { title: "Hiring pipeline & decisions", icon: ClipboardCheck, options: ["Stage-by-stage candidate status", "Hiring decisions", "Offer status"], unavailable: "Pipeline tracking, decision records and offer management are not available yet." },
    ],
  },
];