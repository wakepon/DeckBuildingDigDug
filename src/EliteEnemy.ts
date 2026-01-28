import {
  ENEMY_SIZE,
  ENEMY_SPEED,
  ENEMY_HP,
  ELITE_HP_MULTIPLIER,
  ELITE_SIZE_MULTIPLIER,
  ELITE_SPEED_MULTIPLIER,
  ELITE_COLOR,
} from './constants';
import { BaseEnemy } from './BaseEnemy';

export class EliteEnemy extends BaseEnemy {
  public maxHp: number;
  public isElite: boolean = true;

  private pulseTime: number = 0;
  private size: number;

  constructor(x: number, y: number, baseHp: number = ENEMY_HP) {
    const eliteHp = baseHp * ELITE_HP_MULTIPLIER;
    super(x, y, eliteHp);
    this.maxHp = eliteHp;
    this.size = ENEMY_SIZE * ELITE_SIZE_MULTIPLIER;
  }

  protected getSpeed(): number {
    return ENEMY_SPEED * ELITE_SPEED_MULTIPLIER;
  }

  update(deltaTime: number, playerX: number, playerY: number): void {
    this.pulseTime += deltaTime;
    super.update(deltaTime, playerX, playerY);
  }

  protected draw(): void {
    this.graphics.clear();

    const color = this.hitFlashTime > 0 ? 0xffffff : ELITE_COLOR;
    const pulse = (Math.sin(this.pulseTime * 4) + 1) / 2;
    const outerPulse = this.size / 2 + 5 + pulse * 3;

    // Outer aura (menacing glow)
    this.graphics.circle(0, 0, outerPulse + 5);
    this.graphics.fill({ color: ELITE_COLOR, alpha: 0.15 });

    // Pulsing outer ring
    this.graphics.circle(0, 0, outerPulse);
    this.graphics.stroke({ width: 3, color: ELITE_COLOR, alpha: 0.5 + pulse * 0.3 });

    // Main body
    this.graphics.circle(0, 0, this.size / 2);
    this.graphics.fill(color);

    // Inner highlight
    this.graphics.circle(-5, -5, this.size / 4);
    this.graphics.fill({ color: 0xffffff, alpha: 0.2 });

    // Angry eyes (larger for elite)
    this.graphics.circle(-8, -5, 5);
    this.graphics.circle(8, -5, 5);
    this.graphics.fill(0x000000);

    // Evil pupils
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 0) {
      const px = (dx / dist) * 2;
      const py = (dy / dist) * 2;
      this.graphics.circle(-8 + px, -5 + py, 2.5);
      this.graphics.circle(8 + px, -5 + py, 2.5);
      this.graphics.fill(0xff0000); // Red pupils for elite
    }

    // Angry mouth with teeth
    this.graphics.moveTo(-8, 8);
    this.graphics.lineTo(-4, 4);
    this.graphics.lineTo(0, 8);
    this.graphics.lineTo(4, 4);
    this.graphics.lineTo(8, 8);
    this.graphics.stroke({ width: 2, color: 0x000000 });

    // Crown/horns to indicate elite status
    this.graphics.moveTo(-12, -this.size / 2 + 5);
    this.graphics.lineTo(-8, -this.size / 2 - 8);
    this.graphics.lineTo(-4, -this.size / 2 + 2);
    this.graphics.moveTo(4, -this.size / 2 + 2);
    this.graphics.lineTo(8, -this.size / 2 - 8);
    this.graphics.lineTo(12, -this.size / 2 + 5);
    this.graphics.stroke({ width: 3, color: 0xffd700 }); // Gold horns

    // HP bar background
    const barWidth = this.size + 10;
    const barHeight = 6;
    const barY = this.size / 2 + 8;
    this.graphics.rect(-barWidth / 2, barY, barWidth, barHeight);
    this.graphics.fill(0x333333);

    // HP bar fill
    const hpRatio = this.hp / this.maxHp;
    this.graphics.rect(-barWidth / 2, barY, barWidth * hpRatio, barHeight);
    this.graphics.fill(hpRatio > 0.5 ? ELITE_COLOR : 0xff4444);

    // HP bar border
    this.graphics.rect(-barWidth / 2, barY, barWidth, barHeight);
    this.graphics.stroke({ width: 1, color: 0xffffff });
  }

  get radius(): number {
    return this.size / 2;
  }
}
