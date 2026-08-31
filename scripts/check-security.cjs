const assert=require('node:assert/strict');const root=process.argv[2];
const {readBoundedBody,readJsonObject}=require(root+'/lib/request-body.js');
const {publicMediaSlots,registry}=require(root+'/lib/content-registry.js');
const {matchesSignature}=require(root+'/lib/media-validation.js');
(async()=>{
 const chunks=new ReadableStream({start(c){c.enqueue(new Uint8Array(5));c.enqueue(new Uint8Array(5));c.close()}});
 await assert.rejects(readBoundedBody(new Request('http://localhost',{method:'POST',body:chunks,duplex:'half'}),8,'too large'),e=>e.status===413);
 for(const data of ['[]','null','{'])await assert.rejects(readJsonObject(new Request('http://localhost',{method:'POST',body:data,headers:{'Content-Type':'application/json'}})),e=>e.status===400);
 const hidden={'project.kryptek_identity.settings.published':'false'};
 assert(!publicMediaSlots(hidden).has('project.kryptek_identity.opening.hero'));
 assert(!publicMediaSlots(hidden).has('work.index.kryptek_identity.image'));
 assert(!publicMediaSlots(hidden).has('home.selected_work.kryptek_identity.image'));
 const values=Object.fromEntries(registry.filter(e=>e.id.endsWith('.featured')).map(e=>[e.id,'false']));
 assert(!publicMediaSlots(values).has('home.hero.image'));assert(!publicMediaSlots(values).has('home.hero.detail_image'));
 function ftyp(major,compatible=[]){const b=Buffer.alloc(16+compatible.length*4);b.writeUInt32BE(b.length);b.write('ftyp',4);b.write(major,8);compatible.forEach((v,i)=>b.write(v,16+4*i));return b}
 assert(matchesSignature(ftyp('isom',['mp42']),'video/mp4'));
 assert(matchesSignature(ftyp('mif1',['avif']),'image/avif'));
 assert(!matchesSignature(ftyp('evil'),'video/mp4'));
 assert(!matchesSignature(ftyp('avif'),'video/mp4'));
 assert(!matchesSignature(Buffer.from('<svg/>'),'image/png'));
 console.log('PASS: chunked body limits, malformed JSON, active media rules including hidden homepage heroes, and AVIF/MP4 brand validation.');
})().catch(e=>{console.error(e);process.exit(1)});
