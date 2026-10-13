// Apply the bounded historical UI patch, keeping friend's extra tease markup.
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
const target=fileURLToPath(new URL('../../..',import.meta.url));
const source=resolve(target,'../lakhey-run-planning_antigravity');
let patch=execFileSync('git',['show','8fdb27f','--format=','--','index.html','src/main.ts','src/game/GameManager.ts','src/input/InputManager.ts'],{cwd:source,encoding:'utf8'});
const hint='         <span class="hint-pill">😜 [T / E: Tease]</span>\n';
const anchor='+        <span class="hint-pill"><span class="keyboard-hint">→ [D / Right]</span><span class="touch-hint">→ Swipe right</span></span>\n';
assert.ok(patch.includes(anchor));
patch=patch.replace(anchor,anchor+hint);
const action='       <div class="action-row">\n';
assert.ok(patch.includes(action));
patch=patch.replace(action,action+'         <button id="btn-tease" class="sub-btn tease-btn" type="button">😜 Tease (T)</button>\n');
execFileSync('git',['apply','--recount','--check','-'],{cwd:target,input:patch,stdio:['pipe','inherit','inherit']});
execFileSync('git',['apply','--recount','-'],{cwd:target,input:patch,stdio:['pipe','inherit','inherit']});
console.log('Bounded port applied after preflight; tease hint/button preserved.');
