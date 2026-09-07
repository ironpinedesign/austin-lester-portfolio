import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';

const ROUTE = process.env.KRYPTEK_ROUTE || 'http://localhost:3000/work/kryptek-identity-system';
const OUT_DIR = process.env.KRYPTEK_CAPTURE_DIR || 'qa/kryptek-approval-2026-09-07';

function ensureDir(dir) {
 fs.mkdirSync(dir, {recursive: true});
}

function pngSize(filePath) {
 const buffer = fs.readFileSync(filePath);
 if (buffer.toString('ascii', 1, 4) !== 'PNG') {
  throw new Error(`Not a PNG: ${filePath}`);
 }
 return {
  width: buffer.readUInt32BE(16),
  height: buffer.readUInt32BE(20)
 };
}

async function captureProfile(page, outDir, profileName, viewport) {
 await page.setViewportSize(viewport);
 await page.goto(ROUTE, {waitUntil: 'networkidle'});

 const assertions = await page.evaluate(() => ({
  innerWidth: window.innerWidth,
  clientWidth: document.documentElement.clientWidth,
  dpr: window.devicePixelRatio,
  scrollWidth: document.documentElement.scrollWidth,
  bodyScrollWidth: document.body.scrollWidth,
  docHeight: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)
 }));

 const clips = await page.evaluate(() => {
  const bySelector = (selector) => document.querySelector(selector);
  const rect = (el) => {
   if (!el) {
    return null;
   }
   const r = el.getBoundingClientRect();
   return {
    y: Math.max(0, Math.round(r.top + window.scrollY)),
    h: Math.max(1, Math.round(r.height))
   };
  };

  const opening = bySelector('section.wrap.page-opening.case-opening');
  const title = opening ? bySelector('.case-title-grid', opening) : null;
  const intro = opening ? bySelector('.case-intro', opening) : null;
  const facts = opening ? bySelector('.project-facts', opening) : null;
  const projectNav = bySelector('article > section.project-navigation-row, article > section.case-section.dark:not([id])');

  const sections = [
   ['NAV', rect(bySelector('header.site-nav'))],
   ['CASE_TITLE', rect(title)],
   ['INTRO', rect(intro)],
   ['PROJECT_FACTS', rect(facts)],
   ['KIS_02', rect(bySelector('#kis_02_complete_brand_world'))],
   ['KIS_03', rect(bySelector('#kis_03_inherited_brand_context'))],
   ['INSIGHT', rect(bySelector('#insight'))],
   ['KIS_05', rect(bySelector('#kis_05_governing_system'))],
   ['KIS_08', rect(bySelector('#kis_08_ecommerce_application'))],
   ['KIS_09A', rect(bySelector('#kis_09_editorial_intro'))],
   ['KIS_09B', rect(bySelector('#kis_09_editorial_application'))],
   ['KIS_10', rect(bySelector('#kis_10_campaign_application'))],
   ['OUTCOME', rect(bySelector('#outcome'))],
   ['CREDITS', rect(bySelector('#credits'))],
   ['PROJECT_NAVIGATION', rect(projectNav)],
   ['FOOTER', rect(bySelector('footer.site-footer'))]
  ];

  const measured = Object.fromEntries(
   sections
    .filter(([, value]) => value)
    .map(([key, value]) => [key, value.h])
  );

  const clipsOut = sections
   .filter(([, value]) => value)
   .map(([key, value]) => ({name: key, ...value}));

  return {clipsOut, measured};
 });

 const profileDir = path.join(outDir, profileName);
 ensureDir(profileDir);

 const fullPath = path.join(profileDir, `FULLPAGE_${viewport.width}_APPROVAL.png`);
 await page.screenshot({path: fullPath, fullPage: true});

 const sectionFiles = [];
 for (const clip of clips.clipsOut) {
  const maxHeight = Math.max(0, assertions.docHeight - clip.y);
  const height = Math.min(clip.h, maxHeight);
  if (height <= 0) {
   continue;
  }
  const filePath = path.join(profileDir, `${clip.name}_${viewport.width}_APPROVAL.png`);
  await page.screenshot({
   path: filePath,
    fullPage: true,
   clip: {x: 0, y: clip.y, width: viewport.width, height}
  });
  sectionFiles.push(filePath);
 }

 const dimensions = {};
 dimensions[path.basename(fullPath)] = pngSize(fullPath);
 for (const filePath of sectionFiles) {
  dimensions[path.basename(filePath)] = pngSize(filePath);
 }

 return {
  profileName,
  viewport,
  assertions,
  measured: clips.measured,
  files: {
   fullPage: fullPath,
   sections: sectionFiles
  },
  dimensions
 };
}

async function run() {
 const outDir = path.resolve(OUT_DIR);
 ensureDir(outDir);

 const browser = await chromium.launch({headless: true});
 const context = await browser.newContext({
  viewport: {width: 1440, height: 1800},
  deviceScaleFactor: 1
 });

 const page = await context.newPage();
 await page.addInitScript(() => {
  document.body.style.zoom = '100%';
 });

 const desktop = await captureProfile(page, outDir, 'local', {width: 1440, height: 1800});
 const mobile = await captureProfile(page, outDir, 'local', {width: 390, height: 1600});

 await context.close();
 await browser.close();

 const report = {route: ROUTE, outDir, desktop, mobile};
 const reportPath = path.join(outDir, 'capture-report.json');
 fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
 console.log(JSON.stringify(report, null, 2));
}

run().catch((error) => {
 console.error(error);
 process.exit(1);
});
