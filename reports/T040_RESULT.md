# T040 — Audit, optimize and integrate the unused street art

**Implementation state:** COMPLETE  
**Director review state:** PENDING  
**Date:** 2026-11-07  
**Ticket:** `tasks/T040_STREET_ART_AUDIT_AND_INTEGRATION.md`

## Summary

The first 150 m of each 420 m cycle, the Durbar street, now has real buildings, a side-alley gateway, strings of lights, market carts and spectators. The art adds 0.42 MB to the download and stays within the performance budgets on this PC.

### Audit findings and fixes

| Finding | Fix |
|---|---|
| Same brick and roof textures embedded in all three models (367 KB per building) | Removed; models use the game's existing textures, so they also match the street's colour |
| Window bars are six-sided boxes, including faces against the wall; timber was two-thirds of Building 01 | Faces the camera can never see are removed |
| 81 % of the gateway's triangles were tiny bolts, invisible at game scale | Removed |
| Everything double-sided | Turned off |
| 37 separate parts per building | Merged to one part per material, in one shared kit file |
| Geometry health, scale, ground position | No problems found |

| Model | Triangles before → after | Parts before → after |
|---|---|---|
| Building 01 | 4,588 → 2,349 | 37 → 5 |
| Building 02 | 3,748 → 1,881 | 36 → 5 |
| Gateway | 436 → 66 | 8 → 3 |
| Market cart (new) | 804 | 1 |
| Spectators, near (new) | 780–804 each | 1 each |
| Spectators, far (new) | 336–356 each | 1 each |

The kit is one 415 KB file. The three original building and gateway files alone came to 1.33 MB. Masters are unchanged in `art-source/`; the unused copies were removed from `public/models/`.

### Problems caught by looking at the result

- **Black models:** the props' colour palette came out black. Fixed.
- **White buildings and people:** batches built before their textures loaded stayed untextured. The art now waits for its textures.
- **Light halos** looked like grey octagons overhead and crowded the sky. Removed; one string per road section, raised well above the camera.
- **Stretched alley wall and pale alley floor.** Fixed.
- **Terrace crowd** cost 23k triangles all the time. It now uses low-detail figures.

### What's in the game

- **Left side:** Building 01 and 02 replace the box facades on the five recycling Durbar tiles. Street lamps and the Falcha pavilions stay.
- **Gateway:** a side-alley entrance, because its 4.1 m opening can't span the 6.8 m road. The milestone arches are unchanged.
- **Lights:** a six-bulb string on slim poles every 30 m.
- **Right plaza:** a market cart on alternate tiles and three spectators per tile, who rise on their toes now and then. They stand still when the device asks for reduced motion.
- **Procession terrace:** far-detail spectators replace the box-and-ball figures. Drummers keep their drums.

**Reliability:**
- Nothing here is switched on or off during a run.
- The swap happens once, outside a run. If the kit arrives during a run, it waits for the results screen.
- If it fails to load, the old street stays.

**Not changed:** gameplay, collisions, scoring, difficulty, the river and hill sections, the home-screen view, and the two tiles behind the start line.

## Changed files / assets

| Path | Why changed |
|---|---|
| `scripts/build-street-kit.py` (new) | Repeatable optimizer: masters → `street_kit.glb` plus palette, with a before/after report |
| `art-source/street_props_v01/` (new) | Cart and spectators: generator, `.blend`, GLBs, previews, palette, handoff, provenance |
| `public/models/street_kit.glb`, `public/models/textures/tex_street_palette.webp` (new) | Game-ready art |
| `public/models/building01_residence.glb`, `building02_shopfront.glb`, `everyday_gateway.glb` (removed) | Replaced by the kit; identical masters remain in `art-source/` |
| `src/world/StreetArt.ts` (new) | Loads, places and animates the art; fallback and late-arrival handling |
| `src/world/RoadView.ts`, `src/game/GameManager.ts` | Create the art and attach it outside a run |
| `scripts/pwa-build.mjs` | Kit added to the offline download |
| `scripts/test-street-art.mjs` (new), `package.json` (`test:street`) | Automated checks |
| `tasks/T040_*.md`, `tasks/00_TASK_INDEX.md`, `docs/00_PROJECT_STATUS.md`, `reports/T040_RESULT.md`, `reports/evidence/T040/` | Tracking and evidence |

