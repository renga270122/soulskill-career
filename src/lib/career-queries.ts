import { queryOptions } from "@tanstack/react-query";
import { getCareer, listResumes } from "./career.functions";
export const careerQuery = (userId: string) => queryOptions({ queryKey: ["career", userId], queryFn: () => getCareer() });
export const resumesQuery = (userId: string) => queryOptions({ queryKey: ["resumes", userId], queryFn: () => listResumes() });