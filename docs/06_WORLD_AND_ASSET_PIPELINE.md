# World art, 3D assets and production pipeline

## Art direction

Believable **stylized** Kathmandu-inspired street, not photorealism. Emotional authenticity comes from warm lighting, Newar brick/wood craftsmanship references, sound and lively surroundings. One fictional modular street is enough for V1; don't imply an exact sacred procession route.

## First usable art kit — PROPOSED

- Repeating **straight 3-lane road tile** (safe, legible lanes).
- Two facade variants composed of modular brick walls and roofline elements.
- One carved-wood-window-inspired silhouette, subject to architectural reference review.
- A door/shop front variant, one everyday stall, one wooden barrier and a small banner/cloth set.
- Distant decorative spectator silhouettes if device budget permits; **no crowd simulation**.
- Player and guardian placeholders first; hero characters have separate approval gates.

Only **two collision hazard classes** are needed initially; none should be sacred objects.

## Asset production pipeline for Codex

`Reference + art brief → procedural Blender source or approved licensed source → neutral preview → director review → optimized GLB → in-game rear camera screenshot → device test → accept/revise`

For assets authored in Blender:

- Keep `.blend` editable and commit generator `.py` scripts when generated programmatically.
- Export glTF/GLB with consistent unit scale, origins, facing direction and transform conventions.
- Supply front/side/back or perspective previews, triangle/material counts and texture sizes.
- Reuse parts/materials; avoid unnecessary unique mesh objects and large textures.
- Separate visible material meshes from **simple gameplay collision volumes**.
- Keep a manifest for source, creator, license, modification, file hash/link, attribution, usage restrictions.

## Visual QA

- Does the silhouette read on a narrow mobile viewport?
- Do environment tiles join without cracks/popping?
- Are jumpable versus avoidable obstacles immediately legible?
- Can street furniture or camera occlude the safe route?
- Is there enough contrast between Tuku teal and the red-brown street?
- Are any images, patterns or models sacred, inaccurately labeled or unlicensed?

## Performance targets — feasibility only

Prefer small number of meshes/materials, reused geometry, baked/cheap lighting, minimal transparent layers, no real-time cloth. The actual budgets for triangles, draw calls, texture resolution, download size and FPS should be **measured at T001/T013**, then adopted via decision log.

## Out of scope

Full Kathmandu reconstruction, large temples, crowds with complex AI, photogrammetry, photorealistic materials, cosmetic variations, procedural city generation beyond reusable straight tiles.

**Character specs:** `04_CHARACTER_TUKU.md`, `05_CHARACTER_LAKHEY.md`.
