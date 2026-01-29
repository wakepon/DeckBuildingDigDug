import { Container } from 'pixi.js';
import { Enemy } from './Enemy';
import { EliteEnemy } from './EliteEnemy';
import { TreasureChest } from './TreasureChest';
import { getDistance } from './utils/math';
import { EventBus } from './EventBus';
import {
  ENEMY_SIZE,
  PLAYER_SIZE,
  ENEMY_DAMAGE,
  ELITE_DAMAGE,
  ELITE_SPAWN_CHANCE,
  ENEMY_HP,
  EDGE_SPAWN_BASE_INTERVAL,
  EDGE_SPAWN_MIN_INTERVAL,
  EDGE_SPAWN_INTERVAL_DECAY,
  EDGE_SPAWN_OFFSET,
  EDGE_SPAWN_MAX_ENEMIES,
  ELITE_MAX_PER_FLOOR,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  WORLD_WIDTH,
  WORLD_HEIGHT,
} from './constants';

export class EnemyManager {
  public container: Container;
  private enemies: Enemy[] = [];
  private eliteEnemies: EliteEnemy[] = [];
  private treasureChests: TreasureChest[] = [];
  private eventBus: EventBus;
  private enemyHP: number = ENEMY_HP;
  private edgeSpawnTimer: number = 0;
  private edgeSpawnInterval: number = EDGE_SPAWN_BASE_INTERVAL;
  private cameraX: number = 0;
  private cameraY: number = 0;
  private eliteSpawnedThisFloor: number = 0;
  private worldWidth: number = WORLD_WIDTH;
  private worldHeight: number = WORLD_HEIGHT;

  constructor(eventBus: EventBus) {
    this.container = new Container();
    this.eventBus = eventBus;
  }

  setEnemyHP(hp: number): void {
    this.enemyHP = hp;
  }

  /**
   * Set the world dimensions for spawn position clamping
   * Used when floor size changes
   */
  setWorldSize(width: number, height: number): void {
    this.worldWidth = width;
    this.worldHeight = height;
  }

  onWallDestroyed(x: number, y: number): void {
    // Only elite enemies spawn from walls now (with floor limit)
    if (
      Math.random() < ELITE_SPAWN_CHANCE &&
      this.eliteSpawnedThisFloor < ELITE_MAX_PER_FLOOR
    ) {
      this.spawnEliteEnemy(x, y);
      this.eliteSpawnedThisFloor++;
    }
  }

  setCameraPosition(x: number, y: number): void {
    this.cameraX = x;
    this.cameraY = y;
  }

  resetFloorState(): void {
    this.edgeSpawnTimer = 0;
    this.edgeSpawnInterval = EDGE_SPAWN_BASE_INTERVAL;
    this.eliteSpawnedThisFloor = 0;
  }

  private calculateEdgeSpawnPosition(): { x: number; y: number } {
    const visibleLeft = -this.cameraX;
    const visibleRight = -this.cameraX + SCREEN_WIDTH;
    const visibleTop = -this.cameraY;
    const visibleBottom = -this.cameraY + SCREEN_HEIGHT;

    const edge = Math.floor(Math.random() * 4);

    let x: number;
    let y: number;

    switch (edge) {
      case 0: // Top edge
        x = visibleLeft + Math.random() * SCREEN_WIDTH;
        y = visibleTop - EDGE_SPAWN_OFFSET;
        break;
      case 1: // Right edge
        x = visibleRight + EDGE_SPAWN_OFFSET;
        y = visibleTop + Math.random() * SCREEN_HEIGHT;
        break;
      case 2: // Bottom edge
        x = visibleLeft + Math.random() * SCREEN_WIDTH;
        y = visibleBottom + EDGE_SPAWN_OFFSET;
        break;
      case 3: // Left edge
      default:
        x = visibleLeft - EDGE_SPAWN_OFFSET;
        y = visibleTop + Math.random() * SCREEN_HEIGHT;
        break;
    }

    x = Math.max(EDGE_SPAWN_OFFSET, Math.min(this.worldWidth - EDGE_SPAWN_OFFSET, x));
    y = Math.max(EDGE_SPAWN_OFFSET, Math.min(this.worldHeight - EDGE_SPAWN_OFFSET, y));

    return { x, y };
  }

  private updateEdgeSpawning(deltaTime: number): void {
    this.edgeSpawnTimer -= deltaTime;

    if (
      this.edgeSpawnTimer <= 0 &&
      this.enemies.length < EDGE_SPAWN_MAX_ENEMIES
    ) {
      const pos = this.calculateEdgeSpawnPosition();
      this.spawnEnemy(pos.x, pos.y);

      this.edgeSpawnInterval = Math.max(
        EDGE_SPAWN_MIN_INTERVAL,
        this.edgeSpawnInterval * EDGE_SPAWN_INTERVAL_DECAY
      );
      this.edgeSpawnTimer = this.edgeSpawnInterval;
    }
  }

  spawnEnemy(x: number, y: number): void {
    const enemy = new Enemy(x, y, this.enemyHP);
    this.enemies.push(enemy);
    this.container.addChild(enemy.graphics);
  }

