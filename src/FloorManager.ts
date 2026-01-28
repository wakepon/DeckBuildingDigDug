import {
  ENEMY_HP,
  ENEMY_SPAWN_CHANCE,
  GEM_EXP_VALUE,
  FLOOR_ENEMY_HP_SCALE,
  FLOOR_ENEMY_SPAWN_SCALE,
  FLOOR_GEM_EXP_SCALE,
  WALL_HP_SCALING,
} from './constants';

interface HPDistributionEntry {
  hp: number;
  weight: number;
}

export class FloorManager {
  private _currentFloor: number = 1;
  private cachedDistribution: HPDistributionEntry[] | null = null;
  private cachedDistributionFloor: number = -1;

  constructor() {}

  get currentFloor(): number {
    return this._currentFloor;
  }

  nextFloor(): void {
    this._currentFloor++;
    this.clearDistributionCache();
  }

  reset(): void {
    this._currentFloor = 1;
    this.clearDistributionCache();
  }

  private clearDistributionCache(): void {
    this.cachedDistribution = null;
    this.cachedDistributionFloor = -1;
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

  // Get wall HP distribution based on current floor
  getWallHPDistribution(): HPDistributionEntry[] {
    // Return cached distribution if available for current floor
    if (this.cachedDistribution && this.cachedDistributionFloor === this._currentFloor) {
      return this.cachedDistribution;
    }

    const distribution: HPDistributionEntry[] = [];
    const floor = this._currentFloor;

    // Calculate max available HP for this floor
    // Floor 1-4: HP 1-3
    // Floor 5: HP 1-4
    // Floor 6: HP 1-5 (approximately +1.2 HP per floor to reach HP 10 at floor 10)
    // ...
    // Floor 10+: HP 1-10
    let maxHP = WALL_HP_SCALING.BASE_MAX_HP; // Base max HP on floor 1-4
    if (floor >= WALL_HP_SCALING.HP4_FLOOR_THRESHOLD) {
      const floorsAfterThreshold = floor - WALL_HP_SCALING.HP4_FLOOR_THRESHOLD;
      const additionalHP = Math.floor(
        floorsAfterThreshold * WALL_HP_SCALING.HP_SCALING_NUMERATOR / WALL_HP_SCALING.HP_SCALING_DENOMINATOR
      );
      maxHP = Math.min(
        WALL_HP_SCALING.HP4_VALUE + additionalHP,
        WALL_HP_SCALING.MAX_HP
      );
    }

    // Calculate weights for each HP level
    // HP 1 starts at 50% and decreases as floors progress
    const hp1WeightReduction = Math.min(
      (floor - 1) * WALL_HP_SCALING.HP1_WEIGHT_REDUCTION_PER_FLOOR,
      WALL_HP_SCALING.HP1_MAX_WEIGHT_REDUCTION
    );
    const hp1Weight = WALL_HP_SCALING.HP1_BASE_WEIGHT - hp1WeightReduction;

    // Distribute remaining weight among other HP levels
    const remainingWeight = 100 - hp1Weight;
    const otherHPCount = maxHP - 1;

    distribution.push({ hp: 1, weight: hp1Weight });

    for (let hp = 2; hp <= maxHP; hp++) {
      // Higher HP walls get slightly more weight on higher floors
      const baseWeight = remainingWeight / otherHPCount;
      const floorBonus = hp > WALL_HP_SCALING.HIGH_HP_THRESHOLD
        ? (floor - WALL_HP_SCALING.HP4_FLOOR_THRESHOLD) * WALL_HP_SCALING.HIGH_HP_FLOOR_BONUS
        : 0;
      distribution.push({ hp, weight: Math.max(WALL_HP_SCALING.MIN_WEIGHT, baseWeight + floorBonus) });
    }

    // Cache the distribution for this floor
    this.cachedDistribution = distribution;
    this.cachedDistributionFloor = floor;

    return distribution;
  }

  // Generate a random wall HP based on current floor distribution
  generateWallHP(): number {
    const distribution = this.getWallHPDistribution();
    const totalWeight = distribution.reduce((sum, entry) => sum + entry.weight, 0);
    let random = Math.random() * totalWeight;

    for (const entry of distribution) {
      random -= entry.weight;
      if (random <= 0) {
        return entry.hp;
      }
    }

    // Fallback to HP 1
    return 1;
  }
}
