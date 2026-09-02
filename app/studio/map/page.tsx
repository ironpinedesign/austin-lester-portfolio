import {redirect} from 'next/navigation';
import {requireRequestIdentity} from '../../../lib/identity';
import {studioIdentity} from '../../../lib/studio-auth';
import ContentMap from './map';
import {projects} from '../../../lib/projects';
export const dynamic='force-dynamic';
export const metadata={title:'Site Map',robots:{index:false,follow:false}};
export default async function Page(){await requireRequestIdentity('/studio/map');if(!(await studioIdentity()).isOwner)redirect('/studio');return <ContentMap projects={projects.map(({title,slug,content_id})=>({title,slug,content_id}))}/>}
