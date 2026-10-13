# T026 — Building 02 editable shopfront Blender model and GLB

**Authorization:** Owner requested “Build 02’s editable model and GLB, after its visual acceptance.” on 2026-10-12, following the proposed Building 02 ticket. Treat this as visual acceptance of the T024 Building 02 concept for this static handoff and modeling authorization. Acceptance of the resulting model remains pending.
**Implementation state:** COMPLETE; resulting model pending director acceptance.

## Scope

Create one original editable static shopfront from `../art-source/festival_phase3_v01/building_02_shopfront_concept_v01.png`. Preserve two stories, one broad closed ground opening with four shutter panels, two paired upper front windows, one window per floor on each side, and one back service door with two upper windows. Share Building 01's material and coordinate conventions through local generator reuse without altering its packet.

## Read linked domain references

- `../docs/06_WORLD_AND_ASSET_PIPELINE.md`
- `../docs/03_STORY_AND_CULTURE.md`
- `../art-source/festival_phase3_v01/HANDOFF.md`
- `../art-source/festival_phase3_v01/REFERENCE_NOTES.md`

## Deliverables and checks

- Reproducible Blender generator, editable `.blend`, self-contained static `.glb`, original textures/provenance and modeler notes.
- Ground-centered root, documented facing/working dimensions and named editable wall/window/roof/shutter/service-door groups.
- Actual same-mesh front, left, right, back and perspective renders; geometric opening/panel checks and export round-trip validation.
- Isolated PlayCanvas import evidence where available; honestly report physical-device and runtime limits.
- Verified portable ZIP and hash/metric evidence; `../reports/T026_RESULT.md` using the report template.

## Exclusions

No interior, shutter/door opening behavior, rig, collider, gameplay placement, gateway/light model, other building changes, upload or deployment. Preserve previous assets, friend work and the original untracked PNG. Do not change the decision log or claim cultural/historical/engineering authenticity. Dimensions remain adjustable authoring scale, not accepted street scale.
