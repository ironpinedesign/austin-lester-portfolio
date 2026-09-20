import records from '../content/projects.json';
import type {CaseStudyConfig,ModularSectionConfig} from './case-study-schema';
export {
 CASE_MEDIA_LAYOUT_IDS,
 CASE_NAVIGATION_VARIANTS,
 CASE_SECTION_ROLE_IDS,
 CASE_SPATIAL_LAYOUT_IDS,
 CASE_SPECIALIZED_COMPONENT_IDS,
 CASE_SURFACE_IDS
} from './case-study-schema';
export type {
 CaseMediaLayoutId,
 CaseNavigationVariant,
 CaseSectionRole,
 CaseSpatialLayoutId,
 CaseSpecializedComponentId,
 CaseStudyConfig,
 CaseSurface,
 ModularSectionConfig,
 SectionInteractionConfig,
 SectionLayoutConfig
} from './case-study-schema';
import type {SectionInteractionConfig,SectionLayoutConfig} from './case-study-schema';

export type Section={
 content_id:string;
 media_slots:string[];
 type:string;
 narrative_stage?:string|null;
 heading?:string|null;
 body?:string|null;
 background?:string|null;
 layout?:string|null;
 layout_system?:SectionLayoutConfig|null;
 quote?:string|null;
 quote_attribution?:string|null;
 metrics?:{content_id:string;label:string;value:string;kind?:string}[];
 images?:string[];
 caption?:string|null;
 interaction?:SectionInteractionConfig;
 modular?:ModularSectionConfig|null;
};
export type Project=Omit<(typeof records)[number],'content_sections'|'related_project_ids'>&{
 content_sections:Section[];
 related_project_ids:string[];
 case_study?:CaseStudyConfig|null;
};
export const projects:Project[]=records as Project[];
export const categories=['Brand & Narrative Strategy','Campaign Development','Identity & Design Systems','Creative Technology & Interactive','Art Direction','Photography & Film'];
export const categoryLabels=categories.map(c=>c==='Art Direction'?'Creative & Art Direction':c);
export const categoryKeys=['brand_strategy','campaign','identity','creative_technology','art_direction','photography_film'];
export const featured=projects.filter(p=>p.featured&&p.published).sort((a,b)=>a.featured_order-b.featured_order);
export const findProject=(slug:string)=>projects.find(p=>p.slug===slug&&p.published);
export type MediaSlot={key:string;label:string;projectSlug:string;projectTitle:string;route:string;section:string;location:string;type:string;active:boolean};
export const sectionSlot=(p:Project,s:Section,name='primary_visual')=>`project.${p.content_id}.${s.content_id}.${name}`;
