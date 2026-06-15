// Crée dist/craftsman.mcaddon (un zip contenant les deux packs).
// Pré-requis : `npm run build` a généré behavior_pack/scripts/main.js.
// Usage : npm run package
import { createWriteStream, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import archiver from 'archiver';

const OUT_DIR = 'dist';
const OUT_FILE = join(OUT_DIR, 'marron-town-mod.mcaddon');
const PACKS = ['behavior_pack', 'resource_pack'];

// Garde-fou : le bundle doit exister, sinon on livrerait un pack sans scripts.
if (!existsSync(join('behavior_pack', 'scripts', 'main.js'))) {
  console.error('main.js absent — lance `npm run build` avant de packager.');
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });

const output = createWriteStream(OUT_FILE);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  const kb = (archive.pointer() / 1024).toFixed(1);
  console.log(`✓ ${OUT_FILE} (${kb} Ko)`);
  console.log('Double-clic sur ce fichier importe l’add-on dans Minecraft.');
});
archive.on('warning', (err) => console.warn(err));
archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);
for (const pack of PACKS) {
  // Chaque pack est placé dans son propre dossier à la racine du .mcaddon.
  archive.directory(pack, pack, (entry) =>
    entry.name.endsWith('.map') ? false : entry,
  );
}
await archive.finalize();
