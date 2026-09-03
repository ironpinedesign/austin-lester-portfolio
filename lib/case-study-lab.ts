import type {Project,Section} from './projects';
import type {MediaMap} from './storage';

type FixtureSpec={src:string;mime:string;alt:string};

const FIXTURE_LIBRARY:Record<string,FixtureSpec>={
 fixture_21x9_panorama:{src:'/fixtures/layout-21x9.svg',mime:'image/svg+xml',alt:'21:9 panoramic fixture'},
 fixture_16x9_landscape:{src:'/fixtures/layout-16x9.svg',mime:'image/svg+xml',alt:'16:9 landscape fixture'},
 fixture_4x3_landscape:{src:'/fixtures/layout-4x3.svg',mime:'image/svg+xml',alt:'4:3 landscape fixture'},
 fixture_1x1_square:{src:'/fixtures/layout-square.svg',mime:'image/svg+xml',alt:'1:1 square fixture'},
 fixture_4x5_portrait:{src:'/fixtures/layout-4x5.svg',mime:'image/svg+xml',alt:'4:5 portrait fixture'},
 fixture_tall_editorial:{src:'/fixtures/layout-tall-editorial.svg',mime:'image/svg+xml',alt:'Tall editorial fixture'},
 fixture_spread_2page:{src:'/fixtures/layout-two-page-spread.svg',mime:'image/svg+xml',alt:'Two-page editorial spread fixture'},
 fixture_specimen_ring:{src:'/fixtures/layout-specimen.svg',mime:'image/svg+xml',alt:'Specimen fixture'},
 fixture_loop_video:{src:'/fixtures/interaction-loop.mp4',mime:'video/mp4',alt:'Looping fixture video'}
};

function findSection(project:Project,contentId:string){
 return project.content_sections.find((section)=>section.content_id===contentId);
}

function textOrEmpty(project:Project,contentId:string){
 return findSection(project,contentId)?.body||'';
}

function headingOr(project:Project,contentId:string,fallback:string){
 return findSection(project,contentId)?.heading||fallback;
}

function paragraph(text:string,index:number){
 const paragraphs=text.split(/\n\s*\n/).filter(Boolean);
 return paragraphs[index]||paragraphs[0]||text;
}

