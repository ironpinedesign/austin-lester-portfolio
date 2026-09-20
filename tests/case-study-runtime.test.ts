import assert from 'node:assert/strict';
import test from 'node:test';
import {resolveCaseStudyRuntime,resolveSectionRuntime} from '../lib/case-study-runtime.ts';
import type {Project,Section} from '../lib/projects.ts';

function project(partial:Partial<Project>={}):Project{
 return {
  slug:'example-project',
  content_sections:[],
  related_project_ids:[],
  ...partial
 } as Project;
}

function section(partial:Partial<Section>={}):Section{
 return {
  content_id:'context',
  media_slots:[],
  type:'text',
  ...partial
 } as Section;
}

test('modular project configuration wins over renderer fallbacks',()=>{
 const runtime=resolveCaseStudyRuntime(project({
  slug:'not-kryptek',
  related_project_ids:['legacy-related'],
  case_study:{
   version:1,
   opening:{qualifier:'Internal candidate',cover:{enabled:false,slot:'candidate-cover'}},
   navigation:{variant:'compact',relatedProjectIds:['configured-related']}
  }
 }),{showCover:true,coverSlotName:'legacy-cover'});

 assert.equal(runtime.showCover,false);
 assert.equal(runtime.coverSlotName,'candidate-cover');
 assert.equal(runtime.openingQualifier,'Internal candidate');
 assert.equal(runtime.navigationVariant,'compact');
 assert.deepEqual(runtime.relatedProjectIds,['configured-related']);
});

test('legacy projects retain existing shell fallbacks',()=>{
 const runtime=resolveCaseStudyRuntime(project({
  slug:'kryptek-identity-system',
  related_project_ids:['legacy-related']
 }),{showCover:false,coverSlotName:'legacy-cover'});

 assert.equal(runtime.showCover,false);
 assert.equal(runtime.coverSlotName,'legacy-cover');
 assert.equal(runtime.navigationVariant,'compact');
 assert.deepEqual(runtime.relatedProjectIds,['legacy-related']);
});

test('modular section configuration wins for surface, media, layout, and interaction',()=>{
 const runtime=resolveSectionRuntime(section({
  media_slots:['legacy-slot'],
  background:'dark',
  layout_system:{layout:'FULL BLEED 01'},
  interaction:{mediaCarousel:{enabled:true}},
  modular:{
   semanticRole:'narrative',
   surface:'light',
   layout:{id:'TEXT SIDECAR 01',reverse:true},
   media:{
    slots:['primary','support'],
    layout:'ASYMMETRIC GRID 01',
    caption:'Configured caption',
    metadata:'Configured metadata',
    note:'Configured note'
   },
   interaction:{mediaInspect:{enabled:true,slots:['primary']}}
  }
 }));

 assert.equal(runtime.semanticRole,'narrative');
 assert.equal(runtime.dark,false);
 assert.deepEqual(runtime.mediaSlots,['primary','support']);
 assert.equal(runtime.layoutConfig?.layout,'TEXT SIDECAR 01');
 assert.equal(runtime.layoutConfig?.mediaLayout,'ASYMMETRIC GRID 01');
 assert.equal(runtime.layoutConfig?.reverse,true);
 assert.equal(runtime.layoutConfig?.caption,'Configured caption');
 assert.equal(runtime.layoutConfig?.metadata,'Configured metadata');
 assert.equal(runtime.layoutConfig?.mediaNote,'Configured note');
 assert.equal(runtime.interaction?.mediaInspect?.enabled,true);
 assert.equal(runtime.interaction?.mediaCarousel,undefined);
});

test('specialized modular sections own their structural and interaction data',()=>{
 const runtime=resolveSectionRuntime(section({
  media_slots:['primary'],
  layout_system:{
   layout:'FULL BLEED 01',
   systemItems:[{id:'legacy',label:'Legacy'}]
  },
  interaction:{
   mediaCarousel:{enabled:true}
  },
  modular:{
   semanticRole:'narrative',
   surface:'light',
   layout:{id:'SYSTEM STAGE 01'},
   media:{slots:['primary']},
   specializedComponent:'SYSTEM BROWSER',
   systemBrowser:{
    states:[
     {id:'foundation',label:'FOUNDATION',title:'Foundation',body:'Foundation body',evidenceLabels:['A','B','C']},
     {id:'identity',label:'IDENTITY',title:'Identity',body:'Identity body',evidenceLabels:['A','B','C']},
     {id:'language',label:'LANGUAGE',title:'Language',body:'Language body',evidenceLabels:['A','B','C']},
     {id:'iconography',label:'ICONOGRAPHY',title:'Iconography',body:'Iconography body',evidenceLabels:['A','B','C']},
     {id:'governance',label:'GOVERNANCE',title:'Governance',body:'Governance body',evidenceLabels:['A','B','C']},
     {id:'application',label:'APPLICATION',title:'Application',body:'Application body',evidenceLabels:['A','B','C']}
    ]
   },
   interaction:{
    infoDisclosure:{enabled:true,label:'Extended context',body:'More context'}
   }
  }
 }));

 assert.equal(runtime.specializedComponent,'SYSTEM BROWSER');
 assert.equal(runtime.layoutConfig?.layout,'SYSTEM STAGE 01');
 assert.equal(runtime.layoutConfig?.systemItems?.[0]?.id,'foundation');
 assert.equal(runtime.layoutConfig?.systemItems?.some((item)=>item.id==='legacy'),false);
 assert.equal(runtime.interaction?.infoDisclosure?.enabled,true);
 assert.equal(runtime.interaction?.mediaCarousel,undefined);
});
