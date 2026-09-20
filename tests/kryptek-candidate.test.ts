import assert from 'node:assert/strict';
import test from 'node:test';
import {
 KRYPTĒK_CANDIDATE_SOURCE_SECTION_IDS,
 buildKryptekIdentityCandidateProject,
 buildKryptekIdentityModularProject
} from '../lib/case-study-candidate.ts';
import type {Project,Section} from '../lib/projects.ts';

function section(content_id:string,overrides:Partial<Section>={}):Section{
 return {
  content_id,
  media_slots:[],
  type:'text',
  narrative_stage:content_id,
  heading:`${content_id} heading`,
  body:`${content_id} body`,
  background:'light',
  ...overrides
 };
}

function baseProject():Project{
 return {
  title:'Kryptek Identity System',
  slug:'kryptek-identity-system',
  project_number:'02',
  subtitle:'Rebuilding a fragmented identity into an operating brand system',
  client:'Kryptek Outdoor Group',
  year:2023,
  role:['Creative Director'],
  thesis:'A thesis.',
  summary:'A summary.',
  strategic_intent:'Identity & Design Systems',
  discipline_tags:['Identity & Design Systems'],
  thumbnail_url:'',
  cover_image_url:'',
  featured:true,
  featured_order:2,
  index_order:2,
  accent_color:'#D65A31',
  outcomes:[],
  related_project_ids:[],
  published:true,
  is_sample:false,
  content_id:'kryptek_identity',
  home_layout:'type',
  content_sections:[
   section('credits'),
   section('kis_10_campaign_application',{media_slots:['campaign_dominant']}),
   section('kis_09_editorial_intro',{
    heading:'Editorial application.',
    body:'Editorial intro copy.',
    narrative_stage:'KIS_09 · Editorial Application'
   }),
   section('kis_05_governing_system',{
    media_slots:['governing_master_identity'],
    interaction:{infoDisclosure:{enabled:true,label:'Extended Context',body:'System context'}}
   }),
   section('kis_02_complete_brand_world',{media_slots:['hero_primary']}),
   section('outcome',{type:'dark_statement',background:'dark'}),
   section('kis_03_inherited_brand_context',{media_slots:['inherited_dominant']}),
   section('insight'),
   section('kis_09_editorial_application',{
    heading:'',
    body:'',
    narrative_stage:'KIS_09 · Sequence',
    media_slots:['editorial_lead_spread'],
    interaction:{mediaInspect:{enabled:true,slots:['editorial_lead_spread']}}
   }),
   section('kis_08_ecommerce_application',{media_slots:['ecommerce_primary']})
  ]
 } as Project;
}

test('candidate order is explicit and independent of source array order',()=>{
 const candidate=buildKryptekIdentityCandidateProject(baseProject());
 assert.deepEqual(
  candidate.content_sections.map((entry)=>entry.content_id),
  KRYPTĒK_CANDIDATE_SOURCE_SECTION_IDS.map((id)=>`candidate__${id}`)
 );
});

test('candidate removes legacy presentation authority from every section',()=>{
 const candidate=buildKryptekIdentityCandidateProject(baseProject());
 for(const entry of candidate.content_sections){
  assert.equal(entry.layout_system,undefined);
  assert.equal(entry.background,undefined);
  assert.equal(entry.interaction,undefined);
  assert.ok(entry.modular);
 }
});

test('editorial intro and media sequence become one modular section',()=>{
 const candidate=buildKryptekIdentityCandidateProject(baseProject());
 const editorial=candidate.content_sections.find((entry)=>entry.content_id==='candidate__kis_09_editorial_application');
 assert.ok(editorial);
 assert.equal(editorial.heading,'Editorial application.');
 assert.equal(editorial.body,'Editorial intro copy.');
 assert.equal(editorial.narrative_stage,'KIS_09 · Editorial Application');
 assert.deepEqual(editorial.media_slots,['editorial_lead_spread']);
 assert.equal(editorial.modular?.media?.layout,'EDITORIAL SEQUENCE 01');
 assert.equal(editorial.modular?.interaction?.mediaInspect?.enabled,true);
 assert.equal(candidate.content_sections.some((entry)=>entry.content_id.includes('editorial_intro')),false);
});

