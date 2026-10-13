/**
 * Comprehensive GLTF 2.0 / GLB Binary Builder for Node.js
 * Generates valid standard .glb files with meshes, materials, textures, UVs,
 * inverted-hull outlines, and hierarchical node graphs.
 */

class GLBBuilder {
  constructor() {
    this.images = [];
    this.samplers = [];
    this.textures = [];
    this.materials = [];
    this.meshes = [];
    this.nodes = [];
    this.sceneNodes = [];
    this.usesUnlit = false;
  }

  addImage(buffer, mimeType = 'image/png') {
    const imgIndex = this.images.length;
    this.images.push({ buffer, mimeType });

    if (this.samplers.length === 0) {
      this.samplers.push({
        magFilter: 9729, // LINEAR
        minFilter: 9987, // LINEAR_MIPMAP_LINEAR
        wrapS: 10497,    // REPEAT
        wrapT: 10497     // REPEAT
      });
    }

    const texIndex = this.textures.length;
    this.textures.push({
      sampler: 0,
      source: imgIndex
    });
    return texIndex;
  }

  addMaterial(name, options = {}) {
    const {
      baseColor = [1, 1, 1, 1], // [r, g, b, a] 0-1
      roughness = 0.5,
      metallic = 0.0,
      doubleSided = false,
      emissive = [0, 0, 0],
      textureIndex = null,
      unlit = false
    } = options;

    const pbr = {
      baseColorFactor: baseColor,
      roughnessFactor: roughness,
      metallicFactor: metallic,
    };

    if (textureIndex !== null && textureIndex !== undefined) {
      pbr.baseColorTexture = { index: textureIndex };
    }

    const mat = {
      name,
      pbrMetallicRoughness: pbr,
      emissiveFactor: emissive,
      doubleSided: doubleSided
    };

    if (unlit) {
      mat.extensions = {
        KHR_materials_unlit: {}
      };
      this.usesUnlit = true;
    }

    const index = this.materials.length;
    this.materials.push(mat);
    return index;
  }

  createMesh(name) {
    const mesh = new MeshBuilder(name, this);
    const index = this.meshes.length;
    this.meshes.push(mesh);
    return { mesh, index };
  }

  addNode(options = {}) {
    const {
      name = 'Node',
      translation = [0, 0, 0],
      rotation = [0, 0, 0, 1], // quaternion [x, y, z, w]
      scale = [1, 1, 1],
      meshIndex = null,
      children = []
    } = options;

    const index = this.nodes.length;
    this.nodes.push({
      name,
      translation,
      rotation,
      scale,
      meshIndex,
      children: [...children]
    });
    return index;
  }

  addChild(parentIndex, childIndex) {
    if (this.nodes[parentIndex]) {
      this.nodes[parentIndex].children.push(childIndex);
    }
  }

