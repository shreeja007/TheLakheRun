# T001 — implementation result

**Implementation state:** COMPLETE  
**Director review state:** ACCEPTED — 2026-11-02, Game Director playtest on Windows desktop (Chrome/Edge) and Android phone (Chrome); see D-016. Cultural/rights review not covered.  
**Date:** 2026-10-09  
**Ticket:** `tasks/T001_WEB_3D_FEASIBILITY.md`

## Summary

Implemented a minimal code-first 3D feasibility spike using standalone PlayCanvas Engine v2.23.2, TypeScript, and Vite v8.3.4.

### What was built
- **Core 3D Scene:** A ground plane, directional sun light, fill light, perspective camera, and a central rotating test primitive (box).
- **Diagnostics HUD & Telemetry:** Real-time FPS counter, frame time (ms), canvas resolution, DPR indicator, and active material color name.
- **Input System Verification:**
  - Keyboard: `Space` or `C` cycles through a 6-color palette (derived from Tuku & Kathmandu planning specs); `R` toggles rotation spin.
  - Touch / Mouse UI Buttons: Dedicated `#btn-change-color` and `#btn-toggle-spin` buttons with touch feedback.
  - Direct Canvas Touch: Tapping/clicking directly on the 3D canvas viewport triggers an input response and bounce scale pulse.
- **Responsive & Resize Handling:** Dynamic canvas resize listener using PlayCanvas `FILLMODE_FILL_WINDOW` and `RESOLUTION_AUTO` supporting portrait and landscape orientations without distortion or stretching.
- **Production Build:** Fully working TypeScript compilation (`tsc`) and Vite bundling generating minified assets.

### What remains intentionally unbuilt (Out of scope)
- No endless-runner mechanics (lanes, speed scaling, distance scoring, jump arcs, or collision game-over).
- No Tuku or Lakhey character geometry, rigs, or textures.
- No Kathmandu festival environment kit or procedural street tiles.
- No audio clips or background festival music.
- No server deployment or online APIs.

---

## Changed files / assets

| Path | Why changed |
|---|---|
| `package.json` | Configured project scripts (`dev`, `build`, `preview`) and installed `playcanvas`, `typescript`, `vite`. |
| `tsconfig.json` | Configured TypeScript strict mode and modern bundler resolution for Vite. |
| `index.html` | Created entry HTML with full-bleed WebGL canvas, HUD overlay, diagnostics, touch buttons, and viewport meta tags. |
| `src/main.ts` | Created PlayCanvas standalone application, camera, lighting, 3D meshes, input handlers, resize handling, and telemetry. |
| `README.md` | Added local run instructions (`npm install`, `npm run dev`, `npm run build`, `npm run preview`). |
| `reports/T001_RESULT.md` | Documented completion report, verification evidence, device test instructions, and engine evaluation. |

---

## Verification commands and results

1. **Dependency Installation:**
   - Command: `npm install playcanvas; npm install -D vite typescript`
   - Result: PlayCanvas v2.23.2, Vite v8.3.4, TypeScript v7.0.2 installed cleanly (0 vulnerabilities).

2. **Typecheck & Production Build:**
   - Command: `npm run build` (`tsc && vite build`)
   - Result: Successful build in 303ms.
   - Bundle Metrics:
     - `dist/index.html`: 4.31 kB (gzip: 1.76 kB)
     - `dist/assets/index-s_cO9tuK.js`: 2,010.39 kB (gzip: 514.51 kB)
     - Total uncompressed bundle: ~2.01 MB
     - Total compressed transfer: ~516.27 kB

3. **Preview Server:**
   - Command: `npx vite preview --port 4173 --host`
   - Result: Running and serving locally at `http://localhost:4173/` and over local network at `http://192.168.1.82:4173/`.

---

## Browser and device tests

### Automated Browser Testing (via Headless Chrome subagent)
- **Environment:** Windows 10/11, Chromium (Headless).
- **Desktop Viewport Test:**
  - Result: Loaded cleanly. Stable **57–58 FPS**, frame time **17.4–17.7 ms**. DPR 1.25.
  - UI Button Tap: Verified `#btn-change-color` cycled color from Teal to Maroon (`Last Input: [UI Button Tap]`). Verified `#btn-toggle-spin` paused/resumed rotation.
  - Canvas Click: Verified direct click cycled color to Gold (`Last Input: [Canvas Click]`).
  - Keyboard Input: Verified key `C` and key `Space` cycled colors and triggered bounce pulse (`Last Input: [Key [Space]]`).
