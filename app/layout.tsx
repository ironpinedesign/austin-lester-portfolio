import type { Metadata } from 'next';
import Link from './components/SiteLink';
import SiteNavigation from './components/SiteNavigation';
import './globals.css';
import {getContent} from '../lib/content';
import {InlineCopy} from './components/Copy';
export const metadata: Metadata = {metadataBase:new URL('https://austinlesterstudio.com'),title: {default:'Austin Lester — Creative Direction',template:'%s — Austin Lester'},description:'Selected work across strategy, creative direction, design, and technology. A portfolio by Austin Lester.',openGraph:{title:'Austin Lester — Creative Direction',description:'From the problem to the executed outcome.',type:'website'},twitter:{card:'summary_large_image',title:'Austin Lester — Creative Direction',description:'From the problem to the executed outcome.'}};
export default async function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
 const {text}=await getContent();
 const navigationLinks=[
  {href:text('global.navigation.index.destination'),label:text('global.navigation.index.label')},
  {href:text('global.navigation.about.destination'),label:text('global.navigation.about.label')},
  {href:text('global.navigation.contact.destination'),label:text('global.navigation.contact.label')}
 ];
 const footerDestination=text('global.footer.destination');
 const footerStudioLabel=text('global.footer.studio.label');
 const footerStudioDestination=text('global.footer.studio.destination');
 const hasStudioDestination=!!footerStudioDestination&&footerStudioDestination.startsWith('/');

 return <html lang="en"><body><a href="#main" className="skip-link">Skip to content</a><header className="site-nav"><div className="wrap nav-inner"><Link className="wordmark" href="/">{text("global.navigation.name")}</Link><SiteNavigation links={navigationLinks}/></div></header><main id="main">{children}</main><footer className="site-footer"><div className="wrap"><div className="footer-top"><div><p className="eyebrow">{text("global.footer.eyebrow")}</p><Link href={footerDestination} className="footer-title">{text("global.footer.headline")} <span aria-hidden="true">↗</span></Link></div><div className="footer-utility"><p><InlineCopy text={text("global.footer.body")}/></p>{footerStudioLabel&&hasStudioDestination&&<Link className="footer-studio-link" href={footerStudioDestination}>{footerStudioLabel}</Link>}{footerStudioLabel&&!hasStudioDestination&&<span className="footer-studio-label">{footerStudioLabel}</span>}</div></div><div className="footer-bottom"><span>{text("global.footer.copyright")}</span></div></div></footer></body></html>;
}
