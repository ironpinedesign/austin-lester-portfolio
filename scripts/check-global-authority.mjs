import fs from 'node:fs/promises';
import {chromium} from 'playwright';

const baseUrl=(process.env.GLOBAL_AUTHORITY_URL||'http://localhost:3000').replace(/\/$/,'');
const outputDir=process.env.GLOBAL_AUTHORITY_OUTPUT||'/tmp/als-global-authority-qa';
const widths=[390,768,1024,1440,1760];
const expected={
 390:{gutter:24,rail:342,navHeight:56},
 768:{gutter:40,rail:688,navHeight:64},
 1024:{gutter:56,rail:912,navHeight:68},
 1440:{gutter:80,rail:1280,navHeight:68},
 1760:{gutter:80,rail:1600,navHeight:68},
};
const routes=[
 {name:'home',path:'/',rail:'section.wrap.hero'},
 {name:'about',path:'/about',rail:'section.about-wrap.page-opening'},
 {name:'work',path:'/work/truckvault-3d-configurator',rail:'section.wrap.page-opening.case-opening'},
 {name:'kryptek',path:'/work/kryptek-identity-system',rail:'.case-study-canonical-shell>.page-opening.case-opening'},
];

function assert(condition,message){
 if(!condition)throw new Error(message);
}

function near(actual,expectedValue,tolerance=1){
 return Math.abs(actual-expectedValue)<=tolerance;
}

const siteCopySource=await fs.readFile(
 new URL('../content/site-copy.ts',import.meta.url),
 'utf8'
);

assert(
 siteCopySource.includes("'home.hero.eyebrow':'Austin Lester / Creative Direction + Design'"),
 'Homepage eyebrow default does not match approved production copy'
);

assert(
 siteCopySource.includes("'home.hero.headline':'The right solution is\\na consequence of\\nbetter understanding.'"),
 'Homepage hero headline default does not match approved production copy'
);

assert(
 siteCopySource.includes("'home.hero.intro':'Creative director working across strategy, identity, campaigns, design, film, digital experiences, and technology. I bring the judgment to determine what the work requires and the capability to carry it through.'"),
 'Homepage hero intro default does not match approved production copy'
);

assert(
 siteCopySource.includes("'home.approach.heading':'Not every problem needs every tool. The value is knowing what the work actually requires.'"),
 'Homepage approach heading default does not match approved production copy'
);

await fs.mkdir(outputDir,{recursive:true});
const browser=await chromium.launch({headless:true});
const report=[];

