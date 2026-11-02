# TUKU OVERHAUL — Character Graphics & Mechanics Result

**Implementation state:** COMPLETE  
**Director review state:** ACCEPTED — 2026-11-02, Game Director playtest on Windows desktop (Chrome/Edge) and Android phone (Chrome); see D-016. Cultural/rights review not covered.  
**Date:** 2026-10-10  
**Ticket:** Tuku Character Audit, Graphics Reconstruction & Mechanics Polish (M4 Milestone)

## Summary

Completed an intensive visual and mechanical overhaul of the hero runner **Tuku** based on the approved character turnaround sheet (`art-source/tuku_concept_art_turnaround.jpg`), `docs/04_CHARACTER_TUKU.md`, and endless runner gameplay feel requirements.

### 1. Visual & Graphic Reconstruction (v0.5 Procedural GLB)
- **Continuous Lofted Anatomy:** Replaced disjointed primitive box/cylinder stacking with a continuous elliptical lofting pipeline (`scratch/glb_builder.cjs`). Eliminated the void/hole at the waist and created a watertight torso, pelvis, and crotch foundation.
- **Layered Kathmandu Youth Streetwear:**
  - **Teal Bomber Jacket (`#2B7A77`):** Cropped athletic V-taper jacket with ribbed waistband (`#1B5350`), open front placket, standing collar, horizontal back yoke seam, and a draped streetwear hood on the upper back.
  - **Longline Inner Shirt (`#EAE2D2`):** Warm off-white cotton extending exactly 8–10 cm below the cropped jacket hem, creating the essential 3-tone color block from behind (**Teal -> Cream -> Charcoal**) required by `docs/04_CHARACTER_TUKU.md`.
  - **Charcoal Cargo Joggers (`#2B3237`):** Anatomically tapered legs with articulated fabric folds (no dark robot joint spheres), outer cargo pockets, and ribbed ankle cuffs.
  - **Snug Maroon Cowl (`#8A3C46`):** Replaced vertical misaligned hoop with a horizontal torus folded snugly around the neck collar, featuring an offset front knot and trailing flutter ribbon with marigold trim (`#DEA94B`).
  - **Crossbody Tactical Messenger Satchel (`#222629`):** Compact canvas pouch contoured against the right-rear hip with dual marigold buckle hardware, suspended by diagonal chest and back straps crossing from the left shoulder to right hip.
  - **Athletic Trail Sneakers:** Contoured runner uppers, thick cream EVA foam midsoles (`#D8CFBF`), dark rubber tread outsoles (`#181B1D`), and marigold heel pull-tabs.
- **Expressive Stylized Head & Face:**
  - Warm medium Kathmandu skin tone (`#C9966A`) with soft ambient subsurface warmth to prevent deep alleyway black-out.
  - Expressive almond eyes with bright sclera (`#F8FAFC`), espresso dark irises (`#121518`), and white specular glints (`#FFFFFF`).
  - Determined, arched trickster eyebrows and a playful half-smirk mouth.
  - Dynamically swept dark anime hair (`#1A1E21`) framing the cranium and forehead without obscuring facial features.

### 2. Kinematics & Gameplay Feel Overhaul (`src/runner/PlayerController.ts`)
- **Critically Damped Lateral Dodge:** Replaced linear sliding with a 2nd-order spring physics model ($\omega = 26.0\text{ rad/s}$) that snaps across lanes in $\sim 140\text{ms}$ with zero oscillation.
- **Dynamic Skater Carve Banking:** Lateral velocity directly drives character bank angles up to $\pm 14.3^\circ$ and torso cut yaw up to $\pm 11^\circ$ for an authentic athletic carve.
- **Biomechanical Sprint Stride Cycle:** High forward knee drive, heel kick recovery up to $82^\circ$, and reciprocal spine counter-rotation ($5.5^\circ$) synchronized to procedural Dhime/Bhusya percussion.
- **Parkour Vault (3-Phase Jump):** Explosive liftoff, buoyant apex hangtime with aerodynamic tuck, and a $140\text{ms}$ kinetic stone pavement landing squash with impact dust particle burst.
- **Low Baseball Slide Crouch:** Smooth slide entry dropping center-of-mass to $Y = 0.34\text{m}$ (clearing overhead low beam obstacles) with lead leg extended, trailing leg tucked, and push-off spring recovery.
- **Secondary Inertia Physics:** Centrifugal wobble on the messenger satchel and wind-flutter aerodynamic drag on the maroon scarf tail.
- **Sprint Gaze Stabilization:** Neck pitch compensates for forward sprint torso lean, keeping Tuku's gaze locked alertly down the street.

## Changed files / assets

| Path | Why changed |
|---|---|
| `scratch/glb_builder.cjs` | Added `addLoft`, `addHorizontalTorus`, `addCapsule`, and smooth normal calculation to procedural GLTF 2.0 generator |
| `scratch/build_tuku_v05.cjs` | Master procedural character generator authoring Tuku v0.5 binary mesh |
| `public/models/tuku_blockout_v02.glb` | Runtime binary 3D character asset (148.8 KB, 12 semantic joint roots, 15 materials) |
| `art-source/tuku_blockout_v02.glb` | Master art source binary model |
| `src/runner/PlayerController.ts` | Upgraded PBR material initialization, spring dodge, skater banking, parkour vault, and slide mechanics |
| `viewer_tuku.html` | Updated multi-angle inspector with 3-point hero lighting and interactive animation test buttons |
| `scratch/test_tuku_mechanics.cjs` | Automated Playwright test suite verifying standoff, sprint, dodge, jump, and slide |
| `scratch/test_runner_natural_movement_and_coin_fix.cjs` | Automated Playwright test verifying physics damping, kinematics, and coin lane isolation |
| `art-source/tuku_model_front_face.png` | Evidence: Front view showing facial features, eyes, smirk, open jacket, and cowl |
| `art-source/tuku_model_back_gameplay.png` | Evidence: Primary gameplay rear view showing teal jacket, hood, diagonal strap, and cream shirt hem |
| `art-source/tuku_model_perspective.png` | Evidence: Three-quarter hero perspective view showing layered outfit and sneaker profile |
| `art-source/tuku_ready_standoff.png` | Evidence: In-game ready standoff tableau framing runner and Lakhey |
| `art-source/tuku_athletic_sprint.png` | Evidence: In-game active sprint capture with Dhime rhythmic cadence |
| `art-source/tuku_lane_dodge_bank.png` | Evidence: In-game lateral skater carve bank |
| `art-source/tuku_jump_apex.png` | Evidence: In-game parkour jump apex hurdle tuck |
| `art-source/tuku_baseball_slide.png` | Evidence: In-game baseball slide crouch under obstacle |

