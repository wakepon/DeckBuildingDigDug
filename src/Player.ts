import { Container, Graphics } from 'pixi.js';
import { InputManager } from './InputManager';
import { WallManager } from './WallManager';
import {
  PLAYER_SIZE,
  PLAYER_SPEED,
  PLAYER_COLOR,
  PLAYER_SPAWN_CENTER_X,
  PLAYER_SPAWN_CENTER_Y,
  TILE_SIZE,
  PLAYER_MAX_HP,
  PLAYER_INVINCIBILITY_TIME,
} from './constants';

export class Player {
  public container: Container;
  private graphics: Graphics;
  private inputManager: InputManager;
  private wallManager: WallManager;

  private _x: number;
  private _y: number;
  private _hp: number;
  private _maxHp: number;
  private _exp: number;
  private _invincibilityTime: number = 0;

  constructor(inputManager: InputManager, wallManager: WallManager) {
    this.inputManager = inputManager;
    this.wallManager = wallManager;

    // Start at center of spawn area
    this._x = (PLAYER_SPAWN_CENTER_X + 0.5) * TILE_SIZE;
    this._y = (PLAYER_SPAWN_CENTER_Y + 0.5) * TILE_SIZE;
    this._hp = PLAYER_MAX_HP;
    this._maxHp = PLAYER_MAX_HP;
    this._exp = 0;

    this.container = new Container();
    this.graphics = new Graphics();
    this.container.addChild(this.graphics);

    this.draw();
    this.updatePosition();
  }

  private draw(): void {
    this.graphics.clear();

    // Invincibility flash effect
    const alpha = this._invincibilityTime > 0
      ? (Math.sin(this._invincibilityTime * 20) > 0 ? 1 : 0.3)
      : 1;

    // Draw player body (circle)
    this.graphics.circle(0, 0, PLAYER_SIZE / 2);
    this.graphics.fill({ color: PLAYER_COLOR, alpha });

    // Add glow effect
    this.graphics.circle(0, 0, PLAYER_SIZE / 2 + 2);
    this.graphics.stroke({ width: 2, color: 0x00ffaa, alpha: 0.5 * alpha });

    // Draw inner detail
    this.graphics.circle(0, 0, PLAYER_SIZE / 4);
    this.graphics.fill({ color: 0xffffff, alpha: 0.3 * alpha });
  }

  private updatePosition(): void {
    this.container.x = this._x;
    this.container.y = this._y;
  }

  update(deltaTime: number): void {
    // Update invincibility
    if (this._invincibilityTime > 0) {
      this._invincibilityTime -= deltaTime;
      this.draw();
    }

    const direction = this.inputManager.moveDirection;

    if (direction.x === 0 && direction.y === 0) return;

    const moveX = direction.x * PLAYER_SPEED * deltaTime;
    const moveY = direction.y * PLAYER_SPEED * deltaTime;

    // Try to move, with collision detection
    this.tryMove(moveX, moveY);
  }

  private tryMove(dx: number, dy: number): void {
    const halfSize = PLAYER_SIZE / 2;

    // Try horizontal movement
    const newX = this._x + dx;
    if (!this.collidesWithWall(newX, this._y, halfSize)) {
      this._x = newX;
    }

    // Try vertical movement
    const newY = this._y + dy;
    if (!this.collidesWithWall(this._x, newY, halfSize)) {
      this._y = newY;
    }

    this.updatePosition();
  }

  private collidesWithWall(x: number, y: number, radius: number): boolean {
    // Check corners around player
    const checkPoints = [
      { x: x - radius, y: y - radius },
      { x: x + radius, y: y - radius },
      { x: x - radius, y: y + radius },
      { x: x + radius, y: y + radius },
      { x: x, y: y - radius },
      { x: x, y: y + radius },
      { x: x - radius, y: y },
      { x: x + radius, y: y },
    ];

    for (const point of checkPoints) {
      const gridX = Math.floor(point.x / TILE_SIZE);
      const gridY = Math.floor(point.y / TILE_SIZE);

      if (this.wallManager.getWall(gridX, gridY)) {
        return true;
      }
    }

    return false;
  }

  takeDamage(amount: number): boolean {
    if (this._invincibilityTime > 0) return false;

    this._hp -= amount;
    this._invincibilityTime = PLAYER_INVINCIBILITY_TIME;
    this.draw();

    if (this._hp <= 0) {
      this._hp = 0;
      return true; // Player died
    }
    return false;
  }

  addExp(amount: number): void {
    this._exp += amount;
  }

  get x(): number {
    return this._x;
  }

  get y(): number {
    return this._y;
  }

  get hp(): number {
    return this._hp;
  }

  get maxHp(): number {
    return this._maxHp;
  }

  get exp(): number {
    return this._exp;
  }

  get isInvincible(): boolean {
    return this._invincibilityTime > 0;
  }
}
