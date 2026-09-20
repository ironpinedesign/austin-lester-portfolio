'use client';

import {useEffect,useId,useRef,useState,type KeyboardEvent} from 'react';
import Media from '../Media';
import type {CaseSystemBrowserState,SectionInteractionConfig} from '../../../lib/case-study-schema';
import type {MediaMap} from '../../../lib/storage';
import styles from './SystemBrowser.module.css';

type DisclosureConfig=NonNullable<SectionInteractionConfig['infoDisclosure']>;

type Props={
 sectionId:string;
 eyebrow:string;
 states:CaseSystemBrowserState[];
 mediaSlots:string[];
 projectId:string;
 map:MediaMap;
 disclosure?:DisclosureConfig;
};

function paragraphs(text:string){
 return text.split(/\n\s*\n/).filter(Boolean);
}

export default function SystemBrowser({
 sectionId,
 eyebrow,
 states,
 mediaSlots,
 projectId,
 map,
 disclosure
}:Props){
 const uid=useId();
 const tabsRef=useRef<Array<HTMLButtonElement|null>>([]);
 const [activeId,setActiveId]=useState(states[0]?.id||'');
 const [contextOpen,setContextOpen]=useState(false);
 const [vertical,setVertical]=useState(false);

 useEffect(()=>{
  const media=window.matchMedia('(min-width:900px)');
  const sync=()=>setVertical(media.matches);
  sync();
  media.addEventListener('change',sync);
  return ()=>media.removeEventListener('change',sync);
 },[]);

 const activeIndex=Math.max(0,states.findIndex((state)=>state.id===activeId));
 const active=states[activeIndex]||states[0];
 if(!active)return null;

 const selectedMedia=active.mediaSlots?.length===3?active.mediaSlots:mediaSlots;
 const evidenceSlots=[0,1,2].map((index)=>selectedMedia[index]||mediaSlots[index]||`evidence_${index+1}`);
 const panelId=`${uid}-panel`;
 const contextId=`${uid}-context`;

 function select(index:number,focus=true){
  const normalized=(index+states.length)%states.length;
  const next=states[normalized];
  if(!next)return;
  setActiveId(next.id);
  if(focus){
   requestAnimationFrame(()=>{
    const button=tabsRef.current[normalized];
    button?.focus();
    button?.scrollIntoView({block:'nearest',inline:'center'});
   });
  }
 }

 function onTabKeyDown(event:KeyboardEvent<HTMLButtonElement>,index:number){
  if(['ArrowRight','ArrowDown'].includes(event.key)){
   event.preventDefault();
   select(index+1);
  }else if(['ArrowLeft','ArrowUp'].includes(event.key)){
   event.preventDefault();
   select(index-1);
  }else if(event.key==='Home'){
   event.preventDefault();
   select(0);
  }else if(event.key==='End'){
   event.preventDefault();
   select(states.length-1);
  }
 }

 function slotKey(slotName:string){
  return `project.${projectId}.${sectionId}.${slotName}`;
 }

 return <section id={sectionId} className={`case-section ${styles.root}`} data-system-browser>
  <div className={styles.inner}>
   <div className={styles.layout}>
    <div className={styles.controlRail}>
     <div className={styles.controlMain}>
      <div className={styles.narrativeStack}>
       <div className={styles.titleStack}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 className={styles.title}>
         {active.title.split('\n').map((line,index)=><span key={`${active.id}-${index}`}>{line}</span>)}
        </h2>
       </div>
       <div className={styles.body}>
        {paragraphs(active.body).map((paragraph,index)=><p key={`${active.id}-body-${index}`}>{paragraph}</p>)}
       </div>
      </div>

      <div className={styles.tabsViewport}>
       <div
        className={styles.tabList}
        role="tablist"
        aria-label="Governing system"
        aria-orientation={vertical?'vertical':'horizontal'}
       >
        {states.map((state,index)=>{
         const selected=state.id===active.id;
         const tabId=`${uid}-tab-${state.id}`;
         return <button
          key={state.id}
          ref={(node)=>{tabsRef.current[index]=node}}
          id={tabId}
          className={`${styles.tab} ${selected?styles.activeTab:''}`}
          type="button"
          role="tab"
          aria-selected={selected}
          aria-controls={panelId}
          tabIndex={selected?0:-1}
          onClick={()=>select(index,false)}
          onKeyDown={(event)=>onTabKeyDown(event,index)}
         >
          <span className={styles.tabNumber}>{String(index+1).padStart(2,'0')}</span>
          <span className={styles.tabLabel}>{state.label}</span>
         </button>;
        })}
       </div>
      </div>
     </div>

     {disclosure?.enabled&&disclosure.body&&<div className={styles.disclosure}>
      <button
       type="button"
       className={styles.disclosureToggle}
       aria-expanded={contextOpen}
       aria-controls={contextId}
       onClick={()=>setContextOpen((value)=>!value)}
      >
       <span>{disclosure.label||'EXTENDED CONTEXT'}</span>
       <span className={styles.disclosureIndicator} aria-hidden="true">{contextOpen?'−':'+'}</span>
      </button>
      <div id={contextId} className={styles.disclosurePanel} hidden={!contextOpen}>
       {disclosure.heading&&<h3>{disclosure.heading}</h3>}
       {paragraphs(disclosure.body).map((paragraph,index)=><p key={index}>{paragraph}</p>)}
      </div>
     </div>}
    </div>

    <div
     id={panelId}
     className={styles.evidenceRail}
     role="tabpanel"
     aria-labelledby={`${uid}-tab-${active.id}`}
     tabIndex={0}
    >
     <div className={`${styles.evidenceCard} ${styles.primaryCard}`}>
      <p className={styles.evidenceLabel}>{active.evidenceLabels[0]}</p>
      <div className={styles.mediaSlot}>
       <Media
        map={map}
        slot={slotKey(evidenceSlots[0])}
        label={`${active.label} / ${active.evidenceLabels[0]}`}
        className="wide"
        controls
       />
      </div>
     </div>

     <div className={styles.supportRow}>
      {[1,2].map((index)=><div key={index} className={`${styles.evidenceCard} ${styles.supportCard}`}>
       <p className={styles.evidenceLabel}>{active.evidenceLabels[index]}</p>
       <div className={styles.mediaSlot}>
        <Media
         map={map}
         slot={slotKey(evidenceSlots[index])}
         label={`${active.label} / ${active.evidenceLabels[index]}`}
         className="wide"
         controls
        />
       </div>
      </div>)}
     </div>
    </div>
   </div>
  </div>
 </section>;
}