## Verification commands and results

- `npx tsc --noEmit -p .`: PASS. `npm run build`: PASS; offline snapshot **33 files, 7,331,467 bytes**, version `7a3c484ad9d8517e` (T039 in the same comparison: 31 files, 6,908,025 bytes).
- `npm run test:street`: **PASS**:
  - five tiles dressed; no art at body height over the road; intro tile unchanged; lamps kept
  - 0 rebuilds over a 900 m run, a real catch and a retry
  - kit blocked → old facades stay and the run continues
  - kit arriving mid-run → not attached until the run ended
  - reduced motion → spectators don't move
  - no page errors
- `npm run test:ui`: **18 checks passed**, including offline play. `npm run test:settings`, `npm run test:movement`: PASS. `node scripts/test-polish.mjs`: all 5 viewports passed; T034 evidence restored.

**T038 frame probe, same scripted 1,500 m run on this PC's Intel GPU:**

| | T039 | With street art |
|---|---|---|
| Draw calls at 20 / 300 / 700 / 1,500 m | 112 / 109 / 118 / 102 | 121 / 119 / 131 / 103 |
| Triangles (thousands) at the same points | 186 / 194 / 196 / 188 | 227 / 235 / 227 / 183 |
| Road/art rebuilds during a run | 0 | 0 |
| Median frame across runs | 3.6–3.8 ms (3 runs) | 2.8–6.8 ms, mostly about 4 ms (8 runs) |

**Slow frames, reported as found:**
- With street art, 6 of 8 runs had no frame over 16.7 ms (worst 7–12.8 ms in the last five).
- One run had a single 630 ms frame, and one had five frames of 17–20 ms around 607–682 m.
- One of the 3 T039 runs had a single 18.4 ms frame.
- Neither street-art outlier repeated, neither involved a rebuild, and neither is near a loading event. Other programs were running on this PC (including Honeygain and PHP servers), so they are probably interference, but that is not proven.

## Browser and device tests

- Tested: Windows, headless Chrome 156 (SwiftShader for suites, Intel GPU for timings and screenshots).
- **Not tested:** a real phone or iPhone. The art adds about 40k triangles on screen; only a phone test can confirm that feels the same.

## Evidence

In `reports/evidence/T040/`:
- `street-close-ups.png`: gateway, buildings, cart, crowd, lights, milestone arch, biome edge, catch camera.
- `run-8m.png`, `run-62m.png`, `run-110m.png`: normal phone-size view.
- `props-preview.png`: cart and spectators.
- `street-kit-report.json`, `street-art-verification.json`, `perf/`, `ui/`, `settings/`, `movement/`, `polish/`.

## Assumptions and limits

Choices I made that you may want to review:
- **Glowing windows:** building windows glow warm amber to match the dusk street. The concept sheets show unlit windows.
- **Spectator poses:** a wave, hands on hips, and clapping; the sheets only show neutral standing poses. Their small rise is also my addition.
- **Terrace figures:** the old figures were named "devotees" in the code; everyday spectators now stand in their place during the procession. The cultural reviewer should see this.
- **Models are approximations** of the concept sheets, not exact copies.

Other limits:
- Street art appears only in the Durbar section, by design.
- A player who starts very quickly on a slow connection sees the old street until their next run.
- Cultural and rights review are still outstanding.

## Director approvals requested

1. Play the first 150 m on your phone, and again after 420 m when the Durbar street returns: smooth? Does it look right?
2. Are the glowing windows and the spectators' poses what you want?
3. Accept the buildings and gateway (T025–T027) and the cart and spectator designs (T023)?

## Suggested next ticket

Real-phone check of T036–T040 together. Then either the cleanup of test pages and the old kit from the public build, or missions and the daily run. Not started.
