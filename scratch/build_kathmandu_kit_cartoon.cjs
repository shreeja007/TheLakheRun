const fs = require('fs');
const path = require('path');
const { GLBBuilder } = require('./glb_builder.cjs');

// Texture Atlas UV Constants for 16 Cells (2048x2048)
const UV_BRICK_DACHI_APPA = [0.00, 0.00, 0.25, 0.25]; // Row 0, Col 0: Polished red terracotta brick
const UV_BRICK_AGED_CLAY  = [0.25, 0.00, 0.50, 0.25]; // Row 0, Col 1: Aged clay brick with patina
const UV_SAN_JHYA_WINDOW  = [0.50, 0.00, 0.75, 0.25]; // Row 0, Col 2: San Jhyā 3-bay window with candle glow
const UV_AKI_JHYA_LATTICE = [0.75, 0.00, 1.00, 0.25]; // Row 0, Col 3: Aki Jhyā fine lattice screen

const UV_ROOF_TILES       = [0.00, 0.25, 0.25, 0.50]; // Row 1, Col 0: Nepalese clay barrel tiles
const UV_TIMBER_SAL_WOOD  = [0.25, 0.25, 0.50, 0.50]; // Row 1, Col 1: Carved Sal-wood with lotus medallions
const UV_TORANA_CREST     = [0.50, 0.25, 0.75, 0.50]; // Row 1, Col 2: Torana arch with Chhepu & Gajur
const UV_STREET_LANTERN   = [0.75, 0.25, 1.00, 0.50]; // Row 1, Col 3: Amber glass lantern with flame

const UV_FLAGSTONE_ROAD   = [0.00, 0.50, 0.25, 0.75]; // Row 2, Col 0: Weathered slate flagstones
const UV_SANDSTONE_CURB   = [0.25, 0.50, 0.50, 0.75]; // Row 2, Col 1: Terracotta sandstone curbs
const UV_OBSTACLE_CHEVRON = [0.50, 0.50, 0.75, 0.75]; // Row 2, Col 2: Hurdle timber with hazard chevrons
const UV_MATKA_POTTERY    = [0.75, 0.50, 1.00, 0.75]; // Row 2, Col 3: Painted terracotta pot / barrel

const UV_GRANITE_BRIDGE   = [0.00, 0.75, 0.25, 1.00]; // Row 3, Col 0: River bridge granite & lotus balustrades
const UV_MOSSY_STONE      = [0.25, 0.75, 0.50, 1.00]; // Row 3, Col 1: Alpine mossy retaining wall
const UV_BRONZE_WHEEL     = [0.50, 0.75, 0.75, 1.00]; // Row 3, Col 2: Gilded bronze prayer wheel & mantra
const UV_PRAYER_FLAGS     = [0.75, 0.75, 1.00, 1.00]; // Row 3, Col 3: 5-color Tibetan prayer flags & pine needles

const OUTLINE_THICKNESS = 0.008; // 8mm comic book ink outline

function createEnvBuilder() {
  const builder = new GLBBuilder();
  const atlasPath = path.resolve(__dirname, '../art-source/kathmandu_env_atlas.png');
  const atlasBuf = fs.readFileSync(atlasPath);
  const texIdx = builder.addImage(atlasBuf, 'image/png');

  const matCartoon = builder.addMaterial('Mat_KathmanduCartoon', {
    baseColor: [1.0, 1.0, 1.0, 1.0],
    roughness: 0.60,
    metallic: 0.05,
    textureIndex: texIdx
  });

  const matInk = builder.addMaterial('Mat_InkOutline', {
    baseColor: [0.08, 0.08, 0.10, 1.0],
    roughness: 0.95,
    metallic: 0.0,
    doubleSided: false
  });

  const matGoldGlow = builder.addMaterial('Mat_GoldGlow', {
    baseColor: [0.98, 0.80, 0.22, 1.0],
    emissive: [0.55, 0.35, 0.08],
    roughness: 0.35,
    metallic: 0.5
  });

  return { builder, matCartoon, matInk, matGoldGlow };
}

