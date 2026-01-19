import { Graphics } from 'pixi.js';
import { BULLET_SIZE, BULLET_COLOR, BULLET_SPEED } from './constants';

export class Bullet {
  public graphics: Graphics;
  public x: number;
  public y: number;
  public vx: number;
  public vy: number;
  public active: boolean = true;
  public penetrationRemaining: number;
  private size: number;

  constructor(
    x: number,
    y: number,
    dirX: number,
    dirY: number,
    size: number = BULLET_SIZE,
    penetration: number = 0
  ) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.penetrationRemaining = penetration;

    // Normalize direction and apply speed
    const length = Math.sqrt(dirX * dirX + dirY * dirY);
    this.vx = (dirX / length) * BULLET_SPEED;
    this.vy = (dirY / length) * BULLET_SPEED;

    this.graphics = new Graphics();
    this.draw();
    this.updatePosition();
  }

  private draw(): void {
    this.graphics.clear();

    // Main bullet
    this.graphics.circle(0, 0, this.size / 2);
    this.graphics.fill(BULLET_COLOR);

    // Glow effect
    this.graphics.circle(0, 0, this.size / 2 + 2);
    this.graphics.fill({ color: 0xffff88, alpha: 0.4 });

    // Core
    this.graphics.circle(0, 0, this.size / 4);
    this.graphics.fill(0xffffff);

    // Penetration indicator (orange ring if penetrating)
    if (this.penetrationRemaining > 0) {
      this.graphics.circle(0, 0, this.size / 2 + 4);
      this.graphics.stroke({ width: 2, color: 0xffaa00, alpha: 0.6 });
    }
  }

  private updatePosition(): void {
    this.graphics.x = this.x;
    this.graphics.y = this.y;
  }

  update(deltaTime: number): void {
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
    this.updatePosition();
  }

  destroy(): void {
    this.active = false;
    this.graphics.destroy();
  }
}
