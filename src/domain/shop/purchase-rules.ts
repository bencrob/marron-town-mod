import { type Rarity } from './shop-catalog';

/**
 * DOMAINE PUR — règles d'achat boutique (V2). Chaque offre est achetable un nombre limité de
 * fois par jour selon sa rareté (commun 3×, rare 1×). Le compteur par slot est remis à 0 à
 * chaque nouvelle rotation quotidienne.
 */
export function maxBuysFor(rarity: Rarity): number {
  return rarity === 'rare' ? 1 : 3;
}

export function canBuy(
  unspentPoints: number,
  price: number,
  boughtCount: number,
  maxBuys: number,
): boolean {
  return boughtCount < maxBuys && unspentPoints >= price;
}

export interface PurchaseResult {
  readonly unspentPoints: number;
  readonly boughtCount: number;
  readonly ok: boolean;
}

export function applyPurchase(
  unspentPoints: number,
  price: number,
  boughtCount: number,
  maxBuys: number,
): PurchaseResult {
  if (!canBuy(unspentPoints, price, boughtCount, maxBuys)) {
    return { unspentPoints, boughtCount, ok: false };
  }
  return { unspentPoints: unspentPoints - price, boughtCount: boughtCount + 1, ok: true };
}
