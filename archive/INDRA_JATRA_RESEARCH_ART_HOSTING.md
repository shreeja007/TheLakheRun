# Lakhey Run - Festival Research, Story, Art and Hosting Brief

Status: RESEARCH / PROPOSED, except items explicitly marked CONFIRMED
Date: 2026-10-09
Owner: Game Director; ChatGPT: game design/project management; Codex in VS Code: execution

## 1. What we have agreed

- CONFIRMED: Browser-first desktop and mobile game.
- CONFIRMED: Stylized 3D Lakhey Run is the flagship; preserve short high-score runs and small scope.
- CONFIRMED: Codex should also help PRODUCE 3D models and integrate assets, not only program mechanics. The game director reviews artwork.
- CONFIRMED: An available server reportedly has 16 CPU cores and 8 GB RAM; hosting has not yet been configured or tested.
- NOT YET CONFIRMED: Game narrative, exact character designs, portrait/landscape orientation, final 3D engine, level look, and first-release content.

## 2. Cultural research: facts, not fictional game claims

- Nepal Tourism Board describes Indra Jatra / Yenya as an eight-day Newar festival with ceremonial pole raising, evening masked Lakhey dances, drum music, oil-lit shrines, and chariot processions for the Kumari (Living Goddess), Ganesh and Bhairav. It describes the story of Indra descending in human form to search for a plant/herb for his mother.
  Source: https://ntb.gov.np/indra-jatra
- A local report describes Majipa Lakhey as a guardian of children, rather than simply an evil monster; folklore includes a pact to protect children. Stories vary and require community verification before game publication.
  Source: https://english.khabarhub.com/2025/05/494414/
- In a widespread account, Pulu Kisi represents Indra's white elephant searching through Kathmandu for Indra. This is a festival performance, not a literal elephant running through the street.
  Source: https://nepaltraveller.com/sidetrack/pulukisi-the-elephant-that-still-searches-through-kathmandus-streets
- The festive chariot, crowds, and music are confirmed by news reporting on the festival.
  Source: https://apnews.com/article/838cce2a5bf2e8a6745f6d53bd0f6c11

Cultural review rule: Respect living practices and local variants. Involve a Newar cultural practitioner or informed reviewer for Lakhey mask/role, Kumari imagery, ritual details, names, pronunciation, and local references. Do not turn revered participants or sacred practices into obstacles, enemies, or comic collateral damage.

## 3. Story candidates (fiction; none approved yet)

### A. The Guardian's Challenge (RECOMMENDED)
A young festival participant is playfully challenged by Majipa Lakhey: keep moving as the drums build and Kathmandu's streets fill with festival activity. Lakhey is a guardian, not a child-stealing monster. The player runs to earn a personal best; the challenge ends when Lakhey catches up. A 10-15 second optional story setup plus end-of-run feedback is sufficient. This directly fits endless high-score gameplay.

### B. The Parijat Messenger (LATER / EXPERIMENTAL)
A fictional courier is inspired by the Indra/flower legend. Could work as a finite short level or progression mode, but a literal delivery mission clashes with an infinite runner. Do not add to Version 1 without redesigning the core loop.

### C. Pulu Kisi's Search (LATER)
Explore a comical chase or search linked to the festival's white elephant performance. Higher animation and world-design cost than the flagship runner.

## 4. Visual target

Aim for believable STYLIZED realism rather than full photorealism. Prioritize culturally researched proportions, brickwork, carved wooden windows, banners, costumes, warmth of light, sound, and animation. Use a limited, repeatable street kit. Avoid scanning an entire Kathmandu neighborhood or replicating sacred architecture without careful references.

Initial asset kit, once graybox movement is enjoyable:
- 1 straight repeatable road segment with three clear lanes
- 2 facade variants using modular brick walls, door/window trims, roof edges
- 1 recognizable Newar-style wooden window silhouette (verify with reference)
- 1 festival stall, 1 wooden barrier, 1 fabric decoration/flag set
- 1 readable player placeholder -> later designed character
- 1 Lakhey silhouette/mask/cloth placeholder -> later reviewed hero model
- Small audio kit: footfalls, obstacle feedback, approved drum-loop recording

## 5. Codex 3D production workflow

