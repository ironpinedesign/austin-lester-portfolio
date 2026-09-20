import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {CaseStudyArticle} from '../../case-study-renderer';
import {getContent} from '../../../../lib/content';
import {buildKryptekIdentityCandidateMediaMap,buildKryptekIdentityCandidateProject} from '../../../../lib/case-study-candidate';
import {mediaMap} from '../../../../lib/storage';

export const dynamic='force-dynamic';

export const metadata:Metadata={
 title:'Kryptek Identity System · Modular Candidate',
 robots:{index:false,follow:false},
 alternates:{canonical:'/work/kryptek-identity-system'}
};

export default async function KryptekIdentityCandidatePage(){
 const {allProjects,projects,text}=await getContent();
 const base=allProjects.find((project)=>project.slug==='kryptek-identity-system');
 if(!base)notFound();

 const candidate=buildKryptekIdentityCandidateProject(base);
 const productionMap=await mediaMap();
 const candidateMap=buildKryptekIdentityCandidateMediaMap(base,candidate,productionMap);
 return <CaseStudyArticle
  project={candidate}
  projects={projects}
  map={candidateMap}
  text={text}
  navigationProjectSlug={base.slug}
 />;
}
