import {Fragment} from 'react';
// Limited inline formatting, never HTML: *emphasis*, **strong**, and line breaks.
export function InlineCopy({text}:{text:string}){return <>{text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\n)/g).map((part,i)=>part==='\n'?<br key={i}/>:part.startsWith('**')?<strong key={i}>{part.slice(2,-2)}</strong>:part.startsWith('*')?<em key={i}>{part.slice(1,-1)}</em>:<Fragment key={i}>{part}</Fragment>)}</>}
export function ProseCopy({text}:{text?:string|null}){return <div className="prose">{(text||'').split(/\n\s*\n/).filter(Boolean).map((p,i)=><p key={i}><InlineCopy text={p}/></p>)}</div>}
