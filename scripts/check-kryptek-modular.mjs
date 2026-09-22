import {chromium} from 'playwright';

const baseUrl=(process.env.KRYPTEK_MODULAR_URL||'http://localhost:3000').replace(/\/$/,'');
const publicRoute='/work/kryptek-identity-system';
const candidateRoute='/work/case-study-candidate/kryptek-identity-system';

const canonical=[
 {width:390,height:1090},
 {width:768,height:1180},
 {width:1024,height:800},
 {width:1440,height:825},
 {width:1760,height:770},
];

const transitionWidths=[
 621,700,767,899,900,960,1023,
 1200,1280,1366,1439,
];

const modularIds=[
 'modular__kis_02_complete_brand_world',
 'modular__kis_03_inherited_brand_context',
 'modular__insight',
 'modular__kis_05_governing_system',
 'modular__kis_08_ecommerce_application',
 'modular__kis_09_editorial_application',
 'modular__kis_10_campaign_application',
 'modular__outcome',
 'modular__credits',
];

const sourceIds=[
 'kis_02_complete_brand_world',
 'kis_03_inherited_brand_context',
 'insight',
 'kis_05_governing_system',
 'kis_08_ecommerce_application',
 'kis_09_editorial_intro',
 'kis_09_editorial_application',
 'kis_10_campaign_application',
 'outcome',
 'credits',
];

const stateMedia=[
 ['governing_foundation_primary','governing_foundation_color','governing_foundation_type'],
 ['governing_master_identity','governing_identity_lockup','governing_identity_usage'],
 ['governing_voice_manifesto','governing_language_tone','governing_language_rules'],
 ['governing_icon_system','governing_icon_construction','governing_icon_application'],
 ['governing_guideline_spreads','governing_decision_rules','governing_hierarchy_usage'],
 ['governing_application_primary','governing_digital_touchpoints','governing_physical_touchpoints'],
];

function assert(condition,message){
 if(!condition)throw new Error(message);
}

function near(actual,expected,tolerance=1){
 return Math.abs(actual-expected)<=tolerance;
}

async function sidecarModes(page,width){
 const results=await page.evaluate(()=>[
  ...document.querySelectorAll(
   '[data-case-layout="TEXT SIDECAR 01"],[data-case-layout="MEDIA SIDECAR 01"]'
  )
 ].map((section)=>{
  const text=section.querySelector(
   '[class*="narrativePane"],[class*="sidecarPane"]'
  );
  const media=section.querySelector('[class*="mediaPane"]');
  if(!text||!media)throw new Error('Sidecar panes are missing.');
  const t=text.getBoundingClientRect();
  const m=media.getBoundingClientRect();
  return {twoColumn:t.right<=m.left+1||m.right<=t.left+1};
 }));

 for(const [index,result] of results.entries()){
  if(width>=1024){
   assert(result.twoColumn,`${width}: sidecar ${index+1} must be two-column at 1024+`);
  }else{
   assert(!result.twoColumn,`${width}: sidecar ${index+1} must remain stacked below 1024`);
  }
 }
}

async function creditsMode(page,width){
 const result=await page.locator('[data-case-role="credits"]').evaluate((section)=>{
  const grid=section.querySelector('.case-role-credits-grid');
  if(!grid)throw new Error('Role & Credits grid is missing.');
  const children=[...grid.children];
  if(children.length<2)throw new Error('Role & Credits columns are missing.');
  const a=children[0].getBoundingClientRect();
  const b=children[1].getBoundingClientRect();
  return {twoColumn:a.right<=b.left+1||b.right<=a.left+1};
 });

 if(width>=1024){
  assert(result.twoColumn,`${width}: Role & Credits must be two-column at 1024+`);
 }else{
  assert(!result.twoColumn,`${width}: Role & Credits must remain stacked below 1024`);
 }
}

function expectedSectionPadding(width){
 if(width>=1440)return 84;
 if(width>=1024)return 72;
 if(width>=768)return 64;
 return 48;
}

