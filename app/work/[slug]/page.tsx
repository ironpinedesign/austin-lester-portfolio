import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import Link from '../../components/SiteLink';
import {ProseCopy as Prose} from '../../components/Copy';
import ExpandableNarrative from '../../components/interactions/ExpandableNarrative';
import InfoDisclosure from '../../components/interactions/InfoDisclosure';
import InlineLoop from '../../components/interactions/InlineLoop';
import MediaCarousel from '../../components/interactions/MediaCarousel';
import MediaDetail from '../../components/interactions/MediaDetail';
import MediaInspect from '../../components/interactions/MediaInspect';
import Media from '../../components/Media';
import {getContent} from '../../../lib/content';
import {type Section} from '../../../lib/projects';
import {mediaMap,type MediaMap} from '../../../lib/storage';

export const dynamic='force-dynamic';

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const slug=(await params).slug;
 const p=(await getContent()).projects.find((project)=>project.slug===slug);
 if(!p)return {title:'Project not found'};
 const path=`/work/${p.slug}`;
 return {
  title:p.title,
  description:p.thesis,
  alternates:{canonical:path},
  openGraph:{title:p.title,description:p.thesis,type:'article',url:path},
  twitter:{card:'summary_large_image',title:p.title,description:p.thesis}
 };
}

function renderNarrative(s:Section){
 const config=s.interaction?.expandableNarrative;
 if(!s.body)return null;
 if(!config?.enabled)return <Prose text={s.body}/>;
 const paragraphs=s.body.split(/\n\s*\n/).filter(Boolean);
 const previewCount=Math.max(1,config.previewParagraphs||1);
 if(paragraphs.length<=previewCount)return <Prose text={s.body}/>;
 const summaryText=paragraphs.slice(0,previewCount).join('\n\n');
 const detailsText=paragraphs.slice(previewCount).join('\n\n');
 return <ExpandableNarrative
  summary={<Prose text={summaryText}/>}
  details={<Prose text={detailsText}/>}
  fade={config.fade!==false}
  readMoreLabel={config.readMoreLabel||'READ MORE +'}
  showLessLabel={config.showLessLabel||'SHOW LESS -'}
 />;
}

function renderInfoDisclosure(s:Section){
 const config=s.interaction?.infoDisclosure;
 if(!config?.enabled||!config.body)return null;
 return <InfoDisclosure label={config.label||'INFO'} heading={config.heading} variant={config.variant||'inline'}><p>{config.body}</p></InfoDisclosure>;
}

function CaseSection({s,slug,projectId,map,text}:{s:Section;slug:string;projectId:string;map:MediaMap;text:(id:string)=>string}){
 const dark=s.background==='dark'||s.type==='dark_statement';
 const slot=(n=0)=>`project.${projectId}.${s.content_id}.${s.media_slots[n]}`;
 const detailItems=s.interaction?.mediaDetail?.enabled?s.interaction.mediaDetail.items:[];
 const inspectSlots=s.interaction?.mediaInspect?.enabled?new Set(s.interaction.mediaInspect.slots):new Set<string>();
 const loopSlots=s.interaction?.inlineLoop?.enabled?new Set(s.interaction.inlineLoop.slots):new Set<string>();

 const renderSectionMedia=(n:number,className:string,kind:string)=>{
  const slotName=s.media_slots[n]||'';
  const slotKey=slot(n);
  const media=map[slotKey];
  let node=loopSlots.has(slotName)&&media?.mime.startsWith('video/')
   ?<InlineLoop src={`/api/media/${media.id}`} label={media.alt||`${s.narrative_stage||'Project'} / ${slotName}`} className={`media-frame ${className}`} loop={s.interaction?.inlineLoop?.loop!==false}/>
   :<Media slot={slotKey} map={map} label={`${s.narrative_stage||'Project'} / ${String(n+1).padStart(2,'0')}`} className={className} controls kind={kind}/>;

  if(inspectSlots.has(slotName))node=<MediaInspect
    label={s.interaction?.mediaInspect?.buttonLabel||'INSPECT ↗'}
   caption={s.interaction?.mediaInspect?.captions?.[slotName]}
   credit={s.interaction?.mediaInspect?.credits?.[slotName]}
    tone={s.interaction?.mediaInspect?.tone||'bone'}
   trigger={node}
   expanded={<Media slot={slotKey} map={map} label={`${s.heading||s.narrative_stage||'Project'} / Inspect`} className="wide" controls kind={kind}/>}
  />;

  const detail=detailItems?.find((item)=>item.slot===slotName);
    if(detail)node=<MediaDetail label={detail.label||'+'} title={detail.title} body={detail.body} x={detail.x} y={detail.y}>{node}</MediaDetail>;

  return node;
 };

 if(s.type==='pull_quote')return <section id={s.content_id} className={`case-section quote-section ${dark?'dark':''}`}><div className="wrap"><p className="eyebrow">{s.narrative_stage}</p><blockquote><span>“</span>{s.quote}<span>”</span></blockquote>{s.quote_attribution&&<p className="quote-attribution">{s.quote_attribution}</p>}</div></section>;
 if(s.type==='metrics')return <section id={s.content_id} className="case-section dark"><div className="wrap"><p className="eyebrow">{s.narrative_stage}</p><h2 className="case-section-title">{s.heading}</h2><div className="metrics">{s.metrics?.map((m)=><div key={m.label}><strong>{m.value}</strong><span className="eyebrow">{m.label}</span></div>)}</div>{renderInfoDisclosure(s)}{slug==='kryptek-paid-media-system'&&<p className="metric-note">{text('project.kryptek_paid_media.outcome.attribution')}</p>}</div></section>;
 if(['split_text_image','text_image'].includes(s.type))return <section id={s.content_id} className={`case-section ${dark?'dark':''}`}><div className="wrap"><p className="eyebrow">{s.narrative_stage}</p><div className={`case-split ${s.layout==='right'?'image-first':''}`}><div><h2 className="case-section-title">{s.heading}</h2>{renderNarrative(s)}{renderInfoDisclosure(s)}</div>{renderSectionMedia(0,'portrait','image / video')}</div></div></section>;
 if(['gallery','diptych','full_image','full_visual','video'].includes(s.type)){
  const isGallery=['gallery','diptych'].includes(s.type);
  const indexes=isGallery?[0,1,2]:[0];
  const useCarousel=!!(isGallery&&s.interaction?.mediaCarousel?.enabled);
  const kind=s.type==='video'||slug==='the-public-standard'?'video':'image / video';
  const captionFor=(slotName:string)=>s.interaction?.mediaCarousel?.captions?.[slotName];
  const creditFor=(slotName:string)=>s.interaction?.mediaCarousel?.credits?.[slotName];
  return <section id={s.content_id} className={`case-section ${dark?'dark':''}`}><div className="wrap"><p className="eyebrow">{s.narrative_stage}</p><div className="case-gallery-heading"><h2 className="case-section-title">{s.heading}</h2>{renderNarrative(s)}</div>{renderInfoDisclosure(s)}{useCarousel?<MediaCarousel label={s.heading||`${s.narrative_stage||'Project'} media carousel`} items={indexes.map((n)=>{const slotName=s.media_slots[n]||`slot_${n}`;return {id:slotName,content:renderSectionMedia(n,'portrait',kind),caption:captionFor(slotName),credit:creditFor(slotName)};})}/>:<div className={isGallery?'case-gallery':'case-visual'}>{indexes.map((n)=><div key={n}>{renderSectionMedia(n,isGallery?'portrait':'wide',kind)}</div>)}</div>}</div></section>;
 }
 return <section id={s.content_id} className={`case-section ${dark?'dark':''}`}><div className="wrap case-copy-grid"><p className="eyebrow">{s.narrative_stage}</p><div><h2 className="case-section-title">{s.heading}</h2>{renderNarrative(s)}{renderInfoDisclosure(s)}</div></div></section>;
}

