/**
 * DOMAINE PUR — catalogue boutique (V2). Items vanilla utiles, jamais déséquilibrés.
 * Retirés : élytres, netherite, minerais bruts, et tout ce qui passe par l'Échange.
 * `icon` = texture vanilla pour le bouton.
 */
export type Rarity = 'common' | 'rare';

export interface ShopItem {
  readonly key: string;
  readonly id: string;
  readonly label: string;
  readonly count: number;
  readonly rarity: Rarity;
  readonly costMin: number;
  readonly costMax: number;
  readonly icon: string;
}

export const SHOP_CATALOG: readonly ShopItem[] = [
  // Communs (5–10 pts) — consommables & utilitaires
  { key: 'bread', id: 'minecraft:bread', label: 'Pain x16', count: 16, rarity: 'common', costMin: 5, costMax: 10, icon: 'textures/items/bread' },
  { key: 'arrow', id: 'minecraft:arrow', label: 'Flèches x32', count: 32, rarity: 'common', costMin: 5, costMax: 10, icon: 'textures/items/arrow' },
  { key: 'ender_pearl', id: 'minecraft:ender_pearl', label: "Perles de l'Ender x4", count: 4, rarity: 'common', costMin: 5, costMax: 10, icon: 'textures/items/ender_pearl' },
  { key: 'bone', id: 'minecraft:bone', label: 'Os x16', count: 16, rarity: 'common', costMin: 5, costMax: 10, icon: 'textures/items/bone' },
  { key: 'coal', id: 'minecraft:coal', label: 'Charbon x32', count: 32, rarity: 'common', costMin: 5, costMax: 10, icon: 'textures/items/coal' },
  { key: 'beef', id: 'minecraft:cooked_beef', label: 'Steaks x16', count: 16, rarity: 'common', costMin: 5, costMax: 10, icon: 'textures/items/beef_cooked' },
  { key: 'log', id: 'minecraft:oak_log', label: 'Bois x32', count: 32, rarity: 'common', costMin: 5, costMax: 10, icon: 'textures/blocks/log_oak' },
  { key: 'torch', id: 'minecraft:torch', label: 'Torches x32', count: 32, rarity: 'common', costMin: 5, costMax: 10, icon: 'textures/blocks/torch_on' },
  // Rares (15–30 pts) — utiles, non cassés
  { key: 'ench_golden_apple', id: 'minecraft:enchanted_golden_apple', label: 'Pomme Dorée Enchantée', count: 1, rarity: 'rare', costMin: 15, costMax: 30, icon: 'textures/items/apple_golden' },
  { key: 'name_tag', id: 'minecraft:name_tag', label: 'Étiquette', count: 1, rarity: 'rare', costMin: 15, costMax: 30, icon: 'textures/items/name_tag' },
  { key: 'saddle', id: 'minecraft:saddle', label: 'Selle', count: 1, rarity: 'rare', costMin: 15, costMax: 30, icon: 'textures/items/saddle' },
  { key: 'lead', id: 'minecraft:lead', label: 'Laisse x2', count: 2, rarity: 'rare', costMin: 15, costMax: 30, icon: 'textures/items/lead' },
];
