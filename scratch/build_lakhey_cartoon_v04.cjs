const fs = require('fs');
const path = require('path');
const { GLBBuilder } = require('./glb_builder.cjs');

function buildModernCartoonLakheyV4() {
  console.log('Building Next-Gen Authentic Modern Cartoon Lakhey Guardian 3D Character (v0.4)...');

  const builder = new GLBBuilder();

  // =========================================================================
  // 1. TEXTURE ATLAS & MATERIALS
  // =========================================================================
  const atlasPath = path.resolve(__dirname, '../art-source/lakhey_cartoon_atlas.png');
  const atlasBuf = fs.readFileSync(atlasPath);
  const texAtlasIdx = builder.addImage(atlasBuf, 'image/png');

  // Main Cartoon Illustrated PBR Material
  const matCartoon = builder.addMaterial('Mat_CartoonAtlas', {
    baseColor: [1.0, 1.0, 1.0, 1.0],
    roughness: 0.50,
    metallic: 0.04,
    textureIndex: texAtlasIdx
  });

  // Dark Charcoal Comic Book Ink Outline (Inverted Hull)
  const matInk = builder.addMaterial('Mat_InkOutline', {
    baseColor: [0.08, 0.08, 0.10, 1.0],
    roughness: 0.95,
    metallic: 0.0,
    doubleSided: false
  });

  // Solid Ivory Material for 3D Projected Guardian Fangs & Pearl Garlands
  const matIvory = builder.addMaterial('Mat_IvoryFangs', {
    baseColor: [1.0, 0.98, 0.92, 1.0],
    roughness: 0.25,
    metallic: 0.0
  });

  // Radiant Burnished Gold for Mukut Crown, Jewelry & Hardware
  const matGoldAccent = builder.addMaterial('Mat_GoldAccent', {
    baseColor: [0.98, 0.76, 0.22, 1.0],
    roughness: 0.28,
    metallic: 0.55
  });

  // Ruby Gemstone for Crown and Medallions
  const matRuby = builder.addMaterial('Mat_RubyGem', {
    baseColor: [0.88, 0.12, 0.24, 1.0],
    emissive: [0.35, 0.02, 0.06],
    roughness: 0.15,
    metallic: 0.1
  });

  // Turquoise Gemstone
  const matTurquoise = builder.addMaterial('Mat_TurquoiseGem', {
    baseColor: [0.05, 0.72, 0.82, 1.0],
    roughness: 0.20,
    metallic: 0.1
  });

  // UV Bounds in the 2048x2048 Atlas:
  const UV_FACE_VISAGE    = [0.05, 0.06, 0.45, 0.48];
  const UV_CROWN          = [0.06, 0.01, 0.44, 0.17];
  const UV_SKIN_RED       = [0.02, 0.35, 0.08, 0.45]; // Solid red terracotta

  const UV_ROBE_FABRIC    = [0.50, 0.00, 1.00, 0.36]; // Crimson silk pleats
  const UV_SKIRT_HEM      = [0.50, 0.37, 1.00, 0.50]; // Gold brocade border (Kinari)
  const UV_SASH           = [0.69, 0.02, 0.82, 0.36]; // Embroidered pendant sash

  const UV_MANE           = [0.01, 0.51, 0.30, 0.99]; // Billowing lion mane hair
  const UV_BOOT_LEATHER   = [0.33, 0.53, 0.48, 0.73]; // Boot upper leather
  const UV_BOOT_TOE       = [0.33, 0.76, 0.48, 0.86]; // Upturned curled toe cap
  const UV_BOOT_BELLS     = [0.33, 0.89, 0.48, 0.97]; // Ankle bells & cuff

  const UV_YOKE           = [0.51, 0.51, 0.80, 0.74]; // Golden sunburst yoke collar
  const UV_BELT           = [0.51, 0.75, 0.80, 0.85]; // Gold belt band
  const UV_MEDALLION      = [0.61, 0.76, 0.70, 0.84]; // Central jewel medallion
  const UV_RIBBON_YELLOW  = [0.81, 0.51, 0.85, 0.76]; // Saffron yellow streamer
  const UV_RIBBON_BLUE    = [0.85, 0.51, 0.90, 0.76]; // Peacock blue streamer
  const UV_RIBBON_PINK    = [0.90, 0.51, 0.95, 0.76]; // Festival pink streamer
  const UV_RIBBON_GREEN   = [0.95, 0.51, 1.00, 0.76]; // Emerald green streamer
  const UV_CHAMARA_HANDLE = [0.51, 0.86, 0.72, 0.94]; // Turned brass handle
  const UV_CHAMARA_PLUME  = [0.72, 0.86, 1.00, 1.00]; // Silken yak hair plume

  const OUTLINE_BODY = 0.0075; // 7.5mm imposing body outline
  const OUTLINE_DETAIL = 0.0045; // 4.5mm delicate outline for ornaments

  // =========================================================================
  // 2. TORSO MESH (Pivot at [0, 1.15, 0])
  // Imposing silhouette: Authentically Fluted Pleated Jama Skirt + Athletic Chest + Royal Yoke
  // =========================================================================
  const { mesh: torsoMesh, index: torsoMeshIdx } = builder.createMesh('Torso_Mesh');

  // A. Authentically Fluted Pleated Jama Skirt (64 segments, 16 3D pleat folds!)
  // In real Lakhey Nach, 24 meters of pleated fabric flutes out dramatically!
  torsoMesh.addLoft({
    slices: [
      { y: -0.52, rx: 0.58, rz: 0.40, pleatCount: 16, pleatDepth: 0.026 }, // Broad flared hem
      { y: -0.42, rx: 0.52, rz: 0.36, pleatCount: 16, pleatDepth: 0.022 }, // Lower brocade band
      { y: -0.28, rx: 0.44, rz: 0.31, pleatCount: 16, pleatDepth: 0.016 }, // Mid flare
      { y: -0.14, rx: 0.38, rz: 0.27, pleatCount: 16, pleatDepth: 0.010 }, // Upper flare
      { y: -0.02, rx: 0.34, rz: 0.25 }, // Under-belt drape
      { y:  0.05, rx: 0.32, rz: 0.24 }  // Waist transition
    ],
    segments: 64,
    capBottom: true,
    materialIndex: matCartoon,
    uvBounds: UV_ROBE_FABRIC,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });

  // Skirt Hem Border Band (Kinari) following the exact 16 pleats
  torsoMesh.addLoft({
    slices: [
      { y: -0.525, rx: 0.585, rz: 0.405, pleatCount: 16, pleatDepth: 0.026 },
      { y: -0.420, rx: 0.525, rz: 0.365, pleatCount: 16, pleatDepth: 0.022 }
    ],
    segments: 64,
    materialIndex: matCartoon,
    uvBounds: UV_SKIRT_HEM,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY * 0.7
  });

  // Lower Hem Scallop Trim Ring (Gold piping at bottom edge)
  torsoMesh.addLoft({
    slices: [
      { y: -0.535, rx: 0.588, rz: 0.408, pleatCount: 16, pleatDepth: 0.026 },
      { y: -0.520, rx: 0.588, rz: 0.408, pleatCount: 16, pleatDepth: 0.026 }
    ],
    segments: 64,
    materialIndex: matGoldAccent,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });

  // B. Ceremonial Multi-Layer Belt (Kamarbandh)
  torsoMesh.addLoft({
    slices: [
      { y: -0.055, rx: 0.355, rz: 0.255 },
      { y:  0.040, rx: 0.355, rz: 0.255 }
    ],
    segments: 24,
    materialIndex: matCartoon,
    uvBounds: UV_BELT,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });

  // Gold Trim Piping on Top and Bottom of Belt
  torsoMesh.addHorizontalTorus({
    radius: 0.355,
    tube: 0.012,
    radialSegments: 8,
    tubularSegments: 24,
    center: [0, -0.05, 0],
    scale: [1.0, 1.0, 0.72],
    materialIndex: matGoldAccent
  });
  torsoMesh.addHorizontalTorus({
    radius: 0.355,
    tube: 0.012,
    radialSegments: 8,
    tubularSegments: 24,
    center: [0, 0.038, 0],
    scale: [1.0, 1.0, 0.72],
    materialIndex: matGoldAccent
  });

  // Central Sunburst Medallion at front of belt
  torsoMesh.addCylinder({
    radiusTop: 0.095,
    radiusBottom: 0.095,
    height: 0.035,
    segments: 20,
    rotation: [90, 0, 0],
    center: [0, 0.00, -0.265],
    materialIndex: matCartoon,
    uvBounds: UV_MEDALLION,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });
  // Center Ruby Jewel in Medallion
  torsoMesh.addSphere({
    radius: 0.032,
    widthSegments: 10,
    heightSegments: 8,
    center: [0, 0.00, -0.285],
    materialIndex: matRuby
  });

  // Vertical Embroidered Sash Panel (Patuka) hanging down front of skirt
  torsoMesh.addBox({
    size: [0.24, 0.50, 0.02],
    center: [0, -0.25, -0.325],
    materialIndex: matCartoon,
    uvBounds: UV_SASH,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });

  // Golden Fringe Tassels at bottom of sash
  torsoMesh.addBox({
    size: [0.25, 0.04, 0.024],
    center: [0, -0.51, -0.325],
    materialIndex: matGoldAccent,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });

  // C. Athletic Upper Chest & Tunic Loft (V-Taper)
  torsoMesh.addLoft({
    slices: [
      { y: 0.02, rx: 0.32, rz: 0.24 },
      { y: 0.16, rx: 0.36, rz: 0.26 },
      { y: 0.32, rx: 0.42, rz: 0.28 },
      { y: 0.46, rx: 0.46, rz: 0.27 },
      { y: 0.54, rx: 0.44, rz: 0.25 }
    ],
    segments: 24,
    materialIndex: matCartoon,
    uvBounds: UV_ROBE_FABRIC,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });

  // D. Royal Sunburst Yoke Breastplate (Galbandi Collar)
  // Sculpted curved breastplate conforming to the chest
  torsoMesh.addLoft({
    slices: [
      { y: 0.18, rx: 0.16, rz: 0.02, cx: 0, cz: -0.275 },
      { y: 0.32, rx: 0.22, rz: 0.02, cx: 0, cz: -0.280 },
      { y: 0.46, rx: 0.24, rz: 0.02, cx: 0, cz: -0.270 },
      { y: 0.52, rx: 0.20, rz: 0.02, cx: 0, cz: -0.250 }
    ],
    segments: 16,
    capTop: true,
    capBottom: true,
    materialIndex: matCartoon,
    uvBounds: UV_YOKE,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });

  // Golden Collar Ring wrapping neck opening
  torsoMesh.addCylinder({
    radiusTop: 0.18,
    radiusBottom: 0.21,
    height: 0.045,
    segments: 20,
    center: [0, 0.53, -0.04],
    materialIndex: matGoldAccent,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });

  // Beaded Pearl Garland Necklaces (Moti Mala) crossing chest in festoons
  const garlandPoints = [
    [-0.14, 0.44, -0.285],
    [-0.09, 0.37, -0.295],
    [ 0.00, 0.33, -0.300],
    [ 0.09, 0.37, -0.295],
    [ 0.14, 0.44, -0.285]
  ];
  for (const pt of garlandPoints) {
    torsoMesh.addSphere({
      radius: 0.016,
      widthSegments: 8,
      heightSegments: 6,
      center: pt,
      materialIndex: matIvory,
      outlineMaterialIndex: matInk,
      outlineThickness: OUTLINE_DETAIL * 0.5
    });
  }

  // Second lower pearl festoon
  const garlandPoints2 = [
    [-0.18, 0.46, -0.280],
    [-0.12, 0.31, -0.290],
    [ 0.00, 0.26, -0.295],
    [ 0.12, 0.31, -0.290],
    [ 0.18, 0.46, -0.280]
  ];
  for (const pt of garlandPoints2) {
    torsoMesh.addSphere({
      radius: 0.014,
      widthSegments: 8,
      heightSegments: 6,
      center: pt,
      materialIndex: matIvory,
      outlineMaterialIndex: matInk,
      outlineThickness: OUTLINE_DETAIL * 0.5
    });
  }

  // Center Gold Rosette Brooch on Breastplate
  torsoMesh.addSphere({
    radius: 0.026,
    widthSegments: 10,
    heightSegments: 8,
    center: [0, 0.33, -0.305],
    materialIndex: matGoldAccent
  });
  torsoMesh.addSphere({
    radius: 0.012,
    widthSegments: 8,
    heightSegments: 6,
    center: [0, 0.33, -0.320],
    materialIndex: matRuby
  });

  // E. Layered Gold Epaulet Pauldrons (Left & Right)
  for (const side of [1, -1]) {
    // Top Pauldron Shell
    torsoMesh.addSphere({
      radius: 0.14,
      widthSegments: 12,
      heightSegments: 8,
      scale: [1.15, 0.70, 1.15],
      center: [side * 0.44, 0.48, 0],
      materialIndex: matGoldAccent,
      outlineMaterialIndex: matInk,
      outlineThickness: OUTLINE_BODY
    });
    // Lower Brocade Mantle Tier
    torsoMesh.addSphere({
      radius: 0.12,
      widthSegments: 10,
      heightSegments: 6,
      scale: [1.10, 0.60, 1.10],
      center: [side * 0.44, 0.43, 0],
      materialIndex: matCartoon,
      uvBounds: UV_SKIRT_HEM,
      outlineMaterialIndex: matInk,
      outlineThickness: OUTLINE_DETAIL
    });
  }

  // =========================================================================
  // 3. HEAD MESH (Pivot at [0, 1.88, 0])
  // Theatrical Guardian Visage: Curved Face Mask Slice, Sculpted Brow Wings,
  // 3D Mukut Spire Flames, Sculpted Third Eye Flame, Ivory Fangs.
  // =========================================================================
  const { mesh: headMesh, index: headMeshIdx } = builder.createMesh('Head_Mesh');

  // A. Neck Loft
  headMesh.addLoft({
    slices: [
      { y: -0.16, rx: 0.13, rz: 0.12, cz: -0.04 },
      { y: -0.08, rx: 0.12, rz: 0.11, cz: -0.04 },
      { y:  0.00, rx: 0.12, rz: 0.11, cz: -0.04 }
    ],
    segments: 16,
    materialIndex: matCartoon,
    uvBounds: UV_SKIN_RED,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });

  // B. Head Cranium Foundation (Solid Terracotta Red Tone)
  headMesh.addLoft({
    slices: [
      { y: -0.08, rx: 0.14, rz: 0.14, cz: -0.06 }, // Chin foundation
      { y:  0.04, rx: 0.18, rz: 0.17, cz: -0.06 }, // Jawline
      { y:  0.14, rx: 0.20, rz: 0.19, cz: -0.06 }, // Temples & cheeks
      { y:  0.24, rx: 0.20, rz: 0.19, cz: -0.06 }, // Forehead
      { y:  0.34, rx: 0.17, rz: 0.16, cz: -0.05 }, // Crown base
      { y:  0.42, rx: 0.10, rz: 0.10, cz: -0.05 }  // Top
    ],
    segments: 22,
    capTop: true,
    capBottom: true,
    materialIndex: matCartoon,
    uvBounds: UV_SKIN_RED,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });

  // C. Front Theatrical Guardian Mask Slice (Exact Mathematical Calibration)
  const maskSlices = [
    { y: -0.08, rx: 0.145, rz: 0.145, cz: -0.08 }, // Chin & beard tip
    { y: -0.02, rx: 0.170, rz: 0.165, cz: -0.07 }, // Lower jaw & fangs
    { y:  0.06, rx: 0.195, rz: 0.185, cz: -0.06 }, // Open festive mouth
    { y:  0.14, rx: 0.215, rz: 0.205, cz: -0.06 }, // Almond eyes & nose
    { y:  0.22, rx: 0.215, rz: 0.205, cz: -0.06 }, // Third eye & eyebrows
    { y:  0.30, rx: 0.195, rz: 0.185, cz: -0.06 }, // Mukut crown base
    { y:  0.42, rx: 0.155, rz: 0.145, cz: -0.05 }  // Mukut crown top
  ];

  const maskSegs = 20;
  const maskPos = [];
  const maskNorm = [];
  const maskUvs = [];
  const maskIdx = [];

  for (let s = 0; s < maskSlices.length; s++) {
    const sl = maskSlices[s];
    const y = sl.y;
    const rx = sl.rx;
    const rz = sl.rz + 0.005; // 5mm offset prevents z-fighting with skull
    const cz = sl.cz || 0;

    for (let i = 0; i <= maskSegs; i++) {
      const theta = ((i / maskSegs) - 0.5) * Math.PI * 0.96;
      const x = Math.sin(theta) * rx;
      const z = cz - Math.cos(theta) * rz;

      maskPos.push(x, y, z);

      const nx = Math.sin(theta);
      const ny = 0.05;
      const nz = -Math.cos(theta);
      maskNorm.push(nx, ny, nz);

      // Mathematically calibrated to Quadrant 1
      const u = 0.250 + x * 0.54;
      const v = 0.268 - (y - 0.14) * 0.50;
      maskUvs.push(Math.max(0.01, Math.min(0.49, u)), Math.max(0.01, Math.min(0.49, v)));
    }
  }

  for (let s = 0; s < maskSlices.length - 1; s++) {
    for (let i = 0; i < maskSegs; i++) {
      const v0 = s * (maskSegs + 1) + i;
      const v1 = s * (maskSegs + 1) + (i + 1);
      const v2 = (s + 1) * (maskSegs + 1) + i;
      const v3 = (s + 1) * (maskSegs + 1) + (i + 1);

      maskIdx.push(v0, v2, v1);
      maskIdx.push(v1, v2, v3);
    }
  }
  headMesh.addGeometry(matCartoon, maskPos, maskNorm, maskIdx, {}, maskUvs);

  // D. Sculpted 3D Eyebrow Wings (Bhrikuti)
  // Dynamic calligraphic wings projecting forward above the eyes!
  for (const side of [1, -1]) {
    headMesh.addBox({
      size: [0.12, 0.035, 0.035],
      center: [side * 0.12, 0.20, -0.245],
      rotation: [-14, 0, -side * 18],
      materialIndex: matInk,
      outlineMaterialIndex: matGoldAccent,
      outlineThickness: OUTLINE_DETAIL * 0.7
    });
  }

  // E. Sculpted Third Eye Golden Halo Flame (Trinetra)
  headMesh.addCone({
    radius: 0.035,
    height: 0.09,
    segments: 10,
    center: [0, 0.24, -0.245],
    rotation: [-18, 0, 0],
    materialIndex: matGoldAccent,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });
  headMesh.addSphere({
    radius: 0.016,
    widthSegments: 8,
    heightSegments: 6,
    center: [0, 0.22, -0.255],
    materialIndex: matRuby
  });

  // F. 3D Golden Mukut (Crown / Crest) Tiered Pagoda Spire
  // Center Grand Flame Peak (Highest, majestic pagoda spire)
  headMesh.addCone({
    radius: 0.070,
    height: 0.28,
    segments: 12,
    center: [0, 0.44, -0.21],
    rotation: [-12, 0, 0],
    materialIndex: matGoldAccent,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });
  // Center Ruby Cabochon atop Crown
  headMesh.addSphere({
    radius: 0.028,
    widthSegments: 10,
    heightSegments: 8,
    center: [0, 0.36, -0.235],
    materialIndex: matRuby
  });

  // Left & Right Symmetrical Flame Spire Peaks
  for (const side of [1, -1]) {
    headMesh.addCone({
      radius: 0.050,
      height: 0.20,
      segments: 10,
      center: [side * 0.12, 0.39, -0.19],
      rotation: [-10, 0, -side * 20],
      materialIndex: matGoldAccent,
      outlineMaterialIndex: matInk,
      outlineThickness: OUTLINE_DETAIL
    });
    // Turquoise Gem on Side Spire
    headMesh.addSphere({
      radius: 0.018,
      widthSegments: 8,
      heightSegments: 6,
      center: [side * 0.12, 0.34, -0.215],
      materialIndex: matTurquoise
    });
  }

  // Crown Base Golden Filigree Arch Band
  headMesh.addBox({
    size: [0.38, 0.055, 0.045],
    center: [0, 0.30, -0.205],
    rotation: [-8, 0, 0],
    materialIndex: matGoldAccent,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });

  // Pearl Garland Row along bottom of crown
  for (let px = -0.15; px <= 0.15; px += 0.038) {
    headMesh.addSphere({
      radius: 0.012,
      widthSegments: 8,
      heightSegments: 6,
      center: [px, 0.28, -0.225],
      materialIndex: matIvory
    });
  }

  // G. 3D Projected Ivory Guardian Fangs (Aligned with Texture Corners)
  for (const side of [1, -1]) {
    headMesh.addCone({
      radius: 0.034,
      height: 0.13,
      segments: 10,
      center: [side * 0.13, 0.00, -0.265],
      rotation: [168, 0, side * 18],
      materialIndex: matIvory,
      outlineMaterialIndex: matInk,
      outlineThickness: OUTLINE_DETAIL
    });
  }

  // H. Sculpted Chin Beard Flame Tuft (3D accent hugging lower jaw)
  headMesh.addCone({
    radius: 0.065,
    height: 0.16,
    segments: 10,
    center: [0, -0.10, -0.20],
    rotation: [35, 0, 0],
    materialIndex: matInk,
    outlineMaterialIndex: matGoldAccent,
    outlineThickness: OUTLINE_DETAIL * 0.7
  });

  // =========================================================================
  // 4. MANE MESH (Pivot at [0, 2.00, 0.10])
  // Voluminous Wild Lion / Yak-Tail Mane (*Chamara*) billowing dynamically
  // into the air with sweeping flame tufts, fanning out laterally and backward!
  // =========================================================================
  const { mesh: maneMesh, index: maneMeshIdx } = builder.createMesh('Mane_Mesh');

  // A. Mane Crown Base Volume (Z center at +0.20, strictly behind forehead)
  maneMesh.addSphere({
    radius: 0.34,
    widthSegments: 16,
    heightSegments: 12,
    scale: [1.25, 1.15, 0.95],
    center: [0, 0.20, 0.20],
    materialIndex: matCartoon,
    uvBounds: UV_MANE,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });

  // B. Dynamic Sweeping Flame Locks Billowing Upward & Backward!
  // High Center Billowing Lock (Sweeping back into the wind)
  maneMesh.addCone({
    radius: 0.14,
    height: 0.48,
    segments: 12,
    center: [0, 0.42, 0.26],
    rotation: [-42, 0, 0], // Sweeping back at 42 degrees
    materialIndex: matCartoon,
    uvBounds: UV_MANE,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });

  // Upper Left & Right Symmetrical Billowing Flame Locks
  for (const side of [1, -1]) {
    maneMesh.addCone({
      radius: 0.13,
      height: 0.44,
      segments: 10,
      center: [side * 0.24, 0.38, 0.24],
      rotation: [-36, 0, -side * 32],
      materialIndex: matCartoon,
      uvBounds: UV_MANE,
      outlineMaterialIndex: matInk,
      outlineThickness: OUTLINE_BODY
    });
  }

  // C. Flared Lateral Crest Tufts (Left & Right) fanning outward past ears
  for (const side of [1, -1]) {
    // Upper Lateral Tuft
    maneMesh.addCone({
      radius: 0.12,
      height: 0.42,
      segments: 10,
      center: [side * 0.36, 0.20, 0.14],
      rotation: [-18, 0, -side * 36],
      materialIndex: matCartoon,
      uvBounds: UV_MANE,
      outlineMaterialIndex: matInk,
      outlineThickness: OUTLINE_BODY
    });
    // Mid Lateral Tuft (flaring past cheeks)
    maneMesh.addCone({
      radius: 0.11,
      height: 0.38,
      segments: 10,
      center: [side * 0.40, 0.00, 0.12],
      rotation: [-8, 0, -side * 28],
      materialIndex: matCartoon,
      uvBounds: UV_MANE,
      outlineMaterialIndex: matInk,
      outlineThickness: OUTLINE_BODY
    });
  }

  // D. Cascading Back Hair Tiers (Layered flowing locks down spine)
  // Upper Back Tier
  maneMesh.addLoft({
    slices: [
      { y:  0.15, rx: 0.44, rz: 0.18, cz: 0.20, pleatCount: 8, pleatDepth: 0.022 },
      { y:  0.00, rx: 0.50, rz: 0.20, cz: 0.24, pleatCount: 8, pleatDepth: 0.024 },
      { y: -0.16, rx: 0.48, rz: 0.19, cz: 0.26, pleatCount: 8, pleatDepth: 0.022 }
    ],
    segments: 32,
    materialIndex: matCartoon,
    uvBounds: UV_MANE,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });

  // Mid Back Tier
  maneMesh.addLoft({
    slices: [
      { y: -0.15, rx: 0.46, rz: 0.18, cz: 0.26, pleatCount: 6, pleatDepth: 0.020 },
      { y: -0.32, rx: 0.42, rz: 0.16, cz: 0.28, pleatCount: 6, pleatDepth: 0.018 },
      { y: -0.48, rx: 0.36, rz: 0.14, cz: 0.30, pleatCount: 6, pleatDepth: 0.016 }
    ],
    segments: 32,
    materialIndex: matCartoon,
    uvBounds: UV_MANE,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });

  // Lower Back Tier (Tapering to waist)
  maneMesh.addLoft({
    slices: [
      { y: -0.46, rx: 0.34, rz: 0.13, cz: 0.30, pleatCount: 4, pleatDepth: 0.014 },
      { y: -0.62, rx: 0.26, rz: 0.10, cz: 0.32, pleatCount: 4, pleatDepth: 0.012 },
      { y: -0.76, rx: 0.14, rz: 0.06, cz: 0.34, pleatCount: 4, pleatDepth: 0.010 }
    ],
    segments: 32,
    capBottom: true,
    materialIndex: matCartoon,
    uvBounds: UV_MANE,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });

  // Sculpted 3D Billowing Hair Lock Tufts along spine / back
  for (let bi = 0; bi < 3; bi++) {
    const by = -0.05 - bi * 0.22;
    const bz = 0.36 + bi * 0.04;
    maneMesh.addCone({
      radius: 0.09 - bi * 0.015,
      height: 0.32 - bi * 0.04,
      segments: 8,
      center: [0, by, bz],
      rotation: [45, 0, 0],
      materialIndex: matCartoon,
      uvBounds: UV_MANE,
      outlineMaterialIndex: matInk,
      outlineThickness: OUTLINE_BODY
    });
    // Left & Right flanking locks
    for (const side of [1, -1]) {
      maneMesh.addCone({
        radius: 0.08 - bi * 0.015,
        height: 0.28 - bi * 0.04,
        segments: 8,
        center: [side * 0.22, by, bz - 0.04],
        rotation: [40, 0, side * 25],
        materialIndex: matCartoon,
        uvBounds: UV_MANE,
        outlineMaterialIndex: matInk,
        outlineThickness: OUTLINE_BODY
      });
    }
  }

  // E. Front Shoulder Tresses (Left & Right) cascading past neck
  for (const side of [1, -1]) {
    maneMesh.addCapsule({
      radius: 0.085,
      height: 0.54,
      segments: 10,
      rings: 4,
      center: [side * 0.30, -0.18, -0.05],
      rotation: [14, -side * 8, 0],
      materialIndex: matCartoon,
      uvBounds: UV_MANE,
      outlineMaterialIndex: matInk,
      outlineThickness: OUTLINE_BODY
    });
  }

  // =========================================================================
  // 5. LEFT ARM HIERARCHY
  // LeftArmRoot (X = 0.46, Y = 1.76, Z = 0)
  //   └── LeftElbowRoot (Y = -0.34)
  // =========================================================================
  const { mesh: leftArmMesh, index: leftArmMeshIdx } = builder.createMesh('LeftArm_Mesh');

  // Deltoid Shoulder Joint Dome (Gapless articulation)
  leftArmMesh.addSphere({
    radius: 0.13,
    widthSegments: 12,
    heightSegments: 8,
    center: [0, 0, 0],
    materialIndex: matCartoon,
    uvBounds: UV_ROBE_FABRIC,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });

  // Upper Arm Sleeve Loft
  leftArmMesh.addLoft({
    slices: [
      { y:  0.00, rx: 0.125, rz: 0.125 },
      { y: -0.16, rx: 0.118, rz: 0.118 },
      { y: -0.34, rx: 0.110, rz: 0.110 }
    ],
    segments: 16,
    materialIndex: matCartoon,
    uvBounds: UV_ROBE_FABRIC,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });

  const { mesh: leftElbowMesh, index: leftElbowMeshIdx } = builder.createMesh('LeftElbow_Mesh');

  leftElbowMesh.addSphere({
    radius: 0.11,
    widthSegments: 10,
    heightSegments: 6,
    center: [0, 0, 0],
    materialIndex: matCartoon,
    uvBounds: UV_ROBE_FABRIC,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });

  leftElbowMesh.addLoft({
    slices: [
      { y:  0.00, rx: 0.108, rz: 0.108 },
      { y: -0.15, rx: 0.102, rz: 0.102 },
      { y: -0.26, rx: 0.098, rz: 0.098 }
    ],
    segments: 16,
    materialIndex: matCartoon,
    uvBounds: UV_ROBE_FABRIC,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });

  // Golden Wrist Cuff (Flared with gemstone studs)
  leftElbowMesh.addCylinder({
    radiusTop: 0.115,
    radiusBottom: 0.120,
    height: 0.095,
    segments: 18,
    center: [0, -0.28, 0],
    materialIndex: matGoldAccent,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });

  // Dynamic Fluttering 3D Ribbon Streamers (Saffron, Blue, Pink, Green)
  // Each ribbon is an authentic S-curved 3D loft fluttering dynamically!
  const ribbonStyles = [
    { uv: UV_RIBBON_YELLOW, xBase:  0.07, zBase:  0.06, curveX:  0.06, curveZ:  0.08 },
    { uv: UV_RIBBON_BLUE,   xBase:  0.07, zBase: -0.06, curveX:  0.08, curveZ: -0.06 },
    { uv: UV_RIBBON_PINK,   xBase: -0.07, zBase:  0.06, curveX: -0.06, curveZ:  0.07 },
    { uv: UV_RIBBON_GREEN,  xBase: -0.07, zBase: -0.06, curveX: -0.07, curveZ: -0.08 },
  ];

  for (const rib of ribbonStyles) {
    leftElbowMesh.addLoft({
      slices: [
        { y: -0.28, rx: 0.024, rz: 0.004, cx: rib.xBase, cz: rib.zBase },
        { y: -0.38, rx: 0.023, rz: 0.004, cx: rib.xBase + rib.curveX * 0.5, cz: rib.zBase + rib.curveZ * 0.5 },
        { y: -0.48, rx: 0.022, rz: 0.004, cx: rib.xBase + rib.curveX, cz: rib.zBase + rib.curveZ },
        { y: -0.58, rx: 0.018, rz: 0.003, cx: rib.xBase + rib.curveX * 1.3, cz: rib.zBase + rib.curveZ * 1.4 }
      ],
      segments: 8,
      materialIndex: matCartoon,
      uvBounds: rib.uv,
      outlineMaterialIndex: matInk,
      outlineThickness: OUTLINE_DETAIL
    });
  }

  // =========================================================================
  // LEFT HAND: EXPRESSIVE MAJESTIC OPEN GUARDIAN CLAW (MUDRA REACH)
  // Traditional Newar Majipa Lakhey: Fierce arched claw fingers & golden talons
  // =========================================================================
  // 1. Lofted Tapered Muscular Palm Base
  leftElbowMesh.addLoft({
    slices: [
      { y: -0.28, rx: 0.058, rz: 0.044, cz: 0 },
      { y: -0.33, rx: 0.062, rz: 0.046, cz: -0.005 },
      { y: -0.38, rx: 0.066, rz: 0.044, cz: -0.010 }
    ],
    segments: 14,
    materialIndex: matCartoon,
    uvBounds: UV_SKIN_RED,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });

  // 2. Muscular Palm Heel Pads (Thenar & Hypothenar Cushions)
  leftElbowMesh.addSphere({
    radius: 0.026,
    scale: [1.0, 1.25, 0.8],
    center: [0.028, -0.34, 0.016],
    materialIndex: matCartoon,
    uvBounds: UV_SKIN_RED
  });
  leftElbowMesh.addSphere({
    radius: 0.024,
    scale: [1.0, 1.25, 0.8],
    center: [-0.028, -0.34, 0.016],
    materialIndex: matCartoon,
    uvBounds: UV_SKIN_RED
  });

  // 3. Four Arched Splayed Claw Fingers (Index, Middle, Ring, Pinky)
  // Fingers splay outward dynamically with forward claw arc!
  const leftFingers = [
    { name: 'Index',  x:  0.038, yBase: -0.38, zBase: -0.012, rotX: 24, rotZ: -12, len: 0.052, clawLen: 0.032 },
    { name: 'Middle', x:  0.012, yBase: -0.38, zBase: -0.016, rotX: 28, rotZ:  -3, len: 0.060, clawLen: 0.036 },
    { name: 'Ring',   x: -0.014, yBase: -0.38, zBase: -0.014, rotX: 25, rotZ:   6, len: 0.054, clawLen: 0.033 },
    { name: 'Pinky',  x: -0.038, yBase: -0.38, zBase: -0.008, rotX: 20, rotZ:  16, len: 0.044, clawLen: 0.028 },
  ];

  for (const f of leftFingers) {
    // Knuckle dome
    leftElbowMesh.addSphere({
      radius: 0.015,
      center: [f.x, f.yBase, f.zBase],
      materialIndex: matCartoon,
      uvBounds: UV_SKIN_RED,
      outlineMaterialIndex: matInk,
      outlineThickness: OUTLINE_DETAIL
    });

    // Proximal Phalanx (curling forward and down)
    const midX = f.x + Math.sin(f.rotZ * Math.PI / 180) * f.len * 0.5;
    const midY = f.yBase - Math.cos(f.rotX * Math.PI / 180) * f.len * 0.5;
    const midZ = f.zBase - Math.sin(f.rotX * Math.PI / 180) * f.len * 0.5;

    leftElbowMesh.addCylinder({
      radiusTop: 0.013,
      radiusBottom: 0.011,
      height: f.len,
      segments: 10,
      rotation: [f.rotX, 0, f.rotZ],
      center: [midX, midY, midZ],
      materialIndex: matCartoon,
      uvBounds: UV_SKIN_RED,
      outlineMaterialIndex: matInk,
      outlineThickness: OUTLINE_DETAIL
    });

    // Golden Demon Talon / Claw Cap at fingertip
    const tipX = f.x + Math.sin(f.rotZ * Math.PI / 180) * f.len;
    const tipY = f.yBase - Math.cos(f.rotX * Math.PI / 180) * f.len;
    const tipZ = f.zBase - Math.sin(f.rotX * Math.PI / 180) * f.len;

    leftElbowMesh.addCone({
      radius: 0.011,
      height: f.clawLen,
      segments: 10,
      rotation: [f.rotX + 15, 0, f.rotZ],
      center: [
        tipX + Math.sin(f.rotZ * Math.PI / 180) * f.clawLen * 0.45,
        tipY - Math.cos((f.rotX + 15) * Math.PI / 180) * f.clawLen * 0.45,
        tipZ - Math.sin((f.rotX + 15) * Math.PI / 180) * f.clawLen * 0.45
      ],
      materialIndex: matGoldAccent,
      outlineMaterialIndex: matInk,
      outlineThickness: OUTLINE_DETAIL
    });
  }

  // 4. Opposable Guardian Thumb (Arched Outward-Forward with Golden Talon)
  leftElbowMesh.addSphere({
    radius: 0.016,
    center: [0.048, -0.33, -0.010],
    materialIndex: matCartoon,
    uvBounds: UV_SKIN_RED
  });
  leftElbowMesh.addCylinder({
    radiusTop: 0.014,
    radiusBottom: 0.011,
    height: 0.046,
    segments: 10,
    rotation: [25, 30, -38],
    center: [0.062, -0.345, -0.022],
    materialIndex: matCartoon,
    uvBounds: UV_SKIN_RED,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });
  leftElbowMesh.addCone({
    radius: 0.011,
    height: 0.030,
    segments: 10,
    rotation: [38, 30, -42],
    center: [0.076, -0.362, -0.034],
    materialIndex: matGoldAccent,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });

  // =========================================================================
  // 6. RIGHT ARM HIERARCHY (with Chamara Fly-Whisk)
  // RightArmRoot (X = -0.46, Y = 1.76, Z = 0)
  //   └── RightElbowRoot (Y = -0.34)
  //         └── ChamaraRoot (Y = -0.40, Z = -0.06)
  // =========================================================================
  const { mesh: rightArmMesh, index: rightArmMeshIdx } = builder.createMesh('RightArm_Mesh');

  rightArmMesh.addSphere({
    radius: 0.13,
    widthSegments: 12,
    heightSegments: 8,
    center: [0, 0, 0],
    materialIndex: matCartoon,
    uvBounds: UV_ROBE_FABRIC,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });

  rightArmMesh.addLoft({
    slices: [
      { y:  0.00, rx: 0.125, rz: 0.125 },
      { y: -0.16, rx: 0.118, rz: 0.118 },
      { y: -0.34, rx: 0.110, rz: 0.110 }
    ],
    segments: 16,
    materialIndex: matCartoon,
    uvBounds: UV_ROBE_FABRIC,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });

  const { mesh: rightElbowMesh, index: rightElbowMeshIdx } = builder.createMesh('RightElbow_Mesh');

  rightElbowMesh.addSphere({
    radius: 0.11,
    widthSegments: 10,
    heightSegments: 6,
    center: [0, 0, 0],
    materialIndex: matCartoon,
    uvBounds: UV_ROBE_FABRIC,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });

  rightElbowMesh.addLoft({
    slices: [
      { y:  0.00, rx: 0.108, rz: 0.108 },
      { y: -0.15, rx: 0.102, rz: 0.102 },
      { y: -0.26, rx: 0.098, rz: 0.098 }
    ],
    segments: 16,
    materialIndex: matCartoon,
    uvBounds: UV_ROBE_FABRIC,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });

  rightElbowMesh.addCylinder({
    radiusTop: 0.115,
    radiusBottom: 0.120,
    height: 0.095,
    segments: 18,
    center: [0, -0.28, 0],
    materialIndex: matGoldAccent,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });

  for (const rib of ribbonStyles) {
    rightElbowMesh.addLoft({
      slices: [
        { y: -0.28, rx: 0.024, rz: 0.004, cx: -rib.xBase, cz: rib.zBase },
        { y: -0.38, rx: 0.023, rz: 0.004, cx: -(rib.xBase + rib.curveX * 0.5), cz: rib.zBase + rib.curveZ * 0.5 },
        { y: -0.48, rx: 0.022, rz: 0.004, cx: -(rib.xBase + rib.curveX), cz: rib.zBase + rib.curveZ },
        { y: -0.58, rx: 0.018, rz: 0.003, cx: -(rib.xBase + rib.curveX * 1.3), cz: rib.zBase + rib.curveZ * 1.4 }
      ],
      segments: 8,
      materialIndex: matCartoon,
      uvBounds: rib.uv,
      outlineMaterialIndex: matInk,
      outlineThickness: OUTLINE_DETAIL
    });
  }

  // =========================================================================
  // RIGHT HAND: SACRED CEREMONIAL GRIP WRAPPED AROUND CHĀMARA HANDLE
  // Firm, authoritative fist wrapped tightly around the turned brass shaft
  // =========================================================================
  // 1. Sculpted Palm Mass Encircling Handle Back
  rightElbowMesh.addLoft({
    slices: [
      { y: -0.28, rx: 0.058, rz: 0.044, cx: 0, cz: 0 },
      { y: -0.33, rx: 0.062, rz: 0.048, cx: -0.005, cz: -0.020 },
      { y: -0.38, rx: 0.065, rz: 0.048, cx: -0.010, cz: -0.035 },
      { y: -0.44, rx: 0.060, rz: 0.044, cx: -0.010, cz: -0.040 }
    ],
    segments: 14,
    materialIndex: matCartoon,
    uvBounds: UV_SKIN_RED,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });

  // 2. Four Articulated Fingers Curled Around Handle (Index, Middle, Ring, Pinky)
  // Each finger curls from the back around the handle at z = -0.06 to front at z = -0.088
  const rightFingers = [
    { y: -0.34, rad: 0.014, wrapX: -0.028 },
    { y: -0.37, rad: 0.014, wrapX: -0.028 },
    { y: -0.40, rad: 0.013, wrapX: -0.027 },
    { y: -0.43, rad: 0.012, wrapX: -0.026 },
  ];

  for (const rf of rightFingers) {
    // Lateral Knuckle
    rightElbowMesh.addSphere({
      radius: rf.rad * 1.1,
      center: [rf.wrapX - 0.012, rf.y, -0.048],
      materialIndex: matCartoon,
      uvBounds: UV_SKIN_RED,
      outlineMaterialIndex: matInk,
      outlineThickness: OUTLINE_DETAIL
    });

    // Front Finger Barrel Wrapping Shaft
    rightElbowMesh.addCylinder({
      radiusTop: rf.rad,
      radiusBottom: rf.rad * 0.95,
      height: 0.048,
      segments: 10,
      rotation: [0, 0, 85],
      center: [0.005, rf.y, -0.088],
      materialIndex: matCartoon,
      uvBounds: UV_SKIN_RED,
      outlineMaterialIndex: matInk,
      outlineThickness: OUTLINE_DETAIL
    });

    // Golden Talon Claw Tip curling back into inner palm
    rightElbowMesh.addCone({
      radius: 0.009,
      height: 0.022,
      segments: 8,
      rotation: [0, 45, 90],
      center: [0.026, rf.y, -0.082],
      materialIndex: matGoldAccent,
      outlineMaterialIndex: matInk,
      outlineThickness: OUTLINE_DETAIL
    });
  }

  // 3. Thumb Locking Handle from Above
  rightElbowMesh.addSphere({
    radius: 0.016,
    center: [-0.038, -0.32, -0.035],
    materialIndex: matCartoon,
    uvBounds: UV_SKIN_RED
  });
  rightElbowMesh.addCylinder({
    radiusTop: 0.014,
    radiusBottom: 0.012,
    height: 0.044,
    segments: 10,
    rotation: [-18, -25, 42],
    center: [-0.018, -0.332, -0.068],
    materialIndex: matCartoon,
    uvBounds: UV_SKIN_RED,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });
  rightElbowMesh.addCone({
    radius: 0.010,
    height: 0.024,
    segments: 8,
    rotation: [-22, -30, 50],
    center: [-0.002, -0.342, -0.082],
    materialIndex: matGoldAccent,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });

  // Sacred Chāmara (Yak-Tail Fly-Whisk) Mesh
  const { mesh: chamaraMesh, index: chamaraMeshIdx } = builder.createMesh('Chamara_Mesh');

  // A. Turned Brass Handle with Rings
  chamaraMesh.addCylinder({
    radiusTop: 0.024,
    radiusBottom: 0.022,
    height: 0.42,
    segments: 14,
    center: [0, 0.08, 0],
    materialIndex: matCartoon,
    uvBounds: UV_CHAMARA_HANDLE,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });

  // Carved Lotus Pommel at bottom of handle
  chamaraMesh.addSphere({
    radius: 0.040,
    widthSegments: 12,
    heightSegments: 8,
    center: [0, -0.13, 0],
    materialIndex: matGoldAccent,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });

  // Flared Brass Ferrule Ring connecting handle to hair plume
  chamaraMesh.addCylinder({
    radiusTop: 0.060,
    radiusBottom: 0.038,
    height: 0.065,
    segments: 14,
    center: [0, 0.28, 0],
    materialIndex: matGoldAccent,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });

  // B. Voluminous Silken Yak-Hair Plume Loft (S-Curved Flowing Plume!)
  chamaraMesh.addLoft({
    slices: [
      { y: 0.28, rx: 0.065, rz: 0.065, cx: 0,     cz: 0 },
      { y: 0.42, rx: 0.140, rz: 0.140, cx: 0.02,  cz: 0.02 },
      { y: 0.58, rx: 0.165, rz: 0.165, cx: 0.04,  cz: 0.04 },
      { y: 0.72, rx: 0.130, rz: 0.130, cx: 0.06,  cz: 0.06 },
      { y: 0.84, rx: 0.040, rz: 0.040, cx: 0.07,  cz: 0.08 }
    ],
    segments: 20,
    capTop: true,
    capBottom: true,
    materialIndex: matCartoon,
    uvBounds: UV_CHAMARA_PLUME,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });

  // =========================================================================
  // 7. LEFT & RIGHT LEG HIERARCHIES
  // Thighs, Shins, Brass Ankle Bells & Authentic Curled Khussa Boots
  // =========================================================================
  function buildLegMeshes(sideName) {
    const { mesh: thighMesh, index: thighMeshIdx } = builder.createMesh(`${sideName}Thigh_Mesh`);

    thighMesh.addSphere({
      radius: 0.12,
      widthSegments: 10,
      heightSegments: 8,
      center: [0, 0, 0],
      materialIndex: matCartoon,
      uvBounds: UV_ROBE_FABRIC,
      outlineMaterialIndex: matInk,
      outlineThickness: OUTLINE_BODY
    });

    thighMesh.addLoft({
      slices: [
        { y:  0.00, rx: 0.118, rz: 0.118 },
        { y: -0.14, rx: 0.112, rz: 0.112 },
        { y: -0.28, rx: 0.105, rz: 0.105 }
      ],
      segments: 16,
      materialIndex: matCartoon,
      uvBounds: UV_ROBE_FABRIC,
      outlineMaterialIndex: matInk,
      outlineThickness: OUTLINE_BODY
    });

    const { mesh: shinMesh, index: shinMeshIdx } = builder.createMesh(`${sideName}Shin_Mesh`);

    shinMesh.addSphere({
      radius: 0.105,
      widthSegments: 10,
      heightSegments: 6,
      center: [0, 0, 0],
      materialIndex: matCartoon,
      uvBounds: UV_ROBE_FABRIC,
      outlineMaterialIndex: matInk,
      outlineThickness: OUTLINE_BODY
    });

    shinMesh.addLoft({
      slices: [
        { y:  0.00, rx: 0.102, rz: 0.102 },
        { y: -0.12, rx: 0.098, rz: 0.098 },
        { y: -0.22, rx: 0.092, rz: 0.092 }
      ],
      segments: 16,
      materialIndex: matCartoon,
      uvBounds: UV_ROBE_FABRIC,
      outlineMaterialIndex: matInk,
      outlineThickness: OUTLINE_BODY
    });

    // Golden Ankle Cuff
    shinMesh.addCylinder({
      radiusTop: 0.115,
      radiusBottom: 0.120,
      height: 0.075,
      segments: 18,
      center: [0, -0.24, -0.01],
      materialIndex: matCartoon,
      uvBounds: UV_BOOT_BELLS,
      outlineMaterialIndex: matInk,
      outlineThickness: OUTLINE_BODY
    });

    // 3D Spherical Brass Bells (Ghungroo / Ghawa) ringing around the ankle!
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
      shinMesh.addSphere({
        radius: 0.016,
        widthSegments: 8,
        heightSegments: 6,
        center: [Math.cos(a) * 0.125, -0.24, -0.01 + Math.sin(a) * 0.125],
        materialIndex: matGoldAccent,
        outlineMaterialIndex: matInk,
        outlineThickness: OUTLINE_DETAIL * 0.5
      });
    }

    // Authentic Ceremonial Curled Boot (Khussa / Jutta)
    // Firmly grounded at World Y = 0.00m
    shinMesh.addBox({
      size: [0.19, 0.13, 0.28],
      center: [0, -0.31, -0.04],
      materialIndex: matCartoon,
      uvBounds: UV_BOOT_LEATHER,
      outlineMaterialIndex: matInk,
      outlineThickness: OUTLINE_BODY
    });

    // Gracefully Upturned Curled Golden Toe (Nok) curving up and back
    shinMesh.addLoft({
      slices: [
        { y: -0.34, rx: 0.065, rz: 0.060, cx: 0, cz: -0.16 },
        { y: -0.30, rx: 0.055, rz: 0.050, cx: 0, cz: -0.21 },
        { y: -0.25, rx: 0.040, rz: 0.038, cx: 0, cz: -0.24 },
        { y: -0.21, rx: 0.022, rz: 0.020, cx: 0, cz: -0.25 },
        { y: -0.19, rx: 0.008, rz: 0.008, cx: 0, cz: -0.23 } // Curving back inward!
      ],
      segments: 12,
      capTop: true,
      materialIndex: matGoldAccent,
      outlineMaterialIndex: matInk,
      outlineThickness: OUTLINE_DETAIL
    });

    // Solid Charcoal Leather Tread
    shinMesh.addBox({
      size: [0.20, 0.025, 0.30],
      center: [0, -0.365, -0.05],
      materialIndex: matInk,
      uvBounds: UV_BOOT_LEATHER
    });

    return { thighMeshIdx, shinMeshIdx };
  }

  const leftLeg = buildLegMeshes('Left');
  const rightLeg = buildLegMeshes('Right');

  // =========================================================================
  // 8. GLTF HIERARCHICAL NODE GRAPH
  // =========================================================================
  const torsoNode = builder.addNode({
    name: 'TorsoRoot',
    translation: [0, 1.15, 0],
    meshIndex: torsoMeshIdx
  });

  const headNode = builder.addNode({
    name: 'HeadRoot',
    translation: [0, 1.88, 0],
    meshIndex: headMeshIdx
  });

  const maneNode = builder.addNode({
    name: 'ManeRoot',
    translation: [0, 2.00, 0.10],
    meshIndex: maneMeshIdx
  });

  const leftElbowNode = builder.addNode({
    name: 'LeftElbowRoot',
    translation: [0, -0.34, 0],
    meshIndex: leftElbowMeshIdx
  });
  const leftArmNode = builder.addNode({
    name: 'LeftArmRoot',
    translation: [0.46, 1.76, 0],
    meshIndex: leftArmMeshIdx,
    children: [leftElbowNode]
  });

  const chamaraNode = builder.addNode({
    name: 'ChamaraRoot',
    translation: [0, -0.40, -0.06],
    meshIndex: chamaraMeshIdx
  });
  const rightElbowNode = builder.addNode({
    name: 'RightElbowRoot',
    translation: [0, -0.34, 0],
    meshIndex: rightElbowMeshIdx,
    children: [chamaraNode]
  });
  const rightArmNode = builder.addNode({
    name: 'RightArmRoot',
    translation: [-0.46, 1.76, 0],
    meshIndex: rightArmMeshIdx,
    children: [rightElbowNode]
  });

  const leftKneeNode = builder.addNode({
    name: 'LeftKneeRoot',
    translation: [0, -0.28, 0],
    meshIndex: leftLeg.shinMeshIdx
  });
  const leftLegNode = builder.addNode({
    name: 'LeftLegRoot',
    translation: [0.20, 0.65, 0],
    meshIndex: leftLeg.thighMeshIdx,
    children: [leftKneeNode]
  });

  const rightKneeNode = builder.addNode({
    name: 'RightKneeRoot',
    translation: [0, -0.28, 0],
    meshIndex: rightLeg.shinMeshIdx
  });
  const rightLegNode = builder.addNode({
    name: 'RightLegRoot',
    translation: [-0.20, 0.65, 0],
    meshIndex: rightLeg.thighMeshIdx,
    children: [rightKneeNode]
  });

  // =========================================================================
  // 9. EXPORT BINARY GLB
  // =========================================================================
  const glbBuffer = builder.build();

  const publicGlbPath = path.resolve(__dirname, '../public/models/lakhey_blockout_v02.glb');
  const artGlbPath = path.resolve(__dirname, '../art-source/lakhey_blockout_v02.glb');

  fs.writeFileSync(publicGlbPath, glbBuffer);
  fs.writeFileSync(artGlbPath, glbBuffer);

  console.log(`Successfully built Lakhey v0.4 Next-Gen Modern Cartoon GLB!`);
  console.log(`Saved to: ${publicGlbPath} (${(glbBuffer.length / 1024).toFixed(1)} KB)`);
}

buildModernCartoonLakheyV4();