// =============================================================================
// 1. KATHMANDU ROAD TILE (30m x 6.6m repeating section with curb bevels & joints)
// =============================================================================
function buildRoadTileGLB() {
  const { builder, matCartoon, matInk } = createEnvBuilder();
  const { mesh, index: meshIdx } = builder.createMesh('RoadTile_Mesh');
  const roadWidth = 6.0;
  const tileLength = 30.0;

  // Road surface (main flagstone pavement)
  mesh.addBox({
    size: [roadWidth, 0.12, tileLength],
    center: [0, -0.06, -tileLength / 2],
    materialIndex: matCartoon,
    uvBounds: UV_FLAGSTONE_ROAD,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_THICKNESS
  });

  // Left & Right Sandstone Base Curbs
  const curbW = 0.35;
  const curbH = 0.20;
  for (const side of [1, -1]) {
    mesh.addBox({
      size: [curbW, curbH, tileLength],
      center: [side * (roadWidth / 2 + curbW / 2), curbH / 2, -tileLength / 2],
      materialIndex: matCartoon,
      uvBounds: UV_SANDSTONE_CURB,
      outlineMaterialIndex: matInk,
      outlineThickness: OUTLINE_THICKNESS
    });

    // Tiered Sandstone Curb Lip Chamfers
    const curbLipW = 0.12;
    const curbLipH = 0.06;
    mesh.addBox({
      size: [curbLipW, curbLipH, tileLength],
      center: [side * (roadWidth / 2 + curbW - curbLipW / 2), curbH + curbLipH / 2, -tileLength / 2],
      materialIndex: matCartoon,
      uvBounds: UV_SANDSTONE_CURB,
      outlineMaterialIndex: matInk,
      outlineThickness: OUTLINE_THICKNESS * 0.7
    });
  }

  // Transverse Stone Mortar Joints (every 3m along the 30m length)
  const numTransverse = Math.floor(tileLength / 3.0);
  for (let t = 0; t < numTransverse; t++) {
    mesh.addBox({
      size: [roadWidth, 0.006, 0.06],
      center: [0, 0.003, -t * 3.0 - 1.5],
      materialIndex: matCartoon,
      uvBounds: UV_FLAGSTONE_ROAD
    });
  }

  // Dashed Lane Marker Stones (between lanes: X = -1.0 and X = +1.0)
  const dashLen = 2.0;
  const dashGap = 2.0;
  const numDashes = Math.floor(tileLength / (dashLen + dashGap));
  for (let d = 0; d < numDashes; d++) {
    const z = -(d * (dashLen + dashGap) + dashLen / 2);
    for (const lx of [-1.0, 1.0]) {
      mesh.addBox({
        size: [0.10, 0.015, dashLen],
        center: [lx, 0.008, z],
        materialIndex: matCartoon,
        uvBounds: UV_SANDSTONE_CURB
      });
    }
  }

  builder.addNode({ name: 'RoadTile_Root', meshIndex: meshIdx });
  return builder.build();
}

