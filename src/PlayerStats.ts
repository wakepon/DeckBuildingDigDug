import {
  PLAYER_SPEED,
  PLAYER_MAX_HP,
  FIRE_RATE,
  BULLET_SIZE,
  OXYGEN_DRAIN_RATE,
  GEM_ATTRACT_RANGE,
  EXP_PER_LEVEL_BASE,
  UPGRADE_ATTACK_POWER,
  UPGRADE_ATTACK_SPEED,
  UPGRADE_BULLET_SIZE,
  UPGRADE_MOVE_SPEED,
  UPGRADE_MAX_HP,
  UPGRADE_OXYGEN_REDUCTION,
  UPGRADE_PENETRATION,
  UPGRADE_GEM_ATTRACT,
} from './constants';

export type UpgradeType =
  | 'attackPower'
  | 'attackSpeed'
  | 'bulletSize'
  | 'moveSpeed'
  | 'maxHp'
  | 'oxygenReduction'
  | 'penetration'
  | 'gemAttract';

export interface UpgradeInfo {
  type: UpgradeType;
  name: string;
  description: string;
  icon: string;
  color: number;
}

export const UPGRADE_DATA: Record<UpgradeType, UpgradeInfo> = {
  attackPower: {
    type: 'attackPower',
    name: '攻撃力UP',
    description: 'ダメージ+20%',
    icon: '⚔',
    color: 0xff4444,
  },
  attackSpeed: {
    type: 'attackSpeed',
    name: '攻撃速度UP',
    description: '連射速度+15%',
    icon: '⚡',
    color: 0xffff00,
  },
  bulletSize: {
    type: 'bulletSize',
    name: '弾サイズUP',
    description: '弾の大きさ+25%',
    icon: '●',
    color: 0x44ff44,
  },
  moveSpeed: {
    type: 'moveSpeed',
    name: '移動速度UP',
    description: '移動速度+10%',
    icon: '→',
    color: 0x44ffff,
  },
  maxHp: {
    type: 'maxHp',
    name: '最大HP UP',
    description: 'HP上限+20',
    icon: '♥',
    color: 0xff88aa,
  },
  oxygenReduction: {
    type: 'oxygenReduction',
    name: '酸素消費減少',
    description: '酸素消費-10%',
    icon: '○',
    color: 0x88ccff,
  },
  penetration: {
    type: 'penetration',
    name: '弾の貫通',
    description: '壁を2枚貫通',
    icon: '»',
    color: 0xffaa00,
  },
  gemAttract: {
    type: 'gemAttract',
    name: 'ジェム吸引UP',
    description: '吸引範囲+50%',
    icon: '◆',
    color: 0x00ffff,
  },
};

export class PlayerStats {
  // Base stats
  private _level: number = 1;
  private _exp: number = 0;

  // Upgrade multipliers/counts
  private attackPowerMultiplier: number = 1;
  private attackSpeedMultiplier: number = 1;
  private bulletSizeMultiplier: number = 1;
  private moveSpeedMultiplier: number = 1;
  private maxHpBonus: number = 0;
  private oxygenReductionMultiplier: number = 1;
  private _penetrationCount: number = 0;
  private gemAttractMultiplier: number = 1;

  // Track acquired upgrades
  private _acquiredUpgrades: UpgradeType[] = [];

  constructor() {}

  // Computed stats
  get attackPower(): number {
    return this.attackPowerMultiplier;
  }

  get fireRate(): number {
    return FIRE_RATE / this.attackSpeedMultiplier;
  }

  get bulletSize(): number {
    return BULLET_SIZE * this.bulletSizeMultiplier;
  }

  get moveSpeed(): number {
    return PLAYER_SPEED * this.moveSpeedMultiplier;
  }

  get maxHp(): number {
    return PLAYER_MAX_HP + this.maxHpBonus;
  }

  get oxygenDrainRate(): number {
    return OXYGEN_DRAIN_RATE * this.oxygenReductionMultiplier;
  }

  get penetrationCount(): number {
    return this._penetrationCount;
  }

  get gemAttractRange(): number {
    return GEM_ATTRACT_RANGE * this.gemAttractMultiplier;
  }

  get level(): number {
    return this._level;
  }

  get exp(): number {
    return this._exp;
  }

  get acquiredUpgrades(): UpgradeType[] {
    return [...this._acquiredUpgrades];
  }

  // Get required EXP for next level
  getRequiredExp(): number {
    return EXP_PER_LEVEL_BASE * this._level;
  }

  // Add EXP and return true if leveled up
  addExp(amount: number): boolean {
    this._exp += amount;
    const required = this.getRequiredExp();
    if (this._exp >= required) {
      this._exp -= required;
      this._level++;
      return true;
    }
    return false;
  }

  // Apply an upgrade
  applyUpgrade(type: UpgradeType): void {
    this._acquiredUpgrades.push(type);

    switch (type) {
      case 'attackPower':
        this.attackPowerMultiplier += UPGRADE_ATTACK_POWER;
        break;
      case 'attackSpeed':
        this.attackSpeedMultiplier += UPGRADE_ATTACK_SPEED;
        break;
      case 'bulletSize':
        this.bulletSizeMultiplier += UPGRADE_BULLET_SIZE;
        break;
      case 'moveSpeed':
        this.moveSpeedMultiplier += UPGRADE_MOVE_SPEED;
        break;
      case 'maxHp':
        this.maxHpBonus += UPGRADE_MAX_HP;
        break;
      case 'oxygenReduction':
        this.oxygenReductionMultiplier = Math.max(0.1, this.oxygenReductionMultiplier - UPGRADE_OXYGEN_REDUCTION);
        break;
      case 'penetration':
        this._penetrationCount += UPGRADE_PENETRATION;
        break;
      case 'gemAttract':
        this.gemAttractMultiplier += UPGRADE_GEM_ATTRACT;
        break;
    }
  }

  // Get count of specific upgrade
  getUpgradeCount(type: UpgradeType): number {
    return this._acquiredUpgrades.filter(u => u === type).length;
  }

  // Get all available upgrade types
  static getAllUpgradeTypes(): UpgradeType[] {
    return Object.keys(UPGRADE_DATA) as UpgradeType[];
  }

  // Get random upgrades for selection
  getRandomUpgrades(count: number): UpgradeType[] {
    const allTypes = PlayerStats.getAllUpgradeTypes();
    const shuffled = [...allTypes].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  // Reset stats (for new game)
  reset(): void {
    this._level = 1;
    this._exp = 0;
    this.attackPowerMultiplier = 1;
    this.attackSpeedMultiplier = 1;
    this.bulletSizeMultiplier = 1;
    this.moveSpeedMultiplier = 1;
    this.maxHpBonus = 0;
    this.oxygenReductionMultiplier = 1;
    this._penetrationCount = 0;
    this.gemAttractMultiplier = 1;
    this._acquiredUpgrades = [];
  }
}
