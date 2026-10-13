# Pulu Kisi blockout v01 — developer handoff

T022, 2026-10-11. Static draft for import and development testing. Visual/cultural acceptance pending.

## Give your friend these files

- **pulu_kisi_blockout_v01.glb** — standalone binary geometry and PBR color materials; no external textures.
- **pulu_kisi_blockout_v01.blend** — editable Blender 5.2.2 LTS source and excluded PREVIEW_ONLY collection.
- **generate_pulu.py** — original procedural source; adjust shape/dimensions and regenerate into a fresh folder.
- **preview_front.png, preview_left.png, preview_right.png, preview_back.png, preview_perspective.png** — actual renders of this model.
- **asset_metrics.json, export_verification.json, playcanvas_verification.json, provenance.json** — counts, coordinates, checked hashes and source record.
- **verify_export.py, check_playcanvas.mjs, prepare_handoff.py** — source/export, isolated browser and repository packaging checks.
- **REFERENCE_NOTES.md** — prior research direction, simplifications and review boundaries.

The ZIP contains these files flat at its root, plus package_manifest.json and previous-asset preservation evidence. package_verification.json stays beside the ZIP to record its final hash without a self-referential archive checksum.

The silhouette is an elongated cloth-and-frame effigy, with open underside and two separated shoe pairs. It does not have natural elephant legs/anatomy or visible performer bodies. The head/ears/tuft, colored plain trim, seam layout, shoes and bead garland are simplified T019/T022 proposals; fine fabric weave, painted mask detail and historical construction are not reproduced. No authenticity claim, sacred symbols or ceremonial movement.

## Coordinate and sizing contract

| Property | Measured value |
|---|---|
| Unit | 1 unit = 1 meter |
| GLB up / forward | +Y / +Z, toward face/trunk |
| Blender up / forward | +Z / -Y |
| Root | PuluRoot identity transform at ground level below cloth-body center |
| Full width × height × depth | 2.205229 × 3.328000 × 3.842557 m, including ears/tuft/trunk |
| GLB min bounds X, Y, Z | -1.102615, 0.000000, -1.634400 |
| GLB max bounds X, Y, Z | 1.102615, 3.328000, 2.208157 |
| Cloth hem minimum height | 0.219587 m; soles touch Y=0 |
| Triangles / mesh objects / named nodes | 16,964 / 11 / 23 |
| Material primitives / shared materials | 26 / 8 |
| Texture images / clips / rig | 0 / 0 / none |
| GLB payload | 541,976 bytes (529.3 KiB) |

These are tentative blockout values, not real effigy measurements or adopted game dimensions. Confirm proportions/scale before placement. Scale the imported parent uniformly; dimensions/pivots are baked into meshes and groups have unit scale.

## Groups and attachment centers

Every group has one consolidated, directly editable child mesh. HeadRoot carries TrunkRoot, Ear_L, Ear_R and TuftRoot, so those parts follow whole-head transforms. GarlandRoot/TrimRoot attach to the body/root rather than head: rigid head movement does not provide automatic garland/ribbon adjustment. FrameRoot is a simple hidden-under-cloth support suggestion. Feet_Front and Feet_Rear each contain two shoes, not walking legs or a gait rig.

| Node | Parent | World pivot in unscaled GLB X, Y, Z (m) |
|---|---|---|
| PuluRoot | none | 0.000000, 0.000000, -0.000000 |
| ClothRoot | PuluRoot | 0.000000, 0.000000, -0.000000 |
| Feet_Front | PuluRoot | 0.000000, 0.000000, 0.900000 |
| Feet_Rear | PuluRoot | 0.000000, 0.000000, -0.950000 |
| FrameRoot | PuluRoot | 0.000000, 0.000000, -0.000000 |
| GarlandRoot | PuluRoot | 0.000000, 0.000000, -0.000000 |
| HeadRoot | PuluRoot | 0.000000, 2.400000, 1.450000 |
| Ear_L | HeadRoot | -0.430000, 2.480000, 1.390000 |
| Ear_R | HeadRoot | 0.430000, 2.480000, 1.390000 |
| TrunkRoot | HeadRoot | 0.000000, 2.340000, 1.770000 |
| TuftRoot | HeadRoot | 0.000000, 2.970000, 1.390000 |
| TrimRoot | PuluRoot | 0.000000, 0.000000, -0.000000 |

The table gives unscaled model-space **world** coordinates. Nested nodes use parent-relative local positions in the GLB; do not assign the table's world positions as local positions. Ear_L/Ear_R label negative/positive X sides, not camera-view left/right.