try{
 for(const width of widths){
  const contract=expected[width];
  for(const route of routes){
   const page=await browser.newPage({viewport:{width,height:1200},reducedMotion:'reduce'});
   await page.goto(`${baseUrl}${route.path}`,{waitUntil:'networkidle'});
   const metrics=await page.evaluate((railSelector)=>{
    const rail=document.querySelector(railSelector);
    const nav=document.querySelector('.site-nav');
    const navInner=document.querySelector('.nav-inner');
    const wordmark=document.querySelector('.wordmark');
    const toggle=document.querySelector('.nav-toggle');
    const navControl=toggle&&getComputedStyle(toggle).display!=='none'?toggle:document.querySelector('.site-nav nav');
    const footer=document.querySelector('.site-footer>.wrap');
    if(!rail||!nav||!navInner||!wordmark||!navControl||!footer)throw new Error(`Missing contract element for ${railSelector}`);
    const rect=(element)=>{
     const box=element.getBoundingClientRect();
     return {left:box.left,right:innerWidth-box.right,width:box.width,height:box.height,centerY:box.top+(box.height/2)};
    };
    const navBox=rect(nav);
    return {
     rail:rect(rail),
     nav:navBox,
     navInner:rect(navInner),
     wordmark:rect(wordmark),
     navControl:rect(navControl),
     footer:rect(footer),
     horizontalOverflow:document.documentElement.scrollWidth-innerWidth,
    };
   },route.rail);

   for(const [label,box] of [['content rail',metrics.rail],['navigation rail',metrics.navInner],['footer rail',metrics.footer]]){
    assert(near(box.left,contract.gutter),`${width} ${route.name}: ${label} left gutter was ${box.left}, expected ${contract.gutter}`);
    assert(near(box.right,contract.gutter),`${width} ${route.name}: ${label} right gutter was ${box.right}, expected ${contract.gutter}`);
    assert(near(box.width,contract.rail),`${width} ${route.name}: ${label} width was ${box.width}, expected ${contract.rail}`);
   }
   assert(near(metrics.nav.height,contract.navHeight),`${width} ${route.name}: nav height was ${metrics.nav.height}, expected ${contract.navHeight}`);
   assert(near(metrics.wordmark.centerY,metrics.nav.centerY),`${width} ${route.name}: wordmark is not vertically centered`);
   assert(near(metrics.navControl.centerY,metrics.nav.centerY),`${width} ${route.name}: navigation control is not vertically centered`);
   assert(metrics.horizontalOverflow<=0,`${width} ${route.name}: ${metrics.horizontalOverflow}px horizontal overflow`);

   if(route.name==='about'){
    const about=await page.evaluate(()=>{
     const selectors=['.about-wrap.page-opening','.testimonial-slider','.client-wall-inner'];
     return selectors.map((selector)=>{
      const element=document.querySelector(selector);
      if(!element)throw new Error(`Missing About contract element ${selector}`);
      const box=element.getBoundingClientRect();
      return {selector,left:box.left,right:innerWidth-box.right,width:box.width};
     });
    });
    for(const box of about){
     assert(near(box.left,contract.gutter),`${width} About ${box.selector}: left gutter changed to ${box.left}`);
     assert(near(box.right,contract.gutter),`${width} About ${box.selector}: right gutter changed to ${box.right}`);
     assert(near(box.width,contract.rail),`${width} About ${box.selector}: width changed to ${box.width}`);
    }
   }

   await page.screenshot({path:`${outputDir}/${route.name}-${width}.png`});
   report.push({width,route:route.name,...metrics});
   await page.close();
  }

  const interactionPage=await browser.newPage({viewport:{width,height:1200},reducedMotion:'reduce'});
  await interactionPage.goto(`${baseUrl}/work/interaction-lab`,{waitUntil:'networkidle'});
  const targetSelectors=[
   '.interaction-toggle',
   '.media-carousel-controls button',
   '.inline-loop-toggle',
   '.media-inspect-trigger',
   '.media-detail-trigger',
  ];
  const targets=await interactionPage.evaluate((selectors)=>selectors.flatMap((selector)=>[...document.querySelectorAll(selector)]
   .filter((element)=>{
    const style=getComputedStyle(element);
    const box=element.getBoundingClientRect();
    return style.visibility!=='hidden'&&style.display!=='none'&&box.width>0&&box.height>0;
   })
   .map((element)=>{
    const box=element.getBoundingClientRect();
    return {selector,label:element.getAttribute('aria-label')||element.textContent?.trim()||'',width:box.width,height:box.height};
   })),targetSelectors);
  assert(targets.length>0,`${width}: interaction lab exposed no shared controls`);
  for(const target of targets){
   assert(target.width>=44&&target.height>=44,`${width}: ${target.selector} “${target.label}” measured ${target.width}×${target.height}`);
  }
  await interactionPage.close();

  const kryptekPage=await browser.newPage({viewport:{width,height:1200},reducedMotion:'reduce'});
  await kryptekPage.goto(`${baseUrl}/work/kryptek-identity-system`,{waitUntil:'networkidle'});
  const kryptekTargets=await kryptekPage.locator('.interaction-toggle,.media-inspect-trigger').evaluateAll((elements)=>elements
   .filter((element)=>{
    const style=getComputedStyle(element);
    const box=element.getBoundingClientRect();
    return style.visibility!=='hidden'&&style.display!=='none'&&box.width>0&&box.height>0;
   })
   .map((element)=>{
    const box=element.getBoundingClientRect();
    return {label:element.textContent?.trim()||'',width:box.width,height:box.height};
   }));
  assert(kryptekTargets.length>0,`${width}: Kryptek exposed no shared controls`);
  for(const target of kryptekTargets){
   assert(target.width>=44&&target.height>=44,`${width}: Kryptek control “${target.label}” measured ${target.width}×${target.height}`);
  }

  const sidecars=await kryptekPage.evaluate(()=>[
   {name:'text',selector:'[data-case-layout="TEXT SIDECAR 01"]'},
   {name:'media',selector:'[data-case-layout="MEDIA SIDECAR 01"]'},
  ].map(({name,selector})=>{
   const section=document.querySelector(selector);
   const rail=section?.querySelector('[class*="layoutWrap"]');
   const shell=section?.querySelector('[class*="layoutShell"]');
   const text=section?.querySelector('[class*="narrativePane"],[class*="sidecarPane"]');
   const media=section?.querySelector('[class*="mediaPane"]');
   if(!section||!rail||!shell||!text||!media)throw new Error(`Missing ${name} sidecar contract elements`);
   const box=(element)=>{
    const rect=element.getBoundingClientRect();
    return {left:rect.left,right:rect.right,top:rect.top,bottom:rect.bottom,width:rect.width};
   };
   return {name,rail:box(rail),shell:box(shell),text:box(text),media:box(media)};
  }));
  for(const sidecar of sidecars){
   const isTwoColumn=sidecar.text.right<=sidecar.media.left+1||sidecar.media.right<=sidecar.text.left+1;
   if(width>=1024){
    assert(isTwoColumn,`${width}: ${sidecar.name} sidecar did not use the approved two-column mode`);
    assert(near(sidecar.text.top,sidecar.media.top),`${width}: ${sidecar.name} sidecar columns do not share a top edge`);
   }else{
    assert(!isTwoColumn,`${width}: ${sidecar.name} sidecar should remain stacked`);
    assert(near(sidecar.text.left,sidecar.media.left),`${width}: ${sidecar.name} stacked panes do not share a left edge`);
   }
   assert(sidecar.text.width>=260,`${width}: ${sidecar.name} sidecar text measure is only ${sidecar.text.width}px`);
   assert(sidecar.media.left>=sidecar.rail.left-1&&sidecar.media.right<=sidecar.rail.right+1,`${width}: ${sidecar.name} sidecar media escapes the canonical rail`);
  }
  await kryptekPage.close();
 }

 const semanticRoutes=[
  '/',
  '/about',
  '/work',
  '/contact',
  '/work/interaction-lab',
  '/work/kryptek-identity-system',
 ];

 for(const route of semanticRoutes){
  const semanticPage=await browser.newPage({viewport:{width:1440,height:1200},reducedMotion:'reduce'});
  await semanticPage.goto(`${baseUrl}${route}`,{waitUntil:'networkidle'});

  const visibleText=await semanticPage.locator('body').innerText();
  assert(!visibleText.includes('↗'),`${route}: diagonal arrow ↗ violates the global directional-arrow contract`);

  if(route==='/work/kryptek-identity-system'){
   const backIndexLabel=(await semanticPage.locator('a.project-navigation-center[href="/work"]').textContent())?.trim();
   assert(backIndexLabel?.startsWith('←'),`Case-study back-to-index action must use ←, received: ${backIndexLabel}`);
  }

  if(route==='/'){
   assert(
    await semanticPage.locator('.intent-arrow').allTextContents()
     .then((values)=>values.length>0&&values.every((value)=>value.trim()==='→')),
    'Homepage intent arrows must use →'
   );
   const intentItems=await semanticPage.locator('.intent-grid>a').evaluateAll((links)=>
    links.map((link)=>({
     label:link.children[1]?.textContent?.trim()||'',
     href:link.getAttribute('href')||'',
     arrow:link.children[2]?.textContent?.trim()||'',
    }))
   );

   const creativeArtIntent=intentItems.find((item)=>item.label==='Creative & Art Direction');
   assert(creativeArtIntent,'Homepage Browse by Intent is missing Creative & Art Direction');
   assert(
    creativeArtIntent.href==='/work?intent=Creative%20%26%20Art%20Direction',
    `Creative & Art Direction intent link has unexpected destination: ${creativeArtIntent.href}`
   );

   const intentResultPage=await browser.newPage({viewport:{width:1440,height:1200},reducedMotion:'reduce'});
   await intentResultPage.goto(`${baseUrl}${creativeArtIntent.href}`,{waitUntil:'networkidle'});
   const intentResultText=await intentResultPage.locator('body').innerText();
   assert(intentResultText.includes('2024 Big Game Guide'),'Creative & Art Direction filter is missing 2024 Big Game Guide');
   assert(intentResultText.includes('Kryptek Merchandise'),'Creative & Art Direction filter is missing Kryptek Merchandise');
   await intentResultPage.close();

   const approachHeading=(await semanticPage.locator('.approach h2').textContent())?.trim();
   assert(
    approachHeading==='Not every problem needs every tool. The value is knowing what the work actually requires.',
    `Homepage Approach heading does not match approved copy: ${approachHeading}`
   );

   const approachLink=semanticPage.locator('.approach a.text-link[href="/about"]');
   assert(await approachLink.count()===1,'Homepage Approach must link to /about');
   assert(
    (await approachLink.textContent())?.trim()==='More about Austin →',
    'Homepage Approach CTA must use the approved forward-navigation label'
   );

   assert(
    (await semanticPage.locator('.footer-title span').textContent())?.trim()==='→',
    'Footer forward arrow must use →'
   );

   const heroSupportingType=await semanticPage.locator('.hero-rail p').evaluate((element)=>{
    const style=getComputedStyle(element);
    return {
     fontSize:style.fontSize,
     lineHeight:style.lineHeight,
     fontFamily:style.fontFamily,
     fontWeight:style.fontWeight,
    };
   });

   assert(heroSupportingType.fontSize==='17px',`Homepage hero supporting copy font size was ${heroSupportingType.fontSize}, expected 17px`);
   assert(near(parseFloat(heroSupportingType.lineHeight),30.6,.2),`Homepage hero supporting copy line height was ${heroSupportingType.lineHeight}, expected 30.6px`);
   assert(heroSupportingType.fontFamily.includes('Archivo'),`Homepage hero supporting copy did not resolve to Archivo: ${heroSupportingType.fontFamily}`);
   assert(heroSupportingType.fontWeight==='400',`Homepage hero supporting copy weight was ${heroSupportingType.fontWeight}, expected 400`);
  }

  await semanticPage.close();
 }

 const notFoundPage=await browser.newPage({viewport:{width:1440,height:1200},reducedMotion:'reduce'});
 await notFoundPage.goto(`${baseUrl}/__als-authority-404__`,{waitUntil:'networkidle'});
 const notFoundBackLabel=(await notFoundPage.locator('a.button[href="/work"]').textContent())?.trim();
 assert(notFoundBackLabel?.startsWith('←'),`404 back-to-index action must use ←, received: ${notFoundBackLabel}`);
 await notFoundPage.close();
}finally{
 await browser.close();
}

console.log(JSON.stringify({status:'pass',widths,routes:routes.map(({name,path})=>({name,path})),samples:report.length,outputDir},null,2));
