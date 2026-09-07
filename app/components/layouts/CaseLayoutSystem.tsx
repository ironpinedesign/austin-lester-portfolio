import type {ReactNode} from 'react';
import type {CaseMediaLayoutId,CaseSpatialLayoutId,SectionLayoutConfig} from '../../../lib/projects';
import styles from './CaseLayoutSystem.module.css';

type Props={
 sectionId:string;
 narrativeStage?:string|null;
 heading?:string|null;
 narrative?:ReactNode;
 disclosure?:ReactNode;
 mediaNodes:ReactNode[];
 dark?:boolean;
 layoutConfig:SectionLayoutConfig;
};

function cx(...names:Array<string|false|undefined|null>){
 return names.filter(Boolean).join(' ');
}

function fallbackNode(label:string){
 return <div className={cx('media-frame',styles.fallbackMedia,styles.requiredMissing)}><div className="media-placeholder"><span className="media-symbol" aria-hidden="true">+</span><span>{label}</span><span className="placeholder-kind">required media missing</span></div></div>;
}

function requiredNode(nodes:ReactNode[],index:number,label:string){
 return nodes[index]??fallbackNode(label);
}

function optionalNode(nodes:ReactNode[],index:number){
 return nodes[index]??null;
}

function mediaNode(node:ReactNode){
 return <div className={styles.mediaNode}>{node}</div>;
}

function renderMediaLayout(mediaLayout:CaseMediaLayoutId|undefined,nodes:ReactNode[],mediaNote?:string){
 const note=mediaNote?<p className={styles.mediaNote}>{mediaNote}</p>:null;

 if(mediaLayout==='ASYMMETRIC GRID 01'){
    const supportA=optionalNode(nodes,1);
    const supportB=optionalNode(nodes,2);
    const hasSupports=!!(supportA||supportB);
  return <>
     <div className={cx(styles.asymmetricGrid01,!hasSupports&&styles.singleColumn)}>
        <div className={styles.dominantRegion}>{mediaNode(requiredNode(nodes,0,'Primary media'))}</div>
        {hasSupports&&<div className={styles.asymmetricSupportStack}>
         {supportA&&mediaNode(supportA)}
         {supportB&&mediaNode(supportB)}
        </div>}
   </div>
   {note}
  </>;
 }

 if(mediaLayout==='ASYMMETRIC GRID 02'){
    const supportA=optionalNode(nodes,1);
    const supportB=optionalNode(nodes,2);
    const supportC=optionalNode(nodes,3);
    const hasStack=!!(supportA||supportB);
    const hasSupports=hasStack||!!supportC;
  return <>
     <div className={cx(styles.asymmetricGrid02,!hasSupports&&styles.singleColumn)}>
        <div className={styles.dominantRegion}>{mediaNode(requiredNode(nodes,0,'Primary media'))}</div>
        {hasSupports&&<div className={styles.supportRail}>
         {hasStack&&<div className={cx(styles.asymmetricSupportStack,styles.mediaNode)}>
          {supportA&&mediaNode(supportA)}
          {supportB&&mediaNode(supportB)}
         </div>}
         {supportC&&<div className={styles.supportWide}>{mediaNode(supportC)}</div>}
        </div>}
   </div>
   {note}
  </>;
 }

 if(mediaLayout==='SPECIMEN FIELD 01'){
    const support=optionalNode(nodes,1);
  return <>
     <div className={cx(styles.specimenField01,!support&&styles.singleColumn)}>
        <div className={styles.specimenDominant}>{mediaNode(requiredNode(nodes,0,'Specimen'))}</div>
        {support&&<div className={styles.specimenSupport}>{mediaNode(support)}</div>}
   </div>
   {note}
  </>;
 }

 if(mediaLayout==='SPECIMEN FIELD 02'){
    const supportA=optionalNode(nodes,1);
    const supportB=optionalNode(nodes,2);
    const hasSupports=!!(supportA||supportB);
  return <>
     <div className={cx(styles.specimenField02,!hasSupports&&styles.singleColumn)}>
        <div className={styles.specimenDominant}>{mediaNode(requiredNode(nodes,0,'Specimen'))}</div>
        {supportA&&mediaNode(supportA)}
        {supportB&&mediaNode(supportB)}
   </div>
   {note}
  </>;
 }

 if(mediaLayout==='EDITORIAL SEQUENCE 01'){
    const item02=optionalNode(nodes,1);
    const item03=optionalNode(nodes,2);
    const item04=optionalNode(nodes,3);
  return <>
     <div className={styles.editorialSequence01}>
        <div className={styles.sequenceLead}>{mediaNode(requiredNode(nodes,0,'Lead editorial frame'))}</div>
        {item02&&<div className={styles.sequenceSupportA}>{mediaNode(item02)}</div>}
        {item03&&<div className={styles.sequenceSupportB}>{mediaNode(item03)}</div>}
        {item04&&<div className={styles.sequenceClosing}>{mediaNode(item04)}</div>}
   </div>
   {note}
  </>;
 }

 if(mediaLayout==='ARCHIVE GRID 01'){
    const archiveItems=nodes.length?nodes:[fallbackNode('Archive media missing')];
  return <>
   <div className={styles.archiveGrid01}>
      {archiveItems.map((node,index)=><div key={index}>{mediaNode(node)}</div>)}
   </div>
   {note}
  </>;
 }

 if(mediaLayout==='ARCHIVE GRID 02'){
    const supportNodes=nodes.slice(1);
  return <>
   <div className={styles.archiveGrid02}>
      <div className={styles.dominantRegion}>{mediaNode(requiredNode(nodes,0,'Selected archive piece'))}</div>
        {supportNodes.length>0&&<div className={styles.archiveSupportRail}>
       {supportNodes.map((node,index)=><div key={index}>{mediaNode(node)}</div>)}
        </div>}
   </div>
   {note}
  </>;
 }

 return <>
    <div className={styles.defaultMediaRegion}>{mediaNode(requiredNode(nodes,0,'Primary media'))}</div>
  {note}
 </>;
}

