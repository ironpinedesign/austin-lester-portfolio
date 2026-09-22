import {chromium} from 'playwright';

const baseUrl=
 process.env.KRYPTEK_INTERACTION_URL||
 'http://127.0.0.1:3010';

const route='/work/kryptek-identity-system';

function assert(condition,message){
 if(!condition)throw new Error(message);
}

function near(a,b,tolerance=1){
 return Math.abs(a-b)<=tolerance;
}

const clay='rgb(214, 90, 49)';

const browser=await chromium.launch({
 headless:true
});

try{
 const page=await browser.newPage({
  viewport:{width:1440,height:1200},
  reducedMotion:'no-preference'
 });

 await page.goto(
  `${baseUrl}${route}`,
  {waitUntil:'networkidle'}
 );

 const browserRoot=page.locator(
  '[data-system-browser]'
 );

 // ------------------------------------------------------
 // EXTENDED CONTEXT
 // ------------------------------------------------------

 const disclosure=browserRoot.locator(
  'button[class*="disclosureToggle"]'
 );

 assert(
  await disclosure.count()===1,
  'Extended Context trigger missing'
 );

 await disclosure.hover();

 const disclosureTransition=await disclosure.evaluate(
  (element)=>{
   const style=getComputedStyle(element);
   return {
    property:style.transitionProperty,
    duration:style.transitionDuration
   };
  }
 );

 assert(
  disclosureTransition.duration
   .split(',')
   .some((value)=>parseFloat(value)>0),
  `Extended Context hover has no transition: ${JSON.stringify(disclosureTransition)}`
 );

 await page.waitForTimeout(250);

 const disclosureHover=await disclosure.evaluate(
  (element)=>({
   color:getComputedStyle(element).color,
   rule:getComputedStyle(
    element,
    '::after'
   ).backgroundColor
  })
 );

 assert(
  disclosureHover.color===clay,
  `Extended Context hover color: ${disclosureHover.color}`
 );

 assert(
  disclosureHover.rule===clay,
  `Extended Context hover rule: ${disclosureHover.rule}`
 );

 const panel=browserRoot.locator(
  '[class*="disclosurePanel"]'
 ).first();

 const transitionDuration=await panel.evaluate(
  (element)=>getComputedStyle(element).transitionDuration
 );

 assert(
  transitionDuration
   .split(',')
   .some((value)=>parseFloat(value)>0),
  'Extended Context has no height transition'
 );

 const beforeDisclosureHeight=await browserRoot.evaluate(
  (element)=>element.getBoundingClientRect().height
 );

 await disclosure.click();

 assert(
  await disclosure.getAttribute('aria-expanded')==='true',
  'Extended Context did not set aria-expanded'
 );

 assert(
  await panel.getAttribute('aria-hidden')==='false',
  'Expanded context remains aria-hidden'
 );

 await page.waitForTimeout(260);

 const afterDisclosureHeight=await browserRoot.evaluate(
  (element)=>element.getBoundingClientRect().height
 );

 assert(
  afterDisclosureHeight>beforeDisclosureHeight,
  'Extended Context did not expand section height'
 );

 await disclosure.click();
 await page.waitForTimeout(260);

 // ------------------------------------------------------
 // PROJECT NAVIGATION
 // ------------------------------------------------------

 const projectLink=page.locator(
  '.project-navigation-link'
 ).first();

 assert(
  await projectLink.count()===1,
  'Project navigation link missing'
 );

 await projectLink.hover();

 const projectTransition=await projectLink.evaluate(
  (element)=>{
   const style=getComputedStyle(element);
   return {
    property:style.transitionProperty,
    duration:style.transitionDuration,
    timing:style.transitionTimingFunction
   };
  }
 );

 assert(
  projectTransition.property
   .split(',')
   .map((value)=>value.trim())
   .includes('color'),
  `Project navigation does not transition color: ${JSON.stringify(projectTransition)}`
 );

 assert(
  projectTransition.duration
   .split(',')
   .some((value)=>Math.abs(parseFloat(value)-0.2)<0.01),
  `Project navigation transition must be 200ms: ${JSON.stringify(projectTransition)}`
 );

 await page.waitForTimeout(250);

 const projectHover=await projectLink.evaluate(
  (element)=>getComputedStyle(element).color
 );

 assert(
  projectHover===clay,
  `Project navigation hover color: ${projectHover}`
 );

 await page.mouse.move(0,0);

 let projectKeyboardFocused=false;

 for(let index=0;index<40;index++){
  await page.keyboard.press('Tab');

  projectKeyboardFocused=await page.evaluate(
   ()=>document.activeElement
    ?.classList
    .contains('project-navigation-link')||false
  );

  if(projectKeyboardFocused)break;
 }

 assert(
  projectKeyboardFocused,
  'Project navigation was not reachable by keyboard'
 );

 assert(
  await projectLink.evaluate(
   (element)=>element.matches(':focus-visible')
  ),
  'Project navigation did not enter :focus-visible state'
 );

 const projectFocus=await projectLink.evaluate(
  (element)=>{
   const style=getComputedStyle(element);
   return {
    width:style.outlineWidth,
    style:style.outlineStyle,
    color:style.outlineColor,
    offset:style.outlineOffset
   };
  }
 );

 assert(
  projectFocus.width==='2px' &&
  projectFocus.style==='solid' &&
  projectFocus.color===clay,
  `Project navigation focus state drifted: ${JSON.stringify(projectFocus)}`
 );

 // ------------------------------------------------------
 // MEDIA INSPECT — HOVER / PORTAL / FOCUS / NAVIGATION
 // ------------------------------------------------------

 const inspect=page.locator(
  '.media-inspect'
 ).first();

 assert(
  await inspect.count()===1,
  'Media Inspect instance missing'
 );

 await inspect.hover();

 const inspectShade=await inspect
  .locator('.media-inspect-media')
  .evaluate(
   (element)=>parseFloat(
    getComputedStyle(
     element,
     '::after'
    ).opacity
   )
  );

 assert(
  inspectShade>0&&inspectShade<=.15,
  `Inspectable hover shade is not subtle: ${inspectShade}`
 );

 const trigger=inspect.locator(
  '.media-inspect-trigger'
 );

 const pageHeightBefore=await page.evaluate(
  ()=>document.documentElement.scrollHeight
 );

 await trigger.click();

 const portal=page.locator(
  'body>[data-media-inspect-portal]'
 );

 assert(
  await portal.count()===1,
  'Media Inspect overlay is not an app-level portal'
 );

 const dialog=portal.locator(
  '.media-inspect-shell'
 );

 assert(
  await dialog.getAttribute('role')==='dialog',
  'Media Inspect shell lost dialog role'
 );

 assert(
  await dialog.getAttribute('aria-modal')==='true',
  'Media Inspect shell lost aria-modal'
 );

 for(const selector of [
  '.media-inspect-dialog-caption',
  '.media-inspect-close',
  '.media-inspect-body',
  '.media-inspect-prev',
  '.media-inspect-next',
  '.media-inspect-index'
 ]){
  assert(
   await dialog.locator(selector).count()===1,
   `Media Inspect region missing: ${selector}`
  );
 }

 const desktopBox=await dialog.evaluate(
  (element)=>{
   const box=element.getBoundingClientRect();
   return {
    width:box.width,
    height:box.height
   };
  }
 );

 assert(
  near(desktopBox.width,1120)&&
  near(desktopBox.height,760),
  `1440 Media Inspect shell is ${desktopBox.width}×${desktopBox.height}`
 );

 assert(
  await dialog.locator(
   '.media-inspect-index'
  ).textContent().then(
   (value)=>value?.trim()==='01 / 02'
  ),
  'Media Inspect initial index must be 01 / 02'
 );

 const activeAfterOpen=await page.evaluate(
  ()=>document.activeElement?.className||''
 );

 assert(
  String(activeAfterOpen)
   .includes('media-inspect-close'),
  `Close control did not receive initial focus: ${activeAfterOpen}`
 );

 const outsideIsInert=await page.evaluate(()=>{
  const portalNode=document.querySelector(
   '[data-media-inspect-portal]'
  );

  return [...document.body.children]
   .filter((element)=>element!==portalNode)
   .every(
    (element)=>
     !(element instanceof HTMLElement)||
     element.inert
   );
 });

 assert(
  outsideIsInert,
  'Background is not inert while Media Inspect is open'
 );

 const pageHeightOpen=await page.evaluate(
  ()=>document.documentElement.scrollHeight
 );

 assert(
  near(pageHeightBefore,pageHeightOpen,1),
  `Overlay changed page height: ${pageHeightBefore} → ${pageHeightOpen}`
 );

 const close=dialog.locator(
  '.media-inspect-close'
 );

 await close.focus();
 await page.keyboard.press('Shift+Tab');

 assert(
  await page.evaluate(
   ()=>!!document.activeElement?.closest(
    '.media-inspect-shell'
   )
  ),
  'Shift+Tab escaped the modal'
 );

 for(let index=0;index<5;index++){
  await page.keyboard.press('Tab');

  assert(
   await page.evaluate(
    ()=>!!document.activeElement?.closest(
     '.media-inspect-shell'
    )
   ),
   `Tab escaped modal on iteration ${index+1}`
  );
 }

 await dialog.locator(
  '.media-inspect-next'
 ).click();

 assert(
  await dialog.locator(
   '.media-inspect-index'
  ).textContent().then(
   (value)=>value?.trim()==='02 / 02'
  ),
  'Media Inspect NEXT did not preserve/update selected index'
 );

 await close.focus();
 await page.keyboard.press('Escape');

 await page.waitForFunction(()=>{
  const portalNode=document.querySelector(
   '[data-media-inspect-portal]'
  );
  const active=document.activeElement;

  return (
   !portalNode &&
   active instanceof HTMLElement &&
   active.classList.contains('media-inspect-trigger')
  );
 });

 assert(
  await portal.count()===0,
  'Escape did not close Media Inspect'
 );

 assert(
  await page.evaluate(
   ()=>document.activeElement
    ?.classList
    .contains('media-inspect-trigger')
  ),
  'Focus was not restored to Media Inspect trigger'
 );

 await trigger.click();

 const reopenedDialog=page.locator(
  'body>[data-media-inspect-portal] .media-inspect-shell'
 );

 assert(
  await reopenedDialog.locator(
   '.media-inspect-index'
  ).textContent().then(
   (value)=>value?.trim()==='02 / 02'
  ),
  'Media Inspect did not preserve selected index after close/reopen'
 );

 await reopenedDialog.locator(
  '.media-inspect-close'
 ).click();

 await page.close();

 // ------------------------------------------------------
 // MOBILE MEDIA INSPECT SOURCE GEOMETRY
 // ------------------------------------------------------

 const mobile=await browser.newPage({
  viewport:{width:390,height:760},
  reducedMotion:'no-preference'
 });

 await mobile.goto(
  `${baseUrl}${route}`,
  {waitUntil:'networkidle'}
 );

 await mobile.locator(
  '.media-inspect-trigger'
 ).first().click();

 const mobileDialog=mobile.locator(
  'body>[data-media-inspect-portal] .media-inspect-shell'
 );

 const mobileBox=await mobileDialog.evaluate(
  (element)=>{
   const box=element.getBoundingClientRect();
   return {
    width:box.width,
    height:box.height
   };
  }
 );

 assert(
  near(mobileBox.width,342)&&
  near(mobileBox.height,610),
  `390 Media Inspect shell is ${mobileBox.width}×${mobileBox.height}`
 );

 await mobile.locator(
  '.media-inspect-close'
 ).click();

 await mobile.close();

 console.log(JSON.stringify({
  status:'pass',
  closed:[
   'ALS-KRY-018',
   'ALS-KRY-019',
   'ALS-KRY-010',
   'ALS-KRY-023'
  ],
  mediaInspect:{
   desktop:'1120×760',
   mobile:'342×610',
   portal:true,
   focusContained:true,
   indexedNavigation:true
  },
  extendedContext:{
   hover:'Terracotta',
   smoothHeight:true
  },
  projectNavigation:{
   hover:'Terracotta',
   focus:'2px Terracotta'
  }
 },null,2));
}finally{
 await browser.close();
}
