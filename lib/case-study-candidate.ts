import {assertCaseStudyContract,type ModularSectionConfig,type SectionInteractionConfig} from './case-study-schema.ts';
import type {Project,Section} from './projects';
import type {MediaMap} from './storage';

const CANDIDATE_SLUG='kryptek-identity-system-candidate';
const CANDIDATE_CONTENT_ID='kryptek_identity_candidate';
const candidateSectionId=(sourceId:string)=>`candidate__${sourceId}`;

export const KRYPTĒK_CANDIDATE_SOURCE_SECTION_IDS=[
 'kis_02_complete_brand_world',
 'kis_03_inherited_brand_context',
 'insight',
 'kis_05_governing_system',
 'kis_08_ecommerce_application',
 'kis_09_editorial_application',
 'kis_10_campaign_application',
 'outcome',
 'credits'
] as const;

const SYSTEM_BROWSER_STATES=[
 {id:'foundation',label:'FOUNDATION'},
 {id:'identity',label:'IDENTITY'},
 {id:'language',label:'LANGUAGE'},
 {id:'iconography',label:'ICONOGRAPHY'},
 {id:'governance',label:'GOVERNANCE'},
 {id:'application',label:'APPLICATION'}
] as const;

type CandidateSourceId=(typeof KRYPTĒK_CANDIDATE_SOURCE_SECTION_IDS)[number];

type CandidateRecipe={
 sourceId:CandidateSourceId;
 semanticRole:ModularSectionConfig['semanticRole'];
 surface:ModularSectionConfig['surface'];
 layout?:NonNullable<ModularSectionConfig['layout']>;
 mediaLayout?:NonNullable<ModularSectionConfig['media']>['layout'];
 specializedComponent?:ModularSectionConfig['specializedComponent'];
 mergeEditorialIntro?:boolean;
};

const CANDIDATE_RECIPE:CandidateRecipe[]=[
 {
  sourceId:'kis_02_complete_brand_world',
  semanticRole:'narrative',
  surface:'light',
  layout:{id:'FULL BLEED 01'}
 },
 {
  sourceId:'kis_03_inherited_brand_context',
  semanticRole:'narrative',
  surface:'light',
  layout:{id:'TEXT SIDECAR 01'},
  mediaLayout:'ASYMMETRIC GRID 02'
 },
 {
  sourceId:'insight',
  semanticRole:'narrative',
  surface:'light'
 },
 {
  sourceId:'kis_05_governing_system',
  semanticRole:'narrative',
  surface:'light',
  layout:{id:'SYSTEM STAGE 01'},
  mediaLayout:'SPECIMEN FIELD 02',
  specializedComponent:'SYSTEM BROWSER'
 },
 {
  sourceId:'kis_08_ecommerce_application',
  semanticRole:'narrative',
  surface:'light',
  layout:{id:'MEDIA SIDECAR 01'},
  mediaLayout:'ASYMMETRIC GRID 01'
 },
 {
  sourceId:'kis_09_editorial_application',
  semanticRole:'narrative',
  surface:'light',
  layout:{id:'FULL BLEED 02'},
  mediaLayout:'EDITORIAL SEQUENCE 01',
  mergeEditorialIntro:true
 },
 {
  sourceId:'kis_10_campaign_application',
  semanticRole:'narrative',
  surface:'light',
  layout:{id:'TEXT SIDECAR 01'},
  mediaLayout:'ASYMMETRIC GRID 01'
 },
 {
  sourceId:'outcome',
  semanticRole:'outcome',
  surface:'dark'
 },
 {
  sourceId:'credits',
  semanticRole:'credits',
  surface:'light'
 }
];

function sourceMap(base:Project){
 return new Map(base.content_sections.map((section)=>[section.content_id,section]));
}

function requireSource(sources:Map<string,Section>,id:string){
 const section=sources.get(id);
 if(!section)throw new Error(`Kryptek candidate source section is missing: ${id}`);
 return section;
}

function cloneInteraction(interaction:SectionInteractionConfig|undefined){
 return interaction?structuredClone(interaction):undefined;
}

function buildCandidateSection(
 recipe:CandidateRecipe,
 sources:Map<string,Section>
):Section{
 const source=requireSource(sources,recipe.sourceId);
 const editorialIntro=recipe.mergeEditorialIntro?requireSource(sources,'kis_09_editorial_intro'):null;
 const sourceCopy=structuredClone(source);

 delete sourceCopy.layout_system;
 delete sourceCopy.interaction;
 delete sourceCopy.background;
 delete sourceCopy.caption;

 if(recipe.mergeEditorialIntro&&editorialIntro){
  sourceCopy.heading=editorialIntro.heading;
  sourceCopy.body=editorialIntro.body;
  sourceCopy.narrative_stage=editorialIntro.narrative_stage;
 }

 const media=sourceCopy.media_slots.length?{
  slots:[...sourceCopy.media_slots],
  layout:recipe.mediaLayout,
  caption:source.layout_system?.caption||source.caption||undefined,
  metadata:source.layout_system?.metadata,
  note:source.layout_system?.mediaNote
 }:undefined;

 const modular:ModularSectionConfig={
  semanticRole:recipe.semanticRole,
  surface:recipe.surface,
  layout:recipe.layout,
  media,
  interaction:cloneInteraction(source.interaction),
  specializedComponent:recipe.specializedComponent,
  systemBrowser:recipe.specializedComponent==='SYSTEM BROWSER'
   ?{states:SYSTEM_BROWSER_STATES.map((state)=>({...state}))}
   :undefined
 };

 return {
  ...sourceCopy,
  type:recipe.semanticRole==='outcome'?'text':sourceCopy.type,
  content_id:candidateSectionId(recipe.sourceId),
  modular
 };
}

export function buildKryptekIdentityCandidateProject(base:Project):Project{
 const sources=sourceMap(base);
 const sections=CANDIDATE_RECIPE.map((recipe)=>buildCandidateSection(recipe,sources));

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
 const sourceById=sourceMap(base);

 for(const targetSection of candidate.content_sections){
  const sourceId=targetSection.content_id.replace(/^candidate__/,'');
  const sourceSection=sourceById.get(sourceId);
  if(!sourceSection)continue;

  for(const slotName of targetSection.media_slots){
   const sourceKey=`project.${base.content_id}.${sourceSection.content_id}.${slotName}`;
   const targetKey=`project.${candidate.content_id}.${targetSection.content_id}.${slotName}`;
   const media=productionMap[sourceKey];
   if(media)merged[targetKey]={...media,slot:targetKey};
  }
 }

 return merged;
}
