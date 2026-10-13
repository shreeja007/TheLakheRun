# T024 — Phase 3 environment concepts

**Implementation state:** COMPLETE

**Director review state:** PENDING

**Date:** 2026-10-12

**Ticket:** `tasks/T024_PHASE3_ENVIRONMENT_CONCEPTS.md`

## Summary

Delivered four original concept sheets: a two-story brick/timber residence, a shuttered everyday shopfront, a plain courtyard gateway and a six-bulb hanging-light set. The owner explicitly authorized this phase. These are visual proposals pending acceptance, not final architecture or culturally authenticated reconstructions.

Each building and gateway has front/side/back/perspective reference views. The light sheet supplies a complete unlit assembly, enlarged bulb/socket, mount sample and the same six-bulb assembly with warm glow. A portable packet includes four exact prompts, source notes, provenance, image/hash evidence and modeling guidance.

No Blender models, GLBs, rigs, textures, collision/placement, street assembly, runtime lights, shaders, crowd behavior or game code was implemented. Earlier character/model/concept packets, the friend's animation work, the decision log and the owner's untracked original PNG remain unchanged. No upload, message to the friend, paid service or deployment occurred.

## Changed files / assets

| Path | Why changed |
|---|---|
| `tasks/T024_PHASE3_ENVIRONMENT_CONCEPTS.md` | Direct authorization, bounded scope and review checks |
| `tasks/00_TASK_INDEX.md` | T024 delivery/review row only; incidental index update |
| `art-source/festival_phase3_v01/building_01_residence_concept_v01.png` | Residence concept with four views |
| `art-source/festival_phase3_v01/building_02_shopfront_concept_v01.png` | Closed shop concept with four views |
| `art-source/festival_phase3_v01/everyday_gateway_concept_v01.png` | Two-pier/plain-lintel gateway concept with four views |
| `art-source/festival_phase3_v01/hanging_lights_concept_v01.png` | Six-bulb assembly and detail/appearance sheet |
| `art-source/festival_phase3_v01/*_prompt.txt` | Four exact prompts used by built-in imagegen |
| `art-source/festival_phase3_v01/references/cart_style_reference.png` | Unchanged copy of T023 cart, used only for rendering style |
| `art-source/festival_phase3_v01/HANDOFF.md` | Modeler's guide, source roles, unresolved details and manual review steps |
| `art-source/festival_phase3_v01/REFERENCE_NOTES.md` | Linked architectural research and distinction between source cues and original proposals |
| `art-source/festival_phase3_v01/provenance.json` | Tool/source/output roles and hashes, rights and preservation record |
| `art-source/festival_phase3_v01/verify_and_package.ps1` | Local T024 adaptation of T023 packet checker; previous script unchanged |
| `art-source/festival_phase3_v01/image_verification.json`, `manifest.json`, `package_verification.json` | Actual PNG dimensions, bytes, hashes and ZIP integrity evidence |
| `art-source/festival_phase3_v01/festival_phase3_handoff_v01.zip` | Portable 15-member art/reference/prompt handoff |
| `reports/T024_RESULT.md` | Mandatory completion report |

## Verification commands and results

- Built-in `image_gen.imagegen`: four separate asset calls, opaque backgrounds, one local style input per call. All completed; no correction calls or CLI fallback. Every exact prompt is saved in the packet.
- Inspected the local cart style reference and each generated output. Residence: three front upper windows, central door/two lower windows, planned side/back counts. Shop: broad closed shutter group/two paired upper windows, two side windows and back service door. Gateway: clear rectangular opening, two piers/one plain lintel; profile correctly occludes the far pier. Lights: exactly six bulbs in both complete assembly panels. All main objects are completely framed.
- `pwsh -NoProfile -File art-source/festival_phase3_v01/verify_and_package.ps1` — PASS: five PNGs decoded with System.Drawing, provenance input/output hashes valid, all **15 ZIP entry sizes and SHA-256 hashes** match local payload files. Packet size **8,185,578 bytes**; ZIP SHA-256 `61bff31713c2f1908437a53bbfbc8e2ab42a8d5f2654c5759b810d0b4e238aac`.
- Actual image sizes: Building 01 **2054 × 766**; Building 02, gateway, hanging lights and style reference each **1672 × 941**. Images were copied unchanged from built-in generated files. No claim of 4K or equal image framing.
- `Get-FileHash -LiteralPath 'art-source/tuku_concept_art_turnaround.png' -Algorithm SHA256` — `3CB9852F33A00BC1651253B6D7CAAB68CC59A8CA18E4E6E9DFFE0AD8A9D9AB3F`, matching T017/T023's preservation record. Remains untracked and outside this ticket.
- `git diff --check` and `git diff --cached --check` — PASS, no whitespace errors.
- `git diff --cached --name-only` / `git status --short` — changes limited to new T024 packet, task, report and one task-index row; no existing runtime/character/model/decision files changed.

No runtime build or gameplay tests were run: no runtime code changed. File-integrity checks do not establish visual acceptance, mesh tiling, geometry performance or deterministic image regeneration.

## Browser and device tests

- Tested: Windows local PNG decoding and visual inspection of tool-rendered image outputs.
- Not tested: browser gameplay, physical Android/iOS devices, real camera framing, mobile silhouette readability, GLB import, Meshy conversion or performance. No 3D model or runtime lighting is supplied by this ticket.

## Evidence

- Four selected concept sheets in `art-source/festival_phase3_v01/`; the style-reference copy is clearly separated in `references/`.
- `image_verification.json`, `manifest.json` and `package_verification.json` record dimensions/hash/ZIP evidence.
- `REFERENCE_NOTES.md` cites [UNESCO World Heritage Centre — Kathmandu Valley](https://whc.unesco.org/en/list/121/), inspected on 2026-10-12. Its broad brick/stone/timber craftsmanship context informs the material direction; heritage monument descriptions do not certify these domestic/gateway designs. No source image or media was copied into generation or the game.
- `HANDOFF.md` contains component counts, modeler reconciliation points and manual review steps.

## Assumptions, defects and blockers

- No technical blocker to delivery. Director acceptance remains pending.
- Generated views are approximate drawings, not calibrated renders of a common mesh. Brick/tile counts, roof/eave proportions, joinery depths and sill placement need reconciliation in one editable mesh source.
- The bulb-string mount illustrates the cable passing through an eyelet rather than a clearly closed end loop. Endpoint retention/loop geometry remains a model-detail proposal; this is neither real electrical/structural installation guidance nor a tested light fixture.
- No approved world scale, lane clearance, facade module dimensions, joining/tiling behavior, collision, material count, UV/texture atlas, lighting implementation or geometry/device budget is claimed. The packet proposes reusable parts; it does not supply a working modular street.
- Raster images are flattened; editable prompts are nondeterministic sources, not layered artwork or Blender generators. Separately framed Meshy inputs and any upload are future work.
- Fictional simple lattice/joinery and ordinary roof/gateway silhouettes are original proposals, not traditional motifs or authentic heritage reproductions. The style input inherits earlier T023/T017 provenance; upstream rights are not independently certified.

## Director approvals requested

- Accept or revise the two building silhouettes/palettes, plain gateway and bulb-string appearance before static modeling.
- Confirm any shared world dimensions and architectural/cultural claims in a later approved ticket. No approval was inserted into `docs/10_DECISIONS.md`.

## Suggested next ticket

After visual acceptance, authorize one static Blender blockout of Building 01 with reusable wall/window/roof parts, editable `.blend`/generator, `.glb`, neutral mesh previews, counts and import verification. Companion building, gateway and light models follow separately. No next ticket started.
