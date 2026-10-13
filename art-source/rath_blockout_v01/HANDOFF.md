# Kumari rath blockout v01 — developer handoff

T020, 2026-10-11. Static draft shell, pending director/cultural acceptance.

## Use these files

- **kumari_rath_blockout_v01.glb** — import into the game's model loader. Standalone binary, embedded geometry/PBR material colors, no external texture files.
- **kumari_rath_blockout_v01.blend** — editable source, made with Blender 5.2.2 LTS. Includes a PREVIEW_ONLY collection for cameras, lights and ground. Preview objects are not in the GLB.
- **generate_rath.py** — original procedural source. Group meshes can be edited directly in Blender; generator changes can rebuild the blockout.
- **preview_front.png, preview_left.png, preview_back.png, preview_perspective.png** — actual renders of this mesh.
- **asset_metrics.json, export_verification.json, playcanvas_verification.json, provenance.json** — measurements/checks/source record.
- **check_playcanvas.mjs, verify_export.py** — repeatable validation in this repository.

This is a 3D blockout, not a conversion that reproduces every T019 image detail. Deliberately plain panels, canopy, wheel plugs and garland beads replace fine carving/texture detail. No sacred eye paintings, deity faces, occupants, ritual gestures or collision volumes.

## Coordinate and sizing contract

| Property | Value |
|---|---|
| Unit | 1 unit = 1 meter |
| GLB up / forward | +Y / +Z (toward drawbeam end) |
| Blender up / forward | +Z / -Y |
| Root | RathRoot, identity transform, ground-level origin below carriage center |
| Full size including drawbeam | 2.98 m X width × 4.245 m Y height × 4.80 m Z depth |
| GLB bounds | X -1.49 to +1.49; Y 0 to 4.245; Z -1.56 to +3.24 |
| Wheel radius | 0.64 m before any model scaling |
| Wheel spin | local X axis on each Wheel_* node |
| Geometry | 8,434 triangles; 10 mesh objects, 23 material primitives |
| Materials / texture images | 8 shared PBR materials / 0 texture images |
| Animation clips / skeletal rig | 0 / none |
| GLB payload | 663,320 bytes, approximately 648 KiB |

Dimensions are tentative blockout measurements chosen for this shell, not measurements of the real procession rath. Apply any eventual size change uniformly to the imported parent. Gameplay lane fit is undecided; do not automatically squeeze it into a lane.

## Named nodes

RathRoot has ChassisRoot, PlatformRoot, PavilionRoot, RoofRoot, DrawbeamRoot, GarlandRoot and four Wheel_* children. Each grouping has one child mesh; multiple material primitives share its transform. Groups/pivots have unit scale and no initial rotation.

| Wheel node | Local center in exported GLB (X, Y, Z), meters |
|---|---|
| Wheel_FL | -1.19, 0.64, +0.92 |
| Wheel_FR | +1.19, 0.64, +0.92 |
| Wheel_RL | -1.19, 0.64, -0.92 |
| Wheel_RR | +1.19, 0.64, -0.92 |

F/R in the first letter means front/rear axle; the L/R suffix is a naming label for the negative/positive X side. Use the signed coordinates above rather than assuming a camera-view convention.

## PlayCanvas loading example

Copy the GLB into a separately chosen game asset path such as public/models/kumari_rath_blockout_v01.glb. This ticket has NOT done that or changed the runtime.

```ts
app.assets.loadFromUrl('/models/kumari_rath_blockout_v01.glb', 'container', (err, asset) => {
  if (err || !asset?.resource) {
    console.error('Rath failed to load', err);
    return;
  }
  const rath = asset.resource.instantiateRenderEntity();
  app.root.addChild(rath);
  rath.setPosition(0, 0, 0); // Ground-level origin; placement is decided separately.
  const wheels = ['Wheel_FL', 'Wheel_FR', 'Wheel_RL', 'Wheel_RR']
    .map(name => rath.findByName(name));
  // Keep rath and wheels in your own view/controller for later movement.
});
```

The loading path above is a proposed destination, not an already registered runtime model. Tested with this repository's PlayCanvas 2.23.2 loader. Future controller should use the imported parent for placement and the four Wheel_* pivots for spin; do not rotate ChassisRoot or a wheel mesh child in place of its pivot.

For local +Z movement with unscaled wheels, rolling angle in degrees is distanceMeters / 0.64 × 180 / PI, positive around local X. Derive distance from speed × dt (seconds) if animating later. For uniformly scaled models, use world wheel radius 0.64 × scale when distance is measured in world meters. No movement code or animation clip is supplied by this asset.

Hide GarlandRoot if testing a simpler silhouette. Roof/pavilion/drawbeam are separate editable groups but not mechanically articulated components; there are no promised motion limits, attachment sockets or constraints.

## Rebuild and verify

From the repository root in PowerShell; use a fresh output directory if exploring changes:

```powershell
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --factory-startup --python-exit-code 1 --python art-source/rath_blockout_v01/generate_rath.py
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --factory-startup --python-exit-code 1 --python art-source/rath_blockout_v01/verify_export.py
node art-source/rath_blockout_v01/check_playcanvas.mjs
```

Generator supports `-- --out <new-output-folder>` and `--skip-renders`. It builds a new scene; use it in a fresh background Blender process. Its default output is this versioned folder. Validation scripts expect the delivered directory and repository node_modules. They require Blender and the existing Playwright/PlayCanvas dependencies; the GLB itself has no such editing dependencies.

For manual export after Blender edits: select RathRoot and all its descendants; export glTF Binary with Selected Objects, +Y Up and no animations/cameras/lights. Exclude PREVIEW_ONLY. Run validation again after changes.

## Acceptance checks for your friend

1. Import GLB: red chassis, dark timber pavilion, four solid wheels, complete drawbeam, empty cloth seat.
2. Place parent at Y=0: wheel bottoms touch ground. Confirm forward +Z and adjust uniform scale only after intended dimensions are agreed.
3. Rotate each Wheel_* local X by 45 degrees: timber plugs move while axle centers stay fixed and carriage does not rotate.
4. Compare the source .blend and four previews. Check draws/materials against intended lighting.
5. Test on a physical target phone with the eventual scene before setting a performance budget.
6. Return visual/cultural feedback before polishing, cloning the other raths or gameplay placement.

Headless Chrome software rendering passed desktop1000×900 and phone-shaped390×844 viewports; no actual phone/FPS test. The in-app browser connection failed because its required sandbox metadata was unavailable, so the isolated check used existing Playwright. No user server, external upload or game animation file was touched.
