import type { Metadata } from 'next';
import { projects,categories } from '../../lib/projects';
import { mediaMap } from '../../lib/storage';
import ProjectIndex from './project-index';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Project Index',description:'Nine projects across strategy, creative direction, design, photography, film, and interactive technology.'};
export default async function Work({searchParams}:{searchParams:Promise<{intent?:string}>}){const {intent}=await searchParams;return <ProjectIndex projects={projects} categories={categories} initialIntent={categories.includes(intent||'')?intent!:'All'} map={await mediaMap()}/>}