function renderNarrativeBlock(heading:Props['heading'],narrative:Props['narrative'],disclosure:Props['disclosure']){
 if(!heading&&!narrative&&!disclosure)return null;
 return <div className={styles.narrativeBlock}>
  {heading&&<h2 className="case-section-title">{heading}</h2>}
  {narrative}
  {disclosure}
 </div>;
}

function renderNarrativePrimary(heading:Props['heading'],narrative:Props['narrative']){
 if(!heading&&!narrative)return null;
 return <div className={styles.narrativeBlock}>
  {heading&&<h2 className="case-section-title">{heading}</h2>}
  {narrative}
 </div>;
}

export default function CaseLayoutSystem({sectionId,narrativeStage,heading,narrative,disclosure,mediaNodes,dark=false,layoutConfig}:Props){
 const spatialLayout:CaseSpatialLayoutId=layoutConfig.layout||'FULL BLEED 01';
 const narrativeBlock=renderNarrativeBlock(heading,narrative,disclosure);
 const narrativePrimary=renderNarrativePrimary(heading,narrative);
 const mediaRegion=renderMediaLayout(layoutConfig.mediaLayout,mediaNodes,layoutConfig.mediaNote);
 const shellClass=getShellClass(spatialLayout);
 const reverseClass=layoutConfig.reverse?styles.reverse:false;
 const viewportBleedClass=layoutConfig.viewportBleed?styles.viewportBleed:false;

 return <section id={sectionId} className={cx('case-section',dark&&'dark',styles.layoutSection,viewportBleedClass)}>
  <div className={cx('wrap',styles.layoutWrap)}>
   {narrativeStage&&<p className="eyebrow">{narrativeStage}</p>}
   <div className={cx(styles.layoutShell,shellClass,reverseClass)}>
      {renderLayout(spatialLayout,narrativeBlock,narrativePrimary,disclosure,mediaRegion,layoutConfig)}
   </div>
  </div>
 </section>;
}