## Verification commands and results

1. **Procedural Model Generation:**
   ```bash
   node scratch/build_tuku_v05.cjs
   ```
   - Generated valid standard glTF 2.0 binary `.glb` (148,808 bytes).
   - Zero non-manifold edges, valid buffer alignment, 12 semantic joint nodes.

2. **TypeScript & Production Build:**
   ```bash
   cmd /c npm run build
   ```
   - TypeScript `tsc` check: **0 errors**.
   - Vite production bundle: built in 2.96s (`dist/`).

3. **Physics, Kinematics & Coin Lane Isolation Test:**
   ```bash
   node scratch/test_runner_natural_movement_and_coin_fix.cjs
   ```
   - Test 1 (Coin Lane Isolation): **PASS** (runner in left lane does not pull or collect center lane coins).
   - Test 2 (Lateral Dodge & Bank): **PASS** (peak velocity $21.63\text{ m/s}$, peak bank $14.32^\circ$, settled cleanly at target lane).
   - Test 3 (Athletic Sprint Stride): **PASS** (max knee flexion $82^\circ$, torso counter-twist $5.5^\circ$).
   - Test 4 (Parkour Vault & Landing Squash): **PASS** (jump apex $2.1\text{m}$, squash active $0.14\text{s}$).
   - Test 5 (Baseball Slide): **PASS** (lowest ground $Y = 0.34\text{m}$, recovers smoothly).

4. **Interactive Mechanics & Visual Evidence Capture:**
   ```bash
   node scratch/test_tuku_mechanics.cjs
   ```
   - All 8 verification screenshots captured with exit code 0.

## Browser and device tests

- **Tested:**
  - Desktop Chromium (1280×800): Verified full 3D model in `viewer_tuku.html` and in-game road running at 60 FPS.
  - Mobile Portrait Viewport (500×750): Verified rear camera gameplay readability, high-contrast silhouette against ancient red-brick street, and touch controls.
- **Not tested:**
  - Physical iOS Safari / Android Chrome hardware (tested via headless Chromium with mobile viewport emulation).

## Evidence

- **Front Hero Face:** [tuku_model_front_face.png](file:///c:/Users/ACER/Desktop/lakhey-run-planning_antigravity/art-source/tuku_model_front_face.png)
- **Primary Gameplay Rear:** [tuku_model_back_gameplay.png](file:///c:/Users/ACER/Desktop/lakhey-run-planning_antigravity/art-source/tuku_model_back_gameplay.png)
- **Three-Quarter Hero Perspective:** [tuku_model_perspective.png](file:///c:/Users/ACER/Desktop/lakhey-run-planning_antigravity/art-source/tuku_model_perspective.png)
- **Ready Standoff:** [tuku_ready_standoff.png](file:///c:/Users/ACER/Desktop/lakhey-run-planning_antigravity/art-source/tuku_ready_standoff.png)
- **Athletic Sprint:** [tuku_athletic_sprint.png](file:///c:/Users/ACER/Desktop/lakhey-run-planning_antigravity/art-source/tuku_athletic_sprint.png)
- **Lane Dodge Skater Bank:** [tuku_lane_dodge_bank.png](file:///c:/Users/ACER/Desktop/lakhey-run-planning_antigravity/art-source/tuku_lane_dodge_bank.png)
- **Parkour Jump Apex:** [tuku_jump_apex.png](file:///c:/Users/ACER/Desktop/lakhey-run-planning_antigravity/art-source/tuku_jump_apex.png)
- **Baseball Slide:** [tuku_baseball_slide.png](file:///c:/Users/ACER/Desktop/lakhey-run-planning_antigravity/art-source/tuku_baseball_slide.png)

## Assumptions, defects and blockers

- **Assumptions:** Model uses procedural lofting and hierarchical joint pivots (`LeftArmRoot`, `RightLegRoot`, etc.) driving per-frame rigid joint kinematics. Full skinned skeletal bone mesh and Blender FBX animation clips are deferred to dedicated rigging ticket T011.
- **Known Limitations:** Facial expression (smirk and eyes) is currently static texture/geometry; no dynamic facial morph targets are active.
- **Blockers:** None.

## Director approvals requested

1. **Visual Sign-Off:** Confirm that Tuku v0.5 (layered teal cropped jacket, 10cm cream shirt hem, tapered charcoal pants, snug maroon cowl, and right-hip satchel) matches the artistic vision and readability requirements.
2. **Kinetic Balance Sign-Off:** Confirm that the current lane dodge speed ($\sim 140\text{ms}$ settling), bank angle ($14.3^\circ$), and parkour jump arc provide the desired responsiveness for mobile endless running.

## Suggested next ticket

- **T008 (Kathmandu Environment Asset Kit):** Continue world-building with modular Newar-inspired facades, street tiles, lantern lighting, and fair hazards.
