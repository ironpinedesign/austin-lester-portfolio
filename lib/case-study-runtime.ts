import type {
 CaseNavigationVariant,
 CaseSectionRole,
 CaseSpecializedComponentId,
 SectionInteractionConfig,
 SectionLayoutConfig
} from './case-study-schema';
import type {Project,Section} from './projects';

export type CaseStudyRuntime={
 showCover:boolean;
 coverSlotName:string;
 openingQualifier?:string;
 navigationVariant:CaseNavigationVariant;
 relatedProjectIds:string[];
};

export type SectionRuntime={
 semanticRole:CaseSectionRole|null;
 specializedComponent?:CaseSpecializedComponentId;
 dark:boolean;
 mediaSlots:string[];
 interaction:SectionInteractionConfig|undefined;
 layoutConfig:SectionLayoutConfig|null|undefined;
};

export function resolveCaseStudyRuntime(
 project:Project,
 fallback:{showCover?:boolean;coverSlotName?:string}={}
):CaseStudyRuntime{
 const config=project.case_study;
 return {
  showCover:config?.opening.cover.enabled??fallback.showCover??true,
  coverSlotName:config?.opening.cover.slot||fallback.coverSlotName||'hero',
  openingQualifier:config?.opening.qualifier,
  // Slug behavior remains only as a legacy fallback. Modular projects must
  // express navigation through case_study.navigation.variant.
  navigationVariant:config?.navigation.variant||(project.slug==='kryptek-identity-system'?'compact':'continue'),
  relatedProjectIds:config?.navigation.relatedProjectIds??project.related_project_ids
 };
}

export function resolveSectionRuntime(section:Section):SectionRuntime{
 const modular=section.modular;
 if(!modular){
  return {
   semanticRole:null,
   dark:section.background==='dark'||section.type==='dark_statement',
   mediaSlots:section.media_slots,
   interaction:section.interaction,
   layoutConfig:section.layout_system
  };
 }

 // Preserve transitional fields that do not yet have a modular home
 // (systemItems / annotations) while modular geometry and media values win.
 const layoutConfig:SectionLayoutConfig|null|undefined=modular.layout?{
  ...(section.layout_system||{}),
  layout:modular.layout.id,
  mediaLayout:modular.media?.layout,
  viewportBleed:modular.layout.viewportBleed,
  reverse:modular.layout.reverse,
  caption:modular.media?.caption,
  metadata:modular.media?.metadata,
  mediaNote:modular.media?.note
 }:section.layout_system;

 return {
  semanticRole:modular.semanticRole,
  specializedComponent:modular.specializedComponent,
  dark:modular.surface==='dark',
  mediaSlots:modular.media?.slots??section.media_slots,
  // Specialized components may temporarily reuse the established interaction
  // data until their dedicated renderer exists. Ordinary modular sections do
  // not silently inherit legacy interaction behavior.
  interaction:modular.interaction??(modular.specializedComponent?section.interaction:undefined),
  layoutConfig
 };
}
