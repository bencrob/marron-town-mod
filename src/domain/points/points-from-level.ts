/**
 * DOMAINE PUR — conversion XP vanilla → points de compétence.
 *
 * Règle : 1 point tous les 4 niveaux Minecraft. Anti-suicide-farm : on ne récompense
 * QUE les paliers de 4 nouvellement franchis, en suivant le niveau max jamais atteint.
 * Redescendre puis remonter ne redonne rien.
 */
export const LEVELS_PER_POINT = 4;

export interface PointsAward {
  /** Nombre de points à accorder maintenant (≥ 0). */
  readonly pointsAwarded: number;
  /** Nouveau niveau max à persister. */
  readonly newMax: number;
}

export function pointsForCrossing(prevMax: number, currentLevel: number): PointsAward {
  const newMax = Math.max(prevMax, currentLevel);
  const pointsAwarded =
    Math.floor(newMax / LEVELS_PER_POINT) - Math.floor(prevMax / LEVELS_PER_POINT);
  return { pointsAwarded, newMax };
}
