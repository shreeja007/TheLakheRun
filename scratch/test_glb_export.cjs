const fs = require('fs');
const path = require('path');

// Simple test to ensure our GLB structure generates valid GLB headers
function testGLBStructure() {
  const jsonContent = JSON.stringify({
    asset: { version: "2.0", generator: "Test" },
    scenes: [{ nodes: [0] }],
    nodes: [{ name: "Root" }]
  });

  const jsonBuffer = Buffer.from(jsonContent, 'utf8');
  // Pad JSON chunk to 4-byte boundary with spaces (0x20)
  const jsonPadding = (4 - (jsonBuffer.length % 4)) % 4;
  const paddedJson = Buffer.concat([jsonBuffer, Buffer.alloc(jsonPadding, 0x20)]);

  const totalLength = 12 + 8 + paddedJson.length;
  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546C67, 0); // 'glTF'
  header.writeUInt32LE(2, 4);          // version 2
  header.writeUInt32LE(totalLength, 8);

  const chunkHeader = Buffer.alloc(8);
  chunkHeader.writeUInt32LE(paddedJson.length, 0);
  chunkHeader.writeUInt32LE(0x4E4F534A, 4); // 'JSON'

  const glb = Buffer.concat([header, chunkHeader, paddedJson]);
  console.log('Generated test GLB of size:', glb.length);
  return glb;
}

testGLBStructure();