export function buildKryptekIdentityIntegrationProject(base:Project):Project{
 const contextBody=textOrEmpty(base,'context');
 const strategyBody=textOrEmpty(base,'strategy');
 const systemBody=textOrEmpty(base,'system');
 const workBody=textOrEmpty(base,'work');
 const outcomeBody=textOrEmpty(base,'outcome');
 const creditsBody=textOrEmpty(base,'credits');

 const sections:Section[]=[
  {
   content_id:'kis_02_hero',
   type:'full_visual',
   narrative_stage:'KIS_02',
   heading:'Identity system hero frame.',
   body:'A single dominant frame establishes the case-study opening while preserving semantic narrative and metadata outside media assets.',
   background:'light',
   media_slots:['fixture_21x9_panorama'],
   layout:null,
   quote:null,
   quote_attribution:null,
   caption:null,
   metrics:[],
   images:[],
   layout_system:{layout:'FULL BLEED 01'}
  },
  {
   content_id:'kis_03_context',
   type:'text_image',
   narrative_stage:'Context · KIS_03',
   heading:headingOr(base,'context','A recognized pattern without a unified identity system.'),
   body:contextBody,
   background:'light',
   media_slots:['fixture_4x3_landscape','fixture_4x5_portrait','fixture_1x1_square'],
   layout:null,
   quote:null,
   quote_attribution:null,
   caption:null,
   metrics:[],
   images:[],
   layout_system:{
    layout:'TEXT SIDECAR 01',
    mediaLayout:'ASYMMETRIC GRID 02',
    mediaNote:'Media slots exercise dominant plus optional supports; support_03 is omitted intentionally.'
   },
   interaction:{
    infoDisclosure:{
     enabled:true,
     label:'Slot Notes',
     heading:'Optional support behavior',
     body:'This section intentionally omits the final optional support slot to confirm graceful fallback behavior in production rendering.',
     variant:'inline'
    }
   }
  },
  {
   content_id:'kis_05_system_stage',
   type:'text_image',
   narrative_stage:'Insight / Strategy · KIS_05',
   heading:'Indexed system navigation plus central system field.',
   body:`${paragraph(strategyBody,0)}\n\n${paragraph(systemBody,0)}`,
   background:'light',
   media_slots:['fixture_specimen_ring','fixture_16x9_landscape','fixture_4x5_portrait'],
   layout:null,
   quote:null,
   quote_attribution:null,
   caption:null,
   metrics:[],
   images:[],
   layout_system:{
    layout:'SYSTEM STAGE 01',
    mediaLayout:'SPECIMEN FIELD 02',
    mediaNote:'Dominant system specimen with subordinate subsystem evidence.',
    systemItems:[
     {id:'foundation',label:'Brand Foundation',description:'Equity, values, and narrative stance.'},
     {id:'identity',label:'Identity + Usage',description:'Master marks and governance rules.'},
     {id:'language',label:'Language + Iconography',description:'Voice, icon semantics, and symbol logic.'},
     {id:'application',label:'Application',description:'Ecommerce, editorial, and campaign extensions.'}
    ]
   }
  },
  {
   content_id:'kis_08_ecommerce',
   type:'text_image',
   narrative_stage:'KIS_08',
   heading:'Ecommerce and product storytelling within the identity system.',
   body:paragraph(systemBody,1),
   background:'light',
   media_slots:['fixture_16x9_landscape'],
   layout:null,
   quote:null,
   quote_attribution:null,
   caption:null,
   metrics:[],
   images:[],
   layout_system:{
    layout:'MEDIA SIDECAR 01',
    caption:'Ecommerce expression remains attached to explanatory copy in the sidecar.',
    metadata:'Fixture slot routed through production media slot addressing.'
   }
  },
  {
   content_id:'kis_09_editorial_inspect',
   type:'gallery',
   narrative_stage:'KIS_09',
   heading:'Editorial sequence with inspect-enabled evidence.',
   body:'Editorial progression is configured in section data while inspect remains an interaction layer attached to selected slots.',
   background:'light',
   media_slots:['fixture_spread_2page','fixture_tall_editorial','fixture_4x5_portrait','fixture_1x1_square'],
   layout:null,
   quote:null,
   quote_attribution:null,
   caption:null,
   metrics:[],
   images:[],
   layout_system:{
    layout:'FULL BLEED 02',
    mediaLayout:'EDITORIAL SEQUENCE 01',
    mediaNote:'Mixed aspect ratios stress sequential layout behavior.'
   },
   interaction:{
    mediaInspect:{
     enabled:true,
     slots:['fixture_spread_2page','fixture_tall_editorial'],
     buttonLabel:'Inspect spread ↗',
     tone:'bone',
     captions:{
      fixture_spread_2page:'Two-page spread with inspect enabled for detail review.',
      fixture_tall_editorial:'Tall editorial page verifies long-format inspect behavior.'
     },
     credits:{
      fixture_spread_2page:'Local integration fixture',
      fixture_tall_editorial:'Local integration fixture'
     }
    }
   }
  },
  {
   content_id:'sticky_narrative_01_proof',
   type:'text_image',
   narrative_stage:'Validation · Sticky Narrative 01',
   heading:'Sticky narrative with progressing media inside case-study shell.',
   body:'The narrative pane stays anchored through media progression at desktop widths and releases naturally on mobile.',
   background:'light',
   media_slots:['fixture_16x9_landscape','fixture_4x3_landscape','fixture_tall_editorial','fixture_21x9_panorama'],
   layout:null,
   quote:null,
   quote_attribution:null,
   caption:null,
   metrics:[],
   images:[],
   layout_system:{layout:'STICKY NARRATIVE 01',mediaLayout:'EDITORIAL SEQUENCE 01'}
  },
  {
   content_id:'sticky_narrative_02_proof',
   type:'text_image',
   narrative_stage:'Validation · Sticky Narrative 02',
   heading:'Sticky visual anchor with progressing narrative.',
   body:'This verifies sticky start and release boundaries against actual case-study spacing and neighboring sections.',
   background:'light',
   media_slots:['fixture_loop_video'],
   layout:null,
   quote:null,
   quote_attribution:null,
   caption:null,
   metrics:[],
   images:[],
   layout_system:{
    layout:'STICKY NARRATIVE 02',
    caption:'Desktop sticky visual; mobile reverts to linear document flow.'
   }
  },
  {
   content_id:'annotated_stage_01_proof',
   type:'text_image',
   narrative_stage:'Validation · Annotated Stage 01',
   heading:'Annotation-safe stage with attached explanatory notes.',
   body:'Annotations remain attached to live media with normalized coordinates and semantic annotation copy in HTML.',
   background:'light',
   media_slots:['fixture_4x3_landscape'],
   layout:null,
   quote:null,
   quote_attribution:null,
   caption:null,
   metrics:[],
   images:[],
   layout_system:{
    layout:'ANNOTATED STAGE 01',
    caption:'Annotation notes remain text content, not baked into image pixels.',
    metadata:'Coordinates use normalized 0-100 values.',
    annotations:[
     {title:'Anchor point A',body:'Narrative callout attached to the dominant evidence region.'},
     {title:'Anchor point B',body:'Rail notes remain readable when layout collapses on mobile.'}
    ]
   },
   interaction:{
    mediaDetail:{
     enabled:true,
     items:[
      {
       slot:'fixture_4x3_landscape',
       label:'Detail +',
       title:'Media detail integration',
       body:'MediaDetail composes with ANNOTATED STAGE 01 without bespoke renderer code.',
       x:62,
       y:36
      }
     ]
    }
   }
  },
  {
   content_id:'kis_10_campaign_archive',
   type:'gallery',
   narrative_stage:'KIS_10',
   heading:'Campaign rollout evidence with selected archive lead.',
   body:workBody,
   background:'light',
   media_slots:['fixture_4x3_landscape','fixture_1x1_square','fixture_4x5_portrait','fixture_16x9_landscape','fixture_21x9_panorama','fixture_missing_slot'],
   layout:null,
   quote:null,
   quote_attribution:null,
   caption:null,
   metrics:[],
   images:[],
   layout_system:{
    layout:'FULL BLEED 02',
    mediaLayout:'ARCHIVE GRID 02',
    mediaNote:'Support rail includes one unmapped slot to verify missing media fallback rendering.'
   }
  },
    {
     content_id:'stress_asymmetric_grid_02',
     type:'gallery',
     narrative_stage:'Stress Test · ASYMMETRIC GRID 02',
     heading:'Partial sets from dominant-only through full set.',
     body:'Four sequential sections verify optional slot collapse without fabricated placeholder cells.',
     background:'light',
     media_slots:['fixture_4x3_landscape'],
     layout:null,
     quote:null,
     quote_attribution:null,
     caption:null,
     metrics:[],
     images:[],
     layout_system:{layout:'FULL BLEED 02',mediaLayout:'ASYMMETRIC GRID 02',mediaNote:'Case A: dominant only'}
    },
    {
     content_id:'stress_asymmetric_grid_02_plus_1',
     type:'gallery',
     narrative_stage:'Stress Test · ASYMMETRIC GRID 02',
     heading:'Dominant + 1 support.',
     body:'Case B checks one optional support.',
     background:'light',
     media_slots:['fixture_4x3_landscape','fixture_1x1_square'],
     layout:null,
     quote:null,
     quote_attribution:null,
     caption:null,
     metrics:[],
     images:[],
     layout_system:{layout:'FULL BLEED 02',mediaLayout:'ASYMMETRIC GRID 02',mediaNote:'Case B: dominant + 1 support'}
    },
    {
     content_id:'stress_asymmetric_grid_02_plus_2',
     type:'gallery',
     narrative_stage:'Stress Test · ASYMMETRIC GRID 02',
     heading:'Dominant + 2 supports.',
     body:'Case C checks stack reflow with two supports.',
     background:'light',
     media_slots:['fixture_4x3_landscape','fixture_1x1_square','fixture_4x5_portrait'],
     layout:null,
     quote:null,
     quote_attribution:null,
     caption:null,
     metrics:[],
     images:[],
     layout_system:{layout:'FULL BLEED 02',mediaLayout:'ASYMMETRIC GRID 02',mediaNote:'Case C: dominant + 2 supports'}
    },
    {
     content_id:'stress_asymmetric_grid_02_full',
     type:'gallery',
     narrative_stage:'Stress Test · ASYMMETRIC GRID 02',
     heading:'Dominant + full support set.',
     body:'Case D checks full optional set.',
     background:'light',
     media_slots:['fixture_4x3_landscape','fixture_1x1_square','fixture_4x5_portrait','fixture_16x9_landscape'],
     layout:null,
     quote:null,
     quote_attribution:null,
     caption:null,
     metrics:[],
     images:[],
     layout_system:{layout:'FULL BLEED 02',mediaLayout:'ASYMMETRIC GRID 02',mediaNote:'Case D: dominant + 3 supports'}
    },
    {
     content_id:'stress_specimen_field_02_dominant_only',
     type:'gallery',
     narrative_stage:'Stress Test · SPECIMEN FIELD 02',
     heading:'Dominant only.',
     body:'Case A checks support omission.',
     background:'light',
     media_slots:['fixture_specimen_ring'],
     layout:null,
     quote:null,
     quote_attribution:null,
     caption:null,
     metrics:[],
     images:[],
     layout_system:{layout:'FULL BLEED 02',mediaLayout:'SPECIMEN FIELD 02',mediaNote:'Case A: dominant only'}
    },
    {
     content_id:'stress_specimen_field_02_plus_1',
     type:'gallery',
     narrative_stage:'Stress Test · SPECIMEN FIELD 02',
     heading:'Dominant + 1 support.',
     body:'Case B checks partial support stack.',
     background:'light',
     media_slots:['fixture_specimen_ring','fixture_1x1_square'],
     layout:null,
     quote:null,
     quote_attribution:null,
     caption:null,
     metrics:[],
     images:[],
     layout_system:{layout:'FULL BLEED 02',mediaLayout:'SPECIMEN FIELD 02',mediaNote:'Case B: dominant + 1 support'}
    },
    {
     content_id:'stress_specimen_field_02_full',
     type:'gallery',
     narrative_stage:'Stress Test · SPECIMEN FIELD 02',
     heading:'Dominant + full support set.',
     body:'Case C checks full set.',
     background:'light',
     media_slots:['fixture_specimen_ring','fixture_1x1_square','fixture_4x5_portrait'],
     layout:null,
     quote:null,
     quote_attribution:null,
     caption:null,
     metrics:[],
     images:[],
     layout_system:{layout:'FULL BLEED 02',mediaLayout:'SPECIMEN FIELD 02',mediaNote:'Case C: dominant + 2 supports'}
    },
    {
     content_id:'stress_editorial_sequence_01_item_1',
     type:'gallery',
     narrative_stage:'Stress Test · EDITORIAL SEQUENCE 01',
     heading:'Sequence with 1 item.',
     body:'Case A checks minimum sequence.',
     background:'light',
     media_slots:['fixture_spread_2page'],
     layout:null,
     quote:null,
     quote_attribution:null,
     caption:null,
     metrics:[],
     images:[],
     layout_system:{layout:'FULL BLEED 02',mediaLayout:'EDITORIAL SEQUENCE 01',mediaNote:'Case A: 1 item'}
    },
    {
     content_id:'stress_editorial_sequence_01_item_2',
     type:'gallery',
     narrative_stage:'Stress Test · EDITORIAL SEQUENCE 01',
     heading:'Sequence with 2 items.',
     body:'Case B checks lead + one follow-up.',
     background:'light',
     media_slots:['fixture_spread_2page','fixture_tall_editorial'],
     layout:null,
     quote:null,
     quote_attribution:null,
     caption:null,
     metrics:[],
     images:[],
     layout_system:{layout:'FULL BLEED 02',mediaLayout:'EDITORIAL SEQUENCE 01',mediaNote:'Case B: 2 items'}
    },
    {
     content_id:'stress_editorial_sequence_01_item_3',
     type:'gallery',
     narrative_stage:'Stress Test · EDITORIAL SEQUENCE 01',
     heading:'Sequence with 3 items.',
     body:'Case C checks balanced progression.',
     background:'light',
     media_slots:['fixture_spread_2page','fixture_tall_editorial','fixture_4x5_portrait'],
     layout:null,
     quote:null,
     quote_attribution:null,
     caption:null,
     metrics:[],
     images:[],
     layout_system:{layout:'FULL BLEED 02',mediaLayout:'EDITORIAL SEQUENCE 01',mediaNote:'Case C: 3 items'}
    },
    {
     content_id:'stress_editorial_sequence_01_item_4',
     type:'gallery',
     narrative_stage:'Stress Test · EDITORIAL SEQUENCE 01',
     heading:'Sequence with 4 items.',
     body:'Case D checks full sequence capacity.',
     background:'light',
     media_slots:['fixture_spread_2page','fixture_tall_editorial','fixture_4x5_portrait','fixture_1x1_square'],
     layout:null,
     quote:null,
     quote_attribution:null,
     caption:null,
     metrics:[],
     images:[],
     layout_system:{layout:'FULL BLEED 02',mediaLayout:'EDITORIAL SEQUENCE 01',mediaNote:'Case D: 4 items'}
    },
    {
     content_id:'stress_archive_grid_01_count_1',
     type:'gallery',
     narrative_stage:'Stress Test · ARCHIVE GRID 01',
     heading:'Archive count 1.',
     body:'Case A checks single-item archive.',
     background:'light',
     media_slots:['fixture_1x1_square'],
     layout:null,
     quote:null,
     quote_attribution:null,
     caption:null,
     metrics:[],
     images:[],
     layout_system:{layout:'FULL BLEED 02',mediaLayout:'ARCHIVE GRID 01',mediaNote:'Case A: 1 item'}
    },
    {
     content_id:'stress_archive_grid_01_count_3',
     type:'gallery',
     narrative_stage:'Stress Test · ARCHIVE GRID 01',
     heading:'Archive count 3.',
     body:'Case B checks compact trio.',
     background:'light',
     media_slots:['fixture_1x1_square','fixture_4x5_portrait','fixture_16x9_landscape'],
     layout:null,
     quote:null,
     quote_attribution:null,
     caption:null,
     metrics:[],
     images:[],
     layout_system:{layout:'FULL BLEED 02',mediaLayout:'ARCHIVE GRID 01',mediaNote:'Case B: 3 items'}
    },
    {
     content_id:'stress_archive_grid_01_count_6',
     type:'gallery',
     narrative_stage:'Stress Test · ARCHIVE GRID 01',
     heading:'Archive count 6.',
     body:'Case C checks six-item baseline.',
     background:'light',
     media_slots:['fixture_1x1_square','fixture_4x5_portrait','fixture_16x9_landscape','fixture_4x3_landscape','fixture_21x9_panorama','fixture_tall_editorial'],
     layout:null,
     quote:null,
     quote_attribution:null,
     caption:null,
     metrics:[],
     images:[],
     layout_system:{layout:'FULL BLEED 02',mediaLayout:'ARCHIVE GRID 01',mediaNote:'Case C: 6 items'}
    },
    {
     content_id:'stress_archive_grid_01_count_8',
     type:'gallery',
     narrative_stage:'Stress Test · ARCHIVE GRID 01',
     heading:'Archive count > 6.',
     body:'Case D checks larger archive density.',
     background:'light',
     media_slots:['fixture_1x1_square','fixture_4x5_portrait','fixture_16x9_landscape','fixture_4x3_landscape','fixture_21x9_panorama','fixture_tall_editorial','fixture_spread_2page','fixture_specimen_ring'],
     layout:null,
     quote:null,
     quote_attribution:null,
     caption:null,
     metrics:[],
     images:[],
     layout_system:{layout:'FULL BLEED 02',mediaLayout:'ARCHIVE GRID 01',mediaNote:'Case D: 8 items'}
    },
    {
     content_id:'stress_archive_grid_02_dominant_only',
     type:'gallery',
     narrative_stage:'Stress Test · ARCHIVE GRID 02',
     heading:'Dominant only.',
     body:'Case A checks support rail omission.',
     background:'light',
     media_slots:['fixture_4x3_landscape'],
     layout:null,
     quote:null,
     quote_attribution:null,
     caption:null,
     metrics:[],
     images:[],
     layout_system:{layout:'FULL BLEED 02',mediaLayout:'ARCHIVE GRID 02',mediaNote:'Case A: dominant only'}
    },
    {
     content_id:'stress_archive_grid_02_plus_1',
     type:'gallery',
     narrative_stage:'Stress Test · ARCHIVE GRID 02',
     heading:'Dominant + 1 support.',
     body:'Case B checks minimal support rail.',
     background:'light',
     media_slots:['fixture_4x3_landscape','fixture_1x1_square'],
     layout:null,
     quote:null,
     quote_attribution:null,
     caption:null,
     metrics:[],
     images:[],
     layout_system:{layout:'FULL BLEED 02',mediaLayout:'ARCHIVE GRID 02',mediaNote:'Case B: dominant + 1 support'}
    },
    {
     content_id:'stress_archive_grid_02_plus_3',
     type:'gallery',
     narrative_stage:'Stress Test · ARCHIVE GRID 02',
     heading:'Dominant + 3 supports.',
     body:'Case C checks medium support rail.',
     background:'light',
     media_slots:['fixture_4x3_landscape','fixture_1x1_square','fixture_4x5_portrait','fixture_16x9_landscape'],
     layout:null,
     quote:null,
     quote_attribution:null,
     caption:null,
     metrics:[],
     images:[],
     layout_system:{layout:'FULL BLEED 02',mediaLayout:'ARCHIVE GRID 02',mediaNote:'Case C: dominant + 3 supports'}
    },
    {
     content_id:'stress_archive_grid_02_large',
     type:'gallery',
     narrative_stage:'Stress Test · ARCHIVE GRID 02',
     heading:'Larger archive support set.',
     body:'Case D checks larger support rail with mixed ratios.',
     background:'light',
     media_slots:['fixture_4x3_landscape','fixture_1x1_square','fixture_4x5_portrait','fixture_16x9_landscape','fixture_tall_editorial','fixture_spread_2page'],
     layout:null,
     quote:null,
     quote_attribution:null,
     caption:null,
     metrics:[],
     images:[],
     layout_system:{layout:'FULL BLEED 02',mediaLayout:'ARCHIVE GRID 02',mediaNote:'Case D: larger support rail'}
    },
    {
     content_id:'required_media_missing_full_bleed',
     type:'full_visual',
     narrative_stage:'Failure Test · Required Missing',
     heading:'FULL BLEED 01 without required media slot.',
     body:'Intentional required-media omission verifies graceful fallback and incomplete-state detectability.',
     background:'light',
     media_slots:[],
     layout:null,
     quote:null,
     quote_attribution:null,
     caption:null,
     metrics:[],
     images:[],
     layout_system:{layout:'FULL BLEED 01'}
    },
    {
     content_id:'required_media_missing_archive_selected',
     type:'gallery',
     narrative_stage:'Failure Test · Required Missing',
     heading:'ARCHIVE GRID 02 without dominant required media.',
     body:'Intentional omission validates non-crashing behavior without fixture leakage.',
     background:'light',
     media_slots:[],
     layout:null,
     quote:null,
     quote_attribution:null,
     caption:null,
     metrics:[],
     images:[],
     layout_system:{layout:'FULL BLEED 02',mediaLayout:'ARCHIVE GRID 02',mediaNote:'No dominant media configured'}
    },
  {
   content_id:'outcome',
   type:'text',
   narrative_stage:'Outcome',
   heading:headingOr(base,'outcome','A brand system that could be used, governed, and extended.'),
   body:outcomeBody,
   background:'dark',
   media_slots:[],
   layout:null,
   quote:null,
   quote_attribution:null,
   caption:null,
   metrics:[],
   images:[]
  },
  {
   content_id:'credits',
   type:'text',
   narrative_stage:'Role / Credits',
   heading:headingOr(base,'credits','Role and contribution.'),
   body:creditsBody,
   background:'light',
   media_slots:[],
   layout:null,
   quote:null,
   quote_attribution:null,
   caption:null,
   metrics:[],
   images:[]
  }
 ];

 return {
  ...base,
  title:'Kryptek Identity System · Integration Proof (Internal)',
  subtitle:'Production renderer + configuration path validation for layout system',
  slug:'kryptek-identity-system-integration-proof',
  thesis:'Integration-only internal prototype proving layout, media-slot, and interaction composition through the production case-study renderer path.',
  summary:'This internal proof route validates end-to-end layout assignment through the same section schema used by published case studies while preserving separation between narrative HTML, media evidence, and interaction behavior.',
  content_id:'kryptek_identity_integration_lab',
  featured:false,
  is_sample:true,
  published:false,
  content_sections:sections,
  related_project_ids:[base.content_id]
 };
}

export function buildKryptekIdentityIntegrationMediaMap(project:Project,baseMap:MediaMap):MediaMap{
 const merged:MediaMap={...baseMap};
 const addFixture=(slotKey:string,slotName:string)=>{
  if(merged[slotKey])return;
  const fixture=FIXTURE_LIBRARY[slotName];
  if(!fixture)return;
  merged[slotKey]={
   id:`fixture:${fixture.src}`,
   mime:fixture.mime,
   alt:fixture.alt,
   slot:slotKey
  };
 };

 addFixture(`project.${project.content_id}.opening.fixture_21x9_panorama`,'fixture_21x9_panorama');

 for(const section of project.content_sections){
  for(const slotName of section.media_slots){
   addFixture(`project.${project.content_id}.${section.content_id}.${slotName}`,slotName);
  }
 }

 return merged;
}
