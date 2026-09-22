import {assertCaseStudyContract,type ModularSectionConfig,type SectionInteractionConfig} from './case-study-schema.ts';
import type {Project,Section} from './projects';
import type {MediaMap} from './storage';
import {
 resolveKryptekSystemBrowserStates,
 type KryptekSystemBrowserText
} from './kryptek-system-browser.ts';

const CANDIDATE_SLUG='kryptek-identity-system-candidate';
const CANDIDATE_CONTENT_ID='kryptek_identity_candidate';
const candidateSectionId=(sourceId:string)=>`candidate__${sourceId}`;
const modularSectionId=(sourceId:string)=>`modular__${sourceId}`;

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
  semanticRole:'insight',
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
  surface:'light'
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

function buildModularSection(
 recipe:CandidateRecipe,
 sources:Map<string,Section>,
 contentId:string,
 text?:KryptekSystemBrowserText
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
  sourceIds:editorialIntro
   ?[editorialIntro.content_id,source.content_id]
   :[source.content_id],
  layout:recipe.layout,
  media,
  interaction:cloneInteraction(source.interaction),
  specializedComponent:recipe.specializedComponent,
  systemBrowser:recipe.specializedComponent==='SYSTEM BROWSER'
   ?{states:resolveKryptekSystemBrowserStates(text)}
   :undefined
 };

 return {
  ...sourceCopy,
  type:recipe.semanticRole==='outcome'?'text':sourceCopy.type,
  content_id:contentId,
  modular
 };
}

function modularCaseStudyConfig(base:Project){
 return {
  version:1 as const,
  shell:{variant:'canonical' as const},
  opening:{cover:{enabled:false}},
  navigation:{
   variant:'compact' as const,
   relatedProjectIds:[...base.related_project_ids]
  }
 };
}

export function buildKryptekIdentityModularProject(
 base:Project,
 text?:KryptekSystemBrowserText
):Project{
 const sources=sourceMap(base);
 const sections=CANDIDATE_RECIPE.map((recipe)=>
  buildModularSection(
   recipe,
   sources,
   modularSectionId(recipe.sourceId),
   text
  )
 );

 const project:Project={
  ...structuredClone(base),
  content_sections:sections,
  case_study:modularCaseStudyConfig(base)
 };

 assertCaseStudyContract(project);
 return project;
}

export function buildKryptekIdentityCandidateProject(
 base:Project,
 text?:KryptekSystemBrowserText
):Project{
 const sources=sourceMap(base);
 const sections=CANDIDATE_RECIPE.map((recipe)=>
  buildModularSection(
   recipe,
   sources,
   candidateSectionId(recipe.sourceId),
   text
  )
 );

 const candidate:Project={
  ...structuredClone(base),
  slug:CANDIDATE_SLUG,
  content_id:CANDIDATE_CONTENT_ID,
  featured:false,
  published:false,
  is_sample:true,
  content_sections:sections,
  case_study:modularCaseStudyConfig(base)
 };

 assertCaseStudyContract(candidate);
 return candidate;
}

export function buildKryptekIdentityModularMediaMap(
 base:Project,
 target:Project,
 productionMap:MediaMap
):MediaMap{
 const merged:MediaMap={...productionMap};
 const sourceById=sourceMap(base);

 for(const targetSection of target.content_sections){
  const sourceId=targetSection.content_id.replace(
   /^(?:candidate|modular)__/,
   ''
  );
  const sourceSection=sourceById.get(sourceId);
  if(!sourceSection)continue;

  for(const slotName of targetSection.media_slots){
   const sourceKey=
    `project.${base.content_id}.${sourceSection.content_id}.${slotName}`;
   const targetKey=
    `project.${target.content_id}.${targetSection.content_id}.${slotName}`;
   const media=productionMap[sourceKey];

   if(media)merged[targetKey]={...media,slot:targetKey};
  }
 }

 return merged;
}

export function buildKryptekIdentityCandidateMediaMap(
 base:Project,
 candidate:Project,
 productionMap:MediaMap
):MediaMap{
 return buildKryptekIdentityModularMediaMap(
  base,
  candidate,
  productionMap
 );
}
