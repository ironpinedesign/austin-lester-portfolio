import type {Metadata} from 'next';
import {requireChatGPTUser} from '../chatgpt-auth';
import {studioIdentity} from '../../lib/studio-auth';
import {siteSettings} from '../../lib/storage';
import {projects,allSlots} from '../../lib/projects';
import Studio from './studio';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Media Studio',robots:{index:false,follow:false},openGraph:{title:'Media Studio',images:[]},twitter:{images:[]}};
async function ProtectedStudio(){await requireChatGPTUser('/studio');const identity=await studioIdentity();return <Studio claimed={identity.claimed} isOwner={identity.isOwner} displayName={identity.user!.displayName} projects={projects.map(p=>({slug:p.slug,title:p.title,number:p.project_number}))} slots={allSlots} initialSettings={identity.isOwner?await siteSettings():{contact_email:'',location:'',linkedin:''}}/>}
export default function StudioPage(){return <ProtectedStudio/>}
