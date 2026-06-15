import { type WorldStore } from '../ports/world-store';
import { readScore, writeScore } from './scoreboard-util';

const WORLD = 'world';

/**
 * ADAPTATEUR — scalaires monde via scoreboards à participant fixe "world".
 * `key` est le nom de l'objectif (ex. marrontown_shop_seed, marrontown_shop_ts).
 */
export class ScoreboardWorldStore implements WorldStore {
  getNumber(key: string): number | undefined {
    return readScore(key, WORLD);
  }
  setNumber(key: string, value: number): void {
    writeScore(key, WORLD, value);
  }
}
