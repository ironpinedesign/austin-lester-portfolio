import {redirect} from 'next/navigation';
import {requireChatGPTUser} from '../../chatgpt-auth';
import {studioIdentity} from '../../../lib/studio-auth';
import ContentManager from './manager';
export const dynamic='force-dynamic';
export const metadata={title:'Content / CSV',robots:{index:false,follow:false}};
export default async function Page(){await requireChatGPTUser('/studio/content');if(!(await studioIdentity()).isOwner)redirect('/studio');return <ContentManager/>}
