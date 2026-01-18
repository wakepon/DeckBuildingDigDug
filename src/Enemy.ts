import { Graphics } from 'pixi.js';
import { ENEMY_SIZE, ENEMY_SPEED, ENEMY_HP, ENEMY_COLOR } from './constants';

export class Enemy {
  public graphics: Graphics;
  public x: number;
  public y: number;
  public hp: number;
  public active: boolean = true;

  private targetX: number = 0;
  private targetY: number = 0;
  private hitFlashTime: number = 0;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.hp = ENEMY_HP;

    this.graphics = new Graphics();
    this.draw();
    this.updatePosition();
  }

  private draw(): void {
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

  private updatePosition(): void {
    this.graphics.x = this.x;
    this.graphics.y = this.y;
  }

  update(deltaTime: number, playerX: number, playerY: number): void {
    this.targetX = playerX;
    this.targetY = playerY;

    // Move towards player
    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 1) {
      this.x += (dx / dist) * ENEMY_SPEED * deltaTime;
      this.y += (dy / dist) * ENEMY_SPEED * deltaTime;
    }

    // Update hit flash
    if (this.hitFlashTime > 0) {
      this.hitFlashTime -= deltaTime;
    }

    this.draw();
    this.updatePosition();
  }

  takeDamage(amount: number): boolean {
    this.hp -= amount;
    this.hitFlashTime = 0.1;

    if (this.hp <= 0) {
      this.active = false;
      return true; // Enemy died
    }
    return false;
  }

  destroy(): void {
    this.graphics.destroy();
  }

  get radius(): number {
    return ENEMY_SIZE / 2;
  }
}
