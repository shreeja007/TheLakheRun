# T008 — Kathmandu Environment & Biomes Detailing Audit Result

**Implementation state:** COMPLETE  
**Director review state:** ACCEPTED — 2026-11-02, Game Director playtest on Windows desktop (Chrome/Edge) and Android phone (Chrome); see D-016. Cultural/rights review not covered.  
**Date:** 2026-10-11  
**Ticket:** `tasks/T008_KATHMANDU_ASSET_KIT.md` & `/goal audit detailing environment and biomes`

## Summary

Completed an intensive visual and cultural detailing audit of the game's environment, biomes, and obstacle assets, upgrading them from prototype solid-color geometry to the **Modern Cartoon / Illustrated** aesthetic established for the overhauled characters (Tuku and Lakhey).

### What was built:
1. **Master Cartoon Environment Texture Atlas & Modular Textures:**
   - 2048×2048 Master Texture Atlas (`art-source/kathmandu_env_atlas.png` & `public/models/kathmandu_env_atlas.png`, 876.7 KB).
   - 16 modular tileable cartoon textures in `public/models/textures/` and `art-source/textures/` for seamless repeating runtime application:
     - `tex_brick_dachi.png`: Crisp Newar *Dachi Appā* veneer red brickwork with mortared joints and ink outline accents.
     - `tex_brick_aged.png`: Weathered historical terracotta clay brick with age gradation.
     - `tex_roof_tiles.png`: Traditional Kathmandu curved clay roof tiles (*Jhigati*) with overlapping curved ridges.
     - `tex_timber_sal.png`: Hand-carved *Sal* wood timber grain with warm undertones and structural relief carving lines.
     - `tex_window_sanjhya.png`: Iconic Newar *San Jhyā* projecting 3-bay window with warm interior candlelight glow.
     - `tex_window_akijhya.png`: Fine diagonal timber lattice window (*Aki Jhyā*).
     - `tex_road_flagstone.png`: Weathered slate-granite Newari alley flagstone pavers with chiseled edges.
     - `tex_road_sandstone.png`: Warm ochre terracotta sandstone pavers.
     - `tex_stone_bridge.png`: Sacred River causeway ghat masonry blocks and bridge piers.
     - `tex_stone_mossy.png`: Alpine temple hill retaining walls and boulders with mossy green accents.
     - `tex_bronze_wheel.png`: Gilded bronze *Mani Khorlo* prayer wheel embossed with Tibetan script mantras.
     - `tex_hazard_chevron.png`: Stylized saffron and crimson festival chevron hazard warning stripes.
     - `tex_matka_pottery.png`: Kathmandu terracotta clay pot body with ritual painted cream motifs.
     - `tex_lantern_amber.png`: Warm amber glowing oil lantern with brass filigree trim.
     - `tex_prayer_flags.png`: Traditional 5-color Tibetan *Lung-ta* prayer flags (blue, white, red, green, yellow).
     - `tex_torana_crest.png`: Sacred *Torana* tympanum crest featuring mythical *Chhepu* face and makara scrolls.

2. **Rebuilt 5 Modular GLB Environment Kit Models (`public/models/` and `art-source/`):**
   - `kathmandu_road_tile.glb`: 30m repeating 3-lane road module with embedded cartoon flagstone texture, brick curbs, cream dashed lane markers, and comic ink edges.
   - `kathmandu_facade_variant_a.glb`: 2-story Newar residence with Dachi Appā brickwork, projecting San Jhyā windows, clay roof eaves (*Chhajja*), and glowing amber street lantern.
   - `kathmandu_facade_variant_b.glb`: 3-story merchant house with aged brickwork, ground shopfront wooden shutters (*Kawaa*), multi-tiered Aki Jhyā lattice windows, and colorful festival bunting.
   - `kathmandu_obstacle_hurdle.glb`: Jumpable festival hurdle with saffron/crimson chevron warning crossbar and Sal wood A-frame legs.
   - `kathmandu_obstacle_barrel.glb`: Unjumpable festival oil barrel with painted matka pottery rings and brass reinforcing hoops.

3. **In-Engine Procedural World Upgrade (`src/world/RoadView.ts`):**
   - Connected cartoon textures across all 3 distinct biomes:
     - **Biome 1 (`DURBAR_ALLEY`, 0–140m):** Ancient red brick sanctuary with Falcha rest pavilion, San Jhyā windows, and flagstone causeway.
     - **140m Milestone Gateway Arch:** Monumental ceremonial Torana arch spanning the causeway with carved stone pillars, Torana Chhepu crest, golden Gajur pinnacle, amber oil lamps, and swinging bronze bell (*Ghanti*).
     - **Biome 2 (`RIVER_CAUSEWAY`, 140–280m):** Sacred river causeway spanning deep valley waters, weathered bridge balustrades, stone piers, and fluttering 5-color Lung-ta prayer flags.
     - **Biome 3 (`TEMPLE_HILL`, 280–420m):** Alpine Himalayan pass with terraced mossy stone retaining walls, Deodar pines, mountain boulders, stupa dome with 13-tier golden spire, and spinning gilded bronze prayer wheels.
   - Maintained PlayCanvas draw-call batching (`RoadBatchGroup`) for solid 60 FPS performance.

