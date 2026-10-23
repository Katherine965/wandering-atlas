import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {randomBytes} from 'node:crypto';
import {readFile,lstat} from 'node:fs/promises';
import {createServer} from 'vite';
import react from '@vitejs/plugin-react';
import {LocalStore} from './local-store.ts';
import {localHandler} from './local-http.ts';
import {enforceReadOnly} from './read-only.ts';
const root=fileURLToPath(new URL('../',import.meta.url));
// A dedicated local-only entry point: not imported by production Vite config or static server.
const args=process.argv.slice(2);const portArg=args.find(a=>a.startsWith('--port='));const port=portArg?Number(portArg.slice(7)):5175;
if(!Number.isInteger(port)||port<1024||port>65535)throw new Error('Invalid local port');
let directory=join(root,'.local/archive');
if(args.includes('--test-storage')){const p=process.env.ATLAS_TEST_STORAGE;if(!p||!p.startsWith('/private/tmp/wa-local-test-'))throw new Error('Test storage must be an isolated temporary test directory');directory=p;}
for(const p of [join(root,'.local')]){try{if((await lstat(p)).isSymbolicLink())throw new Error('Symlink local storage refused');}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;}}
const store=new LocalStore(directory);await store.init(JSON.parse(await readFile(join(root,'data/sample-travel.json'),'utf8')));
const origin=`http://127.0.0.1:${port}`;const token=randomBytes(32).toString('hex');
const server=await createServer({configFile:false,root,plugins:[{name:'local-file-boundary',configureServer(s){s.middlewares.use(localHandler(store,origin,token));s.middlewares.use((req,res,next)=>{if(req.headers.host!==new URL(origin).host){res.writeHead(403);res.end();return;}if(req.url?.startsWith('/@fs/')||req.url?.includes('/.local/')||req.url?.includes('/.git/')){res.writeHead(404);res.end();return;}if(!enforceReadOnly(req,res))next();});}},react()],define:{__ATLAS_LOCAL__:'true'},resolve:{alias:{'@':root}},server:{host:'127.0.0.1',port,strictPort:true,fs:{deny:['**/.local/**','**/.git/**','**/.env*','**/.dev.vars*','**/scripts/**'],strict:true}},build:{sourcemap:false}});
await server.listen();console.log(`Local Edit Mode ready: ${origin} (local files only)`);
