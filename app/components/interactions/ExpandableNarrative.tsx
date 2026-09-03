'use client';
import {type ReactNode,useId,useState} from 'react';

type Props={
 summary:ReactNode;
 details?:ReactNode;
 readMoreLabel?:string;
 showLessLabel?:string;
 fade?:boolean;
 defaultExpanded?:boolean;
};

export default function ExpandableNarrative({summary,details,readMoreLabel='READ MORE +',showLessLabel='SHOW LESS −',fade=true,defaultExpanded=false}:Props){
 const id=useId();
 const [expanded,setExpanded]=useState(defaultExpanded);

 if(!details)return <>{summary}</>;

 return <div className={`expandable-narrative ${expanded?'is-open':''}`}>
  <div>{summary}</div>
    <div className={`expandable-panel-shell ${fade?'with-fade':''} ${expanded?'is-open':''}`} aria-hidden={!expanded}>
     <div id={id} className="expandable-panel-content">{details}</div>
  </div>
  <button type="button" className="interaction-toggle" aria-expanded={expanded} aria-controls={id} onClick={()=>setExpanded(v=>!v)}>
   {expanded?showLessLabel:readMoreLabel}
  </button>
 </div>;
}
