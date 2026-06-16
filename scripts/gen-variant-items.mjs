// Génère les fichiers d'items des variantes de grimoire + entrées item_texture.json & lang.
// Usage : node scripts/gen-variant-items.mjs
import { writeFileSync, readFileSync } from 'node:fs';

const VARIANTS = [
  { name: 'grimoire_violet', label: 'Grimoire Violet' },
  { name: 'grimoire_emerald', label: 'Grimoire Émeraude' },
  { name: 'grimoire_gold', label: 'Grimoire Or' },
  { name: 'grimoire_redstone', label: 'Grimoire Redstone' },
  { name: 'grimoire_mossy', label: 'Grimoire Pierre Moussue' },
];

// 1) Fichiers d'items
for (const v of VARIANTS) {
  const item = {
    format_version: '1.21.0',
    'minecraft:item': {
      description: { identifier: `marrontown:${v.name}`, menu_category: { category: 'equipment' } },
      components: {
        'minecraft:max_stack_size': 1,
        'minecraft:icon': v.name,
        'minecraft:hand_equipped': true,
        'minecraft:display_name': { value: `§6${v.label}` },
      },
    },
  };
  writeFileSync(`behavior_pack/items/${v.name}.json`, JSON.stringify(item, null, 2) + '\n');
  console.log(`✓ behavior_pack/items/${v.name}.json`);
}

// 2) item_texture.json
const texPath = 'resource_pack/textures/item_texture.json';
const tex = JSON.parse(readFileSync(texPath, 'utf8'));
for (const v of VARIANTS) tex.texture_data[v.name] = { textures: `textures/items/${v.name}` };
writeFileSync(texPath, JSON.stringify(tex, null, 2) + '\n');
console.log('✓ item_texture.json mis à jour');

// 3) lang
const langPath = 'resource_pack/texts/en_US.lang';
let lang = readFileSync(langPath, 'utf8').trimEnd() + '\n';
for (const v of VARIANTS) {
  const key = `item.marrontown:${v.name}=`;
  if (!lang.includes(key)) lang += `${key}${v.label}\n`;
}
writeFileSync(langPath, lang);
console.log('✓ en_US.lang mis à jour');
