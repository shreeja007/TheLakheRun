# T007 — Tuku Blender blockout and GLB

**Status:** ACCEPTED — 2026-11-02, Game Director playtest on Windows desktop (Chrome/Edge) and Android phone (Chrome); see D-016. Cultural/rights review not covered.  
**Milestone:** M4  
**Dependencies / approval:** T001 accepted; T006 sheet explicitly approved for 3D blockout  
**Read:** `AGENTS.md`, `docs/00_PROJECT_STATUS.md`, `docs/10_DECISIONS.md`, `docs/04_CHARACTER_TUKU.md`, `docs/06_WORLD_AND_ASSET_PIPELINE.md`

## Objective

Build an editable simple 3D Tuku silhouette that is recognizable from the third-person running camera.

## In scope

- Create neutral A-pose static blockout in Blender to approved proportions and outfit layers.
- Use solid-color materials, accurate bag/strap topology, and simple origin/scale conventions.
- Export `.glb` and include Blender `.blend` plus reproducible generator script if procedural.
- Integrate a minimal rear-camera preview with the existing browser prototype for scale/readability test.

## Out of scope

- No detailed head sculpt, full rig, cloth physics, cutscenes, marketplace or final animation.
- No redesign of approved costume.

## Acceptance criteria

- [ ] Source opens in Blender, GLB imports without errors, and colors/origin/scale match the brief.
- [ ] Front/side/back preview renders match the approved turnaround.
- [ ] Rear camera view at 70–120px character height is identifiable.
- [ ] Bag/strap do not collide with static limbs; dynamic clipping is checked later with animation.

## Verification Codex must report

- Report meshes/triangles/materials, source asset paths and export command.
- Provide browser screenshot at planned desktop and mobile aspect ratios.

## Deliverables

- `.blend`, generation script if used, `.glb`, 3/4 view renders, file-level provenance notes.

- A completion report at `reports/T007_RESULT.md` using `reports/REPORT_TEMPLATE.md`.

## Stop and ask

Report inconsistencies in approved turnaround rather than improvising character design.

> **Boundary:** Only do this ticket after Game Director authorization. Never start the next ticket automatically.
