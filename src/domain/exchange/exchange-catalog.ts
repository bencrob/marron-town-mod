/**
 * DOMAINE PUR — offres d'échange ressources → points (source de progression au-delà du
 * plafond XP). Offres fixes + une offre « bonus » qui change chaque jour.
 */
export interface ExchangeOffer {
  readonly key: string;
  readonly itemId: string;
  readonly label: string;
  /** Quantité d'items à donner. */
  readonly count: number;
  /** Points reçus en échange. */
  readonly points: number;
}

export const FIXED_EXCHANGES: readonly ExchangeOffer[] = [
  { key: 'diamond', itemId: 'minecraft:diamond', label: '64 Diamants', count: 64, points: 5 },
  { key: 'emerald', itemId: 'minecraft:emerald', label: '64 Émeraudes', count: 64, points: 5 },
  { key: 'debris', itemId: 'minecraft:ancient_debris', label: '32 Débris antiques', count: 32, points: 3 },
];

export const DAILY_BONUS_POOL: readonly ExchangeOffer[] = [
  { key: 'bread', itemId: 'minecraft:bread', label: '128 Pains', count: 128, points: 10 },
  { key: 'logs', itemId: 'minecraft:oak_log', label: '64 Bûches', count: 64, points: 1 },
  { key: 'iron', itemId: 'minecraft:iron_ingot', label: '64 Lingots de fer', count: 64, points: 4 },
  { key: 'coal', itemId: 'minecraft:coal', label: '128 Charbon', count: 128, points: 2 },
  { key: 'wheat', itemId: 'minecraft:wheat', label: '128 Blé', count: 128, points: 3 },
];
