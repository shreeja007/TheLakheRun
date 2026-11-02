# T008 — implementation result

**Implementation state:** COMPLETE  
**Director review state:** ACCEPTED — 2026-11-02, Game Director playtest on Windows desktop (Chrome/Edge) and Android phone (Chrome); see D-016. Cultural/rights review not covered.  
**Date:** 2026-10-10  
**Ticket:** `tasks/T008_KATHMANDU_ASSET_KIT.md`

## Summary

Created and validated the complete **Kathmandu Street Module Kit (T008)**, replacing generic graybox surroundings with reusable, culturally inspired 3D assets that evoke Kathmandu's festive Yenya/Indra Jatra atmosphere while preserving strictly fair, legible gameplay lanes.

What was built:
1. **Tileable Road Section (`kathmandu_road_tile.glb`):**
   - 30m length × 6.6m width (3 × 2.0m standard runner lanes + 0.3m curbs).
   - Flagstone paving, terracotta brick curbs, and cream dashed lane dividers.
   - Ultra-lean: 204 triangles, 9.3 KB binary GLB.
2. **Modular Facade Variant A (`kathmandu_facade_variant_a.glb`):**
   - 2-story traditional Newar brick residence (4.5m W × 7.9m H × 14.0m D).
   - Warm red clay brickwork (*Dachi appa*), wooden horizontal string courses, projecting clay-tiled roof eave (*Chhajja*), carved roof struts (*Tundan*), two *San Jhyā* carved window lattices with warm candlelit interior glow, and a projecting brass/amber street lantern (*Diyo*).
   - 192 triangles, 9.2 KB binary GLB.
3. **Modular Facade Variant B (`kathmandu_facade_variant_b.glb`):**
   - 3-story merchant residence (4.5m W × 14.5m H × 14.0m D).
   - Darker aged brickwork, ground-floor wooden shopfront shutter (*Kawaa*), multi-tiered *Aki Jhyā* narrow lattice windows, and a cable with colorful festival triangular bunting flags (Yellow, Red, Blue).
   - 312 triangles, 15.2 KB binary GLB.
4. **Obstacle 1 — Wooden Hurdle (`kathmandu_obstacle_hurdle.glb`):**
   - Jumpable low festival street barrier: 0.65m height × 1.7m width × 0.38m depth.
   - A-frame weathered wood legs, red festival warning crossbar, brass rivets.
   - 312 triangles, 8.1 KB binary GLB.
5. **Obstacle 2 — Festival Oil Barrel (`kathmandu_obstacle_barrel.glb`):**
   - Unjumpable side-dodge hazard: 1.25m height × 0.94m width.
   - Dark Sal wood staves, 3 reinforcing brass hoops, brass tap spigot.
   - 332 triangles, 6.6 KB binary GLB.
6. **Tooling & Blender Pipeline:**
   - Standalone generator: `art-source/generate_kathmandu_kit.py`.
   - Native Blender generator: `art-source/kathmandu_kit_blender_gen.py`.
   - Interactive 3D kit inspector: `viewer_kathmandu_kit.html`.
   - Asset manifest & provenance: 100% original procedural geometry; zero external or third-party assets used.

What remains intentionally unbuilt:
- No exact historic temple reconstruction (cultural boundary).
- No crowds with complex AI or destructible heritage geometry.

## Changed files / assets

| Path | Why changed |
|---|---|
| `art-source/kathmandu_road_tile.glb` | 30m repeating 3-lane road module (204 tris, 9.3 KB) |
| `art-source/kathmandu_facade_variant_a.glb` | 2-story Newar brick house with San Jhyā and lantern (192 tris, 9.2 KB) |
| `art-source/kathmandu_facade_variant_b.glb` | 3-story merchant house with shopfront and bunting (312 tris, 15.2 KB) |
| `art-source/kathmandu_obstacle_hurdle.glb` | Jumpable low wooden barrier hurdle (312 tris, 8.1 KB) |
| `art-source/kathmandu_obstacle_barrel.glb` | Unjumpable brass-banded festival barrel hazard (332 tris, 6.6 KB) |
| `public/models/` (all 5 GLBs) | Runtime web assets served for client browsers |
| `art-source/generate_kathmandu_kit.py` | Reproducible procedural Python generator script |
| `art-source/kathmandu_kit_blender_gen.py` | Native Blender Python script (`bpy`) for `.blend` authoring |
| `viewer_kathmandu_kit.html` | Multi-angle interactive 3D kit inspector |
| `vite.config.ts` | Multi-page build configuration including `viewer_kathmandu_kit.html` |
| `art-source/kathmandu_kit_street_view.png` | 3D gameplay street perspective render |
| `art-source/kathmandu_kit_facades_overview.png` | 3D architectural facade overview render |
| `art-source/kathmandu_kit_hazards_close.png` | 3D obstacle closeup inspection render |
| `scratch/render_kathmandu_kit_inspection.cjs` | Automated Playwright inspection script |
| `reports/T008_RESULT.md` | Completion report for Game Director review |

## Verification commands and results

- **Total Kit Triangle & Size Footprint:**
  - 5 GLB models total **1,352 triangles** combined.
  - Total combined asset size is **48.4 KB** (ideal for instant web download).
- **Vite Multi-Page Build:**
  - `npm run build` completed cleanly, bundling `viewer_kathmandu_kit.html`, `viewer_tuku.html`, and `index.html`.
- **Runtime WebGL Rendering:**
  - Loaded `http://localhost:4173/viewer_kathmandu_kit.html` via Playwright Chromium.
  - Verified `__KIT_LOADED__ === true`, captured street view, facade overview, and hazard closeups.
- **Fairness & Readability Check:**
  - Verified that building facades sit outside the 6.0m roadway and do not occlude runner sightlines.
  - Verified that hurdle (0.65m) and barrel (1.25m) are immediately distinguishable in silhouette.

## Browser and device tests

- **Tested:** Desktop Chromium (1280×800) and Mobile Portrait (502×751) at steady 60 FPS.
- **Not tested:** Physical iOS Safari / Android hardware (scheduled for T013).

## Evidence

- **Street View (Gameplay Perspective):** `art-source/kathmandu_kit_street_view.png`
- **Facades Overview (Architectural Detailing):** `art-source/kathmandu_kit_facades_overview.png`
- **Hazards Closeup (Hurdle & Barrel):** `art-source/kathmandu_kit_hazards_close.png`

## Assumptions, defects and blockers

- **Assumptions:** Modular street pieces use straight 30m repeating chunks. Curves/turns are excluded in V1.
- **Known Limitations:** Facades use stylized procedural geometry rather than high-resolution scanned brick textures to respect the lightweight mobile WebGL budget.
- **Blockers:** None.

## Director approvals requested

1. **Kathmandu Environment Kit Sign-Off:** Confirm that the brick facades, carved window silhouettes, festival bunting, and obstacle designs are approved.
2. **Next Ticket Authorization:** Authorize next ticket in queue:
   - **T009 (Lakhey Guardian Visual Concept):** Cultural gate review and visual direction for the guardian character.

## Suggested next ticket

- **T009 (Lakhey Guardian Visual Concept)** to establish the guardian's visual direction following approved cultural consultation guidelines.
