import type {Metadata} from 'next';
import type {ReactNode} from 'react';
import CaseLayoutSystem from '../../components/layouts/CaseLayoutSystem';
import MediaDetail from '../../components/interactions/MediaDetail';
import MediaInspect from '../../components/interactions/MediaInspect';
import type {SectionLayoutConfig} from '../../../lib/projects';
import css from './layout-lab.module.css';

export const metadata:Metadata={title:'Layout Lab',robots:{index:false,follow:false}};

type FixtureRatio='wide'|'cinematic'|'portrait'|'square'|'editorial';

function FixtureMedia({label,src,ratio='wide'}:{label:string;src:string;ratio?:FixtureRatio}){
 const ratioClass=ratio==='cinematic'?css.fixtureCinematic:ratio==='portrait'?css.fixturePortrait:ratio==='square'?css.fixtureSquare:ratio==='editorial'?css.fixtureEditorial:css.fixtureWide;
 return <figure className={`${css.fixtureFrame} ${ratioClass}`}>
   {/* eslint-disable-next-line @next/next/no-img-element */}
   <img src={src} alt={label} loading="lazy" />
  <figcaption className={css.fixtureLabel}>{label}</figcaption>
 </figure>;
}

function FixtureVideo({label}:{label:string}){
 return <figure className={`${css.fixtureFrame} ${css.fixtureWide}`}>
  <video src="/fixtures/interaction-loop.mp4" aria-label={label} muted playsInline controls preload="metadata" />
  <figcaption className={css.fixtureLabel}>{label}</figcaption>
 </figure>;
}

function demo(
 sectionId:string,
 stage:string,
 heading:string,
 body:string,
 layoutConfig:SectionLayoutConfig,
 mediaNodes:ReactNode[]
){
 return <CaseLayoutSystem
  key={sectionId}
  sectionId={sectionId}
  narrativeStage={stage}
  heading={heading}
  narrative={<p className="prose">{body}</p>}
  mediaNodes={mediaNodes}
  layoutConfig={layoutConfig}
 />;
}