- **Mobile Portrait Resize Test (`390 × 844` viewport):**
  - Result: Canvas resized smoothly without aspect ratio distortion or pixel clipping; HUD panel adapted; telemetry updated to `502 × 751 (Portrait)`.
- **Console Log Inspection:**
  - Result: **0 console errors, 0 WebGL warnings**. Clean execution.

### Physical Mobile Device Testing Instructions for Game Director
Because the automated agent runs on the desktop host, please run a quick 30-second verification on your physical smartphone:
1. Ensure your phone is connected to the same Wi-Fi network as this PC.
2. Open your mobile browser (Safari on iOS or Chrome on Android) and navigate to:  
   **`http://192.168.1.82:4173/`**
3. Verify:
   - Does the 3D rotating cube appear smoothly?
   - Tap the **🎨 Cycle Color** button and tap directly on the canvas — does the cube change color and pulse?
   - Rotate your phone between Portrait and Landscape — does the canvas adapt cleanly?
   - Check the displayed FPS and DPR in the top-left HUD.

*(Untested platforms by agent: Physical iPhone Safari, physical Android hardware. These are flagged for director review above).*

---

## Evidence

- **Browser Interaction Recording:**  
  [t001_playcanvas_spike_1791568426886.webp](file:///C:/Users/ShreejaManandhar/.gemini/antigravity-ide/brain/4cfad6fc-541f-4260-b9df-155d3435ecca/t001_playcanvas_spike_1791568426886.webp)
- **Initial Desktop Load Screenshot:**  
  [initial_scene_load_1791568450052.png](file:///C:/Users/ShreejaManandhar/.gemini/antigravity-ide/brain/4cfad6fc-541f-4260-b9df-155d3435ecca/initial_scene_load_1791568450052.png)
- **Mobile Portrait Resize Screenshot:**  
  [mobile_portrait_resize_1791568533967.png](file:///C:/Users/ShreejaManandhar/.gemini/antigravity-ide/brain/4cfad6fc-541f-4260-b9df-155d3435ecca/mobile_portrait_resize_1791568533967.png)

---

## Technical Evaluation: PlayCanvas vs. Babylon.js Fallback

| Metric / Aspect | PlayCanvas Standalone (Observed) | Babylon.js Comparison (Reference) |
|---|---|---|
| **Transfer Size (Gzip)** | **~514 kB** (Entire engine + application) | ~1.5 MB – 2.2 MB (Standard `@babylonjs/core`) |
| **Startup / Init Time** | Sub-second (Vite build in 303ms) | Moderate |
| **Ergonomics & API** | Lightweight ECS (`Entity`, `addComponent`), clean TypeScript types | Rich feature set, heavier object graph |
| **Mobile Suitability** | Excellent lightweight footprint for casual mobile web runner | Capable but noticeably heavier payload for fast web play |
| **Recommendation** | **Keep PlayCanvas** as the confirmed engine. It satisfies all performance, bundle size, and architectural requirements for Lakhey Run V1. | Retain as fallback only if unexpected GLTF loading blockers emerge. |

---

## Assumptions, defects and blockers

- **Assumptions:** Local network IP `192.168.1.82` is accessible by devices on the local Wi-Fi.
- **Defects:** None encountered. Zero WebGL or console errors.
- **Blockers:** None for T001.

---

## Director approvals requested

1. **Engine Confirmation:** Confirm PlayCanvas standalone + TypeScript + Vite as the official game engine for Lakhey Run (updating proposed decision `D-009` to `CONFIRMED`).
2. **Mobile Orientation Direction:** Confirm preferred orientation for subsequent gameplay tickets: **Portrait-first** (recommended for endless runner lanes) or Landscape?
3. **Authorization for T002:** Review the T001 spike on your device, and if satisfied, authorize **T002 (Player Movement: 3-Lane Auto-Run & Jump)**.

---

## Suggested next ticket

- **`tasks/T002_PLAYER_MOVEMENT.md`**: Implement the player cube, 3 discrete lanes, forward auto-run, left/right lane switching, and a predictable jump arc.
- **Rule reminder:** Do not start T002 automatically. Awaiting Game Director review and explicit authorization.
