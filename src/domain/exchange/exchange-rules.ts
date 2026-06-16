import { DAILY_BONUS_POOL, type ExchangeOffer } from './exchange-catalog';

/** DOMAINE PUR — timing & sélection de l'offre bonus quotidienne (déterministe). */
export const DAY_MS = 24 * 60 * 60 * 1000;

export function dayIndex(nowMs: number, dayMs: number = DAY_MS): number {
  return Math.floor(nowMs / dayMs);
}

/** Millisecondes avant le prochain renouvellement quotidien (affichage). */
export function msUntilNextDay(nowMs: number, dayMs: number = DAY_MS): number {
  const rem = dayMs - (nowMs % dayMs);
  return rem === dayMs ? 0 : rem;
}

/** Offre bonus du jour, déterministe à partir de l'index de jour. */
export function pickDailyBonus(
  day: number,
  pool: readonly ExchangeOffer[] = DAILY_BONUS_POOL,
): ExchangeOffer {
  const idx = ((day % pool.length) + pool.length) % pool.length;
  return pool[idx]!;
}
