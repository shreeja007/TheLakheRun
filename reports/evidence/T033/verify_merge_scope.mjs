import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('../../..', import.meta.url));
const allowed = new Set(['index.html', 'package.json', 'scripts/pwa-build.mjs',
  'scripts/test-ui-mobile.mjs', 'src/game/GameManager.ts', 'src/input/InputManager.ts',
  'src/main.ts', 'vite.config.ts']);
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
const changed = git('diff', '--name-only', 'backup/pre-t032-merge', '--',
  'src', 'public', 'art-source', 'scripts', 'index.html', 'package.json', 'package-lock.json', 'vite.config.ts')
  .split(/\r?\n/).filter(Boolean);
for (const path of changed) assert.ok(allowed.has(path), 'Unexpected runtime/art/config change: ' + path);

// Compare Git objects, rather than historical raw working-copy bytes: Windows may convert line endings.
const baseline = JSON.parse(readFileSync(new URL('../T031/verification.json', import.meta.url), 'utf8'));
const protectedPaths = Object.keys(baseline.protectedHashes);
const unchanged = protectedPaths.filter(path => !changed.includes(path));
const baselineTree = new Map(git('ls-tree', '-r', 'backup/pre-t032-merge')
  .split(/\r?\n/).map(line => { const [metadata, path] = line.split('\t'); return [path, metadata.split(' ')[2]]; }));
for (const path of unchanged) {
  const current = execFileSync('git', ['hash-object', '--path=' + path, path], { cwd: root, encoding: 'utf8' }).trim();
  assert.equal(current, baselineTree.get(path), 'Protected Git content changed: ' + path);
}
const snapshot = JSON.parse(readFileSync(join(root, 'dist/offline-build.json'), 'utf8'));
const modelUrls = new Set(git('grep', '-h', '-o', '-E', '/models/[A-Za-z0-9_]+\\.glb', '--', 'src').split(/\r?\n/));
for (const url of modelUrls) assert.ok(snapshot.files.includes(url), 'Missing offline model: ' + url);
const result = {
  date: '2026-10-13', backup: git('rev-parse', 'backup/pre-t032-merge'),
  protectedFiles: protectedPaths.length, unchangedProtectedGitFiles: unchanged.length,
  authorizedRuntimeChanges: changed, activeModelUrls: [...modelUrls].sort(),
  offlineFiles: snapshot.files.length, offlineBytes: snapshot.bytes,
  historicalT032VerificationSha256: createHash('sha256').update(readFileSync(new URL('../T032/verification.json', import.meta.url))).digest('hex'),
  limitations: ['Source/asset preservation and cache coverage do not certify all behaviors or physical devices.'],
};
writeFileSync(new URL('./preservation.json', import.meta.url), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
