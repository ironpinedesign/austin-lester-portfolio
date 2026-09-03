'use client';
import {useId,useRef,useState,type ReactNode} from 'react';

type Props={
 label?:string;
 heading?:string;
 children:ReactNode;
 defaultExpanded?:boolean;
 variant?:'inline'|'row';
};

export default function InfoDisclosure({label='INFO',heading,children,defaultExpanded=false,variant='inline'}:Props){
 const id=useId();
 const triggerRef=useRef<HTMLButtonElement>(null);
 const [open,setOpen]=useState(defaultExpanded);

 return <section className={`info-disclosure ${open?'is-open':''} variant-${variant}`}>
  <button ref={triggerRef} type="button" className="interaction-toggle" aria-expanded={open} aria-controls={id} onClick={()=>setOpen(v=>!v)}>
     {open?`${label} −`:`${label} +`}
  </button>
  <div id={id} hidden={!open} className="info-disclosure-panel">
   {heading&&<h3>{heading}</h3>}
   <div className="prose">{children}</div>
  </div>
 </section>;
}
