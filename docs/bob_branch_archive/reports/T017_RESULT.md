# T017 — Detailed Tuku concept and modeling-reference images

**Implementation state:** COMPLETE (concept deliverable)

**Director review state:** PENDING

**Date:** 2026-10-11

**Ticket:** `tasks/T017_TUKU_CONCEPT_REFINEMENT.md`

**Branch:** `ticket/t017-tuku-concept-refinement`

## Summary

Read the project status/decisions, T006, live Tuku/cultural briefs and linked historical turnaround specification. Refined the user-named JPG with the built-in image tool. Delivered a versioned four-view concept sheet and a separate, larger full-body front image for a possible Meshy single-image attempt.

Retained the recognizable original young-adult appearance, teal cropped jacket with down hood from the input, cream longline shirt, charcoal trousers/sneakers, maroon neck wrap and compact satchel. Added clearer cotton/twill material definition, stitching, yoke/pocket/zipper/hem construction, natural cloth folds, shoe panels/laces/sole edges and face/hair definition. These refinements remain proposed art, not final costume approval.

Corrected two important ambiguities in the input: both profiles originally faced the same way, and the front strap conflicted with the back/right-rear bag placement. The selected sheet now has opposing profiles and a strap from wearer's left shoulder to right-rear hip. Left-side bag visibility is reduced; right-side bag is shown. A separate front avoids turnaround labels/duplicate figures in the primary image input.

**Unchanged:** original JPG, user-added untracked PNG, existing SVG concept sources, all game code/models/rigs/animations, project decisions and prior reports. No Meshy upload, paid generation, mesh/Blender/GLB creation, animation retargeting or deployment.

## Changed files / assets

| Path | Why changed |
|---|---|
| `art-source/tuku_refinement_v03/tuku_turnaround_detailed_v03.png` | Proposed refined FRONT / LEFT SIDE / BACK / RIGHT SIDE sheet. |
| `art-source/tuku_refinement_v03/tuku_front_meshy_v03.png` | Clean single-character front with more vertical pixels per figure; no labels. |
| `art-source/tuku_refinement_v03/01_turnaround_prompt.txt` | Exact initial built-in generation/edit prompt. |
| `art-source/tuku_refinement_v03/02_turnaround_consistency_edit.txt` | Exact targeted consistency correction prompt. |
| `art-source/tuku_refinement_v03/03_single_front_prompt.txt` | Exact standalone front prompt, based on corrected sheet. |
| `art-source/tuku_refinement_v03/provenance.json` | Inputs, hashes, tool mode, generation lineage, limitations and approval status. |
| `art-source/tuku_refinement_v03/image_verification.json` | Measured file dimensions, bytes and hashes. |
| `art-source/tuku_refinement_v03/MESHY_HANDOFF.txt` | Input selection, anatomical checks and source-linked Meshy guidance. |
| `tasks/T017_TUKU_CONCEPT_REFINEMENT.md` | Bounded scope reflecting direct user authorization. |
| `tasks/00_TASK_INDEX.md` | Ticket review entry only; no old decisions/status rewritten. |
| `reports/T017_RESULT.md` | Mandatory report. |

## Verification commands and results

- `git switch -c ticket/t017-tuku-concept-refinement` — isolated new art ticket branch from prior T016 work. Initial worktree contained only the user's untracked `art-source/tuku_concept_art_turnaround.png`; it was preserved and excluded from this ticket's commit.
- `Get-Content` for `README.md`, `docs/00_PROJECT_STATUS.md`, `docs/10_DECISIONS.md`, `tasks/T006_TUKU_VISUAL_TURNAROUND.md`, `docs/04_CHARACTER_TUKU.md`, `docs/03_STORY_AND_CULTURE.md`, linked `archive/TUKU_TURNAROUND_SPEC_V02.md`, T006 report and report template — read; archive used only for detail, not current approval authority.
- Built-in `image_gen.imagegen`: three referenced-image calls with `transparent_background: false`; exact prompts saved. First result retained duplicated profile/front strap defects, so it was rejected as final and corrected with a targeted edit. The two selected images were inspected with `view_image` and copied from the generated-images directory using `Copy-Item -LiteralPath`; source/generated originals were not overwritten or deleted.
- `Add-Type -AssemblyName System.Drawing` and `System.Drawing.Image.FromFile(...).Width/.Height` — images decode successfully; actual sizes below. Images disposed after reading. `Get-Item` measured bytes; `Get-FileHash -Algorithm SHA256` measured checksums, saved in `image_verification.json`.
- `git diff --check` / `git diff --cached --check` — whitespace check completed before commit.
- No game build/playtests were run: this ticket changes art-reference/documentation files only, with no runtime consumers modified. No claim of Meshy modeling, rigging or mobile-performance verification.

