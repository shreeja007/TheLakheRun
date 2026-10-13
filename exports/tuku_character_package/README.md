# Tuku Character — Complete Asset & Source Code Package

## Overview
This package contains the complete 3D character assets, texture atlases, procedural body design generator code, and gameplay kinematic controller codes for **Tuku**, the agile young runner protagonist of *Lakhey Run*.

---

## Directory Structure

```
tuku_character_package/
├── models/
│   ├── tuku_blockout_v02.glb         # Production articulated 3D character GLB with embedded cartoon atlas & ink outlines
│   └── tuku_cartoon_atlas.png        # 2048x2048 high-res master cartoon texture atlas
├── generator_code/
│   ├── build_tuku_cartoon_v06.cjs    # The complete procedural JavaScript generator for Tuku's 3D body
│   ├── generate_cartoon_atlas.cjs    # Node-canvas generator that draws the 2048x2048 cartoon texture atlas
│   ├── glb_builder.cjs               # Custom binary glTF 2.0 / GLB engine (lofts, toruses, PBR, outlines)
│   ├── generate_tuku_blockout.py     # Python/Trimesh generator script
│   └── tuku_blender_gen.py           # Native Blender bpy generator script
├── kinematics_and_controller/
│   └── PlayerController.ts           # PlayCanvas animation controller wiring all 12 articulated joint roots
├── viewer_tool/
│   ├── viewer_tuku.html              # Standalone interactive 3D web viewer for Tuku
│   └── viewer.ts                     # TypeScript viewer controller logic
└── docs_and_previews/
    ├── 04_CHARACTER_TUKU.md          # Official design specification & cultural boundaries
    ├── TUKU_OVERHAUL_RESULT.md       # Technical audit and overhaul report
    └── *.png / *.jpg                 # Multi-angle 3D renders (front, rear, hero, sprint, turnaround)
```

---

## 3D Body Design Specifications

- **Height & Proportions:** ~1.68m tall, 6.8 heads high, lean athletic young-adult runner.
- **Costume & Palette:**
  - **Jacket:** Cropped dusty teal (#2F7875) matte canvas with standing collar, silver center zipper, and Newar geometric diamond hem trim.
  - **Shirt:** Cream (#E8DDCA) longline shirt extending 10cm below the jacket hem.
  - **Trousers:** Charcoal (#2D3438) tapered athletic pants with reinforced knee seams.
  - **Scarf:** Short maroon (#8C414B) neck wrap with fluttering animated tail node.
  - **Satchel:** Charcoal compact messenger bag on right rear hip with cross-body diagonal strap.
  - **Shoes:** Low-top dark skate sneakers with white/cream sole edge and gold eyelets (#DEA94B).
  - **Hair:** Dark untidy asymmetric sweep.
  - **Facial Features:** Expressive anime/cartoon face with amber-brown eyes, highlights, and arched brows.
- **Comic Outlines:** Integrated 7mm inverted-hull back-facing ink shell (#14171E).

---

## Articulated Joint Hierarchy (GLB Node Names)

The 3D model is organized into hierarchical nodes designed for real-time procedural articulation without expensive skinning overhead:

1. `TorsoRoot`: Core pelvis/torso root.
2. `HeadRoot`: Head, face, hair, and neck.
3. `LeftArmRoot` & `RightArmRoot`: Shoulder pivot nodes.
4. `LeftElbowRoot` & `RightElbowRoot`: Forearm & hand nodes.
5. `LeftLegRoot` & `RightLegRoot`: Upper thigh pivot nodes.
6. `LeftKneeRoot` & `RightKneeRoot`: Lower shin, ankle, and sneaker nodes.
7. `SatchelRoot`: Messenger bag with inertia lag.
8. `ScarfTailRoot`: Trailing scarf tail with wind flutter.

---

## How to Regenerate or Modify the 3D Model

To modify or rebuild the 3D model:
```bash
# 1. Regenerate the 2048x2048 Texture Atlas
node generator_code/generate_cartoon_atlas.cjs

# 2. Rebuild the Articulated 3D GLB Model
node generator_code/build_tuku_cartoon_v06.cjs
```
The output `tuku_blockout_v02.glb` will be updated with your changes.

---

## Compatibility
- **glTF 2.0 / GLB:** Standard compliant; opens in Blender, PlayCanvas, Three.js, Babylon.js, Windows 3D Viewer, and Godot.
- **PBR Metallic-Roughness:** Metallic = 0.02, Roughness = 0.55.
