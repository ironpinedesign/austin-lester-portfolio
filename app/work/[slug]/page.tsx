import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {CaseStudyArticle} from '../case-study-renderer';
import {getContent} from '../../../lib/content';
import {mediaMap} from '../../../lib/storage';

export const dynamic='force-dynamic';

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const slug=(await params).slug;
 const p=(await getContent()).projects.find((project)=>project.slug===slug);
 if(!p)return {title:'Project not found'};
 const path=`/work/${p.slug}`;
 return {
  title:p.title,
  description:p.thesis,
  alternates:{canonical:path},
  openGraph:{title:p.title,description:p.thesis,type:'article',url:path},
  twitter:{card:'summary_large_image',title:p.title,description:p.thesis}
 };
}

export default async function CaseStudy({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 const {projects,text}=await getContent();
 const p=projects.find((project)=>project.slug===slug);
 if(!p)notFound();

 return <CaseStudyArticle
  project={p}
  projects={projects}
  map={await mediaMap()}
  text={text}
 />;
}
