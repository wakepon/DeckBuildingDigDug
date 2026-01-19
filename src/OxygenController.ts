import { PlayerStats } from './PlayerStats';
import {
  OXYGEN_MAX,
  OXYGEN_WARNING_THRESHOLD,
  OXYGEN_DAMAGE_RATE,
  PLAYER_MAX_HP,
} from './constants';

export class OxygenController {
  private _oxygen: number;
  private _maxOxygen: number;
  private playerStats: PlayerStats;
  private onDamage: ((damage: number) => void) | null = null;
  private onWarning: ((isWarning: boolean) => void) | null = null;
  private onDepleted: ((isDepleted: boolean) => void) | null = null;

  constructor(playerStats: PlayerStats) {
    this.playerStats = playerStats;
    this._maxOxygen = OXYGEN_MAX;
    this._oxygen = this._maxOxygen;
  }

  setOnDamage(callback: (damage: number) => void): void {
    this.onDamage = callback;
  }

  setOnWarning(callback: (isWarning: boolean) => void): void {
    this.onWarning = callback;
  }

  setOnDepleted(callback: (isDepleted: boolean) => void): void {
    this.onDepleted = callback;
  }

  update(deltaTime: number): void {
    // Drain oxygen (using player stats for drain rate)
    this._oxygen -= this.playerStats.oxygenDrainRate * deltaTime;

    if (this._oxygen < 0) {
      this._oxygen = 0;
    }

    // Check warning threshold
    const ratio = this._oxygen / this._maxOxygen;
    if (this.onWarning) {
      this.onWarning(ratio <= OXYGEN_WARNING_THRESHOLD && ratio > 0);
    }

    // Check depleted state
    const isDepleted = this._oxygen <= 0;
    if (this.onDepleted) {
      this.onDepleted(isDepleted);
    }

    // Apply damage if oxygen is depleted
    if (isDepleted && this.onDamage) {
      const damage = PLAYER_MAX_HP * OXYGEN_DAMAGE_RATE * deltaTime;
      this.onDamage(damage);
    }
  }

  addOxygen(amount: number): void {
    this._oxygen = Math.min(this._maxOxygen, this._oxygen + amount);
  }

  get oxygen(): number {
    return this._oxygen;
  }

  get maxOxygen(): number {
    return this._maxOxygen;
  }

  get ratio(): number {
    return this._oxygen / this._maxOxygen;
  }

  get isDepleted(): boolean {
    return this._oxygen <= 0;
  }

  get isWarning(): boolean {
    return this.ratio <= OXYGEN_WARNING_THRESHOLD && !this.isDepleted;
  }

  reset(): void {
    this._oxygen = this._maxOxygen;
  }
}
