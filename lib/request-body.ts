// Bound the stream before buffering or parsing, including chunked requests.
export async function readBoundedBody(request:Request,maxBytes:number,message:string){
 if(!request.body)throw new Response('Request body is required',{status:400});
 const declared=Number(request.headers.get('content-length')||0);
 if(declared>maxBytes)throw new Response(message,{status:413});
 const reader=request.body.getReader();const chunks:Uint8Array[]=[];let length=0;
 try{for(;;){const {done,value}=await reader.read();if(done)break;length+=value.byteLength;if(length>maxBytes){await reader.cancel();throw new Response(message,{status:413})}chunks.push(value)}}finally{reader.releaseLock()}
 if(!length)throw new Response('The request body is empty',{status:400});
 const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length}return bytes;
}
export async function readJsonObject(request:Request,maxBytes=16384):Promise<Record<string,unknown>>{
 if(request.headers.get('content-type')?.split(';')[0].trim().toLowerCase()!=='application/json')throw new Response('Use application/json',{status:415});
 const bytes=await readBoundedBody(request,maxBytes,'Request is too large.');
 let value:unknown;try{value=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes))}catch{throw new Response('Invalid JSON request',{status:400})}
 if(!value||typeof value!=='object'||Array.isArray(value))throw new Response('Invalid request',{status:400});
 return value as Record<string,unknown>;
}
