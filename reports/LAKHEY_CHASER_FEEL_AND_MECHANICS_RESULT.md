# Lakhey Chaser Character Feel & Movement Mechanics — Implementation Result

**Implementation state:** COMPLETE  
**Director review state:** ACCEPTED — 2026-11-02, Game Director playtest on Windows desktop (Chrome/Edge) and Android phone (Chrome); see D-016. Cultural/rights review not covered.  
**Date:** 2026-10-10  
**Ticket:** Lakhey Chaser Guardian Visual Model & Kinetic Chase Mechanics Overhaul

## Summary

Significantly enhanced **Lakhey the chaser guardian** across visual model articulation, cultural presentation, and physics-driven chase dynamics:
1. **Articulated Character Model (`lakhey_blockout_v02.glb`):**
   - Fixed the trimesh cylinder and cone orientation bug that previously created horizontal floating cylindrical discs. All limb cylinders, neck, cuffs, and side tresses now use true vertical Y-axis alignment (`make_vert_cylinder` and `make_vert_cone`).
   - Upgraded to an articulated joint hierarchy with dedicated sub-nodes: `LeftElbowRoot`, `RightElbowRoot`, `LeftKneeRoot`, `RightKneeRoot`, and `ChamaraRoot` (ceremonial fly-whisk).
   - Added authentic cultural accessory: **Chāmara** (ceremonial yak-tail fly-whisk with golden handle and flowing white yak-hair plume) held in his right hand, waving in fluid figure-eight wave arcs as he strides.
   - Enhanced theatrical terracotta guardian mask with golden 3-peaked diadem crest, amber glowing almond eyes with dark pupils, bold curving guardian eyebrows, wide festive mouth, and downward-curving ivory fangs.
   - Preserved imposing 2.45m height grounded cleanly at $Y = 0.00\text{m}$ (1.45x scale relative to Tuku's 1.68m), broad 0.86m chest span, flared pleated skirt with gold brocade border trim, and voluminous cascading dark mane.
2. **Heavy Bounding Dhime Run Stride ("When chasing"):**
   - Asymmetric heavy stride cadence matching the $10.5\text{ rad/s}$ Dhime drum rhythm.
   - Natural knee flexion: trailing knee bends up to $+52^\circ$ in recovery before driving down into a solid, earth-shaking ground strike.
   - Bent-elbow powerful arm drive: left elbow pumps between $-52^\circ$ and $-76^\circ$ with forward chest drive, while right arm holds the Chāmara aloft with fluid trailing wave dynamics.
   - Dynamic forward charge pitch: forward lean escalates from $4.5^\circ$ at standard tracking distance up to $13.0^\circ$ as Lakhey closes in on Tuku.
   - Cascading mane secondary inertia oscillation ($\sin(\text{phase} \times 1.5 - 0.4) \times 8.0^\circ$) and drum-synchronized head nod.
3. **Pavement Tremor & Proximity Tension:**
   - Lakhey's downward footstep stomps now trigger subtle camera micro-rumble in `PlayerController` (`0.035 * (3.2 - dist)`) when Lakhey is within close proximity (<3.2m), making his presence physically felt through screen vibration.
4. **Proud Standoff Ready Pose:**
   - In the intro camera pan standoff, Lakhey stands in an authoritative, dignified guardian posture with chest expanded, arms spread broad ($-18^\circ$ roll), fly-whisk held proudly upright, and deep rhythmic chest breathing.
5. **Friendly Nonviolent Catch Gesture:**
   - In accordance with the nonviolent guardian framing in `docs/05_CHARACTER_LAKHEY.md`, when the challenge concludes, Lakhey eases into a dignified guardian bow ($-5^\circ$), lowers his stride with knee absorption ($12^\circ$), and gently extends both hands forward to tag Tuku on the shoulder while flourishing his Chāmara overhead. Zero violence depicted.

## Changed files / assets

| Path | Why changed |
|---|---|
| `scratch/build_enhanced_articulated_lakhey.py` | Generator script creating articulated Lakhey v0.2/v0.3 GLB with vertical cylinders/cones, sub-joints, facial details, and Chāmara fly-whisk. |
| `art-source/generate_lakhey_blockout.py` | Synchronized official generator script in repository. |
| `art-source/lakhey_blockout_v02.glb` | Updated 40,848-byte source GLB asset. |
| `public/models/lakhey_blockout_v02.glb` | Updated production runtime GLB asset with sub-joint hierarchy. |
| `public/models/lakhey_blockout_v01.glb` | Updated fallback GLB asset for backward compatibility. |
| `src/runner/GuardianController.ts` | Added sub-joint bindings for elbows, knees, Chamara; heavy Dhime stride; knee recovery; waving fly-whisk; and proximity reach charge. |
| `src/game/GameManager.ts` | Added camera micro-tremor hook on close guardian stomps. |
| `viewer_lakhey.html` | Updated 3D inspector with interactive run stride animation toggle and camera controls. |
| `scratch/test_lakhey_mechanics.cjs` | Automated Playwright test verifying model turnaround, stride animation, in-game standoff, chase tracking, and catch mechanics. |

## Verification commands and results

1. **Model Generation:**
   ```bash
   python scratch/build_enhanced_articulated_lakhey.py
   ```
   *Result:* Generated 51 geometries, 1,728 triangles, 966 vertices, clean bounds $1.140\text{m} \times 1.373\text{m} \times 0.758\text{m}$, 40.8 KB.
2. **TypeScript & Bundle Build:**
   ```bash
   npm run build
   ```
   *Result:* `tsc && vite build` completed in 2.89s with 0 errors.
3. **Automated Playwright Integration Test:**
   ```bash
   node scratch/test_lakhey_mechanics.cjs
   ```
   *Result:* Successfully tested all 4 model views, animated stride toggle, in-game standoff, chase tracking, and catch gesture. Exit code 0.

## Browser and device tests

- **Tested:** Windows 11, Chromium (Chrome Headless & Headful 500x750 / 640x800 mobile viewport emulation), 60 FPS locked, smooth WebGL rendering.
- **Not tested:** Physical iOS/Android touch devices.

## Evidence

- `scratch/lakhey_01_model_front.png`: Orthographic model front view showing clean vertical limbs, fangs, diadem crest, and gold cuffs.
- `scratch/lakhey_02_model_perspective.png`: 3/4 hero view showing Chāmara fly-whisk in right hand, layered costume, and grounded boots.
- `scratch/lakhey_03_model_side.png`: Side profile showing deep mane drape and mask projection.
- `scratch/lakhey_04_model_rear.png`: Rear chase view showing cascading mane volume.
- `scratch/lakhey_05_stride_animation.png`: Mid-stride frame in viewer showing bent arms, knee recovery lift, and waving fly-whisk.
- `scratch/lakhey_06_ingame_standoff.png`: Intro standoff showing Lakhey facing Tuku across the street.
- `scratch/lakhey_07_ingame_chase_stride.png`: Lakhey giving chase at tracking distance.
- `scratch/lakhey_08_ingame_friendly_catch.png`: Lakhey closing in during game over.

## Assumptions, defects and blockers

- Low-poly procedural modeling maintains performance budget (1,728 triangles).
- Friendly guardian framing strictly maintained; no sacred ritual dance choreography or violent combat invented.

## Director approvals requested

- Review of Chāmara (yak-tail fly-whisk) accessory addition and waving animation.
- Review of Lakhey's bounding stride weight and close proximity camera micro-shake intensity.

## Suggested next ticket

- Audio and VFX polish: add particle dust puffs on heavy Lakhey stomps and Tuku sliding turns, plus ambient street festival lantern glow.
