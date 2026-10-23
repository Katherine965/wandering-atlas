import type {IncomingMessage,ServerResponse} from 'node:http';
import {timingSafeEqual} from 'node:crypto';
import {zipSync} from 'fflate';
import { LocalStore, LocalError, MAX_IMAGE_BYTES } from './local-store.ts';
async function body(req:IncomingMessage,max:number){const stated=Number(req.headers['content-length']??0);if(stated>max)throw new LocalError('Request too large',413);const parts:Buffer[]=[];let size=0;for await(const part of req){const b=Buffer.from(part);size+=b.length;if(size>max)throw new LocalError('Request too large',413);parts.push(b);}return Buffer.concat(parts);}
export function localHandler(store:LocalStore,origin:string,token:string){return async(req:IncomingMessage,res:ServerResponse,next:()=>void)=>{
 let path:string;try{const u=new URL(req.url??'/',origin);path=decodeURIComponent(u.pathname);if(req.url?.includes('..')||/%2e|%2f|%5c/i.test(req.url??''))throw new LocalError('Unsafe path');}catch{res.writeHead(400);res.end();return;}
 if(!path.startsWith('/local-api/')&&!path.startsWith('/uploads/travel/')){next();return;}
 const json=(status:number,data:unknown)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data));};
 try{if(req.headers.host!==new URL(origin).host)throw new LocalError('Host rejected',403);if(req.headers.origin!==undefined&&req.headers.origin!==origin)throw new LocalError('Origin rejected',403);if(req.headers['sec-fetch-site']&& !['same-origin','none'].includes(String(req.headers['sec-fetch-site'])))throw new LocalError('Cross-site request rejected',403);
 const mutating=!['GET','HEAD'].includes(req.method??'');if(mutating||path==='/local-api/backup'){if(req.headers.origin!==origin)throw new LocalError('Same-origin request required',403);const supplied=Buffer.from(String(req.headers['x-atlas-session']??''));const expected=Buffer.from(token);if(supplied.length!==expected.length||!timingSafeEqual(supplied,expected))throw new LocalError('Local session rejected; refresh this page',403);}
 if(path.startsWith('/uploads/travel/')){if(mutating)throw new LocalError('Method not allowed',405);const b=await store.image(path.slice('/uploads/travel/'.length));res.writeHead(200,{'Content-Type':'image/webp','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:b);return;}
 if(path==='/local-api/archive'&&req.method==='GET'){json(200,{...await store.read(),local:true,token});return;}
 if(path==='/local-api/images'&&req.method==='POST'){const mime=String(req.headers['content-type']??'').split(';')[0];const ext=String(req.headers['x-image-extension']??'');json(201,{image:await store.upload(await body(req,MAX_IMAGE_BYTES),mime,ext)});return;}
 if(path==='/local-api/backup'&&req.method==='POST'){const archive=zipSync(await store.backupFiles(),{level:0});res.writeHead(200,{'Content-Type':'application/zip','Content-Disposition':'attachment; filename="wandering-atlas-private-backup.zip"','Cache-Control':'no-store'});res.end(Buffer.from(archive));return;}
 if(path==='/local-api/cleanup'&&req.method==='POST'){json(200,{removed:await store.cleanup()});return;}
 if(path==='/local-api/entries'&&['POST','PUT','DELETE'].includes(req.method??'')){if(req.headers['content-type']!=='application/json')throw new LocalError('JSON required',415);const payload=JSON.parse((await body(req,512*1024)).toString()) as {entry:unknown;revision:number;id:string};if(!Number.isInteger(payload.revision))throw new LocalError('Archive revision required');json(200,req.method==='DELETE'?await store.delete(payload.id,payload.revision):await store.save(payload.entry,payload.revision,req.method==='POST'));return;}
 throw new LocalError('Local route not found',404);
 }catch(e){json(e instanceof LocalError?e.status:400,{error:e instanceof LocalError?e.message:'Local operation failed. Check storage permissions or restore a metadata backup; no unsafe path was used.'});}
 };}
