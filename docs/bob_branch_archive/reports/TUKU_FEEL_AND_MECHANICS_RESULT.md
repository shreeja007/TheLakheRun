# TUKU Character Feel & Movement Mechanics — Implementation Result

**Implementation state:** COMPLETE  
**Director review state:** PENDING  
**Date:** 2026-10-10  
**Ticket:** Tuku Runner Visual Character and Movement Feel Overhaul (Focus: Runner Feel, Lane Dodge, Sprint, Vault, Landing Squash)

## Summary

Significantly enhanced **Tuku the runner** across visual model articulation and physics-driven procedural game feel mechanics:
1. **Articulated Character Model (`tuku_blockout_v02.glb`):**
   - Upgraded from rigid single-piece limbs to an articulated joint hierarchy with dedicated sub-nodes: `LeftElbowRoot`, `RightElbowRoot`, `LeftKneeRoot`, `RightKneeRoot`, and `ScarfTailRoot`.
   - Re-aligned limb geometry using vertical Y-up cylinders (`make_vert_cylinder`) for clean anatomical connections at elbows and knees.
   - Added expressive low-poly facial features: almond eyes with dark pupils, determined trickster eyebrows, stylized nose bridge, subtle mouth smirk, dark Dhaka-inspired cap, open teal running jacket over cream inner shirt band, maroon neck wrap with dynamic flutter tail, charcoal running trousers, and white-soled sneakers.
   - Retained strict bounds ($0.38\text{m} \times 1.02\text{m} \times 0.30\text{m}$, total in-game height $1.68\text{m}$) grounded at $Y=0.00\text{m}$.
2. **Lane Switching / Dodging Mechanics ("Going to sides"):**
   - Replaced linear slide with snappy distance-scaled dynamic easing (`Math.max(16.0, Math.min(26.0, Math.abs(dx) * 18.0 + 8.0))`).
   - Implemented dynamic skater banking: character rolls into turns (up to $-21^\circ$), leading knee flexes to absorb lateral g-force, trailing leg extends in a skate push-off, satchel swings outward from centrifugal momentum, and torso cuts into turn yaw ($-dx \times 6.5^\circ$).
   - Added mid-air acrobatic banking allowing agile dodging while airborne.
3. **Sprint Stride Locomotion ("When running"):**
   - Added bent-elbow arm pumping: elbows flex naturally from $-45^\circ$ to $-85^\circ$ with forward drive rather than stiff pendulum swinging.
   - Added natural knee flexion: trailing knee flexes up to $+65^\circ$ backwards during recovery stride, extending cleanly as the foot plants.
   - Speed-scaled forward torso lean ($4.5^\circ \to 12.0^\circ$) conveying forward sprint drive.
   - Dynamic scarf flutter driven by sprint velocity with randomized turbulence.
4. **Jumping & Landing Vault Mechanics ("Jumping"):**
   - Asymmetric parkour jump curve with explosive liftoff and apex hangtime ($\sin(\text{progress} \times \pi)^{0.82}$).
   - Athletic hurdle vault apex tuck: both knees bend $85^\circ-90^\circ$ to clear low barriers, arms spread outwards for aerodynamic balance, and satchel lifts weightlessly.
   - 120ms landing kinetic compression squash: character absorbs $0.07\text{m}$ vertical impact upon pavement touchdown with deep knee flexion before springing back into full sprint stride.
5. **Standoff & Recovery Integration:**
   - In the intro standoff, Tuku holds an athletic ready stance with knees slightly bent and hands poised, maintaining eye contact back with Lakhey.

## Changed files / assets

| Path | Why changed |
|---|---|
| `scratch/build_enhanced_articulated_tuku.py` | Standalone procedural generator script for articulated Tuku v0.2/v0.3 GLB with sub-joints, PBR materials, facial features, and vertical limb cylinders. |
| `art-source/tuku_blockout_v02.glb` | Updated 43,816-byte source GLB asset with full node hierarchy. |
| `public/models/tuku_blockout_v02.glb` | Updated production runtime GLB asset. |
| `src/runner/PlayerController.ts` | Added joint bindings for elbows, knees, scarf tail; dynamic lane easing; skater banking; bent-elbow locomotion; hurdle apex tuck; and landing impact squash. |
| `scratch/test_tuku_mechanics.cjs` | Automated Playwright test verifying all mechanical states and capturing visual proof. |

## Verification commands and results

1. **Model Generation:**
   ```bash
   python scratch/build_enhanced_articulated_tuku.py
   ```
   *Result:* Generated 42 geometries, 1840 triangles, 1002 vertices, clean bounds $0.380\text{m} \times 1.020\text{m} \times 0.297\text{m}$.
2. **TypeScript & Bundle Build:**
   ```bash
   npm run build
   ```
   *Result:* `tsc && vite build` completed in 3.71s with 0 errors.
3. **Automated Playwright Integration Test:**
   ```bash
   node scratch/test_tuku_mechanics.cjs
   ```
   *Result:* Successfully tested intro standoff, sprint stride, lane dodge right bank, center hurdle jump, and landing squash recovery. Exit code 0.

## Browser and device tests

- **Tested:** Windows 11, Chromium (Chrome Headless & Headful 500x750 mobile viewport emulation), 60 FPS locked, smooth canvas WebGL rendering.
- **Not tested:** Physical iOS/Android touch devices (emulated via desktop viewport; touch gesture inputs bind to identical keyboard events).

## Evidence

- `scratch/tuku_01_ready_face_standoff.png`: Athletic ready stance during standoff.
- `scratch/tuku_02_athletic_sprint.png`: Bent-elbow arm pump and knee drive during sprint.
- `scratch/tuku_03_lane_dodge_bank.png`: Skater banking roll and lateral weight shift during lane dodge.
- `scratch/tuku_04_parkour_jump_apex.png`: Parkour hurdle vault with tucked knees and balanced arms.
- `scratch/tuku_05_landing_impact_squash.png`: Pavement landing squash and recovery into run stride.
- `scratch/tuku_06_model_front_face.png`: Orthographic model view showing facial features and clean vertical limb joints.
- `scratch/tuku_07_model_perspective.png`: 3/4 perspective hero view.

## Assumptions, defects and blockers

- Procedural GLB model maintains low-poly aesthetic consistent with the art direction guidelines in `docs/03_ART_DIRECTION.md`.
- No physics engine added; all mechanics are framerate-independent procedural kinetics.

## Director approvals requested

- Confirmation of Tuku's facial expression and low-poly aesthetic balance.
- Confirmation of lane dodge bank intensity ($-21^\circ$ max roll).
- Confirmation to proceed to Lakhey chaser animation and mechanics overhaul.

## Suggested next ticket

- Overhaul Lakhey the chaser character model and animations (heavy rhythmic bounding stride, waving yak-tail fly-whisk, demon stomp FX, closer proximity intimidation).
