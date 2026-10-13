# T025 — Building 01 editable residence handoff

The owner visually accepted Building 01's T024 concept and authorized modeling on 2026-10-12. This resulting static model remains pending director acceptance.

## Files

- building01_residence_v01.blend: editable geometry, linked window modules, two packed original textures and a separate preview camera/light/floor collection.
- building01_residence_v01.glb: self-contained static model with embedded textures, excluding preview rig.
- generate_building.py: original editable procedural source.
- Five preview PNGs: actual front, left, right, back and perspective mesh renders.
- MODEL_FACTS.md: measured geometry, dimensions and verification facts.
- references/accepted_building01_concept.png: unchanged accepted concept; compare against mesh previews.

## Editing and reuse

Building01Root is at the ground-centered body footprint origin. Blender is Z-up/front -Y; GLB is Y-up/front +Z. One authoring unit is a working meter. Dimensions remain adjustable, not approved street/lane sizes or actual house measurements. Roof overhang and doorstep extend beyond the body footprint.

Group empties: WallsRoot, PlinthRoot, TimberRoot, RoofRoot, DoorRoot, WindowsRoot. Walls contain actual apertures behind opaque recessed windows. The door is static and closed; no interior, hinge animation or walk-through behavior is supplied.

Windows: front five (two lower/three upper), back four, left two, right two. Thirteen window objects share three mesh-data variants. Editing shared data affects linked instances: use Blender's Make Single User > Object Data before making a unique variant. Wall/gable, roof, plinth, timber and door meshes are independently editable. Larger parameter changes use the generator's dimension and opening arrays.

Brick and roof detail uses two original repeating 512px color tiles and explicit UVs. Lattice bars are geometry; stone and timber are plain rough materials. Curved individual roof tiles, per-brick sculpting, stone block joints, fine wood grain, normal maps and detailed wear are simplified or omitted. This is a static blockout of fictional everyday architecture, not culturally authenticated construction.

The parts support authoring reuse; a complete modular street kit, joining contract, LODs, atlas, instance pooling and approved device/draw-call budgets remain future work.

## Rebuild and check

Open the blend in Blender 5.2.2 LTS. Packed textures support moving the file; separate texture PNGs are supplied. PREVIEW_ONLY is excluded from the GLB.

PowerShell from repository root:

~~~powershell
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --factory-startup --python-exit-code 1 --python art-source/building01_blockout_v01/generate_building.py
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --factory-startup --python-exit-code 1 --python art-source/building01_blockout_v01/verify_export.py
node art-source/building01_blockout_v01/check_playcanvas.mjs art-source/building01_blockout_v01
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --factory-startup --python-exit-code 1 --python art-source/building01_blockout_v01/prepare_handoff.py
~~~

Generator/checker also accept -- --out DIRECTORY. Outside this repository use --python ./generate_building.py -- --out ./rebuilt, then --python ./verify_export.py -- --out ./rebuilt. They need Blender only. --skip-renders omits previews. The browser checker needs the repository's installed PlayCanvas/Playwright and is intended to run from its repository location. Packaging needs the reference/notes and completed checks in this folder.

Generation creates a fresh scene and overwrites outputs. Save manual edits as another version or regenerate into a new directory; do not overwrite a friend's edited blend.

Manual export after editing: select Building01Root and descendants; GLB, Selected Objects, +Y Up, no animations/cameras/lights; exclude PREVIEW_ONLY. Update metrics and rerun checks because delivered hashes describe only the packaged files.

## Loading and manual acceptance

Load the GLB as a PlayCanvas container using loadFromUrl, handle errors, then instantiateRenderEntity. Place/scale the returned parent. Ground is GLB Y=0, front door faces +Z; textures need no extra runtime image URL. No runtime path was registered or game integration performed.

1. Compare all five mesh previews and opening counts against the accepted concept.
2. Import in the friend's scene and check ground, facing, roof overhang, doorstep and materials.
3. Assess corners, lattice and repeating textures at intended camera distance. No facade joining or moving-camera/gameplay test is included.
4. Test physical phones with eventual lighting and instance count before approving performance.
5. Accept/revise blockout color/proportions and simplified finishes before further polish.

Source reopen, nondegenerate finite geometry, 13 window apertures plus door aperture, packed textures, embedded GLB images, round-trip bounds and isolated browser loading are verified. Desktop/narrow viewport screenshots are import evidence, not physical-device or hardware-GPU FPS tests. In-app browser setup failed on missing sandboxPolicy metadata; existing Playwright was used as fallback.

Previous models/concepts, Building 02, gateway/lights, friend animation work, game code and the decision log are unchanged. No upload or deployment occurred. Suggested next ticket: separately authorize Building 02's static model after accepting this model and that building's own concept.
