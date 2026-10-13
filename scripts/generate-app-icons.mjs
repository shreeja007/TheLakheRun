import { mkdirSync, writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

// Original geometric placeholder: three lanes and a forward arrow. No character/cultural art.
const root = new URL('../public/icons/', import.meta.url);
mkdirSync(root, { recursive: true });
const background = [11, 28, 41];
const teal = [85, 183, 200];
const gold = [251, 191, 36];
const strokes = [
  [190, 330, 190, 182, 12, teal], [256, 330, 256, 182, 12, teal], [322, 330, 322, 182, 12, teal],
  [218, 222, 256, 184, 20, gold], [256, 184, 294, 222, 20, gold],
];
const crc = (buffer) => {
  let value = 0xffffffff;
  for (const byte of buffer) {
    value ^= byte;
    for (let bit = 0; bit < 8; bit++) value = (value >>> 1) ^ ((value & 1) ? 0xedb88320 : 0);
  }
  return (value ^ 0xffffffff) >>> 0;
};
const chunk = (name, data) => {
  const tag = Buffer.from(name);
  const length = Buffer.alloc(4); length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4); checksum.writeUInt32BE(crc(Buffer.concat([tag, data])));
  return Buffer.concat([length, tag, data, checksum]);
};
function png(size) {
  const bytes = Buffer.alloc(size * (1 + size * 3));
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const px = (x + .5) * 512 / size;
      const py = (y + .5) * 512 / size;
      let color = background;
      for (const [ax, ay, bx, by, width, paint] of strokes) {
        const dx = bx - ax, dy = by - ay;
        const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
        if (Math.hypot(px - ax - dx * t, py - ay - dy * t) <= width / 2) color = paint;
      }
      const offset = y * (1 + size * 3) + 1 + x * 3;
      bytes.set(color, offset);
    }
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0); header.writeUInt32BE(size, 4); header[8] = 8; header[9] = 2;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk('IHDR', header), chunk('IDAT', deflateSync(bytes)), chunk('IEND', Buffer.alloc(0))]);
}
for (const [name, size] of [['app-192.png', 192], ['app-512.png', 512], ['app-maskable-512.png', 512], ['apple-touch-icon.png', 180]]) {
  writeFileSync(new URL(name, root), png(size));
}
writeFileSync(new URL('app-icon.svg', root), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="96" fill="#0b1c29"/><path d="M190 330V182M256 330V182M322 330V182" fill="none" stroke="#55b7c8" stroke-width="12" stroke-linecap="round"/><path d="m218 222 38-38 38 38" fill="none" stroke="#fbbf24" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/></svg>\n`);
console.log('Generated original lane-arrow icons (192, 512, maskable 512, Apple 180).');