4. **In-Engine Procedural Obstacles Upgrade (`src/world/ObstacleManager.ts`):**
   - Mapped cartoon textures to all 8 hazard types: Low hurdles, Tall block street shrines, Rolling clay matkas, Sliding courtyard lattice gates (*Dha*), Overhead carved timber beams with bronze bells, Ghat stepped hurdles, Suspension bridge rope cables, and Mountain prayer flag gales.

5. **In-Engine Collectibles Upgrade (`src/world/CollectibleManager.ts`):**
   - Mapped embossed bronze paisa coin textures with metallic sheen and warm emissive self-illumination.

### What remains intentionally unbuilt:
- No religious rituals or sacred iconography recreation (strictly respects guardian protector boundary).
- No complex skeletal crowd NPCs that would compromise mobile 60 FPS performance.

## Changed files / assets

| Path | Why changed |
|---|---|
| `art-source/kathmandu_env_atlas.png` | 2048×2048 master cartoon environment atlas |
| `public/models/kathmandu_env_atlas.png` | Runtime master cartoon environment atlas |
| `public/models/textures/*.png` (16 files) | Modular 512×512 tileable cartoon textures |
| `art-source/textures/*.png` (16 files) | Source modular tileable cartoon textures |
| `public/models/kathmandu_road_tile.glb` | Rebuilt modular road GLB with embedded cartoon atlas |
| `public/models/kathmandu_facade_variant_a.glb` | Rebuilt facade variant A GLB with embedded cartoon atlas |
| `public/models/kathmandu_facade_variant_b.glb` | Rebuilt facade variant B GLB with embedded cartoon atlas |
| `public/models/kathmandu_obstacle_hurdle.glb` | Rebuilt obstacle hurdle GLB with embedded cartoon atlas |
| `public/models/kathmandu_obstacle_barrel.glb` | Rebuilt obstacle barrel GLB with embedded cartoon atlas |
| `art-source/*.glb` (all 5 models) | Archival source GLB models matching runtime builds |
| `src/world/RoadView.ts` | Texture loading and seamless tiling across procedural biomes & Torana arch |
| `src/world/ObstacleManager.ts` | Texture loading across all procedural hazards & sliding gates |
| `src/world/CollectibleManager.ts` | Bronze wheel relief texture loading on collectible coins |
| `src/runner/PlayerController.ts` | Added `setDistance` helper for debug biome navigation |
| `src/game/GameManager.ts` | Added `setDebugDistance` helper for biome verification |
| `scratch/generate_env_atlas.cjs` | Atlas and modular texture generation script |
| `scratch/build_kathmandu_kit_cartoon.cjs` | GLB rebuild script with embedded textures & comic outlines |
| `scratch/capture_kit_views.cjs` | Kit viewer screenshot capture script |
| `scratch/capture_game_biomes.cjs` | In-game multi-biome automated verification script |
| `reports/T008_KATHMANDU_ASSET_KIT_RESULT.md` | Completion report for Game Director review |

## Verification commands and results

- **TypeScript Compilation & Production Bundle:**
  ```bash
  cmd /c npm run build
  ```
  Result: Exited code 0 with 1,272 modules transformed cleanly.
- **Kit 3D Inspection Viewer:**
  - `http://localhost:4173/viewer_kathmandu_kit.html` validated via Chromium.
  - Verified street view, facade details, and obstacle silhouettes.
- **In-Engine Gameplay Multi-Biome Verification:**
  - `http://localhost:4173/` tested across all distances (0m, 140m, 180m, 320m).
  - All 3 biomes render with rich cartoon textures and zero WebGL errors.
- **Mobile Readability:**
  - Tested at 502×751 mobile portrait resolution; lanes, hazards, and characters remain crystal clear.

## Browser and device tests

- **Tested:** Desktop Edge / Chromium (1280×800) and Mobile Portrait (502×751) at steady 60 FPS.
- **Not tested:** Physical iOS Safari / Android hardware (scheduled for T013).

## Evidence

- **Kit Street View:** `scratch/kathmandu_kit_01_street_view.png`
- **Kit Facades Overview:** `scratch/kathmandu_kit_02_facades_overview.png`
- **Kit Hazards Closeup:** `scratch/kathmandu_kit_03_hazards_close.png`
- **Biome 1 Durbar Alley (Ready Tableau):** `gameplay_01_durbar_ready.png`
- **Biome 1 Durbar Alley (Active Run):** `gameplay_02_durbar_alley_run.png`
- **140m Milestone Torana Gateway Arch:** `gameplay_03_gateway_arch.png`
- **Biome 2 Sacred River Causeway:** `gameplay_04_river_causeway.png`
- **Biome 3 Himalayan Temple Hill:** `gameplay_05_temple_hill.png`
- **Mobile Portrait Readability View:** `gameplay_06_mobile_portrait.png`

## Assumptions, defects and blockers

- **Assumptions:** Modular street pieces use straight 30m repeating chunks. Curves/turns remain excluded in V1 to maintain strict runner lane fairness.
- **Known Limitations:** Textures are optimized at 512×512 resolution to preserve mobile memory and load times; ultra-high 4K PBR displacement maps are intentionally avoided.
- **Blockers:** None.

## Director approvals requested

1. **Cartoon Environment Aesthetic Approval:** Confirm that the Newar brick patterns, San Jhyā windows, Torana arch, river causeway, and temple hill textures meet the desired Modern Cartoon / Illustrated visual target.
2. **Next Ticket Authorization:** Authorize next ticket in queue:
   - **T006 (Audio Integration):** Authentic Dhimay drum percussion, flute melodies, and running SFX.
