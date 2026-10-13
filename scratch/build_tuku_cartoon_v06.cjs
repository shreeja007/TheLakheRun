const fs = require('fs');
const path = require('path');
const { GLBBuilder } = require('./glb_builder.cjs');

function buildModernCartoonTuku() {
  console.log('Building Refined Modern Cartoon / Illustrated Tuku 3D Character (v0.6.1)...');

  const builder = new GLBBuilder();

  // =========================================================================
  // 1. TEXTURE ATLAS & MATERIALS
  // =========================================================================
  const atlasPath = path.resolve(__dirname, '../art-source/tuku_cartoon_atlas.png');
  const atlasBuf = fs.readFileSync(atlasPath);
  const texAtlasIdx = builder.addImage(atlasBuf, 'image/png');

  // Main Cartoon Illustrated PBR Material
  const matCartoon = builder.addMaterial('Mat_CartoonAtlas', {
    baseColor: [1.0, 1.0, 1.0, 1.0],
    roughness: 0.55,
    metallic: 0.02,
    textureIndex: texAtlasIdx
  });

  // Dark Ink Outline Material (Inverted Hull Comic Outlines)
  const matInk = builder.addMaterial('Mat_InkOutline', {
    baseColor: [0.08, 0.09, 0.12, 1.0], // Deep Charcoal Ink
    roughness: 0.95,
    metallic: 0.0,
    doubleSided: false
  });

  // Solid Accent Material (Marigold Brass for buckles & hardware)
  const matMarigold = builder.addMaterial('Mat_MarigoldHardware', {
    baseColor: [0.87, 0.66, 0.29, 1.0],
    roughness: 0.35,
    metallic: 0.4
  });

  // Solid Neutral Skin UV region (plain skin tone without face features)
  const UV_SKIN_SOLID = [0.02, 0.02, 0.08, 0.08];
  const UV_HAIR_SOLID = [0.82, 0.82, 0.95, 0.95];

  // Clothing Atlas UV Bounds
  const UV_JACKET = [0.5, 0.0, 1.0, 0.5];
  const UV_JACKET_FRONT = [0.72, 0.08, 0.78, 0.46]; // Center zipper track
  const UV_JACKET_HEM = [0.5, 0.45, 1.0, 0.50];     // Bottom Newar diamond band
  const UV_CUFF_TRIM = [0.5, 0.03, 1.0, 0.06];      // Cuff diamond trim
  const UV_PANTS = [0.0, 0.5, 0.5, 0.78];
  const UV_PANTS_KNEE = [0.05, 0.60, 0.45, 0.74];
  const UV_POCKET = [0.06, 0.55, 0.22, 0.65];
  const UV_ANKLE = [0.0, 0.76, 0.5, 0.79];
  const UV_SNEAKER_UPPER = [0.0, 0.79, 0.25, 0.90];
  const UV_SNEAKER_SOLE = [0.0, 0.90, 0.25, 0.97];
  const UV_SNEAKER_TREAD = [0.0, 0.97, 0.25, 1.00];
  const UV_SHIRT = [0.5, 0.5, 0.75, 0.75];
  const UV_SCARF = [0.75, 0.5, 1.0, 0.75];
  const UV_SATCHEL = [0.5, 0.75, 0.75, 1.0];

  const OUTLINE_BODY = 0.006; // 6mm body outline
  const OUTLINE_DETAIL = 0.0035; // 3.5mm delicate outline for face/hands

  // =========================================================================
  // 2. TORSO MESH (Pivot at Y = 0.86m)
  // Layered Kathmandu Streetwear: Pelvis -> Longline Shirt -> Teal Jacket -> Hood
  // =========================================================================
  const { mesh: torsoMesh, index: torsoMeshIdx } = builder.createMesh('Torso_Mesh');

  // A. Pelvis & Crotch Foundation (Charcoal Joggers)
  torsoMesh.addLoft({
    slices: [
      { y: -0.16, rx: 0.145, rz: 0.108 },
      { y: -0.10, rx: 0.158, rz: 0.118 },
      { y: -0.04, rx: 0.164, rz: 0.124 },
      { y:  0.02, rx: 0.162, rz: 0.122 }
    ],
    segments: 20,
    capBottom: true,
    materialIndex: matCartoon,
    uvBounds: UV_PANTS,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });

  // B. Longline Cream Inner Shirt (Extends 8-10 cm below jacket hem)
  torsoMesh.addLoft({
    slices: [
      { y: -0.06, rx: 0.168, rz: 0.128 },
      { y:  0.02, rx: 0.166, rz: 0.126 },
      { y:  0.10, rx: 0.164, rz: 0.124 },
      { y:  0.22, rx: 0.155, rz: 0.118 },
      { y:  0.34, rx: 0.160, rz: 0.122 }
    ],
    segments: 20,
    materialIndex: matCartoon,
    uvBounds: UV_SHIRT,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });

  // Vertical Cream Chest Placket
  torsoMesh.addBox({
    size: [0.082, 0.32, 0.012],
    center: [0, 0.26, -0.140],
    materialIndex: matCartoon,
    uvBounds: UV_SHIRT
  });

  // C. Cropped Teal Bomber Jacket (Athletic V-taper)
  // Waistband Ribbing with Traditional Newar Trim
  torsoMesh.addLoft({
    slices: [
      { y: 0.105, rx: 0.170, rz: 0.130 },
      { y: 0.140, rx: 0.173, rz: 0.133 }
    ],
    segments: 20,
    materialIndex: matCartoon,
    uvBounds: UV_JACKET_HEM,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });

  // Main Jacket Body Loft (From ribs up to shoulders)
  torsoMesh.addLoft({
    slices: [
      { y: 0.140, rx: 0.173, rz: 0.133 },
      { y: 0.220, rx: 0.180, rz: 0.138 },
      { y: 0.320, rx: 0.198, rz: 0.150 },
      { y: 0.400, rx: 0.208, rz: 0.146 },
      { y: 0.450, rx: 0.180, rz: 0.130 },
      { y: 0.480, rx: 0.100, rz: 0.090 }
    ],
    segments: 22,
    materialIndex: matCartoon,
    uvBounds: UV_JACKET,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });

  // Standing Jacket Collar Ring
  torsoMesh.addHorizontalTorus({
    radius: 0.088,
    tube: 0.020,
    radialSegments: 12,
    tubularSegments: 20,
    scale: [1.05, 1.2, 0.95],
    center: [0, 0.485, 0.0],
    materialIndex: matCartoon,
    uvBounds: UV_JACKET_HEM,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY * 0.8
  });

  // Jacket Front Center Zipper Placket (Shows silver zipper teeth & slider)
  torsoMesh.addBox({
    size: [0.032, 0.33, 0.016],
    center: [0, 0.27, -0.145],
    materialIndex: matCartoon,
    uvBounds: UV_JACKET_FRONT,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY * 0.6
  });

  // Draped Hood on Back (Signature Streetwear Silhouette from Behind!)
  torsoMesh.addLoft({
    slices: [
      { y: 0.28, rx: 0.085, rz: 0.045, cz: 0.138 },
      { y: 0.36, rx: 0.125, rz: 0.055, cz: 0.142 },
      { y: 0.43, rx: 0.138, rz: 0.052, cz: 0.136 },
      { y: 0.47, rx: 0.105, rz: 0.038, cz: 0.118 }
    ],
    segments: 18,
    capBottom: true,
    materialIndex: matCartoon,
    uvBounds: [0.55, 0.12, 0.95, 0.42],
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });

  // Diagonal Crossbody Satchel Straps
  torsoMesh.addBox({
    size: [0.036, 0.44, 0.008],
    rotation: [0, 0, 36],
    center: [0.025, 0.29, -0.146],
    materialIndex: matCartoon,
    uvBounds: UV_SATCHEL,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY * 0.6
  });
  torsoMesh.addBox({
    size: [0.042, 0.032, 0.016],
    rotation: [0, 0, 36],
    center: [0.105, 0.39, -0.144],
    materialIndex: matMarigold,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY * 0.6
  });
  torsoMesh.addBox({
    size: [0.036, 0.44, 0.008],
    rotation: [0, 0, -36],
    center: [0.025, 0.29, 0.144],
    materialIndex: matCartoon,
    uvBounds: UV_SATCHEL,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY * 0.6
  });

  // =========================================================================
  // 3. HEAD & FACE MESH (Pivot at Y = 1.36m, exactly atop collar)
  // Total head top reaches Y = 1.68m
  // =========================================================================
  const { mesh: headMesh, index: headMeshIdx } = builder.createMesh('Head_Mesh');

  // Neck (Height = 0.11m) - Maps to Solid Warm Skin
  headMesh.addLoft({
    slices: [
      { y: 0.00, rx: 0.058, rz: 0.055 },
      { y: 0.05, rx: 0.054, rz: 0.052 },
      { y: 0.11, rx: 0.052, rz: 0.050 }
    ],
    segments: 16,
    materialIndex: matCartoon,
    uvBounds: UV_SKIN_SOLID,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY * 0.7
  });

  // Snug Maroon Cowl / Folded Neck Scarf
  headMesh.addHorizontalTorus({
    radius: 0.074,
    tube: 0.024,
    radialSegments: 14,
    tubularSegments: 20,
    scale: [1.12, 1.25, 0.98],
    center: [0, 0.038, 0.002],
    materialIndex: matCartoon,
    uvBounds: UV_SCARF,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });

  // Scarf Front Knot
  headMesh.addSphere({
    radius: 0.025,
    widthSegments: 10,
    heightSegments: 8,
    scale: [0.95, 1.15, 0.85],
    center: [0.052, 0.028, -0.072],
    materialIndex: matCartoon,
    uvBounds: UV_SCARF,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY * 0.6
  });

  // Head Cranium Foundation (Solid Skin Tone, NO face texture wrapping!)
  headMesh.addLoft({
    slices: [
      { y: 0.08, rx: 0.038, rz: 0.038, cz: -0.028 }, // Chin tip
      { y: 0.12, rx: 0.065, rz: 0.060, cz: -0.016 }, // Jawline
      { y: 0.16, rx: 0.078, rz: 0.075, cz: -0.006 }, // Cheeks
      { y: 0.20, rx: 0.084, rz: 0.082, cz:  0.000 }, // Temples
      { y: 0.25, rx: 0.082, rz: 0.082, cz:  0.004 }, // Forehead
      { y: 0.29, rx: 0.075, rz: 0.078, cz:  0.010 }, // Crown
      { y: 0.32, rx: 0.035, rz: 0.038, cz:  0.012 }  // Top of head
    ],
    segments: 22,
    capTop: true,
    capBottom: true,
    materialIndex: matCartoon,
    uvBounds: UV_SKIN_SOLID,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });

  // Stylized Cartoon Ears
  headMesh.addSphere({
    radius: 0.022,
    widthSegments: 8,
    heightSegments: 6,
    scale: [0.35, 1.20, 0.75],
    rotation: [0, 14, -6],
    center: [0.084, 0.195, 0.002],
    materialIndex: matCartoon,
    uvBounds: UV_SKIN_SOLID,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });
  headMesh.addSphere({
    radius: 0.022,
    widthSegments: 8,
    heightSegments: 6,
    scale: [0.35, 1.20, 0.75],
    rotation: [0, -14, 6],
    center: [-0.084, 0.195, 0.002],
    materialIndex: matCartoon,
    uvBounds: UV_SKIN_SOLID,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });

  // --- High-Appeal 3D Anime Front Face Mask ---
  // Perfectly calibrated front facial contour matching head anatomy and texture atlas!
  const faceSlices = [
    { y: 0.08, rx: 0.040, rz: 0.040, cz: -0.028 }, // chin tip
    { y: 0.12, rx: 0.065, rz: 0.060, cz: -0.016 }, // jawline
    { y: 0.15, rx: 0.076, rz: 0.075, cz: -0.008 }, // mouth
    { y: 0.18, rx: 0.082, rz: 0.080, cz: -0.004 }, // nose
    { y: 0.21, rx: 0.084, rz: 0.082, cz:  0.000 }, // eyes
    { y: 0.25, rx: 0.082, rz: 0.080, cz:  0.004 }, // brows
    { y: 0.28, rx: 0.076, rz: 0.074, cz:  0.008 }  // forehead
  ];

  const faceSegs = 18;
  const facePos = [];
  const faceNorm = [];
  const faceUvs = [];
  const faceIdx = [];

  for (let s = 0; s < faceSlices.length; s++) {
    const sl = faceSlices[s];
    const y = sl.y;
    const rx = sl.rx;
    const rz = sl.rz + 0.0015; // 1.5mm offset prevents z-fighting with skull
    const cz = sl.cz || 0;

    for (let i = 0; i <= faceSegs; i++) {
      // theta from -0.46*PI to +0.46*PI (from right temple across nose to left temple)
      const theta = ((i / faceSegs) - 0.5) * Math.PI * 0.92;
      const x = Math.sin(theta) * rx;
      const z = cz - Math.cos(theta) * rz;

      facePos.push(x, y, z);

      // Normal points forward & outward
      const nx = Math.sin(theta);
      const ny = 0.04;
      const nz = -Math.cos(theta);
      faceNorm.push(nx, ny, nz);

      // Mathematically calibrated UV mapping
      const u = 0.250 + x * 2.45;
      const v = 0.205 - (y - 0.205) * 1.86;
      faceUvs.push(u, v);
    }
  }

  // CCW Winding order facing the front camera
  for (let s = 0; s < faceSlices.length - 1; s++) {
    for (let i = 0; i < faceSegs; i++) {
      const v0 = s * (faceSegs + 1) + i;
      const v1 = s * (faceSegs + 1) + (i + 1);
      const v2 = (s + 1) * (faceSegs + 1) + i;
      const v3 = (s + 1) * (faceSegs + 1) + (i + 1);

      faceIdx.push(v0, v2, v1);
      faceIdx.push(v1, v2, v3);
    }
  }

  headMesh.addGeometry(matCartoon, facePos, faceNorm, faceIdx, {}, faceUvs);

  // --- Dynamic Layered Spiky Manga/Anime Hair ---
  // Beautiful anime hairstyle: Swept bangs, flared sideburns, and spiky crown tufts!

  // 1. Main Hair Volume Cap (Dark Hair Texture)
  headMesh.addLoft({
    slices: [
      { y: 0.18, rx: 0.086, rz: 0.076, cz: 0.016 },
      { y: 0.24, rx: 0.094, rz: 0.088, cz: 0.014 },
      { y: 0.29, rx: 0.090, rz: 0.088, cz: 0.012 },
      { y: 0.33, rx: 0.054, rz: 0.054, cz: 0.010 }
    ],
    segments: 20,
    capTop: true,
    materialIndex: matCartoon,
    uvBounds: UV_HAIR_SOLID,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY * 1.1
  });

  // 2. Swept Anime Bangs / Fringe
  // These sit smoothly across the top forehead (Y: 0.27 to 0.30, Z: -0.075 to -0.09)
  // sweeping across from right to left, framing the brows without covering the eyes!
  headMesh.addCone({
    radius: 0.022,
    height: 0.080,
    segments: 10,
    rotation: [24, 45, -30],
    center: [0.038, 0.285, -0.076],
    materialIndex: matCartoon,
    uvBounds: UV_HAIR_SOLID,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });
  headMesh.addCone({
    radius: 0.025,
    height: 0.095,
    segments: 10,
    rotation: [20, 20, -18],
    center: [-0.010, 0.292, -0.080],
    materialIndex: matCartoon,
    uvBounds: UV_HAIR_SOLID,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });
  headMesh.addCone({
    radius: 0.020,
    height: 0.075,
    segments: 10,
    rotation: [22, -28, 22],
    center: [-0.050, 0.282, -0.072],
    materialIndex: matCartoon,
    uvBounds: UV_HAIR_SOLID,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });

  // 3. Sideburn Locks Framing Cheekbones
  headMesh.addBox({
    size: [0.018, 0.075, 0.036],
    rotation: [12, 10, -8],
    center: [0.084, 0.20, -0.020],
    materialIndex: matCartoon,
    uvBounds: UV_HAIR_SOLID,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });
  headMesh.addBox({
    size: [0.018, 0.075, 0.036],
    rotation: [12, -10, 8],
    center: [-0.084, 0.20, -0.020],
    materialIndex: matCartoon,
    uvBounds: UV_HAIR_SOLID,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });

  // 4. Swept-Back Spiky Crown Tufts (Hero silhouette visible from behind & 3/4 views!)
  headMesh.addCone({
    radius: 0.026,
    height: 0.110,
    segments: 10,
    rotation: [-48, 15, -10],
    center: [0.032, 0.320, 0.052],
    materialIndex: matCartoon,
    uvBounds: UV_HAIR_SOLID,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });
  headMesh.addCone({
    radius: 0.028,
    height: 0.125,
    segments: 10,
    rotation: [-52, 0, 0],
    center: [0.000, 0.335, 0.048],
    materialIndex: matCartoon,
    uvBounds: UV_HAIR_SOLID,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });
  headMesh.addCone({
    radius: 0.025,
    height: 0.105,
    segments: 10,
    rotation: [-46, -18, 12],
    center: [-0.036, 0.315, 0.050],
    materialIndex: matCartoon,
    uvBounds: UV_HAIR_SOLID,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });

  // Flared Nape Hair
  headMesh.addLoft({
    slices: [
      { y: 0.11, rx: 0.054, rz: 0.028, cz: 0.052 },
      { y: 0.16, rx: 0.070, rz: 0.036, cz: 0.056 },
      { y: 0.21, rx: 0.082, rz: 0.044, cz: 0.052 }
    ],
    segments: 16,
    capBottom: true,
    materialIndex: matCartoon,
    uvBounds: UV_HAIR_SOLID,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });

  // =========================================================================
  // 4. SCARF TAIL MESH (Dynamic wind flutter behind left shoulder)
  // =========================================================================
  const { mesh: scarfTailMesh, index: scarfTailMeshIdx } = builder.createMesh('ScarfTail_Mesh');
  scarfTailMesh.addBox({
    size: [0.040, 0.16, 0.008],
    rotation: [-22, 10, 0],
    center: [0, -0.070, 0.03],
    materialIndex: matCartoon,
    uvBounds: UV_SCARF,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });
  scarfTailMesh.addBox({
    size: [0.042, 0.020, 0.012],
    rotation: [-22, 10, 0],
    center: [0, -0.140, 0.03],
    materialIndex: matMarigold,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });

  // =========================================================================
  // 5. LEGS & SNEAKERS (Left & Right)
  // Seamless cloth flow, cargo pockets, chunky runner sneakers!
  // =========================================================================
  // --- Left Leg (Upper Thigh) ---
  const { mesh: lThighMesh, index: lThighMeshIdx } = builder.createMesh('LeftLeg_Thigh_Mesh');
  lThighMesh.addLoft({
    slices: [
      { y:  0.00, rx: 0.082, rz: 0.080 },
      { y: -0.12, rx: 0.074, rz: 0.072 },
      { y: -0.26, rx: 0.064, rz: 0.062 }
    ],
    segments: 16,
    capTop: true,
    materialIndex: matCartoon,
    uvBounds: UV_PANTS,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });
  // Outer Cargo Pocket with flap
  lThighMesh.addBox({
    size: [0.026, 0.105, 0.086],
    center: [0.074, -0.12, 0],
    materialIndex: matCartoon,
    uvBounds: UV_POCKET,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });

  // --- Left Knee & Calf & Sneaker ---
  const { mesh: lKneeMesh, index: lKneeMeshIdx } = builder.createMesh('LeftKnee_Calf_Mesh');
  lKneeMesh.addLoft({
    slices: [
      { y:  0.02, rx: 0.064, rz: 0.062 },
      { y: -0.12, rx: 0.060, rz: 0.065, cz: -0.006 },
      { y: -0.24, rx: 0.050, rz: 0.050 },
      { y: -0.32, rx: 0.046, rz: 0.046 }
    ],
    segments: 16,
    materialIndex: matCartoon,
    uvBounds: UV_PANTS_KNEE,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });
  lKneeMesh.addLoft({
    slices: [
      { y: -0.32, rx: 0.047, rz: 0.047 },
      { y: -0.35, rx: 0.044, rz: 0.044 }
    ],
    segments: 14,
    materialIndex: matCartoon,
    uvBounds: UV_ANKLE,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });
  lKneeMesh.addLoft({
    slices: [
      { y: -0.36, rx: 0.046, rz: 0.065, cz: -0.010 },
      { y: -0.40, rx: 0.052, rz: 0.095, cz: -0.018 },
      { y: -0.43, rx: 0.054, rz: 0.105, cz: -0.018 }
    ],
    segments: 16,
    materialIndex: matCartoon,
    uvBounds: UV_SNEAKER_UPPER,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });
  lKneeMesh.addBox({
    size: [0.070, 0.038, 0.080],
    rotation: [-22, 0, 0],
    center: [0, -0.36, -0.042],
    materialIndex: matCartoon,
    uvBounds: UV_SNEAKER_UPPER,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });
  lKneeMesh.addBox({
    size: [0.110, 0.026, 0.238],
    center: [0, -0.442, -0.016],
    materialIndex: matCartoon,
    uvBounds: UV_SNEAKER_SOLE,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });
  lKneeMesh.addBox({
    size: [0.108, 0.012, 0.234],
    center: [0, -0.456, -0.016],
    materialIndex: matCartoon,
    uvBounds: UV_SNEAKER_TREAD,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });
  lKneeMesh.addBox({
    size: [0.024, 0.036, 0.012],
    center: [0, -0.385, 0.094],
    materialIndex: matMarigold,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });

  // --- Right Leg (Upper Thigh) ---
  const { mesh: rThighMesh, index: rThighMeshIdx } = builder.createMesh('RightLeg_Thigh_Mesh');
  rThighMesh.addLoft({
    slices: [
      { y:  0.00, rx: 0.082, rz: 0.080 },
      { y: -0.12, rx: 0.074, rz: 0.072 },
      { y: -0.26, rx: 0.064, rz: 0.062 }
    ],
    segments: 16,
    capTop: true,
    materialIndex: matCartoon,
    uvBounds: UV_PANTS,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });
  rThighMesh.addBox({
    size: [0.026, 0.105, 0.086],
    center: [-0.074, -0.12, 0],
    materialIndex: matCartoon,
    uvBounds: UV_POCKET,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });

  // --- Right Knee & Calf & Sneaker ---
  const { mesh: rKneeMesh, index: rKneeMeshIdx } = builder.createMesh('RightKnee_Calf_Mesh');
  rKneeMesh.addLoft({
    slices: [
      { y:  0.02, rx: 0.064, rz: 0.062 },
      { y: -0.12, rx: 0.060, rz: 0.065, cz: -0.006 },
      { y: -0.24, rx: 0.050, rz: 0.050 },
      { y: -0.32, rx: 0.046, rz: 0.046 }
    ],
    segments: 16,
    materialIndex: matCartoon,
    uvBounds: UV_PANTS_KNEE,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });
  rKneeMesh.addLoft({
    slices: [
      { y: -0.32, rx: 0.047, rz: 0.047 },
      { y: -0.35, rx: 0.044, rz: 0.044 }
    ],
    segments: 14,
    materialIndex: matCartoon,
    uvBounds: UV_ANKLE,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });
  rKneeMesh.addLoft({
    slices: [
      { y: -0.36, rx: 0.046, rz: 0.065, cz: -0.010 },
      { y: -0.40, rx: 0.052, rz: 0.095, cz: -0.018 },
      { y: -0.43, rx: 0.054, rz: 0.105, cz: -0.018 }
    ],
    segments: 16,
    materialIndex: matCartoon,
    uvBounds: UV_SNEAKER_UPPER,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });
  rKneeMesh.addBox({
    size: [0.070, 0.038, 0.080],
    rotation: [-22, 0, 0],
    center: [0, -0.36, -0.042],
    materialIndex: matCartoon,
    uvBounds: UV_SNEAKER_UPPER,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });
  rKneeMesh.addBox({
    size: [0.110, 0.026, 0.238],
    center: [0, -0.442, -0.016],
    materialIndex: matCartoon,
    uvBounds: UV_SNEAKER_SOLE,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });
  rKneeMesh.addBox({
    size: [0.108, 0.012, 0.234],
    center: [0, -0.456, -0.016],
    materialIndex: matCartoon,
    uvBounds: UV_SNEAKER_TREAD,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });
  rKneeMesh.addBox({
    size: [0.024, 0.036, 0.012],
    center: [0, -0.385, 0.094],
    materialIndex: matMarigold,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });

  // =========================================================================
  // 6. ARMS & HANDS (Left & Right)
  // =========================================================================
  // --- Left Arm (Upper Sleeve) ---
  const { mesh: lUpperArmMesh, index: lUpperArmMeshIdx } = builder.createMesh('LeftArm_Upper_Mesh');
  // Seamless Deltoid Shoulder Dome (Encapsulates shoulder pivot for 100% gapless arm swings!)
  lUpperArmMesh.addSphere({
    radius: 0.060,
    widthSegments: 12,
    heightSegments: 10,
    scale: [0.95, 1.05, 0.95],
    center: [0.012, 0.0, 0.0],
    materialIndex: matCartoon,
    uvBounds: UV_JACKET,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });
  lUpperArmMesh.addLoft({
    slices: [
      { y:  0.02, rx: 0.058, rz: 0.055 },
      { y: -0.11, rx: 0.052, rz: 0.050 },
      { y: -0.22, rx: 0.046, rz: 0.045 }
    ],
    segments: 16,
    capTop: true,
    center: [0.016, 0, 0],
    materialIndex: matCartoon,
    uvBounds: UV_JACKET,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });

  // --- Left Forearm & Runner Fist ---
  const { mesh: lForearmMesh, index: lForearmMeshIdx } = builder.createMesh('LeftElbow_Forearm_Mesh');
  lForearmMesh.addLoft({
    slices: [
      { y:  0.02, rx: 0.046, rz: 0.045 },
      { y: -0.10, rx: 0.044, rz: 0.042 },
      { y: -0.18, rx: 0.040, rz: 0.039 }
    ],
    segments: 14,
    center: [0.012, 0, 0],
    materialIndex: matCartoon,
    uvBounds: UV_JACKET,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });
  // Ribbed Wrist Cuff with Newar Trim
  lForearmMesh.addLoft({
    slices: [
      { y: -0.18, rx: 0.041, rz: 0.040 },
      { y: -0.21, rx: 0.038, rz: 0.038 }
    ],
    segments: 12,
    center: [0.012, 0, 0],
    materialIndex: matCartoon,
    uvBounds: UV_CUFF_TRIM,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });
  // Stylized Cartoon Hand (Palm + Thumb)
  lForearmMesh.addSphere({
    radius: 0.032,
    widthSegments: 10,
    heightSegments: 8,
    scale: [0.88, 1.15, 0.82],
    center: [0.012, -0.245, 0],
    materialIndex: matCartoon,
    uvBounds: UV_SKIN_SOLID,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });
  lForearmMesh.addBox({
    size: [0.015, 0.026, 0.016],
    rotation: [0, 0, -22],
    center: [0.030, -0.238, -0.012],
    materialIndex: matCartoon,
    uvBounds: UV_SKIN_SOLID,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL * 0.8
  });

  // --- Right Arm (Upper Sleeve) ---
  const { mesh: rUpperArmMesh, index: rUpperArmMeshIdx } = builder.createMesh('RightArm_Upper_Mesh');
  // Seamless Deltoid Shoulder Dome (Encapsulates shoulder pivot for 100% gapless arm swings!)
  rUpperArmMesh.addSphere({
    radius: 0.060,
    widthSegments: 12,
    heightSegments: 10,
    scale: [0.95, 1.05, 0.95],
    center: [-0.012, 0.0, 0.0],
    materialIndex: matCartoon,
    uvBounds: UV_JACKET,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });
  rUpperArmMesh.addLoft({
    slices: [
      { y:  0.02, rx: 0.058, rz: 0.055 },
      { y: -0.11, rx: 0.052, rz: 0.050 },
      { y: -0.22, rx: 0.046, rz: 0.045 }
    ],
    segments: 16,
    capTop: true,
    center: [-0.016, 0, 0],
    materialIndex: matCartoon,
    uvBounds: UV_JACKET,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });

  // --- Right Forearm & Runner Fist ---
  const { mesh: rForearmMesh, index: rForearmMeshIdx } = builder.createMesh('RightElbow_Forearm_Mesh');
  rForearmMesh.addLoft({
    slices: [
      { y:  0.02, rx: 0.046, rz: 0.045 },
      { y: -0.10, rx: 0.044, rz: 0.042 },
      { y: -0.18, rx: 0.040, rz: 0.039 }
    ],
    segments: 14,
    center: [-0.012, 0, 0],
    materialIndex: matCartoon,
    uvBounds: UV_JACKET,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });
  rForearmMesh.addLoft({
    slices: [
      { y: -0.18, rx: 0.041, rz: 0.040 },
      { y: -0.21, rx: 0.038, rz: 0.038 }
    ],
    segments: 12,
    center: [-0.012, 0, 0],
    materialIndex: matCartoon,
    uvBounds: UV_CUFF_TRIM,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });
  rForearmMesh.addSphere({
    radius: 0.032,
    widthSegments: 10,
    heightSegments: 8,
    scale: [0.88, 1.15, 0.82],
    center: [-0.012, -0.245, 0],
    materialIndex: matCartoon,
    uvBounds: UV_SKIN_SOLID,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });
  rForearmMesh.addBox({
    size: [0.015, 0.026, 0.016],
    rotation: [0, 0, 22],
    center: [-0.030, -0.238, -0.012],
    materialIndex: matCartoon,
    uvBounds: UV_SKIN_SOLID,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL * 0.8
  });

  // =========================================================================
  // 7. CROSSBODY MESSENGER SATCHEL (Pivot at Y = 0.90m, X = -0.18m)
  // =========================================================================
  const { mesh: satchelMesh, index: satchelMeshIdx } = builder.createMesh('Satchel_Mesh');
  satchelMesh.addBox({
    size: [0.158, 0.135, 0.082],
    rotation: [0, -10, 0],
    center: [0, 0, 0],
    materialIndex: matCartoon,
    uvBounds: UV_SATCHEL,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });
  satchelMesh.addBox({
    size: [0.164, 0.075, 0.088],
    rotation: [0, -10, 0],
    center: [0, 0.038, 0],
    materialIndex: matCartoon,
    uvBounds: UV_SATCHEL,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });
  satchelMesh.addBox({
    size: [0.018, 0.052, 0.012],
    rotation: [0, -10, 0],
    center: [-0.042, 0.012, -0.044],
    materialIndex: matMarigold,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL * 0.7
  });
  satchelMesh.addBox({
    size: [0.018, 0.052, 0.012],
    rotation: [0, -10, 0],
    center: [0.042, 0.012, -0.044],
    materialIndex: matMarigold,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL * 0.7
  });

  // =========================================================================
  // 8. ASSEMBLE RIG SKELETON
  // =========================================================================
  const nodeTorso = builder.addNode({
    name: 'TorsoRoot',
    translation: [0, 0.86, 0],
    meshIndex: torsoMeshIdx
  });

  const nodeHead = builder.addNode({
    name: 'HeadRoot',
    translation: [0, 1.36, 0],
    meshIndex: headMeshIdx
  });

  const nodeScarfTail = builder.addNode({
    name: 'ScarfTailRoot',
    translation: [0.065, 0.04, 0.045],
    meshIndex: scarfTailMeshIdx
  });
  builder.addChild(nodeHead, nodeScarfTail);

  const nodeLeftLeg = builder.addNode({
    name: 'LeftLegRoot',
    translation: [0.095, 0.72, 0],
    meshIndex: lThighMeshIdx
  });

  const nodeLeftKnee = builder.addNode({
    name: 'LeftKneeRoot',
    translation: [0, -0.26, 0],
    meshIndex: lKneeMeshIdx
  });
  builder.addChild(nodeLeftLeg, nodeLeftKnee);

  const nodeRightLeg = builder.addNode({
    name: 'RightLegRoot',
    translation: [-0.095, 0.72, 0],
    meshIndex: rThighMeshIdx
  });

  const nodeRightKnee = builder.addNode({
    name: 'RightKneeRoot',
    translation: [0, -0.26, 0],
    meshIndex: rKneeMeshIdx
  });
  builder.addChild(nodeRightLeg, nodeRightKnee);

  const nodeLeftArm = builder.addNode({
    name: 'LeftArmRoot',
    translation: [0.19, 1.30, 0],
    meshIndex: lUpperArmMeshIdx
  });

  const nodeLeftElbow = builder.addNode({
    name: 'LeftElbowRoot',
    translation: [0.016, -0.22, 0],
    meshIndex: lForearmMeshIdx
  });
  builder.addChild(nodeLeftArm, nodeLeftElbow);

  const nodeRightArm = builder.addNode({
    name: 'RightArmRoot',
    translation: [-0.19, 1.30, 0],
    meshIndex: rUpperArmMeshIdx
  });

  const nodeRightElbow = builder.addNode({
    name: 'RightElbowRoot',
    translation: [-0.016, -0.22, 0],
    meshIndex: rForearmMeshIdx
  });
  builder.addChild(nodeRightArm, nodeRightElbow);

  const nodeSatchel = builder.addNode({
    name: 'SatchelRoot',
    translation: [-0.17, 0.90, 0.08],
    meshIndex: satchelMeshIdx
  });

  const glbBuffer = builder.build();

  const baseDir = path.dirname(__dirname);
  const pubPath = path.join(baseDir, 'public', 'models', 'tuku_blockout_v02.glb');
  const artPath = path.join(baseDir, 'art-source', 'tuku_blockout_v02.glb');

  fs.writeFileSync(pubPath, glbBuffer);
  fs.writeFileSync(artPath, glbBuffer);

  console.log(`Successfully generated Refined Modern Cartoon Tuku v0.6.1 GLB!`);
  console.log(`File size: ${glbBuffer.length} bytes`);
}

buildModernCartoonTuku();
