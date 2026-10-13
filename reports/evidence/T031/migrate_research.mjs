// Explicit five-file migration; no runtime or art mutations.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const target=fileURLToPath(new URL('../../..',import.meta.url));
const source=resolve(target,'../lakhey-run-planning_antigravity');
const git=args=>execFileSync('git',args,{cwd:target,encoding:'utf8'}).trim();
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const paths=['reports/T028_RESULT.md','reports/evidence/T028/INCOME_AND_GROWTH_PROPOSAL.md',
  'reports/evidence/T028/revenue_scenarios.json','reports/evidence/T028/revenue_scenarios.mjs','reports/evidence/T028/source_register.json'];
const protectedPaths=git(['ls-files','-z']).split('\0').filter(p=>/^(src\/|public\/|art-source\/|scripts\/|exports\/|index\.html$|viewer.*\.html$|package.*\.json$|vite\.config\.ts$|tsconfig.*\.json$)/.test(p));
const protectedBefore=Object.fromEntries(protectedPaths.map(p=>[p,hash(join(target,p))]));
// Preflight every destination before copying any file.
for(const p of paths){assert.ok(existsSync(join(source,p)),p);if(existsSync(join(target,p)))assert.equal(hash(join(target,p)),hash(join(source,p)),'Refuse differing existing file '+p);}
for(const p of paths){mkdirSync(dirname(join(target,p)),{recursive:true});if(!existsSync(join(target,p)))copyFileSync(join(source,p),join(target,p));}
const copies=paths.map(p=>{const a=hash(join(source,p)),b=hash(join(target,p));assert.equal(a,b,p);return {path:p,sha256:b,exact:true};});
execFileSync(process.execPath,['reports/evidence/T028/revenue_scenarios.mjs'],{cwd:target,encoding:'utf8'});
assert.equal(hash(join(target,paths[2])),hash(join(source,paths[2])),'Scenario output differs');
const proposal=readFileSync(join(target,paths[1]),'utf8');
const register=JSON.parse(readFileSync(join(target,paths[4]),'utf8'));
JSON.parse(readFileSync(join(target,paths[2]),'utf8'));
const cited=[...new Set([...proposal.matchAll(/\]\((https:\/\/[^)]+)\)/g)].map(m=>m[1]))].sort();
const entries=Array.isArray(register)?register:register.sources;
const registered=entries.map(e=>e.url).sort();
assert.deepEqual(cited,registered,'Citations/source register mismatch');
const localLinks=[];
for(const p of [paths[0],paths[1]])for(const match of readFileSync(join(target,p),'utf8').matchAll(/\]\(([^)]+)\)/g)){
  if(/^(https?:|#)/.test(match[1]))continue;
  const destination=resolve(dirname(join(target,p)),match[1].split('#')[0]);assert.ok(existsSync(destination),destination);localLinks.push({from:p,to:match[1],exists:true});
}
for(const [p,digest] of Object.entries(protectedBefore))assert.equal(hash(join(target,p)),digest,'Protected runtime/art file changed '+p);
const result={ticket:'T031',date:'2026-10-13',sourceRoot:source,targetRoot:target,copies,
  scenarios:'passed, output byte-identical',citedSources:cited.length,localLinks,
  protectedFiles:protectedPaths.length,protectedHashes:protectedBefore,protectedUnchanged:true,
  limitations:['Preserved research dated 2026-10-12; no fresh web verification or monetization adoption.',
    'No browser/device or gameplay testing in this documentation-only phase.']};
writeFileSync(new URL('./verification.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({copies:copies.length,exact:true,scenarios:'passed',citedSources:cited.length,localLinks:localLinks.length,protectedFiles:protectedPaths.length,protectedUnchanged:true},null,2));
