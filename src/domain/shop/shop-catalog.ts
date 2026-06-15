/**
 * DOMAINE PUR — catalogue d'objets de la boutique, en données.
 * `id` = identifiant d'item Minecraft vanilla ; `count` = quantité donnée.
 */
export type Rarity = 'common' | 'rare';

export interface ShopItem {
  readonly key: string; // identifiant stable interne
  readonly id: string; // item Minecraft
  readonly label: string;
  readonly count: number;
  readonly rarity: Rarity;
  readonly costMin: number;
  readonly costMax: number;
}

export const SHOP_CATALOG: readonly ShopItem[] = [
  // Communs (5–10 pts)
  { key: 'bread', id: 'minecraft:bread', label: 'Pain x16', count: 16, rarity: 'common', costMin: 5, costMax: 10 },
  { key: 'arrow', id: 'minecraft:arrow', label: 'Flèches x32', count: 32, rarity: 'common', costMin: 5, costMax: 10 },
  { key: 'torch', id: 'minecraft:torch', label: 'Torches x32', count: 32, rarity: 'common', costMin: 5, costMax: 10 },
  { key: 'ender_pearl', id: 'minecraft:ender_pearl', label: "Perles de l'Ender x4", count: 4, rarity: 'common', costMin: 5, costMax: 10 },
  { key: 'bone', id: 'minecraft:bone', label: 'Os x16', count: 16, rarity: 'common', costMin: 5, costMax: 10 },
  { key: 'coal', id: 'minecraft:coal', label: 'Charbon x32', count: 32, rarity: 'common', costMin: 5, costMax: 10 },
  { key: 'log', id: 'minecraft:oak_log', label: 'Bois x32', count: 32, rarity: 'common', costMin: 5, costMax: 10 },
  { key: 'golden_apple', id: 'minecraft:golden_apple', label: 'Pomme Dorée', count: 1, rarity: 'common', costMin: 5, costMax: 10 },
  // Rares (15–30 pts)
  { key: 'ench_golden_apple', id: 'minecraft:enchanted_golden_apple', label: 'Pomme Dorée Enchantée', count: 1, rarity: 'rare', costMin: 15, costMax: 30 },
  { key: 'elytra', id: 'minecraft:elytra', label: 'Élytres', count: 1, rarity: 'rare', costMin: 15, costMax: 30 },
  { key: 'totem', id: 'minecraft:totem_of_undying', label: "Totem d'Immortalité", count: 1, rarity: 'rare', costMin: 15, costMax: 30 },
  { key: 'trident', id: 'minecraft:trident', label: 'Trident', count: 1, rarity: 'rare', costMin: 15, costMax: 30 },
  { key: 'nether_star', id: 'minecraft:nether_star', label: 'Étoile du Nether', count: 1, rarity: 'rare', costMin: 15, costMax: 30 },
];
