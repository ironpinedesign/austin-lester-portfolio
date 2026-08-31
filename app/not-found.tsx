import Link from 'next/link';
export default function NotFound(){return <section className="wrap page-opening"><p className="eyebrow">— 404</p><h1>Nothing here.<br/><em>Keep exploring.</em></h1><p className="empty-state">This page may have moved. The project index is a good place to start.</p><Link href="/work" className="button">Back to the index ↗</Link></section>}
