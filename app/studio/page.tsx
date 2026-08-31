import type {Metadata} from 'next';
import {requireChatGPTUser} from '../chatgpt-auth';
import {studioIdentity} from '../../lib/studio-auth';
import {siteSettings} from '../../lib/storage';
import {allSlots,registryState} from '../../lib/content-registry';
import {getContent} from '../../lib/content';
import Studio from './studio';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Media Studio',robots:{index:false,follow:false},openGraph:{title:'Media Studio',images:[]},twitter:{images:[]}};
async function ProtectedStudio(){await requireChatGPTUser('/studio');const identity=await studioIdentity();const content=await getContent();const projects=content.allProjects;const active=new Set(registryState(content.values,[],[]).filter(e=>e.active).map(e=>e.id));return <Studio claimed={identity.claimed} isOwner={identity.isOwner} displayName={identity.user!.displayName} projects={projects.map(p=>({slug:p.slug,title:p.title,number:p.project_number}))} slots={allSlots.map(s=>({...s,active:active.has(s.key)}))} initialSettings={identity.isOwner?await siteSettings():{contact_email:'',location:'',linkedin:''}}/>}
export default function StudioPage(){return <ProtectedStudio/>}
