# T014 — Lakhey Guardian Modern Cartoon & Illustrated Asset Upgrade

**Implementation state:** COMPLETE  
**Director review state:** ACCEPTED — 2026-11-02, Game Director playtest on Windows desktop (Chrome/Edge) and Android phone (Chrome); see D-016. Cultural/rights review not covered.  
**Date:** 2026-10-11  
**Ticket:** `tasks/T010_LAKHEY_3D_ASSET.md` / `tasks/T011_LAKHEY_RIG_ANIMATION.md` (Overhaul to match Tuku Modern Cartoon Visual Standard)

## Summary

In lockstep with the overhaul of **Tuku** (`tuku_blockout_v02.glb`), the guardian chaser **Lakhey** has been completely overhauled from generic flat-colored geometric blockout boxes into a high-appeal **Modern Cartoon / Illustrated** 3D stylized character (`lakhey_blockout_v02.glb`), matching the visual direction inspired by the concept art in `art-source/lakhey_guardian_concept.jpg` and authentic Newar Majipa Lakhey traditions:

1. **Dedicated 2048×2048 Cartoon Texture Atlas (`art-source/lakhey_cartoon_atlas.png` & `public/models/lakhey_cartoon_atlas.png`):**
   - **Quadrant 1 (Theatrical Visage):** Warm vermillion terracotta red base, ornate golden multi-tiered *Mukut* crest with pearl trim, sacred Third Eye (*Trinetra*), expressive almond amber eyes with anime catchlights, benevolent festive ivory fangs and teeth (strictly benevolent protective spirit, nonviolent guardian), and stylized black calligraphic beard and whiskers.
   - **Quadrant 2 (Ceremonial Vestment):** Rich crimson silk robe with vertical cel-shaded pleat furrows, broad 264px golden brocade hem border (*Kinari*) featuring traditional Newar diamond and lotus filigree, and vertical gold embroidered hanging sash (*Patuka*).
   - **Quadrant 3 (Cascading Mane & Footwear):** Deep charcoal lion/yak mane texture with 280+ dense wavy crimson and burgundy strand ribbons and pink flame highlights, pointed *khussa* boots in crimson leather with golden eyelets, upturned curled toes (*Nok*), and golden ankle cuffs with brass bells (*Ghungroo*).
   - **Quadrant 4 (Brocade Yoke, Medallion Belt, Streamers & Chāmara):** Radiant golden sunburst chest yoke (*Galbandi*), pearl necklace festoons (*Moti Mala*), ceremonial belt with central turquoise/ruby jewel medallion, 4 vibrant wrist ribbon streamers (Saffron Yellow, Peacock Blue, Festival Pink, Emerald Green), and sacred yak-hair fly-whisk (*Chāmara*) with turned brass handle and silken white plume.

2. **3D Mesh Geometry & Cultural Anatomy Overhaul (`scratch/build_lakhey_cartoon_v04.cjs`):**
   - **16-Pleat Sinusoidal Fluted Jama Skirt:** 6-slice loft flaring dramatically down to `rx = 0.58m, rz = 0.40m` with 16 authentic sinusoidal folds (`pleatCount: 16`, `pleatDepth: 0.026m`) and matching gold brocade *Kinari* hem border.
   - **Heroic V-Taper Torso & Jewelry:** Broad athletic upper tunic loft (`rx = 0.46m, rz = 0.27m`), sunburst chest yoke, gold collar ring, layered deltoid epaulet pauldrons, draped pearl garlands (*Moti Mala*), and central gold rosette brooch with ruby gem.
   - **Theatrical Guardian Visage:** Curved mathematical front face slice calibrated with 1:1 precision to the texture atlas, 3D golden *Mukut* crown with 3 upward flame spires and ruby/turquoise cabochons, 3D calligraphic eyebrow wings (*Bhrikuti*), golden Third Eye bezel (*Trinetra*), and 3D curved ivory fangs.
   - **Billowing Yak-Tail Mane (*Chamara*):** Multi-tiered hair volume situated strictly at positive Z (`Z >= 0.02m`), framing the face from behind with sweeping side tufts, 3 high-velocity billowing locks sweeping back at 42°, 8-pleat fluted cascading back tiers down the spine, and sculpted 3D hair lock cones.
   - **Articulated Limbs & Authentic Accessories:** Deltoid shoulder spheres, elbow sockets, knee sockets, golden wrist cuffs, 4 dynamic fluttering festival streamers on each wrist, turned brass fly-whisk (*Chāmara*), and pointed *khussa* boots with 3D brass bells (*Ghungroo*) and golden curled toes grounded firmly at World Y = 0.00m.
   - **Inverted-Hull Ink Comic Outlines & Winding Fixes:** 7.5mm dark charcoal outline shell around all closed volumes with mathematically verified counter-clockwise face winding on ascending and descending lofts, providing crisp graphic novel cel-shaded silhouettes.

