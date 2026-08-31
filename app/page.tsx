import Link from 'next/link';
import { featured,categories } from '../lib/projects';
import { mediaMap } from '../lib/storage';
import Media from './components/Media';
import ProjectSpread from './components/ProjectSpread';
export const dynamic='force-dynamic';
export default async function Home(){const map=await mediaMap();const primary=featured[0],secondary=featured[2];return <>
 <section className="wrap hero"><div className="eyebrow-rail"><span>— Portfolio / Creative Direction</span><span>2026 — Selected Work 01–{String(featured.length).padStart(2,'0')}</span></div><div className="hero-grid"><h1>I identify problems, <em>develop ideas</em>, and turn strategy into tangible outcomes.</h1><div className="hero-art"><Link href={`/work/${primary.slug}`} aria-label={`View ${primary.title}`}><Media map={map} slot={`${primary.slug}:cover`} label="01 / Featured project"/><div className="hero-caption">{primary.title}<span>{primary.year}</span></div></Link><Link href={`/work/${secondary.slug}`} className="hero-fragment"><Media map={map} slot={`${secondary.slug}:thumbnail`} label="03 / Detail"/><small>(03) {secondary.title}</small></Link></div></div><div className="hero-rail"><p>Austin Lester — multidisciplinary creative leader across strategy, creative direction, design, and technology.</p><a href="#selected-work">Selected work ↓</a></div></section>
 <section className="wrap selected" id="selected-work"><div className="section-heading"><div><p className="eyebrow">— Selected Work</p><h2>Case studies, in sequence</h2></div><Link href="/work" className="text-link">Full index ↗</Link></div>{featured.map((p,i)=><ProjectSpread key={p.slug} project={p} index={i} map={map}/>)}</section>
 <section className="intent-section dark"><div className="wrap"><p className="eyebrow">— Browse by intent</p><div className="intent-grid">{categories.map((cat,i)=><Link href={`/work?intent=${encodeURIComponent(cat)}`} key={cat}><span className="intent-num">{String(i+1).padStart(2,'0')}</span><span>{cat}</span><span className="intent-arrow">↗</span></Link>)}</div></div></section>
 <section className="wrap approach"><p className="eyebrow">— Approach</p><div><h2>Working across strategy, creative direction, design, and technology — from the problem to the executed outcome.</h2><Link className="text-link" href="/about">More about Austin ↗</Link></div></section>
 </>}
