import {readBoundedBody} from './request-body';
export const MAX_BYTES=25*1024*1024;
export const ALLOWED_TYPES=['image/jpeg','image/png','image/webp','image/gif','image/avif','video/mp4','video/webm'];
const mp4Brands=new Set(['isom','iso2','iso3','iso4','iso5','iso6','iso7','iso8','iso9','mp41','mp42','avc1','dash','M4V ','M4VH','M4VP','MSNV','cmfc','cmfs']);
function brands(bytes:Uint8Array){
 if(bytes.length<16||String.fromCharCode(...bytes.slice(4,8))!=='ftyp')return [];
 const size=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength).getUint32(0);
 if(size<16||size%4!==0||size>bytes.length)return [];
 const result=[String.fromCharCode(...bytes.slice(8,12))];
 for(let i=16;i<size;i+=4)result.push(String.fromCharCode(...bytes.slice(i,i+4)));
 return result;
}
export function matchesSignature(bytes:Uint8Array,type:string){const a=(n:number)=>String.fromCharCode(...bytes.slice(0,n));switch(type){
 case'image/jpeg':return bytes.length>=4&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
 case'image/png':return bytes.length>=8&&bytes.slice(0,8).every((v,i)=>v===[137,80,78,71,13,10,26,10][i]);
 case'image/gif':return ['GIF87a','GIF89a'].includes(a(6));
 case'image/webp':return a(4)==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP';
 case'image/avif':return brands(bytes).some(b=>b==='avif'||b==='avis');
 case'video/mp4':{const b=brands(bytes);return !b.some(v=>['avif','avis','heic','heix','hevc','hevx','mif1','msf1'].includes(v))&&b.some(v=>mp4Brands.has(v));}
 case'video/webm':return bytes[0]===26&&bytes[1]===69&&bytes[2]===223&&bytes[3]===163;
 default:return false;
}}
export async function readLimitedBody(request:Request){return readBoundedBody(request,MAX_BYTES,'Files must be 25 MB or smaller')}
