import records from '../content/projects.json';
export type Section = {type:string; narrative_stage?:string|null; heading?:string|null; body?:string|null; background?:string|null; layout?:string|null; quote?:string|null; quote_attribution?:string|null; metrics?:{label:string;value:string;kind?:string}[]; images?:string[]; caption?:string|null};
export type Project = Omit<(typeof records)[number], 'content_sections'> & {content_sections:Section[]};
export const projects: Project[] = records as Project[];
export const categories = ['Brand & Narrative Strategy','Campaign Development','Identity & Design Systems','Creative Technology & Interactive','Art Direction','Photography & Film'];
export const featured = projects.filter(p=>p.featured).sort((a,b)=>a.featured_order-b.featured_order);
export const findProject = (slug:string) => projects.find(p=>p.slug===slug);
export type MediaSlot = {key:string; label:string; projectSlug:string; projectTitle:string};
export function projectSlots(p:Project):MediaSlot[]{
 const slots:MediaSlot[]=[{key:`${p.slug}:cover`,label:'Cover / homepage hero',projectSlug:p.slug,projectTitle:p.title},{key:`${p.slug}:thumbnail`,label:'Thumbnail / selected work / index',projectSlug:p.slug,projectTitle:p.title}];
 p.content_sections.forEach((s,i)=>{
  const count = ['gallery','diptych'].includes(s.type)?3:['split_text_image','text_image','full_image','full_visual','video','system_diagram'].includes(s.type)?1:0;
  for(let n=0;n<count;n++) slots.push({key:`${p.slug}:section:${i}:${n}`,label:`${s.narrative_stage||'Section'} — ${s.heading||s.type}${count>1?` / ${n+1}`:''}`,projectSlug:p.slug,projectTitle:p.title});
 });
 return slots;
}
export const allSlots=projects.flatMap(projectSlots);
export const validSlots=new Set(allSlots.map(s=>s.key));
