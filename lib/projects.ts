import records from '../content/projects.json';
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

export type CaseSpatialLayoutId=(typeof CASE_SPATIAL_LAYOUT_IDS)[number];
export type CaseMediaLayoutId=(typeof CASE_MEDIA_LAYOUT_IDS)[number];

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
export type Section={content_id:string;media_slots:string[];type:string;narrative_stage?:string|null;heading?:string|null;body?:string|null;background?:string|null;layout?:string|null;layout_system?:SectionLayoutConfig|null;quote?:string|null;quote_attribution?:string|null;metrics?:{content_id:string;label:string;value:string;kind?:string}[];images?:string[];caption?:string|null;interaction?:SectionInteractionConfig};
export type Project=Omit<(typeof records)[number],'content_sections'|'related_project_ids'>&{content_sections:Section[];related_project_ids:string[]};
export const projects:Project[]=records as Project[];
export const categories=['Brand & Narrative Strategy','Campaign Development','Identity & Design Systems','Creative Technology & Interactive','Art Direction','Photography & Film'];
export const categoryKeys=['brand_strategy','campaign','identity','creative_technology','art_direction','photography_film'];
export const featured=projects.filter(p=>p.featured&&p.published).sort((a,b)=>a.featured_order-b.featured_order);
export const findProject=(slug:string)=>projects.find(p=>p.slug===slug&&p.published);
export type MediaSlot={key:string;label:string;projectSlug:string;projectTitle:string;route:string;section:string;location:string;type:string;active:boolean};
export const sectionSlot=(p:Project,s:Section,name='primary_visual')=>`project.${p.content_id}.${s.content_id}.${name}`;