Head/trunk/ear origins are attachment pivots for later development, not a skeletal rig, articulation limits or approved movements. TrunkRoot moves one rigid curled trunk; flexible trunk deformation needs separately approved segmented geometry/rig work. The fiber tuft is static geometry, not a hair simulation. Cloth thickness/seams are static mesh, not simulated fabric. No colliders or animation clips are supplied.

For later work, use the imported parent for placement. Hide FrameRoot, GarlandRoot or TrimRoot for simpler visual tests; if hiding TrimRoot, the colored body/ear edging remains because it is part of those meshes. Check geometry overlaps/attachments if adding motion; static export checks do not approve choreography.

## Loading in the friend's branch

Agree a runtime path and copy only the GLB there. This is a proposed path, not a registered runtime asset:

```ts
app.assets.loadFromUrl('/models/pulu_kisi_blockout_v01.glb', 'container', (error, asset) => {
  if (error || !asset?.resource) {
    console.error('Pulu Kisi failed to load', error);
    return;
  }
  const pulu = asset.resource.instantiateRenderEntity();
  app.root.addChild(pulu);
  pulu.setPosition(0, 0, 0);
  const head = pulu.findByName('HeadRoot');
  const trunk = pulu.findByName('TrunkRoot');
  const ears = ['Ear_L', 'Ear_R'].map(name => pulu.findByName(name));
  // Store entities in a later view/controller. This handoff adds no motion code.
});
```

Tested with isolated PlayCanvas 2.23.2 container loading. This does not adopt an engine or gameplay role. Movement, if separately authorized later, should derive displacement from speed × dt; no motion/choreography or collision behavior is implemented here.

## Rebuild and verify

From repository root in PowerShell:

```powershell
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --factory-startup --python-exit-code 1 --python art-source/pulu_kisi_blockout_v01/generate_pulu.py
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --factory-startup --python-exit-code 1 --python art-source/pulu_kisi_blockout_v01/verify_export.py
node art-source/pulu_kisi_blockout_v01/check_playcanvas.mjs art-source/pulu_kisi_blockout_v01
```

After extracting the ZIP, run Blender with `--python generate_pulu.py -- --out ./rebuilt` and then `--python verify_export.py -- --out ./rebuilt` from its root. Adjust the Blender executable path to your installation. These commands need only Blender and the supplied scripts. Browser checking uses existing repository node_modules (Playwright/PlayCanvas) and script location; run it in this repository. prepare_handoff.py is a repository packaging utility and also requires the prior rath records/concept. The GLB itself has no authoring dependencies. No Meshy service or upload required.

The generator builds a fresh scene and overwrites generated outputs in its selected directory; preserve manual edits as a new .blend/version or rebuild into a new --out folder. --skip-renders omits the five previews. Consolidated meshes remain editable in Edit Mode; the generator is the editable procedural source for original subparts.

For manual GLB export after editing: select PuluRoot and all descendants; GLB, Selected Objects, +Y Up, no animations/cameras/lights. Exclude PREVIEW_ONLY. Update asset measurements and rerun checks; delivered JSON checks refer to the packaged hashes.

## Manual acceptance

1. Import GLB and compare all five mesh previews. Check long horizontal cloth shell, four neutral shoes in front/rear pairs, curled trunk and plain head/ears/tuft.
2. Place imported parent at Y=0: sole bottoms touch ground. Use low/front/side cameras to see shoes; high cameras can hide them behind the skirt.
3. Test a temporary small head transform: trunk/ears/tuft follow while cloth stays fixed. Restore the pose. Test independent trunk/ear rotations at their attachment centers. These are technical pivot checks, not provided animation states or ceremonial actions.
4. Hide cloth temporarily to inspect the simplified removable internal frame. Assess head/ribbon/garland overlaps before any future motion.
5. Review silhouette, proportions, gentle expression and respectful simplifications with director/local reviewer before polish/public portrayal.
6. Test target physical phone with eventual lighting and instance count. Eight materials/26 primitives are measured, not an approved mobile budget.

Verified: Blender save/reopen and GLB round trip, finite/nondegenerate source triangles, bounds within 0.0001 m, attachment positions/rigid rotations/parent following, two grounded shoe pairs, isolated Chrome software WebGL2 at 1000×900 and viewport-only 390×844, zero page errors. In-app browser setup failed on missing sandboxPolicy metadata; fallback used existing Playwright. No physical phone, hardware-GPU FPS, game lighting/placement/collisions, other Blender version, flexible trunk or cloth deformation tested.

Kumari/Bhairab/Ganesh files and friend/Tuku/Lakhey assets are preserved. Game source, public runtime registrations, decision log, server and deployment remain unchanged. Future Pulu Kisi gameplay use remains separately scoped and subject to the cultural-document review already recorded in T019.
