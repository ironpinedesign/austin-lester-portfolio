'use client';
import {useState,useEffect,useRef} from 'react';
import Link from '../components/SiteLink';
import AdminNav from './admin-nav';
import type {MediaSlot} from '../../lib/projects';
import type {MediaRecord,SiteSettings} from '../../lib/storage';
import {ALLOWED_TYPES as allowed} from '../../lib/media-validation';
import {collectDrop,snapshotDrop,uploadProblem,uploadType,MAX_BATCH_FILES,type DropSnapshot} from '../../lib/media-drop';
type Placement={slot:string;media_id:string};
async function request(url:string,options?:RequestInit){const r=await fetch(url,options);if(!r.ok){let text=await r.text();try{text=JSON.parse(text).error||text}catch{}throw new Error(text||'Something went wrong. Please try again.')}return r.json() as Promise<{media:MediaRecord[];placements:Placement[]}>}
function bytes(n:number){return n<1024*1024?`${Math.ceil(n/1024)} KB`:`${(n/1024/1024).toFixed(1)} MB`}
export default function Studio({claimed,isOwner,displayName,projects,slots,initialSettings}:{claimed:boolean;isOwner:boolean;displayName:string;projects:{slug:string;title:string;number:string}[];slots:MediaSlot[];initialSettings:SiteSettings}){
 const [code,setCode]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[media,setMedia]=useState<MediaRecord[]>([]),[placements,setPlacements]=useState<Placement[]>([]),[selected,setSelected]=useState(''),[project,setProject]=useState('home'),[search,setSearch]=useState(''),[alt,setAlt]=useState(''),[confirmDelete,setConfirmDelete]=useState(false),[settings,setSettings]=useState(initialSettings),[loading,setLoading]=useState(isOwner),[uploading,setUploading]=useState(false),[progress,setProgress]=useState(0);
 const input=useRef<HTMLInputElement>(null),uploadLock=useRef(false);
 const [dragging,setDragging]=useState(false),[uploadLabel,setUploadLabel]=useState(''),[uploadIssues,setUploadIssues]=useState<string[]>([]);
 async function refresh(){const data=await request('/api/studio/media');setMedia(data.media);setPlacements(data.placements)}
 useEffect(()=>{if(isOwner)refresh().catch(e=>setError(e.message)).finally(()=>setLoading(false))},[isOwner]);
 const item=media.find(m=>m.id===selected);const currentSlots=slots.filter(s=>s.projectSlug===project);
 useEffect(()=>{setAlt(item?.alt||'');setConfirmDelete(false)},[item?.id,item?.alt]);
 async function action(fn:()=>Promise<void>,message:string){setError('');setNotice('');setBusy(true);try{await fn();setNotice(message)}catch(e){setError(e instanceof Error?e.message:'Please try again.')}finally{setBusy(false)}}
 async function upload(source:File[]|DropSnapshot,fromDrop=false){
  if(uploadLock.current||busy||uploading){setError('An upload or save is already in progress. Wait for it to finish, then drop your files again.');return;}
  uploadLock.current=true;setError('');setNotice('');setUploadIssues([]);setUploading(true);setProgress(0);setUploadLabel('Reading your files…');
  let succeeded=0;const issues:string[]=[];
  try{
   const collected=fromDrop?await collectDrop(source as DropSnapshot):{files:source as File[],issues:[]};
   issues.push(...collected.issues);
   if(collected.files.length>MAX_BATCH_FILES)throw new Error('Choose up to 500 files at a time. Nothing from this batch was uploaded.');
   const list=collected.files.filter(file=>{const problem=uploadProblem(file);if(problem)issues.push(`${file.name}: ${problem}`);return !problem});
   for(let i=0;i<list.length;i++){
    const file=list[i];setUploadLabel(`${i+1} of ${list.length} — ${file.name}`);
    try{
     const data=await new Promise<{id:string}>((resolve,reject)=>{
      const xhr=new XMLHttpRequest();xhr.open('POST','/api/studio/media');xhr.timeout=180000;
      xhr.setRequestHeader('Content-Type',uploadType(file));xhr.setRequestHeader('X-Filename',encodeURIComponent(file.name));
      xhr.upload.onprogress=e=>{if(e.lengthComputable)setProgress(Math.round(((i+e.loaded/e.total)/list.length)*100))};
      xhr.onload=()=>{try{const body=JSON.parse(xhr.responseText);if(xhr.status>=200&&xhr.status<300&&body.id)resolve(body);else reject(new Error(body.error||'Upload failed. Please try again.'))}catch{reject(new Error('Upload failed. Please try again.'))}};
      xhr.onerror=()=>reject(new Error('The connection was interrupted. Try this file again.'));
      xhr.ontimeout=()=>reject(new Error('The upload timed out. Try a smaller file or a faster connection.'));
      xhr.send(file);
     });
     succeeded++;setSelected(data.id);
    }catch(e){issues.push(`${file.name}: ${e instanceof Error?e.message:'Upload failed.'}`)}
    setProgress(Math.round(((i+1)/list.length)*100));
   }
   setNotice(succeeded?`${succeeded} ${succeeded===1?'file uploaded':'files uploaded'}${issues.length?`; ${issues.length} item(s) need attention`:''}. Choose a project position to add your work to the site.`:issues.length?'No files uploaded. Review the items below.':'No media files found. Open the folder and drag its files, or use Browse files.');
  }catch(e){setError(e instanceof Error?e.message:'Could not read these files. Please try again.')}
  finally{
   setUploadIssues(issues);
   if(succeeded)await refresh().catch(()=>setError('Your uploads were saved, but the library could not refresh. Reload this page before uploading again.'));
   setUploading(false);setUploadLabel('');setProgress(0);uploadLock.current=false;if(input.current)input.current.value='';
  }
 }
 useEffect(()=>{
  if(!isOwner)return;
  let depth=0;
  const isFileDrag=(e:DragEvent)=>Array.from(e.dataTransfer?.types||[]).includes('Files');
  const reset=()=>{depth=0;setDragging(false)};
  const enter=(e:DragEvent)=>{if(isFileDrag(e)){e.preventDefault();depth++;setDragging(true)}};
  const over=(e:DragEvent)=>{if(isFileDrag(e)){e.preventDefault();if(e.dataTransfer)e.dataTransfer.dropEffect=busy||uploadLock.current?'none':'copy'}};
  const leave=(e:DragEvent)=>{if(isFileDrag(e)&&--depth<=0)reset()};
  const drop=(e:DragEvent)=>{if(isFileDrag(e)){e.preventDefault();reset();if(e.dataTransfer)void upload(snapshotDrop(e.dataTransfer),true)}};
  const escape=(e:KeyboardEvent)=>{if(e.key==='Escape')reset()};
  window.addEventListener('dragenter',enter);window.addEventListener('dragover',over);window.addEventListener('dragleave',leave);window.addEventListener('drop',drop);window.addEventListener('blur',reset);window.addEventListener('keydown',escape);
  return()=>{window.removeEventListener('dragenter',enter);window.removeEventListener('dragover',over);window.removeEventListener('dragleave',leave);window.removeEventListener('drop',drop);window.removeEventListener('blur',reset);window.removeEventListener('keydown',escape)};
 // The handlers need only the owner/save state; the synchronous lock protects uploads.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[isOwner,busy]);
 const disabled=busy||uploading;
 const usage=(id:string)=>placements.filter(p=>p.media_id===id).map(p=>slots.find(s=>s.key===p.slot)?.location||p.slot);
 useEffect(()=>{const q=new URLSearchParams(window.location.search);if(q.get('page'))setProject(q.get('page')!);const slot=q.get('slot');if(slot)requestAnimationFrame(()=>document.getElementById(`slot-${slot}`)?.scrollIntoView({block:'center'}))},[]);
 return <section className="wrap studio"><div className="studio-heading"><div><p className="eyebrow">— Private workspace</p><h1>Media <em>studio.</em></h1></div><Link href="/" className="text-link">View portfolio ↗</Link></div><p className="studio-intro">Upload your images and videos. Place them in the portfolio when they’re ready.</p>
 <div className="studio-account"><span>Signed in as {displayName}</span><a href="/signout-with-chatgpt?return_to=%2F">Sign out</a></div>
 {error&&<div className="status-banner error-banner" role="alert">{error}</div>}{notice&&<div className="status-banner" role="status">{notice}</div>}
 {!isOwner?(<div className="studio-setup"><p className="eyebrow">{claimed?'Restricted access':'One-time owner setup'}</p><h2>{claimed?'This studio belongs to another account.':'Connect your account to this portfolio.'}</h2><p>{claimed?'Sign in with the account used to set up this media studio.':'Enter the private setup code supplied with your site. After this one-time step, your ChatGPT account is the only account that can manage media.'}</p>{!claimed&&<form onSubmit={e=>{e.preventDefault();action(async()=>{await request('/api/studio/claim',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code})});window.location.reload()},'Studio connected.')}}><label htmlFor="setup-code">Private setup code</label><input id="setup-code" type="password" value={code} onChange={e=>setCode(e.target.value)} autoComplete="off" required/><button className="button" disabled={busy||!code}>Connect my account ↗</button></form>}</div>):<>
 <AdminNav active="media"/><div className="studio-stats"><div><strong>{media.length}</strong><span>Uploaded files</span></div><div><strong>{placements.length} / {slots.length}</strong><span>Positions filled</span></div><div><strong>{projects.length}</strong><span>Project collections</span></div></div>
 {dragging&&<div className="studio-drop-overlay" role="status"><div><span aria-hidden="true">↑</span><h2>{disabled?'Please wait for the current upload or save.':'Drop to add to your library.'}</h2><p>{disabled?'Your files have not been added yet.':'Images, videos, or a folder of exported media. Nothing is assigned to the site automatically.'}</p></div></div>}
 <div className={`upload-zone ${dragging?'is-dragging':''}`} aria-busy={uploading}><span className="upload-mark" aria-hidden="true">↑</span><div><h2>Drag your work right in.</h2><p>Drag files from Finder, or drop a folder of exported media anywhere in this studio.</p><small>JPG, PNG, WebP, GIF, AVIF, MP4, WebM · 25 MB per file · Up to 500 files per batch</small><p className="upload-help">Folder support depends on your browser. You can always select the files inside and drag them together.</p></div><button className="button" disabled={disabled} onClick={()=>input.current?.click()}>{uploading?`Uploading ${progress}%`:'Browse files ↑'}</button><input ref={input} aria-label="Upload portfolio media" type="file" accept={allowed.join(',')} multiple hidden onChange={e=>{if(e.target.files?.length)void upload(Array.from(e.target.files))}}/>{uploading&&<progress value={progress} max={100} aria-label="Upload progress"/>}</div>
 {uploading&&<p className="upload-current" role="status">{uploadLabel} · Keep this page open until the upload finishes.</p>}
 {uploadIssues.length>0&&<details className="upload-issues"><summary>{uploadIssues.length} item(s) could not be uploaded — view details</summary><ul>{uploadIssues.map((issue,i)=><li key={i}>{issue}</li>)}</ul><p>Successful uploads are already in your library. Retry only the files listed here.</p></details>}
 <p className="studio-note">Uploads stay private until assigned to a currently visible position on a published page. Files assigned only to hidden projects stay private. Changes to positions appear after refreshing the portfolio.</p>
 <div className="studio-workspace"><div className="library"><div className="library-heading"><h2>Your library</h2><label><span className="sr-only">Search media</span><input placeholder="Search filenames…" value={search} onChange={e=>setSearch(e.target.value)}/></label></div>{loading?<p className="empty-state">Loading your library…</p>:media.length===0?<div className="library-empty"><span>＋</span><h3>Your work goes here.</h3><p>The site uses placeholders until you upload and assign media.</p></div>:<div className="media-grid">{media.filter(m=>m.filename.toLowerCase().includes(search.toLowerCase())).map(m=><button key={m.id} className={`media-tile ${selected===m.id?'is-selected':''}`} aria-pressed={selected===m.id} onClick={()=>setSelected(m.id)}><div className="media-tile-preview">{m.mime.startsWith('video/')?<><video src={`/api/media/${m.id}`} muted preload="metadata"/><span className="video-badge">Video ▷</span></>:<img src={`/api/media/${m.id}`} alt={m.alt||m.filename} loading="lazy"/>}</div><strong>{m.filename}</strong><span>{bytes(m.bytes)} · {placements.filter(p=>p.media_id===m.id).length?'USED':'UNUSED'}</span></button>)}</div>}
 {item&&<div className="file-details"><div className="file-details-heading"><h3>{item.filename}</h3><button className="text-button" onClick={()=>setSelected('')}>Close ×</button></div>{item.mime.startsWith('video/')&&<video className="selected-video" src={`/api/media/${item.id}`} controls preload="metadata"/>}<p>{bytes(item.bytes)} · {item.mime} · Added {new Date(item.created_at).toLocaleDateString()}</p><div className="media-usage"><h4>{usage(item.id).length?"Used in these locations":"UNUSED — kept in your library"}</h4>{usage(item.id).length>0&&<ul>{usage(item.id).map(label=><li key={label}>{label}</li>)}</ul>}</div><label htmlFor="media-alt">Description / alternative text</label><textarea id="media-alt" maxLength={400} value={alt} onChange={e=>setAlt(e.target.value)} placeholder="Describe what the image or video shows." rows={3}/><div className="file-actions"><button className="button secondary" disabled={disabled} onClick={()=>action(async()=>{await request('/api/studio/media',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:item.id,alt})});await refresh()},'Description saved.')}>Save description</button><button className="text-button danger" disabled={disabled} onClick={()=>setConfirmDelete(true)}>Delete file</button></div>{confirmDelete&&<div className="delete-confirm" role="alert"><p>Delete “{item.filename}”? This removes the stored file and restores placeholders in all {placements.filter(p=>p.media_id===item.id).length} assigned positions.</p><ul>{usage(item.id).map(label=><li key={label}>{label}</li>)}</ul><button className="button danger-button" disabled={disabled} onClick={()=>action(async()=>{await request('/api/studio/media',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:item.id})});setSelected('');await refresh()},'File deleted. Its positions now use placeholders.')}>Delete permanently</button><button className="text-button" onClick={()=>setConfirmDelete(false)}>Cancel</button></div>}</div>}
 </div><aside className="placement-panel"><p className="eyebrow">— Site assignments</p><h2>Website positions</h2><p>Choose a page, then a clearly named position. Swapping or clearing a position keeps the original file in your library.</p><label htmlFor="project-select">Page</label><select id="project-select" value={project} onChange={e=>setProject(e.target.value)}><option value="home">Homepage</option><option value="work">Work / Index</option>{projects.map(p=><option key={p.slug} value={p.slug}>{p.number} / {p.title}</option>)}</select><Link className="text-link" href={project==='home'?'/':project==='work'?'/work':`/work/${project}`} target="_blank">View this page ↗</Link><div className="slot-list">{currentSlots.map(s=>{const binding=placements.find(p=>p.slot===s.key);const m=media.find(m=>m.id===binding?.media_id);return <div className="slot-control" key={s.key}><label htmlFor={`slot-${s.key}`}>{s.label}</label>{m&&<div className="assigned-preview">{m.mime.startsWith("video/")?<video src={`/api/media/${m.id}`} muted preload="metadata"/>:<img src={`/api/media/${m.id}`} alt={m.alt||m.filename}/>}<small>{m.filename}</small></div>}<select id={`slot-${s.key}`} value={m?.id||''} disabled={disabled} onChange={e=>{const mediaId=e.target.value||null;action(async()=>{await request('/api/studio/placements',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({slot:s.key,mediaId})});await refresh()},mediaId?'Position updated. Refresh the portfolio to see it.':'Placeholder restored.')}}><option value="">Placeholder — no media assigned</option>{media.map(m=><option key={m.id} value={m.id}>{m.mime.startsWith('video/')?'Video: ':''}{m.filename}</option>)}</select><span className={m?'slot-filled':'slot-empty'}>{m?'● USED':binding?'! MISSING':'○ PLACEHOLDER'}{!s.active?' · Not currently shown':''}</span></div>})}</div></aside></div>
 <section className="studio-settings"><div><p className="eyebrow">— Site details</p><h2>A way to reach you.</h2><p>Add your confirmed contact details here. Empty fields stay hidden on the contact page.</p></div><form onSubmit={e=>{e.preventDefault();action(async()=>{await request('/api/studio/settings',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(settings)})},'Contact details saved.')}}><label htmlFor="contact-email">Public contact email</label><input id="contact-email" type="email" maxLength={254} value={settings.contact_email} onChange={e=>setSettings({...settings,contact_email:e.target.value})} placeholder="you@example.com"/><label htmlFor="location">Location / availability</label><input id="location" maxLength={120} value={settings.location} onChange={e=>setSettings({...settings,location:e.target.value})} placeholder="Your location or working availability"/><label htmlFor="linkedin">LinkedIn profile</label><input id="linkedin" type="url" maxLength={500} value={settings.linkedin} onChange={e=>setSettings({...settings,linkedin:e.target.value})} placeholder="https://www.linkedin.com/in/…"/><button className="button" disabled={disabled}>Save contact details ↗</button></form></section>
 </>}
 </section>;
}
