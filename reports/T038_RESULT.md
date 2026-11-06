# T038 — Smaller download and smoother frame rate

**Implementation state:** COMPLETE  
**Director review state:** PENDING  
**Date:** 2026-11-03  
**Ticket:** `tasks/T038_DOWNLOAD_SIZE_AND_FRAME_PACING.md`

## Summary

The game is now 40 % smaller to download and no longer stutters during a run. Nothing looks different.

| Measure | Before | After |
|---|---|---|
| Offline download (everything a player caches) | 11.39 MB, 33 files | **6.90 MB**, 31 files |
| Draw calls at 20 / 300 / 700 / 1,500 m | 244 / 217 / 246 / 202 | **106 / 107 / 120 / 105** |
| Road batch rebuilds in a 1,500 m run | 50 (840 ms in total) | **0** (also 0 across a catch and retry) |
| Frames slower than 16.7 ms (a missed 60 fps frame) | 54 | **0** |
| Frames slower than 33 ms | 8 | 0 |
| Slowest frame | 165 ms | **7.8 ms** |
| 99th percentile / median frame | 7.3 / 1.5 ms | 5.5 / 2.0 ms |

Frame timings are from one scripted 1,500 m run (collisions off) on this PC's Intel GPU. Each frame is timed for game update + render + waiting for the GPU (`gl.finish`). Phones are slower, so their absolute numbers will be higher; the before/after difference is the point.

### What changed

**Download size**
- The backup Lakhey model (`lakhey_blockout_v01.glb`, 2.17 MB) is no longer in the offline download. It is still fetched over the network if the main model ever fails to load.
- The Tuku and Lakhey models now embed their texture atlases as lossless WebP instead of PNG:
  - Lakhey: 2.41 → 1.68 MB.
  - Tuku: 0.65 → 0.51 MB.
- The 15 tiling textures the game loads are now lossless WebP: 1.49 MB → 0.24 MB in total.
- The unused `tex_prayer_flags.png` (202 KB) is no longer shipped.
- **Lossless means every pixel is identical**; the converter decodes each file again and refuses to write if anything differs.
- Masters are unchanged in `art-source/` (`art-source/textures/*.png`, `art-source/tuku_blockout_v02.glb`, `art-source/lakhey_blockout_v02.glb`). The runtime copies are rebuilt with `python scripts/optimize-runtime-assets.py`.

**Stutter fix**
- PlayCanvas rebuilds a whole batch whenever something inside it is switched on or off. A 30 m road tile switched its neighbourhood scenery (Durbar / river / hill) or gateway almost every time it moved ahead. That happened every ~2 s and cost 15–20 ms on this PC, more on a phone.
- The road now has 14 moving tiles (420 m = exactly one Durbar → River → Hill cycle). A tile that moves ahead lands on the same neighbourhood and gateway position, so nothing switches.
- The two tiles behind the start line stay fixed, so the intro camera still sees Durbar behind Tuku.
- The camera only draws 160 m ahead, so the extra tiles are not visible.

**Fewer draw calls (looks identical)**
- **Coins:** were 4 draws each. Now 3 draws for all coins together (hardware instancing).
  - The inner brass disc was removed. It sat entirely inside the rim (0.42 × 0.06 inside 0.44 × 0.08), so it was never visible.
- **Tuku** (29 parts) and **Lakhey** (36 parts) are each drawn as one batch per material. Every limb still animates on its own.
- **Background chariots:** each has its own batch, so it is still skipped when off-screen.
- **Pulu Kisi:** 37 → about 8 draws each.
  - Idle Pulu Kisi are parked 500 m below the road and hidden, instead of switched off, so their batches never rebuild.

**Startup stalls**
- The first time an object is drawn, the browser compiles its shader. In the first run of a session this caused five ~0.1–0.17 s stalls during the intro swoop and the first rows, in both the old and new builds.
- For two frames on the home screen (and after each asset loads), the game now draws everything, including each pooled obstacle and particle parked 500 m below the road, with culling off. All shaders are then ready before Play.
- An early version of this ticket's coin instancing added a 0.21 s stall at the start of the run. That was fixed the same way, and the final measurements include the fix.

**Not changed:** gameplay, difficulty, speeds, hitboxes, art, camera framing, UI, audio, resolution. No lossy compression, no texture resizing, no Basis/KTX2, no relative asset paths, no deployment.

## Changed files / assets

