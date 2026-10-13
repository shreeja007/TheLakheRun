const fs = require('fs');
const path = require('path');
const { GLBBuilder } = require('./glb_builder.cjs');

function hexToRgba(hexStr, a = 1.0) {
  const h = hexStr.replace('#', '');
  return [
    parseInt(h.substring(0, 2), 16) / 255.0,
    parseInt(h.substring(2, 4), 16) / 255.0,
    parseInt(h.substring(4, 6), 16) / 255.0,
    a
  ];
}

function buildStylizedTukuV5() {
  console.log('Building Masterpiece Stylized Tuku 3D Character (v0.5)...');
  const builder = new GLBBuilder();

  // =========================================================================
  // 1. PBR MATERIALS (Kathmandu Youth Festival Palette)
  // Perfectly calibrated for PlayCanvas WebGL lighting
  // =========================================================================
  const matTeal = builder.addMaterial('Mat_TealJacket', {
    baseColor: hexToRgba('#2B7A77'), // Rich Dusty Teal
    roughness: 0.52,
    metallic: 0.02
  });

  const matTealDark = builder.addMaterial('Mat_TealDarkTrim', {
    baseColor: hexToRgba('#1B5350'), // Deep Teal Trim / Ribbing / Hood
    roughness: 0.60,
    metallic: 0.02
  });

  const matCreamShirt = builder.addMaterial('Mat_CreamShirt', {
    baseColor: hexToRgba('#EAE2D2'), // Warm Off-White Cotton
    roughness: 0.70,
    metallic: 0.0
  });

  const matPants = builder.addMaterial('Mat_CharcoalPants', {
    baseColor: hexToRgba('#2B3237'), // Charcoal Twill Joggers
    roughness: 0.62,
    metallic: 0.02
  });

  const matPantsAccent = builder.addMaterial('Mat_PantsAccent', {
    baseColor: hexToRgba('#22282C'), // Knee and Pocket Trim
    roughness: 0.68,
    metallic: 0.02
  });

  const matScarf = builder.addMaterial('Mat_MaroonScarf', {
    baseColor: hexToRgba('#8A3C46'), // Brick Maroon
    roughness: 0.60,
    metallic: 0.0
  });

  const matBag = builder.addMaterial('Mat_CharcoalBag', {
    baseColor: hexToRgba('#222629'), // Tactical Messenger Canvas / Sneaker Upper
    roughness: 0.52,
    metallic: 0.06
  });

  const matMarigold = builder.addMaterial('Mat_MarigoldAccent', {
    baseColor: hexToRgba('#DEA94B'), // Brass / Marigold Accent
    roughness: 0.30,
    metallic: 0.30
  });

  // Warm Kathmandu Skin Tone with subtle subsurface warmth
  const matSkin = builder.addMaterial('Mat_WarmSkin', {
    baseColor: hexToRgba('#C9966A'),
    roughness: 0.50,
    metallic: 0.0,
    emissive: [0.10, 0.06, 0.04] // Soft ambient warmth keeps face expressive in deep shadows
  });

  const matHair = builder.addMaterial('Mat_DarkHair', {
    baseColor: hexToRgba('#1A1E21'), // Stylized Anime Dark Hair
    roughness: 0.42,
    metallic: 0.05
  });

  const matEyeWhite = builder.addMaterial('Mat_EyeWhite', {
    baseColor: hexToRgba('#F8FAFC'),
    roughness: 0.15,
    metallic: 0.0,
    emissive: [0.15, 0.15, 0.18] // Keep sclera bright and readable
  });

  const matEyePupil = builder.addMaterial('Mat_EyePupil', {
    baseColor: hexToRgba('#121518'),
    roughness: 0.10,
    metallic: 0.0
  });

  const matEyeGlint = builder.addMaterial('Mat_EyeGlint', {
    baseColor: hexToRgba('#FFFFFF'),
    roughness: 0.05,
    metallic: 0.0,
    emissive: [0.5, 0.5, 0.5]
  });

  const matEyebrow = builder.addMaterial('Mat_Eyebrow', {
    baseColor: hexToRgba('#16191B'),
    roughness: 0.70,
    metallic: 0.0
  });

  const matLip = builder.addMaterial('Mat_LipAccent', {
    baseColor: hexToRgba('#9C5B52'),
    roughness: 0.50,
    metallic: 0.0
  });

  const matSole = builder.addMaterial('Mat_CreamSole', {
    baseColor: hexToRgba('#D8CFBF'), // EVA Foam Midsole
    roughness: 0.60,
    metallic: 0.0
  });

  const matOutsole = builder.addMaterial('Mat_DarkOutsole', {
    baseColor: hexToRgba('#181B1D'), // Tread Rubber
    roughness: 0.80,
    metallic: 0.0
  });

  // =========================================================================
  // 2. TORSO MESH (Pivot at Y = 0.86m)
  // Continuous anatomical silhouette with layered streetwear:
  // Pelvis -> Cream Longline Shirt -> Cropped Teal Jacket -> Collar & Hood
  // =========================================================================
  const { mesh: torsoMesh, index: torsoMeshIdx } = builder.createMesh('Torso_Mesh');

  // A. Pelvis & Crotch Foundation (Charcoal Joggers)
  torsoMesh.addLoft({
    slices: [
      { y: -0.16, rx: 0.145, rz: 0.108 }, // Crotch base (bridges thighs seamlessly!)
      { y: -0.10, rx: 0.158, rz: 0.118 }, // Low hip
      { y: -0.04, rx: 0.164, rz: 0.124 }, // Glute crest
      { y:  0.02, rx: 0.162, rz: 0.122 }  // Pants waistband
    ],
    segments: 20,
    capBottom: true,
    materialIndex: matPants
  });

  // B. Longline Cream Inner Shirt (Extends 8-10 cm below jacket hem)
  torsoMesh.addLoft({
    slices: [
      { y: -0.05, rx: 0.168, rz: 0.128 }, // Lower shirt hem edge
      { y:  0.03, rx: 0.166, rz: 0.126 }, // Mid hem
      { y:  0.11, rx: 0.164, rz: 0.124 }, // Disappears beneath cropped jacket
      { y:  0.22, rx: 0.155, rz: 0.118 }, // Inner chest core
      { y:  0.34, rx: 0.160, rz: 0.122 }  // Upper chest core
    ],
    segments: 20,
    materialIndex: matCreamShirt
  });

  // Vertical Cream Chest Placket (Visible through open jacket front)
  torsoMesh.addBox({
    size: [0.082, 0.32, 0.012],
    center: [0, 0.26, -0.140],
    materialIndex: matCreamShirt
  });

  // C. Cropped Teal Bomber Jacket (Athletic V-taper)
  // Waistband Ribbing
  torsoMesh.addLoft({
    slices: [
      { y: 0.105, rx: 0.170, rz: 0.130 },
      { y: 0.140, rx: 0.173, rz: 0.133 }
    ],
    segments: 20,
    materialIndex: matTealDark
  });

  // Main Jacket Body Loft (From ribs up to shoulders)
  torsoMesh.addLoft({
    slices: [
      { y: 0.140, rx: 0.173, rz: 0.133 }, // Waist hem
      { y: 0.220, rx: 0.180, rz: 0.138 }, // Athletic waist
      { y: 0.320, rx: 0.198, rz: 0.150 }, // Full chest
      { y: 0.400, rx: 0.208, rz: 0.146 }, // Broad shoulders
      { y: 0.450, rx: 0.180, rz: 0.130 }, // Trapezius slope
      { y: 0.480, rx: 0.100, rz: 0.090 }  // Base of neck collar
    ],
    segments: 22,
    materialIndex: matTeal
  });

  // Standing Jacket Collar Ring
  torsoMesh.addHorizontalTorus({
    radius: 0.088,
    tube: 0.020,
    radialSegments: 12,
    tubularSegments: 20,
    scale: [1.05, 1.2, 0.95],
    center: [0, 0.485, 0.0],
    materialIndex: matTealDark
  });

  // Jacket Front Zipper Ribbing Placket (L & R edges)
  torsoMesh.addBox({
    size: [0.015, 0.32, 0.016],
    center: [-0.046, 0.27, -0.143],
    materialIndex: matTealDark
  });
  torsoMesh.addBox({
    size: [0.015, 0.32, 0.016],
    center: [0.046, 0.27, -0.143],
    materialIndex: matTealDark
  });

  // Draped Hood on Back (Signature Streetwear Silhouette from Behind!)
  torsoMesh.addLoft({
    slices: [
      { y: 0.28, rx: 0.085, rz: 0.045, cz: 0.138 }, // Bottom tip of folded hood
      { y: 0.36, rx: 0.125, rz: 0.055, cz: 0.142 }, // Main draped hood pouch
      { y: 0.43, rx: 0.138, rz: 0.052, cz: 0.136 }, // Hood collar rim
      { y: 0.47, rx: 0.105, rz: 0.038, cz: 0.118 }  // Neck seam
    ],
    segments: 18,
    capBottom: true,
    materialIndex: matTeal
  });

  // Hood Inner Shadow Lining
  torsoMesh.addBox({
    size: [0.18, 0.12, 0.015],
    rotation: [18, 0, 0],
    center: [0, 0.38, 0.146],
    materialIndex: matTealDark
  });

  // Tailored Back Yoke Seam (Crisp tailoring detail for trailing camera)
  torsoMesh.addBox({
    size: [0.32, 0.012, 0.010],
    center: [0, 0.365, 0.142],
    materialIndex: matTealDark
  });

  // Diagonal Crossbody Satchel Straps (Wearer Left Shoulder -> Right Hip)
  // Front Diagonal Strap (On chest surface: Z = -0.148)
  torsoMesh.addBox({
    size: [0.036, 0.44, 0.008],
    rotation: [0, 0, 36],
    center: [0.025, 0.29, -0.146],
    materialIndex: matBag
  });
  // Front Strap Tactical Hardware Slider / Accent
  torsoMesh.addBox({
    size: [0.042, 0.032, 0.016],
    rotation: [0, 0, 36],
    center: [0.105, 0.39, -0.144],
    materialIndex: matMarigold
  });
  // Back Diagonal Strap (On back surface: Z = +0.142)
  torsoMesh.addBox({
    size: [0.036, 0.44, 0.008],
    rotation: [0, 0, -36],
    center: [0.025, 0.29, 0.144],
    materialIndex: matBag
  });

  // =========================================================================
  // 3. HEAD & FACE MESH (Pivot at Y = 1.36m, exactly atop collar)
  // Total head top reaches Y = 1.68m!
  // =========================================================================
  const { mesh: headMesh, index: headMeshIdx } = builder.createMesh('Head_Mesh');

  // Gracefully Proportioned Neck (Height = 0.11m, radius 0.055m)
  headMesh.addLoft({
    slices: [
      { y: 0.00, rx: 0.058, rz: 0.055 }, // Sits right inside jacket collar!
      { y: 0.05, rx: 0.054, rz: 0.052 }, // Mid neck
      { y: 0.11, rx: 0.052, rz: 0.050 }  // Meets jawline
    ],
    segments: 16,
    materialIndex: matSkin
  });

  // Snug Maroon Cowl / Folded Neck Scarf
  headMesh.addHorizontalTorus({
    radius: 0.074,
    tube: 0.024,
    radialSegments: 14,
    tubularSegments: 20,
    scale: [1.12, 1.25, 0.98],
    center: [0, 0.038, 0.002],
    materialIndex: matScarf
  });

  // Scarf Front Knot on Wearer's Left Collar
  headMesh.addSphere({
    radius: 0.025,
    widthSegments: 10,
    heightSegments: 8,
    scale: [0.95, 1.15, 0.85],
    center: [0.052, 0.028, -0.072],
    materialIndex: matScarf
  });

  // Sculpted Stylized Face & Cranium (Pixar/Anime proportions)
  headMesh.addLoft({
    slices: [
      { y: 0.08, rx: 0.038, rz: 0.038, cz: -0.028 }, // Defined young adult chin tip
      { y: 0.12, rx: 0.065, rz: 0.060, cz: -0.016 }, // Tapered jawline
      { y: 0.16, rx: 0.078, rz: 0.075, cz: -0.006 }, // Cheeks & mouth level
      { y: 0.20, rx: 0.084, rz: 0.082, cz:  0.000 }, // Eye & temple level
      { y: 0.25, rx: 0.082, rz: 0.082, cz:  0.004 }, // Forehead & brow level
      { y: 0.29, rx: 0.075, rz: 0.078, cz:  0.010 }, // Cranium crown
      { y: 0.32, rx: 0.035, rz: 0.038, cz:  0.012 }  // Top of head (world Y = 1.68m!)
    ],
    segments: 22,
    capTop: true,
    capBottom: true,
    materialIndex: matSkin
  });

  // Stylized Ears
  headMesh.addSphere({
    radius: 0.022,
    widthSegments: 8,
    heightSegments: 6,
    scale: [0.35, 1.20, 0.75],
    rotation: [0, 14, -6],
    center: [0.084, 0.195, 0.002],
    materialIndex: matSkin
  });
  headMesh.addSphere({
    radius: 0.022,
    widthSegments: 8,
    heightSegments: 6,
    scale: [0.35, 1.20, 0.75],
    rotation: [0, -14, 6],
    center: [-0.084, 0.195, 0.002],
    materialIndex: matSkin
  });

  // --- Expressive Stylized Eyes (Facing -Z at Z = -0.086) ---
  // Left Eye (Wearer's Left = +X)
  headMesh.addSphere({
    radius: 0.018,
    widthSegments: 10,
    heightSegments: 8,
    scale: [1.25, 0.75, 0.35],
    rotation: [0, 8, -4],
    center: [0.036, 0.202, -0.084],
    materialIndex: matEyeWhite
  });
  headMesh.addSphere({
    radius: 0.010,
    widthSegments: 8,
    heightSegments: 6,
    scale: [0.95, 1.05, 0.25],
    center: [0.036, 0.202, -0.091],
    materialIndex: matEyePupil
  });
  headMesh.addSphere({
    radius: 0.0035,
    widthSegments: 6,
    heightSegments: 4,
    center: [0.040, 0.206, -0.093],
    materialIndex: matEyeGlint
  });

  // Right Eye (Wearer's Right = -X)
  headMesh.addSphere({
    radius: 0.018,
    widthSegments: 10,
    heightSegments: 8,
    scale: [1.25, 0.75, 0.35],
    rotation: [0, -8, 4],
    center: [-0.036, 0.202, -0.084],
    materialIndex: matEyeWhite
  });
  headMesh.addSphere({
    radius: 0.010,
    widthSegments: 8,
    heightSegments: 6,
    scale: [0.95, 1.05, 0.25],
    center: [-0.036, 0.202, -0.091],
    materialIndex: matEyePupil
  });
  headMesh.addSphere({
    radius: 0.0035,
    widthSegments: 6,
    heightSegments: 4,
    center: [-0.032, 0.206, -0.093],
    materialIndex: matEyeGlint
  });

  // Determined Trickster Eyebrows
  headMesh.addBox({
    size: [0.032, 0.007, 0.008],
    rotation: [0, 8, -8],
    center: [0.038, 0.222, -0.086],
    materialIndex: matEyebrow
  });
  headMesh.addBox({
    size: [0.032, 0.007, 0.008],
    rotation: [0, -8, 6],
    center: [-0.038, 0.222, -0.086],
    materialIndex: matEyebrow
  });

  // Stylized Nose Tip
  headMesh.addSphere({
    radius: 0.011,
    widthSegments: 8,
    heightSegments: 6,
    scale: [0.85, 0.90, 1.15],
    center: [0, 0.178, -0.094],
    materialIndex: matSkin
  });

  // Confident Trickster Half-Smirk Mouth
  headMesh.addBox({
    size: [0.026, 0.005, 0.007],
    rotation: [0, 0, 5],
    center: [0.006, 0.144, -0.086],
    materialIndex: matLip
  });

  // --- Sculpted Dark Hair (Flowing, Dynamic Streetwear Hair) ---
  // Main Volume Cap (Envelops cranium and frames face gracefully)
  headMesh.addLoft({
    slices: [
      { y: 0.18, rx: 0.086, rz: 0.076, cz: 0.016 }, // Nape and temple baseline
      { y: 0.24, rx: 0.092, rz: 0.086, cz: 0.014 }, // Temple fullness
      { y: 0.29, rx: 0.088, rz: 0.086, cz: 0.012 }, // Crown volume
      { y: 0.33, rx: 0.052, rz: 0.052, cz: 0.010 }  // Top sweep crest
    ],
    segments: 20,
    capTop: true,
    materialIndex: matHair
  });

  // Sideburn Locks & Temple Framing
  headMesh.addBox({
    size: [0.016, 0.065, 0.036],
    rotation: [10, 8, -6],
    center: [0.082, 0.20, -0.022],
    materialIndex: matHair
  });
  headMesh.addBox({
    size: [0.016, 0.065, 0.036],
    rotation: [10, -8, 6],
    center: [-0.082, 0.20, -0.022],
    materialIndex: matHair
  });

  // Signature Swept Bangs (Framing forehead naturally from right to left)
  headMesh.addLoft({
    slices: [
      { y: 0.235, rx: 0.050, rz: 0.020, cx: -0.015, cz: -0.080 },
      { y: 0.270, rx: 0.072, rz: 0.024, cx: -0.010, cz: -0.076 },
      { y: 0.300, rx: 0.060, rz: 0.022, cx: -0.005, cz: -0.068 }
    ],
    segments: 14,
    rotation: [12, -15, 8],
    materialIndex: matHair
  });

  // Gentle Nape Hair Taper (Clean transition into collar, NO horn cones!)
  headMesh.addLoft({
    slices: [
      { y: 0.11, rx: 0.054, rz: 0.028, cz: 0.052 }, // Meets neck collar smoothly
      { y: 0.16, rx: 0.070, rz: 0.036, cz: 0.056 },
      { y: 0.21, rx: 0.082, rz: 0.044, cz: 0.052 }
    ],
    segments: 16,
    capBottom: true,
    materialIndex: matHair
  });

  // =========================================================================
  // 4. SCARF TAIL MESH (Dynamic wind flutter behind shoulder)
  // Anchored on left shoulder, draped naturally backwards
  // =========================================================================
  const { mesh: scarfTailMesh, index: scarfTailMeshIdx } = builder.createMesh('ScarfTail_Mesh');
  scarfTailMesh.addBox({
    size: [0.040, 0.16, 0.008],
    rotation: [-22, 10, 0], // Drapes naturally backwards over shoulder
    center: [0, -0.070, 0.03],
    materialIndex: matScarf
  });
  // Marigold Border Band
  scarfTailMesh.addBox({
    size: [0.042, 0.020, 0.012],
    rotation: [-22, 10, 0],
    center: [0, -0.140, 0.03],
    materialIndex: matMarigold
  });

  // =========================================================================
  // 5. LEGS & SNEAKERS (Left & Right)
  // Seamless cloth flow with NO robotic joint spheres!
  // Grounded at world Y = 0.00m!
  // =========================================================================
  // --- Left Leg (Upper Thigh) ---
  const { mesh: lThighMesh, index: lThighMeshIdx } = builder.createMesh('LeftLeg_Thigh_Mesh');
  lThighMesh.addLoft({
    slices: [
      { y:  0.00, rx: 0.082, rz: 0.080 }, // Hip socket (merges seamlessly into pelvis!)
      { y: -0.12, rx: 0.074, rz: 0.072 }, // Mid thigh
      { y: -0.26, rx: 0.064, rz: 0.062 }  // Knee junction
    ],
    segments: 16,
    capTop: true,
    materialIndex: matPants
  });
  // Outer Cargo Pocket
  lThighMesh.addBox({
    size: [0.024, 0.095, 0.080],
    center: [0.072, -0.12, 0],
    materialIndex: matPantsAccent
  });

  // --- Left Knee & Calf & Sneaker ---
  const { mesh: lKneeMesh, index: lKneeMeshIdx } = builder.createMesh('LeftKnee_Calf_Mesh');
  // Seamless Knee & Athletic Tapered Runner Calf (Fabric flows over knee!)
  lKneeMesh.addLoft({
    slices: [
      { y:  0.02, rx: 0.064, rz: 0.062 }, // Overlaps thigh naturally with pants fabric
      { y: -0.12, rx: 0.060, rz: 0.065, cz: -0.006 }, // Muscular calf bulge (pushed back)
      { y: -0.24, rx: 0.050, rz: 0.050 }, // Lower calf
      { y: -0.32, rx: 0.046, rz: 0.046 }  // Above ankle cuff
    ],
    segments: 16,
    materialIndex: matPants
  });
  // Jogger Ribbed Elastic Ankle Cuff
  lKneeMesh.addLoft({
    slices: [
      { y: -0.32, rx: 0.047, rz: 0.047 },
      { y: -0.35, rx: 0.044, rz: 0.044 }
    ],
    segments: 14,
    materialIndex: matPantsAccent
  });

  // Sneaker Upper (Ergonomic contoured runner shoe)
  lKneeMesh.addLoft({
    slices: [
      { y: -0.36, rx: 0.046, rz: 0.065, cz: -0.010 }, // Ankle collar
      { y: -0.40, rx: 0.052, rz: 0.095, cz: -0.018 }, // Upper instep & toe box
      { y: -0.43, rx: 0.054, rz: 0.105, cz: -0.018 }  // Base of upper
    ],
    segments: 16,
    materialIndex: matBag
  });
  // Sneaker Padded Tongue
  lKneeMesh.addBox({
    size: [0.070, 0.038, 0.080],
    rotation: [-22, 0, 0],
    center: [0, -0.36, -0.042],
    materialIndex: matTealDark
  });
  // Thick EVA Foam Midsole (Height: 2.8cm)
  lKneeMesh.addBox({
    size: [0.108, 0.026, 0.235],
    center: [0, -0.442, -0.016],
    materialIndex: matSole
  });
  // Grippy Rubber Outsole Tread (Ground contact at Y = -0.46m!)
  lKneeMesh.addBox({
    size: [0.106, 0.012, 0.230],
    center: [0, -0.456, -0.016],
    materialIndex: matOutsole
  });
  // Marigold Heel Pull Tab
  lKneeMesh.addBox({
    size: [0.024, 0.036, 0.012],
    center: [0, -0.385, 0.094],
    materialIndex: matMarigold
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
    materialIndex: matPants
  });
  rThighMesh.addBox({
    size: [0.024, 0.095, 0.080],
    center: [-0.072, -0.12, 0],
    materialIndex: matPantsAccent
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
    materialIndex: matPants
  });
  rKneeMesh.addLoft({
    slices: [
      { y: -0.32, rx: 0.047, rz: 0.047 },
      { y: -0.35, rx: 0.044, rz: 0.044 }
    ],
    segments: 14,
    materialIndex: matPantsAccent
  });
  // Right Sneaker Upper (Correctly attached to rKneeMesh!)
  rKneeMesh.addLoft({
    slices: [
      { y: -0.36, rx: 0.046, rz: 0.065, cz: -0.010 },
      { y: -0.40, rx: 0.052, rz: 0.095, cz: -0.018 },
      { y: -0.43, rx: 0.054, rz: 0.105, cz: -0.018 }
    ],
    segments: 16,
    materialIndex: matBag
  });
  rKneeMesh.addBox({
    size: [0.070, 0.038, 0.080],
    rotation: [-22, 0, 0],
    center: [0, -0.36, -0.042],
    materialIndex: matTealDark
  });
  rKneeMesh.addBox({
    size: [0.108, 0.026, 0.235],
    center: [0, -0.442, -0.016],
    materialIndex: matSole
  });
  rKneeMesh.addBox({
    size: [0.106, 0.012, 0.230],
    center: [0, -0.456, -0.016],
    materialIndex: matOutsole
  });
  rKneeMesh.addBox({
    size: [0.024, 0.036, 0.012],
    center: [0, -0.385, 0.094],
    materialIndex: matMarigold
  });

  // =========================================================================
  // 6. ARMS & HANDS (Left & Right)
  // Continuous sleeve fabric with NO protruding robot spheres!
  // =========================================================================
  // --- Left Arm (Upper Sleeve) ---
  const { mesh: lUpperArmMesh, index: lUpperArmMeshIdx } = builder.createMesh('LeftArm_Upper_Mesh');
  // Seamless Upper Arm Sleeve Loft (Overlaps shoulder naturally)
  lUpperArmMesh.addLoft({
    slices: [
      { y:  0.02, rx: 0.058, rz: 0.055 }, // Deltoid shoulder crest
      { y: -0.11, rx: 0.052, rz: 0.050 }, // Bicep / sleeve mid
      { y: -0.22, rx: 0.046, rz: 0.045 }  // Elbow cuff
    ],
    segments: 16,
    capTop: true,
    center: [0.016, 0, 0],
    materialIndex: matTeal
  });

  // --- Left Forearm & Runner Fist ---
  const { mesh: lForearmMesh, index: lForearmMeshIdx } = builder.createMesh('LeftElbow_Forearm_Mesh');
  // Forearm Sleeve Loft (Overlaps elbow smoothly)
  lForearmMesh.addLoft({
    slices: [
      { y:  0.02, rx: 0.046, rz: 0.045 }, // Elbow overlap
      { y: -0.10, rx: 0.044, rz: 0.042 }, // Forearm
      { y: -0.18, rx: 0.040, rz: 0.039 }  // Wrist
    ],
    segments: 14,
    center: [0.012, 0, 0],
    materialIndex: matTeal
  });
  // Ribbed Wrist Cuff
  lForearmMesh.addLoft({
    slices: [
      { y: -0.18, rx: 0.041, rz: 0.040 },
      { y: -0.21, rx: 0.038, rz: 0.038 }
    ],
    segments: 12,
    center: [0.012, 0, 0],
    materialIndex: matTealDark
  });
  // Stylized Clenched Runner Fist
  lForearmMesh.addSphere({
    radius: 0.034,
    widthSegments: 10,
    heightSegments: 8,
    scale: [0.92, 1.15, 0.85],
    center: [0.012, -0.245, 0],
    materialIndex: matSkin
  });
  // Thumb Fold
  lForearmMesh.addBox({
    size: [0.016, 0.028, 0.018],
    rotation: [0, 0, -22],
    center: [0.032, -0.238, -0.012],
    materialIndex: matSkin
  });

  // --- Right Arm (Upper Sleeve) ---
  const { mesh: rUpperArmMesh, index: rUpperArmMeshIdx } = builder.createMesh('RightArm_Upper_Mesh');
  rUpperArmMesh.addLoft({
    slices: [
      { y:  0.02, rx: 0.058, rz: 0.055 },
      { y: -0.11, rx: 0.052, rz: 0.050 },
      { y: -0.22, rx: 0.046, rz: 0.045 }
    ],
    segments: 16,
    capTop: true,
    center: [-0.016, 0, 0],
    materialIndex: matTeal
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
    materialIndex: matTeal
  });
  rForearmMesh.addLoft({
    slices: [
      { y: -0.18, rx: 0.041, rz: 0.040 },
      { y: -0.21, rx: 0.038, rz: 0.038 }
    ],
    segments: 12,
    center: [-0.012, 0, 0],
    materialIndex: matTealDark
  });
  rForearmMesh.addSphere({
    radius: 0.034,
    widthSegments: 10,
    heightSegments: 8,
    scale: [0.92, 1.15, 0.85],
    center: [-0.012, -0.245, 0],
    materialIndex: matSkin
  });
  rForearmMesh.addBox({
    size: [0.016, 0.028, 0.018],
    rotation: [0, 0, 22],
    center: [-0.032, -0.238, -0.012],
    materialIndex: matSkin
  });

  // =========================================================================
  // 7. CROSSBODY MESSENGER SATCHEL (Pivot at Y = 0.90m, X = -0.18m)
  // =========================================================================
  const { mesh: satchelMesh, index: satchelMeshIdx } = builder.createMesh('Satchel_Mesh');
  // Structured Pouch Body (Contoured against right-rear hip)
  satchelMesh.addBox({
    size: [0.158, 0.135, 0.082],
    rotation: [0, -10, 0],
    center: [0, 0, 0],
    materialIndex: matBag
  });
  // Top Flap with subtle slope
  satchelMesh.addBox({
    size: [0.164, 0.075, 0.088],
    rotation: [0, -10, 0],
    center: [0, 0.038, 0],
    materialIndex: matBag
  });
  // Dual Tactical Marigold Buckles
  satchelMesh.addBox({
    size: [0.018, 0.052, 0.012],
    rotation: [0, -10, 0],
    center: [-0.042, 0.012, -0.044],
    materialIndex: matMarigold
  });
  satchelMesh.addBox({
    size: [0.018, 0.052, 0.012],
    rotation: [0, -10, 0],
    center: [0.042, 0.012, -0.044],
    materialIndex: matMarigold
  });

  // =========================================================================
  // 8. ASSEMBLE RIG SKELETON (Semantic Node Hierarchy for PlayerController)
  // =========================================================================
  // 1. TorsoRoot (World Y = 0.86m)
  const nodeTorso = builder.addNode({
    name: 'TorsoRoot',
    translation: [0, 0.86, 0],
    meshIndex: torsoMeshIdx
  });

  // 2. HeadRoot (World Y = 1.36m, exactly atop collar)
  const nodeHead = builder.addNode({
    name: 'HeadRoot',
    translation: [0, 1.36, 0],
    meshIndex: headMeshIdx
  });

  // 2b. ScarfTailRoot (Child of HeadRoot, anchored at shoulder)
  const nodeScarfTail = builder.addNode({
    name: 'ScarfTailRoot',
    translation: [0.065, 0.04, 0.045],
    meshIndex: scarfTailMeshIdx
  });
  builder.addChild(nodeHead, nodeScarfTail);

  // 3. LeftLegRoot (Hip at [0.095, 0.72, 0])
  const nodeLeftLeg = builder.addNode({
    name: 'LeftLegRoot',
    translation: [0.095, 0.72, 0],
    meshIndex: lThighMeshIdx
  });

  // 3b. LeftKneeRoot (Knee at Y = -0.26 relative to hip)
  const nodeLeftKnee = builder.addNode({
    name: 'LeftKneeRoot',
    translation: [0, -0.26, 0],
    meshIndex: lKneeMeshIdx
  });
  builder.addChild(nodeLeftLeg, nodeLeftKnee);

  // 4. RightLegRoot (Hip at [-0.095, 0.72, 0])
  const nodeRightLeg = builder.addNode({
    name: 'RightLegRoot',
    translation: [-0.095, 0.72, 0],
    meshIndex: rThighMeshIdx
  });

  // 4b. RightKneeRoot (Knee at Y = -0.26 relative to hip)
  const nodeRightKnee = builder.addNode({
    name: 'RightKneeRoot',
    translation: [0, -0.26, 0],
    meshIndex: rKneeMeshIdx
  });
  builder.addChild(nodeRightLeg, nodeRightKnee);

  // 5. LeftArmRoot (Shoulder at [0.19, 1.30, 0])
  const nodeLeftArm = builder.addNode({
    name: 'LeftArmRoot',
    translation: [0.19, 1.30, 0],
    meshIndex: lUpperArmMeshIdx
  });

  // 5b. LeftElbowRoot (Elbow at Y = -0.22 relative to shoulder)
  const nodeLeftElbow = builder.addNode({
    name: 'LeftElbowRoot',
    translation: [0.016, -0.22, 0],
    meshIndex: lForearmMeshIdx
  });
  builder.addChild(nodeLeftArm, nodeLeftElbow);

  // 6. RightArmRoot (Shoulder at [-0.19, 1.30, 0])
  const nodeRightArm = builder.addNode({
    name: 'RightArmRoot',
    translation: [-0.19, 1.30, 0],
    meshIndex: rUpperArmMeshIdx
  });

  // 6b. RightElbowRoot (Elbow at Y = -0.22 relative to shoulder)
  const nodeRightElbow = builder.addNode({
    name: 'RightElbowRoot',
    translation: [-0.016, -0.22, 0],
    meshIndex: rForearmMeshIdx
  });
  builder.addChild(nodeRightArm, nodeRightElbow);

  // 7. SatchelRoot (Right hip anchor at [-0.17, 0.90, 0.08])
  const nodeSatchel = builder.addNode({
    name: 'SatchelRoot',
    translation: [-0.17, 0.90, 0.08],
    meshIndex: satchelMeshIdx
  });

  // Build the binary GLB!
  const glbBuffer = builder.build();

  const baseDir = path.dirname(__dirname);
  const pubPath = path.join(baseDir, 'public', 'models', 'tuku_blockout_v02.glb');
  const artPath = path.join(baseDir, 'art-source', 'tuku_blockout_v02.glb');

  fs.writeFileSync(pubPath, glbBuffer);
  fs.writeFileSync(artPath, glbBuffer);

  console.log(`Successfully generated Masterpiece Stylized Tuku v0.5 GLB!`);
  console.log(`File size: ${glbBuffer.length} bytes`);
  console.log(`Saved to: ${pubPath} and ${artPath}`);
}

buildStylizedTukuV5();