3. **100% Procedural Kinematics Compatibility:**
   - Joint names and pivots match existing engine requirements: `TorsoRoot`, `HeadRoot`, `ManeRoot`, `LeftArmRoot`, `LeftElbowRoot`, `RightArmRoot`, `RightElbowRoot`, `ChamaraRoot`, `LeftLegRoot`, `LeftKneeRoot`, `RightLegRoot`, `RightKneeRoot`.
   - Both `viewer_lakhey.html` and `GuardianController.ts` operate smoothly at 60 FPS with zero joint tearing.

## Changed files / assets

| Path | Why changed |
|---|---|
| `art-source/lakhey_cartoon_atlas.png` | Master 2048×2048 stylized cartoon texture atlas for Lakhey. |
| `public/models/lakhey_cartoon_atlas.png` | Public runtime copy of Lakhey's cartoon texture atlas. |
| `scratch/generate_lakhey_atlas.cjs` | Headless Playwright script generating the high-res texture atlas. |
| `scratch/glb_builder.cjs` | Procedural glTF 2.0 binary builder with pleat fluting, inverted-hull outlines, and winding fixes. |
| `scratch/build_lakhey_cartoon_v04.cjs` | Procedural glTF 2.0 binary builder for Lakhey v0.4. |
| `public/models/lakhey_blockout_v02.glb` | Modern Cartoon / Illustrated Lakhey 3D model asset (2.12 MB). |
| `art-source/lakhey_blockout_v02.glb` | Repository art-source archive of Lakhey v0.4 model. |
| `scratch/capture_cartoon_lakhey_views.cjs` | Automated Playwright verification script for Lakhey model viewer and in-game chase views. |
| `scratch/verify_lakhey_catch.cjs` | Automated verification script testing the friendly catch cinematic sequence. |

## Verification commands and results

1. **Texture Atlas Generation:**
   - Command: `node scratch/generate_lakhey_atlas.cjs`
   - Output: 2048×2048 PNG rendered and written to `art-source/lakhey_cartoon_atlas.png` (1.35 MB).
2. **GLB Asset Generation:**
   - Command: `node scratch/build_lakhey_cartoon_v04.cjs`
   - Output: `lakhey_blockout_v02.glb` exported cleanly (2122.2 KB) with 1 texture, 5 PBR materials, 11 meshes, 12 articulated nodes, 16-pleat fluted garments, and inverted-hull comic outlines.
3. **Application Build:**
   - Command: `cmd /c npm run build`
   - Output: TypeScript compiled with 0 errors (`tsc && vite build`). Production bundle created in 2.83s.
4. **Automated Inspection:**
   - Command: `node scratch/capture_cartoon_lakhey_views.cjs`
   - Output: 7 screenshots captured across Front, 3/4 Hero, Side, Rear Chase, Run Stride, In-Game Standoff, and In-Game Chase.
5. **Catch Sequence Verification:**
   - Command: `node scratch/verify_lakhey_catch.cjs`
   - Output: Successfully entered `CAUGHT` state, scoop & hoist animation ran cleanly at 60 FPS, modal revealed properly after flourish.

## Browser and device tests

- **Tested:** Windows 11, Microsoft Edge (Chromium 131+ headless), 60 FPS, WebGL 2.0, DPR 1.0 and 2.0.
- **Untested:** Mobile Safari on physical iOS hardware (recommended for subsequent device test pass).

## Evidence

- `lakhey_01_model_front.png`: Front orthographic view showing theatrical vermillion mask, golden Mukut, Third Eye bezel, almond eyes, fangs, brocade yoke, draped pearl garlands, 16-pleat fluted *Jama* skirt, and *Kinari* border.
- `lakhey_02_model_perspective.png`: 3/4 Hero perspective highlighting imposing 2.45m athletic build, golden crown flames with gems, fly-whisk, and wrist streamers.
- `lakhey_03_model_side.png`: Side profile showing billowing mane clearance and flared skirt drape.
- `lakhey_04_model_rear.png`: Rear hero chase perspective showing rich flowing dark/crimson hair locks, sculpted spine tufts, and fluted pleats.
- `lakhey_05_stride_animation.png`: Dynamic running stride animation with active knee recovery, arm drive, and chamara sway.
- `lakhey_06_ingame_standoff.png`: In-game ready standoff with both overhauled characters (Tuku & Lakhey) sharing the Kathmandu street.
- `lakhey_07_ingame_chase_stride.png`: Active street chase camera view.
- `lakhey_08_ingame_friendly_catch.png`: Nonviolent friendly guardian scoop & carry sequence.

## Assumptions, defects and blockers

- **Assumptions:** Lakhey maintains the nonviolent, festive guardian framing from Indra Jatra celebrations.
- **Defects:** None identified; performance budget maintained well under WebGL runtime limits (20k tris, 1 shared atlas).
- **Blockers:** None.

## Director approvals requested

- Approval of the Modern Cartoon visual style alignment between Tuku and Lakhey.
- Approval of the theatrical guardian mask styling, crown flames, and wrist streamers.

## Suggested next ticket

- **T015 — Kathmandu Environment Kit Cartoon Texture Upgrade:** Bring the street architecture, pagoda shrines, carved wooden lattice windows (*Jhyal*), torana banners, and brick pavements up to the same Modern Cartoon / Illustrated art style as Tuku and Lakhey.