export default function LayoutLab(){
 const demos=[
  demo(
   'layout-full-bleed-01',
   'FULL BLEED 01 · KIS_02 test shell',
   'Dominant media, minimal chrome.',
   'Spatial test for complete brand world framing. This mode keeps media dominant and suppresses decorative framing.',
   {layout:'FULL BLEED 01'},
   [<FixtureMedia key="a" label="Primary world frame" src="/fixtures/layout-landscape.svg" ratio="cinematic"/>]
  ),
  demo(
   'layout-full-bleed-02',
   'FULL BLEED 02',
   'Dominant media with restrained caption metadata.',
   'Use when one asset should dominate but provenance, role, or constraints must remain attached.',
   {layout:'FULL BLEED 02',caption:'Caption: restrained metadata rail stays physically attached.',metadata:'Metadata: source / year / role'},
   [<FixtureMedia key="a" label="Dominant with caption" src="/fixtures/layout-landscape.svg" ratio="cinematic"/>]
  ),
  demo(
   'layout-text-sidecar-01',
   'TEXT SIDECAR 01',
   'Narrative-led frame with large supporting media.',
   'Desktop ratio targets approximately one-third text and two-thirds media. Mobile collapses to text then media in reading order.',
   {layout:'TEXT SIDECAR 01'},
   [<FixtureMedia key="a" label="Primary support image" src="/fixtures/layout-landscape.svg"/>]
  ),
  demo(
   'layout-media-sidecar-01',
   'MEDIA SIDECAR 01',
   'Dominant media with explanatory sidecar.',
   'Use when visual evidence leads and text only clarifies decisions, not the core impression.',
   {layout:'MEDIA SIDECAR 01',caption:'Sidecar carries constraints and rationale.'},
   [<FixtureMedia key="a" label="Dominant evidence" src="/fixtures/layout-editorial.svg" ratio="editorial"/>]
  ),
  demo(
   'layout-media-sidecar-02',
   'MEDIA SIDECAR 02',
   'Opposite orientation of media sidecar.',
   'Same communication intent as MEDIA SIDECAR 01 with directional inversion for rhythm across long pages.',
   {layout:'MEDIA SIDECAR 02',reverse:true,caption:'Reversed orientation to break monotony.'},
   [<FixtureMedia key="a" label="Dominant evidence reversed" src="/fixtures/layout-editorial.svg" ratio="editorial"/>]
  ),
  demo(
   'layout-asymmetric-grid-01',
   'ASYMMETRIC GRID 01',
   'One dominant region plus two support regions.',
   'Unequal hierarchy avoids card-equivalence and keeps one clear focal image.',
   {layout:'FULL BLEED 02',mediaLayout:'ASYMMETRIC GRID 01',mediaNote:'Media layout mode: ASYMMETRIC GRID 01'},
   [
    <FixtureMedia key="a" label="Dominant region" src="/fixtures/layout-landscape.svg"/>,
    <FixtureMedia key="b" label="Support region A" src="/fixtures/layout-portrait.svg" ratio="portrait"/>,
    <FixtureMedia key="c" label="Support region B" src="/fixtures/layout-square.svg" ratio="square"/>
   ]
  ),
  demo(
   'layout-asymmetric-grid-02',
   'ASYMMETRIC GRID 02 · KIS_03 test shell',
   'Editorially unequal grid with optional text region.',
   'Pairs well with context narratives where one inherited-state frame must dominate while secondary evidence stays subordinate.',
   {layout:'TEXT SIDECAR 01',mediaLayout:'ASYMMETRIC GRID 02',mediaNote:'Media layout mode: ASYMMETRIC GRID 02'},
   [
    <FixtureMedia key="a" label="Dominant evidence" src="/fixtures/layout-editorial.svg" ratio="editorial"/>,
    <FixtureMedia key="b" label="Support 01" src="/fixtures/layout-square.svg" ratio="square"/>,
    <FixtureMedia key="c" label="Support 02" src="/fixtures/layout-portrait.svg" ratio="portrait"/>,
    <FixtureMedia key="d" label="Support 03" src="/fixtures/layout-landscape.svg"/>
   ]
  ),
  demo(
   'layout-specimen-field-01',
   'SPECIMEN FIELD 01',
   'Exceptionally large specimen with minimal support.',
   'Use when one logo, icon, pattern, or artifact should command the field before explanatory context.',
   {layout:'FULL BLEED 02',mediaLayout:'SPECIMEN FIELD 01',mediaNote:'Media layout mode: SPECIMEN FIELD 01'},
   [
    <FixtureMedia key="a" label="Specimen dominant" src="/fixtures/layout-specimen.svg"/>,
    <FixtureMedia key="b" label="Small support" src="/fixtures/layout-square.svg" ratio="square"/>
   ]
  ),
  demo(
   'layout-specimen-field-02',
   'SPECIMEN FIELD 02',
   'Large specimen with multiple small supports.',
   'Useful for showing one master object plus two related variants without equal visual weight.',
   {layout:'MEDIA SIDECAR 01',mediaLayout:'SPECIMEN FIELD 02',mediaNote:'Media layout mode: SPECIMEN FIELD 02'},
   [
    <FixtureMedia key="a" label="Master specimen" src="/fixtures/layout-specimen.svg"/>,
    <FixtureMedia key="b" label="Variant A" src="/fixtures/layout-square.svg" ratio="square"/>,
    <FixtureMedia key="c" label="Variant B" src="/fixtures/layout-portrait.svg" ratio="portrait"/>
   ]
  ),
  demo(
   'layout-editorial-sequence-01',
   'EDITORIAL SEQUENCE 01 · KIS_09 test shell',
   'Controlled cadence for spreads and pages.',
   'Sequence privileges progression and continuity rather than equal cards. One frame can open in inspect for detail reading.',
   {layout:'FULL BLEED 02',mediaLayout:'EDITORIAL SEQUENCE 01',mediaNote:'Media layout mode: EDITORIAL SEQUENCE 01'},
   [
    <MediaInspect
     key="a"
     trigger={<FixtureMedia label="Lead spread (inspect enabled)" src="/fixtures/layout-editorial.svg" ratio="editorial"/>}
     expanded={<FixtureMedia label="Lead spread expanded" src="/fixtures/layout-editorial.svg" ratio="editorial"/>}
     caption="Optional inspect detail for dense pages."
    />,
    <FixtureMedia key="b" label="Sequence page 02" src="/fixtures/layout-portrait.svg" ratio="portrait"/>,
    <FixtureMedia key="c" label="Sequence page 03" src="/fixtures/layout-portrait.svg" ratio="portrait"/>,
    <FixtureMedia key="d" label="Sequence page 04" src="/fixtures/layout-square.svg" ratio="square"/>
   ]
  ),
  demo(
   'layout-archive-grid-01',
   'ARCHIVE GRID 01',
   'Dense controlled archive view.',
   'Best for larger evidence sets where relative equivalence is acceptable and scanning density is desired.',
   {layout:'FULL BLEED 02',mediaLayout:'ARCHIVE GRID 01',mediaNote:'Media layout mode: ARCHIVE GRID 01'},
   [
    <FixtureMedia key="a" label="Archive 01" src="/fixtures/layout-square.svg" ratio="square"/>,
    <FixtureMedia key="b" label="Archive 02" src="/fixtures/layout-portrait.svg" ratio="portrait"/>,
    <FixtureMedia key="c" label="Archive 03" src="/fixtures/layout-landscape.svg"/>,
    <FixtureMedia key="d" label="Archive 04" src="/fixtures/layout-editorial.svg" ratio="editorial"/>,
    <FixtureMedia key="e" label="Archive 05" src="/fixtures/layout-square.svg" ratio="square"/>,
    <FixtureMedia key="f" label="Archive 06" src="/fixtures/layout-portrait.svg" ratio="portrait"/>
   ]
  ),
  demo(
   'layout-archive-grid-02',
   'ARCHIVE GRID 02',
   'One selected piece with supporting archive.',
   'Use when one key frame should lead while preserving context breadth in a compact support rail.',
   {layout:'FULL BLEED 02',mediaLayout:'ARCHIVE GRID 02',mediaNote:'Media layout mode: ARCHIVE GRID 02'},
   [
    <FixtureMedia key="a" label="Selected archive piece" src="/fixtures/layout-editorial.svg" ratio="editorial"/>,
    <FixtureMedia key="b" label="Support 01" src="/fixtures/layout-square.svg" ratio="square"/>,
    <FixtureMedia key="c" label="Support 02" src="/fixtures/layout-portrait.svg" ratio="portrait"/>,
    <FixtureMedia key="d" label="Support 03" src="/fixtures/layout-landscape.svg"/>,
    <FixtureMedia key="e" label="Support 04" src="/fixtures/layout-square.svg" ratio="square"/>
   ]
  ),
  demo(
   'layout-sticky-narrative-01',
   'STICKY NARRATIVE 01',
   'Narrative remains stable while media progresses.',
   'Native CSS sticky only. On mobile, sticky collapses to normal document flow.',
   {layout:'STICKY NARRATIVE 01',mediaLayout:'EDITORIAL SEQUENCE 01'},
   [
    <FixtureMedia key="a" label="Progress frame 01" src="/fixtures/layout-landscape.svg"/>,
    <FixtureMedia key="b" label="Progress frame 02" src="/fixtures/layout-editorial.svg" ratio="editorial"/>,
    <FixtureMedia key="c" label="Progress frame 03" src="/fixtures/layout-portrait.svg" ratio="portrait"/>
   ]
  ),
  demo(
   'layout-sticky-narrative-02',
   'STICKY NARRATIVE 02',
   'Dominant visual remains stable while related content progresses.',
   'Native sticky for desktop only, collapsing to regular flow on mobile to avoid scroll traps.',
    {layout:'STICKY NARRATIVE 02'},
   [<FixtureVideo key="a" label="Persistent dominant visual"/>]
  ),
  demo(
   'layout-state-compare-01',
   'STATE COMPARE 01',
   'Simultaneous state comparison.',
   'Designed for inherited versus governed comparisons without relying on a toggle in baseline presentation.',
   {layout:'STATE COMPARE 01',mediaLayout:'ASYMMETRIC GRID 01'},
   [
    <FixtureMedia key="a" label="State A dominant" src="/fixtures/layout-landscape.svg"/>,
    <FixtureMedia key="b" label="State A support" src="/fixtures/layout-portrait.svg" ratio="portrait"/>,
    <FixtureMedia key="c" label="State B support" src="/fixtures/layout-square.svg" ratio="square"/>
   ]
  ),
  demo(
   'layout-system-stage-01',
   'SYSTEM STAGE 01 · KIS_05 test shell',
   'Indexed system navigation plus large system field.',
   'This shell supports part-to-whole reading and maps cleanly to a future System Explorer interaction without coupling layout and interaction.',
   {
    layout:'SYSTEM STAGE 01',
    mediaLayout:'SPECIMEN FIELD 02',
    systemItems:[
     {id:'foundation',label:'Brand Foundation',description:'Equity, values, and narrative stance.'},
     {id:'identity',label:'Identity + Usage',description:'Master marks and governance rules.'},
     {id:'language',label:'Language + Iconography',description:'Voice and icon semantics.'},
     {id:'application',label:'Application',description:'Digital, editorial, and campaign extensions.'}
    ]
   },
   [
    <FixtureMedia key="a" label="System field dominant" src="/fixtures/layout-specimen.svg"/>,
    <FixtureMedia key="b" label="Subsystem A" src="/fixtures/layout-square.svg" ratio="square"/>,
    <FixtureMedia key="c" label="Subsystem B" src="/fixtures/layout-portrait.svg" ratio="portrait"/>
   ]
  ),
  demo(
   'layout-annotated-stage-01',
   'ANNOTATED STAGE 01',
   'Large central evidence plus annotation-safe regions.',
   'Uses existing MediaDetail annotation behavior inside the stage rather than rebuilding separate annotation logic.',
   {
    layout:'ANNOTATED STAGE 01',
    annotations:[
     {title:'Annotation 01',body:'Explanation stays attached to visual evidence.'},
     {title:'Annotation 02',body:'Support region remains clear at mobile sizes.'}
    ]
   },
   [
    <MediaDetail key="a" title="Attached note" body="MediaDetail is reused here as the annotation mechanism." x={58} y={35}>
     <FixtureMedia label="Annotated central object" src="/fixtures/layout-editorial.svg" ratio="editorial"/>
    </MediaDetail>
   ]
  )
 ];

 return <article className={`wrap ${css.lab}`}>
  <header className={css.intro}>
   <p className="eyebrow">Internal showcase</p>
   <h1>Case Study Layout Lab</h1>
   <p className="prose">Spatial composition vocabulary for case studies. This lab is internal only, non-indexed, and does not alter any published project content.</p>
   <dl className={css.metaGrid}>
    <div><dt>Core principle</dt><dd>Layout defines where content lives. Media presentation defines how assets occupy space. Interaction defines behavior.</dd></div>
    <div><dt>Scope</dt><dd>Vocabulary validation only. No production activation, no content changes, no portfolio redesign.</dd></div>
    <div><dt>KIS demos</dt><dd>Includes test shells for KIS_02, KIS_03, KIS_05, and KIS_09 for planning alignment only.</dd></div>
   </dl>
  </header>
  {demos}
 </article>;
}
