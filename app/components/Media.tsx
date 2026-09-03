'use client';
import {useState} from 'react';
import type {MediaMap} from '../../lib/storage';

export default function Media({slot,map,label,className='',controls=false,kind='image / video'}:{slot:string;map:MediaMap;label:string;className?:string;controls?:boolean;kind?:string}){
 const m=map[slot];
 const [failed,setFailed]=useState('');
 const fixtureSrc=m?.id.startsWith('fixture:')?m.id.slice('fixture:'.length):'';
 const available=!!m&&failed!==m.id;
 return <div className={`media-frame ${className}`} data-media-slot={slot}>
 {available?(
	m.mime.startsWith('video/')
	 ?<video src={fixtureSrc||`/api/media/${m.id}`} aria-label={m.alt||label} controls={controls} muted={!controls} playsInline preload="metadata" onError={()=>setFailed(m.id)}/>
	 :<img src={fixtureSrc||`/api/media/${m.id}`} alt={m.alt||label} loading="lazy" onError={()=>setFailed(m.id)}/>
 ):<div className="media-placeholder"><span className="media-symbol" aria-hidden="true">{kind==='video'?'▷':'＋'}</span><span>{label}</span><span className="placeholder-kind">{kind} placeholder</span></div>}
 </div>;
}