  spawnEliteEnemy(x: number, y: number): void {
    const elite = new EliteEnemy(x, y, this.enemyHP);
    this.eliteEnemies.push(elite);
    this.container.addChild(elite.graphics);
  }

  private spawnTreasureChest(x: number, y: number): void {
    const chest = new TreasureChest(x, y);
    this.treasureChests.push(chest);
    this.container.addChild(chest.graphics);
  }

  update(deltaTime: number, playerX: number, playerY: number): void {
    this.updateEdgeSpawning(deltaTime);

    // Update enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];

      if (!enemy.active) {
        this.eventBus.emit({ type: 'ENEMY_DIED', x: enemy.x, y: enemy.y });

        this.container.removeChild(enemy.graphics);
        enemy.destroy();
        this.enemies = this.enemies.filter((_, idx) => idx !== i);
        continue;
      }

      enemy.update(deltaTime, playerX, playerY);

      // Check collision with player
      const dist = getDistance(enemy.x, enemy.y, playerX, playerY);
      const collisionDist = (PLAYER_SIZE / 2) + (ENEMY_SIZE / 2);

      if (dist < collisionDist) {
        this.eventBus.emit({
          type: 'PLAYER_DAMAGED',
          damage: ENEMY_DAMAGE,
          newHp: 0,
        });
      }
    }

    // Update elite enemies
    for (let i = this.eliteEnemies.length - 1; i >= 0; i--) {
      const elite = this.eliteEnemies[i];

      if (!elite.active) {
        // Spawn treasure chest on death
        this.spawnTreasureChest(elite.x, elite.y);

        // Emit EventBus event
        this.eventBus.emit({ type: 'ELITE_DIED', x: elite.x, y: elite.y });

        this.container.removeChild(elite.graphics);
        elite.destroy();
        this.eliteEnemies = this.eliteEnemies.filter((_, idx) => idx !== i);
        continue;
      }

      elite.update(deltaTime, playerX, playerY);

      // Check collision with player
      const dist = getDistance(elite.x, elite.y, playerX, playerY);
      const collisionDist = (PLAYER_SIZE / 2) + elite.radius;

      if (dist < collisionDist) {
        this.eventBus.emit({
          type: 'PLAYER_DAMAGED',
          damage: ELITE_DAMAGE,
          newHp: 0,
        });
      }
    }

    // Update treasure chests
    for (let i = this.treasureChests.length - 1; i >= 0; i--) {
      const chest = this.treasureChests[i];

      chest.update(deltaTime);

      // Check collision with player
      if (chest.checkCollision(playerX, playerY)) {
        // Emit EventBus event
        this.eventBus.emit({ type: 'CHEST_COLLECTED', upgradeCount: chest.upgradeCount });

        this.container.removeChild(chest.graphics);
        chest.destroy();
        this.treasureChests = this.treasureChests.filter((_, idx) => idx !== i);
      }
    }
  }

  getEnemies(): Enemy[] {
    return this.enemies;
  }

  getEliteEnemies(): EliteEnemy[] {
    return this.eliteEnemies;
  }

  /**
   * Damage an enemy at the given position.
   * @param x - X coordinate of the collision point
   * @param y - Y coordinate of the collision point
   * @param radius - Collision radius to check
   * @param damage - Amount of damage to apply
   * @param excludeIds - Set of enemy IDs to exclude from collision check (optional)
   * @returns Object with enemy id, center position, and radius if hit, null if no enemy was hit
   */
  damageEnemyAt(
    x: number,
    y: number,
    radius: number,
    damage: number,
    excludeIds?: Set<string>
  ): { id: string; x: number; y: number; radius: number } | null {
    // Check normal enemies
    for (const enemy of this.enemies) {
      if (!enemy.active) continue;
      if (excludeIds && excludeIds.has(enemy.id)) continue;

      const dist = getDistance(enemy.x, enemy.y, x, y);

      if (dist < radius + enemy.radius) {
        enemy.takeDamage(damage);
        return { id: enemy.id, x: enemy.x, y: enemy.y, radius: enemy.radius };
      }
    }

    // Check elite enemies
    for (const elite of this.eliteEnemies) {
      if (!elite.active) continue;
      if (excludeIds && excludeIds.has(elite.id)) continue;

      const dist = getDistance(elite.x, elite.y, x, y);

      if (dist < radius + elite.radius) {
        elite.takeDamage(damage);
        return { id: elite.id, x: elite.x, y: elite.y, radius: elite.radius };
      }
    }

    return null;
  }

  clear(): void {
    for (const enemy of this.enemies) {
      this.container.removeChild(enemy.graphics);
      enemy.destroy();
    }
    this.enemies = [];

    for (const elite of this.eliteEnemies) {
      this.container.removeChild(elite.graphics);
      elite.destroy();
    }
    this.eliteEnemies = [];

    for (const chest of this.treasureChests) {
      this.container.removeChild(chest.graphics);
      chest.destroy();
    }
    this.treasureChests = [];
  }
}
