import type { MediaMap } from '../../lib/storage';
export default function Media({slot,map,label,className='',controls=false,kind='image / video'}:{slot:string;map:MediaMap;label:string;className?:string;controls?:boolean;kind?:string}){
 const m=map[slot];
 return <div className={`media-frame ${className}`}>
 {m?(m.mime.startsWith('video/')?<video src={`/api/media/${m.id}`} aria-label={m.alt||label} controls={controls} muted={!controls} playsInline preload="metadata"/>:<img src={`/api/media/${m.id}`} alt={m.alt||label} loading="lazy"/>):<div className="media-placeholder"><span className="media-symbol" aria-hidden="true">{kind==='video'?'▷':'＋'}</span><span>{label}</span><span className="placeholder-kind">{kind} placeholder</span></div>}
 </div>;
}
