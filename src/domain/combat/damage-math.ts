/**
 * DOMAINE PUR — arithmétique de combat. Pas d'aléatoire ici (les tirages sont injectés
 * sous forme de probabilité résolue par l'appelant), pour rester déterministe et testable.
 */
const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));

/** Dégâts bonus à appliquer en plus (attaque) à partir d'un montant de base et d'un %. */
export function bonusFromPct(baseDamage: number, pct: number): number {
  return baseDamage * Math.max(0, pct);
}

/** Multiplicateur critique appliqué au total (renvoie le SURPLUS à ajouter). */
export function critSurplus(totalDamage: number, multiplier: number): number {
  return totalDamage * (multiplier - 1);
}

/** PV à rendre pour simuler une réduction de dégâts (heal-back hybride). */
export function healBackAmount(incomingDamage: number, reductionPct: number): number {
  return incomingDamage * clamp01(reductionPct);
}

/** Amplificateur d'effet `resistance` (≈20 %/niveau) approchant un % de réduction cible. */
export function resistanceAmplifierForPct(pct: number): number {
  return Math.min(4, Math.max(0, Math.round(clamp01(pct) / 0.2)));
}

/** Une cible est-elle « exécutable » (sous le seuil de PV) ? */
export function isExecutable(targetHp: number, targetMaxHp: number, threshold: number): boolean {
  if (threshold <= 0 || targetMaxHp <= 0) return false;
  return targetHp / targetMaxHp <= threshold;
}
