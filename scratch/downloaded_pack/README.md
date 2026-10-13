# Lakhey Run — Tuku Refined v03

A first-pass stylized game-model refinement of `tuku_blockout_v02.glb`, based on the provided Tuku concept turnaround. Intended for an existing **PlayCanvas + TypeScript** procedural-animation endless runner.

## Files

- `tuku_refined_v03.glb` — **import this**. GLB 2.0 with one embedded palette texture; no loose texture files required.
- `tuku_refined_v03_preview.png` — before / after plus procedural run pose.
- `tuku_refined_v03_turnaround.png` — neutral front, three-quarter, rear, and side reference renders.
- `playcanvas_tuku_example.ts` — example code for loading the model via PlayCanvas.
- `model_manifest.json` — geometry, materials, preserved nodes, dimensions and bounds.
- `tuku_palette_atlas.png` — optional copy of the embedded color swatches for inspection; not required when loading the GLB.

## What changed

- Shaped jacket with open front and layered long cream undershirt, pockets, contrast seams, hood and cuffs.
- Smaller, more detailed stylized face, eyes, dark swept hair and layered maroon scarf.
- Articulated sleeve volumes, mitt-like hands with small finger indications.
- Tapered athletic/cargo pants with seams, cuffs, panels and charcoal sneakers with cream soles / marigold highlights.
- Satchel flap, buckles, piping and attachment on the original independent `SatchelRoot` pivot. The flap now faces the **rear camera**, the main gameplay view.
- A single embedded palette texture instead of many colored materials; additional meshes have been grouped by original animation pivot for fewer draw calls.

## Specs

| Property | Value |
|---|---|
| GLB version | glTF 2.0 |
| Height | 1.678 m |
| Bounds min | `(-0.317, 0.001, -0.178)` m |
| Bounds max | `(0.317, 1.679, 0.254)` m |
| Triangles | 10,918 |
| Render meshes | 54 |
| PBR materials | 1 |
| Textures | 1 embedded 512 × 512 palette |
| Axis convention | +Y up; -Z forward; feet at Y≈0 |
| Skin joints / animation clips | None (as with original) |

## Animation compatibility

**Original 54 named GLB nodes and all their transforms/parent relationships are preserved.** The important motion roots are:

```
TorsoRoot
HeadRoot
  ScarfTailRoot
LeftArmRoot
  LeftElbowRoot
RightArmRoot
  RightElbowRoot
LeftLegRoot
  LeftKneeRoot
RightLegRoot
  RightKneeRoot
SatchelRoot
```

New mesh detail is under each relevant original root, as one child named `<RootName>__Refinement`. The imported model has no skinned skeleton and no embedded animation clips; **your existing PlayCanvas procedural-animation scripts remain responsible for motion**.

The original node structure is validated in exported GLB. Extra nodes follow their parents in an off-engine stride / vault pose check. This **does not** constitute an end-to-end runtime test against your existing game logic — you should test with your actual controller, particularly satchel swing, jump clearance, lane hitbox and material overrides.

## Use in PlayCanvas

1. Back up `tuku_blockout_v02.glb` in your project.
2. Copy `tuku_refined_v03.glb` to your application's model / assets folder.
3. Update the asset path the game uses to load Tuku, leaving your **node-name lookups and procedural pivot animation code** intact.
4. Leave the imported entity at scale `(1,1,1)` to keep world sizes unchanged.
5. Check idle, sprint, lane dodge, parkour vault, slide, glance-back and satchel motion; adjust animations if the revised silhouette needs more clearance.

The included `playcanvas_tuku_example.ts` illustrates the PlayCanvas container loader and pivot lookups. If you already load a GLB successfully, usually only the asset path needs changing.

## Scope / limitations

This is a **stylized low-poly first refinement**, not a high-detail sculpt, photoreal texture, retopologized rigged character, or an animation bundle. All 42 original mesh-node names remain available but the added details are parented to the motion pivots rather than each old leaf mesh. The mesh is PBR-colored through an embedded palette atlas; if your game replaces its materials at runtime, re-enable the imported GLB materials to retain the colors.

Preview images were rasterized directly from GLB geometry, not AI-generated concept images.
