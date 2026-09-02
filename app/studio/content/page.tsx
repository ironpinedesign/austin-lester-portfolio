import {redirect} from 'next/navigation';
import {requireRequestIdentity} from '../../../lib/identity';
import {studioIdentity} from '../../../lib/studio-auth';
import ContentManager from './manager';
export const dynamic='force-dynamic';
export const metadata={title:'Content / CSV',robots:{index:false,follow:false}};
export default async function Page(){await requireRequestIdentity('/studio/content');if(!(await studioIdentity()).isOwner)redirect('/studio');return <ContentManager/>}
