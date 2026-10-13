# T007 — implementation result

**Implementation state:** COMPLETE  
**Director review state:** PENDING  
**Date:** 2026-10-10  
**Ticket:** `tasks/T007_TUKU_BLENDER_BLOCKOUT.md`

## Summary

Implemented the neutral A-pose 3D static blockout of hero runner **Tuku** (specification v0.2), fulfilling all requirements of Milestone M4:
1. **Geometric Blockout & Scale:** Built to the approved 1.68m height reference (1.704m bounding height including hair tuft, 0.924m arm span, 0.349m depth) with the origin grounded precisely at (0.0, 0.0, 0.0) in standard glTF Y-up coordinates.
2. **Outfit & Color Hierarchy:** Faithfully translated the v0.2 palette into 9 PBR materials:
   - Cropped canvas jacket: Dusty Teal `#2F7875` (open front, torso Y=0.96m to 1.42m).
   - Longline inner shirt: Warm Cream `#E8DDCA` (visibly peeking 10cm below jacket hem to Y=0.86m).
   - Tapered running trousers: Charcoal `#2D3438` (pelvis to ankles).
   - Compact neck wrap: Muted Maroon `#8C414B` (torus wrap around collar, zero flapping cloth).
   - Crossbody satchel: Charcoal `#25292B` anchored on **wearer's right-rear hip** with diagonal strap extending from wearer's left shoulder across chest and back. Positioned to clear resting and swinging arm volume.
   - Low sneakers: Dark upper `#25292B` with Warm Cream sole `#D7CDBE` and tiny Marigold heel tab `#DEA94B`.
   - Skin & hair: Warm tone `#C89568`, dark hair `#25292B` with rear asymmetric sweep.
3. **Polycount & Optimization:** Total **1,892 triangles** and 1,014 vertices across 35 clean modular parts—exceptionally lean for 60 FPS mobile WebGL performance.
4. **Reproducible Tooling & Generators:**
   - `art-source/generate_tuku_blockout.py`: Standalone procedural generator using Python/Trimesh.
   - `art-source/tuku_blender_gen.py`: Native Blender Python script (`bpy`) to recreate the mesh, vertex groups, and materials directly in Blender.
   - Standard binary glTF (`art-source/tuku_blockout_v02.glb` & `public/models/tuku_blockout_v02.glb`, 41.9 KB).
5. **Interactive Viewer & Live Game Integration:**
   - Dedicated 3D multi-angle inspection viewer (`viewer_tuku.html`) with studio 3-point lighting.
   - Integrated directly into the live PlayCanvas endless runner in `src/runner/PlayerController.ts`, replacing the graybox capsule while preserving fallback safety.
   - Validated that the third-person gameplay camera clearly frames the primary rear silhouette (teal jacket mass + cream under-hem + charcoal slim legs) at mobile viewport heights.

What remains intentionally unbuilt:
- Skeletal bone armature, skinning weights, and run/jump animations (deferred to ticket T011).
- High-poly face sculpts, eye tracking, or cloth simulation (prohibited by design budget).

## Changed files / assets

| Path | Why changed |
|---|---|
| `art-source/tuku_blockout_v02.glb` | Master exported binary glTF 3D model (41.9 KB, 1,892 tris) |
| `public/models/tuku_blockout_v02.glb` | Web-served runtime model in public assets |
| `art-source/generate_tuku_blockout.py` | Reproducible procedural Python generator script |
| `art-source/tuku_blender_gen.py` | Native Blender Python script (`bpy`) for `.blend` authoring |
| `viewer_tuku.html` | Interactive 3D inspection viewer with 3-point lighting and angle presets |
| `src/runner/PlayerController.ts` | Integrated GLB model loading, grounding at Y=0, and hiding placeholder primitives |
| `vite.config.ts` | Multi-page build configuration ensuring `viewer_tuku.html` is bundled |
| `art-source/tuku_blockout_3d_perspective.png` | Neutral 3D perspective hero capture |
| `art-source/tuku_blockout_3d_back.png` | Neutral 3D rear orthographic capture (primary gameplay view) |
| `art-source/tuku_blockout_3d_front.png` | Neutral 3D front orthographic capture |
| `art-source/tuku_blockout_3d_side.png` | Neutral 3D side profile capture demonstrating satchel clearance |
| `art-source/tuku_ingame_mobile_portrait.png` | In-game third-person camera capture in mobile portrait (502×751) |
| `art-source/tuku_ingame_running_state.png` | In-game active running capture showing 3D runner on Kathmandu street |
| `scratch/render_3d_inspection.cjs` | Playwright automated inspection capture script |
| `reports/T007_RESULT.md` | Completion report for Game Director review |

## Verification commands and results

- **Model Dimensions & Metrics:**
  - Geometry: 35 parts, 1,892 triangles, 1,014 vertices.
  - Dimensions: Width 0.924m × Height 1.704m × Depth 0.349m.
  - Origin: Grounded at `[0.0, 0.0, 0.0]`.
  - Binary File Size: 41,960 bytes (41.0 KB gzipped / raw).
- **Vite & TypeScript Build:**
  - `npm run build` completed cleanly in 2.26s.
  - Both `index.html` and `viewer_tuku.html` bundled into `dist/`.
- **Runtime WebGL Rendering:**
  - Loaded `http://localhost:4173/viewer_tuku.html` via Playwright Chromium.
  - Verified `__MODEL_LOADED__ === true`, captured all 4 neutral studio angles.
  - Loaded `http://localhost:4173/` in mobile viewport (502×751), verified runner instantiates on road, responds to Space input, and maintains 60 FPS.

## Browser and device tests

- **Tested:**
  - Desktop Chromium (1280×800): Verified full 3D model in studio viewer and in-game road.
  - Mobile portrait emulation (502×751): Verified rear character silhouette readability at mobile scale (~105px on screen).
- **Not tested:**
  - Standalone Blender GUI viewport (tested programmatically via Trimesh glTF pipeline and headless browser; `.py` script provided for Blender).

## Evidence

- **Hero 3D Perspective View:** `art-source/tuku_blockout_3d_perspective.png`
- **Primary Gameplay Rear View:** `art-source/tuku_blockout_3d_back.png`
- **Front Orthographic View:** `art-source/tuku_blockout_3d_front.png`
- **Side Profile Satchel Clearance:** `art-source/tuku_blockout_3d_side.png`
- **In-Engine Mobile Gameplay:** `art-source/tuku_ingame_mobile_portrait.png`
- **In-Engine Running State:** `art-source/tuku_ingame_running_state.png`

## Assumptions, defects and blockers

- **Assumptions:** Model uses neutral A-pose blockout geometry. Rigging and skinning weights are deferred to T011.
- **Known Limitations:** Static model does not yet animate running strides (arms and legs do not swing yet; runner auto-runs with body lean and camera sway as implemented in T002).
- **Blockers:** None.

## Director approvals requested

1. **3D Blockout Sign-Off:** Confirm that the 3D proportions, outfit layering (cream shirt extending below teal jacket), satchel placement, and 1,892 triangle budget are approved.
2. **Next Milestone Authorization:** Choose the next authorized ticket:
   - **T008 (Kathmandu Environment Asset Kit):** Modular Newar-inspired facades, street tiles, lantern lighting, and fair hazards.
   - **T009 (Lakhey Hero Visual Concept):** Cultural safety review and visual direction for the Lakhey guardian character.

## Suggested next ticket

- **T008 (Kathmandu Environment Asset Kit)** to replace the graybox street and obstacles with modular Newar architecture while awaiting cultural review contacts for T009.