- Author original modular meshes with Blender, including procedural generation via Blender Python for repeated windows, bricks, facades, road segments, and obstacles.
- Save editable source assets (.blend), generator scripts, licensing details for any dependencies, and exported .glb files.
- Integrate GLB assets into the web game, preserving real-world scale, consistent pivot/origin conventions, visible collision boundaries, texture sizes, and LOD/quality requirements.
- Prefer reusable modules and material variations over dozens of one-off meshes.
- Use openly licensed textures and assets only when the terms are verified; possible sources: Poly Haven CC0 and Kenney CC0. Adobe Mixamo allows animations/characters in games, subject to its distribution restrictions.
- Codex-generated 3D meshes are not automatically attractive, culturally accurate, rigged or game-ready. Every hero character, especially Lakhey, needs artistic and cultural review; outsource/custom-art a single hero model if necessary rather than overwhelming the project.

Sources:
- Blender command-line scripting: https://docs.blender.org/manual/en/3.6/advanced/command_line/arguments.html
- PlayCanvas asset formats: https://developer.playcanvas.com/user-manual/assets/supported-formats/
- Poly Haven CC0: https://polyhaven.com/license
- Kenney CC0: https://kenney.nl/support
- Adobe Mixamo FAQ: https://helpx.adobe.com/creative-cloud/faq/mixamo-faq.html

## 6. Technology and quality gate (proposed)

Preferred feasibility candidate: standalone PlayCanvas Engine + TypeScript + Vite in VS Code; Babylon.js remains alternative until a real browser/device test. GLB is the preferred mesh/animation container. Use lightmaps/baked lighting where practical, shared materials, compressed textures and meshes, reusable scene segments, and simple audio.

Provisional targets for testing, not promises: 30 FPS on a chosen midrange Android test device, stable gameplay on a desktop browser, and an initial download preferably well below 30 MB. Measure real loading/transfer and performance before setting formal launch thresholds. PlayCanvas suggests roughly 100-200 draw calls as a low-end mobile target; aim lower where practical.

Official docs:
- https://developer.playcanvas.com/user-manual/engine/standalone/
- https://developer.playcanvas.com/user-manual/optimization/guidelines/
- https://developer.playcanvas.com/user-manual/optimization/texture-compression/

## 7. Hosting plan for the existing server

A 16-core/8-GB server is more than adequate for a modest STATIC single-player web-game MVP if correctly configured. In a client-rendered WebGL game, gameplay rendering happens on the visitors' phones/computers, not on the server GPU/CPU. The server delivers HTML, scripts, textures, sounds and GLBs. Before projecting concurrency or cost, confirm available bandwidth, network speed, storage, location, traffic limits, TLS setup, and expected players.

Initial setup: Vite production build -> static output -> Caddy or Nginx with HTTPS, compression and immutable hashed asset caching. Use a domain/subdomain and preserve a simple rollback path. Optionally add a CDN later based on geography and bandwidth. Add Laravel only if shared leaderboard/auth or game services warrant it; localStorage is enough for the first personal high score.

Security/privacy: no player accounts for MVP. If adding an online leaderboard later, rate-limit requests and assume browser-submitted scores can be forged; protect against spam rather than pretending client-only scores are tamper-proof.

## 8. Proposed implementation order and handoff

M1: Browser/mobile feasibility with placeholder meshes.
M2: Graybox runner fun (auto-run, 3 lanes, jump, collisions, score, retry).
M3: Basic Lakhey chase with culturally appropriate framing.
M4A: Codex creates original street asset kit (editable .blend, scripts, .glb, preview screenshots, source/license manifest).
M4B: Cinematic feel through warm lighting, music, camera motion, simple animations, mobile optimization.
M5: Browser and server deployment, test on real devices.

Model-ticket acceptance gate for M4A: the model must be visually readable from the game camera, tile seamlessly, preserve a safe lane, not obscure obstacles, load on desktop/mobile, and include source/editable files. Reject bulky, poorly licensed or culturally inappropriate assets even if technically usable.

## 9. Outstanding decisions for the Game Director

1. Story framing: Guardian's Challenge or another premise?
2. Graphic style: believable stylized Kathmandu with textured surfaces versus heavy photorealism (the latter conflicts with earlier small-browser-game scope).
3. Mobile portrait or landscape?
4. Choose target midrange phone and acceptable download/loading budget after first test.
5. Identify a reviewer familiar with Newar/Indra Jatra culture before public release.

Bottom line: Research deeply, but implement only one small playable system at a time. Keep a strong story wrapper; do not ship a full story campaign in Version 1.
