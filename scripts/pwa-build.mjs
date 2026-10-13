import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { createHash } from 'node:crypto';

/** Snapshot the built game and its existing runtime models/textures, never development files. */
export function gamePwaPlugin() {
  let output;
  let builtChunks;
  return {
    name: 'lakhey-run-offline-snapshot',
    apply: 'build',
    configResolved(config) { output = resolve(config.root, config.build.outDir); },
    generateBundle(_options, bundle) { builtChunks = bundle; },
    closeBundle() {
      const files = ['index.html', 'manifest.webmanifest',
        'models/tuku_blockout_v02.glb', 'models/lakhey_blockout_v02.glb', 'models/lakhey_blockout_v01.glb',
        'models/pulu_kisi.glb', 'models/kumari_rath.glb', 'models/bhairab_rath.glb', 'models/ganesh_rath.glb'];
      function addDirectory(directory) {
        for (const entry of readdirSync(resolve(output, directory), { withFileTypes: true })) {
          const name = `${directory}/${entry.name}`;
          if (entry.isDirectory()) addDirectory(name);
          else if (/\.(png|svg|jpg|jpeg|webp)$/.test(name)) files.push(name);
        }
      }
      // Follow only the game entry's dependencies; do not download inspector bundles.
      const html = readFileSync(resolve(output, 'index.html'), 'utf8');
      const gameAssets = new Set([...html.matchAll(/(?:src|href)="\/(assets\/[^"]+)"/g)].map(match => match[1]));
      function addImports(file) {
        const chunk = builtChunks[file];
        if (chunk?.type !== 'chunk') return;
        for (const imported of [...chunk.imports, ...chunk.dynamicImports]) {
          if (gameAssets.has(imported)) continue;
          gameAssets.add(imported); addImports(imported);
        }
      }
      for (const file of [...gameAssets]) addImports(file);
      files.push(...gameAssets);
      for (const directory of ['icons', 'models/textures']) addDirectory(directory);
      files.sort();
      const hash = createHash('sha256');
      hash.update(readFileSync(new URL('./sw-template.js', import.meta.url)));
      let bytes = 0;
      for (const file of files) {
        const data = readFileSync(resolve(output, file));
        hash.update(file).update(data); bytes += data.length;
      }
      const version = hash.digest('hex').slice(0, 16);
      const urls = files.map(file => `/${relative(output, resolve(output, file)).replaceAll('\\', '/')}`);
      const source = readFileSync(new URL('./sw-template.js', import.meta.url), 'utf8')
        .replace('__CACHE_NAME__', JSON.stringify(`lakhey-run-game-${version}`))
        .replace('__PRECACHE_URLS__', JSON.stringify(urls));
      writeFileSync(resolve(output, 'sw.js'), source);
      writeFileSync(resolve(output, 'offline-build.json'), JSON.stringify({ version, files: urls, bytes }, null, 2));
      console.log(`Offline game snapshot: ${files.length} files, ${bytes} bytes, version ${version}`);
    },
  };
}
