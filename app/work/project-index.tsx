'use client';
import {useState,useEffect} from 'react';
import Link from '../components/SiteLink';
import type {Project} from '../../lib/projects';
import type {MediaMap} from '../../lib/storage';
import Media from '../components/Media';
export default function ProjectIndex({projects,categories,initialIntent,map,copy}:{projects:Project[];categories:string[];initialIntent:string;map:MediaMap;copy:Record<string,string>}){
 const [intent,setIntent]=useState(initialIntent);
 useEffect(()=>{setIntent(initialIntent)},[initialIntent]);
 useEffect(()=>{const update=()=>{const v=new URLSearchParams(location.search).get('intent');setIntent(v&&categories.includes(v)?v:'All')};window.addEventListener('popstate',update);return()=>window.removeEventListener('popstate',update)},[categories]);
 const rows=projects.filter(p=>intent==='All'||p.strategic_intent===intent).sort((a,b)=>a.index_order-b.index_order);
 function select(v:string){setIntent(v);const u=new URL(window.location.href);if(v==='All')u.searchParams.delete('intent');else u.searchParams.set('intent',v);window.history.pushState(null,'',u.pathname+u.search)}
 return <><section className="wrap page-opening"><p className="eyebrow">{copy["opening.eyebrow"]}</p><h1>{copy["opening.heading"]}</h1><div className="opening-bottom"><p>{copy["opening.body"]}</p><span className="eyebrow" aria-live="polite">{String(rows.length).padStart(2,'0')} {copy['opening.count_label']}</span></div></section><section className="filter-bar"><div className="wrap filter-inner" aria-label="Filter projects by intent">{['All',...categories].map(cat=><button key={cat} aria-pressed={intent===cat} onClick={()=>select(cat)}>{intent===cat&&<span className="active-dot"/>}{cat==='All'?copy['filters.all_label']:cat}</button>)}</div></section><section className="wrap index-list" aria-label="Project results">{rows.map(p=><Link href={`/work/${p.slug}`} key={p.slug} className="index-row"><span className="eyebrow index-number">{p.project_number}</span><div className="index-description"><h2>{p.title}</h2><p>{p.thesis}</p><div className="eyebrow">{p.strategic_intent}<span>{p.role.slice(0,2).join(' / ')}</span></div></div><span className="index-client">{p.client}</span><span className="eyebrow index-year">{p.year}</span><Media slot={`work.index.${p.content_id}.image`} map={map} label={`${p.project_number} / Preview`} className="index-thumbnail"/><span className="index-arrow" aria-hidden="true">↗</span></Link>)}{!rows.length&&<p className="empty-state">{copy["index.empty_message"]}</p>}</section></>;
}
