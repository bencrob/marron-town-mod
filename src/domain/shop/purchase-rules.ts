/**
 * DOMAINE PUR — règles d'achat boutique. « Acheté » est suivi par un masque 5 bits
 * (slots 0–4), mappé en infrastructure sur les scoreboards marrontown_shop_b_[0-4].
 */
export function isBought(mask: number, slot: number): boolean {
  return (mask & (1 << slot)) !== 0;
}

export function canBuy(unspentPoints: number, price: number, mask: number, slot: number): boolean {
  return !isBought(mask, slot) && unspentPoints >= price;
}

export interface PurchaseResult {
  readonly unspentPoints: number;
  readonly mask: number;
  readonly ok: boolean;
}

export function applyPurchase(
  unspentPoints: number,
  price: number,
  mask: number,
  slot: number,
): PurchaseResult {
  if (!canBuy(unspentPoints, price, mask, slot)) {
    return { unspentPoints, mask, ok: false };
  }
  return { unspentPoints: unspentPoints - price, mask: mask | (1 << slot), ok: true };
}