  build() {
    // Collect all vertex attributes and index buffers
    const bufferChunks = [];
    let currentByteOffset = 0;

    const bufferViews = [];
    const accessors = [];
    const gltfMeshes = [];

    // Process each mesh and its primitives
    for (const mesh of this.meshes) {
      const gltfPrimitives = [];

      for (const prim of mesh.primitives) {
        if (prim.positions.length === 0 || prim.indices.length === 0) continue;

        // 1. Positions BufferView & Accessor
        const posFloats = new Float32Array(prim.positions);
        const posBuffer = Buffer.from(posFloats.buffer);

        let minX = Infinity, minY = Infinity, minZ = Infinity;
        let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
        for (let i = 0; i < prim.positions.length; i += 3) {
          const x = prim.positions[i], y = prim.positions[i + 1], z = prim.positions[i + 2];
          if (x < minX) minX = x; if (x > maxX) maxX = x;
          if (y < minY) minY = y; if (y > maxY) maxY = y;
          if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
        }

        const posViewIndex = bufferViews.length;
        bufferViews.push({
          buffer: 0,
          byteOffset: currentByteOffset,
          byteLength: posBuffer.length,
          target: 34962, // ARRAY_BUFFER
        });
        bufferChunks.push(posBuffer);
        currentByteOffset += posBuffer.length;

        // Pad to 4 bytes if necessary
        const posPad = (4 - (currentByteOffset % 4)) % 4;
        if (posPad > 0) {
          bufferChunks.push(Buffer.alloc(posPad));
          currentByteOffset += posPad;
        }

        const posAccessorIndex = accessors.length;
        accessors.push({
          bufferView: posViewIndex,
          byteOffset: 0,
          componentType: 5126, // FLOAT
          count: prim.positions.length / 3,
          type: 'VEC3',
          min: [minX, minY, minZ],
          max: [maxX, maxY, maxZ]
        });

        // 2. Normals BufferView & Accessor
        const normFloats = new Float32Array(prim.normals);
        const normBuffer = Buffer.from(normFloats.buffer);

        const normViewIndex = bufferViews.length;
        bufferViews.push({
          buffer: 0,
          byteOffset: currentByteOffset,
          byteLength: normBuffer.length,
          target: 34962, // ARRAY_BUFFER
        });
        bufferChunks.push(normBuffer);
        currentByteOffset += normBuffer.length;

        const normPad = (4 - (currentByteOffset % 4)) % 4;
        if (normPad > 0) {
          bufferChunks.push(Buffer.alloc(normPad));
          currentByteOffset += normPad;
        }

        const normAccessorIndex = accessors.length;
        accessors.push({
          bufferView: normViewIndex,
          byteOffset: 0,
          componentType: 5126, // FLOAT
          count: prim.normals.length / 3,
          type: 'VEC3'
        });

        // 3. UVs BufferView & Accessor (TEXCOORD_0)
        let uvAccessorIndex = null;
        if (prim.uvs && prim.uvs.length > 0) {
          const uvFloats = new Float32Array(prim.uvs);
          const uvBuffer = Buffer.from(uvFloats.buffer);

          let minU = Infinity, minV = Infinity;
          let maxU = -Infinity, maxV = -Infinity;
          for (let i = 0; i < prim.uvs.length; i += 2) {
            const u = prim.uvs[i], v = prim.uvs[i + 1];
            if (u < minU) minU = u; if (u > maxU) maxU = u;
            if (v < minV) minV = v; if (v > maxV) maxV = v;
          }

          const uvViewIndex = bufferViews.length;
          bufferViews.push({
            buffer: 0,
            byteOffset: currentByteOffset,
            byteLength: uvBuffer.length,
            target: 34962, // ARRAY_BUFFER
          });
          bufferChunks.push(uvBuffer);
          currentByteOffset += uvBuffer.length;

          const uvPad = (4 - (currentByteOffset % 4)) % 4;
          if (uvPad > 0) {
            bufferChunks.push(Buffer.alloc(uvPad));
            currentByteOffset += uvPad;
          }

          uvAccessorIndex = accessors.length;
          accessors.push({
            bufferView: uvViewIndex,
            byteOffset: 0,
            componentType: 5126, // FLOAT
            count: prim.uvs.length / 2,
            type: 'VEC2',
            min: [minU === Infinity ? 0 : minU, minV === Infinity ? 0 : minV],
            max: [maxU === -Infinity ? 1 : maxU, maxV === -Infinity ? 1 : maxV]
          });
        }

        // 4. Indices BufferView & Accessor
        const maxIndex = Math.max(...prim.indices);
        let idxBuffer, componentType;
        if (maxIndex < 65536) {
          componentType = 5123; // UNSIGNED_SHORT
          const idxShorts = new Uint16Array(prim.indices);
          idxBuffer = Buffer.from(idxShorts.buffer);
        } else {
          componentType = 5125; // UNSIGNED_INT
          const idxInts = new Uint32Array(prim.indices);
          idxBuffer = Buffer.from(idxInts.buffer);
        }

        const idxViewIndex = bufferViews.length;
        bufferViews.push({
          buffer: 0,
          byteOffset: currentByteOffset,
          byteLength: idxBuffer.length,
          target: 34963, // ELEMENT_ARRAY_BUFFER
        });
        bufferChunks.push(idxBuffer);
        currentByteOffset += idxBuffer.length;

        const idxPad = (4 - (currentByteOffset % 4)) % 4;
        if (idxPad > 0) {
          bufferChunks.push(Buffer.alloc(idxPad));
          currentByteOffset += idxPad;
        }

        const idxAccessorIndex = accessors.length;
        accessors.push({
          bufferView: idxViewIndex,
          byteOffset: 0,
          componentType: componentType,
          count: prim.indices.length,
          type: 'SCALAR'
        });

        const attributes = {
          POSITION: posAccessorIndex,
          NORMAL: normAccessorIndex
        };
        if (uvAccessorIndex !== null) {
          attributes.TEXCOORD_0 = uvAccessorIndex;
        }

        gltfPrimitives.push({
          attributes,
          indices: idxAccessorIndex,
          material: prim.materialIndex
        });
      }

      gltfMeshes.push({
        name: mesh.name,
        primitives: gltfPrimitives
      });
    }

    // Process embedded images
    const gltfImages = [];
    for (const img of this.images) {
      const imgBuffer = img.buffer;
      const imgViewIndex = bufferViews.length;
      bufferViews.push({
        buffer: 0,
        byteOffset: currentByteOffset,
        byteLength: imgBuffer.length
      });
      bufferChunks.push(imgBuffer);
      currentByteOffset += imgBuffer.length;

      const imgPad = (4 - (currentByteOffset % 4)) % 4;
      if (imgPad > 0) {
        bufferChunks.push(Buffer.alloc(imgPad));
        currentByteOffset += imgPad;
      }

      gltfImages.push({
        bufferView: imgViewIndex,
        mimeType: img.mimeType || 'image/png'
      });
    }

    // Convert nodes
    const gltfNodes = this.nodes.map(n => {
      const nodeObj = { name: n.name };
      if (n.translation && (n.translation[0] !== 0 || n.translation[1] !== 0 || n.translation[2] !== 0)) {
        nodeObj.translation = n.translation;
      }
      if (n.rotation && (n.rotation[0] !== 0 || n.rotation[1] !== 0 || n.rotation[2] !== 0 || n.rotation[3] !== 1)) {
        nodeObj.rotation = n.rotation;
      }
      if (n.scale && (n.scale[0] !== 1 || n.scale[1] !== 1 || n.scale[2] !== 1)) {
        nodeObj.scale = n.scale;
      }
      if (n.meshIndex !== null && n.meshIndex !== undefined) {
        nodeObj.mesh = n.meshIndex;
      }
      if (n.children && n.children.length > 0) {
        nodeObj.children = n.children;
      }
      return nodeObj;
    });

    // Find root nodes
    const childSet = new Set();
    for (const n of this.nodes) {
      for (const c of n.children) {
        childSet.add(c);
      }
    }
    const rootNodes = [];
    for (let i = 0; i < this.nodes.length; i++) {
      if (!childSet.has(i)) {
        rootNodes.push(i);
      }
    }

    const binBuffer = Buffer.concat(bufferChunks);

    const gltfJson = {
      asset: { version: '2.0', generator: 'LakheyRun-Articulated-GLBBuilder' },
      scene: 0,
      scenes: [{ nodes: rootNodes }],
      nodes: gltfNodes,
      meshes: gltfMeshes,
      materials: this.materials,
      accessors: accessors,
      bufferViews: bufferViews,
      buffers: [{ byteLength: binBuffer.length }]
    };

    if (gltfImages.length > 0) {
      gltfJson.images = gltfImages;
      gltfJson.textures = this.textures;
      gltfJson.samplers = this.samplers;
    }

    if (this.usesUnlit) {
      gltfJson.extensionsUsed = ['KHR_materials_unlit'];
    }

    const jsonStr = JSON.stringify(gltfJson);
    const jsonBuffer = Buffer.from(jsonStr, 'utf8');
    const jsonPad = (4 - (jsonBuffer.length % 4)) % 4;
    const paddedJson = Buffer.concat([jsonBuffer, Buffer.alloc(jsonPad, 0x20)]); // pad with spaces

    const binPad = (4 - (binBuffer.length % 4)) % 4;
    const paddedBin = binPad > 0 ? Buffer.concat([binBuffer, Buffer.alloc(binPad, 0x00)]) : binBuffer;

    const totalLength = 12 + 8 + paddedJson.length + 8 + paddedBin.length;

    const header = Buffer.alloc(12);
    header.writeUInt32LE(0x46546C67, 0); // 'glTF'
    header.writeUInt32LE(2, 4);          // version 2
    header.writeUInt32LE(totalLength, 8);

    const jsonChunkHeader = Buffer.alloc(8);
    jsonChunkHeader.writeUInt32LE(paddedJson.length, 0);
    jsonChunkHeader.writeUInt32LE(0x4E4F534A, 4); // 'JSON'

    const binChunkHeader = Buffer.alloc(8);
    binChunkHeader.writeUInt32LE(paddedBin.length, 0);
    binChunkHeader.writeUInt32LE(0x004E4942, 4); // 'BIN\0'

    return Buffer.concat([header, jsonChunkHeader, paddedJson, binChunkHeader, paddedBin]);
  }
}

