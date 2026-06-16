// Génère les textures 16x16 des variantes de grimoire (livres recolorés) + l'icône palette.
// Usage : node scripts/gen-grimoire-variants.mjs
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';

const W = 16, H = 16, T = [0, 0, 0, 0];

// --- encodeur PNG RGBA ---
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = (b) => { let c = 0xffffffff; for (const x of b) c = CRC[(c ^ x) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0); const ty = Buffer.from(type, 'ascii'); const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([ty, data])), 0); return Buffer.concat([len, ty, data, crc]); };
function png(map, palette) {
  const raw = Buffer.alloc(H * (1 + W * 4));
  for (let y = 0; y < H; y++) {
    raw[y * (1 + W * 4)] = 0;
    for (let x = 0; x < W; x++) {
      const [r, g, b, a] = palette[map[y * W + x]] ?? T;
      const o = y * (1 + W * 4) + 1 + x * 4;
      raw[o] = r; raw[o + 1] = g; raw[o + 2] = b; raw[o + 3] = a;
    }
  }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

// --- silhouette de livre : 0 vide · 1 couverture · 2 bord · 3 rune · 4 dos ---
// prettier-ignore
const BOOK = [
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

const A = 255;
const variants = {
  grimoire_violet: { 1: [106, 63, 160, A], 2: [59, 29, 94, A], 3: [212, 175, 55, A], 4: [42, 20, 68, A] },
  grimoire_emerald: { 1: [31, 158, 90, A], 2: [15, 94, 52, A], 3: [212, 175, 55, A], 4: [10, 61, 34, A] },
  grimoire_gold: { 1: [212, 175, 55, A], 2: [156, 125, 30, A], 3: [255, 243, 176, A], 4: [122, 94, 18, A] },
  grimoire_redstone: { 1: [176, 48, 48, A], 2: [110, 28, 28, A], 3: [255, 208, 208, A], 4: [74, 18, 18, A] },
  grimoire_mossy: { 1: [90, 110, 74, A], 2: [58, 74, 48, A], 3: [143, 174, 106, A], 4: [42, 51, 31, A] },
};

mkdirSync('resource_pack/textures/items', { recursive: true });
for (const [name, pal] of Object.entries(variants)) {
  writeFileSync(`resource_pack/textures/items/${name}.png`, png(BOOK, { 0: T, ...pal }));
  console.log(`✓ ${name}.png`);
}

// --- icône palette de peinture (bouton Customisation) ---
// prettier-ignore
const PALETTE_MAP = [
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,2,2,2,2,2,2,0,0,0,0,0,0,
  0,0,0,2,1,1,1,1,1,1,2,0,0,0,0,0,
  0,0,2,1,4,1,1,5,1,1,1,2,0,0,0,0,
  0,0,2,1,1,1,1,1,1,6,1,2,0,0,0,0,
  0,0,2,1,7,1,1,1,1,1,1,2,2,0,0,0,
  0,0,2,1,1,1,8,1,1,1,0,0,9,2,0,0,
  0,0,0,2,1,1,1,1,1,2,0,9,9,9,2,0,
  0,0,0,0,2,2,2,2,2,0,0,0,9,9,2,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
];
const PALETTE_PAL = {
  0: T,
  1: [222, 198, 150, A], // bois clair
  2: [120, 86, 44, A],   // bord
  4: [200, 60, 60, A],   // rouge
  5: [70, 120, 210, A],  // bleu
  6: [70, 180, 90, A],   // vert
  7: [230, 200, 60, A],  // jaune
  8: [170, 80, 200, A],  // violet
  9: [110, 80, 50, A],   // manche du pinceau
};
writeFileSync('resource_pack/textures/items/palette.png', png(PALETTE_MAP, PALETTE_PAL));
console.log('✓ palette.png');