## Browser and device tests

- Tested: local PNG decoding and visual inspection of the original, initial refinement, corrected sheet and standalone front on the Windows host through the image-viewing tool.
- Not tested: actual Meshy conversion, Blender geometry, skeleton/weight painting, run/slide/tease animation, rendered phone-scale silhouette, physical phones or game runtime integration. No browser needed for the concept deliverable.
- Meshy usage guidance was checked against its official help pages; no account was accessed and no image was uploaded.

## Evidence

| Deliverable | Actual size | Bytes | SHA-256 |
|---|---|---|---|
| [Refined turnaround](../art-source/tuku_refinement_v03/tuku_turnaround_detailed_v03.png) | 1672 × 941 | 1,826,977 | `3B175A1C91A19C9907C599B9044C8C01B6293178D2FCB1BF38EB187F3A040C10` |
| [Standalone front](../art-source/tuku_refinement_v03/tuku_front_meshy_v03.png) | 1024 × 1536 | 1,847,959 | `10250801B516FAEEF832F39E1D104188F242D9F23A5A07F6BC759F3A916510B8` |

Source JPG SHA-256: `8C05B5366BD9BF2A19AD61C63B9765D33846D2C703E81DD89F0AA7EDEA48324C`. Preserved user PNG SHA-256: `3CB9852F33A00BC1651253B6D7CAAB68CC59A8CA18E4E6E9DFFE0AD8A9D9AB3F`.

Visual consistency pass:

- Four labeled views: front, opposite-facing profiles, back; full feet/hair within the sheet.
- Major front/back strap direction and right-rear bag placement match the live brief; left-side bag mostly occluded and right-side bag visible.
- Teal/cream/charcoal/maroon hierarchy retained; layered shirt visible under jacket in all views.
- Hood remains down as in the supplied concept. No new ceremonial headwear, weapons, props or sacred imagery was requested/introduced.
- Single front is centered, crown-to-soles, arms separated from torso, clean background and no labels; detailed face/fabric/shoe construction is easier to inspect at this size.

## Assumptions, defects and blockers

- This is generated **concept art**, not a set of exact orthographic renders from one mesh. Overall view directions/accessory placement were checked visually; subtle sleeve seams, hood folds, scarf tucks, pockets, face proportions and finger separations still need human reconciliation. The independently generated single front can differ slightly from the sheet. Do not describe it as a validated four-image Multi-View set.
- Prompts requested larger canvases, but the built-in tool produced the measured sizes above. No pixel upscaling or 4K claim was made. The standalone front provides substantially more vertical pixels per character than the sheet.
- Face/gender presentation, exact colors and construction remain provisional. Kept the appearance supplied by the user without declaring a new gender choice. Color hex values are design intent; generated pixels are not color-calibrated.
- The down hood is retained from the existing JPG; live text specifies a cropped jacket but does not explicitly approve a hood as final. Sleeve patches and faint generic weave/geometry details also need costume review. No detail is represented as an authentic Newar motif. Cultural validation was not performed.
- Editable prompts/provenance are supplied; no layered PSD, newly editable SVG or Blender scene exists for this AI raster refinement. The older technical SVG remains unchanged and can still guide construction.
- For a paid generation attempt, approve/reconcile the concept first. Meshy's official [Multi-View guidance](https://help.meshy.ai/en/articles/12634481-how-to-use-multi-view) says to crop orthographic sheets into separate centered angle images with consistent size/style/background. Its [pose controls](https://help.meshy.ai/en/articles/10255659-how-to-generate-3d-models-with-a-pose-t-pose-or-custom-poses) offer A/T-pose options where available. Plan/tool availability can vary; no Meshy success is guaranteed by a detailed image.
- A future replacement mesh may need retargeting to your friend's animation rig. That integration is outside this art ticket; current animation files were preserved.
- Existing project documentation is stale relative to the implementation reports. It was not changed to imply final character, engine or cultural acceptance.

## Director approvals requested

Review the face/proportions, hood/pocket/seam details, scarf construction and corrected bag/strap anatomy. Approve or request targeted edits before treating v03 as the modeler's definitive reference or generating/replacing a production model. Final name/costume/cultural claims remain unresolved under the existing docs.

## Suggested next ticket

After art acceptance, a separately authorized model/rig handoff: compare a Meshy draft or supplied model in Blender, correct topology/hands/accessory separation and match your friend's skeleton/rest pose/scale before any animation retargeting. **Not started.**
