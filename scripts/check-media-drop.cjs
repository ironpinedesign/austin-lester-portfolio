// Run after compiling lib/media-drop.ts to a temporary CommonJS directory.
const assert = require('node:assert/strict');
const {collectDrop, snapshotDrop, uploadProblem, uploadType} = require(process.argv[2]);
const file = (name, type = 'image/png') => new File(['sample'], name, {type});
const entry = f => ({name: f.name, isFile: true, isDirectory: false, file: ok => ok(f)});
const folder = (name, batches) => ({name, isFile: false, isDirectory: true, createReader: () => {
  let i = 0; return {readEntries: ok => ok(batches[i++] || [])};
}});
(async () => {
  const many = Array.from({length: 125}, (_, i) => entry(file(`photo-${i}.png`)));
  const root = folder('Exports', [many.slice(0, 100), many.slice(100), [folder('Nested', [[entry(file('clip.mp4', 'video/mp4'))]]), entry(file('.DS_Store'))]]);
  const result = await collectDrop([{entry: root, file: null}]);
  assert.equal(result.files.length, 126, 'Read every directory batch and nested folder, ignoring dotfiles');
  assert.equal(result.files.at(-1).name, 'clip.mp4');
  const unreadable = {name: 'offline.png', isFile: true, isDirectory: false, file: (_, fail) => fail(new Error('offline'))};
  const mixed = await collectDrop([{entry: unreadable, file: null}, {entry: null, file: file('still-valid.png')}]);
  assert.equal(mixed.issues.length, 1);assert.equal(mixed.files.length, 1);
  assert.equal(uploadType(file('EXPORT.JPG', '')), 'image/jpeg');
  assert.equal(uploadType(file('clip.mp4', 'application/octet-stream')), 'video/mp4');
  assert.match(uploadProblem(file('design.psd', 'image/vnd.adobe.photoshop')), /Unsupported/);
  assert.match(uploadProblem({name:'big.png',type:'image/png',size:25*1024*1024+1}), /25 MB/);
  assert.equal(uploadProblem({name:'limit.png',type:'image/png',size:25*1024*1024}), null);
  assert.match(uploadProblem(new File([], 'empty.png', {type:'image/png'})), /empty/);
  await assert.rejects(() => collectDrop(Array.from({length:501}, () => ({entry:null,file:file('x.png')}))), /Nothing from this batch/);
  assert.equal((await collectDrop([])).files.length, 0);
  const direct = file('direct.png');
  assert.equal(snapshotDrop({items:[],files:[direct]})[0].file, direct);
  const transfer = {items:[{kind:'file',getAsFile:()=>direct,webkitGetAsEntry:()=>entry(direct)}],files:[direct]};
  const snapshot = snapshotDrop(transfer);transfer.items.length=0;transfer.files.length=0;
  assert.equal((await collectDrop(snapshot)).files[0], direct, 'Capture data before the drop event ends');
  console.log('PASS: 126-file nested drop, batched directory reads, unreadable files, type inference, size limits, 500-file cap and protected drop snapshot.');
})().catch(error => {console.error(error);process.exitCode=1;});