async function sectionPadding(page,width){
 const expected=expectedSectionPadding(width);

 const semantic=await page
  .locator('[data-case-role="insight"],[data-case-role="outcome"]')
  .evaluateAll((elements)=>elements.map((element)=>{
   const style=getComputedStyle(element);
   return {
    id:element.id,
    top:parseFloat(style.paddingTop),
    bottom:parseFloat(style.paddingBottom),
   };
  }));

 assert(
  semantic.length===2,
  `${width}: expected Insight and Outcome semantic sections`
 );

 for(const section of semantic){
  assert(
   near(section.top,expected)&&near(section.bottom,expected),
   `${width}: ${section.id} padding ${section.top}/${section.bottom}, expected ${expected}`
  );
 }

 if(width>=768){
  const sidecars=await page
   .locator(
    '[data-case-layout="TEXT SIDECAR 01"],' +
    '[data-case-layout="MEDIA SIDECAR 01"]'
   )
   .evaluateAll((elements)=>elements.map((element)=>{
    const style=getComputedStyle(element);
    return {
     id:element.id,
     top:parseFloat(style.paddingTop),
     bottom:parseFloat(style.paddingBottom),
    };
   }));

  for(const section of sidecars){
   assert(
    near(section.top,expected)&&near(section.bottom,expected),
    `${width}: ${section.id} padding ${section.top}/${section.bottom}, expected ${expected}`
   );
  }

  const editorial=await page
   .locator('#modular__kis_09_editorial_application')
   .evaluate((element)=>{
    const style=getComputedStyle(element);
    return {
     top:parseFloat(style.paddingTop),
     bottom:parseFloat(style.paddingBottom),
    };
   });

  assert(
   near(editorial.top,expected),
   `${width}: editorial top padding ${editorial.top}, expected ${expected}`
  );

  // Page 07 gives Editorial its own closing cadence on desktop.
  if(width<1440){
   assert(
    near(editorial.bottom,expected),
    `${width}: editorial bottom padding ${editorial.bottom}, expected ${expected}`
   );
  }
 }
}

