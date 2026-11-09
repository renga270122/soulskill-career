import { queryOptions } from '@tanstack/react-query';
import { getJobSearch } from './job-search.functions';
export const jobSearchQuery = (userId: string) => queryOptions({ queryKey: ['job-search', userId], queryFn: () => getJobSearch() });
