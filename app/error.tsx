'use client';
export default function Error({reset}:{reset:()=>void}){return <section className="wrap page-opening"><p className="eyebrow">— A temporary interruption</p><h1>Let’s try<br/><em>that again.</em></h1><p className="empty-state">This page could not load. Your uploaded files have not been changed.</p><button className="button" onClick={reset}>Try again ↗</button></section>}
