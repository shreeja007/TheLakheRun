# T021 — Bhairab and Ganesh rath handoffs

Two static procedural blockouts derived from T020's family construction. Director and cultural acceptance are pending. Names and visual differences are draft asset slots, not certified reproductions.

| Asset | Developer instructions | Model preview |
|---|---|---|
| Bhairab — lower pavilion, heavier braces | [Handoff](bhairab/HANDOFF.md) | [Perspective](bhairab/preview_perspective.png) |
| Ganesh — narrower frame, slimmer posts, simpler garlands | [Handoff](ganesh/HANDOFF.md) | [Perspective](ganesh/preview_perspective.png) |

Each variant folder contains its `.blend`, standalone `.glb`, four mesh renders, two isolated browser screenshots, measurements, provenance, verification files and shareable ZIP. Give your friend the ZIP; they can import the GLB and edit the Blender source without Meshy.

Every ZIP contains the chosen variant folder plus the shared scripts/this README at its root. The other folder linked above exists in the full repository and its separate archive; it is not bundled into each ZIP. The package manifest hashes the included asset/source files. `package_verification.json` stays beside the archive to record its final hash, avoiding a self-referential archive checksum.

The same group names and four axle-center wheel pivots are used for both companions and the unchanged Kumari asset. GLB +Y up, +Z forward, meters, ground-level RathRoot. Each model's `asset_metrics.json` supplies its own wheel radius and bounds; do not reuse Kumari's radius for all three.

`generate_rath.py` defines explicit `--variant bhairab` and `--variant ganesh` presets. It bakes size changes into geometry and pivot locations; root/group scales remain one. Wheel discs stay circular. Open cabin, plain nonfigural geometry/materials, no occupants, colliders, rig or clips. Preserve manual edits in a new Blender file; rebuilding overwrites generated files in the selected output directory.

After extracting either ZIP, from its root (replace Blender path for your OS):

```powershell
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --factory-startup --python-exit-code 1 --python generate_rath.py -- --variant bhairab --out ./bhairab_rebuilt
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --factory-startup --python-exit-code 1 --python verify_export.py -- --out ./bhairab_rebuilt
```

Use `ganesh` and a Ganesh output folder for the other preset. Rebuilding/Blender checks require only Blender and these scripts. Browser checks require the existing repository Playwright/PlayCanvas dependencies and the scripts' repository location. `prepare_handoffs.py` is a repository packaging utility: it expects both checked variant folders, original concept records and the previous Kumari deliverables. It is included as packaging source, not a standalone extracted-ZIP command.

Reference provenance remains in the prior T019 research register. No downloaded photo, mesh or texture has been imported. Exact dimensions and ornament are unverified; no cultural-authenticity claim. Physical phones, hardware-GPU FPS and game placement are untested. No game code, Tuku/Lakhey animations or Kumari deliverables changed.

Suggested follow-up: director/friend review of the three raths' shape and scale, then a separately authorized Pulu Kisi static-model ticket. Future placement/motion remains separate.
