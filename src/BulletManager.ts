import { Container } from 'pixi.js';
import { Bullet } from './Bullet';
import { WallManager } from './WallManager';
import { InputManager } from './InputManager';
import { Player } from './Player';
import { EnemyManager } from './EnemyManager';
import { PlayerStats } from './PlayerStats';
import { EventBus } from './EventBus';
import { AutoAimSystem, Target, TargetType } from './AutoAimSystem';
import { calculateMultiWayShotDirections } from './multiWayShotUtils';
import { determineWallNormal } from './bounceUtils';
import {
  TILE_SIZE,
  GRID_COLS,
  GRID_ROWS,
  BOUNCE_OFFSET,
} from './constants';

export class BulletManager {
  public container: Container;
  private bullets: Bullet[] = [];
  private wallManager: WallManager;
  private inputManager: InputManager;
  private player: Player;
  private playerStats: PlayerStats;
  private eventBus: EventBus;
  private enemyManager: EnemyManager | null = null;
  private autoAimSystem: AutoAimSystem | null = null;
  private fireCooldown: number = 0;

  constructor(
    wallManager: WallManager,
    inputManager: InputManager,
    player: Player,
    playerStats: PlayerStats,
    eventBus: EventBus
  ) {
    this.wallManager = wallManager;
    this.inputManager = inputManager;
    this.player = player;
    this.playerStats = playerStats;
    this.eventBus = eventBus;
    this.container = new Container();
  }

  setEnemyManager(enemyManager: EnemyManager): void {
    this.enemyManager = enemyManager;
  }

  setAutoAimSystem(autoAimSystem: AutoAimSystem): void {
    this.autoAimSystem = autoAimSystem;
  }

  /**
   * Collect all potential targets for auto-aim
   * @returns Array of targets (enemies and walls)
   */
  getTargets(): Target[] {
    const targets: Target[] = [];

    // Add active enemies
    if (this.enemyManager) {
      for (const enemy of this.enemyManager.getEnemies()) {
        if (enemy.active) {
          targets.push({ x: enemy.x, y: enemy.y, type: 'enemy' as TargetType });
        }
      }

      for (const elite of this.enemyManager.getEliteEnemies()) {
        if (elite.active) {
          targets.push({ x: elite.x, y: elite.y, type: 'enemy' as TargetType });
        }
      }
    }

    // Add wall centers
    for (const wallCenter of this.wallManager.getWallCenters()) {
      targets.push({ x: wallCenter.x, y: wallCenter.y, type: 'wall' as TargetType });
    }

    return targets;
  }

  update(deltaTime: number, cameraX: number, cameraY: number): void {
    // Handle firing with dynamic fire rate from stats
    this.fireCooldown -= deltaTime;

    if (this.inputManager.isMouseDown && this.fireCooldown <= 0) {
      this.fire(cameraX, cameraY);
      this.fireCooldown = this.playerStats.fireRate;
    }

    // Update bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      bullet.update(deltaTime);

      // Check enemy collision first
      if (this.enemyManager) {
        const damage = this.playerStats.attackPower * this.playerStats.multiWayShotDamageMultiplier;
        const bulletRadius = this.playerStats.bulletSize / 2;
        const hitEnemy = this.enemyManager.damageEnemyAt(
          bullet.x,
          bullet.y,
          bulletRadius,
          damage
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

        // Damage wall using attack power with multi-way shot penalty (minimum 1 damage)
        const wallDamage = Math.max(1, Math.floor(
          this.playerStats.attackPower * this.playerStats.multiWayShotDamageMultiplier
        ));
        const destroyed = this.wallManager.damageWall(gridX, gridY, wallDamage);

        if (destroyed && wallColor !== null) {
          // Emit wall destroyed event
          const centerX = (gridX + 0.5) * TILE_SIZE;
          const centerY = (gridY + 0.5) * TILE_SIZE;
          this.eventBus.emit({ type: 'WALL_DESTROYED', x: centerX, y: centerY, color: wallColor });
        }

        // Check penetration first
        bullet.penetrationRemaining--;
        if (bullet.penetrationRemaining < 0) {
          // No penetration left - check for bounce
          if (bullet.hasBounce) {
            // Apply bounce
            const normal = determineWallNormal({ x: bullet.vx, y: bullet.vy });
            bullet.applyBounce(normal);

            // Offset bullet position to prevent re-collision
            this.offsetBulletFromWall(bullet, gridX, gridY, normal);
          } else {
            // No bounce left either - remove bullet
            this.removeBullet(i);
            continue;
          }
        }
      }

      // Check out of bounds - try to bounce off world edges
      if (this.handleBoundsCollision(bullet)) {
        this.removeBullet(i);
      }
    }
  }

