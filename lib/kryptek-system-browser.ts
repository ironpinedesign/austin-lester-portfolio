import type {CaseSystemBrowserState} from './case-study-schema.ts';

export type KryptekSystemBrowserText=(id:string)=>string;

export type KryptekSystemBrowserField=
 |'label'
 |'title'
 |'body'
 |'evidence_1'
 |'evidence_2'
 |'evidence_3';

export const KRYPTĒK_SYSTEM_BROWSER_STRUCTURE=[
 {
  id:'foundation',
  mediaSlots:[
   'governing_foundation_primary',
   'governing_foundation_color',
   'governing_foundation_type'
  ]
 },
 {
  id:'identity',
  mediaSlots:[
   'governing_master_identity',
   'governing_identity_lockup',
   'governing_identity_usage'
  ]
 },
 {
  id:'language',
  mediaSlots:[
   'governing_voice_manifesto',
   'governing_language_tone',
   'governing_language_rules'
  ]
 },
 {
  id:'iconography',
  mediaSlots:[
   'governing_icon_system',
   'governing_icon_construction',
   'governing_icon_application'
  ]
 },
 {
  id:'governance',
  mediaSlots:[
   'governing_guideline_spreads',
   'governing_decision_rules',
   'governing_hierarchy_usage'
  ]
 },
 {
  id:'application',
  mediaSlots:[
   'governing_application_primary',
   'governing_digital_touchpoints',
   'governing_physical_touchpoints'
  ]
 }
] as const;

export const KRYPTĒK_SYSTEM_BROWSER_COPY={
 foundation:{
  label:'FOUNDATION',
  title:'Preserve recognition.\nDefine the logic.',
  body:'I began by auditing the existing identity ecosystem to separate essential brand equity from accumulated inconsistency. The goal was to understand what already belonged to Kryptek before deciding what needed to change.\n\nThat foundation connected brand promise, vision, values, character, voice, color, typography, imagery, and application into a system that future decisions could be measured against.',
  evidenceLabels:[
   'STRATEGIC FOUNDATION',
   'COLOR SYSTEM',
   'TYPE SYSTEM'
  ]
 },
 identity:{
  label:'IDENTITY',
  title:'Protect the equity.\nRemove the drift.',
  body:'The existing marks carried recognition that did not need to be reinvented. What they lacked was a consistent source of truth. Versions had accumulated across files, vendors, applications, and years of use.\n\nI reconstructed and refined the core marks, then defined their relationships, proportions, spacing, hierarchy, and reproduction rules so the identity could remain recognizable without remaining inconsistent.',
  evidenceLabels:[
   'IDENTITY FAMILY',
   'LOCKUP SYSTEM',
   'USAGE RULES'
  ]
 },
 language:{
  label:'LANGUAGE',
  title:'Make the brand\nsound like itself.',
  body:'Visual consistency was only part of the problem. Kryptek also needed a recognizable way of speaking, one that could move between brand storytelling, technical product information, campaigns, retail, and community without changing character.\n\nI translated the brand’s values and personality into voice principles, a manifesto, messaging guidance, and practical writing rules that gave different teams a common point of view rather than a rigid script.',
  evidenceLabels:[
   'VOICE & MANIFESTO',
   'TONE SYSTEM',
   'WRITING RULES'
  ]
 },
 iconography:{
  label:'ICONOGRAPHY',
  title:'Extend the language\nbeyond the logo.',
  body:'The identity needed recognizable visual expression without forcing the primary logo into every moment. A custom icon system created another layer of brand language that could communicate ideas, categories, features, and stories.\n\nThe icons began as hand-drawn forms and were translated into a controlled vector system. Shared proportions, weight, detail, and construction logic kept the work expressive while making the library repeatable and expandable.',
  evidenceLabels:[
   'ICON FAMILY',
   'CONSTRUCTION',
   'IN APPLICATION'
  ]
 },
 governance:{
  label:'GOVERNANCE',
  title:'Make the right decision\neasier to make.',
  body:'The goal was not a style guide for its own sake. The system needed to help internal teams, retailers, vendors, and partners make new work feel unmistakably Kryptek without requiring the original designer to supervise every execution.\n\nClear rules for hierarchy, ownership, trademarks, spacing, color, typography, imagery, and application turned the identity from a collection of assets into a practical decision system.',
  evidenceLabels:[
   'GUIDELINE SPREADS',
   'DECISION RULES',
   'HIERARCHY / USAGE'
  ]
 },
 application:{
  label:'APPLICATION',
  title:'Build the system\nto survive contact.',
  body:'A brand system only matters if it holds together once people start using it. Kryptek had to remain recognizable across ecommerce, campaigns, retail, print, product communication, dealers, partners, and environments with very different demands.\n\nThe applications became the test. The objective was consistency without sameness, enough structure to create recognition while leaving enough range for the work to respond to audience, medium, and purpose.',
  evidenceLabels:[
   'BRAND IN APPLICATION',
   'DIGITAL TOUCHPOINTS',
   'PHYSICAL TOUCHPOINTS'
  ]
 }
} as const;

const PREFIX=
 'project.kryptek_identity.kis_05_governing_system.system_browser';

export function kryptekSystemBrowserFieldId(
 stateId:string,
 field:KryptekSystemBrowserField
){
 return `${PREFIX}.${stateId}.${field}`;
}

export function kryptekSystemBrowserDefaultText(id:string):string{
 for(const state of KRYPTĒK_SYSTEM_BROWSER_STRUCTURE){
  const copy=KRYPTĒK_SYSTEM_BROWSER_COPY[state.id];

  const fields:Record<KryptekSystemBrowserField,string>={
   label:copy.label,
   title:copy.title,
   body:copy.body,
   evidence_1:copy.evidenceLabels[0],
   evidence_2:copy.evidenceLabels[1],
   evidence_3:copy.evidenceLabels[2]
  };

  for(const [field,value] of Object.entries(fields)){
   if(
    id===kryptekSystemBrowserFieldId(
     state.id,
     field as KryptekSystemBrowserField
    )
   ){
    return value;
   }
  }
 }

 return '';
}

export function resolveKryptekSystemBrowserStates(
 text:KryptekSystemBrowserText=kryptekSystemBrowserDefaultText
):CaseSystemBrowserState[]{
 return KRYPTĒK_SYSTEM_BROWSER_STRUCTURE.map((state)=>({
  id:state.id,
  label:text(
   kryptekSystemBrowserFieldId(state.id,'label')
  ),
  title:text(
   kryptekSystemBrowserFieldId(state.id,'title')
  ),
  body:text(
   kryptekSystemBrowserFieldId(state.id,'body')
  ),
  evidenceLabels:[
   text(kryptekSystemBrowserFieldId(state.id,'evidence_1')),
   text(kryptekSystemBrowserFieldId(state.id,'evidence_2')),
   text(kryptekSystemBrowserFieldId(state.id,'evidence_3'))
  ],
  mediaSlots:[...state.mediaSlots]
 }));
}