// =============================================================================
// 2. KATHMANDU FACADE VARIANT A (2-Story Dachi Appā House with Tundan Struts & Doorway)
// =============================================================================
function buildFacadeAGLB() {
  const { builder, matCartoon, matInk } = createEnvBuilder();
  const { mesh, index: meshIdx } = builder.createMesh('FacadeA_Mesh');
  const w = 4.5, h = 7.5, d = 14.0;

  // Main Dachi Appā Brick Body
  mesh.addBox({
    size: [w, h, d],
    center: [0, h / 2, 0],
    materialIndex: matCartoon,
    uvBounds: UV_BRICK_DACHI_APPA,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_THICKNESS
  });

  // Carved Sal-Wood Horizontal String Courses (Floor Dividers)
  for (const bandY of [2.8, 5.4]) {
    mesh.addBox({
      size: [w + 0.18, 0.22, d + 0.18],
      center: [0, bandY, 0],
      materialIndex: matCartoon,
      uvBounds: UV_TIMBER_SAL_WOOD,
      outlineMaterialIndex: matInk,
      outlineThickness: OUTLINE_THICKNESS * 0.8
    });
  }

  // Projecting Clay Tile Roof Eave (Chhajja)
  mesh.addBox({
    size: [w + 0.85, 0.45, d + 0.45],
    center: [0, h + 0.225, 0],
    materialIndex: matCartoon,
    uvBounds: UV_ROOF_TILES,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_THICKNESS
  });

  // Traditional Newar Carved Tundan Roof Struts (Supporting Chhajja eave at 35°)
  for (const tz of [-5.2, -1.8, 1.8, 5.2]) {
    mesh.addBox({
      size: [0.12, 0.90, 0.12],
      center: [w / 2 + 0.22, h - 0.20, tz],
      rotation: [0, 0, 32],
      materialIndex: matCartoon,
      uvBounds: UV_TIMBER_SAL_WOOD,
      outlineMaterialIndex: matInk,
      outlineThickness: OUTLINE_THICKNESS * 0.7
    });
  }

  // San Jhyā 3-Bay Carved Wooden Windows on 2nd Floor (Front Facing at X = w/2)
  for (const wz of [-3.5, 3.5]) {
    // Projecting window box
    mesh.addBox({
      size: [0.24, 2.2, 2.8],
      center: [w / 2 + 0.12, h * 0.65, wz],
      materialIndex: matCartoon,
      uvBounds: UV_SAN_JHYA_WINDOW,
      outlineMaterialIndex: matInk,
      outlineThickness: OUTLINE_THICKNESS
    });

    // Upper carved eave hood above window
    mesh.addBox({
      size: [0.45, 0.18, 3.2],
      center: [w / 2 + 0.22, h * 0.65 + 1.18, wz],
      materialIndex: matCartoon,
      uvBounds: UV_ROOF_TILES,
      outlineMaterialIndex: matInk,
      outlineThickness: OUTLINE_THICKNESS * 0.8
    });

    // Projecting Carved Wooden Lower Window Sill
    mesh.addBox({
      size: [0.36, 0.16, 3.0],
      center: [w / 2 + 0.18, h * 0.65 - 1.15, wz],
      materialIndex: matCartoon,
      uvBounds: UV_TIMBER_SAL_WOOD,
      outlineMaterialIndex: matInk,
      outlineThickness: OUTLINE_THICKNESS * 0.7
    });
  }

  // Ground Floor Carved Wooden Doorway (Luhāñ Dha)
  mesh.addBox({
    size: [0.12, 2.3, 1.5],
    center: [w / 2 + 0.06, 1.15, 0],
    materialIndex: matCartoon,
    uvBounds: UV_TIMBER_SAL_WOOD,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_THICKNESS * 0.8
  });
  // Recessed Door Leaf
  mesh.addBox({
    size: [0.08, 2.05, 1.25],
    center: [w / 2 + 0.02, 1.12, 0],
    materialIndex: matCartoon,
    uvBounds: UV_BRICK_AGED_CLAY
  });
  // Stepped Stone Threshold Plinth
  mesh.addBox({
    size: [0.28, 0.15, 1.7],
    center: [w / 2 + 0.14, 0.075, 0],
    materialIndex: matCartoon,
    uvBounds: UV_SANDSTONE_CURB,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_THICKNESS * 0.7
  });

  // Street Lantern Bracket & Hanging Lantern
  mesh.addBox({
    size: [0.14, 2.8, 0.14],
    center: [w / 2 + 0.15, 1.4, 0],
    materialIndex: matCartoon,
    uvBounds: UV_TIMBER_SAL_WOOD
  });
  mesh.addBox({
    size: [0.45, 0.12, 0.12],
    center: [w / 2 + 0.35, 2.7, 0],
    materialIndex: matCartoon,
    uvBounds: UV_TIMBER_SAL_WOOD
  });
  // Glowing Lantern Box
  mesh.addBox({
    size: [0.38, 0.48, 0.38],
    center: [w / 2 + 0.48, 2.45, 0],
    materialIndex: matCartoon,
    uvBounds: UV_STREET_LANTERN,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_THICKNESS * 0.8
  });

  builder.addNode({ name: 'FacadeA_Root', meshIndex: meshIdx });
  return builder.build();
}

