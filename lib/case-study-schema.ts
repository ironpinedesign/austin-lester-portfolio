export const CASE_SPATIAL_LAYOUT_IDS=[
 'FULL BLEED 01',
 'FULL BLEED 02',
 'TEXT SIDECAR 01',
 'MEDIA SIDECAR 01',
 'MEDIA SIDECAR 02',
 'STICKY NARRATIVE 01',
 'STICKY NARRATIVE 02',
 'STATE COMPARE 01',
 'SYSTEM STAGE 01',
 'ANNOTATED STAGE 01'
] as const;

export const CASE_MEDIA_LAYOUT_IDS=[
 'ASYMMETRIC GRID 01',
 'ASYMMETRIC GRID 02',
 'SPECIMEN FIELD 01',
 'SPECIMEN FIELD 02',
 'EDITORIAL SEQUENCE 01',
 'ARCHIVE GRID 01',
 'ARCHIVE GRID 02'
] as const;

export const CASE_SECTION_ROLE_IDS=[
 'narrative',
 'quote',
 'metrics',
 'outcome',
 'credits'
] as const;

export const CASE_SURFACE_IDS=['light','dark'] as const;
export const CASE_NAVIGATION_VARIANTS=['continue','compact'] as const;
export const CASE_SPECIALIZED_COMPONENT_IDS=['SYSTEM BROWSER','VIDEO FEATURE'] as const;

export type CaseSpatialLayoutId=(typeof CASE_SPATIAL_LAYOUT_IDS)[number];
export type CaseMediaLayoutId=(typeof CASE_MEDIA_LAYOUT_IDS)[number];
export type CaseSectionRole=(typeof CASE_SECTION_ROLE_IDS)[number];
export type CaseSurface=(typeof CASE_SURFACE_IDS)[number];
export type CaseNavigationVariant=(typeof CASE_NAVIGATION_VARIANTS)[number];
export type CaseSpecializedComponentId=(typeof CASE_SPECIALIZED_COMPONENT_IDS)[number];

// Transitional layout contract used by the current renderer. New modular
// sections should keep narrative/media content outside this object.
export type SectionLayoutConfig={
 layout?:CaseSpatialLayoutId;
 mediaLayout?:CaseMediaLayoutId;
 viewportBleed?:boolean;
 reverse?:boolean;
 caption?:string;
 metadata?:string;
 mediaNote?:string;
 systemItems?:{id:string;label:string;description?:string}[];
 annotations?:{title:string;body:string}[];
};

export type SectionInteractionConfig={
 expandableNarrative?:{enabled:boolean;previewParagraphs?:number;fade?:boolean;readMoreLabel?:string;showLessLabel?:string};
 infoDisclosure?:{enabled:boolean;label?:string;heading?:string;body?:string;variant?:'inline'|'row'};
 mediaDetail?:{enabled:boolean;items:{slot:string;body:string;title?:string;label?:string;x?:number;y?:number}[]};
 mediaCarousel?:{enabled:boolean;captions?:Record<string,string>;credits?:Record<string,string>};
 inlineLoop?:{enabled:boolean;slots:string[];loop?:boolean};
 mediaInspect?:{enabled:boolean;slots:string[];buttonLabel?:string;captions?:Record<string,string>;credits?:Record<string,string>;tone?:'bone'|'obsidian'};
};

export type ModularSectionLayoutConfig={
 id:CaseSpatialLayoutId;
 viewportBleed?:boolean;
 reverse?:boolean;
};

export type ModularSectionMediaConfig={
 slots:string[];
 layout?:CaseMediaLayoutId;
 caption?:string;
 metadata?:string;
 note?:string;
};

export type CaseSystemBrowserState={
 id:string;
 label:string;
 description?:string;
};

export type CaseSystemBrowserConfig={
 states:CaseSystemBrowserState[];
};

export type ModularSectionConfig={
 semanticRole:CaseSectionRole;
 surface:CaseSurface;
 layout?:ModularSectionLayoutConfig;
 media?:ModularSectionMediaConfig;
 interaction?:SectionInteractionConfig;
 specializedComponent?:CaseSpecializedComponentId;
 systemBrowser?:CaseSystemBrowserConfig;
};

export type CaseStudyOpeningConfig={
 qualifier?:string;
 cover:{
  enabled:boolean;
  slot?:string;
 };
};

export type CaseStudyNavigationConfig={
 variant:CaseNavigationVariant;
 relatedProjectIds?:string[];
};

export type CaseStudyConfig={
 version:1;
 opening:CaseStudyOpeningConfig;
 navigation:CaseStudyNavigationConfig;
};

export type CaseStudyContractSection={
 content_id:string;
 media_slots?:string[];
 modular?:ModularSectionConfig|null;
};

