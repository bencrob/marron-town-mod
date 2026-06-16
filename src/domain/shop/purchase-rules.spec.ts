import { describe, test, expect } from 'vitest';
import { canBuy, applyPurchase, maxBuysFor } from './purchase-rules';

describe('purchase-rules (V2 : compteur par jour)', () => {
  test('limites par rareté', () => {
    expect(maxBuysFor('common')).toBe(3);
    expect(maxBuysFor('rare')).toBe(1);
  });

  test('achat possible sous la limite et avec assez de points', () => {
    expect(canBuy(10, 7, 0, 3)).toBe(true);
    expect(canBuy(10, 7, 3, 3)).toBe(false); // limite atteinte
    expect(canBuy(5, 7, 0, 3)).toBe(false); // pas assez
  });

  test('applyPurchase débite et incrémente le compteur', () => {
    const r = applyPurchase(10, 7, 1, 3);
    expect(r.ok).toBe(true);
    expect(r.unspentPoints).toBe(3);
    expect(r.boughtCount).toBe(2);
  });

  test('applyPurchase no-op à la limite', () => {
    const r = applyPurchase(100, 1, 1, 1);
    expect(r.ok).toBe(false);
    expect(r.boughtCount).toBe(1);
  });
});
