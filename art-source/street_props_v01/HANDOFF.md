# T040 — Street props (market cart, three spectators)

Original procedural low-detail models built from the T023 concept sheets in `art-source/festival_phase2_v01/`. Static: no rig, no clips. These are simplified game props, not portraits or a claim about any real person, community or tradition.

## Files

- `generate_props.py`: the source; regenerates everything below.
- `street_props_v01.blend`: editable Blender file.
- `market_cart_v01.glb`, `spectator_0N_v01.glb`: game-detail models (about 800 triangles each).
- `spectator_0N_far_v01.glb`: low-detail versions for the distant terrace crowd (about 350 triangles each).
- `prop_palette.png`: shared colour palette (one flat colour per cell).
- `preview_*.png`: neutral renders. `generation.log`: last run.

## Conventions

Blender Z-up, front -Y. GLB Y-up, front +Z. Metres, ground at zero. All models share one material, `Prop_Palette`, and take their colour by pointing UVs at a palette cell.

## Rebuild

```powershell
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --factory-startup --python-exit-code 1 --python art-source/street_props_v01/generate_props.py
python scripts/build-street-kit.py
```

The second command rebuilds `public/models/street_kit.glb` and `public/models/textures/tex_street_palette.webp`; the game loads only those.
