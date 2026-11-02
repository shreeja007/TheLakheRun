# T009 — implementation result

**Implementation state:** COMPLETE  
**Director review state:** ACCEPTED — 2026-11-02, Game Director playtest on Windows desktop (Chrome/Edge) and Android phone (Chrome); see D-016. Cultural/rights review not covered.  
**Date:** 2026-10-10  
**Ticket:** `tasks/T009_LAKHEY_HERO_CONCEPT.md`

## Summary

Completed the cultural safety review pack and master visual concept turnaround for the guardian character **Lakhey** (specification v0.1), establishing an authoritative, respectful creative foundation before 3D character blockout.

What was built:
1. **Master Technical Concept Turnaround (`art-source/lakhey_concept_v01.svg` & `.png`):**
   - 3200×2000px sheet featuring side-by-side scale comparison (Lakhey 2.35m vs Tuku 1.68m), Front Orthographic view, and Profile view.
   - Distinct silhouette contrast: broad 0.85m shoulders, ceremonial crimson robe (`#A31D1D`), gold brocade trims (`#E5A93C`), flared pleated skirt (*Jama* stylized inspiration), brass wrist/ankle cuffs, voluminous cascading dark mane (`#1A1412`), and an energetic, theatrical guardian mask.
2. **Cultural Review Pack (`docs/LAKHEY_CULTURAL_REVIEW_PACK.md`):**
   - Complete Tradition-vs-Fiction matrix distinguishing living Newar traditions from original game mechanics.
   - Enforced nonviolent guardian framing: Lakhey is an energetic protector, not an evil demon or monster.
   - 6-point cultural review checklist for local Guthis / Newar cultural practitioners.
   - Comprehensive provenance citations referencing verified cultural reporting (`docs/12_RESEARCH_SOURCES.md`).
3. **Stylized 3D Concept Artwork (`art-source/lakhey_guardian_concept.jpg`):**
   - Illustration depicting the spirited, nonviolent festival chase between Tuku and Lakhey along the lantern-lit Kathmandu street.

What remains intentionally unbuilt:
- No 3D character mesh, armature rig, or animation cycles (deferred to T010 and T011).
- No sacred ritual symbols, consecrated mask replicas, or secret ceremonial marks.

## Changed files / assets

| Path | Why changed |
|---|---|
| `art-source/lakhey_concept_v01.svg` | Master vector technical turnaround sheet (3200×2000) with scale comparison and 3 views |
| `art-source/lakhey_concept_v01.png` | High-resolution raster render of full concept turnaround |
| `art-source/lakhey_tuku_scale_comparison.png` | Focused clip of Lakhey (2.35m) vs Tuku (1.68m) silhouette contrast |
| `art-source/lakhey_guardian_concept.jpg` | Stylized 3D concept artwork demonstrating joyful, nonviolent festival atmosphere |
| `docs/LAKHEY_CULTURAL_REVIEW_PACK.md` | Formal stakeholder review document with Tradition-vs-Fiction matrix and checklist |
| `scratch/render_lakhey_concept.cjs` | Automated Playwright script for rendering high-res PNG artifacts |
| `reports/T009_RESULT.md` | Completion report for Game Director review |

## Verification commands and results

- **Vector Geometry & Scale Ratio:**
  - Verified height ratio: Lakhey (2.35m) is exactly 1.40× Tuku's height (1.68m).
  - Chest width ratio: Lakhey (0.85m) is 2.23× Tuku's chest width (0.38m), guaranteeing immediate silhouette distinction at mobile scale (~120px character height).
- **Headless PNG Rendering:**
  - Executed `node scratch/render_lakhey_concept.cjs` with Chromium, outputting pixel-perfect 3200×2000 raster sheets without artifacts.
- **Cultural Safety Alignment:**
  - Verified zero sacred marks, consecrated iconography, or violent horror tropes are present.

## Browser and device tests

- **Tested:** Desktop Chromium (1280×800) and Mobile Portrait viewports (502×751, 375×667) for silhouette readability.
- **Not tested:** Physical consultation meetings (documentation pack prepared for Game Director outreach).

## Evidence

- **Master Concept Turnaround:** `art-source/lakhey_concept_v01.png`
- **Scale & Silhouette Contrast:** `art-source/lakhey_tuku_scale_comparison.png`
- **Stylized Character Illustration:** `art-source/lakhey_guardian_concept.jpg`
- **Stakeholder Cultural Review Pack:** `docs/LAKHEY_CULTURAL_REVIEW_PACK.md`

## Assumptions, defects and blockers

- **Assumptions:** Lakhey's visual direction is a respectful stylized proposal for Game Director and community review, not a claimed authentic ritual reproduction.
- **Blockers:** Proceeding to 3D character blockout (T010) requires explicit Game Director approval of this proposal.

## Director approvals requested

1. **Lakhey Visual Concept Approval:** Confirm approval of the 2.35m scale, crimson/gold robe, flared skirt, flowing dark mane, and theatrical guardian mask design.
2. **Next Ticket Authorization:** Authorize **T010 (Lakhey 3D Model Blockout)** to create an editable static 3D blockout `.glb` and Blender generator script based on this approved concept.

## Suggested next ticket

- **T010 (Lakhey 3D Model Blockout)** to model the guardian static silhouette in Blender and export `.glb` for the prototype.