export default async function CaseStudy({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 const {projects,text}=await getContent();
 const p=projects.find((project)=>project.slug===slug);
 if(!p)notFound();
 const map=await mediaMap();
 const i=projects.indexOf(p);
 const prev=projects[(i+projects.length-1)%projects.length];
 const next=projects[(i+1)%projects.length];

 return <article>
  <section className="wrap page-opening case-opening">
    <p className="eyebrow">— {p.project_number} / {p.strategic_intent} · {p.year}{p.slug==='the-public-standard'?` · ${text('project.public_standard.opening.status_label')}`:''}</p>
   <div className="case-title-grid">
    <h1>{p.title}</h1>
    <div>
     <p className="case-subtitle">{p.subtitle}</p>
     <p className="eyebrow">{p.client} · {p.year}</p>
    </div>
   </div>
   <div className="case-intro">
    <h2>{p.thesis}</h2>
    <Prose text={p.summary}/>
   </div>
   <dl className="project-facts">
    <div><dt>{text('global.project.client_label')}</dt><dd>{p.client}</dd></div>
    <div><dt>{text('global.project.year_label')}</dt><dd>{p.year}</dd></div>
    <div><dt>{text('global.project.role_label')}</dt><dd>{p.role.join(', ')}</dd></div>
    <div><dt>{text('global.project.disciplines_label')}</dt><dd>{p.discipline_tags.join(', ')}</dd></div>
   </dl>
  </section>

  <div className="wrap case-cover">
   <Media map={map} slot={`project.${p.content_id}.opening.hero`} label={`${p.title} / Cover`} className="cinematic" controls/>
  </div>

  {p.content_sections.map((section)=><CaseSection key={section.content_id} s={section} slug={slug} projectId={p.content_id} map={map} text={text}/>)}

  <section className="case-section dark">
   <div className="wrap">
    <p className="eyebrow">{text('global.project.continue_label')}</p>
    {projects.length>1&&<div className="next-projects">
     <Link href={`/work/${prev.slug}`}><span className="eyebrow">{text('global.project.previous_label')}</span><h2>{prev.title}</h2></Link>
     <Link href={`/work/${next.slug}`}><span className="eyebrow">{text('global.project.next_label')}</span><h2>{next.title}</h2></Link>
    </div>}
    {projects.filter((related)=>p.related_project_ids.includes(related.content_id)&&related.content_id!==p.content_id).map((related)=><div key={related.content_id} className="back-index"><p className="eyebrow">{text('global.project.related_label')}</p><Link className="text-link" href={`/work/${related.slug}`}>{related.title} ↗</Link></div>)}
    <Link className="text-link back-index" href="/work">{text('global.project.index_label')}</Link>
   </div>
  </section>
 </article>;
}
