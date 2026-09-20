import assert from 'node:assert/strict';
import test from 'node:test';
import {validateCaseStudyContract,type CaseStudyContractProject} from '../lib/case-study-schema.ts';

function validProject():CaseStudyContractProject{
 return {
  project_number:'01',
  strategic_intent:'Identity & Design Systems',
  year:2026,
  title:'Example Project',
  subtitle:'A modular case study',
  client:'Example Client',
  thesis:'A clear thesis.',
  summary:'A concise summary.',
  role:['Creative Direction'],
  discipline_tags:['Identity & Design Systems'],
  case_study:{version:1,opening:{cover:{enabled:false}},navigation:{variant:'compact'}},
  content_sections:[
   {
    content_id:'context',
    media_slots:['primary'],
    modular:{
     semanticRole:'narrative',
     surface:'light',
     layout:{id:'TEXT SIDECAR 01'},
     media:{slots:['primary'],layout:'ASYMMETRIC GRID 01'}
    }
   },
   {content_id:'outcome',media_slots:[],modular:{semanticRole:'outcome',surface:'dark'}},
   {content_id:'credits',media_slots:[],modular:{semanticRole:'credits',surface:'light'}}
  ]
 };
}

test('accepts a valid modular case-study contract',()=>{
 assert.deepEqual(validateCaseStudyContract(validProject()),[]);
});

test('rejects duplicate section ids',()=>{
 const project=validProject();
 project.content_sections[1].content_id='context';
 assert.ok(validateCaseStudyContract(project).some((error)=>error.includes('Duplicate section content_id')));
});

test('requires exactly one outcome',()=>{
 const project=validProject();
 project.content_sections=project.content_sections.filter((section)=>section.modular?.semanticRole!=='outcome');
 assert.ok(validateCaseStudyContract(project).some((error)=>error.includes('Exactly one Outcome')));
});

test('requires outcome to terminate the narrative stack',()=>{
 const project=validProject();
 const outcome=project.content_sections.splice(1,1)[0];
 project.content_sections.unshift(outcome);
 assert.ok(validateCaseStudyContract(project).some((error)=>error.includes('terminal narrative section')));
});

test('requires credits to immediately follow outcome',()=>{
 const project=validProject();
 const credits=project.content_sections.pop()!;
 project.content_sections.unshift(credits);
 const errors=validateCaseStudyContract(project);
 assert.ok(errors.some((error)=>error.includes('Role & Credits must immediately follow Outcome')));
});

test('rejects media slot drift',()=>{
 const project=validProject();
 project.content_sections[0].modular!.media!.slots=['different'];
 assert.ok(validateCaseStudyContract(project).some((error)=>error.includes('media slots drift')));
});

test('limits ordinary sections to one primary interaction family',()=>{
 const project=validProject();
 project.content_sections[0].modular!.interaction={
  mediaInspect:{enabled:true,slots:['primary']},
  mediaCarousel:{enabled:true}
 };
 assert.ok(validateCaseStudyContract(project).some((error)=>error.includes('more than one primary interaction family')));
});
