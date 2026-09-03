'use client';
import {type ReactNode,useEffect,useId,useRef,useState} from 'react';

type Props={
 children:ReactNode;
 label?:string;
 title?:string;
 body:string;
 closeLabel?:string;
};

export default function MediaDetail({children,label='+',title,body,closeLabel='Close'}:Props){
 const panelId=useId();
 const triggerRef=useRef<HTMLButtonElement>(null);
 const closeRef=useRef<HTMLButtonElement>(null);
 const [open,setOpen]=useState(false);

 useEffect(()=>{
  if(!open)return;
  closeRef.current?.focus();
  const onKey=(event:KeyboardEvent)=>{
   if(event.key==='Escape'){
    event.preventDefault();
    setOpen(false);
    triggerRef.current?.focus();
   }
  };
  window.addEventListener('keydown',onKey);
  return ()=>window.removeEventListener('keydown',onKey);
 },[open]);

 return <div className={`media-detail ${open?'is-open':''}`}>
  {children}
  <button ref={triggerRef} type="button" className="media-detail-trigger" aria-expanded={open} aria-controls={panelId} onClick={()=>setOpen(v=>!v)}>
   {label}
  </button>
  <aside id={panelId} className="media-detail-panel" hidden={!open}>
   <div className="media-detail-head">
    {title&&<h3>{title}</h3>}
    <button ref={closeRef} type="button" className="media-detail-close" onClick={()=>{setOpen(false);triggerRef.current?.focus();}}>{closeLabel}</button>
   </div>
   <p>{body}</p>
  </aside>
 </div>;
}
