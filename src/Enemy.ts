import { ENEMY_SIZE, ENEMY_SPEED, ENEMY_HP, ENEMY_COLOR } from './constants';
import { BaseEnemy } from './BaseEnemy';

export class Enemy extends BaseEnemy {
  public spawnerId: number = -1; // -1 means not spawned from a spawner

  constructor(x: number, y: number, spawnerId: number = -1, hp: number = ENEMY_HP) {
    super(x, y, hp);
    this.spawnerId = spawnerId;
  }

  protected getSpeed(): number {
    return ENEMY_SPEED;
  }

  protected draw(): void {
    this.graphics.clear();

    const color = this.hitFlashTime > 0 ? 0xffffff : ENEMY_COLOR;

    // Enemy body (slightly menacing shape)
    this.graphics.circle(0, 0, ENEMY_SIZE / 2);
    this.graphics.fill(color);

    // Eyes
    this.graphics.circle(-5, -3, 3);
    this.graphics.circle(5, -3, 3);
    this.graphics.fill(0x000000);

    // Pupils (looking at target direction)
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 0) {
      const px = (dx / dist) * 1.5;
      const py = (dy / dist) * 1.5;
      this.graphics.circle(-5 + px, -3 + py, 1.5);
      this.graphics.circle(5 + px, -3 + py, 1.5);
      this.graphics.fill(0xffffff);
    }

    // Angry mouth
    this.graphics.moveTo(-4, 5);
    this.graphics.lineTo(0, 3);
    this.graphics.lineTo(4, 5);
    this.graphics.stroke({ width: 2, color: 0x000000 });

    // Pulsing outline
    this.graphics.circle(0, 0, ENEMY_SIZE / 2 + 2);
    this.graphics.stroke({ width: 2, color: 0xff0000, alpha: 0.5 });
  }

  get radius(): number {
    return ENEMY_SIZE / 2;
  }
}
