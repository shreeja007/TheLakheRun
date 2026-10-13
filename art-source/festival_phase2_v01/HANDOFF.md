# T023 — Phase 2 spectator and market-cart concepts

Date: 2026-10-12. Implementation complete; director visual acceptance pending.

## Open these first

| Draft asset | Sheet | Direction explored |
|---|---|---|
| Spectator 01 | `spectator_01_turnaround_v01.png` | Young adult, ponytail, ochre jacket, navy trousers |
| Spectator 02 | `spectator_02_turnaround_v01.png` | Middle-aged adult, short hair, rust overshirt, olive trousers |
| Spectator 03 | `spectator_03_turnaround_v01.png` | Older adult, compact bun, plum cardigan, charcoal trousers |
| Market cart | `market_cart_concept_v01.png` | Plain timber produce cart, steel frame, two rubber wheels |

These are original fictional everyday designs in the existing Tuku illustration style. Numbers label asset slots; no final names, traditional costumes, community identity or historical accuracy are asserted. Ages and palettes are proposals. Spectator 03's age is communicated subtly; the director can request stronger aging before modeling.

Each spectator sheet supplies front, wearer's left side (nose points right), back, and wearer's right side (nose points left). The poses are neutral, relaxed A-poses. Hair, garments, hems and shoes appear broadly consistent in the selected images. Front/back hands and all finger shapes still require a modeler's anatomical review; profile arm projection is not a calibrated skeleton pose.

The cart supplies front (opposite handles), side, back (handle end), and perspective. Its original sheet had inconsistent crate orientation. The selected correction makes the front leafy-green crate and rear cucumber crate span the width; the side and perspective show three crates along the length, with tomatoes in the middle. The superseded original in `references/` documents the edit target; do not model from that image.

## Modeling notes for your friend

1. Review these concepts together before making meshes. Match the approved silhouette and main color areas first. Do not infer a world height from equal pixel heights: the sheets are framed independently.
2. Spectators: separate simple body/clothes, coherent hair mass and shoes as useful for your pipeline. Reuse one compatible humanoid topology/skeleton later if approved; no topology, skeleton, rig, motions or animation compatibility is supplied here. Collapse tiny seams and knit detail for background characters rather than modeling every painted line.
3. Cart: author one coherent box/frame, a single axle with exactly two wheels, two rear handles and two rear support feet. Keep crates removable and grouped. Proposed crate order from front to handles: greens, tomatoes, cucumbers. Reconcile axle height, frame joins, crate depth and support-foot clearance in one mesh source; the drawings are not a buildable engineering plan.
4. Keep material count and produce detail modest. No triangle, texture, draw-call or download budget is locked by this concept ticket; measure the later blockout.
5. For Meshy, prepare an approved, separately framed single-angle image in a later ticket; uploading a four-view sheet can create duplicated subjects. No upload or Meshy conversion has been performed.
6. A later static asset ticket should deliver editable `.blend` and generator if procedural, `.glb`, actual mesh renders, counts, provenance and import checks. This ZIP contains raster concepts and prompts only.

## Review checklist

- Look at all four spectator views; check hair, face age, garment lengths, pocket/cuff placement, hands and shoes.
- Compare to Tuku: shared rendering style, different clothing and silhouette. Check the spectator remains legible when viewed small; no measured gameplay/mobile framing test is claimed.
- Check all cart views against the one axle / two wheels / two handles / two feet / three crates proposal.
- Confirm the ordinary clothing, visual mix and cart are suitable for the fictional street before 3D work.

These sheets are AI-generated approximations, not orthographic projections of a shared 3D model. Fine seam/knit, fold, produce and proportion differences need reconciliation by the modeler. No top views or calibrated measurements are supplied.

## Sources and editable inputs

Five exact prompts are supplied (three spectators, original cart, cart correction). Generation used the built-in imagegen tool; no CLI/API key or external photo was used. `references/tuku_style_reference.png` is an unchanged copy of the existing T017 generated sheet, used for style only. Its upstream provenance remains in `../tuku_refinement_v03/provenance.json` in the repository; this packet does not independently certify upstream rights. `provenance.json` records input/output roles and hashes; `image_verification.json` records actual dimensions and file sizes.

Prompt sources are editable text, not layered painting files or deterministic generators. Reusing a prompt may produce a different image. No original research photograph, copyrighted costume pattern, font, logo or downloaded model is included. Do not describe these concepts as authentic traditional clothing.

## Verification and scope

Run `pwsh -NoProfile -File ./verify_and_package.ps1` from any directory after extracting this packet. It decodes all PNGs, checks provenance hashes, writes a content manifest, builds `festival_phase2_handoff_v01.zip` and verifies every ZIP member's byte length and SHA-256 against the source. `package_verification.json` is saved beside the ZIP and excluded from it to avoid circular hashing.

Game code, Tuku, Lakhey, raths, Pulu Kisi, your friend's animation work and the owner's untracked original PNG are unchanged. No GLBs, gameplay placement, hazards, crowd behavior, gestures, collision or performance tests were added. No browser or physical device was tested because this ticket delivers concept images only.

Suggested next phase: a separate concept ticket for a fictional brick-and-timber facade, everyday gateway and hanging-light set. Do not start automatically. If you prefer models first, request a bounded static blockout ticket after accepting these designs.