async function auditPublic(browser,width,expectedHeight=null){
 const page=await browser.newPage({
  viewport:{width,height:1200},
  reducedMotion:'reduce'
 });

 const response=await page.goto(`${baseUrl}${publicRoute}`,{waitUntil:'networkidle'});
 assert(response&&response.status()===200,`${width}: public Kryptek route did not return 200`);

 assert(
  await page.locator('article.case-study-canonical-shell').count()===1,
  `${width}: canonical shell is missing`
 );

 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
 assert(overflow<=0,`${width}: ${overflow}px horizontal overflow`);

 const renderedIds=await page
  .locator('section[id^="modular__"]')
  .evaluateAll((sections)=>sections.map((section)=>section.id));

 assert(
  JSON.stringify(renderedIds)===JSON.stringify(modularIds),
  `${width}: modular section order/id drift: ${JSON.stringify(renderedIds)}`
 );

 assert(
  await page.locator('section[id^="candidate__"]').count()===0,
  `${width}: candidate section id leaked into public rendering`
 );

 assert(
  await page.locator('section[id^="kis_"]').count()===0,
  `${width}: a legacy KIS id regained section/render authority`
 );

 const anchors=await page
  .locator('[data-case-source-anchor]')
  .evaluateAll((elements)=>elements.map((element)=>{
   const box=element.getBoundingClientRect();
   const style=getComputedStyle(element);
   return {
    id:element.id,
    width:box.width,
    height:box.height,
    paddingTop:style.paddingTop,
    paddingBottom:style.paddingBottom,
    marginTop:style.marginTop,
    marginBottom:style.marginBottom,
    children:element.children.length,
   };
  }));

 assert(
  JSON.stringify(anchors.map((entry)=>entry.id))===JSON.stringify(sourceIds),
  `${width}: source/deep-link anchors drifted`
 );

 for(const anchor of anchors){
  assert(
   anchor.width<=1&&anchor.height<=1&&anchor.children===0,
   `${width}: source anchor ${anchor.id} gained presentation geometry`
  );
  assert(
   anchor.paddingTop==='0px'&&
   anchor.paddingBottom==='0px'&&
   anchor.marginTop==='0px'&&
   anchor.marginBottom==='0px',
   `${width}: source anchor ${anchor.id} gained legacy spacing`
  );
 }

 const editorialAnchorTargets=await page.evaluate(()=>{
  const intro=document.getElementById('kis_09_editorial_intro');
  const application=document.getElementById('kis_09_editorial_application');

  if(!intro||!application)return null;

  const introHost=intro.parentElement;
  const applicationHost=application.parentElement;

  return {
   introSection:intro.closest('section')?.id||null,
   applicationSection:application.closest('section')?.id||null,
   introHostClass:
    typeof introHost?.className==='string'
     ?introHost.className
     :'',
   applicationHostClass:
    typeof applicationHost?.className==='string'
     ?applicationHost.className
     :'',
   introY:
    intro.getBoundingClientRect().top+window.scrollY,
   applicationY:
    application.getBoundingClientRect().top+window.scrollY,
  };
 });

 assert(
  editorialAnchorTargets,
  `${width}: Editorial source anchors are missing`
 );

 assert(
  editorialAnchorTargets.introSection===
   'modular__kis_09_editorial_application'&&
  editorialAnchorTargets.applicationSection===
   'modular__kis_09_editorial_application',
  `${width}: Editorial source anchors escaped the merged modular section`
 );

 assert(
  editorialAnchorTargets.introHostClass.includes('fullBleedIntro'),
  `${width}: kis_09_editorial_intro is not attached to the Editorial intro`
 );

 assert(
  editorialAnchorTargets.applicationHostClass.includes('editorialSequence01'),
  `${width}: kis_09_editorial_application is not attached to the Editorial sequence`
 );

 assert(
  editorialAnchorTargets.applicationY>
   editorialAnchorTargets.introY+1,
  `${width}: Editorial source anchors still resolve to the same position`
 );

 await sidecarModes(page,width);
 await creditsMode(page,width);
 await sectionPadding(page,width);

 for(const role of ['insight','outcome','credits']){
  assert(
   await page.locator(`[data-case-role="${role}"]`).count()===1,
   `${width}: expected exactly one ${role} semantic section`
  );
 }

 const browserRoot=page.locator('[data-system-browser]');
 assert(await browserRoot.count()===1,`${width}: System Browser is missing`);

 const tabs=browserRoot.locator('[role="tab"]');
 assert(await tabs.count()===6,`${width}: System Browser must expose six tabs`);

 const orientation=await browserRoot.locator('[role="tablist"]').getAttribute('aria-orientation');
 assert(
  orientation===(width>=1024?'vertical':'horizontal'),
  `${width}: tab orientation was ${orientation}`
 );

 const targetSizes=await tabs.evaluateAll((elements)=>elements.map((element)=>{
  const box=element.getBoundingClientRect();
  return {width:box.width,height:box.height};
 }));

 for(const [index,size] of targetSizes.entries()){
  assert(
   size.width>=44&&size.height>=44,
   `${width}: tab ${index+1} target is ${size.width}×${size.height}`
  );
 }

 const disclosure=browserRoot.locator('button[class*="disclosureToggle"]');
 assert(await disclosure.count()===1,`${width}: Extended Context trigger is missing`);

 const disclosureSize=await disclosure.evaluate((element)=>{
  const box=element.getBoundingClientRect();
  return {width:box.width,height:box.height};
 });

 assert(
  disclosureSize.width>=44&&disclosureSize.height>=44,
  `${width}: Extended Context target is ${disclosureSize.width}×${disclosureSize.height}`
 );

 const heights=[];
 const stateIds=['foundation','identity','language','iconography','governance','application'];

 for(let index=0;index<6;index++){
  await tabs.nth(index).click();

  assert(
   await tabs.nth(index).getAttribute('aria-selected')==='true',
   `${width}: state ${index+1} did not become selected`
  );

  assert(
   await browserRoot.getAttribute('data-system-browser-state')===stateIds[index],
   `${width}: active System Browser state attribute drifted`
  );

  const bindingKeys=await browserRoot
   .locator('[data-media-slot]')
   .evaluateAll((elements)=>
    elements.map((element)=>element.getAttribute('data-media-slot'))
   );

  const slots=bindingKeys.map((key)=>key?.split('.').at(-1)||'');

  assert(
   JSON.stringify(slots)===JSON.stringify(stateMedia[index]),
   `${width}: state ${index+1} evidence media drift: ${JSON.stringify(bindingKeys)}`
  );

  assert(
   bindingKeys.every(
    (key)=>key?.startsWith(
     'project.kryptek_identity.modular__kis_05_governing_system.'
    )
   ),
   `${width}: state ${index+1} is not using production modular media binding keys`
  );

  const rootHeight=await browserRoot.evaluate(
   (element)=>element.getBoundingClientRect().height
  );
  heights.push(rootHeight);

  const narrativeOverflow=await browserRoot
   .locator('[class*="narrativeStack"]')
   .evaluate((element)=>element.scrollHeight-element.clientHeight);

  assert(
   narrativeOverflow<=1,
   `${width}: state ${index+1} narrative overflows by ${narrativeOverflow}px`
  );
 }

 const min=Math.min(...heights);
 const max=Math.max(...heights);

 assert(max-min<=1,`${width}: System Browser state height jumps by ${max-min}px`);

 if(expectedHeight!==null){
  assert(
   near(min,expectedHeight)&&near(max,expectedHeight),
   `${width}: System Browser height ${min}→${max}, expected ${expectedHeight}`
  );
 }

 if(width>=768&&width<1024){
  assert(
   near(min,1180)&&near(max,1180),
   `${width}: tablet System Browser must remain 1180px; got ${min}→${max}`
  );
 }

 await tabs.nth(0).click();
 await tabs.nth(0).focus();
 await tabs.nth(0).press('ArrowRight');
 assert(
  await tabs.nth(1).getAttribute('aria-selected')==='true',
  `${width}: ArrowRight keyboard navigation failed`
 );

 await tabs.nth(1).press('End');
 assert(
  await tabs.nth(5).getAttribute('aria-selected')==='true',
  `${width}: End keyboard navigation failed`
 );

 await tabs.nth(5).press('Home');
 assert(
  await tabs.nth(0).getAttribute('aria-selected')==='true',
  `${width}: Home keyboard navigation failed`
 );

 const inspectTargets=page.locator('.media-inspect-trigger');
 assert(
  await inspectTargets.count()===2,
  `${width}: expected two Media Inspect controls`
 );

 const inspectSizes=await inspectTargets.evaluateAll((elements)=>elements.map((element)=>{
  const box=element.getBoundingClientRect();
  return {width:box.width,height:box.height};
 }));

 for(const [index,size] of inspectSizes.entries()){
  assert(
   size.width>=44&&size.height>=44,
   `${width}: inspect control ${index+1} is ${size.width}×${size.height}`
  );
 }

 const placeholders=await browserRoot.locator('.media-placeholder').count();

 await page.close();

 return {
  width,
  systemBrowserHeight:`${Math.round(min)} → ${Math.round(max)}`,
  placeholders,
 };
}

