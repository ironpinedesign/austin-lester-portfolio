import type {Metadata} from 'next';
import ExpandableNarrative from '../../components/interactions/ExpandableNarrative';
import InfoDisclosure from '../../components/interactions/InfoDisclosure';
import InlineLoop from '../../components/interactions/InlineLoop';
import MediaCarousel from '../../components/interactions/MediaCarousel';
import MediaDetail from '../../components/interactions/MediaDetail';
import MediaInspect from '../../components/interactions/MediaInspect';

export const metadata:Metadata={title:'Interaction Lab',robots:{index:false,follow:false}};

const demoVideo='/fixtures/interaction-loop.mp4';

function DemoAsset({label}:{label:string}){
 return <div className="interaction-demo-asset"><span className="eyebrow">{label}</span></div>;
}

export default function InteractionLab(){
 return <article className="wrap interaction-lab">
  <header className="page-opening">
   <p className="eyebrow">Internal showcase</p>
   <h1>Case Study Interaction Lab</h1>
   <p className="prose">Reusable interaction primitives for QA only. This route is not linked from public navigation and does not alter published case-study content.</p>
  </header>

  <section className="case-section">
   <h2 className="case-section-title">Expandable Narrative</h2>
   <ExpandableNarrative
    summary={<p className="prose">Primary narrative remains visible. Secondary context can be expanded inline when a reader wants more detail.</p>}
    details={<p className="prose">Expanded content stays in-flow, keeps scroll position stable, and avoids pushing readers into modals.</p>}
   />
  </section>

  <section className="case-section">
   <h2 className="case-section-title">Media Detail and Inspect</h2>
   <MediaDetail title="Decision note" body="This framing was selected to prioritize product fit in vehicle context.">
    <MediaInspect
     trigger={<DemoAsset label="Media frame"/>}
     expanded={<DemoAsset label="Expanded inspect view"/>}
     caption="Optional caption text."
     credit="Photo: Internal fixture"
    />
   </MediaDetail>
  </section>

  <section className="case-section">
   <h2 className="case-section-title">Media Carousel</h2>
   <MediaCarousel
    label="Demo carousel"
    items={[
     {id:'one',content:<DemoAsset label="01"/>,caption:'Primary frame.'},
     {id:'two',content:<DemoAsset label="02"/>,caption:'Supporting frame.'},
     {id:'three',content:<DemoAsset label="03"/>,caption:'Detail frame.'}
    ]}
   />
  </section>

  <section className="case-section">
   <h2 className="case-section-title">Inline Loop</h2>
   <InlineLoop src={demoVideo} label="Loop demo" className="media-frame cinematic"/>
  </section>

  <section className="case-section">
   <h2 className="case-section-title">Info Disclosure</h2>
   <InfoDisclosure label="CREDITS" heading="Contributors">
    <p>Creative Direction: Austin Lester. Development support: internal production team.</p>
   </InfoDisclosure>
  </section>
 </article>;
}
