import { Graphics } from 'pixi.js';
import { BULLET_SIZE, BULLET_COLOR, BULLET_SPEED } from './constants';
import { calculateReflectionVector, type Vector2D } from './bounceUtils';

export class Bullet {
  public graphics: Graphics;
  public x: number;
  public y: number;
  public vx: number;
  public vy: number;
  public active: boolean = true;
  public penetrationRemaining: number;
  private _bounceRemaining: number;
  private size: number;

  constructor(
    x: number,
    y: number,
    dirX: number,
    dirY: number,
    size: number = BULLET_SIZE,
    penetration: number = 0,
    bounce: number = 0
  ) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.penetrationRemaining = penetration;
    this._bounceRemaining = bounce;

    // Normalize direction and apply speed
    const length = Math.sqrt(dirX * dirX + dirY * dirY);
    this.vx = (dirX / length) * BULLET_SPEED;
    this.vy = (dirY / length) * BULLET_SPEED;

    this.graphics = new Graphics();
    this.draw();
    this.updatePosition();
  }

  get bounceRemaining(): number {
    return this._bounceRemaining;
  }

  set bounceRemaining(value: number) {
    this._bounceRemaining = value;
    this.draw();
  }

  get hasBounce(): boolean {
    return this._bounceRemaining > 0;
  }

  private draw(): void {
    this.graphics.clear();

    // Glow effect (drawn first, behind main bullet)
    this.graphics.circle(0, 0, this.size / 2 + 2);
    this.graphics.fill({ color: 0xffff88, alpha: 0.4 });

    // Main bullet
    this.graphics.circle(0, 0, this.size / 2);
    this.graphics.fill(BULLET_COLOR);

    // Core
    this.graphics.circle(0, 0, this.size / 4);
    this.graphics.fill(0xffffff);

    // Penetration indicator (orange ring if penetrating)
    if (this.penetrationRemaining > 0) {
      this.graphics.circle(0, 0, this.size / 2 + 4);
      this.graphics.stroke({ width: 2, color: 0xffaa00, alpha: 0.6 });
    }

    // Bounce indicator (green ring if bouncing)
    if (this._bounceRemaining > 0) {
      this.graphics.circle(0, 0, this.size / 2 + 6);
      this.graphics.stroke({ width: 2, color: 0x44ff88, alpha: 0.6 });
    }
  }

  private updatePosition(): void {
    this.graphics.x = this.x;
    this.graphics.y = this.y;
  }

  /**
   * Set the bullet's position.
   * @param x - New X position
   * @param y - New Y position
   */
  setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.updatePosition();
  }

  /**
   * Apply bounce reflection to the bullet.
   * Reverses velocity based on the wall normal and decrements bounce count.
   * @param normal - The wall normal vector (unit vector pointing away from wall)
   */
  applyBounce(normal: Vector2D): void {
    const velocity: Vector2D = { x: this.vx, y: this.vy };
    const reflected = calculateReflectionVector(velocity, normal);

    this.vx = reflected.x;
    this.vy = reflected.y;
    this._bounceRemaining--;
    this.draw();
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
