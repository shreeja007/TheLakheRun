# T026 — Building 02 editable shopfront handoff

Owner requested the Building 02 model following visual acceptance on 2026-10-12; this is treated as source acceptance/model authorization. The resulting static model remains pending director acceptance.

## Included

- building02_shopfront_v01.blend: editable geometry, linked windows and packed original textures, with a separate preview collection.
- building02_shopfront_v01.glb: self-contained static model and embedded textures.
- generate_building.py: original project generator adapted locally from Building 01; no dependency on that packet.
- Five preview PNGs: actual front, left, right, back and perspective views of the same mesh.
- Browser screenshots, MODEL_FACTS.md, provenance, independent checks and package manifest.
- references/accepted_building02_concept.png: unchanged T024 source.

## Editing

Ground-centered body root: Building02Root. Blender Z-up/front -Y; GLB Y-up/front +Z. Authoring units are adjustable working meters, not approved street/lane scale or measurements of an actual building. Roof and steps extend outside the body footprint.

Groups: WallsRoot, PlinthRoot, TimberRoot, RoofRoot, ShopfrontRoot, ServiceDoorRoot, WindowsRoot.

- Front: two upper window modules, each with two lattice panes; broad closed ground shopfront with four separate Shutter_Panel_01 through Shutter_Panel_04 mesh objects and Shop_Opening_Frame.
- Back: two upper windows and Closed_Service_Door.
- Left/right: one window per floor on each side.

Eight window objects share three linked mesh-data variants. Shared mesh edits propagate: use Make Single User > Object Data before customizing one window. Shutters use four separate mesh-data objects; edit their vertices independently. Their origins remain at the building root rather than hinge positions. The visible metal straps are static detail, not operational hinges. No shutter/door behavior, rig, animation, interior or collider is supplied.

The two analytic 512px brick/roof color textures and six material names match Building 01's conventions. They are packed in the blend and embedded in the GLB; separate PNG originals are also supplied. This facilitates authoring consistency but does not register shared materials/textures in the game or guarantee reuse across loaded containers.

Roof tile curvature, wood grain, fine wear, stone block joints and detailed joinery are simplified. Lattice bars are actual geometry, walls have apertures, and window recesses are opaque. This is a fictional everyday architecture blockout, not culturally authenticated or structurally engineered construction.

## Rebuild / export / verify

Tested authoring version: Blender 5.2.2 LTS. PREVIEW_ONLY contains non-exported authoring floor/lights/camera.

From repository root in PowerShell:

~~~powershell
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --factory-startup --python-exit-code 1 --python art-source/building02_blockout_v01/generate_building.py
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --factory-startup --python-exit-code 1 --python art-source/building02_blockout_v01/verify_export.py
node art-source/building02_blockout_v01/check_playcanvas.mjs art-source/building02_blockout_v01
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --factory-startup --python-exit-code 1 --python art-source/building02_blockout_v01/prepare_handoff.py
~~~

Generator/checker accept -- --out DIRECTORY after the script. For an extracted packet use --python ./generate_building.py -- --out ./rebuilt and --python ./verify_export.py -- --out ./rebuilt; Blender is sufficient. --skip-renders skips previews. Browser checking additionally needs the existing repository PlayCanvas/Playwright dependencies and its repository script location. Packaging needs local reference/notes plus completed check JSONs; preservation comparison runs when the previous model packet is present.

Generation starts a fresh scene and overwrites outputs. Save hand edits as a new version or choose a fresh output directory; do not overwrite a friend's edited blend.

Manual GLB export: Building02Root plus descendants only, Selected Objects, +Y Up, no animations/cameras/lights; exclude PREVIEW_ONLY. Update metrics and checks after changing geometry; supplied evidence describes delivered hashes.

## Use and acceptance

Load as a PlayCanvas container using loadFromUrl with error handling, instantiateRenderEntity, then place/scale its returned parent. Root ground is GLB Y=0; shopfront faces +Z; textures need no separate runtime image URLs. No game URL or scene placement was registered.

1. Compare all five mesh previews with the accepted shop concept and count four shutters, two paired front windows, side windows and rear service door.
2. Inspect linked data, material appearance, ground root, roof/step bounds and actual camera-scale readability.
3. Agree street dimensions and facade joins in a later placement ticket; no assembly/tiling/collision contract is supplied.
4. Test physical phones with intended instance count/lighting before approving performance. Thirty-six material primitives favor editable components; no LOD, atlas or measured multi-building budget is supplied.
5. Accept/revise the static model's proportions, color and simplified finish before polish or motion.

Verified: finite nondegenerate geometry, eight real window apertures, shop/service openings, four nonoverlapping distinct shutter meshes, paired-window metadata, packed/embedded textures, GLB round-trip bounds and isolated PlayCanvas loading. Screenshots use headless desktop/narrow viewports with software rendering, not physical-phone/FPS evidence. In-app browser bootstrap failed on missing sandboxPolicy metadata; existing Playwright provided the fallback.

Building 01, character/friend animation work, earlier assets, game code and the decision log remain unchanged. No upload/deployment occurred. Suggested next ticket: plain courtyard gateway static Blender/GLB handoff after accepting its concept; do not start automatically.