function getShellClass(layout:CaseSpatialLayoutId){
 if(layout==='FULL BLEED 01')return styles.fullBleed01;
 if(layout==='FULL BLEED 02')return styles.fullBleed02;
 if(layout==='TEXT SIDECAR 01')return styles.textSidecar01;
 if(layout==='MEDIA SIDECAR 01')return styles.mediaSidecar01;
 if(layout==='MEDIA SIDECAR 02')return styles.mediaSidecar02;
 if(layout==='STICKY NARRATIVE 01')return styles.stickyNarrative01;
 if(layout==='STICKY NARRATIVE 02')return styles.stickyNarrative02;
 if(layout==='STATE COMPARE 01')return styles.stateCompare01;
 if(layout==='SYSTEM STAGE 01')return styles.systemStage01;
 return styles.annotatedStage01;
}

function renderLayout(layout:CaseSpatialLayoutId,narrativeBlock:ReactNode,narrativePrimary:ReactNode,disclosure:ReactNode,mediaRegion:ReactNode,layoutConfig:SectionLayoutConfig){
 const caption=layoutConfig.caption?<p className={styles.caption}>{layoutConfig.caption}</p>:null;
 const metadata=layoutConfig.metadata?<p className={styles.metadata}>{layoutConfig.metadata}</p>:null;

 if(layout==='FULL BLEED 01')return <div className={styles.fullBleedRegion}>{mediaRegion}</div>;

 if(layout==='FULL BLEED 02')return <div className={styles.fullBleedRegion}>
  {mediaRegion}
  {(caption||metadata)&&<div className={styles.captionRail}>{caption}{metadata}</div>}
 </div>;

 if(layout==='TEXT SIDECAR 01')return <>
  <div className={styles.narrativePane}>{narrativeBlock}</div>
  <div className={styles.mediaPane}>{mediaRegion}</div>
 </>;

 if(layout==='MEDIA SIDECAR 01'||layout==='MEDIA SIDECAR 02')return <>
  <div className={styles.mediaPane}>{mediaRegion}</div>
  <div className={styles.sidecarPane}>{narrativeBlock}{caption}{metadata}</div>
 </>;

 if(layout==='STICKY NARRATIVE 01')return <>
  <div className={styles.stickyPane}>{narrativeBlock}</div>
  <div className={styles.flowPane}>{mediaRegion}</div>
 </>;

 if(layout==='STICKY NARRATIVE 02')return <>
  <div className={styles.stickyPane}>{mediaRegion}</div>
  <div className={styles.flowPane}>{narrativeBlock}{caption}{metadata}</div>
 </>;

 if(layout==='STATE COMPARE 01')return <>
  <div className={styles.comparePane}>{narrativeBlock}</div>
  <div className={styles.comparePane}>{mediaRegion}</div>
 </>;

 if(layout==='SYSTEM STAGE 01'){
  const items=layoutConfig.systemItems||[];
  return <>
   <div className={styles.systemNav}>
   {narrativePrimary}
    {items.length>0&&<ol>
     {items.map((item,index)=><li key={item.id}><span>{String(index+1).padStart(2,'0')}</span><div><strong>{item.label}</strong>{item.description&&<p>{item.description}</p>}</div></li>)}
    </ol>}
   {disclosure}
   </div>
   <div className={styles.systemField}>{mediaRegion}</div>
  </>;
 }

 const annotations=layoutConfig.annotations||[];
 return <>
  <aside className={styles.annotationRail}>
   {narrativeBlock}
   {annotations.length>0&&<ul>
    {annotations.map((annotation,index)=><li key={`${annotation.title}-${index}`}><h3>{annotation.title}</h3><p>{annotation.body}</p></li>)}
   </ul>}
  </aside>
  <div className={styles.annotatedField}>{mediaRegion}</div>
 </>;
}