export type CaseStudyContractProject={
 project_number?:string|number|null;
 strategic_intent?:string|null;
 year?:string|number|null;
 title?:string|null;
 subtitle?:string|null;
 client?:string|null;
 thesis?:string|null;
 summary?:string|null;
 role?:unknown[]|null;
 discipline_tags?:unknown[]|null;
 case_study?:CaseStudyConfig|null;
 content_sections:CaseStudyContractSection[];
};

function hasValue(value:unknown){
 return typeof value==='number'||typeof value==='string'&&value.trim().length>0;
}

function enabledInteractionCount(config:SectionInteractionConfig|undefined){
 if(!config)return 0;
 return Object.values(config).filter((value)=>value?.enabled===true).length;
}

export function validateCaseStudyContract(project:CaseStudyContractProject):string[]{
 const errors:string[]=[];
 const requiredOpening:[keyof CaseStudyContractProject,string][]=[
  ['project_number','Project number'],
  ['strategic_intent','Strategic intent'],
  ['year','Year'],
  ['title','Title'],
  ['subtitle','Editorial subtitle'],
  ['client','Client'],
  ['thesis','Thesis'],
  ['summary','Summary']
 ];

 for(const [key,label] of requiredOpening){
  if(!hasValue(project[key]))errors.push(`${label} is required by the shared opening contract.`);
 }
 if(!Array.isArray(project.role)||project.role.length===0)errors.push('Role is required by the shared opening contract.');
 if(!Array.isArray(project.discipline_tags)||project.discipline_tags.length===0)errors.push('Disciplines are required by the shared opening contract.');
 if(!project.case_study)errors.push('Modular case-study configuration is required.');

 const ids=new Set<string>();
 for(const section of project.content_sections){
  if(!section.content_id.trim()){
   errors.push('Every section requires a stable content_id.');
   continue;
  }
  if(ids.has(section.content_id))errors.push(`Duplicate section content_id: ${section.content_id}.`);
  ids.add(section.content_id);

  const config=section.modular;
  if(!config){
   errors.push(`Section ${section.content_id} is missing modular configuration.`);
   continue;
  }

  if(config.layout&&!CASE_SPATIAL_LAYOUT_IDS.includes(config.layout.id))errors.push(`Section ${section.content_id} uses an unsupported spatial layout.`);
  if(config.media?.layout&&!CASE_MEDIA_LAYOUT_IDS.includes(config.media.layout))errors.push(`Section ${section.content_id} uses an unsupported media layout.`);

  const legacySlots=section.media_slots||[];
  const modularSlots=config.media?.slots||[];
  if(legacySlots.length||modularSlots.length){
   if(legacySlots.length!==modularSlots.length||legacySlots.some((slot,index)=>slot!==modularSlots[index])){
    errors.push(`Section ${section.content_id} media slots drift between the transitional and modular contracts.`);
   }
  }

  if(!config.specializedComponent&&enabledInteractionCount(config.interaction)>1){
   errors.push(`Section ${section.content_id} enables more than one primary interaction family.`);
  }

  if(config.specializedComponent==='SYSTEM BROWSER'){
   const states=config.systemBrowser?.states||[];
   if(states.length!==6)errors.push(`Section ${section.content_id} SYSTEM BROWSER requires exactly six semantic states.`);
   const stateIds=new Set(states.map((state)=>state.id));
   if(stateIds.size!==states.length)errors.push(`Section ${section.content_id} SYSTEM BROWSER state ids must be unique.`);
  }
 }

 const outcomes=project.content_sections.filter((section)=>section.modular?.semanticRole==='outcome');
 const credits=project.content_sections.filter((section)=>section.modular?.semanticRole==='credits');
 if(outcomes.length!==1)errors.push(`Exactly one Outcome section is required; found ${outcomes.length}.`);
 if(credits.length>1)errors.push(`At most one Role & Credits section is allowed; found ${credits.length}.`);

 if(outcomes.length===1){
  const outcomeIndex=project.content_sections.indexOf(outcomes[0]);
  const expectedOutcomeIndex=project.content_sections.length-1-(credits.length===1?1:0);
  if(outcomeIndex!==expectedOutcomeIndex)errors.push('Outcome must be the terminal narrative section.');

  if(credits.length===1){
   const creditsIndex=project.content_sections.indexOf(credits[0]);
   if(creditsIndex!==outcomeIndex+1)errors.push('Role & Credits must immediately follow Outcome.');
  }
 }

 return errors;
}

export function assertCaseStudyContract(project:CaseStudyContractProject):void{
 const errors=validateCaseStudyContract(project);
 if(errors.length)throw new Error(`Invalid modular case-study contract:\n- ${errors.join('\n- ')}`);
}
