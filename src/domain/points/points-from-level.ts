/**
 * DOMAINE PUR — conversion XP vanilla → points de compétence (V2).
 *
 * Règles :
 *  - 1 point tous les **5 niveaux** Minecraft (au lieu de 4).
 *  - Conversion **plafonnée à 90 points** (anti-farm XP) : au-delà, l'XP ne donne plus rien
 *    (le joueur passe par l'échange de ressources). Avec les 10 points de départ, cela suffit
 *    pour remplir exactement **une** compétence (100 pts).
 *  - Anti-suicide-farm : on ne compte que la progression du niveau **max jamais atteint**.
 */
export const LEVELS_PER_POINT = 5;

/** Points de compétence offerts au tout premier accès. */
export const START_POINTS = 10;

/** Plafond de points convertibles depuis l'XP vanilla (hors points de départ). */
export const XP_POINT_CAP = 90;

export interface PointsAward {
  /** Nombre de points à accorder maintenant (≥ 0). */
  readonly pointsAwarded: number;
  /** Nouveau niveau max à persister. */
  readonly newMax: number;
}

/** Points cumulés gagnés via l'XP pour un niveau max donné (plafonné). */
function xpPoints(maxLevel: number): number {
  return Math.min(Math.floor(maxLevel / LEVELS_PER_POINT), XP_POINT_CAP);
}

export function pointsForCrossing(prevMax: number, currentLevel: number): PointsAward {
  const newMax = Math.max(prevMax, currentLevel);
  const pointsAwarded = xpPoints(newMax) - xpPoints(prevMax);
  return { pointsAwarded, newMax };
}
