import { getChatGPTUser } from '../app/chatgpt-auth';
import { db } from './storage';
export async function studioIdentity(){const user=await getChatGPTUser();if(!user)return {user:null,isOwner:false,claimed:false};const d=await db();const owner=await d.prepare('SELECT user_id FROM studio_owner WHERE id=1').first<{user_id:string}>();return {user,isOwner:owner?.user_id===user.userId,claimed:!!owner};}
export async function requireStudioApi(){const identity=await studioIdentity();if(!identity.user)throw new Response('Sign in required',{status:401});if(!identity.isOwner)throw new Response('Studio owner access required',{status:403});return identity.user;}
export function sameOrigin(request:Request){const origin=request.headers.get('origin');if(!origin||origin!==new URL(request.url).origin)throw new Response('Invalid request origin',{status:403});}
export function apiError(e:unknown){if(e instanceof Response)return e;console.error('Studio request failed',e instanceof Error?e.message:'unknown');return Response.json({error:'This change could not be saved. Please try again.'},{status:500});}
export async function safeEqual(a:string,b:string){if(!a||!b)return false;const enc=new TextEncoder();const [ha,hb]=await Promise.all([crypto.subtle.digest('SHA-256',enc.encode(a)),crypto.subtle.digest('SHA-256',enc.encode(b))]);const aa=new Uint8Array(ha),bb=new Uint8Array(hb);let difference=0;for(let i=0;i<aa.length;i++)difference|=aa[i]^bb[i];return difference===0;}

export {readJsonObject as readObject} from './request-body';