test('system browser owns six semantic states in modular configuration',()=>{
 const candidate=buildKryptekIdentityCandidateProject(baseProject());
 const browser=candidate.content_sections.find((entry)=>entry.content_id==='candidate__kis_05_governing_system');
 assert.ok(browser);
 assert.equal(browser.modular?.specializedComponent,'SYSTEM BROWSER');
 const states=browser.modular?.systemBrowser?.states||[];
 assert.deepEqual(
  states.map((state)=>state.id),
  ['foundation','identity','language','iconography','governance','application']
 );
 assert.equal(states[0]?.title,'Preserve recognition.\nDefine the logic.');
 assert.equal(states[2]?.evidenceLabels[0],'VOICE & MANIFESTO');
 assert.equal(states[5]?.evidenceLabels[2],'PHYSICAL TOUCHPOINTS');
 assert.ok(states.every((state)=>state.title&&state.body&&state.evidenceLabels.length===3));
 assert.equal(browser.modular?.interaction?.infoDisclosure?.enabled,true);
});

test('candidate exposes Insight and Outcome through reusable semantic roles',()=>{
 const candidate=buildKryptekIdentityCandidateProject(baseProject());

 const insight=candidate.content_sections.find(
  (entry)=>entry.content_id==='candidate__insight'
 );
 const outcome=candidate.content_sections.find(
  (entry)=>entry.content_id==='candidate__outcome'
 );

 assert.ok(insight);
 assert.equal(insight.modular?.semanticRole,'insight');
 assert.equal(insight.modular?.surface,'light');
 assert.equal(insight.modular?.layout,undefined);
 assert.equal(insight.modular?.media,undefined);

 assert.ok(outcome);
 assert.equal(outcome.modular?.semanticRole,'outcome');
 assert.equal(outcome.modular?.surface,'light');
 assert.equal(outcome.modular?.layout,undefined);
 assert.equal(outcome.modular?.media,undefined);
});

test('candidate closing sequence exposes credits through the reusable semantic role',()=>{
 const candidate=buildKryptekIdentityCandidateProject(baseProject());
 const credits=candidate.content_sections.find(
  (entry)=>entry.content_id==='candidate__credits'
 );

 assert.ok(credits);
 assert.equal(credits.modular?.semanticRole,'credits');
 assert.equal(credits.modular?.surface,'light');
 assert.equal(credits.media_slots.length,0);
 assert.equal(credits.modular?.media,undefined);
});

test('candidate shell remains isolated from the published project',()=>{
 const base=baseProject();
 const candidate=buildKryptekIdentityCandidateProject(base);
 assert.equal(base.slug,'kryptek-identity-system');
 assert.equal(base.published,true);
 assert.equal(candidate.slug,'kryptek-identity-system-candidate');
 assert.equal(candidate.published,false);
 assert.equal(candidate.case_study?.shell?.variant,'canonical');
 assert.equal(candidate.case_study?.opening.cover.enabled,false);
 assert.equal(candidate.case_study?.navigation.variant,'compact');
});

test('production modular project preserves public identity without legacy render ids',()=>{
 const base=baseProject();
 const project=buildKryptekIdentityModularProject(base);

 assert.equal(project.slug,base.slug);
 assert.equal(project.content_id,base.content_id);
 assert.equal(project.published,true);
 assert.equal(project.is_sample,false);
 assert.equal(project.featured,true);

 assert.deepEqual(
  project.content_sections.map((entry)=>entry.content_id),
  KRYPTĒK_CANDIDATE_SOURCE_SECTION_IDS.map(
   (id)=>`modular__${id}`
  )
 );

 assert.ok(
  project.content_sections.every(
   (entry)=>!entry.content_id.startsWith('candidate__')
  )
 );

 assert.ok(
  project.content_sections.every(
   (entry)=>!/^kis_/.test(entry.content_id)
  )
 );

 assert.equal(
  project.case_study?.shell?.variant,
  'canonical'
 );
 assert.equal(
  project.case_study?.opening.cover.enabled,
  false
 );
 assert.equal(
  project.case_study?.navigation.variant,
  'compact'
 );

 // Building the production render model must not mutate CMS/source data.
 assert.equal(base.content_sections.some(
  (entry)=>entry.content_id.startsWith('modular__')
 ),false);
});
