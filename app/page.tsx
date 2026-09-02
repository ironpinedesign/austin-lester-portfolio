import type { Metadata } from 'next';
import Link from './components/SiteLink';
import {getContent} from '../lib/content';
import {InlineCopy} from './components/Copy';
import { mediaMap } from '../lib/storage';
import Media from './components/Media';
import ProjectSpread from './components/ProjectSpread';
export const dynamic='force-dynamic';
export const metadata: Metadata={alternates:{canonical:'/'},openGraph:{url:'/'}};
export default async function Home(){const {featured,categories,text}=await getContent();const map=await mediaMap();const primary=featured[0],secondary=featured[2];return <>
 <section className="wrap hero"><div className="eyebrow-rail"><span>{text("home.hero.eyebrow")}</span><span>{text("home.hero.year")} — {text("home.hero.sequence_label")} {featured.length?'01–':''}{String(featured.length).padStart(2,'0')}</span></div><div className="hero-grid"><h1><InlineCopy text={text("home.hero.headline")}/></h1><div className="hero-art">{primary&&<Link href={`/work/${primary.slug}`} aria-label={`View ${primary.title}`}><Media map={map} slot="home.hero.image" label="01 / Featured project"/><div className="hero-caption">{primary.title}<span>{primary.year}</span></div></Link>}{secondary&&<Link href={`/work/${secondary.slug}`} className="hero-fragment"><Media map={map} slot="home.hero.detail_image" label="03 / Detail"/><small>(03) {secondary.title}</small></Link>}</div></div><div className="hero-rail"><p>{text("home.hero.intro")}</p><a href={text("home.hero.primary_cta.destination")}>{text("home.hero.primary_cta.label")}</a></div></section>
 <section className="wrap selected" id="selected-work"><div className="section-heading"><div><p className="eyebrow">{text("home.selected_work.eyebrow")}</p><h2>{text("home.selected_work.heading")}</h2></div><Link href={text("home.selected_work.index_cta.destination")} className="text-link">{text("home.selected_work.index_cta.label")}</Link></div>{featured.map((p,i)=><ProjectSpread key={p.slug} project={p} index={i} map={map} viewLabel={text("home.selected_work.view_label")} roleLabel={text("global.project.role_label")}/>)}</section>
 <section className="intent-section dark"><div className="wrap"><p className="eyebrow">{text("home.intent.eyebrow")}</p><div className="intent-grid">{categories.map((cat,i)=><Link href={`/work?intent=${encodeURIComponent(cat)}`} key={cat}><span className="intent-num">{String(i+1).padStart(2,'0')}</span><span>{cat}</span><span className="intent-arrow" aria-hidden="true">↗</span></Link>)}</div></div></section>
 <section className="wrap approach"><p className="eyebrow">{text("home.approach.eyebrow")}</p><div><h2>{text("home.approach.heading")}</h2><Link className="text-link" href={text("home.approach.cta.destination")}>{text("home.approach.cta.label")}</Link></div></section>
 </>}
