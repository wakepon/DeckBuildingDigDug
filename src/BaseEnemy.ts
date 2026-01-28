import { Graphics } from 'pixi.js';
import { getDistance } from './utils/math';

/**
 * BaseEnemy - Abstract base class for all enemy types
 * Consolidates common movement, damage, and lifecycle logic
 */
export abstract class BaseEnemy {
  public graphics: Graphics;
  public x: number;
  public y: number;
  public hp: number;
  public active: boolean = true;

  protected targetX: number = 0;
  protected targetY: number = 0;
  protected hitFlashTime: number = 0;

  constructor(x: number, y: number, hp: number) {
    this.x = x;
    this.y = y;
    this.hp = hp;

    this.graphics = new Graphics();
    this.draw();
    this.updatePosition();
  }

  /**
   * Abstract method for drawing the enemy
   * Each enemy type implements its own visual style
   */
  protected abstract draw(): void;

  /**
   * Abstract method to get movement speed
   * Each enemy type can have different speeds
   */
  protected abstract getSpeed(): number;

  /**
   * Abstract method to get enemy radius for collision
   */
  abstract get radius(): number;

  /**
   * Update enemy position on screen
   */
  protected updatePosition(): void {
    this.graphics.x = this.x;
    this.graphics.y = this.y;
  }

  /**
   * Update enemy behavior
   * Common logic: move towards player, update hit flash
   */
  update(deltaTime: number, playerX: number, playerY: number): void {
    this.targetX = playerX;
    this.targetY = playerY;

    // Move towards player
    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const dist = getDistance(this.x, this.y, playerX, playerY);

    if (dist > 1) {
      const speed = this.getSpeed();
      this.x += (dx / dist) * speed * deltaTime;
      this.y += (dy / dist) * speed * deltaTime;
    }

    // Update hit flash
    if (this.hitFlashTime > 0) {
      this.hitFlashTime -= deltaTime;
    }

    this.draw();
    this.updatePosition();
  }

  /**
   * Damage the enemy
   * Returns true if enemy died
   */
  takeDamage(amount: number): boolean {
    this.hp -= amount;
    this.hitFlashTime = 0.1;

    if (this.hp <= 0) {
      this.active = false;
      return true; // Enemy died
    }
    return false;
  }

  /**
   * Clean up graphics
   */
  destroy(): void {
    this.graphics.destroy();
  }
}
