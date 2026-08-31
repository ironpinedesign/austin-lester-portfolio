import {redirect} from 'next/navigation';
import {requireChatGPTUser} from '../../chatgpt-auth';
import {studioIdentity} from '../../../lib/studio-auth';
import ContentMap from './map';
export const dynamic='force-dynamic';
export const metadata={title:'Site Map',robots:{index:false,follow:false}};
export default async function Page(){await requireChatGPTUser('/studio/map');if(!(await studioIdentity()).isOwner)redirect('/studio');return <ContentMap/>}
