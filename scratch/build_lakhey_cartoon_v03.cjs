const fs = require('fs');
const path = require('path');
const { GLBBuilder } = require('./glb_builder.cjs');

function buildModernCartoonLakhey() {
  console.log('Building Refined Modern Cartoon / Illustrated Lakhey Guardian 3D Character (v0.3.3 Exact Calibration)...');

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

  // Solid Ivory Material for 3D Projected Guardian Fangs
  const matIvory = builder.addMaterial('Mat_IvoryFangs', {
    baseColor: [1.0, 0.98, 0.92, 1.0],
    roughness: 0.25,
    metallic: 0.0
  });

  // Radiant Burnished Gold for Mukut Crown, Jewelry & Hardware
  const matGoldAccent = builder.addMaterial('Mat_GoldAccent', {
    baseColor: [0.98, 0.76, 0.22, 1.0],
    roughness: 0.30,
    metallic: 0.50
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
  // =========================================================================
  const { mesh: torsoMesh, index: torsoMeshIdx } = builder.createMesh('Torso_Mesh');

  // A. Flared Pleated Skirt (Jama) Loft (Waist Y = 0.05m down to Knee Hem Y = -0.52m)
  torsoMesh.addLoft({
    slices: [
      { y: -0.52, rx: 0.56, rz: 0.38 }, // Flared hem
      { y: -0.42, rx: 0.50, rz: 0.35 }, // Lower brocade band
      { y: -0.28, rx: 0.43, rz: 0.30 }, // Mid flare
      { y: -0.14, rx: 0.38, rz: 0.27 }, // Upper flare
      { y: -0.02, rx: 0.34, rz: 0.25 }, // Under-belt drape
      { y:  0.05, rx: 0.32, rz: 0.24 }  // Waist transition
    ],
    segments: 24,
    capBottom: true,
    materialIndex: matCartoon,
    uvBounds: UV_ROBE_FABRIC,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });

  // Skirt Hem Border Band (Kinari)
  torsoMesh.addLoft({
    slices: [
      { y: -0.525, rx: 0.565, rz: 0.385 },
      { y: -0.420, rx: 0.505, rz: 0.355 }
    ],
    segments: 24,
    materialIndex: matCartoon,
    uvBounds: UV_SKIRT_HEM,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY * 0.7
  });

  // B. Ceremonial Belt (Kamarbandh) Loft wrapping waist
  torsoMesh.addLoft({
    slices: [
      { y: -0.045, rx: 0.355, rz: 0.255 },
      { y:  0.035, rx: 0.355, rz: 0.255 }
    ],
    segments: 22,
    materialIndex: matCartoon,
    uvBounds: UV_BELT,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });

  // Central Sunburst Medallion at front of belt
  torsoMesh.addCylinder({
    radiusTop: 0.09,
    radiusBottom: 0.09,
    height: 0.03,
    segments: 16,
    rotation: [90, 0, 0],
    center: [0, 0.00, -0.26],
    materialIndex: matCartoon,
    uvBounds: UV_MEDALLION,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });

  // Vertical Embroidered Sash Panel (Patuka) hanging down front of skirt
  torsoMesh.addBox({
    size: [0.22, 0.48, 0.02],
    center: [0, -0.24, -0.32],
    materialIndex: matCartoon,
    uvBounds: UV_SASH,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });

  // C. Athletic Upper Chest & Tunic Loft
  torsoMesh.addLoft({
    slices: [
      { y: 0.02, rx: 0.32, rz: 0.24 },
      { y: 0.16, rx: 0.36, rz: 0.26 },
      { y: 0.32, rx: 0.42, rz: 0.28 },
      { y: 0.46, rx: 0.45, rz: 0.27 },
      { y: 0.54, rx: 0.43, rz: 0.25 }
    ],
    segments: 24,
    materialIndex: matCartoon,
    uvBounds: UV_ROBE_FABRIC,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });

  // D. Golden Sunburst Yoke Breastplate (Galbandi Collar)
  torsoMesh.addBox({
    size: [0.46, 0.32, 0.025],
    center: [0, 0.34, -0.27],
    materialIndex: matCartoon,
    uvBounds: UV_YOKE,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY * 0.8
  });

  // Golden Collar Ring wrapping neck opening
  torsoMesh.addCylinder({
    radiusTop: 0.18,
    radiusBottom: 0.20,
    height: 0.04,
    segments: 18,
    center: [0, 0.53, -0.04],
    materialIndex: matGoldAccent,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });

  // E. Shoulder Pauldron Epaulets (Left & Right)
  torsoMesh.addSphere({
    radius: 0.14,
    widthSegments: 12,
    heightSegments: 8,
    scale: [1.15, 0.75, 1.15],
    center: [0.44, 0.48, 0],
    materialIndex: matGoldAccent,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });
  torsoMesh.addSphere({
    radius: 0.14,
    widthSegments: 12,
    heightSegments: 8,
    scale: [1.15, 0.75, 1.15],
    center: [-0.44, 0.48, 0],
    materialIndex: matGoldAccent,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });

  // =========================================================================
  // 3. HEAD MESH (Pivot at [0, 1.88, 0])
  // Exact Mathematical Calibration of Kathmandu Guardian Visage!
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

  // C. Front Theatrical Guardian Mask Slice (Accurately Calibrated UVs!)
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

      // Mathematically calibrated to Quadrant 1 (512x512 quadrant in 2048x2048 atlas)
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

  // D. 3D Golden Mukut (Crown / Crest) Flames atop Forehead
  // Center Flame Peak (Grand)
  headMesh.addCone({
    radius: 0.065,
    height: 0.25,
    segments: 10,
    center: [0, 0.42, -0.22],
    rotation: [-12, 0, 0],
    materialIndex: matGoldAccent,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });
  // Left Flame Peak
  headMesh.addCone({
    radius: 0.048,
    height: 0.18,
    segments: 8,
    center: [0.11, 0.38, -0.20],
    rotation: [-10, 0, -18],
    materialIndex: matGoldAccent,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });
  // Right Flame Peak
  headMesh.addCone({
    radius: 0.048,
    height: 0.18,
    segments: 8,
    center: [-0.11, 0.38, -0.20],
    rotation: [-10, 0, 18],
    materialIndex: matGoldAccent,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });

  // Crown Base Gold Arch Band
  headMesh.addBox({
    size: [0.36, 0.05, 0.04],
    center: [0, 0.29, -0.21],
    rotation: [-8, 0, 0],
    materialIndex: matGoldAccent,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });

  // E. 3D Projected Ivory Guardian Fangs (Precisely matching texture mouth corners!)
  headMesh.addCone({
    radius: 0.032,
    height: 0.12,
    segments: 8,
    center: [0.13, 0.00, -0.26],
    rotation: [168, 0, 16],
    materialIndex: matIvory,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });
  headMesh.addCone({
    radius: 0.032,
    height: 0.12,
    segments: 8,
    center: [-0.13, 0.00, -0.26],
    rotation: [168, 0, -16],
    materialIndex: matIvory,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });

  // =========================================================================
  // 4. MANE MESH (Pivot at [0, 2.00, 0.10])
  // =========================================================================
  const { mesh: maneMesh, index: maneMeshIdx } = builder.createMesh('Mane_Mesh');

  // A. Mane Crown Dome (Sitting atop and BEHIND head, Z center at +0.18)
  maneMesh.addSphere({
    radius: 0.32,
    widthSegments: 16,
    heightSegments: 12,
    scale: [1.22, 1.15, 0.90],
    center: [0, 0.20, 0.18],
    materialIndex: matCartoon,
    uvBounds: UV_MANE,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });

  // B. Flared Side Crest Hair Tufts (Left & Right) sweeping outward
  maneMesh.addCone({
    radius: 0.12,
    height: 0.42,
    segments: 10,
    center: [0.32, 0.22, 0.12],
    rotation: [-20, 0, -32],
    materialIndex: matCartoon,
    uvBounds: UV_MANE,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });
  maneMesh.addCone({
    radius: 0.12,
    height: 0.42,
    segments: 10,
    center: [-0.32, 0.22, 0.12],
    rotation: [-20, 0, 32],
    materialIndex: matCartoon,
    uvBounds: UV_MANE,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });

  maneMesh.addCone({
    radius: 0.11,
    height: 0.38,
    segments: 10,
    center: [0.36, 0.02, 0.10],
    rotation: [-10, 0, -24],
    materialIndex: matCartoon,
    uvBounds: UV_MANE,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });
  maneMesh.addCone({
    radius: 0.11,
    height: 0.38,
    segments: 10,
    center: [-0.36, 0.02, 0.10],
    rotation: [-10, 0, 24],
    materialIndex: matCartoon,
    uvBounds: UV_MANE,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });

  // C. Mane Upper Back Tier
  maneMesh.addLoft({
    slices: [
      { y:  0.15, rx: 0.42, rz: 0.18, cz: 0.20 },
      { y:  0.00, rx: 0.48, rz: 0.20, cz: 0.22 },
      { y: -0.16, rx: 0.46, rz: 0.19, cz: 0.24 }
    ],
    segments: 18,
    materialIndex: matCartoon,
    uvBounds: UV_MANE,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });

  // D. Mane Mid Back Tier
  maneMesh.addLoft({
    slices: [
      { y: -0.15, rx: 0.44, rz: 0.18, cz: 0.24 },
      { y: -0.32, rx: 0.40, rz: 0.16, cz: 0.26 },
      { y: -0.48, rx: 0.35, rz: 0.14, cz: 0.28 }
    ],
    segments: 16,
    materialIndex: matCartoon,
    uvBounds: UV_MANE,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });

  // E. Mane Lower Back Tresses
  maneMesh.addLoft({
    slices: [
      { y: -0.46, rx: 0.33, rz: 0.13, cz: 0.28 },
      { y: -0.62, rx: 0.26, rz: 0.10, cz: 0.29 },
      { y: -0.74, rx: 0.16, rz: 0.07, cz: 0.30 }
    ],
    segments: 14,
    capBottom: true,
    materialIndex: matCartoon,
    uvBounds: UV_MANE,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });

  // F. Front Shoulder Tresses
  maneMesh.addCapsule({
    radius: 0.08,
    height: 0.52,
    segments: 10,
    rings: 4,
    center: [0.30, -0.18, -0.05],
    rotation: [12, -8, 0],
    materialIndex: matCartoon,
    uvBounds: UV_MANE,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });
  maneMesh.addCapsule({
    radius: 0.08,
    height: 0.52,
    segments: 10,
    rings: 4,
    center: [-0.30, -0.18, -0.05],
    rotation: [12, 8, 0],
    materialIndex: matCartoon,
    uvBounds: UV_MANE,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });

  // =========================================================================
  // 5. LEFT ARM HIERARCHY
  // =========================================================================
  const { mesh: leftArmMesh, index: leftArmMeshIdx } = builder.createMesh('LeftArm_Mesh');

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

  leftElbowMesh.addCylinder({
    radiusTop: 0.112,
    radiusBottom: 0.115,
    height: 0.09,
    segments: 16,
    center: [0, -0.28, 0],
    materialIndex: matGoldAccent,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });

  const ribbonDefs = [
    { uv: UV_RIBBON_YELLOW, xOff:  0.06, zOff:  0.06, rotZ:  12, rotX: 18 },
    { uv: UV_RIBBON_BLUE,   xOff:  0.06, zOff: -0.06, rotZ:   8, rotX: 24 },
    { uv: UV_RIBBON_PINK,   xOff: -0.06, zOff:  0.06, rotZ: -10, rotX: 15 },
    { uv: UV_RIBBON_GREEN,  xOff: -0.06, zOff: -0.06, rotZ:  -6, rotX: 20 },
  ];

  for (const rib of ribbonDefs) {
    leftElbowMesh.addBox({
      size: [0.05, 0.40, 0.008],
      center: [rib.xOff, -0.44, rib.zOff],
      rotation: [rib.rotX, 0, rib.rotZ],
      materialIndex: matCartoon,
      uvBounds: rib.uv,
      outlineMaterialIndex: matInk,
      outlineThickness: OUTLINE_DETAIL
    });
  }

  leftElbowMesh.addBox({
    size: [0.11, 0.15, 0.08],
    center: [0, -0.38, 0],
    materialIndex: matCartoon,
    uvBounds: UV_SKIN_RED,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });

  // =========================================================================
  // 6. RIGHT ARM HIERARCHY
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
    radiusTop: 0.112,
    radiusBottom: 0.115,
    height: 0.09,
    segments: 16,
    center: [0, -0.28, 0],
    materialIndex: matGoldAccent,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });

  for (const rib of ribbonDefs) {
    rightElbowMesh.addBox({
      size: [0.05, 0.40, 0.008],
      center: [-rib.xOff, -0.44, rib.zOff],
      rotation: [rib.rotX, 0, -rib.rotZ],
      materialIndex: matCartoon,
      uvBounds: rib.uv,
      outlineMaterialIndex: matInk,
      outlineThickness: OUTLINE_DETAIL
    });
  }

  rightElbowMesh.addBox({
    size: [0.11, 0.15, 0.08],
    center: [0, -0.38, 0],
    materialIndex: matCartoon,
    uvBounds: UV_SKIN_RED,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });

  // Sacred Chāmara (Yak-Hair Fly-Whisk) Mesh
  const { mesh: chamaraMesh, index: chamaraMeshIdx } = builder.createMesh('Chamara_Mesh');

  chamaraMesh.addCylinder({
    radiusTop: 0.024,
    radiusBottom: 0.022,
    height: 0.42,
    segments: 12,
    center: [0, 0.08, 0],
    materialIndex: matCartoon,
    uvBounds: UV_CHAMARA_HANDLE,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });

  chamaraMesh.addSphere({
    radius: 0.038,
    widthSegments: 10,
    heightSegments: 6,
    center: [0, -0.12, 0],
    materialIndex: matGoldAccent,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });

  chamaraMesh.addCylinder({
    radiusTop: 0.055,
    radiusBottom: 0.035,
    height: 0.06,
    segments: 12,
    center: [0, 0.28, 0],
    materialIndex: matGoldAccent,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });

  chamaraMesh.addLoft({
    slices: [
      { y: 0.28, rx: 0.06, rz: 0.06 },
      { y: 0.42, rx: 0.13, rz: 0.13 },
      { y: 0.58, rx: 0.15, rz: 0.15 },
      { y: 0.72, rx: 0.11, rz: 0.11 },
      { y: 0.82, rx: 0.02, rz: 0.02 }
    ],
    segments: 18,
    capTop: true,
    capBottom: true,
    materialIndex: matCartoon,
    uvBounds: UV_CHAMARA_PLUME,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });

  // =========================================================================
  // 7. LEFT & RIGHT LEG HIERARCHIES
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

    shinMesh.addCylinder({
      radiusTop: 0.115,
      radiusBottom: 0.120,
      height: 0.07,
      segments: 16,
      center: [0, -0.24, -0.01],
      materialIndex: matCartoon,
      uvBounds: UV_BOOT_BELLS,
      outlineMaterialIndex: matInk,
      outlineThickness: OUTLINE_BODY
    });

    shinMesh.addBox({
      size: [0.19, 0.13, 0.28],
      center: [0, -0.31, -0.04],
      materialIndex: matCartoon,
      uvBounds: UV_BOOT_LEATHER,
      outlineMaterialIndex: matInk,
      outlineThickness: OUTLINE_BODY
    });

    shinMesh.addCone({
      radius: 0.055,
      height: 0.14,
      segments: 8,
      center: [0, -0.27, -0.20],
      rotation: [42, 0, 0],
      materialIndex: matGoldAccent,
      outlineMaterialIndex: matInk,
      outlineThickness: OUTLINE_DETAIL
    });

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

  console.log(`Successfully built Lakhey v0.3.3 Modern Cartoon GLB!`);
  console.log(`Saved to: ${publicGlbPath} (${(glbBuffer.length / 1024).toFixed(1)} KB)`);
}

buildModernCartoonLakhey();
