'use client';
import {type CSSProperties,type ReactNode,useCallback,useEffect,useId,useMemo,useRef,useState} from 'react';

type Props={
 children:ReactNode;
 label?:string;
 title?:string;
 body:string;
 closeLabel?:string;
 x?:number;
 y?:number;
};

export default function MediaDetail({children,label='+',title,body,closeLabel='Close',x=90,y=88}:Props){
 const panelId=useId();
 const rootRef=useRef<HTMLDivElement>(null);
 const triggerRef=useRef<HTMLButtonElement>(null);
 const panelRef=useRef<HTMLElement>(null);
 const closeRef=useRef<HTMLButtonElement>(null);
 const [open,setOpen]=useState(false);
 const [panelPosition,setPanelPosition]=useState<{left:number;top:number}|null>(null);
 const [markerPosition,setMarkerPosition]=useState<{left:number;top:number}|null>(null);
 const markerX=useMemo(()=>Math.max(0,Math.min(100,x)),[x]);
 const markerY=useMemo(()=>Math.max(0,Math.min(100,y)),[y]);

 const findAnchor=useCallback((root:HTMLDivElement)=>{
    return root.querySelector<HTMLElement>('[data-media-detail-anchor]')
     ||root.querySelector<HTMLElement>('.media-inspect > div:first-child')
     ||root.querySelector<HTMLElement>('.media-frame')
     ||root.querySelector<HTMLElement>('.interaction-demo-asset')
     ||root;
 },[]);

 const readAnchorBox=useCallback(()=>{
    const root=rootRef.current;
    if(!root)return null;
    const rootBox=root.getBoundingClientRect();
    const anchor=findAnchor(root);
    const anchorBox=anchor.getBoundingClientRect();
    return {
     left:anchorBox.left-rootBox.left,
     top:anchorBox.top-rootBox.top,
     width:anchorBox.width,
     height:anchorBox.height,
    };
 },[findAnchor]);

 useEffect(()=>{
    const positionMarker=()=>{
     const anchorBox=readAnchorBox();
     if(!anchorBox)return;
     setMarkerPosition({
        left:anchorBox.left+(anchorBox.width*(markerX/100)),
        top:anchorBox.top+(anchorBox.height*(markerY/100)),
     });
    };
    const frame=window.requestAnimationFrame(positionMarker);
    window.addEventListener('resize',positionMarker);
    return ()=>{
     window.cancelAnimationFrame(frame);
     window.removeEventListener('resize',positionMarker);
    };
 },[markerX,markerY,readAnchorBox]);

 useEffect(()=>{
  if(!open)return;
    const panel=panelRef.current;
    if(!panel)return;

  let frame=0;
  const positionPanel=()=>{
   const panelBox=panel.getBoundingClientRect();
     const anchorBox=readAnchorBox();
     if(!anchorBox)return;
     const anchorX=anchorBox.left+(anchorBox.width*(markerX/100));
     const anchorY=anchorBox.top+(anchorBox.height*(markerY/100));
   const gap=16;
   const pad=10;

   const preferRight=markerX<=60;
   const preferBelow=markerY<=45;

   const naturalLeft=preferRight?anchorX+gap:anchorX-gap-panelBox.width;
   const naturalTop=preferBelow?anchorY+gap:anchorY-gap-panelBox.height;
     const minLeft=anchorBox.left+pad;
     const minTop=anchorBox.top+pad;
     const maxLeft=Math.max(minLeft,anchorBox.left+anchorBox.width-panelBox.width-pad);
     const maxTop=Math.max(minTop,anchorBox.top+anchorBox.height-panelBox.height-pad);

     const boundedLeft=Math.max(minLeft,Math.min(naturalLeft,maxLeft));
     const boundedTop=Math.max(minTop,Math.min(naturalTop,maxTop));
   setPanelPosition({left:boundedLeft,top:boundedTop});
  };

  frame=window.requestAnimationFrame(positionPanel);
  window.addEventListener('resize',positionPanel);
  return ()=>{
   window.cancelAnimationFrame(frame);
   window.removeEventListener('resize',positionPanel);
  };
 },[open,markerX,markerY,readAnchorBox]);

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

 const markerStyle=(markerPosition
  ?{left:`${markerPosition.left}px`,top:`${markerPosition.top}px`}
  :{left:`${markerX}%`,top:`${markerY}%`}) as CSSProperties;

 return <div ref={rootRef} className={`media-detail ${open?'is-open':''}`}>
  {children}
  <button ref={triggerRef} type="button" className="media-detail-trigger" style={markerStyle} aria-expanded={open} aria-controls={panelId} onClick={()=>setOpen(v=>!v)}>
   {label}
  </button>
  <aside ref={panelRef} id={panelId} className="media-detail-panel" style={panelPosition?{left:`${panelPosition.left}px`,top:`${panelPosition.top}px`}:undefined} hidden={!open}>
   <div className="media-detail-head">
    {title&&<h3>{title}</h3>}
    <button ref={closeRef} type="button" className="media-detail-close" onClick={()=>{setOpen(false);triggerRef.current?.focus();}}>{closeLabel}</button>
   </div>
   <p>{body}</p>
  </aside>
 </div>;
}
