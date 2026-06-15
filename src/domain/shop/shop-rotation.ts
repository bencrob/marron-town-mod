import { SHOP_CATALOG, type ShopItem } from './shop-catalog';

/**
 * DOMAINE PUR — rotation 12h déterministe. Le timing dépend de `nowMs` (injecté),
 * la sélection dépend uniquement de `seed` → 100 % reproductible et testable.
 */
export const ROTATION_PERIOD_MS = 12 * 60 * 60 * 1000;

export function rotationIndex(ms: number, periodMs: number = ROTATION_PERIOD_MS): number {
  return Math.floor(ms / periodMs);
}

/** Vrai si l'horodatage stocké appartient à une fenêtre de rotation antérieure. */
export function isRotationStale(
  nowMs: number,
  storedTsMs: number,
  periodMs: number = ROTATION_PERIOD_MS,
): boolean {
  return rotationIndex(nowMs, periodMs) !== rotationIndex(storedTsMs, periodMs);
}

/** Millisecondes restantes avant la prochaine rotation (pour l'affichage HH:MM). */
export function msUntilNextRotation(nowMs: number, periodMs: number = ROTATION_PERIOD_MS): number {
  const rem = periodMs - (nowMs % periodMs);
  return rem === periodMs ? 0 : rem;
}

/** PRNG déterministe (mulberry32). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface ShopOffer {
  readonly item: ShopItem;
  readonly price: number;
  readonly slot: number; // 0–4, mappé aux scoreboards marrontown_shop_b_[0-4]
}

function shuffle<T>(arr: readonly T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function priceIn(item: ShopItem, rng: () => number): number {
  return item.costMin + Math.floor(rng() * (item.costMax - item.costMin + 1));
}

/**
 * Sélection d'une rotation : 3 communs + 2 rares, prix tirés dans leur fourchette.
 * Déterministe pour un `seed` donné.
 */
export function seededPick(
  seed: number,
  catalog: readonly ShopItem[] = SHOP_CATALOG,
  commonCount = 3,
  rareCount = 2,
): ShopOffer[] {
  const rng = mulberry32(seed);
  const commons = shuffle(catalog.filter((i) => i.rarity === 'common'), rng).slice(0, commonCount);
  const rares = shuffle(catalog.filter((i) => i.rarity === 'rare'), rng).slice(0, rareCount);
  return [...commons, ...rares].map((item, slot) => ({ item, slot, price: priceIn(item, rng) }));
}