  /**
   * Handle collision with world bounds.
   * Returns true if bullet should be removed.
   */
  private handleBoundsCollision(bullet: Bullet): boolean {
    const worldWidth = GRID_COLS * TILE_SIZE;
    const worldHeight = GRID_ROWS * TILE_SIZE;

    let hitBounds = false;
    let normalX = 0;
    let normalY = 0;

    if (bullet.x < 0) {
      hitBounds = true;
      normalX = 1; // Facing right
    } else if (bullet.x > worldWidth) {
      hitBounds = true;
      normalX = -1; // Facing left
    }

    if (bullet.y < 0) {
      hitBounds = true;
      normalY = 1; // Facing down
    } else if (bullet.y > worldHeight) {
      hitBounds = true;
      normalY = -1; // Facing up
    }

    if (!hitBounds) {
      return false;
    }

    // Try to bounce
    if (bullet.hasBounce) {
      // Determine which axis to bounce on
      if (normalX !== 0 && normalY !== 0) {
        // Corner hit - pick dominant axis based on velocity
        if (Math.abs(bullet.vx) > Math.abs(bullet.vy)) {
          normalY = 0;
        } else {
          normalX = 0;
        }
      }

      bullet.applyBounce({ x: normalX, y: normalY });

      // Clamp position to within bounds
      if (bullet.x < 0) bullet.setPosition(BOUNCE_OFFSET, bullet.y);
      if (bullet.x > worldWidth) bullet.setPosition(worldWidth - BOUNCE_OFFSET, bullet.y);
      if (bullet.y < 0) bullet.setPosition(bullet.x, BOUNCE_OFFSET);
      if (bullet.y > worldHeight) bullet.setPosition(bullet.x, worldHeight - BOUNCE_OFFSET);

      return false;
    }

    // No bounce - remove bullet
    return true;
  }

  /**
   * Offset bullet position away from wall to prevent immediate re-collision.
   */
  private offsetBulletFromWall(
    bullet: Bullet,
    gridX: number,
    gridY: number,
    normal: { x: number; y: number }
  ): void {
    let newX = bullet.x;
    let newY = bullet.y;

    if (normal.x !== 0) {
      // Hit vertical wall
      if (normal.x < 0) {
        // Wall is to the right, push bullet to left edge of tile
        newX = gridX * TILE_SIZE - BOUNCE_OFFSET;
      } else {
        // Wall is to the left, push bullet to right edge of tile
        newX = (gridX + 1) * TILE_SIZE + BOUNCE_OFFSET;
      }
    }

    if (normal.y !== 0) {
      // Hit horizontal wall
      if (normal.y < 0) {
        // Wall is below, push bullet to top edge of tile
        newY = gridY * TILE_SIZE - BOUNCE_OFFSET;
      } else {
        // Wall is above, push bullet to bottom edge of tile
        newY = (gridY + 1) * TILE_SIZE + BOUNCE_OFFSET;
      }
    }

    bullet.setPosition(newX, newY);
  }

  private fire(cameraX: number, cameraY: number): void {
    let dirX: number;
    let dirY: number;

    // Check if auto-aim should be used
    if (this.autoAimSystem && this.playerStats.autoAimEnabled) {
      // Use movement direction for auto-aim targeting
      const moveDir = this.inputManager.moveDirection;

      // If not moving, use last movement direction
      const aimMoveX = moveDir.x !== 0 || moveDir.y !== 0
        ? moveDir.x
        : this.inputManager.lastMoveDirection.x;
      const aimMoveY = moveDir.x !== 0 || moveDir.y !== 0
        ? moveDir.y
        : this.inputManager.lastMoveDirection.y;

      // Get targets and find best aim direction
      const targets = this.getTargets();
      const aimDir = this.autoAimSystem.getAimDirection(
        this.player.x,
        this.player.y,
        aimMoveX,
        aimMoveY,
        targets
      );

      dirX = aimDir.x;
      dirY = aimDir.y;

      // If no direction (player not moving and no target), don't fire
      if (dirX === 0 && dirY === 0) return;
    } else {
      // Manual aiming: Calculate direction from player to mouse (in world coordinates)
      const mouseWorldX = this.inputManager.mouseX - cameraX;
      const mouseWorldY = this.inputManager.mouseY - cameraY;

      dirX = mouseWorldX - this.player.x;
      dirY = mouseWorldY - this.player.y;

      // Don't fire if mouse is too close
      if (Math.abs(dirX) < 1 && Math.abs(dirY) < 1) return;
    }

    // Calculate multiple bullet directions based on multi-way shot bullet count
    const directions = calculateMultiWayShotDirections(
      dirX,
      dirY,
      this.playerStats.multiWayShotBulletCount
    );

    // Create a bullet for each direction
    for (const direction of directions) {
      const bullet = new Bullet(
        this.player.x,
        this.player.y,
        direction.dirX,
        direction.dirY,
        this.playerStats.bulletSize,
        this.playerStats.penetrationCount,
        this.playerStats.bounceCount
      );
      this.bullets.push(bullet);
      this.container.addChild(bullet.graphics);
    }
  }

  private removeBullet(index: number): void {
    const bullet = this.bullets[index];
    this.container.removeChild(bullet.graphics);
    bullet.destroy();
    this.bullets = this.bullets.filter((_, idx) => idx !== index);
  }

  clear(): void {
    for (const bullet of this.bullets) {
      this.container.removeChild(bullet.graphics);
      bullet.destroy();
    }
    this.bullets = [];
    this.fireCooldown = 0;
  }
}
