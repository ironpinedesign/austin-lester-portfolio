import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import {getContent} from '../lib/content';
import {InlineCopy} from './components/Copy';
export const metadata: Metadata = {title: {default:'Austin Lester — Creative Direction',template:'%s — Austin Lester'},description:'Selected work across strategy, creative direction, design, and technology. A portfolio by Austin Lester.',openGraph:{title:'Austin Lester — Creative Direction',description:'From the problem to the executed outcome.',type:'website'},twitter:{card:'summary',title:'Austin Lester — Creative Direction',description:'From the problem to the executed outcome.'}};
export default async function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
 const {text}=await getContent();
 return <html lang="en"><body><a href="#main" className="skip-link">Skip to content</a><header className="site-nav"><div className="wrap nav-inner"><Link className="wordmark" href="/">{text("global.navigation.name")}</Link><nav aria-label="Main navigation"><Link href={text("global.navigation.index.destination")}>{text("global.navigation.index.label")}</Link><Link href={text("global.navigation.about.destination")}>{text("global.navigation.about.label")}</Link><Link href={text("global.navigation.contact.destination")}>{text("global.navigation.contact.label")}</Link></nav></div></header><main id="main">{children}</main><footer className="site-footer"><div className="wrap"><div className="footer-top"><div><p className="eyebrow">{text("global.footer.eyebrow")}</p><Link href={text("global.footer.destination")} className="footer-title">{text("global.footer.headline")} <span>↗</span></Link></div><p><InlineCopy text={text("global.footer.body")}/></p></div><div className="footer-bottom"><span>{text("global.footer.copyright")}</span><Link href="/studio">{text("global.footer.studio.label")}</Link></div></div></footer></body></html>;
}
