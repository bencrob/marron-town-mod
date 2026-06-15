// Génère une texture placeholder 16x16 du Grimoire (violet/doré, pixel-art).
// Remplaçable par une vraie texture Blockbench. Usage : node scripts/gen-texture.mjs
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';

const W = 16;
const H = 16;
const PURPLE = [59, 29, 94, 255];
const PURPLE_DARK = [38, 18, 64, 255];
const GOLD = [212, 175, 55, 255];
const SPINE = [27, 13, 46, 255];
const TRANSPARENT = [0, 0, 0, 0];

// Carte 16x16 : 0 transparent, 1 violet, 2 violet foncé (bord), 3 doré (rune), 4 dos du livre.
// prettier-ignore
const MAP = [
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,2,2,2,2,2,4,2,2,2,2,2,2,0,0,
  0,2,1,1,1,1,1,4,1,1,1,1,1,1,2,0,
  0,2,1,1,3,1,1,4,1,1,3,1,1,1,2,0,
  0,2,1,3,3,3,1,4,1,3,3,3,1,1,2,0,
  0,2,1,1,3,1,1,4,1,1,3,1,1,1,2,0,
  0,2,1,1,1,1,1,4,1,1,1,1,1,1,2,0,
  0,2,1,1,1,1,1,4,1,1,1,1,1,1,2,0,
  0,2,1,1,1,3,1,4,1,3,1,1,1,1,2,0,
  0,2,1,1,3,3,3,4,3,3,3,1,1,1,2,0,
  0,2,1,1,1,3,1,4,1,3,1,1,1,1,2,0,
  0,2,1,1,1,1,1,4,1,1,1,1,1,1,2,0,
  0,2,1,1,1,1,1,4,1,1,1,1,1,1,2,0,
  0,2,1,1,1,1,1,4,1,1,1,1,1,1,2,0,
  0,0,2,2,2,2,2,4,2,2,2,2,2,2,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
];
const PALETTE = { 0: TRANSPARENT, 1: PURPLE, 2: PURPLE_DARK, 3: GOLD, 4: SPINE };

const raw = Buffer.alloc(H * (1 + W * 4));
for (let y = 0; y < H; y++) {
  raw[y * (1 + W * 4)] = 0; // filtre 0
  for (let x = 0; x < W; x++) {
    const [r, g, b, a] = PALETTE[MAP[y * W + x]] ?? TRANSPARENT;
    const o = y * (1 + W * 4) + 1 + x * 4;
    raw[o] = r;
    raw[o + 1] = g;
    raw[o + 2] = b;
    raw[o + 3] = a;
  }
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])) >>> 0, 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return c ^ 0xffffffff;
}

const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 6; // RGBA
const png = Buffer.concat([
  sig,
  chunk('IHDR', ihdr),
  chunk('IDAT', deflateSync(raw)),
  chunk('IEND', Buffer.alloc(0)),
]);

mkdirSync('resource_pack/textures/items', { recursive: true });
writeFileSync('resource_pack/textures/items/skill_grimoire.png', png);
console.log('✓ resource_pack/textures/items/skill_grimoire.png (16x16)');
