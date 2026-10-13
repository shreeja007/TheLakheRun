import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import assert from 'node:assert/strict';
const root=fileURLToPath(new URL('../../..',import.meta.url));
const baseline=JSON.parse(readFileSync(new URL('../T031/verification.json',import.meta.url),'utf8'));
const allowed=new Set(['index.html','src/main.ts','src/game/GameManager.ts','src/input/InputManager.ts',
  'package.json','vite.config.ts','scripts/pwa-build.mjs','scripts/test-ui-mobile.mjs']);
let preserved=0;
const changed=[];
for(const [p,oldHash] of Object.entries(baseline.protectedHashes)){
  const currentHash=createHash('sha256').update(readFileSync(join(root,p))).digest('hex');
  if(currentHash===oldHash)preserved++;
  else {assert.ok(allowed.has(p),'Unexpected protected-file change: '+p);changed.push(p);}
}
const game=readFileSync(join(root,'src/game/GameManager.ts'),'utf8');
const html=readFileSync(join(root,'index.html'),'utf8');
const input=readFileSync(join(root,'src/input/InputManager.ts'),'utf8');
const main=readFileSync(join(root,'src/main.ts'),'utf8');
assert.ok(game.includes("case 'TEASE':"));assert.ok(game.includes('playDistantProcessionAmbience'));
assert.ok(game.includes('playPuluKisiGallop'));assert.ok(input.includes("case 'KeyT':")&&input.includes("case 'KeyE':"));
assert.ok(html.includes('id="btn-tease"'));assert.ok(main.includes("game.triggerAction('TEASE'"));
const snapshot=JSON.parse(readFileSync(join(root,'dist/offline-build.json'),'utf8'));
const modelUrls=new Set(execFileSync('rg',['-o','--no-filename','/models/[A-Za-z0-9_]+\\.glb','src'],{cwd:root,encoding:'utf8'}).trim().split(/\r?\n/));
for(const url of modelUrls)assert.ok(snapshot.files.includes(url),'Missing active runtime model in offline snapshot '+url);
const result={ticket:'T032',date:'2026-10-13',baselineFiles:Object.keys(baseline.protectedHashes).length,
  preservedFiles:preserved,authorizedChanged:changed,friendTeaseAndFestivalHooksPreserved:true,
  allModelArtRunnerAudioWorldFilesUnchanged:true,activeRuntimeModelUrls:[...modelUrls].sort(),allActiveModelUrlsPrecached:true,
  offlineFiles:snapshot.files.length,offlineBytes:snapshot.bytes,
  limits:['This checks hashes/source wiring/build snapshot, not physical devices or all game behaviors.']};
writeFileSync(new URL('./preservation.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
