# T008 — First small Kathmandu street module kit

**Status:** ACCEPTED — 2026-11-02, Game Director playtest on Windows desktop (Chrome/Edge) and Android phone (Chrome); see D-016. Cultural/rights review not covered.  
**Milestone:** M4  
**Dependencies / approval:** T003 accepted; director authorizes original architectural art brief  
**Read:** `AGENTS.md`, `docs/00_PROJECT_STATUS.md`, `docs/10_DECISIONS.md`, `docs/06_WORLD_AND_ASSET_PIPELINE.md`, `docs/12_RESEARCH_SOURCES.md`

## Objective

Replace generic road surroundings with a small set of reusable, fictional Kathmandu-inspired 3D assets without changing gameplay.

## In scope

- Produce one tileable road section, two brick facade variants, wood-window-inspired trim, simple stall/barrier, and non-sacred festival bunting.
- Build Blender source, GLBs, previews and an asset manifest with provenance/license; reuse materials and dimensions.
- Use fake/distant background detail to evoke city density without complex geometry.
- Verify tiled road, obstacle readability and player contrast in actual running camera.

## Out of scope

- No exact reconstruction of temple/procession route, crowds with AI, destructible sacred buildings, huge open-world streets.
- No copyrighted photos as texture without permission.

## Acceptance criteria

- [ ] Road and building pieces repeat with no obvious seams or large gaps.
- [ ] There is always a clear lane/hazard view; decoration never alters fairness.
- [ ] Assets load in target browsers; export/source/provenance files are present.
- [ ] Buildings feel distinctively Kathmandu-inspired without being claimed as an authentic reconstruction.

## Verification Codex must report

- Provide tile demonstration screenshots and GLB sizes/counts.
- Report draw calls/texture usage where measurable and source rights for every external dependency.

## Deliverables

- Editable Blender files/scripts, GLBs, preview renders, asset manifest, demo scene integration.

- A completion report at `reports/T008_RESULT.md` using `reports/REPORT_TEMPLATE.md`.

## Stop and ask

Request review if an architectural detail or symbol might be culturally sacred or if an asset license is unclear.

> **Boundary:** Only do this ticket after Game Director authorization. Never start the next ticket automatically.
