# T027 — Everyday gateway editable static model

Owner requested this Blender/GLB handoff following visual acceptance on 2026-10-12. This is treated as source acceptance/model authorization; the resulting model remains pending director acceptance.

Files: everyday_gateway_v01.blend, everyday_gateway_v01.glb, generate_gateway.py, five actual mesh previews, browser import screenshots, original brick texture, reference, provenance, metrics and independent verification scripts. MODEL_FACTS.md records measured sizes/counts.

## Editing and conventions

GatewayRoot is ground-centered. Blender Z-up/front -Y; GLB Y-up/front +Z. Working meters are adjustable authoring scale, not approved lane sizes, historical measurements or an engineering specification.

PiersRoot contains Pier_Left/Pier_Right; StoneRoot contains two footings and two caps; LintelRoot contains Timber_Lintel and Plain_Fasteners. Left/right names refer to negative/positive X. Move LintelRoot to keep its plain bolt-head detail with the timber. Mesh origins stay root-centered; this static source supplies no articulation, rig, collision or runtime movement.

Geometry has two square brick piers and a single straight timber lintel around an open passage. No threshold crosses the opening. Footings make the narrowest clear width; lintel underside sets its clear height. Stone caps/footings and simple metal heads are original visual approximations, not structural fasteners certified for construction.

One original analytic 512px brick-color texture is packed in Blender and embedded in GLB. Four material names follow Building 01/02 conventions. Stone and timber are plain rough materials; fine wear/grain, sculpted individual bricks and stone joints are omitted. Shared conventions do not register shared runtime resources. This is ordinary fictional street furniture, with no ceremonial roof, sacred carvings or authenticity claim.

## Rebuild / check

Tested Blender: 5.2.2 LTS. PREVIEW_ONLY contains the authoring floor/camera/lights; it is excluded from GLB.

~~~powershell
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --factory-startup --python-exit-code 1 --python art-source/gateway_blockout_v01/generate_gateway.py
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --factory-startup --python-exit-code 1 --python art-source/gateway_blockout_v01/verify_export.py
node art-source/gateway_blockout_v01/check_playcanvas.mjs art-source/gateway_blockout_v01
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --factory-startup --python-exit-code 1 --python art-source/gateway_blockout_v01/prepare_handoff.py
~~~

Generator/checker accept -- --out DIRECTORY after the script path. An extracted packet can rebuild using Blender with --python ./generate_gateway.py -- --out ./rebuilt, then ./verify_export.py with the same output option. --skip-renders omits previews. Browser checking needs this repository's PlayCanvas/Playwright and its repository script location. Packaging expects local notes/reference and completed checks; preservation comparisons run when prior building packets are present.

Generation starts a fresh scene and overwrites outputs. Save hand edits as another version or regenerate into a new directory. Manual GLB export: select GatewayRoot/descendants, Selected Objects, +Y Up, no animations/cameras/lights, exclude PREVIEW_ONLY. Update metrics/checks after changes.

## Use and acceptance

Load as a PlayCanvas container with error handling, instantiateRenderEntity and place/scale its returned parent. Ground is GLB Y=0, front +Z. The embedded texture needs no extra image URL. No game path, scene placement or collision is registered.

Compare five mesh previews with the accepted sheet; inspect grounded feet, beam/pier joints, clear opening and profile thickness. Agree street positioning and scale separately. The nine ray tests show an unobstructed sampled passage in source and round-trip geometry; they are not a tested runner clearance/collision rule. Test eventual target phones and camera/lighting before approving performance.

Verified: finite/nondegenerate geometry, eight named meshes, measured passage, grounded root, packed/embedded texture, GLB round-trip bounds and isolated browser import. Desktop/narrow viewport screenshots are software-rendered compatibility evidence, not physical-phone/FPS tests. In-app browser setup failed on missing sandboxPolicy metadata; existing Playwright supplied fallback.

Prior buildings, character/friend animation work, game source and the decision log are unchanged. No upload/deployment occurred. Next art ticket suggested: hanging-light static Blender/GLB kit after its concept acceptance. No next art ticket started.
