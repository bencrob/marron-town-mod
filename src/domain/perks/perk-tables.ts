import { type SkillTree } from '../skills/skill-types';

/**
 * DOMAINE PUR — paliers (milestones) par arbre, en DONNÉES.
 * Sert l'affichage (✔️/✖️) et la documentation ; les effets réels sont calculés
 * par effect-resolver. Les niveaux suivent le spec (équivalents reconçus si besoin).
 */
export interface PerkTier {
  readonly level: number;
  readonly name: string;
}

export const PERK_TABLES: Readonly<Record<SkillTree, readonly PerkTier[]>> = {
  agility: [
    { level: 10, name: 'Foulée Légère' },
    { level: 20, name: 'Saut Amélioré' },
    { level: 30, name: 'Double Saut' },
    { level: 40, name: 'Vitesse Accrue II' },
    { level: 50, name: 'Chute Amortie' },
    { level: 60, name: 'Évasion' },
    { level: 75, name: 'Dash' },
    { level: 100, name: 'Fantôme Fugace' },
  ],
  attack: [
    { level: 10, name: 'Rapidité de Frappe' },
    { level: 20, name: 'Frappe Lourde' },
    { level: 30, name: 'Saignement' },
    { level: 40, name: 'Rapidité de Frappe II' },
    { level: 50, name: 'Critique' },
    { level: 60, name: 'Aura Berserker' },
    { level: 75, name: 'Exécution' },
    { level: 100, name: 'Coup Fatal' },
  ],
  defense: [
    { level: 10, name: 'Peau Dure' },
    { level: 20, name: 'Régénération Lente' },
    { level: 30, name: 'Chute Amortie' },
    { level: 40, name: 'Absorption' },
    { level: 50, name: 'Régénération II' },
    { level: 60, name: 'Résistance au Feu' },
    { level: 75, name: 'Bastion' },
    { level: 100, name: 'Immunité Momentanée' },
  ],
  mining: [
    { level: 10, name: 'Hâte' },
    { level: 20, name: 'Vein Miner' },
    { level: 30, name: 'Toucher de Soie' },
    { level: 35, name: 'Fortune' },
    { level: 50, name: 'Hâte II' },
    { level: 60, name: 'Minage Explosif' },
    { level: 75, name: 'Fortune II' },
    { level: 100, name: 'Excavateur' },
  ],
};
