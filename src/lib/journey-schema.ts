import { z } from 'zod';
const short = z.string().trim().max(300), text = z.string().trim().max(6000);
export const defaultAffirmation = 'I confidently recognize and communicate my professional value.';
export const intentionOptions = ['Find a meaningful, rewarding career','Move into a leadership position','Transition into AI and emerging technology','Change industry or career direction','Build my own business','Return to the workforce','Other / custom intention'] as const;
export const intentionSchema = z.object({target_role:short,current_role:short,years:z.number().min(0).max(80),industry:short,location:short,salary:short,intention:short,future_role:short,impact:text,environment:text,skills:text,success:text,affirmation:text,commitment:text});
export type Intention = z.infer<typeof intentionSchema>;
export const emptyIntention = ():Intention => ({target_role:'',current_role:'',years:0,industry:'',location:'',salary:'',intention:intentionOptions[0],future_role:'',impact:'',environment:'',skills:'',success:'',affirmation:defaultAffirmation,commitment:''});
export const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v=> {const d=new Date(`${v}T00:00:00Z`); return !isNaN(d.getTime())&&d.toISOString().slice(0,10)===v;},'Enter a valid date');
export function localDay(date=new Date()) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; }
export function addDays(day:string,n:number) {const d=new Date(`${day}T12:00:00Z`);d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);}
export const recordSchemas = {
 vision:z.object({title:short.min(1),category:short,text,path:z.string().max(300).default(''),order:z.number().int().min(0).max(10000).default(0)}),
 board_settings:z.object({layout:z.enum(['grid','editorial','focus'])}),
 affirmation:z.object({text:text.min(1),favorite:z.boolean().default(false)}),
 affirmation_completion:z.object({affirmation_id:z.string().max(100),text:text.min(1)}),
 journal:z.object({title:short.min(1),text:text.min(1),view:z.enum(['daily','weekly'])}),
 reflection:z.object({title:short.min(1),text:text.min(1),view:z.literal('weekly')}),
 routine:z.object({visualization:text,affirmation:text,action:text,visualization_done:z.boolean(),affirmation_done:z.boolean(),action_done:z.boolean()}),
 coaching:z.object({question:text.min(1),answer:text.min(1),mode:short,journal_ids:z.array(z.string().uuid()).max(5)}),
 milestone:z.object({title:short.min(1),text,date:isoDate}),
 activity:z.object({title:short.min(1),category:z.enum(['application','networking','interview','learning','resume','career']),notes:text})
};
export type RecordKind = keyof typeof recordSchemas;
export const recordInput=z.object({id:z.string().uuid().optional(),kind:z.enum(['vision','board_settings','affirmation','affirmation_completion','journal','routine','reflection','milestone','activity']),content:z.unknown(),event_date:isoDate,dedup_key:z.string().max(200).nullable().default(null)}).superRefine((v,ctx)=> {const result=recordSchemas[v.kind].safeParse(v.content);if(!result.success)for(const issue of result.error.issues)ctx.addIssue({code:'custom',message:issue.message,path:['content',...issue.path]});});
export const taskInput=z.object({id:z.string().uuid().optional(),journey_id:z.string().uuid(),name:short.min(1),description:text,week:z.number().int().min(1).max(4),due_date:isoDate,category:z.enum(['career','application','networking','interview','learning','resume']),notes:text});
export const applicationInput=z.object({id:z.string().uuid().optional(),resume_id:z.string().uuid().nullable(),resume_title:short,role:short.min(1),company:short.min(1),url:z.string().trim().max(2000).refine(v=> !v || (z.string().url().safeParse(v).success && /^https?:\/\//i.test(v)),'Use an http or https job link'),status:z.enum(['Preparing','Applied','Screening','Interview','Offer','Closed']),notes:text,portal:short.default(''),follow_up_date:isoDate.nullable().default(null)});
export function taskProgress(tasks:{completed_at:string|null}[]) { return tasks.length?Math.round(tasks.filter(t=>t.completed_at).length/tasks.length*100):0; }
export const weekNames=['Clarity and self-belief','Visibility and opportunities','Strengthen capabilities','Inspired action'];
export const program = [
 ['Document 10 significant career achievements','Identify strongest technical and leadership skills','Define ideal target role','Finalize resume','Update LinkedIn profile','Identify 20 target companies'],
 ['Apply to 10 suitable jobs','Connect with 10 professionals in your target field','Contact 5 former colleagues','Publish one LinkedIn technical post','Practice explaining professional experience'],
 ['Prepare two system-design case studies','Document a significant engineering project',"Explore AI opportunities in your domain",'Practice three technical architect interview scenarios','Apply to another 10 relevant opportunities'],
 ['Follow up on applications','Complete two mock interviews','Refine resume based on job descriptions','Identify skill gaps from feedback','Review progress and create the next 30-day plan']
];
export function programTasks(start:string) {return program.flatMap((names,i)=>names.map((name,j)=>({name,description:weekNames[i]??'',week:i+1,due_date:addDays(start,Math.min(29,i*7+j+1)),category:name.startsWith('Apply')?'application':name.includes('interview')?'interview':name.includes('resume')?'resume':name.includes('Connect')||name.includes('Contact')?'networking':name.includes('skills')||name.includes('AI')?'learning':'career'})));}
export function journalContext(approved:boolean,ids:string[],rows:{id:string;kind:string;content:unknown}[]) {if(!approved)return [];return rows.filter(r=>ids.includes(r.id)&&(r.kind==='journal'||r.kind==='reflection')).map(r=>({id:r.id,content:r.content}));}
