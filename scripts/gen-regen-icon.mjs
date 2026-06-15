// Génère l'icône custom 16x16 « régénération » (cœur rose) pour le bouton Résistance.
// Usage : node scripts/gen-regen-icon.mjs
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';

const W = 16;
const H = 16;
const PINK = [255, 107, 166, 255];
const PINK_DARK = [201, 74, 124, 255];
const WHITE = [255, 255, 255, 255];
const T = [0, 0, 0, 0];

// 0 transparent · 1 rose · 2 contour · 3 éclat blanc
// prettier-ignore
const MAP = [
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,2,2,0,0,0,0,0,2,2,0,0,0,0,0,
  0,2,1,1,2,0,0,0,2,1,1,2,0,0,0,0,
  2,1,1,3,1,2,0,2,1,1,1,1,2,0,0,0,
  2,1,1,1,1,1,2,1,1,1,1,1,2,0,0,0,
  2,1,1,1,1,1,1,1,1,1,1,1,2,0,0,0,
  0,2,1,1,1,1,1,1,1,1,1,2,0,0,0,0,
  0,0,2,1,1,1,1,1,1,1,2,0,0,0,0,0,
  0,0,0,2,1,1,1,1,1,2,0,0,0,0,0,0,
  0,0,0,0,2,1,1,1,2,0,0,0,0,0,0,0,
  0,0,0,0,0,2,1,2,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
];
const PAL = { 0: T, 1: PINK, 2: PINK_DARK, 3: WHITE };

const raw = Buffer.alloc(H * (1 + W * 4));
for (let y = 0; y < H; y++) {
  raw[y * (1 + W * 4)] = 0;
  for (let x = 0; x < W; x++) {
    const [r, g, b, a] = PAL[MAP[y * W + x]] ?? T;
    const o = y * (1 + W * 4) + 1 + x * 4;
    raw[o] = r; raw[o + 1] = g; raw[o + 2] = b; raw[o + 3] = a;
  }
}

const CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
  return t;
})();
const crc32 = (buf) => { let c = 0xffffffff; for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
};
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 6;
const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk('IHDR', ihdr),
  chunk('IDAT', deflateSync(raw)),
  chunk('IEND', Buffer.alloc(0)),
]);

mkdirSync('resource_pack/textures/items', { recursive: true });
writeFileSync('resource_pack/textures/items/marrontown_regen.png', png);
console.log('✓ resource_pack/textures/items/marrontown_regen.png (16x16)');
