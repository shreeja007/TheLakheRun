const fs = require('fs');
const path = require('path');

function auditGlb(filePath) {
  console.log(`=== AUDITING GLB: ${filePath} ===`);
  const buf = fs.readFileSync(filePath);
  const magic = buf.readUInt32LE(0);
  if (magic !== 0x46546C67) {
    throw new Error('Not a valid GLB binary!');
  }
  const version = buf.readUInt32LE(4);
  const length = buf.readUInt32LE(8);

  const jsonChunkLen = buf.readUInt32LE(12);
  const jsonChunkType = buf.readUInt32LE(16);
  const jsonStr = buf.toString('utf8', 20, 20 + jsonChunkLen);
  const gltf = JSON.parse(jsonStr);

  console.log(`GLB Version: ${version}, Total Bytes: ${length} (${(length / 1024).toFixed(1)} KB)`);
  console.log(`Generator: ${gltf.asset?.generator || 'Unknown'}`);
  console.log(`Meshes: ${gltf.meshes?.length || 0}`);
  console.log(`Materials: ${gltf.materials?.length || 0}`);
  console.log(`Textures: ${gltf.textures?.length || 0}`);
  console.log(`Images: ${gltf.images?.length || 0}`);
  console.log(`Nodes: ${gltf.nodes?.length || 0}`);

  // Count triangles
  let totalTriangles = 0;
  let totalVertices = 0;

  for (const m of (gltf.meshes || [])) {
    for (const p of m.primitives) {
      if (p.indices !== undefined) {
        const acc = gltf.accessors[p.indices];
        totalTriangles += acc.count / 3;
      }
      if (p.attributes && p.attributes.POSITION !== undefined) {
        const acc = gltf.accessors[p.attributes.POSITION];
        totalVertices += acc.count;
      }
    }
  }

  console.log(`Total Vertices: ${totalVertices}`);
  console.log(`Total Triangles: ${totalTriangles}`);

  console.log('\n--- Materials: ---');
  for (let i = 0; i < (gltf.materials || []).length; i++) {
    const mat = gltf.materials[i];
    const pbr = mat.pbrMetallicRoughness || {};
    console.log(`  [${i}] ${mat.name}: baseColor=${JSON.stringify(pbr.baseColorFactor || [1,1,1,1])}, rough=${pbr.roughnessFactor}, metal=${pbr.metallicFactor}, tex=${pbr.baseColorTexture ? pbr.baseColorTexture.index : 'none'}, doubleSided=${mat.doubleSided || false}`);
  }

  console.log('\n--- Node Hierarchy: ---');
  function printNode(nodeIdx, indent = '  ') {
    const n = gltf.nodes[nodeIdx];
    const meshName = n.mesh !== undefined ? gltf.meshes[n.mesh].name : 'none';
    const trans = n.translation ? n.translation.map(v => v.toFixed(2)).join(', ') : '0, 0, 0';
    console.log(`${indent}├─ [${nodeIdx}] "${n.name}" (mesh: ${meshName}, trans: [${trans}])`);
    if (n.children) {
      for (const childIdx of n.children) {
        printNode(childIdx, indent + '│  ');
      }
    }
  }

  // Find root nodes
  const childSet = new Set();
  for (const n of gltf.nodes) {
    if (n.children) {
      for (const c of n.children) childSet.add(c);
    }
  }
  for (let i = 0; i < gltf.nodes.length; i++) {
    if (!childSet.has(i)) {
      printNode(i);
    }
  }
}

const glbPath = path.resolve(__dirname, '../public/models/lakhey_blockout_v02.glb');
auditGlb(glbPath);
