'use client';

import {
 type ReactNode,
 useCallback,
 useEffect,
 useId,
 useRef,
 useState
} from 'react';
import {createPortal} from 'react-dom';

export type MediaInspectItem={
 id:string;
 content:ReactNode;
 caption?:string;
 credit?:string;
};

type Props={
 trigger:ReactNode;
 expanded:ReactNode;
 label?:string;
 caption?:string;
 credit?:string;
 tone?:'bone'|'obsidian';
 items?:MediaInspectItem[];
 initialIndex?:number;
};

const focusableSelector=[
 'a[href]',
 'button:not([disabled])',
 'input:not([disabled])',
 'select:not([disabled])',
 'textarea:not([disabled])',
 '[tabindex]:not([tabindex="-1"])'
].join(',');

export default function MediaInspect({
 trigger,
 expanded,
 label='INSPECT →',
 caption,
 credit,
 tone='bone',
 items,
 initialIndex=0
}:Props){
 const titleId=useId();
 const dialogId=useId();
 const triggerRef=useRef<HTMLButtonElement>(null);
 const dialogRef=useRef<HTMLDivElement>(null);
 const closeRef=useRef<HTMLButtonElement>(null);
 const restoreFocusRef=useRef(false);

 const [open,setOpen]=useState(false);
 const [selectedIndex,setSelectedIndex]=useState(initialIndex);

 const resolvedItems:MediaInspectItem[]=items?.length
  ?items
  :[{
    id:'current',
    content:expanded,
    caption,
    credit
   }];

 const boundedIndex=Math.min(
  Math.max(selectedIndex,0),
  Math.max(0,resolvedItems.length-1)
 );

 const selected=resolvedItems[boundedIndex];

 const closeDialog=useCallback(()=>{
  restoreFocusRef.current=true;
  setOpen(false);
 },[]);

 function openDialog(){
  setOpen(true);
 }

 function move(delta:number){
  setSelectedIndex((current)=>{
   const next=current+delta;
   return Math.min(
    Math.max(next,0),
    resolvedItems.length-1
   );
  });
 }

 useEffect(()=>{
  if(!open)return;

  const dialog=dialogRef.current;
  if(!dialog)return;

  const portalRoot=dialog.closest(
   '[data-media-inspect-portal]'
  );

  const outside=[...document.body.children]
   .filter((element)=>element!==portalRoot)
   .map((element)=>{
    const node=element as HTMLElement;
    return {
     node,
     inert:node.inert
    };
   });

  outside.forEach(({node})=>{
   node.inert=true;
  });

  const priorOverflow=document.body.style.overflow;
  document.body.style.overflow='hidden';

  const focusables=()=>[
   ...dialog.querySelectorAll<HTMLElement>(
    focusableSelector
   )
  ].filter((element)=>{
   const style=getComputedStyle(element);
   return (
    style.display!=='none' &&
    style.visibility!=='hidden'
   );
  });

  const onKeyDown=(event:KeyboardEvent)=>{
   if(event.key==='Escape'){
    event.preventDefault();
    closeDialog();
    return;
   }

   if(event.key!=='Tab')return;

   const elements=focusables();

   if(!elements.length){
    event.preventDefault();
    closeRef.current?.focus();
    return;
   }

   const active=document.activeElement as HTMLElement|null;
   const index=active?elements.indexOf(active):-1;

   if(event.shiftKey){
    if(index<=0){
     event.preventDefault();
     elements[elements.length-1]?.focus();
    }
   }else if(
    index===-1 ||
    index===elements.length-1
   ){
    event.preventDefault();
    elements[0]?.focus();
   }
  };

  const onFocusIn=(event:FocusEvent)=>{
   const target=event.target as Node|null;

   if(target&&!dialog.contains(target)){
    closeRef.current?.focus();
   }
  };

  dialog.addEventListener('keydown',onKeyDown);
  document.addEventListener('focusin',onFocusIn);

  requestAnimationFrame(()=>{
   closeRef.current?.focus();
  });

  return ()=>{
   dialog.removeEventListener('keydown',onKeyDown);
   document.removeEventListener('focusin',onFocusIn);

   outside.forEach(({node,inert})=>{
    node.inert=inert;
   });

   document.body.style.overflow=priorOverflow;

   if(restoreFocusRef.current){
    restoreFocusRef.current=false;
    triggerRef.current?.focus();
   }
  };
 },[open,closeDialog]);

 const selectedLabel=[
  selected?.caption,
  selected?.credit
 ].filter(Boolean).join(' / ')||'Media inspect';

 const portal=open&&typeof document!=='undefined'
  ?createPortal(
   <div
    className="media-inspect-dialog"
    data-media-inspect-portal
    onMouseDown={(event)=>{
     if(event.target===event.currentTarget){
      closeDialog();
     }
    }}
   >
    <div
     ref={dialogRef}
     id={dialogId}
     className={`media-inspect-shell tone-${tone}`}
     role="dialog"
     aria-modal="true"
     aria-labelledby={titleId}
    >
     <header className="media-inspect-head">
      <p
       id={titleId}
       className="media-inspect-dialog-caption"
      >
       {selectedLabel}
      </p>

      <button
       ref={closeRef}
       type="button"
       className="media-inspect-close"
       aria-label="Close media inspect"
       onClick={closeDialog}
      >
       ×
      </button>
     </header>

     <div className="media-inspect-body">
      {selected?.content}
     </div>

     <div
      className="media-inspect-controls"
      aria-label="Media inspect navigation"
     >
      <button
       type="button"
       className="media-inspect-prev"
       disabled={
        resolvedItems.length<=1 ||
        boundedIndex===0
       }
       onClick={()=>move(-1)}
      >
       ← PREV
      </button>

      <span
       className="media-inspect-index"
       aria-live="polite"
      >
       {String(boundedIndex+1).padStart(2,'0')}
       {' / '}
       {String(resolvedItems.length).padStart(2,'0')}
      </span>

      <button
       type="button"
       className="media-inspect-next"
       disabled={
        resolvedItems.length<=1 ||
        boundedIndex===resolvedItems.length-1
       }
       onClick={()=>move(1)}
      >
       NEXT →
      </button>
     </div>
    </div>
   </div>,
   document.body
  )
  :null;

 return <div className="media-inspect">
  <div className="media-inspect-inline">
   <div className="media-inspect-media">
    {trigger}
   </div>

   <div
    className="media-inspect-trigger-bar"
    aria-hidden="true"
   >
    <span className="media-inspect-caption">
     {caption||credit||'Selected media'}
    </span>

    <span className="media-inspect-action">
     {label}
    </span>
   </div>

   <button
    ref={triggerRef}
    type="button"
    className="media-inspect-trigger"
    aria-label={`Inspect ${caption||credit||'selected media'}`}
    aria-haspopup="dialog"
    aria-controls={dialogId}
    onClick={openDialog}
   />
  </div>

  {portal}
 </div>;
}