// =============================================================================
// 3. KATHMANDU FACADE VARIANT B (3-Story Aged Brick Merchant House with Veranda)
// =============================================================================
function buildFacadeBGLB() {
  const { builder, matCartoon, matInk } = createEnvBuilder();
  const { mesh, index: meshIdx } = builder.createMesh('FacadeB_Mesh');
  const w = 4.5, h = 8.8, d = 14.0;

  // Main Aged Brick Body
  mesh.addBox({
    size: [w, h, d],
    center: [0, h / 2, 0],
    materialIndex: matCartoon,
    uvBounds: UV_BRICK_AGED_CLAY,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_THICKNESS
  });

  // Ground Floor Falcha / Shopfront Veranda (Sal-Wood Lintel)
  mesh.addBox({
    size: [0.35, 0.28, d],
    center: [w / 2 + 0.175, 2.7, 0],
    materialIndex: matCartoon,
    uvBounds: UV_TIMBER_SAL_WOOD,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_THICKNESS * 0.8
  });

  // 4 Veranda Columns along street front
  for (const pz of [-5.0, -1.8, 1.8, 5.0]) {
    mesh.addBox({
      size: [0.22, 2.7, 0.22],
      center: [w / 2 + 0.11, 1.35, pz],
      materialIndex: matCartoon,
      uvBounds: UV_TIMBER_SAL_WOOD,
      outlineMaterialIndex: matInk,
      outlineThickness: OUTLINE_THICKNESS * 0.8
    });
  }

  // Shopfront Veranda Counter Ledge Shelf (Kawaa)
  mesh.addBox({
    size: [0.45, 0.12, d - 1.2],
    center: [w / 2 + 0.15, 0.85, 0],
    materialIndex: matCartoon,
    uvBounds: UV_TIMBER_SAL_WOOD,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_THICKNESS * 0.7
  });

  // Hanging Brass Oil Lamps in Veranda (between pillars)
  for (const lz of [-3.4, 3.4]) {
    mesh.addCylinder({
      radiusTop: 0.06,
      radiusBottom: 0.10,
      height: 0.22,
      segments: 12,
      center: [w / 2 + 0.18, 2.35, lz],
      materialIndex: matCartoon,
      uvBounds: UV_BRONZE_WHEEL,
      outlineMaterialIndex: matInk,
      outlineThickness: OUTLINE_THICKNESS * 0.6
    });
  }

  // 2nd & 3rd Floor Aki Jhyā Lattice Windows
  for (const floorY of [4.5, 7.0]) {
    for (const wz of [-3.8, 0, 3.8]) {
      mesh.addBox({
        size: [0.16, 1.5, 1.6],
        center: [w / 2 + 0.08, floorY, wz],
        materialIndex: matCartoon,
        uvBounds: UV_AKI_JHYA_LATTICE,
        outlineMaterialIndex: matInk,
        outlineThickness: OUTLINE_THICKNESS * 0.8
      });
    }
  }

  // Stepped Clay Tile Roof Eaves
  mesh.addBox({
    size: [w + 0.9, 0.45, d + 0.45],
    center: [0, h + 0.225, 0],
    materialIndex: matCartoon,
    uvBounds: UV_ROOF_TILES,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_THICKNESS
  });

  // Traditional Newar Carved Tundan Roof Struts (Supporting the 3rd-floor Chhajja eave)
  for (const tz of [-5.2, -1.8, 1.8, 5.2]) {
    mesh.addBox({
      size: [0.12, 0.90, 0.12],
      center: [w / 2 + 0.22, h - 0.20, tz],
      rotation: [0, 0, 32],
      materialIndex: matCartoon,
      uvBounds: UV_TIMBER_SAL_WOOD,
      outlineMaterialIndex: matInk,
      outlineThickness: OUTLINE_THICKNESS * 0.7
    });
  }

  // Festival Prayer Flags Line along 1st floor roofline
  mesh.addBox({
    size: [0.08, 0.32, d],
    center: [w / 2 + 0.28, 2.85, 0],
    materialIndex: matCartoon,
    uvBounds: UV_PRAYER_FLAGS
  });

  builder.addNode({ name: 'FacadeB_Root', meshIndex: meshIdx });
  return builder.build();
}

