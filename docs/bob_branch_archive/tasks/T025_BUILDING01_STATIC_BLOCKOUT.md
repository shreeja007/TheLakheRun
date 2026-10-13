# T025 — Building 01 editable static Blender model and GLB

**Authorization:** Owner stated “visual acceptance: Building 01’s editable Blender model and GLB.” on 2026-10-12. Treat this as acceptance of Building 01's T024 residence concept for a static model, and authorization of this bounded handoff. It does not approve the other T024 concepts or cultural authenticity claims.
**Implementation state:** COMPLETE; resulting model pending director acceptance.

## Scope and references

Create one editable static residence from `../art-source/festival_phase3_v01/building_01_residence_concept_v01.png`, following its front/side/back opening counts and simple brick/timber/stone/tile silhouette.

Read:
- `../docs/06_WORLD_AND_ASSET_PIPELINE.md`
- `../docs/03_STORY_AND_CULTURE.md`
- `../art-source/festival_phase3_v01/HANDOFF.md`
- `../art-source/festival_phase3_v01/REFERENCE_NOTES.md`

## Deliverables / verification

- Reproducible Blender generator and editable `.blend`; static `.glb` without camera/light export.
- Named reusable wall, window, timber-band, plinth, door and roof groups/components; preserve editability without producing an entire street kit.
- Consistent unit convention, ground-centered root and documented facing; dimensions are a model working scale, not approved street/lane dimensions.
- Actual front, both sides, back and perspective renders of the same mesh, not generated art.
- Source/export metrics, finite geometry, material/texture/node counts; validate opening counts, bounds and GLB round-trip import. Verify a local PlayCanvas import if available; honestly document browser/device coverage.
- Provenance, modeler README, packaged `.blend`/`.glb`/scripts/previews and verified ZIP/hash manifest.
- Mandatory `../reports/T025_RESULT.md` following the report template.

## Exclusions

No Building 02, gateway, hanging lights, character changes, interior, opening-door behavior, rigs, collision, runtime scene assembly/placement, deployment or uploads. Preserve existing assets and friend work. Do not record owner approval in `docs/10_DECISIONS.md`. No claim that this procedural residence is culturally authentic or structurally engineered.
