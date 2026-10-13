# T020 — First static rath handoff

**Authorization:** Direct user acceptance on 2026-10-11 of the proposed next ticket: one static rath blockout with .blend, .glb and previews.

**Read:** README.md, docs/00_PROJECT_STATUS.md, docs/10_DECISIONS.md, this ticket, docs/06_WORLD_AND_ASSET_PIPELINE.md, docs/03_STORY_AND_CULTURE.md, docs/08_TECHNICAL_ARCHITECTURE.md and T019 research/concept handoff.

## Scope

Build the first asset, the Kumari rath draft shell, from T019 as a simplified static Blender blockout. Supply editable Blender source and reproducible script, standalone GLB, neutral front/side/back/perspective previews, measured bounds/mesh/material metrics, provenance and developer handoff notes. Separate wheel pivots, chassis, pavilion, roof and drawbeam. Verify exported GLB hierarchy/geometry and, where available, isolated PlayCanvas loading/rendering.

## Acceptance

- Complete four-wheel carriage with solid timber-disc wheels, red chassis, dark platform, single pavilion canopy and forward timber drawbeam; empty cabin and nonfigural trim.
- Named stable nodes and axle-center wheel pivots suitable for later code rotation; no animation clips required.
- Explicit meter scale, facing direction and ground-level root origin, with tentative dimensions labeled as blockout choices.
- Camera/lights/floor excluded from GLB, no external texture dependency. Source preserved.
- Manual reuse instructions and verification evidence saved. Director acceptance remains pending.

## Excluded

No Pulu Kisi or other rath modeling in this ticket; no gameplay placement, collisions, scoring, rig/choreography, existing character changes, runtime model replacement, upload or deployment. No cultural authenticity claim. T019 ornament/proportions are proposals; sacred occupants and exact ritual symbols are omitted.

**Report:** reports/T020_RESULT.md, using reports/REPORT_TEMPLATE.md. Recommend the next ticket without starting it.
