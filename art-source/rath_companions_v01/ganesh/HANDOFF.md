# Ganesh rath blockout v01 — developer handoff

T021, 2026-10-11. Static draft, pending director and informed cultural review.

## Files to give your friend

- **ganesh_rath_blockout_v01.glb**: standalone binary model; no external textures required.
- **ganesh_rath_blockout_v01.blend**: editable Blender 5.2.2 LTS source, including an excluded PREVIEW_ONLY camera/light/floor collection.
- **preview_front.png, preview_left.png, preview_back.png, preview_perspective.png**: actual views rendered from this mesh, not AI turnaround guesses.
- **asset_metrics.json, export_verification.json, playcanvas_verification.json, provenance.json**: measured counts, import evidence and source record.
- Shared **generate_rath.py** and validation scripts are one folder above these files, also supplied at the archive root. The generator includes explicit bhairab and ganesh presets.

Narrower frame, slimmer posts, plain rails without inset panels, and two-loop simpler garlands. Both companions are smaller than the delivered Kumari shell. These differences and size ratios are original T019/T021 proposals, not verified traditional identifiers. The names label intended asset slots; no deity figures, sacred paintings/carving, ritual gestures or occupants are supplied. Timber panels, canopy, joinery and garland beads are simplified original geometry.

## Sizing and node contract

| Property | Measured value |
|---|---|
| GLB up / forward | +Y / +Z toward drawbeam |
| Blender up / forward | +Z / -Y |
| Units | meters; 1 unit = 1 m |
| Ground origin | RathRoot identity transform at (0, 0, 0) below carriage center |
| Full width × height × depth | 2.097920 × 3.280560 × 3.840000 m, including drawbeam |
| GLB min bounds (X, Y, Z) | -1.048960, 0.000000, -1.248000 |
| GLB max bounds (X, Y, Z) | 1.048960, 3.280560, 2.592000 |
| Wheel radius | 0.512000 m |
| Triangles / mesh objects | 6,866 / 10 |
| Material primitives / shared materials | 23 / 8 |
| Texture images / clips / skeletal rig | 0 / 0 / none |
| GLB payload | 517,624 bytes (505.5 KiB) |

All dimensions are tentative blockout choices, not real-rath measurements or approved lane fit. Nodes have unit scale and zero initial rotation; preset changes are baked into geometry. Wheels remain circular and begin touching Y=0.

RathRoot contains ChassisRoot, PlatformRoot, PavilionRoot, RoofRoot, DrawbeamRoot, GarlandRoot, Wheel_FL, Wheel_FR, Wheel_RL and Wheel_RR. Every group/pivot has one child mesh; material primitives share its transform. This is the same naming contract as T020 Kumari, allowing a shared loader/controller with per-model wheel radii.

| Wheel node | GLB local center (X, Y, Z), meters |
|---|---|
| Wheel_FL | -0.837760, 0.512000, 0.736000 |
| Wheel_FR | 0.837760, 0.512000, 0.736000 |
| Wheel_RL | -0.837760, 0.512000, -0.736000 |
| Wheel_RR | 0.837760, 0.512000, -0.736000 |

F/R first letter labels front/rear axles; the L/R suffix labels negative/positive X sides. Use coordinates rather than assuming a camera-view convention. Rotate the Wheel_* pivot on local X, not the wheel mesh child or ChassisRoot. Positive local X rolls toward local +Z. For later animation, degrees = distanceMeters / 0.512000 * 180 / PI. If the imported parent is uniformly scaled, use this radius times that scale for world-meter distances. Derive distance from speed × dt in a later controller; no movement code is added here.

## Loading in the friend's branch

Copy only the GLB to an agreed runtime asset path in that branch. The following path is an example, not an existing registration:

```ts
app.assets.loadFromUrl('/models/ganesh_rath_blockout_v01.glb', 'container', (error, asset) => {
  if (error || !asset?.resource) {
    console.error('Rath load failed', error);
    return;
  }
  const rath = asset.resource.instantiateRenderEntity();
  app.root.addChild(rath);
  rath.setPosition(0, 0, 0);
  const wheels = ['FL', 'FR', 'RL', 'RR'].map(label => rath.findByName('Wheel_' + label));
  // Store rath/wheels in your later controller; placement and motion are separate work.
});
```

The loader passed isolated PlayCanvas 2.23.2 checks. GarlandRoot can be hidden for simpler decoration. Roof/pavilion/drawbeam groups are editable groups, not mechanically constrained articulation or attachment sockets. There are no colliders, baked animation clips or skeletal rig.

## Rebuild and validate

From repository root in PowerShell:

```powershell
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --factory-startup --python-exit-code 1 --python art-source/rath_companions_v01/generate_rath.py -- --variant ganesh --out art-source/rath_companions_v01/ganesh
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --factory-startup --python-exit-code 1 --python art-source/rath_companions_v01/verify_export.py -- --out art-source/rath_companions_v01/ganesh
node art-source/rath_companions_v01/check_playcanvas.mjs art-source/rath_companions_v01/ganesh
```

After extracting the ZIP, run the generator from its root with `--variant ganesh`; default output is the included `ganesh` subfolder. For export verification use `--out ganesh`. Generation/Blender validation require only Blender and the supplied scripts. Browser validation uses this repository's installed Playwright/PlayCanvas node_modules and script location, so run it in the repository rather than an arbitrary extracted directory. No Meshy account, upload or paid service is required.

Use `--out <new-folder>` for experiments; rebuilding recreates a scene and overwrites same-named generated files. Preserve manual Blender edits in a new file/version. Group meshes remain editable in mesh Edit Mode. For manual GLB export, select RathRoot and all descendants only; use GLB, Selected Objects and +Y Up, no cameras/lights/animation. Exclude PREVIEW_ONLY. Update measurements and rerun checks after edits; the packaged evidence refers to the delivered hashes.

## Review before production use

1. Import and compare with the four mesh previews: four solid timber wheels, complete red chassis/drawbeam, open pavilion and empty cloth seat.
2. Check ground contact, +Z forward and uniform scaling. Compare the three raths' footprint and silhouettes before choosing final game dimensions.
3. Rotate each Wheel_* local X by 45°: axle center stays fixed and wheel plugs move.
4. Check final lighting and many simultaneous instances on a target physical phone. Eight materials and 23 primitives are measured, not a demonstrated mobile budget.
5. Review silhouette/recognizability and respectful simplification with the director/local reviewer before polish or public portrayal.

Tested: Blender 5.2.2 LTS save/reopen/GLB round trip, headless chrome WebGL2 software rendering at 1000×900 and a 390×844 viewport. No physical phone, hardware-GPU FPS, Meshy, gameplay placement or collision/animation integration tested. In-app browser setup was unavailable (missing sandboxPolicy metadata); isolated checks used existing Playwright.

Kumari handoff, Tuku/Lakhey assets, game code, decisions and the friend's animations are unchanged. Future gameplay use is a separate ticket and requires resolving the culture-document restrictions already recorded in T019.
