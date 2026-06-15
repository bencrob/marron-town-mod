// Copie les packs dans le dossier com.mojang de Minecraft Bedrock (Windows).
// Usage : npm run deploy  (lance d'abord le build).
import { cpSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';

const localAppData = process.env.LOCALAPPDATA;
if (!localAppData) {
  console.error('LOCALAPPDATA introuvable — ce script cible Windows.');
  process.exit(1);
}

const packagesDir = join(localAppData, 'Packages');
const uwp = readdirSync(packagesDir).find((d) => d.startsWith('Microsoft.MinecraftUWP_'));
if (!uwp) {
  console.error('Installation Minecraft Bedrock (UWP) introuvable dans Packages/.');
  process.exit(1);
}

const comMojang = join(packagesDir, uwp, 'LocalState', 'games', 'com.mojang');
const targets = [
  ['behavior_pack', 'development_behavior_packs', 'marrontown_bp'],
  ['resource_pack', 'development_resource_packs', 'marrontown_rp'],
];

for (const [src, devDir, name] of targets) {
  const dest = join(comMojang, devDir, name);
  if (!existsSync(src)) {
    console.error(`Source manquante: ${src}`);
    process.exit(1);
  }
  cpSync(src, dest, { recursive: true });
  console.log(`✓ ${src} -> ${dest}`);
}

console.log('\nDéployé. Relance ton monde dans Minecraft (Beta APIs activées).');
