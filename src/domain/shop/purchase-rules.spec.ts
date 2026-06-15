import { describe, test, expect } from 'vitest';
import { isBought, canBuy, applyPurchase } from './purchase-rules';

describe('purchase-rules', () => {
  test('achat possible si points suffisants et non déjà acheté', () => {
    expect(canBuy(10, 7, 0, 2)).toBe(true);
  });

  test('refus si points insuffisants', () => {
    expect(canBuy(5, 7, 0, 2)).toBe(false);
  });

  test('refus si déjà acheté ce slot', () => {
    const mask = 1 << 2;
    expect(canBuy(100, 1, mask, 2)).toBe(false);
  });

  test('applyPurchase débite et marque le slot', () => {
    const r = applyPurchase(10, 7, 0, 2);
    expect(r.ok).toBe(true);
    expect(r.unspentPoints).toBe(3);
    expect(isBought(r.mask, 2)).toBe(true);
    expect(isBought(r.mask, 0)).toBe(false);
  });

  test('applyPurchase no-op si invalide', () => {
    const r = applyPurchase(2, 7, 0, 1);
    expect(r.ok).toBe(false);
    expect(r.unspentPoints).toBe(2);
    expect(r.mask).toBe(0);
  });

  test('chaque slot est indépendant', () => {
    let mask = 0;
    mask = applyPurchase(100, 1, mask, 0).mask;
    mask = applyPurchase(100, 1, mask, 4).mask;
    expect(isBought(mask, 0)).toBe(true);
    expect(isBought(mask, 4)).toBe(true);
    expect(isBought(mask, 1)).toBe(false);
  });
});
