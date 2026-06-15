// Convertit assets/marron.jpeg en PNG et le place comme PDP du mod + icône du grimoire.
// Usage : node scripts/import-marron.mjs
import Jimp from 'jimp';
import { existsSync } from 'node:fs';

const SRC = 'assets/marron.jpeg';
if (!existsSync(SRC)) {
  console.error(`Image source absente : ${SRC}`);
  process.exit(1);
}

const img = await Jimp.read(SRC);

// PDP du mod (icône des packs) — 256x256.
const icon = img.clone().cover(256, 256);
await icon.writeAsync('behavior_pack/pack_icon.png');
await icon.writeAsync('resource_pack/pack_icon.png');

// Icône d'item du Grimoire — 32x32 (Bedrock met à l'échelle dans l'inventaire).
await img.clone().cover(32, 32).writeAsync('resource_pack/textures/items/skill_grimoire.png');

console.log('✓ pack_icon.png (BP+RP) + textures/items/skill_grimoire.png générés depuis marron.jpeg');
