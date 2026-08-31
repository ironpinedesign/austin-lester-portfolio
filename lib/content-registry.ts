import {siteCopy} from '../content/site-copy';
import {projects,categories,categoryKeys,type Project,type MediaSlot} from './projects';
export type FieldType='text'|'richtext'|'link'|'list'|'boolean'|'number'|'image'|'video';
export type ContentValues=Record<string,string>;
export type Entry={id:string;page:string;route:string;section:string;field:string;location:string;type:FieldType;value:string;editable:boolean;required:boolean;order:number;sourceId?:string;projectId?:string;surface?:'project'|'selected'|'index';slot?:string;active:boolean;status?:'COMPLETE'|'MISSING'|'PLACEHOLDER';note?:string};
const human=(s:string)=>s.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
const fields:Entry[]=[];
function add(e:Omit<Entry,'location'|'order'|'active'>&{active?:boolean}){fields.push({...e,active:e.active??true,order:fields.length,location:`${e.page} > ${e.section} > ${e.field}`})}
const basePages:Record<string,{name:string;route:string}>={global:{name:'Site-wide',route:'/'},home:{name:'Homepage',route:'/'},work:{name:'Work / Index',route:'/work'},about:{name:'About',route:'/about'},contact:{name:'Contact',route:'/contact'}};
for(const [id,value] of Object.entries(siteCopy)){
 const [pageKey,section,...rest]=id.split('.');const p=pageKey==='project'?projects.find(p=>p.content_id===section):undefined;
 const page=p?{name:p.title,route:`/work/${p.slug}`}:basePages[pageKey];
 const type:FieldType=id.endsWith('.destination')||id==='contact.direct.linkedin'?'link':id.endsWith('.items')?'list':/headline|\.body$/.test(id)?'richtext':id.endsWith('.year')?'number':'text';
 add({id,page:page.name,route:page.route,section:human(p?rest[0]:section),field:human((p?rest.slice(1):rest).join(' / ')),type,value,editable:true,required:!id.startsWith('contact.direct.')||!['email','location','linkedin'].includes(rest[0]),projectId:p?.content_id});
}
categories.forEach((c,i)=>add({id:`global.categories.${categoryKeys[i]}.label`,page:'Site-wide',route:'/work',section:'Category filters',field:c,type:'text',value:c,editable:true,required:true}));
export const projectFields:Record<string,FieldType>={title:'text',project_number:'text',subtitle:'text',client:'text',year:'number',role:'list',thesis:'text',summary:'richtext',strategic_intent:'text',discipline_tags:'list',featured:'boolean',featured_order:'number',index_order:'number',published:'boolean',related_project_ids:'list'};
const group=(k:string)=>['featured','featured_order','index_order','published','related_project_ids'].includes(k)?'settings':'opening';
export const projectFieldId=(p:Project,k:string)=>`project.${p.content_id}.${group(k)}.${k}`;
function media(id:string,page:string,route:string,section:string,field:string,p?:Project,surface?:Entry['surface'],type:FieldType='image'){
 add({id,page,route,section,field,type,value:'',editable:true,required:false,slot:id,projectId:p?.content_id,surface});
}
for(const p of projects){
 for(const [key,type] of Object.entries(projectFields)){
  const raw=p[key as keyof Project]; const value=Array.isArray(raw)?raw.join('\n'):String(raw??'');
  add({id:projectFieldId(p,key),page:p.title,route:`/work/${p.slug}`,section:group(key)==='settings'?'Publishing & navigation':'Opening',field:human(key==='related_project_ids'?'related_projects':key),type,value,editable:true,required:['title','year','published','featured','index_order','featured_order','strategic_intent','project_number'].includes(key),projectId:p.content_id,surface:'project'});
 }
 media(`project.${p.content_id}.opening.hero`,p.title,`/work/${p.slug}`,'Opening','Hero image / video',p,'project');
 media(`work.index.${p.content_id}.image`,'Work / Index','/work',`Project index / ${p.title}`,'Thumbnail',p,'index');
 media(`home.selected_work.${p.content_id}.image`,'Homepage','/',`Selected Work / ${p.title}`,'Project image / video',p,'selected');
 if(p.home_layout==='diptych')media(`home.selected_work.${p.content_id}.supporting_image`,'Homepage','/',`Selected Work / ${p.title}`,'Supporting image / video',p,'selected');
 // Shared copy is addressed once in CSV, with explicit read-only references at each reuse.
 for(const area of ['home.selected_work','work.index'])for(const k of ['title','thesis','client','year','role','strategic_intent']){
  add({id:`${area}.${p.content_id}.${k}`,page:area.startsWith('home')?'Homepage':'Work / Index',route:area.startsWith('home')?'/':'/work',section:`${area.startsWith('home')?'Selected Work':'Project index'} / ${p.title}`,field:human(k),type:projectFields[k],value:'',sourceId:projectFieldId(p,k),editable:false,required:false,projectId:p.content_id,surface:area.startsWith('home')?'selected':'index'});
 }
 for(const s of p.content_sections){
  const prefix=`project.${p.content_id}.${s.content_id}`; const section=s.narrative_stage||human(s.content_id);
  const keys=s.type==='pull_quote'?['narrative_stage','quote','quote_attribution']:s.type==='metrics'?['narrative_stage','heading']:['narrative_stage','heading','body'];
  for(const k of keys)add({id:`${prefix}.${k}`,page:p.title,route:`/work/${p.slug}#${s.content_id}`,section,field:human(k),type:k==='body'?'richtext':'text',value:String(s[k as keyof typeof s]??''),editable:true,required:k==='quote',projectId:p.content_id,surface:'project'});
  for(const m of s.metrics||[])for(const k of ['label','value'] as const)add({id:`${prefix}.${m.content_id}.${k}`,page:p.title,route:`/work/${p.slug}#${s.content_id}`,section,field:`${m.label} / ${human(k)}`,type:'text',value:m[k],editable:true,required:true,projectId:p.content_id,surface:'project'});
  for(const name of s.media_slots)media(`${prefix}.${name}`,p.title,`/work/${p.slug}#${s.content_id}`,section,human(name)+(s.type==='video'?' (video)':' (image / video)'),p,'project',s.type==='video'?'video':'image');
 }
}
media('home.hero.image','Homepage','/','Hero','Featured image / video');
media('home.hero.detail_image','Homepage','/','Hero','Detail image / video');
export const registry=fields;
export const registryById=new Map(fields.map(e=>[e.id,e]));
export const validSlots=new Set(fields.filter(e=>e.slot).map(e=>e.id));
export const allSlots:MediaSlot[]=fields.filter(e=>e.slot).sort((a,b)=>(a.id.startsWith('home.hero.')?-1:0)-(b.id.startsWith('home.hero.')?-1:0)).map(e=>({key:e.id,label:`${e.section} > ${e.field}`,projectSlug:e.page==='Homepage'?'home':e.page==='Work / Index'?'work':projects.find(p=>p.content_id===e.projectId)!.slug,projectTitle:e.page,route:e.route,section:e.section,location:e.location,type:e.type,active:true}));
export function contentValue(id:string,values:ContentValues={}):string{const e=registryById.get(id);return e?.sourceId?contentValue(e.sourceId,values):values[id]??e?.value??''}
export function resolveProjects(values:ContentValues):Project[]{return projects.map(original=>{
 const p=structuredClone(original);
 for(const [k,type] of Object.entries(projectFields)){const v=contentValue(projectFieldId(p,k),values);(p as unknown as Record<string,unknown>)[k]=type==='list'?v.split('\n').filter(Boolean):type==='boolean'?v==='true':type==='number'?Number(v):v;}
 p.strategic_intent=contentValue(`global.categories.${categoryKeys[categories.indexOf(p.strategic_intent)]}.label`,values)||p.strategic_intent;
 for(const s of p.content_sections){const prefix=`project.${p.content_id}.${s.content_id}`;for(const k of ['narrative_stage','heading','body','quote','quote_attribution'] as const)if(registryById.has(`${prefix}.${k}`))s[k]=contentValue(`${prefix}.${k}`,values);for(const m of s.metrics||[])for(const k of ['label','value'] as const)m[k]=contentValue(`${prefix}.${m.content_id}.${k}`,values)}
 return p;
})}
export function registryState(values:ContentValues,placements:{slot:string;media_id:string}[],media:{id:string;alt:string}[]):Entry[]{
 const ps=resolveProjects(values);const byId=new Map(ps.map(p=>[p.content_id,p]));const featuredCount=ps.filter(p=>p.published&&p.featured).length;
 return registry.map(e=>{const p=e.projectId?byId.get(e.projectId):null;const active=e.id==='home.hero.image'?featuredCount>0:e.id==='home.hero.detail_image'?featuredCount>2:!p||p.published&&(e.surface!=='selected'||p.featured);const binding=placements.find(b=>b.slot===e.id);const m=binding&&media.find(m=>m.id===binding.media_id);const value=e.slot?binding?.media_id||'':contentValue(e.id,values);let status:Entry['status']=e.slot?(binding?(m?'COMPLETE':'MISSING'):'PLACEHOLDER'):!value.trim()?'MISSING':/\[.*placeholder|coming soon|to be added/i.test(value)?'PLACEHOLDER':'COMPLETE';
 let note=!active?'Not shown while project is unpublished or not featured.':e.sourceId?'Shared copy — edit the original project field.':e.slot?(m&&!m.alt?'Assigned; add alternative text in Media Studio.':m?'Assigned asset':binding?'Asset reference no longer resolves.':'No asset assigned; the site shows a placeholder.') :!value&&e.type==='link'?'Intentionally inactive until a destination is provided.':'';
 if(e.id==='contact.direct.email'&&!value)note='Email action intentionally inactive until you add your confirmed address.';
 if(e.id==='contact.direct.linkedin'&&!value)note='LinkedIn action intentionally inactive until you add your profile.';
 return {...e,value,active,status,note};});
}
export function validateValue(e:Entry,value:string):string|null{
 if(value.length>20000)return 'Use 20,000 characters or fewer.';
 if(/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(value))return 'Unsupported control character.';
 if(e.required&&!value.trim())return 'Required value is missing.';
 if(e.type==='boolean'&&!['true','false'].includes(value))return 'Use true or false.';
 if(e.type==='number'&&(!/^\d+$/.test(value)||Number(value)>99999))return 'Use a whole number from 0 to 99999.';
 if(e.id==='contact.direct.email'&&value&&(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)||value.length>254))return 'Enter a valid email address.';
 if(e.id==='contact.direct.linkedin'&&value){try{const u=new URL(value);if(u.protocol!=='https:'||!['linkedin.com','www.linkedin.com'].includes(u.hostname)||u.username||u.password)throw Error()}catch{return 'Use a full https://www.linkedin.com/ profile link.'}}
 if(e.type==='link'&&value){try{if(!value.startsWith('/')||value.startsWith('//')||/[\\\s]/.test(value))throw Error();const u=new URL(value,'https://portfolio.local');const target=projects.find(p=>`/work/${p.slug}`===u.pathname);const hashes=['#main',...(u.pathname==='/'?['#selected-work']:[]),...(target?target.content_sections.map(s=>`#${s.content_id}`):[])];if(u.origin!=='https://portfolio.local'||!['/','/work','/about','/contact',...projects.map(p=>`/work/${p.slug}`)].includes(u.pathname)||u.hash&&!hashes.includes(u.hash))throw Error()}catch{if(e.id!=='contact.direct.linkedin')return 'Choose an existing portfolio route, such as /work, /about, /contact, or /#selected-work.'}}
 if(e.id.endsWith('.strategic_intent')&&!categories.includes(value))return `Choose one of: ${categories.join('; ')}.`;
 if(e.id.endsWith('.related_project_ids')&&value.split('\n').filter(Boolean).some(v=>!projects.some(p=>p.content_id===v)))return 'Use one project key per line from the Content Map (for example kryptek_identity).';
 return null;
}

// Public media must be used by a currently rendered, published location.
export function publicMediaSlots(values:ContentValues){return new Set(registryState(values,[],[]).filter(e=>e.slot&&e.active).map(e=>e.id))}
