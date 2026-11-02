# T006 — implementation result

**Implementation state:** COMPLETE  
**Director review state:** ACCEPTED — 2026-11-02, Game Director playtest on Windows desktop (Chrome/Edge) and Android phone (Chrome); see D-016. Cultural/rights review not covered.  
**Date:** 2026-10-10  
**Ticket:** `tasks/T006_TUKU_VISUAL_TURNAROUND.md`

## Summary

Delivered the complete technical and artistic concept turnaround package for hero runner **Tuku** (specification v0.2), creating an inspectable visual foundation prior to 3D character modeling.

What was built:
1. **Vector Technical Turnaround (`art-source/tuku_turnaround_v02.svg`):** A 3200×2000px master technical turnaround sheet with precise FRONT, LEFT PROFILE, BACK (primary gameplay view), and RIGHT PROFILE orthographic views aligned to identical 1.68m crown and ground guidelines in A-pose.
2. **Standardized v0.2 Outfit & Color Palette:**
   - Cropped dusty teal jacket (`#2F7875`, matte canvas/cotton).
   - Longline warm cream inner shirt (`#E8DDCA`), extending 8–10 cm below the jacket hem.
   - Tapered charcoal trousers (`#2D3438`).
   - Compact muted maroon neck wrap (`#8C414B`), neatly tucked without flapping cloth.
   - Crossbody charcoal satchel (`#25292B`) anchored at the wearer's right-rear hip with strap running across the torso from the wearer's left shoulder to right hip.
   - Short untidy dark hair (`#25292B`) with an asymmetric sweep.
   - Low dark sneakers with cream sole and tiny marigold yellow heel tab (`#DEA94B`).
3. **Mobile Readability Validation:** Test strips embedded at in-game scales (~120px and ~70px viewport height) proving the high-contrast color hierarchy (teal mass + cream hem + slim charcoal legs) remains legible at handheld mobile distances.
4. **Cultural Safety Verification:** Explicitly designed as an original, contemporary Kathmandu youth trickster. Strict gate against copying ceremonial *hāku patāsi*, ritual masks, sacred marks, or *Jhyalincha* attire.
5. **High-Resolution Renders & Stylized Illustration:** Exported crisp full-sheet and section PNGs (`art-source/tuku_turnaround_v02.png`, `art-source/tuku_turnaround_4views.png`, `art-source/tuku_turnaround_back_gameplay.png`, `art-source/tuku_turnaround_sidebar_tests.png`) plus a complementary stylized 3D concept render (`art-source/tuku_concept_art_turnaround.jpg`).

What remains intentionally unbuilt:
- No 3D character mesh, Blender file, skeleton rig, or run/jump animations (deferred to authorized tickets T007 and T011).
- No unapproved sacred motifs or alternate costume skins.

## Changed files / assets

| Path | Why changed |
|---|---|
| `art-source/tuku_turnaround_v02.svg` | Master editable 3200×2000 vector technical turnaround with 4 orthographic views, guidelines, palette swatches, and mobile test strips |
| `art-source/tuku_turnaround_v02.png` | High-resolution raster render of full turnaround sheet |
| `art-source/tuku_turnaround_4views.png` | Focused high-res clip of FRONT, LEFT, BACK, RIGHT orthographic views |
| `art-source/tuku_turnaround_back_gameplay.png` | Focused high-res clip of primary third-person gameplay view |
| `art-source/tuku_turnaround_sidebar_tests.png` | Focused clip of palette swatches, 120px/70px mobile readability tests, and cultural gates |
| `art-source/tuku_concept_art_turnaround.jpg` | Stylized 3D character turnaround concept illustration |
| `scratch/render_turnaround.cjs` | Automated Playwright headless script for rendering SVG to pixel-perfect PNGs |
| `reports/T006_RESULT.md` | Mandatory completion report for Game Director review |

## Verification commands and results

- **Vector SVG Syntax & Geometry:** Verified viewBox `0 0 3200 2000` with 6 standard reference height lines (Crown 1.68m, Collar 1.43m, Jacket Hem 0.96m, Shirt Hem 0.85m, Knee 0.54m, Ground 0.00m).
- **Playwright Headless Rendering:** Executed `node scratch/render_turnaround.cjs` with Chromium, successfully outputting 4 unclipped PNG artifacts.
- **Mobile Scale Test:** Scaled back-view group at 0.096× (120px height) and 0.056× (70px height) — teal jacket shape, cream under-hem contrast, and charcoal legs remain immediately distinct.
- **Project Build Integrity:** `npm run build` succeeds cleanly; preview server running without regression.

## Browser and device tests

- **Tested:**
  - Windows 11 desktop (Chromium engine): 3200×2000 full raster export, SVG vector rendering, clean scaling.
  - Mobile portrait viewport emulation (502×751 and 375×667): Verified 120px / 70px rear silhouette readability cards.
- **Not tested:**
  - Physical Android / iOS devices (static 2D art deliverable; physical device testing will apply to 3D mesh in T007).

## Evidence

- Technical Turnaround Sheet: `art-source/tuku_turnaround_v02.png`
- Stylized 3D Concept: `art-source/tuku_concept_art_turnaround.jpg`
- Primary Gameplay Rear View: `art-source/tuku_turnaround_back_gameplay.png`
- 4-View Orthographic Clip: `art-source/tuku_turnaround_4views.png`

## Assumptions, defects and blockers

- **Assumptions:** Assumed the v0.2 palette (charcoal pants, maroon neck wrap, teal jacket, cream inner shirt) as designated in `docs/04_CHARACTER_TUKU.md`.
- **Known Limitations:** This is a 2D turnaround guide; 3D geometry and deformation will be resolved in T007 (Blender blockout) and T011 (animation).
- **Blockers:** None for T006; proceeding to 3D modeling (T007) requires explicit Game Director approval of this turnaround.

## Director approvals requested

1. **Outfit & Silhouette Sign-Off:** Confirm approval of the v0.2 palette (teal cropped jacket, longline cream shirt, charcoal pants, maroon neck wrap, right-rear satchel).
2. **Gender & Proportions Sign-Off:** Confirm the lean young-adult athletic trickster proportions (~1.68m, 6.75–7 heads).
3. **Green Light for Next Step:** Confirm whether to proceed to **T007 (Tuku Blender Static Blockout)** or **T008 (Kathmandu Environment Kit)**.

## Suggested next ticket

- **T007 (Tuku Blender Blockout)** to create an editable static `.blend` and `.glb` based on this approved turnaround sheet. Do not start automatically.
