# T024 — Phase 3 environment concept packet

Date: 2026-10-12. Concept delivery complete; director acceptance pending.

## Selected concepts

| Asset | Sheet | Proposal |
|---|---|---|
| Building 01 | `building_01_residence_concept_v01.png` | Two-story residence: central door, two lower windows, three upper windows |
| Building 02 | `building_02_shopfront_concept_v01.png` | Two-story closed shop: four timber shutter panels, two paired upper windows |
| Everyday gateway | `everyday_gateway_concept_v01.png` | Two brick piers, single timber lintel, open rectangular passage |
| Hanging lights | `hanging_lights_concept_v01.png` | Six-bulb cable assembly, bulb and mount details, twilight appearance |

The buildings and gateway include front, side, back and perspective views. Buildings share a restrained brick/timber/stone/tile material family; the lights use plain dark mounts and warm glass. The reference packet uses the existing cart only for rendering style. Read `REFERENCE_NOTES.md` for research and source-use limits.

These are original draft images. Names identify asset slots; architecture, dimensions, palettes and street placement are not locked or historically certified. The images are not calibrated projections of one 3D model. Equal image heights or brick sizes do not establish a world-unit scale. The sheets have different layouts: the buildings are four views across, the gateway and light set are a two-by-two layout.

## Guide for your friend

1. Start with an accepted silhouette, plain boxes, a shared floor height and ground origin. Agree on facade width/depth and future street scale in the later model ticket; no meters are assigned here. Side walls/back silhouettes are concept proposals rather than instructions to build interiors.
2. Make brick-wall panels, stone plinth, timber lintel/sill/window module and one roofline family reusable. Keep repeatable wall edges and the roof footprint consistent in the eventual mesh. The raster sheets do not prove that modules tile without cracks; that requires mesh and camera tests.
3. Building 01 front: central double door, two ground windows, three upper windows. Side: one window per floor. Back: two windows per floor, no door. Preserve these planned counts rather than copying small inconsistent brick/roof details.
4. Building 02 front: one closed opening with four shutter panels, two upper paired lattice windows. Side: one window per floor. Back: a central service door and two upper windows. Keep shutters as a single simple group for a static blockout; no opening behavior or interior is supplied.
5. Model simple rectangular lattice openings and plain joinery. Avoid individual sculpted bricks/tiles or deep tiny lattice geometry until performance warrants it. Consider shared material/texture treatment later; no texture atlas, UV layout, triangle or material budget is delivered or locked.
6. Gateway: two square piers, plain lintel, stone footings/caps. Reconcile lintel insertion depth, joint/bolt placement and side-view thickness in one mesh. Keep the opening clear; its actual width, height, lane clearance and camera visibility need a later placement decision/test. It is not a collision or lane-width asset yet.
7. Lights: one cable curve, six repeated bulb/socket instances and two endpoint mounts. Assembly and twilight panels contain the same count; close-ups are scaled independently. The illustration's mount appears to thread the cable through an eyelet rather than clearly forming the requested cable loop. Treat cable-end retention/loop geometry as an unresolved detail for modeling, not certified hardware.
8. For a later efficient game model, test an emissive bulb material and limited baked/cheap glow before proposing a real-time light per bulb. This is implementation guidance only; no runtime lighting strategy, shader or performance budget was approved here.

After accepting a design, a bounded Blender ticket should provide editable `.blend`/generator, `.glb`, actual neutral mesh previews, shared unit/origin/facing conventions, geometry/material metrics, provenance and import verification. Model one coherent object per source before producing turnarounds. If using Meshy, request separately framed approved single-angle inputs; do not upload multi-view sheets blindly. No model service upload or conversion was performed.

## Manual review

- Compare front and perspective window/shutter counts, roof ridge/eave direction and sill placement.
- Check the building silhouette differs enough while keeping shared materials and reusable components.
- Check side/back layouts, gateway clearance and lattice readability; dimensions and gameplay framing remain untested.
- Count six bulbs in both complete light-string panels; inspect socket connection and mount interpretation.
- Accept or request changes to the palettes, architectural simplification, gateway shape and bulb style before model work.

## Files, provenance and checks

Four exact generation prompts are supplied. Generation used the built-in imagegen tool with one call per asset, opaque backgrounds and no correction calls. Inputs/output hashes are in `provenance.json`; measured PNG dimensions/bytes/hashes are in `image_verification.json`. No outside photograph, model, texture, logo or font was imported.

The editable source is prompt text plus this brief. Raster images are flattened and generation is nondeterministic; layered artwork, GLBs, rigs and collision meshes are not supplied.

After extracting on Windows with PowerShell 7, run `pwsh -NoProfile -File ./verify_and_package.ps1` from this folder. It decodes all five PNGs (four selected concepts plus the style reference), checks provenance hashes, generates a manifest, builds `festival_phase3_handoff_v01.zip` and verifies all 15 member sizes and hashes. `package_verification.json` stays beside the ZIP to avoid circular hashing.

Game code, characters, earlier concept/model packets, your friend's animation files and the owner's original untracked PNG were not changed. No gameplay placement, collision, lighting implementation, browser playtest, physical-device test or deployment was added.

Suggested next ticket, only after your visual acceptance: static Blender blockout of Building 01, with reusable wall/window/roof parts and editable `.blend`/`.glb` handoff. Companion building, gateway and lights can follow in individually authorized increments. No next ticket was started.
