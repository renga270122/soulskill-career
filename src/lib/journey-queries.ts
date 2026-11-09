import {queryOptions} from '@tanstack/react-query';
import {getJourneyWorkspace} from './journey.functions';
export const journeyQuery=(userId:string)=>queryOptions({queryKey:['journey',userId],queryFn:()=>getJourneyWorkspace()});
export type Workspace=Awaited<ReturnType<typeof getJourneyWorkspace>>;
