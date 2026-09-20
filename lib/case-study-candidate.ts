import {assertCaseStudyContract,type ModularSectionConfig} from './case-study-schema';
import type {Project,Section} from './projects';
import type {MediaMap} from './storage';

const CANDIDATE_SLUG='kryptek-identity-system-candidate';
const CANDIDATE_CONTENT_ID='kryptek_identity_candidate';
const candidateSectionId=(sourceId:string)=>`candidate__${sourceId}`;

function semanticRole(section:Section):ModularSectionConfig['semanticRole']{
 if(section.content_id==='outcome')return 'outcome';
 if(section.content_id==='credits')return 'credits';
 if(section.type==='pull_quote')return 'quote';
 if(section.type==='metrics')return 'metrics';
 return 'narrative';
}

function modularConfig(section:Section):ModularSectionConfig{
 const layout=section.layout_system?.layout?{
  id:section.layout_system.layout,
  viewportBleed:section.layout_system.viewportBleed,
  reverse:section.layout_system.reverse
 }:undefined;
 const media=section.media_slots.length?{
  slots:[...section.media_slots],
  layout:section.layout_system?.mediaLayout,
  caption:section.layout_system?.caption||section.caption||undefined,
  metadata:section.layout_system?.metadata,
  note:section.layout_system?.mediaNote
 }:undefined;
 const specializedComponent=section.content_id==='kis_05_governing_system'?'SYSTEM BROWSER' as const:undefined;

 return {
  semanticRole:semanticRole(section),
  surface:section.background==='dark'||section.type==='dark_statement'?'dark':'light',
  layout,
  media,
  interaction:specializedComponent?undefined:section.interaction,
  specializedComponent
 };
}

export function buildKryptekIdentityCandidateProject(base:Project):Project{
 const sections=base.content_sections.map((source)=>({
  ...structuredClone(source),
  content_id:candidateSectionId(source.content_id),
  modular:modularConfig(source)
 }));

 const candidate:Project={
  ...structuredClone(base),
  slug:CANDIDATE_SLUG,
  content_id:CANDIDATE_CONTENT_ID,
  featured:false,
  published:false,
  is_sample:true,
  content_sections:sections,
  case_study:{
   version:1,
   opening:{cover:{enabled:false}},
   navigation:{variant:'compact',relatedProjectIds:[...base.related_project_ids]}
  }
 };

 assertCaseStudyContract(candidate);
 return candidate;
}

export function buildKryptekIdentityCandidateMediaMap(base:Project,candidate:Project,productionMap:MediaMap):MediaMap{
 const merged:MediaMap={...productionMap};
 const candidateById=new Map(candidate.content_sections.map((section)=>[section.content_id,section]));

 for(const sourceSection of base.content_sections){
  const targetId=candidateSectionId(sourceSection.content_id);
  const targetSection=candidateById.get(targetId);
  if(!targetSection)continue;

  for(const slotName of targetSection.media_slots){
   const sourceKey=`project.${base.content_id}.${sourceSection.content_id}.${slotName}`;
   const targetKey=`project.${candidate.content_id}.${targetSection.content_id}.${slotName}`;
   const media=productionMap[sourceKey];
   if(media)merged[targetKey]={...media,slot:targetKey};
  }
 }

 return merged;
}
