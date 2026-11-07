# T040 — Audit, optimize and integrate the unused street art

**Status:** REVIEW — implementation complete; director/device acceptance pending  
**Authorization:** Direct owner instruction on 2026-11-07: "lets implement this unused arts, lets try to efficiently optimize/audit first, fix if necessary for the art works and if its all good then integrate it with game properly".  
**Dependencies:** T039. Branch `feat/t040-street-art`.

## Scope

- Audit the unused art before use, and fix what the audit finds.
- Bring into the Durbar street: Building 01, Building 02, the everyday gateway, hanging lights, the market cart and three spectators (the last four had no 3D model and are built from their concept sheets).

## Exclusions

- Cloth-shell Pulu Kisi: held until cultural review.
- Old Kathmandu kit and `tuku_refined_v03`: not used.
- River and hill sections, gameplay, collisions, scoring, the intro view: unchanged.
- No deployment.

## Acceptance criteria

- No art in the running space below the overhead strings, and nothing collides.
- No batch rebuilds during a run or retry.
- Budgets (proposed in planning): at most about 150 draw calls, 250k triangles and 9 MB offline download.
- No frame over 16.7 ms in the scripted run, allowing for measured interference from other programs on the test PC.
- The game still works if the art fails to load or arrives during a run.
- All existing suites pass.