async function auditCandidate(browser){
 const page=await browser.newPage({
  viewport:{width:1440,height:1200},
  reducedMotion:'reduce'
 });

 const response=await page.goto(`${baseUrl}${candidateRoute}`,{waitUntil:'networkidle'});
 assert(response&&response.status()===200,'Candidate route did not return 200');

 assert(
  await page.locator('article.case-study-canonical-shell').count()===1,
  'Candidate route lost the canonical shell'
 );

 assert(
  await page.locator('section[id^="candidate__"]').count()===9,
  'Candidate route must retain nine candidate render sections'
 );

 assert(
  await page.locator('section[id^="modular__"]').count()===0,
  'Production modular render ids leaked into candidate route'
 );

 assert(
  await page.locator('section[id^="kis_"]').count()===0,
  'Legacy KIS ids regained candidate section authority'
 );

 const anchors=await page
  .locator('[data-case-source-anchor]')
  .evaluateAll((elements)=>elements.map((element)=>element.id));

 assert(
  JSON.stringify(anchors)===JSON.stringify(sourceIds),
  `Candidate source anchors drifted: ${JSON.stringify(anchors)}`
 );

 const tabs=page.locator('[data-system-browser] [role="tab"]');

 for(let index=0;index<6;index++){
  await tabs.nth(index).click();

  const bindingKeys=await page
   .locator('[data-system-browser] [data-media-slot]')
   .evaluateAll((elements)=>
    elements.map((element)=>element.getAttribute('data-media-slot'))
   );

  const slots=bindingKeys.map((key)=>key?.split('.').at(-1)||'');

  assert(
   JSON.stringify(slots)===JSON.stringify(stateMedia[index]),
   `Candidate state ${index+1} evidence media drift`
  );

  assert(
   bindingKeys.every(
    (key)=>key?.includes('.candidate__kis_05_governing_system.')
   ),
   `Candidate state ${index+1} is not using isolated candidate media binding keys`
  );
 }

 await page.close();
}

const browser=await chromium.launch({headless:true});
const report=[];

try{
 for(const contract of canonical){
  report.push(await auditPublic(browser,contract.width,contract.height));
 }

 for(const width of transitionWidths){
  report.push(await auditPublic(browser,width,null));
 }

 await auditCandidate(browser);
}finally{
 await browser.close();
}

const placeholderCount=report.reduce(
 (total,entry)=>total+entry.placeholders,
 0
);

console.log(JSON.stringify({
 status:'pass',
 canonicalWidths:canonical.map((entry)=>entry.width),
 transitionWidths,
 report,
 mediaStatus:
  placeholderCount>0
   ?'UNASSIGNED MEDIA REMAINS — assign and visually verify production imagery before merge/deploy.'
   :'No System Browser media placeholders detected.',
},null,2));
