# T038 — Smaller download and smoother frame rate

**Status:** REVIEW — implementation complete; director/device acceptance pending  
**Authorization:** Direct owner instruction on 2026-11-03, choosing items #1 and #10 from the improvement research: "#1 and #10 first: a smaller download and smoother frame rate help every phone player."  
**Dependencies:** T036/T037 (committed on `fix/t036-tuku-movement`, pending acceptance). Branch `feat/t038-size-and-framerate`.

## Problem

- The offline snapshot every player downloads was 11.4 MB. It included a backup Lakhey model the game only uses if the main one fails (2.2 MB) and PNG textures that compress far better as lossless WebP.
- Phones were spending 200–250 draw calls per frame, above PlayCanvas's 100–200 low-end guidance.
- The whole road batch was rebuilt almost every time a 30 m road tile recycled (~50 times in 1,500 m), costing ~15–20 ms per rebuild on a desktop CPU. These rebuilds caused regular dropped frames.

## Scope

- Stop precaching the backup Lakhey model. Make the character models and tiling textures smaller **without changing a single pixel** (lossless WebP), keeping the masters in `art-source/`.
- Remove the mid-run road batch rebuilds.
- Cut draw calls for coins, Tuku, Lakhey, the background chariots and Pulu Kisi using the engine's batching and instancing.
- Compile shaders on the home screen instead of during the first run.

## Exclusions

No art, gameplay, difficulty, camera, UI or audio changes. No resolution scaling, texture resizing, lossy compression, Basis/KTX2, or portal/relative-path work (#13). No deployment.

## Acceptance criteria

- The offline snapshot is substantially smaller, and runtime images match the masters exactly.
- Draw calls go down at every sampled distance.
- No batch rebuilds during a run or a retry.
- No frame over 16.7 ms in the scripted run on this PC.
- Before/after screenshots look identical apart from random particles.
- Existing movement, UI/PWA and polish suites still pass.
