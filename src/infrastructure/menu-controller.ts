import { type Player } from '@minecraft/server';
import { ActionFormData } from '@minecraft/server-ui';
import { type SkillRepository } from '../ports/skill-repository';
import { type Clock } from '../ports/clock';
import { SKILL_TREES, SKILL_META, MAX_SKILL_LEVEL, type SkillTree } from '../domain/skills/skill-types';
import { averageLevel, spentPoints, type PlayerSkillState } from '../domain/skills/skill-state';
import { levelUpSkill } from '../domain/points/spend-points';
import { PERK_TABLES } from '../domain/perks/perk-tables';
import { renderBar, percent, formatHHMM, tierMark, SEPARATOR } from '../domain/ui/progress-bar';
import { msUntilNextRotation } from '../domain/shop/shop-rotation';

const SOUND = {
  open: 'random.click',
  upgrade: 'random.levelup',
  milestone: 'random.totem',
  error: 'note.bass',
} as const;

const BUY_QUANTITIES = [1, 5, 10] as const;

/**
 * Flux des menus (server-ui). Présentation + navigation ; les règles (dépense de points)
 * proviennent du domaine pur testé. Toutes les méthodes sont async et awaited pour que les
 * erreurs remontent au try/catch de l'appelant.
 */
export class MenuController {
  constructor(
    private readonly repo: SkillRepository,
    private readonly clock: Clock,
    private readonly openShopFn: (player: Player) => Promise<void>,
  ) {}

  async openMain(player: Player): Promise<void> {
    player.playSound(SOUND.open);
    const state = this.repo.load(player.id);
    const rotation = formatHHMM(msUntilNextRotation(this.clock.nowMs()));

    const form = new ActionFormData()
      .title('§l§6Grimoire des Compétences')
      .body(
        `${SEPARATOR}\n§e✦ ${state.unspentPoints} points disponibles\n§7Niveau moyen : §f${averageLevel(state)}§7/100`,
      )
      .button('§l⚔️ Compétences')
      .button(`§l🏪 Boutique §r§7(${rotation})`)
      .button('§l📊 Ma Fiche');

    const res = await form.show(player);
    if (res.canceled || res.selection === undefined) return;
    if (res.selection === 0) await this.openSkills(player);
    else if (res.selection === 1) await this.openShopFn(player);
    else if (res.selection === 2) await this.openSheet(player);
  }

  async openSkills(player: Player): Promise<void> {
    const state = this.repo.load(player.id);
    const form = new ActionFormData()
      .title('§l§6Compétences — Choisir un arbre')
      .body(`${SEPARATOR}\n§e✦ ${state.unspentPoints} pts disponibles`);

    for (const tree of SKILL_TREES) {
      const meta = SKILL_META[tree];
      form.button(`${meta.icon} ${meta.label}  §7Niv. §a${state.levels[tree]}§7/100`);
    }
    form.button('§7← Retour');

    const res = await form.show(player);
    if (res.canceled || res.selection === undefined) return;
    if (res.selection < SKILL_TREES.length) {
      await this.openTree(player, SKILL_TREES[res.selection]!);
    } else {
      await this.openMain(player);
    }
  }

  async openTree(player: Player, tree: SkillTree): Promise<void> {
    const state = this.repo.load(player.id);
    const level = state.levels[tree];
    const meta = SKILL_META[tree];

    const tiers = PERK_TABLES[tree]
      .map((t) => `${tierMark(level >= t.level)} Niv.${t.level} — ${t.name}`)
      .join('\n');

    const body = [
      SEPARATOR,
      `Progression : ${renderBar(level)} §7(${percent(level)}%)`,
      `§e✦ ${state.unspentPoints} pts disponibles`,
      '',
      '§7Paliers :',
      tiers,
    ].join('\n');

    const form = new ActionFormData().title(`§l§6${meta.label} — Niv. ${level}/100`).body(body);

    // Boutons d'achat : libellé adapté si max atteint ou points insuffisants.
    for (const qty of BUY_QUANTITIES) {
      if (level >= MAX_SKILL_LEVEL) form.button('§7[Max atteint]');
      else if (state.unspentPoints < qty) form.button(`§c[Points insuffisants] §7+${qty}`);
      else form.button(`§a+${qty} Niveau${qty > 1 ? 'x' : ''} §7(coût : ${qty} pt${qty > 1 ? 's' : ''})`);
    }
    form.button('§7← Retour');

    const res = await form.show(player);
    if (res.canceled || res.selection === undefined) return;

    if (res.selection < BUY_QUANTITIES.length) {
      this.tryUpgrade(player, tree, BUY_QUANTITIES[res.selection]!);
      await this.openTree(player, tree); // ré-affiche l'arbre mis à jour
    } else {
      await this.openSkills(player);
    }
  }

  async openSheet(player: Player): Promise<void> {
    const state = this.repo.load(player.id);
    const lines = SKILL_TREES.map((tree) => {
      const meta = SKILL_META[tree];
      return `${meta.icon} ${meta.label} ${renderBar(state.levels[tree], MAX_SKILL_LEVEL, 10)} §7Niv.${state.levels[tree]}/100`;
    }).join('\n');

    const body = [
      SEPARATOR,
      `§7XP Minecraft : §aniv. ${player.level}`,
      `§7Points totaux gagnés : §e${state.totalPointsEarned}`,
      `§7Points dépensés : §e${spentPoints(state)}`,
      `§7Points disponibles : §e${state.unspentPoints}`,
      '',
      lines,
      '',
      '§7Prochaine mort : perte des points non-dépensés.',
    ].join('\n');

    const res = await new ActionFormData()
      .title(`§l§6Fiche de ${player.name}`)
      .body(body)
      .button('§7← Retour')
      .show(player);
    if (!res.canceled) await this.openMain(player);
  }

  /** Applique un achat de niveaux via le domaine pur + feedback sonore. */
  private tryUpgrade(player: Player, tree: SkillTree, qty: number): void {
    const before = this.repo.load(player.id);
    const result = levelUpSkill(before, tree, qty);
    if (!result.ok) {
      player.playSound(SOUND.error);
      return;
    }
    this.repo.save(player.id, result.state);
    const crossedMilestone = this.crossedMilestone(before, result.state, tree);
    player.playSound(crossedMilestone ? SOUND.milestone : SOUND.upgrade);
  }

  private crossedMilestone(
    before: PlayerSkillState,
    after: PlayerSkillState,
    tree: SkillTree,
  ): boolean {
    return PERK_TABLES[tree].some(
      (t) => before.levels[tree] < t.level && after.levels[tree] >= t.level,
    );
  }
}
