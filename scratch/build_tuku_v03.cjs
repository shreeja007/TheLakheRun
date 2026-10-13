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

function buildEnhancedTuku() {
  console.log('Building High-Fidelity Stylized Tuku 3D Character (v0.3)...');
  const builder = new GLBBuilder();

  // =========================================================================
  // 1. PBR MATERIALS (Kathmandu Youth Festival Palette)
  // Perfectly calibrated for PlayCanvas WebGL lighting
  // =========================================================================

  // Teal Jacket: Rich Dusty Teal (#2F7875)
  const matTeal = builder.addMaterial('Mat_TealJacket', {
    baseColor: hexToRgba('#2B7572'),
    roughness: 0.60,
    metallic: 0.02
  });

  // Teal Jacket Dark Trim & Ribbing (#1F5653)
  const matTealDark = builder.addMaterial('Mat_TealDarkTrim', {
    baseColor: hexToRgba('#1D524F'),
    roughness: 0.65,
    metallic: 0.02
  });

  // Longline Inner Shirt: Warm Cream Cotton (#E8DDCA)
  const matCreamShirt = builder.addMaterial('Mat_CreamShirt', {
    baseColor: hexToRgba('#EAE0CE'),
    roughness: 0.70,
    metallic: 0.0
  });

  // Charcoal Tapered Cargo Joggers (#2D3438)
  const matPants = builder.addMaterial('Mat_CharcoalPants', {
    baseColor: hexToRgba('#2B3236'),
    roughness: 0.65,
    metallic: 0.02
  });

  // Charcoal Knee Patch & Ankle Cuffs (#202629)
  const matPantsAccent = builder.addMaterial('Mat_PantsAccent', {
    baseColor: hexToRgba('#1F2427'),
    roughness: 0.70,
    metallic: 0.02
  });

  // Maroon Neck Cowl / Scarf (#8C414B)
  const matScarf = builder.addMaterial('Mat_MaroonScarf', {
    baseColor: hexToRgba('#8A3C46'),
    roughness: 0.60,
    metallic: 0.0
  });

  // Crossbody Tactical Satchel Canvas (#24282B)
  const matBag = builder.addMaterial('Mat_CharcoalBag', {
    baseColor: hexToRgba('#202427'),
    roughness: 0.55,
    metallic: 0.08
  });

  // Marigold Gold Accents (#DEA94B)
  const matMarigold = builder.addMaterial('Mat_MarigoldAccent', {
    baseColor: hexToRgba('#DEA94B'),
    roughness: 0.35,
    metallic: 0.20
  });

  // Warm Nepali Skin Tone (#C89568)
  const matSkin = builder.addMaterial('Mat_WarmSkin', {
    baseColor: hexToRgba('#C9966A'),
    roughness: 0.55,
    metallic: 0.0
  });

  // Stylized Dark Anime Hair (#212528)
  const matHair = builder.addMaterial('Mat_DarkHair', {
    baseColor: hexToRgba('#1E2225'),
    roughness: 0.45,
    metallic: 0.06
  });

  // Eye Sclera: Clean Off-White (#F8FAFC)
  const matEyeWhite = builder.addMaterial('Mat_EyeWhite', {
    baseColor: hexToRgba('#F8FAFC'),
    roughness: 0.20,
    metallic: 0.0
  });

  // Eye Pupil/Iris: Espresso Black (#16181B)
  const matEyePupil = builder.addMaterial('Mat_EyePupil', {
    baseColor: hexToRgba('#15181B'),
    roughness: 0.15,
    metallic: 0.0
  });

  // Eye Specular Highlight: Pure White (#FFFFFF)
  const matEyeGlint = builder.addMaterial('Mat_EyeGlint', {
    baseColor: hexToRgba('#FFFFFF'),
    roughness: 0.10,
    metallic: 0.0
  });

  // Eyebrows & Mouth Smirk Line (#181B1D)
  const matEyebrow = builder.addMaterial('Mat_Eyebrow', {
    baseColor: hexToRgba('#16191B'),
    roughness: 0.75,
    metallic: 0.0
  });

  // Sneaker Foam Midsole: Warm Cream (#D7CDBE)
  const matSole = builder.addMaterial('Mat_CreamSole', {
    baseColor: hexToRgba('#D8CFC1'),
    roughness: 0.60,
    metallic: 0.0
  });

  // Sneaker Dark Rubber Outsole (#1A1D20)
  const matOutsole = builder.addMaterial('Mat_DarkOutsole', {
    baseColor: hexToRgba('#181B1D'),
    roughness: 0.80,
    metallic: 0.0
  });

  // =========================================================================
  // 2. TORSO MESH (Pivot at Y = 0.86m)
  // Height from Pelvis (Y = 0.74m) to Shoulders (Y = 1.34m)
  // =========================================================================
  const { mesh: torsoMesh, index: torsoMeshIdx } = builder.createMesh('Torso_Mesh');

  // Pelvis / Hips (Charcoal jogger waistband)
  torsoMesh.addCylinder({
    radiusTop: 0.150,
    radiusBottom: 0.142,
    height: 0.13,
    segments: 18,
    scale: [1.0, 1.0, 0.75],
    center: [0, -0.065, 0],
    materialIndex: matPants
  });

  // Longline Shirt Hem (Extends 8-10 cm below cropped jacket)
  // Clean layered tunic split with curved front and back hem
  torsoMesh.addCylinder({
    radiusTop: 0.158,
    radiusBottom: 0.164,
    height: 0.12,
    segments: 18,
    scale: [1.02, 1.0, 0.76],
    center: [0, 0.045, 0],
    materialIndex: matCreamShirt
  });

  // Cropped Teal Jacket - Waistband Ribbing
  torsoMesh.addCylinder({
    radiusTop: 0.166,
    radiusBottom: 0.160,
    height: 0.035,
    segments: 18,
    scale: [1.03, 1.0, 0.78],
    center: [0, 0.115, 0],
    materialIndex: matTealDark
  });

  // Cropped Teal Jacket - Fitted Abdomen & Waist
  torsoMesh.addCylinder({
    radiusTop: 0.180,
    radiusBottom: 0.166,
    height: 0.15,
    segments: 18,
    scale: [1.04, 1.0, 0.78],
    center: [0, 0.205, 0],
    materialIndex: matTeal
  });

  // Cropped Teal Jacket - Upper Chest & Athletic Shoulders (V-taper)
  // Depth (Z): radius 0.198 * 0.78 = 0.154m (half-depth ~0.154m)
  torsoMesh.addCylinder({
    radiusTop: 0.198,
    radiusBottom: 0.180,
    height: 0.18,
    segments: 20,
    scale: [1.05, 1.0, 0.78],
    center: [0, 0.365, 0],
    materialIndex: matTeal
  });

  // Center Cream Shirt Vertical Panel (On front surface: Z = -0.142)
  torsoMesh.addBox({
    size: [0.074, 0.30, 0.010],
    center: [0, 0.26, -0.142],
    materialIndex: matCreamShirt
  });

  // Jacket Front Zipper / Placket Ribbing Edges
  torsoMesh.addBox({
    size: [0.012, 0.30, 0.014],
    center: [-0.040, 0.26, -0.144],
    materialIndex: matTealDark
  });
  torsoMesh.addBox({
    size: [0.012, 0.30, 0.014],
    center: [0.040, 0.26, -0.144],
    materialIndex: matTealDark
  });

  // Draped Jacket Hood on Back (Flat shield fold on back: Z = +0.135)
  torsoMesh.addCylinder({
    radiusTop: 0.095,
    radiusBottom: 0.060,
    height: 0.14,
    segments: 16,
    scale: [1.1, 1.0, 0.45],
    rotation: [15, 0, 0],
    center: [0, 0.33, 0.135],
    materialIndex: matTeal
  });
  torsoMesh.addSphere({
    radius: 0.070,
    widthSegments: 12,
    heightSegments: 8,
    scale: [1.15, 0.45, 0.65],
    center: [0, 0.39, 0.130],
    materialIndex: matTealDark
  });

  // Horizontal Back Yoke Seam (Adds crisp tailoring detail from behind!)
  torsoMesh.addBox({
    size: [0.30, 0.012, 0.008],
    center: [0, 0.355, 0.138],
    materialIndex: matTealDark
  });

  // Diagonal Crossbody Satchel Strap:
  // Front Diagonal Strap (On front chest surface: Z = -0.146)
  torsoMesh.addBox({
    size: [0.034, 0.42, 0.006],
    rotation: [0, 0, 36],
    center: [0.02, 0.29, -0.146],
    materialIndex: matBag
  });
  // Strap Shoulder Buckle / Accent Tab
  torsoMesh.addBox({
    size: [0.040, 0.034, 0.012],
    rotation: [0, 0, 36],
    center: [0.10, 0.39, -0.144],
    materialIndex: matMarigold
  });
  // Back Diagonal Strap (On back surface: Z = +0.138)
  torsoMesh.addBox({
    size: [0.034, 0.42, 0.006],
    rotation: [0, 0, -36],
    center: [0.02, 0.29, 0.138],
    materialIndex: matBag
  });

  // =========================================================================
  // 3. HEAD & FACE MESH (Pivot at Y = 1.43m)
  // Total head top reaches Y = 1.68m
  // =========================================================================
  const { mesh: headMesh, index: headMeshIdx } = builder.createMesh('Head_Mesh');

  // Neck Cylinder
  headMesh.addCylinder({
    radiusTop: 0.052,
    radiusBottom: 0.058,
    height: 0.09,
    segments: 16,
    center: [0, 0.01, 0],
    materialIndex: matSkin
  });

  // Maroon Neck Cowl / Folded Scarf Collar (Snug collar wrap around neck)
  headMesh.addTorus({
    radius: 0.078,
    tube: 0.020,
    radialSegments: 14,
    tubularSegments: 20,
    scale: [1.06, 1.0, 1.0],
    rotation: [4, 0, 0],
    center: [0, 0.022, 0.0],
    materialIndex: matScarf
  });
  // Front Scarf Knot on Wearer's Left
  headMesh.addSphere({
    radius: 0.024,
    widthSegments: 10,
    heightSegments: 8,
    scale: [0.9, 1.1, 0.8],
    center: [0.042, 0.005, -0.075],
    materialIndex: matScarf
  });

  // Sculpted Stylized Head Oval (Center at [0, 0.14, 0.0])
  headMesh.addSphere({
    radius: 0.098,
    widthSegments: 18,
    heightSegments: 14,
    scale: [0.88, 1.12, 0.92],
    center: [0, 0.14, 0.0],
    materialIndex: matSkin
  });

  // Sculpted Chin & Jaw Taper
  headMesh.addCylinder({
    radiusTop: 0.082,
    radiusBottom: 0.038,
    height: 0.075,
    segments: 14,
    scale: [0.85, 1.0, 0.72],
    center: [0, 0.07, -0.028],
    materialIndex: matSkin
  });

  // Ears
  headMesh.addSphere({
    radius: 0.022,
    widthSegments: 8,
    heightSegments: 6,
    scale: [0.35, 1.2, 0.75],
    rotation: [0, 12, -8],
    center: [0.088, 0.13, 0.0],
    materialIndex: matSkin
  });
  headMesh.addSphere({
    radius: 0.022,
    widthSegments: 8,
    heightSegments: 6,
    scale: [0.35, 1.2, 0.75],
    rotation: [0, -12, 8],
    center: [-0.088, 0.13, 0.0],
    materialIndex: matSkin
  });

  // --- Expressive Stylized Eyes (Facing -Z at Z = -0.090) ---
  // Left Eye (Wearer's Left = +X)
  headMesh.addSphere({
    radius: 0.019,
    widthSegments: 10,
    heightSegments: 8,
    scale: [1.2, 0.72, 0.40],
    rotation: [0, 8, -4],
    center: [0.035, 0.146, -0.088],
    materialIndex: matEyeWhite
  });
  headMesh.addSphere({
    radius: 0.011,
    widthSegments: 8,
    heightSegments: 6,
    scale: [0.9, 1.0, 0.30],
    center: [0.035, 0.146, -0.095],
    materialIndex: matEyePupil
  });
  headMesh.addSphere({
    radius: 0.0035,
    widthSegments: 6,
    heightSegments: 4,
    center: [0.039, 0.150, -0.097],
    materialIndex: matEyeGlint
  });

  // Right Eye (Wearer's Right = -X)
  headMesh.addSphere({
    radius: 0.019,
    widthSegments: 10,
    heightSegments: 8,
    scale: [1.2, 0.72, 0.40],
    rotation: [0, -8, 4],
    center: [-0.035, 0.146, -0.088],
    materialIndex: matEyeWhite
  });
  headMesh.addSphere({
    radius: 0.011,
    widthSegments: 8,
    heightSegments: 6,
    scale: [0.9, 1.0, 0.30],
    center: [-0.035, 0.146, -0.095],
    materialIndex: matEyePupil
  });
  headMesh.addSphere({
    radius: 0.0035,
    widthSegments: 6,
    heightSegments: 4,
    center: [-0.031, 0.150, -0.097],
    materialIndex: matEyeGlint
  });

  // Expressive Determined Trickster Eyebrows
  headMesh.addBox({
    size: [0.030, 0.007, 0.008],
    rotation: [0, 8, -8],
    center: [0.036, 0.165, -0.090],
    materialIndex: matEyebrow
  });
  headMesh.addBox({
    size: [0.030, 0.007, 0.008],
    rotation: [0, -8, 6],
    center: [-0.036, 0.165, -0.090],
    materialIndex: matEyebrow
  });

  // Stylized Nose Tip
  headMesh.addSphere({
    radius: 0.011,
    widthSegments: 8,
    heightSegments: 6,
    scale: [0.85, 0.9, 1.1],
    center: [0, 0.124, -0.098],
    materialIndex: matSkin
  });

  // Confident Trickster Half-Smirk Mouth
  headMesh.addBox({
    size: [0.024, 0.005, 0.007],
    rotation: [0, 0, 5],
    center: [0.005, 0.092, -0.090],
    materialIndex: matEyebrow
  });

  // --- Sculpted Dark Hair (Anime/Pixar Stylized Silhouette) ---
  // Crown Top Cap (Sits on top and back of cranium: Y = 0.185, Z = +0.02)
  headMesh.addSphere({
    radius: 0.096,
    widthSegments: 16,
    heightSegments: 12,
    scale: [1.02, 0.85, 1.05],
    center: [0, 0.185, 0.02],
    materialIndex: matHair
  });
  // Side Hair Tufts (Temples and above ears: |X| = 0.082, Z = +0.015)
  headMesh.addSphere({
    radius: 0.052,
    widthSegments: 12,
    heightSegments: 8,
    scale: [1.0, 0.80, 0.9],
    center: [0.075, 0.170, 0.015],
    materialIndex: matHair
  });
  headMesh.addSphere({
    radius: 0.052,
    widthSegments: 12,
    heightSegments: 8,
    scale: [1.0, 0.80, 0.9],
    center: [-0.075, 0.170, 0.015],
    materialIndex: matHair
  });
  // Front Swept Bangs (Sits high on forehead: Y = 0.205, well above eyebrows at Y = 0.165)
  headMesh.addCone({
    radius: 0.035,
    height: 0.08,
    segments: 10,
    rotation: [45, -25, 10],
    center: [-0.028, 0.205, -0.065],
    materialIndex: matHair
  });
  headMesh.addCone({
    radius: 0.032,
    height: 0.07,
    segments: 8,
    rotation: [42, 18, -6],
    center: [0.026, 0.208, -0.058],
    materialIndex: matHair
  });
  // Back Hair Taper (Flows down the back of the neck: Z = +0.075 to +0.085)
  headMesh.addCone({
    radius: 0.048,
    height: 0.13,
    segments: 10,
    rotation: [-35, 8, 0],
    center: [0.015, 0.115, 0.078],
    materialIndex: matHair
  });
  headMesh.addCone({
    radius: 0.042,
    height: 0.11,
    segments: 8,
    rotation: [-32, -10, 0],
    center: [-0.020, 0.125, 0.074],
    materialIndex: matHair
  });

  // =========================================================================
  // 4. SCARF TAIL MESH (Dynamic wind flutter behind shoulder)
  // =========================================================================
  const { mesh: scarfTailMesh, index: scarfTailMeshIdx } = builder.createMesh('ScarfTail_Mesh');
  scarfTailMesh.addBox({
    size: [0.040, 0.18, 0.010],
    rotation: [14, -8, 0],
    center: [0, -0.075, 0.02],
    materialIndex: matScarf
  });
  // Gold Marigold Border Band
  scarfTailMesh.addBox({
    size: [0.042, 0.020, 0.014],
    center: [0, -0.155, 0.02],
    materialIndex: matMarigold
  });

  // =========================================================================
  // 5. LEGS & SNEAKERS (Left & Right)
  // Grounded at world Y = 0.00m!
  // =========================================================================
  // --- Left Leg (Upper Thigh) ---
  const { mesh: lThighMesh, index: lThighMeshIdx } = builder.createMesh('LeftLeg_Thigh_Mesh');
  lThighMesh.addCylinder({
    radiusTop: 0.074,
    radiusBottom: 0.064,
    height: 0.26,
    segments: 16,
    center: [0, -0.13, 0],
    materialIndex: matPants
  });
  // Left Outer Thigh Cargo Pocket
  lThighMesh.addBox({
    size: [0.026, 0.09, 0.080],
    center: [0.070, -0.12, 0],
    materialIndex: matPantsAccent
  });

  // --- Left Knee & Calf & Sneaker ---
  const { mesh: lKneeMesh, index: lKneeMeshIdx } = builder.createMesh('LeftKnee_Calf_Mesh');
  // Articulated Knee Joint Cap
  lKneeMesh.addSphere({
    radius: 0.064,
    widthSegments: 12,
    heightSegments: 8,
    scale: [0.95, 1.0, 1.05],
    center: [0, 0.0, 0.01],
    materialIndex: matPantsAccent
  });
  // Tapered Athletic Calf
  lKneeMesh.addCylinder({
    radiusTop: 0.062,
    radiusBottom: 0.048,
    height: 0.32,
    segments: 16,
    center: [0, -0.16, 0],
    materialIndex: matPants
  });
  // Ankle Ribbed Jogger Cuff
  lKneeMesh.addCylinder({
    radiusTop: 0.050,
    radiusBottom: 0.050,
    height: 0.038,
    segments: 14,
    center: [0, -0.33, 0],
    materialIndex: matPantsAccent
  });
  // Sneaker Upper (Ergonomic runner profile)
  lKneeMesh.addBox({
    size: [0.094, 0.080, 0.21],
    center: [0, -0.39, -0.015],
    materialIndex: matBag
  });
  // Sneaker Padded Tongue / Collar
  lKneeMesh.addBox({
    size: [0.076, 0.038, 0.085],
    rotation: [-20, 0, 0],
    center: [0, -0.35, -0.04],
    materialIndex: matTealDark
  });
  // Sculpted Thick Foam Midsole
  lKneeMesh.addBox({
    size: [0.104, 0.032, 0.23],
    center: [0, -0.442, -0.015],
    materialIndex: matSole
  });
  // Grippy Outsole
  lKneeMesh.addBox({
    size: [0.102, 0.014, 0.225],
    center: [0, -0.460, -0.015],
    materialIndex: matOutsole
  });
  // Marigold Heel Pull Tab
  lKneeMesh.addBox({
    size: [0.026, 0.038, 0.014],
    center: [0, -0.385, 0.095],
    materialIndex: matMarigold
  });

  // --- Right Leg (Upper Thigh) ---
  const { mesh: rThighMesh, index: rThighMeshIdx } = builder.createMesh('RightLeg_Thigh_Mesh');
  rThighMesh.addCylinder({
    radiusTop: 0.074,
    radiusBottom: 0.064,
    height: 0.26,
    segments: 16,
    center: [0, -0.13, 0],
    materialIndex: matPants
  });
  rThighMesh.addBox({
    size: [0.026, 0.09, 0.080],
    center: [-0.070, -0.12, 0],
    materialIndex: matPantsAccent
  });

  // --- Right Knee & Calf & Sneaker ---
  const { mesh: rKneeMesh, index: rKneeMeshIdx } = builder.createMesh('RightKnee_Calf_Mesh');
  rKneeMesh.addSphere({
    radius: 0.064,
    widthSegments: 12,
    heightSegments: 8,
    scale: [0.95, 1.0, 1.05],
    center: [0, 0.0, 0.01],
    materialIndex: matPantsAccent
  });
  rKneeMesh.addCylinder({
    radiusTop: 0.062,
    radiusBottom: 0.048,
    height: 0.32,
    segments: 16,
    center: [0, -0.16, 0],
    materialIndex: matPants
  });
  rKneeMesh.addCylinder({
    radiusTop: 0.050,
    radiusBottom: 0.050,
    height: 0.038,
    segments: 14,
    center: [0, -0.33, 0],
    materialIndex: matPantsAccent
  });
  rKneeMesh.addBox({
    size: [0.094, 0.080, 0.21],
    center: [0, -0.39, -0.015],
    materialIndex: matBag
  });
  rKneeMesh.addBox({
    size: [0.076, 0.038, 0.085],
    rotation: [-20, 0, 0],
    center: [0, -0.35, -0.04],
    materialIndex: matTealDark
  });
  rKneeMesh.addBox({
    size: [0.104, 0.032, 0.23],
    center: [0, -0.442, -0.015],
    materialIndex: matSole
  });
  rKneeMesh.addBox({
    size: [0.102, 0.014, 0.225],
    center: [0, -0.460, -0.015],
    materialIndex: matOutsole
  });
  rKneeMesh.addBox({
    size: [0.026, 0.038, 0.014],
    center: [0, -0.385, 0.095],
    materialIndex: matMarigold
  });

  // =========================================================================
  // 6. ARMS & HANDS (Left & Right)
  // =========================================================================
  // --- Left Arm (Upper Sleeve) ---
  const { mesh: lUpperArmMesh, index: lUpperArmMeshIdx } = builder.createMesh('LeftArm_Upper_Mesh');
  lUpperArmMesh.addCylinder({
    radiusTop: 0.054,
    radiusBottom: 0.046,
    height: 0.22,
    segments: 14,
    center: [0.015, -0.11, 0],
    materialIndex: matTeal
  });

  // --- Left Forearm & Runner Fist ---
  const { mesh: lForearmMesh, index: lForearmMeshIdx } = builder.createMesh('LeftElbow_Forearm_Mesh');
  lForearmMesh.addCylinder({
    radiusTop: 0.046,
    radiusBottom: 0.040,
    height: 0.20,
    segments: 14,
    center: [0.012, -0.10, 0],
    materialIndex: matTeal
  });
  // Ribbed Wrist Cuff
  lForearmMesh.addCylinder({
    radiusTop: 0.042,
    radiusBottom: 0.042,
    height: 0.030,
    segments: 12,
    center: [0.012, -0.19, 0],
    materialIndex: matTealDark
  });
  // Athletic Clenched Runner Fist
  lForearmMesh.addSphere({
    radius: 0.034,
    widthSegments: 10,
    heightSegments: 8,
    scale: [0.92, 1.15, 0.85],
    center: [0.012, -0.235, 0],
    materialIndex: matSkin
  });
  // Thumb Fold
  lForearmMesh.addBox({
    size: [0.016, 0.030, 0.018],
    rotation: [0, 0, -22],
    center: [0.032, -0.225, -0.012],
    materialIndex: matSkin
  });

  // --- Right Arm (Upper Sleeve) ---
  const { mesh: rUpperArmMesh, index: rUpperArmMeshIdx } = builder.createMesh('RightArm_Upper_Mesh');
  rUpperArmMesh.addCylinder({
    radiusTop: 0.054,
    radiusBottom: 0.046,
    height: 0.22,
    segments: 14,
    center: [-0.015, -0.11, 0],
    materialIndex: matTeal
  });

  // --- Right Forearm & Runner Fist ---
  const { mesh: rForearmMesh, index: rForearmMeshIdx } = builder.createMesh('RightElbow_Forearm_Mesh');
  rForearmMesh.addCylinder({
    radiusTop: 0.046,
    radiusBottom: 0.040,
    height: 0.20,
    segments: 14,
    center: [-0.012, -0.10, 0],
    materialIndex: matTeal
  });
  rForearmMesh.addCylinder({
    radiusTop: 0.042,
    radiusBottom: 0.042,
    height: 0.030,
    segments: 12,
    center: [-0.012, -0.19, 0],
    materialIndex: matTealDark
  });
  rForearmMesh.addSphere({
    radius: 0.034,
    widthSegments: 10,
    heightSegments: 8,
    scale: [0.92, 1.15, 0.85],
    center: [-0.012, -0.235, 0],
    materialIndex: matSkin
  });
  rForearmMesh.addBox({
    size: [0.016, 0.030, 0.018],
    rotation: [0, 0, 22],
    center: [-0.032, -0.225, -0.012],
    materialIndex: matSkin
  });

  // =========================================================================
  // 7. CROSSBODY MESSENGER SATCHEL (Pivot at Y = 0.92m, X = -0.18m)
  // =========================================================================
  const { mesh: satchelMesh, index: satchelMeshIdx } = builder.createMesh('Satchel_Mesh');
  // Main Bag Body (Compact structured canvas pouch)
  satchelMesh.addBox({
    size: [0.155, 0.13, 0.082],
    rotation: [0, -8, 0],
    center: [0, 0, 0],
    materialIndex: matBag
  });
  // Top Flap
  satchelMesh.addBox({
    size: [0.160, 0.080, 0.088],
    rotation: [0, -8, 0],
    center: [0, 0.038, 0],
    materialIndex: matBag
  });
  // Dual Front Tactical Buckles
  satchelMesh.addBox({
    size: [0.018, 0.055, 0.012],
    rotation: [0, -8, 0],
    center: [-0.042, 0.01, -0.044],
    materialIndex: matMarigold
  });
  satchelMesh.addBox({
    size: [0.018, 0.055, 0.012],
    rotation: [0, -8, 0],
    center: [0.042, 0.01, -0.044],
    materialIndex: matMarigold
  });

  // =========================================================================
  // 8. ASSEMBLE HIERARCHY (Match PlayerController.ts Node Names)
  // =========================================================================
  // 1. TorsoRoot (Y = 0.86m)
  const nodeTorso = builder.addNode({
    name: 'TorsoRoot',
    translation: [0, 0.86, 0],
    meshIndex: torsoMeshIdx
  });

  // 2. HeadRoot (child of world/root, Y = 1.43m)
  const nodeHead = builder.addNode({
    name: 'HeadRoot',
    translation: [0, 1.43, 0],
    meshIndex: headMeshIdx
  });

  // 2b. ScarfTailRoot (child of HeadRoot, offset to shoulder)
  const nodeScarfTail = builder.addNode({
    name: 'ScarfTailRoot',
    translation: [0.055, -0.015, 0.065],
    meshIndex: scarfTailMeshIdx
  });
  builder.addChild(nodeHead, nodeScarfTail);

  // 3. LeftLegRoot (Hip at [0.090, 0.72, 0])
  const nodeLeftLeg = builder.addNode({
    name: 'LeftLegRoot',
    translation: [0.090, 0.72, 0],
    meshIndex: lThighMeshIdx
  });

  // 3b. LeftKneeRoot (Knee at Y = -0.26 relative to hip)
  const nodeLeftKnee = builder.addNode({
    name: 'LeftKneeRoot',
    translation: [0, -0.26, 0],
    meshIndex: lKneeMeshIdx
  });
  builder.addChild(nodeLeftLeg, nodeLeftKnee);

  // 4. RightLegRoot (Hip at [-0.090, 0.72, 0])
  const nodeRightLeg = builder.addNode({
    name: 'RightLegRoot',
    translation: [-0.090, 0.72, 0],
    meshIndex: rThighMeshIdx
  });

  // 4b. RightKneeRoot (Knee at Y = -0.26 relative to hip)
  const nodeRightKnee = builder.addNode({
    name: 'RightKneeRoot',
    translation: [0, -0.26, 0],
    meshIndex: rKneeMeshIdx
  });
  builder.addChild(nodeRightLeg, nodeRightKnee);

  // 5. LeftArmRoot (Shoulder at [0.20, 1.34, 0])
  const nodeLeftArm = builder.addNode({
    name: 'LeftArmRoot',
    translation: [0.20, 1.34, 0],
    meshIndex: lUpperArmMeshIdx
  });

  // 5b. LeftElbowRoot (Elbow at Y = -0.22 relative to shoulder)
  const nodeLeftElbow = builder.addNode({
    name: 'LeftElbowRoot',
    translation: [0.015, -0.22, 0],
    meshIndex: lForearmMeshIdx
  });
  builder.addChild(nodeLeftArm, nodeLeftElbow);

  // 6. RightArmRoot (Shoulder at [-0.20, 1.34, 0])
  const nodeRightArm = builder.addNode({
    name: 'RightArmRoot',
    translation: [-0.20, 1.34, 0],
    meshIndex: rUpperArmMeshIdx
  });

  // 6b. RightElbowRoot (Elbow at Y = -0.22 relative to shoulder)
  const nodeRightElbow = builder.addNode({
    name: 'RightElbowRoot',
    translation: [-0.015, -0.22, 0],
    meshIndex: rForearmMeshIdx
  });
  builder.addChild(nodeRightArm, nodeRightElbow);

  // 7. SatchelRoot (Right hip anchor at [-0.17, 0.92, 0.07])
  const nodeSatchel = builder.addNode({
    name: 'SatchelRoot',
    translation: [-0.17, 0.92, 0.07],
    meshIndex: satchelMeshIdx
  });

  // Build the binary GLB!
  const glbBuffer = builder.build();

  const baseDir = path.dirname(__dirname);
  const pubPath = path.join(baseDir, 'public', 'models', 'tuku_blockout_v02.glb');
  const artPath = path.join(baseDir, 'art-source', 'tuku_blockout_v02.glb');

  fs.writeFileSync(pubPath, glbBuffer);
  fs.writeFileSync(artPath, glbBuffer);

  console.log(`Successfully generated Refined Tuku v0.3 GLB!`);
  console.log(`File size: ${glbBuffer.length} bytes`);
  console.log(`Saved to: ${pubPath} and ${artPath}`);
}

buildEnhancedTuku();
