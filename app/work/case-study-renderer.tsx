import Link from '../components/SiteLink';
import {ProseCopy as Prose} from '../components/Copy';
import ExpandableNarrative from '../components/interactions/ExpandableNarrative';
import InfoDisclosure from '../components/interactions/InfoDisclosure';
import SystemBrowser from '../components/interactions/SystemBrowser';
import InlineLoop from '../components/interactions/InlineLoop';
import MediaCarousel from '../components/interactions/MediaCarousel';
import MediaDetail from '../components/interactions/MediaDetail';
import MediaInspect from '../components/interactions/MediaInspect';
import CaseLayoutSystem from '../components/layouts/CaseLayoutSystem';
import Media from '../components/Media';
import {type Project, type Section} from '../../lib/projects';
import {resolveCaseStudyRuntime,resolveSectionRuntime} from '../../lib/case-study-runtime';
import type {MediaMap} from '../../lib/storage';

type CaseStudyArticleProps={
 project:Project;
 projects:Project[];
 map:MediaMap;
 text:(id:string)=>string;
 showCover?:boolean;
 coverSlotName?:string;
 navigationProjectSlug?:string;
};

function renderNarrative(s:Section,interaction:Section['interaction']=s.interaction){
 const config=interaction?.expandableNarrative;
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

function renderInfoDisclosure(s:Section,interaction:Section['interaction']=s.interaction){
 const config=interaction?.infoDisclosure;
 if(!config?.enabled||!config.body)return null;
 return <InfoDisclosure label={config.label||'INFO'} heading={config.heading} variant={config.variant||'inline'}><p>{config.body}</p></InfoDisclosure>;
}

function CaseSection({s,slug,projectId,map,text}:{s:Section;slug:string;projectId:string;map:MediaMap;text:(id:string)=>string}){
 const runtime=resolveSectionRuntime(s);
 const dark=runtime.dark;
 const mediaSlots=runtime.mediaSlots;
 const interaction=runtime.interaction;

 if(runtime.specializedComponent==='SYSTEM BROWSER'&&s.modular?.systemBrowser){
  return <SystemBrowser
   sectionId={s.content_id}
   eyebrow={s.narrative_stage||'KIS_05 · Governing System'}
   states={s.modular.systemBrowser.states}
   mediaSlots={mediaSlots}
   projectId={projectId}
   map={map}
   disclosure={interaction?.infoDisclosure}
  />;
 }

 const slot=(n=0)=>`project.${projectId}.${s.content_id}.${mediaSlots[n]||'primary_visual'}`;
 const narrativeNode=renderNarrative(s,interaction);
 const infoDisclosure=renderInfoDisclosure(s,interaction);
 const sectionKind=runtime.specializedComponent==='VIDEO FEATURE'||s.type==='video'||(!s.modular&&slug==='the-public-standard')?'video':'image / video';
 const detailItems=interaction?.mediaDetail?.enabled?interaction.mediaDetail.items:[];
 const inspectSlots=interaction?.mediaInspect?.enabled?new Set(interaction.mediaInspect.slots):new Set<string>();
 const loopSlots=interaction?.inlineLoop?.enabled?new Set(interaction.inlineLoop.slots):new Set<string>();

 const renderSectionMedia=(n:number,className:string,kind:string)=>{
  const slotName=mediaSlots[n]||'';
  const slotKey=slot(n);
  const media=map[slotKey];
  let node=loopSlots.has(slotName)&&media?.mime.startsWith('video/')
   ?<InlineLoop src={`/api/media/${media.id}`} label={media.alt||`${s.narrative_stage||'Project'} / ${slotName}`} className={`media-frame ${className}`} loop={interaction?.inlineLoop?.loop!==false}/>
   :<Media slot={slotKey} map={map} label={`${s.narrative_stage||'Project'} / ${String(n+1).padStart(2,'0')}`} className={className} controls kind={kind}/>;

  if(inspectSlots.has(slotName))node=<MediaInspect
   label={interaction?.mediaInspect?.buttonLabel||'INSPECT →'}
   caption={interaction?.mediaInspect?.captions?.[slotName]}
   credit={interaction?.mediaInspect?.credits?.[slotName]}
   tone={interaction?.mediaInspect?.tone||'bone'}
   trigger={node}
   expanded={<Media slot={slotKey} map={map} label={`${s.heading||s.narrative_stage||'Project'} / Inspect`} className="wide" controls kind={kind}/>}
  />;

  const detail=detailItems?.find((item)=>item.slot===slotName);
  if(detail)node=<MediaDetail label={detail.label||'+'} title={detail.title} body={detail.body} x={detail.x} y={detail.y}>{node}</MediaDetail>;

  return node;
 };

 if(runtime.layoutConfig?.layout){
  const mediaNodes=mediaSlots.map((_,index)=><div key={`${s.content_id}-${index}`}>{renderSectionMedia(index,'wide',sectionKind)}</div>);
  return <CaseLayoutSystem
   sectionId={s.content_id}
   narrativeStage={s.narrative_stage}
   heading={s.heading}
   narrative={narrativeNode}
   disclosure={infoDisclosure}
   mediaNodes={mediaNodes}
   dark={dark}
   modular={!!s.modular}
   layoutConfig={runtime.layoutConfig}
  />;
 }

 const semanticRole=runtime.semanticRole;
 const isQuote=semanticRole==='quote'||(!semanticRole&&s.type==='pull_quote');
 const isMetrics=semanticRole==='metrics'||(!semanticRole&&s.type==='metrics');

 if(isQuote)return <section id={s.content_id} className={`case-section quote-section ${dark?'dark':''}`}><div className="wrap"><p className="eyebrow">{s.narrative_stage}</p><blockquote><span>&ldquo;</span>{s.quote}<span>&rdquo;</span></blockquote>{s.quote_attribution&&<p className="quote-attribution">{s.quote_attribution}</p>}</div></section>;
 if(isMetrics)return <section id={s.content_id} className={`case-section ${dark?'dark':''}`}><div className="wrap"><p className="eyebrow">{s.narrative_stage}</p><h2 className="case-section-title">{s.heading}</h2><div className="metrics">{s.metrics?.map((m)=><div key={m.label}><strong>{m.value}</strong><span className="eyebrow">{m.label}</span></div>)}</div>{infoDisclosure}{!s.modular&&slug==='kryptek-paid-media-system'&&<p className="metric-note">{text('project.kryptek_paid_media.outcome.attribution')}</p>}</div></section>;
 if(['split_text_image','text_image'].includes(s.type))return <section id={s.content_id} className={`case-section ${dark?'dark':''}`}><div className="wrap"><p className="eyebrow">{s.narrative_stage}</p><div className={`case-split ${s.layout==='right'?'image-first':''}`}><div><h2 className="case-section-title">{s.heading}</h2>{narrativeNode}{infoDisclosure}</div>{renderSectionMedia(0,'portrait','image / video')}</div></div></section>;
 if(['gallery','diptych','full_image','full_visual','video'].includes(s.type)){
  const isGallery=['gallery','diptych'].includes(s.type);
  const indexes=isGallery?[0,1,2]:[0];
  const useCarousel=!!(isGallery&&interaction?.mediaCarousel?.enabled);
  const kind=sectionKind;
  const captionFor=(slotName:string)=>interaction?.mediaCarousel?.captions?.[slotName];
  const creditFor=(slotName:string)=>interaction?.mediaCarousel?.credits?.[slotName];
  return <section id={s.content_id} className={`case-section ${dark?'dark':''}`}><div className="wrap"><p className="eyebrow">{s.narrative_stage}</p><div className="case-gallery-heading"><h2 className="case-section-title">{s.heading}</h2>{narrativeNode}</div>{infoDisclosure}{useCarousel?<MediaCarousel label={s.heading||`${s.narrative_stage||'Project'} media carousel`} items={indexes.map((n)=>{const slotName=s.media_slots[n]||`slot_${n}`;return {id:slotName,content:renderSectionMedia(n,'portrait',kind),caption:captionFor(slotName),credit:creditFor(slotName)};})}/>:<div className={isGallery?'case-gallery':'case-visual'}>{indexes.map((n)=><div key={n}>{renderSectionMedia(n,isGallery?'portrait':'wide',kind)}</div>)}</div>}</div></section>;
 }

 if(semanticRole==='insight'){
  return <section
   id={s.content_id}
   className="case-section case-semantic-card-section"
   data-case-role="insight"
  >
   <div className="wrap case-semantic-card case-semantic-insight">
    <div className="case-semantic-card-rail">
     <p className="eyebrow">{s.narrative_stage||'Insight'}</p>
    </div>
    <div className="case-semantic-card-copy">
     <h2>{s.heading}</h2>
     {narrativeNode}
     {infoDisclosure}
    </div>
   </div>
  </section>;
 }

 if(semanticRole==='outcome'){
  return <section
   id={s.content_id}
   className="case-section case-semantic-card-section"
   data-case-role="outcome"
  >
   <div className="wrap case-semantic-card case-semantic-outcome">
    <div className="case-semantic-card-rail">
     <p className="eyebrow">{s.narrative_stage||'Outcome'}</p>
    </div>
    <div className="case-semantic-card-copy">
     <h2>{s.heading}</h2>
     {narrativeNode}
     {infoDisclosure}
    </div>
   </div>
  </section>;
 }

 if(semanticRole==='credits'){
  return <section
   id={s.content_id}
   className={`case-section case-role-credits ${dark?'dark':''}`}
   data-case-role="credits"
  >
   <div className="wrap case-role-credits-grid">
    <div className="case-role-credits-heading">
     <p className="eyebrow">{s.narrative_stage}</p>
     <h2 className="case-section-title">{s.heading}</h2>
    </div>
    <div className="case-role-credits-details">
     {narrativeNode}
     {infoDisclosure}
    </div>
   </div>
  </section>;
 }

 if(!s.modular&&slug==='kryptek-identity-system'&&s.content_id==='credits'&&s.type==='text'){
  return <section id={s.content_id} className={`case-section ${dark?'dark':''}`}><div className="wrap kryptek-credits-grid"><div><p className="eyebrow">{s.narrative_stage}</p><h2 className="case-section-title">{s.heading}</h2></div><div className="kryptek-credits-details">{narrativeNode}{infoDisclosure}</div></div></section>;
 }

 return <section id={s.content_id} className={`case-section ${dark?'dark':''}`}><div className="wrap case-copy-grid"><p className="eyebrow">{s.narrative_stage}</p><div><h2 className="case-section-title">{s.heading}</h2>{narrativeNode}{infoDisclosure}</div></div></section>;
}

export function CaseStudyArticle({project,projects,map,text,showCover=true,coverSlotName='hero',navigationProjectSlug}:CaseStudyArticleProps){
 const runtime=resolveCaseStudyRuntime(project,{showCover,coverSlotName});
 const navigationSlug=navigationProjectSlug||project.slug;
 const navIndex=projects.findIndex((entry)=>entry.slug===navigationSlug);
 const prev=navIndex>=0?projects[(navIndex+projects.length-1)%projects.length]:null;
 const next=navIndex>=0?projects[(navIndex+1)%projects.length]:null;
 const openingQualifier=runtime.openingQualifier??(!project.case_study&&project.slug==='the-public-standard'?text('project.public_standard.opening.status_label'):undefined);

 return <article className={project.slug==='kryptek-identity-system'?'kryptek-case-study':undefined}>
  <section className="wrap page-opening case-opening">
   <p className="eyebrow">- {project.project_number} / {project.strategic_intent} · {project.year}{openingQualifier?` · ${openingQualifier}`:''}</p>
   <div className="case-title-grid">
    <h1>{project.title}</h1>
    <div>
     <p className="case-subtitle">{project.subtitle}</p>
     <p className="eyebrow">{project.client} · {project.year}</p>
    </div>
   </div>
   <div className="case-intro">
    <h2>{project.thesis}</h2>
    <Prose text={project.summary}/>
   </div>
   <dl className="project-facts">
    <div><dt>{text('global.project.client_label')}</dt><dd>{project.client}</dd></div>
    <div><dt>{text('global.project.year_label')}</dt><dd>{project.year}</dd></div>
    <div><dt>{text('global.project.role_label')}</dt><dd>{project.role.join(', ')}</dd></div>
    <div><dt>{text('global.project.disciplines_label')}</dt><dd>{project.discipline_tags.join(', ')}</dd></div>
   </dl>
  </section>

  {runtime.showCover&&<div className="wrap case-cover">
   <Media map={map} slot={`project.${project.content_id}.opening.${runtime.coverSlotName}`} label={`${project.title} / Cover`} className="cinematic" controls/>
  </div>}

    {project.content_sections.map((section)=><CaseSection key={section.content_id} s={section} slug={project.slug} projectId={project.content_id} map={map} text={text}/>)}

  {runtime.navigationVariant==='compact'
   ?<section className="case-section project-navigation-row" aria-label="Project navigation">
    <div className="wrap project-navigation-row-inner">
     <div>{prev&&<Link className="project-navigation-link project-navigation-prev" href={`/work/${prev.slug}`}>{text('global.project.previous_label')}</Link>}</div>
     <div><Link className="project-navigation-link project-navigation-center" href="/work">{text('global.project.index_label')}</Link></div>
     <div>{next&&<Link className="project-navigation-link project-navigation-next" href={`/work/${next.slug}`}>{text('global.project.next_label')}</Link>}</div>
    </div>
   </section>
   :<section className="case-section dark">
    <div className="wrap">
     <p className="eyebrow">{text('global.project.continue_label')}</p>
     {prev&&next&&projects.length>1&&<div className="next-projects">
      <Link href={`/work/${prev.slug}`}><span className="eyebrow">{text('global.project.previous_label')}</span><h2>{prev.title}</h2></Link>
      <Link href={`/work/${next.slug}`}><span className="eyebrow">{text('global.project.next_label')}</span><h2>{next.title}</h2></Link>
     </div>}
     {projects.filter((related)=>runtime.relatedProjectIds.includes(related.content_id)&&related.content_id!==project.content_id).map((related)=><div key={related.content_id} className="back-index"><p className="eyebrow">{text('global.project.related_label')}</p><Link className="text-link" href={`/work/${related.slug}`}>{related.title} →</Link></div>)}
     <Link className="text-link back-index" href="/work">{text('global.project.index_label')}</Link>
    </div>
   </section>}
 </article>;
}
