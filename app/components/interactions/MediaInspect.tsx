'use client';
import {type ReactNode,useEffect,useId,useRef,useState} from 'react';

type Props={
 trigger:ReactNode;
 expanded:ReactNode;
 label?:string;
 caption?:string;
 credit?:string;
 tone?:'bone'|'obsidian';
};

export default function MediaInspect({trigger,expanded,label='INSPECT ↗',caption,credit,tone='bone'}:Props){
 const titleId=useId();
 const buttonRef=useRef<HTMLButtonElement>(null);
 const closeRef=useRef<HTMLButtonElement>(null);
 const [open,setOpen]=useState(false);

 useEffect(()=>{
  if(!open)return;
  closeRef.current?.focus();
  const onKey=(event:KeyboardEvent)=>{
   if(event.key==='Escape'){
    event.preventDefault();
    setOpen(false);
    buttonRef.current?.focus();
   }
  };
  const priorOverflow=document.body.style.overflow;
  document.body.style.overflow='hidden';
  window.addEventListener('keydown',onKey);
  return ()=>{
   document.body.style.overflow=priorOverflow;
   window.removeEventListener('keydown',onKey);
  };
 },[open]);

 return <div className="media-inspect">
  <div>{trigger}</div>
  <button ref={buttonRef} type="button" className="media-inspect-trigger" onClick={()=>setOpen(true)}>{label}</button>
    {open&&<div className="media-inspect-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={(event)=>{if(event.target===event.currentTarget){setOpen(false);buttonRef.current?.focus();}}}>
     <div className={`media-inspect-shell tone-${tone}`}>
    <div className="media-inspect-head">
     <h3 id={titleId}>Media inspect</h3>
     <button ref={closeRef} type="button" onClick={()=>{setOpen(false);buttonRef.current?.focus();}}>Close</button>
    </div>
    <div className="media-inspect-body">{expanded}</div>
    {(caption||credit)&&<footer className="media-inspect-meta">{caption&&<p>{caption}</p>}{credit&&<p className="eyebrow">{credit}</p>}</footer>}
   </div>
  </div>}
 </div>;
}
