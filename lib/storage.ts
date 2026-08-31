import { env } from 'cloudflare:workers';
import {contentSetupSql,slotMigrationSql} from './content-migration';
import {publicMediaSlots} from './content-registry';
export type MediaRecord={id:string;object_key:string;filename:string;mime:string;bytes:number;alt:string;created_at:string};
// Only public rendering fields may cross the Server/Client Component boundary.
export type BoundMedia=Pick<MediaRecord,'id'|'mime'|'alt'> & {slot:string};
export type MediaMap=Record<string,BoundMedia>;
export type SiteSettings={contact_email:string;location:string;linkedin:string};
let ready:Promise<void>|undefined;
export async function db(){
 if(!env.DB)throw new Error('Media storage is not connected.');
 if(!ready)ready=env.DB.batch([
 env.DB.prepare('CREATE TABLE IF NOT EXISTS studio_owner (id INTEGER PRIMARY KEY, user_id TEXT NOT NULL, created_at TEXT NOT NULL)'),
 env.DB.prepare("CREATE TABLE IF NOT EXISTS media (id TEXT PRIMARY KEY NOT NULL, object_key TEXT NOT NULL UNIQUE, filename TEXT NOT NULL, mime TEXT NOT NULL, bytes INTEGER NOT NULL, alt TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL)"),
 env.DB.prepare('CREATE TABLE IF NOT EXISTS placements (slot TEXT PRIMARY KEY NOT NULL, media_id TEXT NOT NULL REFERENCES media(id), updated_at TEXT NOT NULL)'),
 env.DB.prepare("CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY, contact_email TEXT NOT NULL DEFAULT '', location TEXT NOT NULL DEFAULT '', linkedin TEXT NOT NULL DEFAULT '')")
 ]).then(async()=>{await env.DB.batch([...contentSetupSql,...slotMigrationSql].map(sql=>env.DB.prepare(sql)))}).catch(e=>{ready=undefined;throw e});
 await ready;return env.DB;
}
export async function visibleMediaSlots(){const d=await db();const state=await d.prepare('SELECT values_json FROM content_state WHERE id=1').first<{values_json:string}>();return publicMediaSlots(JSON.parse(state?.values_json||'{}'));}
export async function mediaMap():Promise<MediaMap>{const d=await db();const active=await visibleMediaSlots();const rows=await d.prepare('SELECT m.id,m.mime,m.alt,p.slot FROM placements p JOIN media m ON m.id=p.media_id').all<BoundMedia>();return Object.fromEntries(rows.results.filter(r=>active.has(r.slot)).map(r=>[r.slot,r]));}
export async function siteSettings():Promise<SiteSettings>{const d=await db();const row=await d.prepare('SELECT values_json FROM content_state WHERE id=1').first<{values_json:string}>();const v=JSON.parse(row?.values_json||'{}');return {contact_email:v['contact.direct.email']||'',location:v['contact.direct.location']||'',linkedin:v['contact.direct.linkedin']||''};}
export const bucket=()=>env.FILES;
export const setupCode=()=>env.STUDIO_SETUP_CODE||'';
