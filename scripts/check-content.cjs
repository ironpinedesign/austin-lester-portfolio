// Run against TypeScript compiled into an isolated temporary directory.
const assert=require('node:assert/strict');const root=process.argv[2];const {exportCsv,previewCsv}=require(root+'/lib/content-csv.js');const {registry,contentValue,resolveProjects}=require(root+'/lib/content-registry.js');
assert.equal(new Set(registry.map(e=>e.id)).size,registry.length,'All IDs unique');
const base=exportCsv({});assert.equal(previewCsv(base,{}).changes.length,0);assert.equal(previewCsv(base,{}).invalid.length,0);
for(const value of ['Quotes "and", commas\n\nNext paragraph','Unicode — × é','\'=literal',"'A literal apostrophe",'=SUM(1,2)','+44 7000','-leading dash','@name','\t=FORMULA','**Bold** and *italic*']){const values={'home.hero.headline':value};const roundtrip=previewCsv(exportCsv(values),values);assert.equal(roundtrip.changes.length,0,value);assert.equal(roundtrip.invalid.length,0,value)}
function row(id,value){return 'content_id,page,section,field,type,value\n'+[id,'wrong page','wrong section','wrong field','wrong type',value].map(s=>'"'+s.replace(/"/g,'""')+'"').join(',')+'\n'}
const one=previewCsv(row('home.hero.headline','Changed headline'),{});assert.equal(one.changes.length,1);assert.equal(one.changes[0].location,'Homepage > Hero > Headline');assert(one.canApply);
assert.equal(previewCsv(row('not.registered','X'),{}).unknown.length,1);
assert.equal(previewCsv(row('home.hero.headline',''),{}).missingRequired.length,1);
assert.equal(previewCsv(row('project.kryptek_identity.settings.published','maybe'),{}).invalid.length,1);
assert.equal(previewCsv(row('home.hero.primary_cta.destination','javascript:alert(1)'),{}).invalid.length,1);
assert.equal(previewCsv(row('home.hero.primary_cta.destination','//evil.test'),{}).invalid.length,1);
assert.equal(previewCsv(row('home.hero.primary_cta.destination','/missing'),{}).invalid.length,1);
assert.equal(previewCsv(row('home.hero.image','anything'),{}).invalid.length,1);
assert.equal(previewCsv(row('home.selected_work.kryptek_identity.title','anything'),{}).invalid.length,1);
assert(previewCsv('content_id,page,section,field,type,value\nx,y,z,a,b,"unterminated',{}).error);
assert(!previewCsv(row('home.hero.headline','Changed')+row('home.hero.headline','Duplicate').split('\n').slice(1).join('\n'),{}).canApply);
const ps=resolveProjects({'project.kryptek_identity.context.body':'New context','project.kryptek_identity.settings.index_order':'87','project.kryptek_identity.opening.title':'New title'});const p=ps.find(p=>p.content_id==='kryptek_identity');assert.equal(p.content_sections.find(s=>s.content_id==='context').body,'New context');assert.equal(p.index_order,87);assert.equal(contentValue('work.index.kryptek_identity.title',{'project.kryptek_identity.opening.title':'New title'}),'New title');
console.log(`PASS: ${registry.length} unique semantic locations; CSV round trips, multiline/formula safety, partial imports, invalid/unknown/duplicate IDs, required values, shared copy, modular project adapter.`);