| Path | Why changed |
|---|---|
| `scripts/optimize-runtime-assets.py` (new) | Re-encodes model atlases (EXT_texture_webp) and tiling textures as lossless WebP from `art-source/` masters; verifies pixel identity |
| `public/models/tuku_blockout_v02.glb`, `public/models/lakhey_blockout_v02.glb` | Rebuilt by the script (WebP atlas; geometry and materials unchanged) |
| `public/models/textures/*.webp` (15 new), `public/models/textures/*.png` (16 removed) | Lossless WebP runtime copies; PNG masters remain in `art-source/textures/` |
| `scripts/pwa-build.mjs` | Backup Lakhey model no longer precached |
| `src/world/RoadView.ts`, `ObstacleManager.ts`, `CollectibleManager.ts` | `.png` → `.webp` texture URLs |
| `src/world/RoadView.ts` | 14 recycling tiles + 2 fixed intro tiles; road batch size limit 400 → 1000; chariots get their own batch |
| `src/game/Batching.ts` (new) | Small helpers to put a model into a dynamic batch group |
| `src/runner/PlayerController.ts`, `GuardianController.ts` | Batch Tuku/Lakhey after the model loads; comment fix for the network-only v01 fallback |
| `src/world/CollectibleManager.ts` | Coins drawn with 3 instanced draws; hidden inner disc removed; cached rotator lookups |
| `src/world/ObstacleManager.ts` | One batch per Pulu Kisi; idle ones parked and hidden instead of disabled |
| `src/main.ts` | Home-screen shader warm-up frames |
| `tasks/T038_*.md`, `tasks/00_TASK_INDEX.md`, `reports/T038_RESULT.md`, `reports/evidence/T038/` | Tracking and evidence |

## Verification commands and results

- `python scripts/optimize-runtime-assets.py`: 4,550,411 → 2,439,542 bytes, "all pixel-identical" (`evidence/T038/asset-optimizer-output.txt`).
- `npx tsc --noEmit -p .`: PASS. `npm run build`: PASS; offline snapshot **31 files, 6,898,894 bytes**, version `ccc45316955ff274` (before: 33 files, 11,387,833 bytes).
- `node reports/evidence/T038/perf_probe.mjs` on the old build (exported from `ad4c6ef`, port 4191) and the new build (port 4190): the numbers in the table above (`before/before-perf.json`, `after/after-perf.json`).
- `reports/evidence/T038/spikes_probe.mjs`: shader links and uploads per slow frame in the first 60 m.
  - Old build: 6 slow frames, each linking 1–3 new shader programs, plus 2 road rebuilds (98 buffer uploads, 3.6 MB each).
  - New build: none.
  - Output in `startup-spikes-output.txt`.
- `reports/evidence/T038/retry_probe.mjs`: 520 m run, then a real catch (`GAME_OVER`), then retry. 0 rebuilds during the run, 0 from the retry, no page errors (`retry-output.json`).
- `MOVEMENT_EVIDENCE_DIR=reports/evidence/T038/movement npm run test:movement`: **PASS**. All T036 movement/edge-bump and T037 difficulty/fairness checks pass; 0 unfair rows.
- `UI_TEST_EVIDENCE_DIR=reports/evidence/T038/ui npm run test:ui`: **18 checks passed** (Chrome 156), including offline play from the new snapshot and the service-worker update flow.
- `node scripts/test-polish.mjs`: **all viewport cases passed**. Output copied to `evidence/T038/polish/`; committed T034 evidence restored with `git checkout -- reports/evidence/T034`.

## Browser and device tests

- Tested: Windows, headless Chrome 156 on the PC's Intel GPU (ANGLE/Direct3D 11) for timings and screenshots. SwiftShader was used for the standard suites.
- Not tested: a real phone. Phone frame times, battery and heat are untested.
- WebP needs iOS Safari 14+ or any current Android/desktop browser.

## Evidence

- `compare-300m-…png`, `compare-700m-…png`, `compare-home-scene-…png`: before on the left, after on the right. They match apart from random particles; the home-screen scene behind the start line is unchanged.
- `before/`, `after/`: screenshots at 20/300/700/1,500 m and the per-run JSON.
- `perf_probe.mjs`, `spikes_probe.mjs`, `retry_probe.mjs` with outputs; `movement/`, `ui/`, `polish/`.

## Assumptions, defects and blockers

- **Typical frame slightly heavier on this PC (median 1.5 → 2.0 ms):**
  - The road now always contains 16 tiles of scenery instead of 9: about 190k triangles instead of 158k.
  - Its moving-batch bookkeeping costs about 0.4 ms more per frame on this PC.
  - In exchange, the 54 dropped frames per run are gone. On a weak phone this trade should still be positive, but only a phone test can confirm it.
- **Instanced coins are no longer culled one by one.** Off-screen coins cost nothing visible: a coin is a few hundred triangles.
- **Warm-up mechanics:**
  - Each warm-up frame on the home screen briefly switches pooled obstacles on far below the road. Nothing visible changes, and game logic never runs inside a render.
  - If an asset ever finished loading mid-run (not expected), one extra unculled frame would be drawn.
- **Not addressed:** the 1.84 MB of chariot geometry (uncompressed floats), the 2.09 MB engine script, and relative asset paths for portals (#13).

## Director approvals requested

1. Play a few runs on your Android phone and tell me whether it feels smoother, especially during the first run after opening the game, and whether anything looks different.
2. Confirm that dropping the offline copy of the backup Lakhey model is fine: offline play still uses the main model.

## Suggested next ticket

T039 — settings (separate music/effects volume, reduce shake, vibration toggle), Android vibration, and a best-distance marker, as authorized in the same instruction. Built next on the same branch, kept as a separate commit.
