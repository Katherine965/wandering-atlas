import {readFile,mkdir,cp,lstat,stat} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {build} from 'vite';
import {copyReleaseLicenses,checkReleaseLicenses} from './release-licenses.ts';
import react from '@vitejs/plugin-react';
import {LocalStore,LocalError} from './local-store.ts';
const root=fileURLToPath(new URL('../',import.meta.url));const store=new LocalStore(join(root,'.local/archive'));const a=await store.read();const names=new Set(a.places.flatMap(e=>[...e.photos,...(e.coverImage?[e.coverImage]:[])].map(p=>p.src)).filter(s=>s.startsWith('/uploads/travel/')));
console.log(`Public-export preview: ${a.places.length} entries, ${names.size} uploaded images. Output: .local/public-export (private until you deliberately share it).`);
if(!process.argv.includes('--confirm-public')){console.log('Review your entries, descriptions, coordinates and photos in Local Edit Mode. Only after consenting to share ALL of them, rerun: npm run export:public -- --confirm-public');process.exit(0);}
const output=join(root,'.local/public-export');for(const p of [join(root,'.local'),output]){try{if((await lstat(p)).isSymbolicLink())throw new LocalError('Export symlink refused');}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;}}
try{await stat(output);throw new LocalError('Previous export exists. Review/back up and move it aside before exporting again; no automatic overwrite.');}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;}
await build({configFile:false,root,publicDir:false,plugins:[{name:'explicit-public-snapshot',load(id){if(resolve(id.split('?')[0])===join(root,'data/sample-travel.json'))return 'export default '+JSON.stringify({description:'Explicitly owner-approved public archive snapshot',places:a.places})+';';}},react()],define:{__ATLAS_LOCAL__:'false'},resolve:{alias:{'@':root}},build:{outDir:output,emptyOutDir:false,sourcemap:false}});
for(const p of ['data','travel','images/sample'])await cp(join(root,'public',p),join(output,p),{recursive:true});
await mkdir(join(output,'uploads/travel'),{recursive:true});for(const src of names){const name=src.slice('/uploads/travel/'.length);await store.image(name);await cp(join(store.images,name),join(output,'uploads/travel',name),{dereference:false});}
await copyReleaseLicenses(output);const releaseGates=await checkReleaseLicenses(output);if(releaseGates.length)console.log(releaseGates.join('\n'));
console.log('Explicit read-only export created locally. No remote, push, publication or deployment performed. Rights and privacy review remain your responsibility.');
void readFile;
