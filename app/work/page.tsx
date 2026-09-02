import type { Metadata } from 'next';
import {getContent} from '../../lib/content';
import { mediaMap } from '../../lib/storage';
import ProjectIndex from './project-index';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Project Index',description:'Nine projects across strategy, creative direction, design, photography, film, and interactive technology.',alternates:{canonical:'/work'},openGraph:{url:'/work'}};
export default async function Work({searchParams}:{searchParams:Promise<{intent?:string}>}){const {intent}=await searchParams;const {projects,categories,text}=await getContent();return <ProjectIndex projects={projects} categories={categories} initialIntent={categories.includes(intent||'')?intent!:'All'} map={await mediaMap()} copy={Object.fromEntries(["opening.eyebrow","opening.heading","opening.body","opening.count_label","filters.all_label","index.empty_message"].map(k=>[k,text(`work.${k}`)]))}/>}
