import { Graphics, Text } from 'pixi.js';
import { getDistance } from './utils/math';
import { DebugDisplayManager } from './DebugDisplayManager';
import { DEBUG_DISPLAY_TEXT_STYLE, DEBUG_DISPLAY_HP_COLORS, DEBUG_DISPLAY_TEXT_OFFSET } from './constants';

/**
 * BaseEnemy - Abstract base class for all enemy types
 * Consolidates common movement, damage, and lifecycle logic
 */
export abstract class BaseEnemy {
  private static nextId: number = 0;
  public readonly id: string;
  public graphics: Graphics;
  public x: number;
  public y: number;
  public hp: number;
  public active: boolean = true;

  protected targetX: number = 0;
  protected targetY: number = 0;
  protected hitFlashTime: number = 0;

  private debugDisplayManager: DebugDisplayManager | null = null;
  private hpText: Text | null = null;

  constructor(x: number, y: number, hp: number) {
    this.id = `enemy-${BaseEnemy.nextId++}`;
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
    this.updateHPDisplay();
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
    if (this.hpText) {
      this.hpText.destroy();
      this.hpText = null;
    }
    this.graphics.destroy();
  }

  /**
   * Set the DebugDisplayManager for controlling HP overlay visibility
   */
  setDebugDisplayManager(manager: DebugDisplayManager): void {
    this.debugDisplayManager = manager;
  }

  /**
   * Update HP display text based on debug display state
   */
  private updateHPDisplay(): void {
    const shouldShow = this.debugDisplayManager?.getState().showEnemyHP ?? false;

    if (shouldShow) {
      if (!this.hpText) {
        this.hpText = new Text({
          text: String(this.hp),
          style: {
            fontFamily: DEBUG_DISPLAY_TEXT_STYLE.fontFamily,
            fontSize: DEBUG_DISPLAY_TEXT_STYLE.fontSize,
            fontWeight: DEBUG_DISPLAY_TEXT_STYLE.fontWeight,
            fill: DEBUG_DISPLAY_HP_COLORS.enemyHP,
            stroke: {
              color: DEBUG_DISPLAY_TEXT_STYLE.stroke,
              width: DEBUG_DISPLAY_TEXT_STYLE.strokeThickness,
            },
          },
        });
        this.hpText.anchor.set(0.5, 0.5);
      }
      this.hpText.text = String(this.hp);
      this.hpText.x = this.x;
      this.hpText.y = this.y - this.radius - DEBUG_DISPLAY_TEXT_OFFSET.enemyHP;
      this.hpText.visible = true;
    } else if (this.hpText) {
      this.hpText.visible = false;
    }
  }

  /**
   * Check if HP text is currently visible
   */
  isHPTextVisible(): boolean {
    return this.hpText?.visible ?? false;
  }

  /**
   * Get the current HP text content
   */
  getHPText(): string {
    return this.hpText?.text ?? '';
  }

  /**
   * Get the HP text element (for adding to scene)
   */
  getHPTextElement(): Text | null {
    return this.hpText;
  }
}