class MeshBuilder {
  constructor(name, builder) {
    this.name = name;
    this.builder = builder;
    this.primitives = [];
    this.activePrimitiveByMat = new Map();
  }

  getPrimitive(materialIndex) {
    if (!this.activePrimitiveByMat.has(materialIndex)) {
      const prim = { materialIndex, positions: [], normals: [], uvs: [], indices: [] };
      this.primitives.push(prim);
      this.activePrimitiveByMat.set(materialIndex, prim);
    }
    return this.activePrimitiveByMat.get(materialIndex);
  }

  mapUV(u, v, bounds) {
    if (!bounds) return [u, v];
    return [
      bounds[0] + u * (bounds[2] - bounds[0]),
      bounds[1] + v * (bounds[3] - bounds[1])
    ];
  }

  // Helper transformation on vertices
  transformVertices(vertices, matrix) {
    const result = [];
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i], y = vertices[i + 1], z = vertices[i + 2];
      const tx = matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12];
      const ty = matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13];
      const tz = matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14];
      result.push(tx, ty, tz);
    }
    return result;
  }

  transformNormals(normals, matrix) {
    const result = [];
    for (let i = 0; i < normals.length; i += 3) {
      const x = normals[i], y = normals[i + 1], z = normals[i + 2];
      let tx = matrix[0] * x + matrix[4] * y + matrix[8] * z;
      let ty = matrix[1] * x + matrix[5] * y + matrix[9] * z;
      let tz = matrix[2] * x + matrix[6] * y + matrix[10] * z;
      const len = Math.sqrt(tx * tx + ty * ty + tz * tz) || 1;
      result.push(tx / len, ty / len, tz / len);
    }
    return result;
  }

  createMatrix({ center = [0, 0, 0], scale = [1, 1, 1], rotation = [0, 0, 0] }) {
    const radX = (rotation[0] || 0) * Math.PI / 180;
    const radY = (rotation[1] || 0) * Math.PI / 180;
    const radZ = (rotation[2] || 0) * Math.PI / 180;

    const cx = Math.cos(radX), sx = Math.sin(radX);
    const cy = Math.cos(radY), sy = Math.sin(radY);
    const cz = Math.cos(radZ), sz = Math.sin(radZ);

    const m00 = (cy * cz) * scale[0];
    const m01 = (-cy * sz) * scale[1];
    const m02 = (sy) * scale[2];
    const m03 = 0;

    const m10 = (cx * sz + sx * sy * cz) * scale[0];
    const m11 = (cx * cz - sx * sy * sz) * scale[1];
    const m12 = (-sx * cy) * scale[2];
    const m13 = 0;

    const m20 = (sx * sz - cx * sy * cz) * scale[0];
    const m21 = (sx * cz + cx * sy * sz) * scale[1];
    const m22 = (cx * cy) * scale[2];
    const m23 = 0;

    const m30 = center[0] || 0;
    const m31 = center[1] || 0;
    const m32 = center[2] || 0;
    const m33 = 1;

    return [
      m00, m10, m20, 0,
      m01, m11, m21, 0,
      m02, m12, m22, 0,
      m30, m31, m32, 1
    ];
  }

  addGeometry(materialIndex, positions, normals, indices, transformOptions = {}, uvs = []) {
    const prim = this.getPrimitive(materialIndex);
    const baseIndex = prim.positions.length / 3;

    const mat = this.createMatrix(transformOptions);
    const tPos = this.transformVertices(positions, mat);
    const tNorm = this.transformNormals(normals, mat);

    for (let i = 0; i < tPos.length; i++) prim.positions.push(tPos[i]);
    for (let i = 0; i < tNorm.length; i++) prim.normals.push(tNorm[i]);
    for (let i = 0; i < indices.length; i++) prim.indices.push(indices[i] + baseIndex);

    const vertCount = tPos.length / 3;
    if (uvs && uvs.length === vertCount * 2) {
      for (let i = 0; i < uvs.length; i++) prim.uvs.push(uvs[i]);
    } else {
      for (let i = 0; i < vertCount; i++) prim.uvs.push(0, 0);
    }
  }

  // Generate Inverted Hull Outline shell (ink comic outline)
  addInvertedHull({ materialIndex, positions, normals, indices, thickness = 0.007, transformOptions = {} }) {
    if (materialIndex === undefined || materialIndex === null) return;
    const hullPos = [];
    const hullNorm = [];
    const hullIndices = [];
    const hullUvs = [];

    for (let i = 0; i < positions.length; i += 3) {
      const px = positions[i], py = positions[i + 1], pz = positions[i + 2];
      const nx = normals[i], ny = normals[i + 1], nz = normals[i + 2];
      hullPos.push(px + nx * thickness, py + ny * thickness, pz + nz * thickness);
      hullNorm.push(-nx, -ny, -nz);
      hullUvs.push(0, 0);
    }

    // Reverse winding: CCW becomes CW so outside is back-facing (culled) and rear rim is visible
    for (let i = 0; i < indices.length; i += 3) {
      hullIndices.push(indices[i], indices[i + 2], indices[i + 1]);
    }

    this.addGeometry(materialIndex, hullPos, hullNorm, hullIndices, transformOptions, hullUvs);
  }

  // --- Primitives Authoring ---

  addBox({
    size = [1, 1, 1],
    center = [0, 0, 0],
    scale = [1, 1, 1],
    rotation = [0, 0, 0],
    materialIndex = 0,
    uvBounds = null,
    outlineMaterialIndex = null,
    outlineThickness = 0.006
  }) {
    const [w, h, d] = size;
    const hw = w * 0.5, hh = h * 0.5, hd = d * 0.5;

    const rawPos = [
      // Front
      -hw, -hh,  hd,   hw, -hh,  hd,   hw,  hh,  hd,  -hw,  hh,  hd,
      // Back
       hw, -hh, -hd,  -hw, -hh, -hd,  -hw,  hh, -hd,   hw,  hh, -hd,
      // Top
      -hw,  hh,  hd,   hw,  hh,  hd,   hw,  hh, -hd,  -hw,  hh, -hd,
      // Bottom
      -hw, -hh, -hd,   hw, -hh, -hd,   hw, -hh,  hd,  -hw, -hh,  hd,
      // Right
       hw, -hh,  hd,   hw, -hh, -hd,   hw,  hh, -hd,   hw,  hh,  hd,
      // Left
      -hw, -hh, -hd,  -hw, -hh,  hd,  -hw,  hh,  hd,  -hw,  hh, -hd
    ];

    const rawNorm = [
      // Front
       0,  0,  1,   0,  0,  1,   0,  0,  1,   0,  0,  1,
      // Back
       0,  0, -1,   0,  0, -1,   0,  0, -1,   0,  0, -1,
      // Top
       0,  1,  0,   0,  1,  0,   0,  1,  0,   0,  1,  0,
      // Bottom
       0, -1,  0,   0, -1,  0,   0, -1,  0,   0, -1,  0,
      // Right
       1,  0,  0,   1,  0,  0,   1,  0,  0,   1,  0,  0,
      // Left
      -1,  0,  0,  -1,  0,  0,  -1,  0,  0,  -1,  0,  0
    ];

    const rawUvs = [];
    for (let f = 0; f < 6; f++) {
      const uv0 = this.mapUV(0, 0, uvBounds);
      const uv1 = this.mapUV(1, 0, uvBounds);
      const uv2 = this.mapUV(1, 1, uvBounds);
      const uv3 = this.mapUV(0, 1, uvBounds);
      rawUvs.push(uv0[0], uv0[1], uv1[0], uv1[1], uv2[0], uv2[1], uv3[0], uv3[1]);
    }

    const rawIndices = [];
    for (let f = 0; f < 6; f++) {
      const b = f * 4;
      rawIndices.push(b, b + 1, b + 2, b, b + 2, b + 3);
    }

    this.addGeometry(materialIndex, rawPos, rawNorm, rawIndices, { center, scale, rotation }, rawUvs);

    if (outlineMaterialIndex !== null) {
      this.addInvertedHull({
        materialIndex: outlineMaterialIndex,
        positions: rawPos,
        normals: rawNorm,
        indices: rawIndices,
        thickness: outlineThickness,
        transformOptions: { center, scale, rotation }
      });
    }
  }

  addCylinder({
    radiusTop = 0.5,
    radiusBottom = 0.5,
    height = 1,
    segments = 16,
    center = [0, 0, 0],
    scale = [1, 1, 1],
    rotation = [0, 0, 0],
    materialIndex = 0,
    capTop = true,
    capBottom = true,
    uvBounds = null,
    outlineMaterialIndex = null,
    outlineThickness = 0.006
  }) {
    const hh = height * 0.5;
    const positions = [];
    const normals = [];
    const uvs = [];
    const indices = [];

    // Side vertices
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      const cos = Math.cos(theta);
      const sin = Math.sin(theta);

      const slope = (radiusBottom - radiusTop) / height;
      const nlen = Math.sqrt(1 + slope * slope) || 1;
      const nx = cos / nlen;
      const ny = slope / nlen;
      const nz = sin / nlen;

      const uNorm = i / segments;
      const uvTop = this.mapUV(uNorm, 1, uvBounds);
      const uvBot = this.mapUV(uNorm, 0, uvBounds);

      // Top vertex
      positions.push(cos * radiusTop, hh, sin * radiusTop);
      normals.push(nx, ny, nz);
      uvs.push(uvTop[0], uvTop[1]);

      // Bottom vertex
      positions.push(cos * radiusBottom, -hh, sin * radiusBottom);
      normals.push(nx, ny, nz);
      uvs.push(uvBot[0], uvBot[1]);
    }

    for (let i = 0; i < segments; i++) {
      const v0 = i * 2;
      const v1 = i * 2 + 1;
      const v2 = (i + 1) * 2;
      const v3 = (i + 1) * 2 + 1;
      indices.push(v0, v2, v1);
      indices.push(v2, v3, v1);
    }

    // Top cap
    if (capTop && radiusTop > 0) {
      const topCenterIdx = positions.length / 3;
      positions.push(0, hh, 0);
      normals.push(0, 1, 0);
      const cUv = this.mapUV(0.5, 0.5, uvBounds);
      uvs.push(cUv[0], cUv[1]);

      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        positions.push(Math.cos(theta) * radiusTop, hh, Math.sin(theta) * radiusTop);
        normals.push(0, 1, 0);
        const pUv = this.mapUV(0.5 + 0.5 * Math.cos(theta), 0.5 + 0.5 * Math.sin(theta), uvBounds);
        uvs.push(pUv[0], pUv[1]);
      }

      for (let i = 0; i < segments; i++) {
        indices.push(topCenterIdx, topCenterIdx + 1 + i, topCenterIdx + 2 + i);
      }
    }

    // Bottom cap
    if (capBottom && radiusBottom > 0) {
      const botCenterIdx = positions.length / 3;
      positions.push(0, -hh, 0);
      normals.push(0, -1, 0);
      const cUv = this.mapUV(0.5, 0.5, uvBounds);
      uvs.push(cUv[0], cUv[1]);

      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        positions.push(Math.cos(theta) * radiusBottom, -hh, Math.sin(theta) * radiusBottom);
        normals.push(0, -1, 0);
        const pUv = this.mapUV(0.5 + 0.5 * Math.cos(theta), 0.5 + 0.5 * Math.sin(theta), uvBounds);
        uvs.push(pUv[0], pUv[1]);
      }

      for (let i = 0; i < segments; i++) {
        indices.push(botCenterIdx, botCenterIdx + 2 + i, botCenterIdx + 1 + i);
      }
    }

    this.addGeometry(materialIndex, positions, normals, indices, { center, scale, rotation }, uvs);

    if (outlineMaterialIndex !== null) {
      this.addInvertedHull({
        materialIndex: outlineMaterialIndex,
        positions,
        normals,
        indices,
        thickness: outlineThickness,
        transformOptions: { center, scale, rotation }
      });
    }
  }

  addSphere({
    radius = 0.5,
    widthSegments = 16,
    heightSegments = 12,
    center = [0, 0, 0],
    scale = [1, 1, 1],
    rotation = [0, 0, 0],
    materialIndex = 0,
    uvBounds = null,
    outlineMaterialIndex = null,
    outlineThickness = 0.006
  }) {
    const positions = [];
    const normals = [];
    const uvs = [];
    const indices = [];

    for (let y = 0; y <= heightSegments; y++) {
      const v = y / heightSegments;
      const phi = v * Math.PI;

      for (let x = 0; x <= widthSegments; x++) {
        const u = x / widthSegments;
        const theta = u * Math.PI * 2;

        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        const nx = -sinPhi * cosTheta;
        const ny = cosPhi;
        const nz = sinPhi * sinTheta;

        positions.push(nx * radius, ny * radius, nz * radius);
        normals.push(nx, ny, nz);

        const mapped = this.mapUV(u, 1 - v, uvBounds);
        uvs.push(mapped[0], mapped[1]);
      }
    }

    for (let y = 0; y < heightSegments; y++) {
      for (let x = 0; x < widthSegments; x++) {
        const v0 = y * (widthSegments + 1) + x;
        const v1 = v0 + (widthSegments + 1);
        const v2 = v0 + 1;
        const v3 = v1 + 1;

        if (y !== 0) {
          indices.push(v0, v1, v2);
        }
        if (y !== heightSegments - 1) {
          indices.push(v2, v1, v3);
        }
      }
    }

    this.addGeometry(materialIndex, positions, normals, indices, { center, scale, rotation }, uvs);

    if (outlineMaterialIndex !== null) {
      this.addInvertedHull({
        materialIndex: outlineMaterialIndex,
        positions,
        normals,
        indices,
        thickness: outlineThickness,
        transformOptions: { center, scale, rotation }
      });
    }
  }

  addTorus({
    radius = 0.5,
    tube = 0.15,
    radialSegments = 16,
    tubularSegments = 24,
    arc = Math.PI * 2,
    center = [0, 0, 0],
    scale = [1, 1, 1],
    rotation = [0, 0, 0],
    materialIndex = 0,
    uvBounds = null,
    outlineMaterialIndex = null,
    outlineThickness = 0.006
  }) {
    const positions = [];
    const normals = [];
    const uvs = [];
    const indices = [];

    for (let j = 0; j <= radialSegments; j++) {
      for (let i = 0; i <= tubularSegments; i++) {
        const u = (i / tubularSegments) * arc;
        const v = (j / radialSegments) * Math.PI * 2;

        const cu = Math.cos(u), su = Math.sin(u);
        const cv = Math.cos(v), sv = Math.sin(v);

        const x = (radius + tube * cv) * cu;
        const y = (radius + tube * cv) * su;
        const z = tube * sv;

        positions.push(x, y, z);

        const nx = cv * cu;
        const ny = cv * su;
        const nz = sv;
        normals.push(nx, ny, nz);

        const mapped = this.mapUV(i / tubularSegments, j / radialSegments, uvBounds);
        uvs.push(mapped[0], mapped[1]);
      }
    }

    for (let j = 1; j <= radialSegments; j++) {
      for (let i = 1; i <= tubularSegments; i++) {
        const a = (tubularSegments + 1) * j + i - 1;
        const b = (tubularSegments + 1) * (j - 1) + i - 1;
        const c = (tubularSegments + 1) * (j - 1) + i;
        const d = (tubularSegments + 1) * j + i;

        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    this.addGeometry(materialIndex, positions, normals, indices, { center, scale, rotation }, uvs);

    if (outlineMaterialIndex !== null) {
      this.addInvertedHull({
        materialIndex: outlineMaterialIndex,
        positions,
        normals,
        indices,
        thickness: outlineThickness,
        transformOptions: { center, scale, rotation }
      });
    }
  }

  addHorizontalTorus({
    radius = 0.5,
    tube = 0.15,
    radialSegments = 16,
    tubularSegments = 24,
    center = [0, 0, 0],
    scale = [1, 1, 1],
    rotation = [0, 0, 0],
    materialIndex = 0,
    uvBounds = null,
    outlineMaterialIndex = null,
    outlineThickness = 0.006
  }) {
    const positions = [];
    const normals = [];
    const uvs = [];
    const indices = [];

    for (let j = 0; j <= radialSegments; j++) {
      const theta = (j / radialSegments) * Math.PI * 2;
      const ct = Math.cos(theta);
      const st = Math.sin(theta);

      for (let i = 0; i <= tubularSegments; i++) {
        const phi = (i / tubularSegments) * Math.PI * 2;
        const cp = Math.cos(phi);
        const sp = Math.sin(phi);

        const rRing = radius + tube * ct;
        const x = rRing * cp;
        const z = rRing * sp;
        const y = tube * st;

        positions.push(x, y, z);

        const nx = ct * cp;
        const ny = st;
        const nz = ct * sp;
        normals.push(nx, ny, nz);

        const mapped = this.mapUV(i / tubularSegments, j / radialSegments, uvBounds);
        uvs.push(mapped[0], mapped[1]);
      }
    }

    for (let j = 0; j < radialSegments; j++) {
      for (let i = 0; i < tubularSegments; i++) {
        const v0 = j * (tubularSegments + 1) + i;
        const v1 = (j + 1) * (tubularSegments + 1) + i;
        const v2 = j * (tubularSegments + 1) + (i + 1);
        const v3 = (j + 1) * (tubularSegments + 1) + (i + 1);

        indices.push(v0, v1, v2);
        indices.push(v2, v1, v3);
      }
    }

    this.addGeometry(materialIndex, positions, normals, indices, { center, scale, rotation }, uvs);

    if (outlineMaterialIndex !== null) {
      this.addInvertedHull({
        materialIndex: outlineMaterialIndex,
        positions,
        normals,
        indices,
        thickness: outlineThickness,
        transformOptions: { center, scale, rotation }
      });
    }
  }

  addLoft({
    slices = [],
    segments = 16,
    capTop = false,
    capBottom = false,
    center = [0, 0, 0],
    scale = [1, 1, 1],
    rotation = [0, 0, 0],
    materialIndex = 0,
    uvBounds = null,
    outlineMaterialIndex = null,
    outlineThickness = 0.006
  }) {
    if (!slices || slices.length < 2) return;

    const positions = [];
    const uvs = [];
    const indices = [];

    // Generate vertices for all slices
    for (let s = 0; s < slices.length; s++) {
      const slice = slices[s];
      const cx = slice.cx || 0;
      const cz = slice.cz || 0;
      const rx = slice.rx !== undefined ? slice.rx : (slice.r || 0.1);
      const rz = slice.rz !== undefined ? slice.rz : (slice.r || 0.1);
      const y = slice.y || 0;

      const vNorm = s / (slices.length - 1);

      for (let i = 0; i <= segments; i++) {
        const phi = (i / segments) * Math.PI * 2;
        let radX = rx;
        let radZ = rz;
        if (slice.pleatCount && slice.pleatDepth) {
          const pleat = Math.sin(phi * slice.pleatCount) * slice.pleatDepth;
          radX += pleat;
          radZ += pleat;
        }
        const x = cx + radX * Math.cos(phi);
        const z = cz + radZ * Math.sin(phi);
        positions.push(x, y, z);

        const uNorm = i / segments;
        const mapped = this.mapUV(uNorm, vNorm, uvBounds);
        uvs.push(mapped[0], mapped[1]);
      }
    }

    // Connect slices with quads (handle ascending and descending slice heights)
    const isDescending = slices.length > 1 && (slices[slices.length - 1].y < slices[0].y);
    for (let s = 0; s < slices.length - 1; s++) {
      for (let i = 0; i < segments; i++) {
        const v0 = s * (segments + 1) + i;
        const v1 = (s + 1) * (segments + 1) + i;
        const v2 = s * (segments + 1) + (i + 1);
        const v3 = (s + 1) * (segments + 1) + (i + 1);

        if (isDescending) {
          indices.push(v0, v2, v1);
          indices.push(v2, v3, v1);
        } else {
          indices.push(v0, v1, v2);
          indices.push(v2, v1, v3);
        }
      }
    }

    // Cap bottom (lowest Y slice)
    if (capBottom) {
      const botSliceIdx = isDescending ? (slices.length - 1) : 0;
      const botSlice = slices[botSliceIdx];
      const centerIdx = positions.length / 3;
      positions.push(botSlice.cx || 0, botSlice.y || 0, botSlice.cz || 0);
      const cUv = this.mapUV(0.5, 0, uvBounds);
      uvs.push(cUv[0], cUv[1]);

      const botOffset = botSliceIdx * (segments + 1);
      for (let i = 0; i < segments; i++) {
        const v0 = botOffset + i;
        const v1 = botOffset + i + 1;
        indices.push(centerIdx, v1, v0);
      }
    }

    // Cap top (highest Y slice)
    if (capTop) {
      const topSliceIdx = isDescending ? 0 : (slices.length - 1);
      const topSlice = slices[topSliceIdx];
      const centerIdx = positions.length / 3;
      positions.push(topSlice.cx || 0, topSlice.y || 0, topSlice.cz || 0);
      const cUv = this.mapUV(0.5, 1, uvBounds);
      uvs.push(cUv[0], cUv[1]);

      const topOffset = topSliceIdx * (segments + 1);
      for (let i = 0; i < segments; i++) {
        const v0 = topOffset + i;
        const v1 = topOffset + i + 1;
        indices.push(centerIdx, v0, v1);
      }
    }

    // Compute smooth normals by averaging face normals
    const normals = new Float32Array(positions.length);
    for (let i = 0; i < indices.length; i += 3) {
      const i0 = indices[i];
      const i1 = indices[i + 1];
      const i2 = indices[i + 2];

      const p0x = positions[i0 * 3], p0y = positions[i0 * 3 + 1], p0z = positions[i0 * 3 + 2];
      const p1x = positions[i1 * 3], p1y = positions[i1 * 3 + 1], p1z = positions[i1 * 3 + 2];
      const p2x = positions[i2 * 3], p2y = positions[i2 * 3 + 1], p2z = positions[i2 * 3 + 2];

      const e1x = p1x - p0x, e1y = p1y - p0y, e1z = p1z - p0z;
      const e2x = p2x - p0x, e2y = p2y - p0y, e2z = p2z - p0z;

      const nx = e1y * e2z - e1z * e2y;
      const ny = e1z * e2x - e1x * e2z;
      const nz = e1x * e2y - e1y * e2x;

      normals[i0 * 3] += nx; normals[i0 * 3 + 1] += ny; normals[i0 * 3 + 2] += nz;
      normals[i1 * 3] += nx; normals[i1 * 3 + 1] += ny; normals[i1 * 3 + 2] += nz;
      normals[i2 * 3] += nx; normals[i2 * 3 + 1] += ny; normals[i2 * 3 + 2] += nz;
    }

    for (let i = 0; i < normals.length; i += 3) {
      const nx = normals[i], ny = normals[i + 1], nz = normals[i + 2];
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
      if (len > 0.0001) {
        normals[i] /= len;
        normals[i + 1] /= len;
        normals[i + 2] /= len;
      } else {
        normals[i] = 0; normals[i + 1] = 1; normals[i + 2] = 0;
      }
    }

    const normArr = Array.from(normals);
    this.addGeometry(materialIndex, positions, normArr, indices, { center, scale, rotation }, uvs);

    if (outlineMaterialIndex !== null) {
      this.addInvertedHull({
        materialIndex: outlineMaterialIndex,
        positions,
        normals: normArr,
        indices,
        thickness: outlineThickness,
        transformOptions: { center, scale, rotation }
      });
    }
  }

  addCapsule({
    radius = 0.05,
    height = 0.3,
    segments = 16,
    rings = 6,
    center = [0, 0, 0],
    scale = [1, 1, 1],
    rotation = [0, 0, 0],
    materialIndex = 0,
    uvBounds = null,
    outlineMaterialIndex = null,
    outlineThickness = 0.006
  }) {
    const cylHeight = Math.max(0.001, height - 2 * radius);
    const halfCyl = cylHeight * 0.5;
    const slices = [];

    // Bottom hemisphere
    for (let r = rings; r >= 1; r--) {
      const v = r / rings;
      const angle = (v * Math.PI * 0.5);
      const y = -halfCyl - Math.sin(angle) * radius;
      const rad = Math.cos(angle) * radius;
      slices.push({ y, rx: rad, rz: rad });
    }

    // Cylinder transition points
    slices.push({ y: -halfCyl, rx: radius, rz: radius });
    slices.push({ y: halfCyl, rx: radius, rz: radius });

    // Top hemisphere
    for (let r = 1; r <= rings; r++) {
      const v = r / rings;
      const angle = (v * Math.PI * 0.5);
      const y = halfCyl + Math.sin(angle) * radius;
      const rad = Math.cos(angle) * radius;
      slices.push({ y, rx: rad, rz: rad });
    }

    this.addLoft({
      slices,
      segments,
      capTop: true,
      capBottom: true,
      center,
      scale,
      rotation,
      materialIndex,
      uvBounds,
      outlineMaterialIndex,
      outlineThickness
    });
  }

  addCone({
    radius = 0.5,
    height = 1,
    segments = 16,
    center = [0, 0, 0],
    scale = [1, 1, 1],
    rotation = [0, 0, 0],
    materialIndex = 0,
    uvBounds = null,
    outlineMaterialIndex = null,
    outlineThickness = 0.006
  }) {
    this.addCylinder({
      radiusTop: 0.001,
      radiusBottom: radius,
      height: height,
      segments: segments,
      center: center,
      scale: scale,
      rotation: rotation,
      materialIndex: materialIndex,
      capTop: false,
      capBottom: true,
      uvBounds,
      outlineMaterialIndex,
      outlineThickness
    });
  }
}

module.exports = { GLBBuilder };
