import { MAX_SKILL_LEVEL } from '../skills/skill-types';

/**
 * DOMAINE PUR — rendu des chaînes d'UI (codes couleur § du spec). Testable à l'identité.
 */
export const SEPARATOR = '§8§m────────────────────§r';

/** Barre de progression : vert = acquis, gris = restant. */
export function renderBar(level: number, max: number = MAX_SKILL_LEVEL, width = 20): string {
  const ratio = max <= 0 ? 0 : Math.min(1, Math.max(0, level / max));
  const filled = Math.round(ratio * width);
  return `§a${'▮'.repeat(filled)}§7${'▯'.repeat(width - filled)}§r`;
}

/** Pourcentage entier d'un niveau sur le max. */
export function percent(level: number, max: number = MAX_SKILL_LEVEL): number {
  return max <= 0 ? 0 : Math.round((level / max) * 100);
}

/** Formate une durée en `HH:MM` (pour la rotation boutique). */
export function formatHHMM(ms: number): string {
  const totalMin = Math.floor(Math.max(0, ms) / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Coche/croix d'un palier selon qu'il est atteint. */
export function tierMark(reached: boolean): string {
  return reached ? '§a✔️§r' : '§7✖️';
}
