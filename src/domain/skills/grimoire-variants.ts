/**
 * DOMAINE PUR — variantes de couverture du Grimoire (customisation #7).
 * Chaque variante est un VRAI item (id distinct + texture livrée) → visible en main,
 * inventaire, barre de raccourcis et au sol. (L'édition pixel libre est impossible sur
 * Bedrock : on propose un choix de couvertures prédéfinies.)
 */
export interface GrimoireVariant {
  readonly id: string;
  readonly label: string;
  readonly texture: string; // shortname dans item_texture.json
  readonly icon: string; // chemin texture pour le bouton de menu
}

export const GRIMOIRE_VARIANTS: readonly GrimoireVariant[] = [
  { id: 'marrontown:skill_grimoire', label: 'Marron (défaut)', texture: 'skill_grimoire', icon: 'textures/items/skill_grimoire' },
  { id: 'marrontown:grimoire_violet', label: 'Violet', texture: 'grimoire_violet', icon: 'textures/items/grimoire_violet' },
  { id: 'marrontown:grimoire_emerald', label: 'Émeraude', texture: 'grimoire_emerald', icon: 'textures/items/grimoire_emerald' },
  { id: 'marrontown:grimoire_gold', label: 'Or', texture: 'grimoire_gold', icon: 'textures/items/grimoire_gold' },
  { id: 'marrontown:grimoire_redstone', label: 'Redstone', texture: 'grimoire_redstone', icon: 'textures/items/grimoire_redstone' },
  { id: 'marrontown:grimoire_mossy', label: 'Pierre Moussue', texture: 'grimoire_mossy', icon: 'textures/items/grimoire_mossy' },
];

/** Tous les ids de grimoire (toute variante ouvre le menu / est « le grimoire »). */
export const GRIMOIRE_IDS: readonly string[] = GRIMOIRE_VARIANTS.map((v) => v.id);

/** Variante associée au thème Mossy Stone (#9). */
export const MOSSY_VARIANT_ID = 'marrontown:grimoire_mossy';
