import {
  ENEMY_HP,
  ENEMY_SPAWN_CHANCE,
  GEM_EXP_VALUE,
  FLOOR_ENEMY_HP_SCALE,
  FLOOR_ENEMY_SPAWN_SCALE,
  FLOOR_GEM_EXP_SCALE,
} from './constants';

export class FloorManager {
  private _currentFloor: number = 1;

  constructor() {}

  get currentFloor(): number {
    return this._currentFloor;
  }

  nextFloor(): void {
    this._currentFloor++;
  }

  reset(): void {
    this._currentFloor = 1;
  }

  // Scaled enemy HP for current floor
  getEnemyHP(): number {
    const scale = 1 + (this._currentFloor - 1) * FLOOR_ENEMY_HP_SCALE;
    return Math.ceil(ENEMY_HP * scale);
  }

  // Scaled enemy spawn chance for current floor
  getEnemySpawnChance(): number {
    const bonus = (this._currentFloor - 1) * FLOOR_ENEMY_SPAWN_SCALE;
    return Math.min(0.8, ENEMY_SPAWN_CHANCE + bonus); // Cap at 80%
  }

  // Scaled gem exp for current floor
  getGemExpValue(): number {
    const scale = 1 + (this._currentFloor - 1) * FLOOR_GEM_EXP_SCALE;
    return Math.floor(GEM_EXP_VALUE * scale);
  }

  // Get difficulty description
  getDifficultyInfo(): string {
    const hpMult = Math.floor((1 + (this._currentFloor - 1) * FLOOR_ENEMY_HP_SCALE) * 100);
    const spawnChance = Math.floor(this.getEnemySpawnChance() * 100);
    const expMult = Math.floor((1 + (this._currentFloor - 1) * FLOOR_GEM_EXP_SCALE) * 100);
    return `HP:${hpMult}% Spawn:${spawnChance}% EXP:${expMult}%`;
  }
}
