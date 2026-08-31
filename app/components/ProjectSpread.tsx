import Link from 'next/link';
import type { Project } from '../../lib/projects';
import type { MediaMap } from '../../lib/storage';
import Media from './Media';
export default function ProjectSpread({project:p,index,map,viewLabel,roleLabel}:{project:Project;index:number;map:MediaMap;viewLabel:string;roleLabel:string}){
 const variant=["full","type","diptych","quote"].indexOf(p.home_layout);const num=String(index+1).padStart(2,'0');
 const top=<div className="spread-rail"><span>({num}) / {p.strategic_intent}</span><span>{p.client} — {p.year}</span></div>;
 const bottom=<div className="spread-bottom"><span>{p.client}</span><span>{p.year}</span><span>{p.role.slice(0,2).join(' / ')}</span><span className="view-label">{viewLabel}</span></div>;
 if(variant===0)return <Link href={`/work/${p.slug}`} className="spread full-spread"><Media map={map} slot={`home.selected_work.${p.content_id}.image`} label={`${num} / ${p.title}`} className="wide"/><div className="project-caption"><div><p className="eyebrow">{p.strategic_intent}</p><h2>{p.title}</h2></div><p>{p.thesis}</p></div>{bottom}</Link>;
 if(variant===2){return <Link href={`/work/${p.slug}`} className="spread diptych-spread">{top}<div className="diptych-images"><Media map={map} slot={`home.selected_work.${p.content_id}.image`} label={`${num} / Main image`} className="portrait"/><Media map={map} slot={`home.selected_work.${p.content_id}.supporting_image`} label={`${num} / Supporting image`} className="landscape"/></div><div className="project-caption"><div><h2>{p.title}</h2><p className="spread-description">{p.thesis}</p></div><div className="role-description"><p className="eyebrow">{roleLabel}</p><p>{p.role.join(', ')}</p><span className="text-link">{viewLabel}</span></div></div></Link>}
 return <Link href={`/work/${p.slug}`} className={`spread dark-spread ${variant===3?'quote-spread':'type-spread'}`}>{top}<div className="dark-spread-grid"><div>{variant===3?<><p className="spread-quote">{p.thesis}</p><h2>{p.title}</h2></>:<h2 className="display-title">{p.title}</h2>}</div><Media map={map} slot={`home.selected_work.${p.content_id}.image`} label={`${num} / ${p.title}`} className="portrait"/></div>{variant===1?<div className="dark-spread-summary"><p>{p.thesis}</p><span className="text-link">{viewLabel}</span></div>:bottom}</Link>;
}