// =============================================================================
// 4. KATHMANDU OBSTACLE HURDLE (Jumpable Festival Hurdle: 0.65m H x 1.8m W x 0.35m D)
// =============================================================================
function buildHurdleGLB() {
  const { builder, matCartoon, matInk } = createEnvBuilder();
  const { mesh, index: meshIdx } = builder.createMesh('Hurdle_Mesh');
  const w = 1.8, h = 0.65, d = 0.35;

  // Left & Right Upright Timber Posts
  for (const side of [1, -1]) {
    mesh.addBox({
      size: [0.16, h, 0.16],
      center: [side * (w / 2 - 0.08), h / 2, 0],
      materialIndex: matCartoon,
      uvBounds: UV_TIMBER_SAL_WOOD,
      outlineMaterialIndex: matInk,
      outlineThickness: OUTLINE_THICKNESS
    });
    // Heavy timber foot block
    mesh.addBox({
      size: [0.24, 0.10, d],
      center: [side * (w / 2 - 0.08), 0.05, 0],
      materialIndex: matCartoon,
      uvBounds: UV_TIMBER_SAL_WOOD,
      outlineMaterialIndex: matInk,
      outlineThickness: OUTLINE_THICKNESS
    });
    // A-Frame Diagonal Support Struts (Front & Back)
    for (const bz of [0.10, -0.10]) {
      mesh.addBox({
        size: [0.08, 0.35, 0.08],
        center: [side * (w / 2 - 0.08), 0.20, bz],
        rotation: [bz > 0 ? 30 : -30, 0, 0],
        materialIndex: matCartoon,
        uvBounds: UV_TIMBER_SAL_WOOD,
        outlineMaterialIndex: matInk,
        outlineThickness: OUTLINE_THICKNESS * 0.7
      });
    }
    // Brass Corner Protector Plates on Crossbar Ends
    mesh.addBox({
      size: [0.08, 0.26, 0.14],
      center: [side * (w / 2 - 0.08), h - 0.14, 0],
      materialIndex: matCartoon,
      uvBounds: UV_BRONZE_WHEEL,
      outlineMaterialIndex: matInk,
      outlineThickness: OUTLINE_THICKNESS * 0.7
    });
  }

  // Main Crossbar with Festival Warning Chevrons & Iron Rivets
  mesh.addBox({
    size: [w - 0.10, 0.24, 0.12],
    center: [0, h - 0.14, 0],
    materialIndex: matCartoon,
    uvBounds: UV_OBSTACLE_CHEVRON,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_THICKNESS
  });

  // Lower Stabilizer Crossbar
  mesh.addBox({
    size: [w - 0.10, 0.12, 0.10],
    center: [0, 0.18, 0],
    materialIndex: matCartoon,
    uvBounds: UV_TIMBER_SAL_WOOD,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_THICKNESS * 0.8
  });

  // Hanging festive marigold festoon ribbon under the crossbar
  mesh.addBox({
    size: [w * 0.75, 0.06, 0.04],
    center: [0, h - 0.28, 0],
    materialIndex: matCartoon,
    uvBounds: UV_MATKA_POTTERY
  });

  builder.addNode({ name: 'Hurdle_Root', meshIndex: meshIdx });
  return builder.build();
}

