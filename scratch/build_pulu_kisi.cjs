const fs = require('fs');
const path = require('path');
const { GLBBuilder } = require('./glb_builder.cjs');

function buildPuluKisiGLB() {
  console.log('Building Authentic Stylized Pulu Kisi 3D Character Model (GLB)...');

  const builder = new GLBBuilder();

  // =========================================================================
  // 1. MATERIALS DEFINITION
  // =========================================================================
  // Woven White Cloth (Wicker frame cover)
  const matWhiteCloth = builder.addMaterial('Mat_WhiteCloth', {
    baseColor: [0.95, 0.94, 0.91, 1.0],
    roughness: 0.82,
    metallic: 0.02
  });

  // Ceremonial Festival Crimson (Jhula saddle blanket & ribbons)
  const matCrimson = builder.addMaterial('Mat_CeremonialCrimson', {
    baseColor: [0.82, 0.12, 0.18, 1.0],
    roughness: 0.45,
    metallic: 0.05
  });

  // Temple Burnished Gold (Brocade borders, medallions & harness)
  const matGoldTrim = builder.addMaterial('Mat_GoldBrocade', {
    baseColor: [0.96, 0.78, 0.22, 1.0],
    roughness: 0.28,
    metallic: 0.65
  });

  // Resonant Bell Brass (Neck Ghangla bell)
  const matBrassBell = builder.addMaterial('Mat_BrassBell', {
    baseColor: [0.92, 0.76, 0.16, 1.0],
    roughness: 0.22,
    metallic: 0.85
  });

  // Inner Ear Rose Silk
  const matEarInner = builder.addMaterial('Mat_EarInner', {
    baseColor: [0.88, 0.35, 0.42, 1.0],
    roughness: 0.68,
    metallic: 0.0
  });

  // Stylized Eyes (Sclera & Pupil)
  const matEyeSclera = builder.addMaterial('Mat_EyeSclera', {
    baseColor: [0.98, 0.98, 0.98, 1.0],
    roughness: 0.18,
    metallic: 0.0
  });

  const matEyePupil = builder.addMaterial('Mat_EyePupil', {
    baseColor: [0.08, 0.07, 0.10, 1.0],
    roughness: 0.15,
    metallic: 0.0
  });

  // Dark Comic Ink Outline (Inverted Hull)
  const matInk = builder.addMaterial('Mat_InkOutline', {
    baseColor: [0.08, 0.08, 0.10, 1.0],
    roughness: 0.95,
    metallic: 0.0,
    doubleSided: false
  });

  const OUTLINE_BODY = 0.0075;
  const OUTLINE_DETAIL = 0.0045;

  // =========================================================================
  // 2. BODY MESH (Pivot at BodyRoot [0, 0.85, 0])
  // Barrel torso, draped cloth apron, ceremonial saddle blanket (Jhula)
  // =========================================================================
  const { mesh: bodyMesh, index: bodyMeshIdx } = builder.createMesh('Body_Mesh');

  // Main Wicker/Cloth Barrel Torso
  bodyMesh.addCylinder({
    radiusTop: 0.54,
    radiusBottom: 0.54,
    height: 1.35,
    segments: 20,
    center: [0, 0, 0],
    rotation: [90, 0, 0], // Longitudinal along Z
    materialIndex: matWhiteCloth,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });

  // Front shoulder dome
  bodyMesh.addSphere({
    radius: 0.54,
    widthSegments: 16,
    heightSegments: 12,
    center: [0, 0, -0.66],
    materialIndex: matWhiteCloth,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });

  // Rear rump dome
  bodyMesh.addSphere({
    radius: 0.52,
    widthSegments: 16,
    heightSegments: 12,
    center: [0, -0.02, 0.66],
    materialIndex: matWhiteCloth,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });

  // Ceremonial Festival Saddle Blanket (Jhula): draped over back and flanks
  bodyMesh.addBox({
    size: [1.14, 0.14, 0.96],
    center: [0, 0.52, 0.02],
    materialIndex: matCrimson,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });

  // Golden Brocade Border around Saddle Blanket
  bodyMesh.addBox({
    size: [1.16, 0.06, 0.98],
    center: [0, 0.48, 0.02],
    materialIndex: matGoldTrim,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });

  // Left & Right hanging saddle side-flaps (fringed tapestry flanks)
  bodyMesh.addBox({
    size: [0.05, 0.45, 0.78],
    center: [-0.56, 0.22, 0.02],
    materialIndex: matCrimson,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });
  bodyMesh.addBox({
    size: [0.05, 0.45, 0.78],
    center: [0.56, 0.22, 0.02],
    materialIndex: matCrimson,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });

  // Golden Sun Medallions on saddle flanks
  bodyMesh.addCylinder({
    radiusTop: 0.12,
    radiusBottom: 0.12,
    height: 0.04,
    segments: 12,
    center: [-0.59, 0.20, 0.02],
    rotation: [0, 0, 90],
    materialIndex: matGoldTrim
  });
  bodyMesh.addCylinder({
    radiusTop: 0.12,
    radiusBottom: 0.12,
    height: 0.04,
    segments: 12,
    center: [0.59, 0.20, 0.02],
    rotation: [0, 0, 90],
    materialIndex: matGoldTrim
  });

  // Red Ceremonial Harness Straps (Chest collar & rump band)
  bodyMesh.addCylinder({
    radiusTop: 0.56,
    radiusBottom: 0.56,
    height: 0.10,
    segments: 20,
    center: [0, 0, -0.42],
    rotation: [90, 0, 0],
    materialIndex: matCrimson
  });
  bodyMesh.addCylinder({
    radiusTop: 0.54,
    radiusBottom: 0.54,
    height: 0.10,
    segments: 20,
    center: [0, -0.02, 0.45],
    rotation: [90, 0, 0],
    materialIndex: matCrimson
  });

  // =========================================================================
  // 3. HEAD MESH (Pivot at HeadRoot [0, 0.35, -0.65])
  // White elephant domed forehead, parietal bumps, cheeks, stylized eyes
  // =========================================================================
  const { mesh: headMesh, index: headMeshIdx } = builder.createMesh('Head_Mesh');

  // Main Head Dome
  headMesh.addSphere({
    radius: 0.42,
    widthSegments: 16,
    heightSegments: 12,
    center: [0, 0.05, -0.15],
    materialIndex: matWhiteCloth,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });

  // Asian Elephant Parietal Forehead Bumps (Twin cranial domes)
  headMesh.addSphere({
    radius: 0.22,
    widthSegments: 12,
    heightSegments: 10,
    center: [-0.16, 0.28, -0.16],
    materialIndex: matWhiteCloth
  });
  headMesh.addSphere({
    radius: 0.22,
    widthSegments: 12,
    heightSegments: 10,
    center: [0.16, 0.28, -0.16],
    materialIndex: matWhiteCloth
  });

  // Golden Festival Forehead Diadem / Headband
  headMesh.addBox({
    size: [0.65, 0.09, 0.25],
    center: [0, 0.24, -0.32],
    rotation: [-18, 0, 0],
    materialIndex: matGoldTrim,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });
  headMesh.addSphere({
    radius: 0.08,
    widthSegments: 10,
    heightSegments: 8,
    center: [0, 0.24, -0.46],
    materialIndex: matCrimson
  });

  // Expressive Stylized Eyes (Left & Right)
  // Left eye
  headMesh.addSphere({
    radius: 0.08,
    widthSegments: 10,
    heightSegments: 8,
    center: [-0.32, 0.08, -0.36],
    materialIndex: matEyeSclera
  });
  headMesh.addSphere({
    radius: 0.045,
    widthSegments: 8,
    heightSegments: 6,
    center: [-0.36, 0.08, -0.40],
    materialIndex: matEyePupil
  });

  // Right eye
  headMesh.addSphere({
    radius: 0.08,
    widthSegments: 10,
    heightSegments: 8,
    center: [0.32, 0.08, -0.36],
    materialIndex: matEyeSclera
  });
  headMesh.addSphere({
    radius: 0.045,
    widthSegments: 8,
    heightSegments: 6,
    center: [0.36, 0.08, -0.40],
    materialIndex: matEyePupil
  });

  // Playful Stylized Tusks (Ivory cloth curved cones pointing slightly forward)
  headMesh.addCylinder({
    radiusTop: 0.02,
    radiusBottom: 0.06,
    height: 0.26,
    segments: 10,
    center: [-0.18, -0.18, -0.42],
    rotation: [-45, -15, 0],
    materialIndex: matWhiteCloth,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });
  headMesh.addCylinder({
    radiusTop: 0.02,
    radiusBottom: 0.06,
    height: 0.26,
    segments: 10,
    center: [0.18, -0.18, -0.42],
    rotation: [-45, 15, 0],
    materialIndex: matWhiteCloth,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });

  // =========================================================================
  // 4. TRUNK MESH (Pivot at TrunkRoot [0, -0.15, -0.42])
  // Curving segmented elephant trunk pointing forward-upwards
  // =========================================================================
  const { mesh: trunkMesh, index: trunkMeshIdx } = builder.createMesh('Trunk_Mesh');

  // Upper trunk section
  trunkMesh.addCylinder({
    radiusTop: 0.14,
    radiusBottom: 0.11,
    height: 0.28,
    segments: 12,
    center: [0, -0.12, -0.06],
    rotation: [-22, 0, 0],
    materialIndex: matWhiteCloth,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });

  // Mid trunk section
  trunkMesh.addCylinder({
    radiusTop: 0.11,
    radiusBottom: 0.085,
    height: 0.28,
    segments: 12,
    center: [0, -0.32, -0.16],
    rotation: [-42, 0, 0],
    materialIndex: matWhiteCloth,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });

  // Lower curling tip (curling upward in auspicious welcome)
  trunkMesh.addCylinder({
    radiusTop: 0.085,
    radiusBottom: 0.06,
    height: 0.26,
    segments: 10,
    center: [0, -0.46, -0.28],
    rotation: [-75, 0, 0],
    materialIndex: matWhiteCloth,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });
  trunkMesh.addSphere({
    radius: 0.065,
    widthSegments: 8,
    heightSegments: 6,
    center: [0, -0.48, -0.41],
    materialIndex: matCrimson
  });

  // =========================================================================
  // 5. EAR MESHES (Pivot at LeftEarRoot & RightEarRoot)
  // Broad fan-shaped ears with white outer cloth and rosy silk lining
  // =========================================================================
  const { mesh: leftEarMesh, index: leftEarMeshIdx } = builder.createMesh('LeftEar_Mesh');
  leftEarMesh.addBox({
    size: [0.04, 0.44, 0.32],
    center: [-0.16, 0.0, 0.0],
    rotation: [0, -18, -12],
    materialIndex: matWhiteCloth,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });
  leftEarMesh.addBox({
    size: [0.03, 0.36, 0.25],
    center: [-0.17, 0.0, 0.0],
    rotation: [0, -18, -12],
    materialIndex: matEarInner
  });

  const { mesh: rightEarMesh, index: rightEarMeshIdx } = builder.createMesh('RightEar_Mesh');
  rightEarMesh.addBox({
    size: [0.04, 0.44, 0.32],
    center: [0.16, 0.0, 0.0],
    rotation: [0, 18, 12],
    materialIndex: matWhiteCloth,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_BODY
  });
  rightEarMesh.addBox({
    size: [0.03, 0.36, 0.25],
    center: [0.17, 0.0, 0.0],
    rotation: [0, 18, 12],
    materialIndex: matEarInner
  });

  // =========================================================================
  // 6. BRASS BELL MESH (Pivot at BellRoot [0, -0.38, -0.18])
  // Traditional Newar Ghanta / Ghangla brass bell suspended from neck
  // =========================================================================
  const { mesh: bellMesh, index: bellMeshIdx } = builder.createMesh('Bell_Mesh');

  // Red braided hanging strap
  bellMesh.addCylinder({
    radiusTop: 0.02,
    radiusBottom: 0.02,
    height: 0.16,
    segments: 8,
    center: [0, 0.08, 0],
    materialIndex: matCrimson
  });

  // Flared brass bell body
  bellMesh.addCylinder({
    radiusTop: 0.05,
    radiusBottom: 0.14,
    height: 0.18,
    segments: 16,
    center: [0, -0.06, 0],
    materialIndex: matBrassBell,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });

  // Bell rim lip
  bellMesh.addCylinder({
    radiusTop: 0.15,
    radiusBottom: 0.15,
    height: 0.04,
    segments: 16,
    center: [0, -0.15, 0],
    materialIndex: matBrassBell
  });

  // Bell clapper
  bellMesh.addSphere({
    radius: 0.04,
    widthSegments: 8,
    heightSegments: 6,
    center: [0, -0.17, 0],
    materialIndex: matBrassBell
  });

  // =========================================================================
  // 7. TAIL MESH (Pivot at TailRoot [0, 0.25, 0.95])
  // =========================================================================
  const { mesh: tailMesh, index: tailMeshIdx } = builder.createMesh('Tail_Mesh');

  tailMesh.addCylinder({
    radiusTop: 0.04,
    radiusBottom: 0.025,
    height: 0.42,
    segments: 8,
    center: [0, -0.18, 0.06],
    rotation: [18, 0, 0],
    materialIndex: matWhiteCloth,
    outlineMaterialIndex: matInk,
    outlineThickness: OUTLINE_DETAIL
  });

  // Tufted hair tassel with crimson ribbon
  tailMesh.addSphere({
    radius: 0.06,
    widthSegments: 8,
    heightSegments: 6,
    center: [0, -0.38, 0.12],
    materialIndex: matCrimson
  });

  // =========================================================================
  // 8. LEG MESHES (Front Left, Front Right, Back Left, Back Right)
  // Sturdy cartoon elephant legs covered in white fabric with golden anklets
  // =========================================================================
  function createLegMesh(name) {
    const { mesh, index } = builder.createMesh(name);
    // Upper leg thigh / cloth column
    mesh.addCylinder({
      radiusTop: 0.18,
      radiusBottom: 0.15,
      height: 0.55,
      segments: 12,
      center: [0, -0.25, 0],
      materialIndex: matWhiteCloth,
      outlineMaterialIndex: matInk,
      outlineThickness: OUTLINE_BODY
    });

    // Lower foot / padded base
    mesh.addCylinder({
      radiusTop: 0.15,
      radiusBottom: 0.17,
      height: 0.12,
      segments: 12,
      center: [0, -0.52, 0],
      materialIndex: matWhiteCloth,
      outlineMaterialIndex: matInk,
      outlineThickness: OUTLINE_BODY
    });

    // Traditional festival golden ankle ring (Pau-ju / Ghangla bell cuff)
    mesh.addCylinder({
      radiusTop: 0.18,
      radiusBottom: 0.18,
      height: 0.06,
      segments: 12,
      center: [0, -0.46, 0],
      materialIndex: matGoldTrim
    });

    return { mesh, index };
  }

  const { index: flLegMeshIdx } = createLegMesh('FL_Leg_Mesh');
  const { index: frLegMeshIdx } = createLegMesh('FR_Leg_Mesh');
  const { index: blLegMeshIdx } = createLegMesh('BL_Leg_Mesh');
  const { index: brLegMeshIdx } = createLegMesh('BR_Leg_Mesh');

  // =========================================================================
  // 9. ARTICULATED SKELETON / NODE GRAPH
  // =========================================================================
  // Root node
  const rootIdx = builder.addNode({ name: 'PuluKisiRoot', translation: [0, 0, 0] });

  // Body node (pivot at [0, 0.85, 0])
  const bodyIdx = builder.addNode({ name: 'BodyRoot', translation: [0, 0.85, 0], meshIndex: bodyMeshIdx });
  builder.addChild(rootIdx, bodyIdx);

  // Head node attached to Body
  const headIdx = builder.addNode({ name: 'HeadRoot', translation: [0, 0.28, -0.68], meshIndex: headMeshIdx });
  builder.addChild(bodyIdx, headIdx);

  // Trunk attached to Head
  const trunkIdx = builder.addNode({ name: 'TrunkRoot', translation: [0, -0.16, -0.44], meshIndex: trunkMeshIdx });
  builder.addChild(headIdx, trunkIdx);

  // Left & Right Ears attached to Head
  const leftEarIdx = builder.addNode({ name: 'LeftEarRoot', translation: [-0.38, 0.08, -0.12], meshIndex: leftEarMeshIdx });
  const rightEarIdx = builder.addNode({ name: 'RightEarRoot', translation: [0.38, 0.08, -0.12], meshIndex: rightEarMeshIdx });
  builder.addChild(headIdx, leftEarIdx);
  builder.addChild(headIdx, rightEarIdx);

  // Brass Bell attached to Head/Neck
  const bellIdx = builder.addNode({ name: 'BellRoot', translation: [0, -0.28, -0.22], meshIndex: bellMeshIdx });
  builder.addChild(headIdx, bellIdx);

  // Tail attached to Body
  const tailIdx = builder.addNode({ name: 'TailRoot', translation: [0, 0.22, 0.68], meshIndex: tailMeshIdx });
  builder.addChild(bodyIdx, tailIdx);

  // 4 Legs attached to Root (ground pivots at Y = 0.58)
  const flLegIdx = builder.addNode({ name: 'FrontLeftLegRoot', translation: [-0.34, 0.58, -0.48], meshIndex: flLegMeshIdx });
  const frLegIdx = builder.addNode({ name: 'FrontRightLegRoot', translation: [0.34, 0.58, -0.48], meshIndex: frLegMeshIdx });
  const blLegIdx = builder.addNode({ name: 'BackLeftLegRoot', translation: [-0.34, 0.58, 0.48], meshIndex: blLegMeshIdx });
  const brLegIdx = builder.addNode({ name: 'BackRightLegRoot', translation: [0.34, 0.58, 0.48], meshIndex: brLegMeshIdx });

  builder.addChild(rootIdx, flLegIdx);
  builder.addChild(rootIdx, frLegIdx);
  builder.addChild(rootIdx, blLegIdx);
  builder.addChild(rootIdx, brLegIdx);

  // =========================================================================
  // 10. GLB EXPORT
  // =========================================================================
  const glbBuf = builder.build();
  console.log(`Pulu Kisi GLB generation complete. Buffer size: ${glbBuf.length} bytes.`);

  const outPathPublic = path.resolve(__dirname, '../public/models/pulu_kisi.glb');
  fs.writeFileSync(outPathPublic, glbBuf);
  console.log(`Saved to ${outPathPublic}`);

  const outPathArt = path.resolve(__dirname, '../art-source/pulu_kisi.glb');
  fs.writeFileSync(outPathArt, glbBuf);
  console.log(`Saved to ${outPathArt}`);
}

buildPuluKisiGLB();
