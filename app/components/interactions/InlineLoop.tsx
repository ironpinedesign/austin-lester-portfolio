'use client';
import {useEffect,useRef,useState} from 'react';

type Props={src:string;poster?:string;label:string;className?:string;loop?:boolean};

export default function InlineLoop({src,poster,label,className='',loop=true}:Props){
 const videoRef=useRef<HTMLVideoElement>(null);
 const [playing,setPlaying]=useState(false);
 const [pausedByUser,setPausedByUser]=useState(false);
 const [reducedMotion,setReducedMotion]=useState(false);

 useEffect(()=>{
  const media=window.matchMedia('(prefers-reduced-motion: reduce)');
  const sync=()=>setReducedMotion(media.matches);
  sync();
  media.addEventListener('change',sync);
  return ()=>media.removeEventListener('change',sync);
 },[]);

 useEffect(()=>{
  const video=videoRef.current;
  if(!video||reducedMotion)return;
  const observer=new IntersectionObserver((entries)=>{
   const entry=entries[0];
   if(!entry)return;
   if(entry.intersectionRatio>=0.6&&!pausedByUser){
    video.play().then(()=>setPlaying(true)).catch(()=>{});
   }
   if(entry.intersectionRatio<=0.2){
    video.pause();
    setPlaying(false);
   }
  },{threshold:[0,0.2,0.6,1]});
  observer.observe(video);
  return ()=>observer.disconnect();
 },[pausedByUser,reducedMotion]);

 return <figure className={`inline-loop ${className}`}>
  <video ref={videoRef} src={src} poster={poster} aria-label={label} muted playsInline loop={loop} preload="metadata"/>
  <button type="button" className="inline-loop-toggle" aria-pressed={playing} onClick={()=>{
   const video=videoRef.current;
   if(!video)return;
   if(video.paused){
    setPausedByUser(false);
    video.play().then(()=>setPlaying(true)).catch(()=>{});
   }else{
    setPausedByUser(true);
    video.pause();
    setPlaying(false);
   }
  }}>{playing?'PAUSE -':'PLAY +'}</button>
 </figure>;
}
