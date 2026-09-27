'use client';

import {useId,useRef,useState} from 'react';
import type {BoundMedia} from '../../../lib/storage';
import styles from './BeforeAfterCompare.module.css';

type Props={
 eyebrow:string;
 heading?:string|null;
 body?:string|null;
 legacy?:BoundMedia;
 refined?:BoundMedia;
 legacyMobile?:BoundMedia;
 refinedMobile?:BoundMedia;
};

function mediaSrc(media?:BoundMedia){
 if(!media)return '';
 return media.id.startsWith('fixture:')
  ?media.id.slice('fixture:'.length)
  :`/api/media/${media.id}`;
}

function ComparisonImage({
 desktop,
 mobile,
 label
}:{
 desktop?:BoundMedia;
 mobile?:BoundMedia;
 label:string;
}){
 const desktopSrc=mediaSrc(desktop);
 const mobileSrc=mediaSrc(mobile);

 if(!desktopSrc){
  return <div className={styles.placeholder}>
   <span aria-hidden="true">＋</span>
   <span>{label}</span>
  </div>;
 }

 return <picture className={styles.picture}>
  {mobileSrc&&<source
   media="(max-width: 620px)"
   srcSet={mobileSrc}
  />}
  <img
   src={desktopSrc}
   alt={desktop?.alt||label}
   draggable={false}
  />
 </picture>;
}

function valueText(position:number){
 const rounded=Math.round(position);

 if(rounded===100)return '100 percent legacy';
 if(rounded===0)return '100 percent refined';

 return `${rounded} percent legacy, ${100-rounded} percent refined`;
}

export default function BeforeAfterCompare({
 eyebrow,
 heading,
 body,
 legacy,
 refined,
 legacyMobile,
 refinedMobile
}:Props){
 const titleId=useId();
 const frameRef=useRef<HTMLDivElement>(null);

 const [position,setPosition]=useState(50);
 const [dragging,setDragging]=useState(false);
 const [focused,setFocused]=useState(false);

 const hasMobilePair=!!legacyMobile&&!!refinedMobile;

 const setClampedPosition=(next:number)=>{
  setPosition(Math.max(0,Math.min(100,next)));
 };

 const updateFromPointer=(clientX:number)=>{
  const rect=frameRef.current?.getBoundingClientRect();
  if(!rect||rect.width<=0)return;

  setClampedPosition(
   ((clientX-rect.left)/rect.width)*100
  );
 };

 const endDrag=()=>{
  setDragging(false);
 };

 return <section
  className={`case-section ${styles.root}`}
  data-case-specialized="before-after-compare"
  aria-labelledby={titleId}
 >
  <div className={`wrap ${styles.inner}`}>
   <div className={styles.intro}>
    <p className={`eyebrow ${styles.eyebrow}`}>
     {eyebrow}
    </p>

    <div className={styles.introCopy}>
     {heading&&<h2 id={titleId} className={styles.heading}>
      {heading}
     </h2>}

     {body&&<p className={styles.body}>
      {body}
     </p>}
    </div>
   </div>

   <div className={styles.rail}>
    <span>Identity System Comparison</span>
    <span className={styles.prompt}>Drag to compare ↔</span>
   </div>

   <div
    ref={frameRef}
    className={[
     styles.frame,
     hasMobilePair?styles.frameHasMobile:'',
     dragging?styles.active:'',
     focused?styles.focused:''
    ].filter(Boolean).join(' ')}
    role="group"
    aria-label="Compare the legacy and refined Kryptek identity systems"
   >
    <div className={styles.refinedLayer}>
     <ComparisonImage
      desktop={refined}
      mobile={refinedMobile}
      label="Refined identity system"
     />
    </div>

    <div
     className={styles.legacyLayer}
     style={{
      clipPath:`inset(0 ${100-position}% 0 0)`
     }}
     aria-hidden="true"
    >
     <ComparisonImage
      desktop={legacy}
      mobile={legacyMobile}
      label="Legacy identity system"
     />
    </div>

    <div
     className={styles.divider}
     style={{left:`${position}%`}}
     aria-hidden="true"
    >
     <div className={styles.grip}/>
    </div>

    <div
     className={styles.interaction}
     role="slider"
     tabIndex={0}
     aria-label="Compare legacy and refined identity systems"
     aria-valuemin={0}
     aria-valuemax={100}
     aria-valuenow={Math.round(position)}
     aria-valuetext={valueText(position)}
     onFocus={()=>setFocused(true)}
     onBlur={()=>{
      setFocused(false);
      endDrag();
     }}
     onPointerDown={(event)=>{
      if(event.button!==0)return;

      setDragging(true);
      event.currentTarget.setPointerCapture(event.pointerId);
      updateFromPointer(event.clientX);
     }}
     onPointerMove={(event)=>{
      if(!dragging)return;
      updateFromPointer(event.clientX);
     }}
     onPointerUp={(event)=>{
      if(event.currentTarget.hasPointerCapture(event.pointerId)){
       event.currentTarget.releasePointerCapture(event.pointerId);
      }
      endDrag();
     }}
     onPointerCancel={endDrag}
     onKeyDown={(event)=>{
      const step=event.shiftKey?10:2;

      if(event.key==='ArrowLeft'){
       event.preventDefault();
       setClampedPosition(position-step);
      }

      if(event.key==='ArrowRight'){
       event.preventDefault();
       setClampedPosition(position+step);
      }

      if(event.key==='Home'){
       event.preventDefault();
       setClampedPosition(0);
      }

      if(event.key==='End'){
       event.preventDefault();
       setClampedPosition(100);
      }
     }}
    />
   </div>

   <div className={styles.states}>
    <div>
     <p className={styles.stateLabel}>
      Legacy Identity
     </p>
    </div>

    <div className={styles.refinedState}>
     <p className={styles.stateLabel}>
      Refined Identity
     </p>
    </div>
   </div>
  </div>
 </section>;
}
