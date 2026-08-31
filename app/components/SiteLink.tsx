import type {ComponentProps} from 'react';
// Keep the existing server routes and link appearance. Native navigation avoids
// the bundled Vinext Link prefetch/navigation export failure seen in production.
// It also fetches freshly saved CMS content when moving between portfolio pages.
export default function SiteLink(props:ComponentProps<'a'>){return <a {...props}/>}
