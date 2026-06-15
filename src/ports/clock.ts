/**
 * PORT — abstraction du temps. DIP : l'application ne dépend pas de `system.currentTick`
 * ni de `Date.now()`, ce qui rend les cas d'usage testables avec une horloge factice.
 */
export interface Clock {
  /** Tick courant du monde (20 ticks = 1 seconde). */
  currentTick(): number;
  /** Temps réel epoch en millisecondes (rotation boutique). */
  nowMs(): number;
}
