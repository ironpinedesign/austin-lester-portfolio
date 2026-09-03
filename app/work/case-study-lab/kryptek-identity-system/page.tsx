import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {CaseStudyArticle} from '../../case-study-renderer';
import {getContent} from '../../../../lib/content';
import {buildKryptekIdentityIntegrationMediaMap,buildKryptekIdentityIntegrationProject} from '../../../../lib/case-study-lab';
import {mediaMap} from '../../../../lib/storage';

export const dynamic='force-dynamic';

export const metadata:Metadata={
 title:'Case Study Layout Integration Proof · Kryptek Identity System',
 robots:{index:false,follow:false},
 alternates:{canonical:'/work/case-study-lab/kryptek-identity-system'}
};

export default async function KryptekIntegrationProofPage(){
 const {allProjects,projects,text}=await getContent();
 const base=allProjects.find((project)=>project.slug==='kryptek-identity-system');
 if(!base)notFound();

 const prototype=buildKryptekIdentityIntegrationProject(base);
 const productionMap=await mediaMap();
 const integrationMap=buildKryptekIdentityIntegrationMediaMap(prototype,productionMap);

 return <CaseStudyArticle
  project={prototype}
  projects={projects}
  map={integrationMap}
  text={text}
  coverSlotName="fixture_21x9_panorama"
  navigationProjectSlug={base.slug}
 />;
}
