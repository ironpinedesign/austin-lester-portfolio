'use client';
import {type PointerEvent,type ReactNode,type TouchEvent,useMemo,useRef,useState} from 'react';

type Item={id:string;content:ReactNode;caption?:string;credit?:string;label?:string};
type Props={items:Item[];label:string};

export default function MediaCarousel({items,label}:Props){
 const [index,setIndex]=useState(0);
 const touchStartX=useRef<number|null>(null);
 const pointerStartX=useRef<number|null>(null);
 const total=items.length;
 const active=items[index];
 const count=useMemo(()=>`${String(index+1).padStart(2,'0')} / ${String(total).padStart(2,'0')}`,[index,total]);

 if(total===0)return null;
 const go=(delta:number)=>setIndex((n)=>(n+delta+total)%total);
 const onTouchStart=(event:TouchEvent)=>{touchStartX.current=event.changedTouches[0]?.clientX??null;};
 const onTouchEnd=(event:TouchEvent)=>{
    if(touchStartX.current===null)return;
    const endX=event.changedTouches[0]?.clientX??touchStartX.current;
    const delta=endX-touchStartX.current;
    touchStartX.current=null;
    if(Math.abs(delta)<40)return;
    go(delta<0?1:-1);
 };
 const onPointerDown=(event:PointerEvent)=>{
  if(!event.isPrimary)return;
  pointerStartX.current=event.clientX;
 };
 const onPointerUp=(event:PointerEvent)=>{
  if(pointerStartX.current===null||!event.isPrimary)return;
  const delta=event.clientX-pointerStartX.current;
  pointerStartX.current=null;
  if(Math.abs(delta)<40)return;
  go(delta<0?1:-1);
 };

 return <section className="media-carousel" aria-label={label} onKeyDown={(event)=>{if(event.key==='ArrowLeft'){event.preventDefault();go(-1);}if(event.key==='ArrowRight'){event.preventDefault();go(1);}}}>
  <div className="media-carousel-viewport" tabIndex={0}>
   <div className="media-carousel-track" style={{transform:`translateX(-${index*100}%)`}} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
    {items.map((item,i)=><div key={item.id} className="media-carousel-slide" aria-hidden={i!==index}>{Math.abs(i-index)<=1?item.content:<div className="media-carousel-placeholder" aria-hidden="true"/>}</div>)}
   </div>
  </div>
  <div className="media-carousel-controls">
   <button type="button" onClick={()=>go(-1)} aria-label="Previous slide">Previous</button>
   <span className="carousel-index" aria-live="polite">{count}</span>
   <button type="button" onClick={()=>go(1)} aria-label="Next slide">Next</button>
  </div>
  {(active.caption||active.credit)&&<div className="media-carousel-meta">{active.caption&&<p>{active.caption}</p>}{active.credit&&<p className="eyebrow">{active.credit}</p>}</div>}
 </section>;
}
