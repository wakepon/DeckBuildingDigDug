import { Container } from 'pixi.js';
import { Bullet } from './Bullet';
import { WallManager } from './WallManager';
import { InputManager } from './InputManager';
import { Player } from './Player';
import { EnemyManager } from './EnemyManager';
import {
  FIRE_RATE,
  TILE_SIZE,
  GRID_COLS,
  GRID_ROWS,
  BULLET_SIZE,
} from './constants';

export class BulletManager {
  public container: Container;
  private bullets: Bullet[] = [];
  private wallManager: WallManager;
  private inputManager: InputManager;
  private player: Player;
  private enemyManager: EnemyManager | null = null;
  private fireCooldown: number = 0;
  private onWallDestroyed: ((x: number, y: number, color: number) => void) | null = null;

  constructor(
    wallManager: WallManager,
    inputManager: InputManager,
    player: Player
  ) {
    this.wallManager = wallManager;
    this.inputManager = inputManager;
    this.player = player;
    this.container = new Container();
  }

  setEnemyManager(enemyManager: EnemyManager): void {
    this.enemyManager = enemyManager;
  }

  setOnWallDestroyed(callback: (x: number, y: number, color: number) => void): void {
    this.onWallDestroyed = callback;
  }

  update(deltaTime: number, cameraX: number, cameraY: number): void {
    // Handle firing
    this.fireCooldown -= deltaTime;

    if (this.inputManager.isMouseDown && this.fireCooldown <= 0) {
      this.fire(cameraX, cameraY);
      this.fireCooldown = FIRE_RATE;
    }

    // Update bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      bullet.update(deltaTime);

      // Check enemy collision first
      if (this.enemyManager) {
        const hitEnemy = this.enemyManager.damageEnemyAt(
          bullet.x,
          bullet.y,
          BULLET_SIZE / 2,
          1
        );
        if (hitEnemy) {
          this.removeBullet(i);
          continue;
        }
      }

      // Check wall collision
      const gridX = Math.floor(bullet.x / TILE_SIZE);
      const gridY = Math.floor(bullet.y / TILE_SIZE);

      const wall = this.wallManager.getWall(gridX, gridY);
      if (wall) {
        // Get wall color before damaging
        const wallColor = this.wallManager.getWallColor(gridX, gridY);

        // Damage wall
        const destroyed = this.wallManager.damageWall(gridX, gridY, 1);

        if (destroyed && this.onWallDestroyed && wallColor !== null) {
          // Trigger particle effect at wall center
          const centerX = (gridX + 0.5) * TILE_SIZE;
          const centerY = (gridY + 0.5) * TILE_SIZE;
          this.onWallDestroyed(centerX, centerY, wallColor);
        }

        // Remove bullet
        this.removeBullet(i);
        continue;
      }

      // Check out of bounds
      if (
        bullet.x < 0 ||
        bullet.x > GRID_COLS * TILE_SIZE ||
        bullet.y < 0 ||
        bullet.y > GRID_ROWS * TILE_SIZE
      ) {
        this.removeBullet(i);
      }
    }
  }

  private fire(cameraX: number, cameraY: number): void {
    // Calculate direction from player to mouse (in world coordinates)
    const mouseWorldX = this.inputManager.mouseX - cameraX;
    const mouseWorldY = this.inputManager.mouseY - cameraY;

    const dirX = mouseWorldX - this.player.x;
    const dirY = mouseWorldY - this.player.y;

    // Don't fire if mouse is too close
    if (Math.abs(dirX) < 1 && Math.abs(dirY) < 1) return;

    const bullet = new Bullet(this.player.x, this.player.y, dirX, dirY);
    this.bullets.push(bullet);
    this.container.addChild(bullet.graphics);
  }

  private removeBullet(index: number): void {
    const bullet = this.bullets[index];
    this.container.removeChild(bullet.graphics);
    bullet.destroy();
    this.bullets.splice(index, 1);
  }
}
