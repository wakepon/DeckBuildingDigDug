import { Graphics, Text } from 'pixi.js';
import {
  BULLET_SIZE,
  BULLET_COLOR,
  BULLET_SPEED,
  DEBUG_DISPLAY_TEXT_STYLE,
  DEBUG_DISPLAY_HP_COLORS,
  DEBUG_DISPLAY_TEXT_OFFSET,
} from './constants';
import { calculateReflectionVector, type Vector2D } from './bounceUtils';
import { DebugDisplayManager } from './DebugDisplayManager';

export class Bullet {
  public graphics: Graphics;
  public x: number;
  public y: number;
  public vx: number;
  public vy: number;
  public active: boolean = true;
  public penetrationRemaining: number;
  private _bounceRemaining: number;
  private _pierceEnemyRemaining: number;
  private size: number;
  private hitEnemies: Set<string> = new Set();
  private debugDisplayManager: DebugDisplayManager | null = null;
  private _damage: number = 0;
  private damageText: Text | null = null;

  constructor(
    x: number,
    y: number,
    dirX: number,
    dirY: number,
    size: number = BULLET_SIZE,
    penetration: number = 0,
    bounce: number = 0,
    pierceEnemy: number = 0,
    damage: number = 0
  ) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.penetrationRemaining = penetration;
    this._bounceRemaining = bounce;
    this._pierceEnemyRemaining = pierceEnemy;
    this._damage = damage;

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

  get pierceEnemyRemaining(): number {
    return this._pierceEnemyRemaining;
  }

  set pierceEnemyRemaining(value: number) {
    this._pierceEnemyRemaining = value;
    this.draw();
  }

  get canPierceEnemy(): boolean {
    return this._pierceEnemyRemaining > 0;
  }

  /**
   * Check if this bullet has already hit a specific enemy
   */
  hasHitEnemy(enemyId: string): boolean {
    return this.hitEnemies.has(enemyId);
  }

  /**
   * Record that this bullet has hit an enemy to prevent double damage
   */
  recordEnemyHit(enemyId: string): void {
    this.hitEnemies.add(enemyId);
  }

  /**
   * Get the set of enemy IDs this bullet has hit
   * Used for filtering collision checks
   */
  getHitEnemies(): Set<string> {
    return new Set(this.hitEnemies);
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

    // Pierce enemy indicator (red-orange ring if piercing enemies)
    if (this._pierceEnemyRemaining > 0) {
      this.graphics.circle(0, 0, this.size / 2 + 8);
      this.graphics.stroke({ width: 2, color: 0xff6600, alpha: 0.6 });
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
    this.updateDamageDisplay();
  }

  destroy(): void {
    this.active = false;
    if (this.damageText) {
      this.damageText.destroy();
      this.damageText = null;
    }
    this.graphics.destroy();
  }

  /**
   * Set the DebugDisplayManager for controlling damage overlay visibility
   */
  setDebugDisplayManager(manager: DebugDisplayManager): void {
    this.debugDisplayManager = manager;
  }

  /**
   * Set the damage value for display
   */
  setDamage(damage: number): void {
    this._damage = damage;
  }

  /**
   * Get the current damage value
   */
  getDamage(): number {
    return this._damage;
  }

  /**
   * Ensure damage text is created and positioned correctly
   * Called when forcing text creation (e.g., when toggling display on)
   */
  ensureDamageTextCreated(): void {
    if (!this.damageText) {
      this.damageText = new Text({
        text: String(this._damage),
        style: {
          fontFamily: DEBUG_DISPLAY_TEXT_STYLE.fontFamily,
          fontSize: DEBUG_DISPLAY_TEXT_STYLE.fontSize,
          fontWeight: DEBUG_DISPLAY_TEXT_STYLE.fontWeight,
          fill: DEBUG_DISPLAY_HP_COLORS.bulletDamage,
          stroke: {
            color: DEBUG_DISPLAY_TEXT_STYLE.stroke,
            width: DEBUG_DISPLAY_TEXT_STYLE.strokeThickness,
          },
        },
      });
      this.damageText.anchor.set(0.5, 0.5);
    }
    // Update text and position
    this.damageText.text = String(this._damage);
    this.damageText.x = this.x;
    this.damageText.y = this.y - this.size - DEBUG_DISPLAY_TEXT_OFFSET.bulletDamage;
    this.damageText.visible = true;
  }

  /**
   * Update damage display text based on debug display state
   */
  private updateDamageDisplay(): void {
    const shouldShow = this.debugDisplayManager?.getState().showBulletDamage ?? false;

    if (shouldShow) {
      if (!this.damageText) {
        this.damageText = new Text({
          text: String(this._damage),
          style: {
            fontFamily: DEBUG_DISPLAY_TEXT_STYLE.fontFamily,
            fontSize: DEBUG_DISPLAY_TEXT_STYLE.fontSize,
            fontWeight: DEBUG_DISPLAY_TEXT_STYLE.fontWeight,
            fill: DEBUG_DISPLAY_HP_COLORS.bulletDamage,
            stroke: {
              color: DEBUG_DISPLAY_TEXT_STYLE.stroke,
              width: DEBUG_DISPLAY_TEXT_STYLE.strokeThickness,
            },
          },
        });
        this.damageText.anchor.set(0.5, 0.5);
      }
      this.damageText.text = String(this._damage);
      this.damageText.x = this.x;
      this.damageText.y = this.y - this.size - DEBUG_DISPLAY_TEXT_OFFSET.bulletDamage;
      this.damageText.visible = true;
    } else if (this.damageText) {
      this.damageText.visible = false;
    }
  }

  /**
   * Check if damage text is currently visible
   */
  isDamageTextVisible(): boolean {
    return this.damageText?.visible ?? false;
  }

  /**
   * Get the current damage text content
   */
  getDamageText(): string {
    return this.damageText?.text ?? '';
  }

  /**
   * Get the damage text element (for adding to scene)
   */
  getDamageTextElement(): Text | null {
    return this.damageText;
  }
}