// =============================================================================
// 5. KATHMANDU OBSTACLE BARREL / POT (Tall Unjumpable Barrier: 1.25m H x 0.88m D)
// =============================================================================
function buildBarrelGLB() {
  const { builder, matCartoon, matInk } = createEnvBuilder();
  const { mesh, index: meshIdx } = builder.createMesh('Barrel_Mesh');
  const h = 1.25;

  // Traditional Painted Terracotta Pot Body (Loft with bulbous middle)
  mesh.addLoft({
    slices: [
      { y: 0.00, rx: 0.34, rz: 0.34 }, // base
      { y: 0.25, rx: 0.44, rz: 0.44 }, // lower swell
      { y: 0.65, rx: 0.48, rz: 0.48 }, // bulbous middle
      { y: 0.95, rx: 0.40, rz: 0.40 }, // shoulder taper
      { y: 1.15, rx: 0.32, rz: 0.32 }, // neck
      { y: 1.25, rx: 0.36, rz: 0.36 }  // rim flare
    ],
    segments: 24,
    capTop: true,
    capBottom: true,
    materialIndex: matCartoon,
    uvBounds: UV_MATKA_POTTERY,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_THICKNESS
  });

  // Burnished Brass Reinforcing Bands (Upper & Lower)
  for (const by of [0.45, 0.85]) {
    mesh.addCylinder({
      radiusTop: 0.49,
      radiusBottom: 0.49,
      height: 0.06,
      segments: 20,
      center: [0, by, 0],
      materialIndex: matCartoon,
      uvBounds: UV_BRONZE_WHEEL,
      outlineMaterialIndex: matInk,
      outlineThickness: OUTLINE_THICKNESS * 0.7
    });
  }

  // Flanged Clay Lid on top
  mesh.addCylinder({
    radiusTop: 0.38,
    radiusBottom: 0.40,
    height: 0.08,
    segments: 20,
    center: [0, h + 0.04, 0],
    materialIndex: matCartoon,
    uvBounds: UV_MATKA_POTTERY,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_THICKNESS
  });

  // Brass Ring Handle on Lid
  mesh.addHorizontalTorus({
    radius: 0.08,
    tube: 0.02,
    radialSegments: 8,
    tubularSegments: 16,
    center: [0, h + 0.12, 0],
    materialIndex: matCartoon,
    uvBounds: UV_BRONZE_WHEEL,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_THICKNESS * 0.6
  });

  // Brass Spigot Tap
  mesh.addCylinder({
    radiusTop: 0.035,
    radiusBottom: 0.035,
    height: 0.16,
    segments: 10,
    center: [0, 0.35, 0.46],
    rotation: [90, 0, 0],
    materialIndex: matCartoon,
    uvBounds: UV_BRONZE_WHEEL,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_THICKNESS * 0.6
  });

  // Heavy Wood Plinth Stand
  mesh.addBox({
    size: [0.85, 0.12, 0.85],
    center: [0, 0.06, 0],
    materialIndex: matCartoon,
    uvBounds: UV_TIMBER_SAL_WOOD,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_THICKNESS
  });

  builder.addNode({ name: 'Barrel_Root', meshIndex: meshIdx });
  return builder.build();
}

function main() {
  console.log('Building Next-Gen Modern Cartoon Kathmandu Modular Environment Kit (GLB)...');

  const pubDir = path.resolve(__dirname, '../public/models');
  const artDir = path.resolve(__dirname, '../art-source');
  const distDir = path.resolve(__dirname, '../dist/models');

  const kitAssets = [
    { name: 'kathmandu_road_tile.glb', fn: buildRoadTileGLB },
    { name: 'kathmandu_facade_variant_a.glb', fn: buildFacadeAGLB },
    { name: 'kathmandu_facade_variant_b.glb', fn: buildFacadeBGLB },
    { name: 'kathmandu_obstacle_hurdle.glb', fn: buildHurdleGLB },
    { name: 'kathmandu_obstacle_barrel.glb', fn: buildBarrelGLB },
  ];

  for (const asset of kitAssets) {
    const glbBuf = asset.fn();
    fs.writeFileSync(path.join(pubDir, asset.name), glbBuf);
    fs.writeFileSync(path.join(artDir, asset.name), glbBuf);
    if (fs.existsSync(distDir)) {
      fs.writeFileSync(path.join(distDir, asset.name), glbBuf);
    }
    console.log(`Generated ${asset.name}: ${(glbBuf.length / 1024).toFixed(1)} KB`);
  }

  console.log('All 5 Kathmandu Environment Kit models generated and synced to public, art-source, and dist!');
}

main();
