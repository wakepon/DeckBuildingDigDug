import { Container, Graphics } from 'pixi.js';
import { Enemy } from './Enemy';
import {
  ENEMY_SPAWN_CHANCE,
  SPAWNER_CHANCE,
  SPAWNER_INTERVAL,
  SPAWNER_MAX_ENEMIES,
  SPAWNER_DISABLE_RANGE,
  SPAWNER_SIZE,
  SPAWNER_COLOR,
  ENEMY_SIZE,
  PLAYER_SIZE,
  ENEMY_DAMAGE,
} from './constants';

interface Spawner {
  id: number;
  x: number;
  y: number;
  graphics: Graphics;
  timer: number;
  aliveCount: number; // Current number of alive enemies from this spawner
  active: boolean;
}

export class EnemyManager {
  public container: Container;
  private enemies: Enemy[] = [];
  private spawners: Spawner[] = [];
  private nextSpawnerId: number = 0;
  private onEnemyDeath: ((x: number, y: number) => void) | null = null;
  private onPlayerDamage: ((damage: number) => void) | null = null;
  private enemyHP: number = 3;
  private enemySpawnChance: number = ENEMY_SPAWN_CHANCE;

  constructor() {
    this.container = new Container();
  }

  setEnemyHP(hp: number): void {
    this.enemyHP = hp;
  }

  setEnemySpawnChance(chance: number): void {
    this.enemySpawnChance = chance;
  }

  setOnEnemyDeath(callback: (x: number, y: number) => void): void {
    this.onEnemyDeath = callback;
  }

  setOnPlayerDamage(callback: (damage: number) => void): void {
    this.onPlayerDamage = callback;
  }

  onWallDestroyed(x: number, y: number): void {
    // Check for spawner first (5% chance)
    if (Math.random() < SPAWNER_CHANCE) {
      this.createSpawner(x, y);
      return;
    }

    // Check for enemy spawn (scaled chance)
    if (Math.random() < this.enemySpawnChance) {
      this.spawnEnemy(x, y);
    }
  }

  private createSpawner(x: number, y: number): void {
    const graphics = new Graphics();
    this.drawSpawner(graphics, true, 0);
    graphics.x = x;
    graphics.y = y;

    const spawner: Spawner = {
      id: this.nextSpawnerId++,
      x,
      y,
      graphics,
      timer: SPAWNER_INTERVAL,
      aliveCount: 0,
      active: true,
    };

    this.spawners.push(spawner);
    this.container.addChild(graphics);
  }

  private drawSpawner(graphics: Graphics, active: boolean, aliveCount: number): void {
    graphics.clear();

    const color = active ? SPAWNER_COLOR : 0x444444;

    // Portal-like effect
    graphics.circle(0, 0, SPAWNER_SIZE / 2);
    graphics.fill({ color, alpha: 0.7 });

    // Swirling pattern
    for (let i = 0; i < 3; i++) {
      const angle = (Date.now() / 500 + i * (Math.PI * 2 / 3)) % (Math.PI * 2);
      const r = SPAWNER_SIZE / 3;
      graphics.circle(Math.cos(angle) * r, Math.sin(angle) * r, 4);
      graphics.fill(active ? 0xaa00ff : 0x666666);
    }

    // Outer ring
    graphics.circle(0, 0, SPAWNER_SIZE / 2 + 3);
    graphics.stroke({ width: 3, color: active ? 0xff00ff : 0x555555, alpha: 0.8 });

    // Show enemy count indicator (small dots)
    if (active) {
      for (let i = 0; i < aliveCount; i++) {
        const dotAngle = (i / SPAWNER_MAX_ENEMIES) * Math.PI * 2 - Math.PI / 2;
        const dotR = SPAWNER_SIZE / 2 + 8;
        graphics.circle(Math.cos(dotAngle) * dotR, Math.sin(dotAngle) * dotR, 3);
        graphics.fill(0xff4444);
      }
    }
  }

  spawnEnemy(x: number, y: number, spawnerId: number = -1): void {
    const enemy = new Enemy(x, y, spawnerId, this.enemyHP);
    this.enemies.push(enemy);
    this.container.addChild(enemy.graphics);
  }

  private getSpawnerById(id: number): Spawner | undefined {
    return this.spawners.find(s => s.id === id);
  }

  update(deltaTime: number, playerX: number, playerY: number): void {
    // Update spawners
    for (let i = this.spawners.length - 1; i >= 0; i--) {
      const spawner = this.spawners[i];

      if (!spawner.active) {
        this.drawSpawner(spawner.graphics, false, 0);
        continue;
      }

      // Check if player is close enough to disable
      const dx = playerX - spawner.x;
      const dy = playerY - spawner.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < SPAWNER_DISABLE_RANGE) {
        spawner.active = false;
        this.drawSpawner(spawner.graphics, false, 0);
        continue;
      }

      // Spawn timer - only spawn if alive count is below max
      spawner.timer -= deltaTime;
      if (spawner.timer <= 0 && spawner.aliveCount < SPAWNER_MAX_ENEMIES) {
        this.spawnEnemy(spawner.x, spawner.y, spawner.id);
        spawner.aliveCount++;
        spawner.timer = SPAWNER_INTERVAL;
      }

      // Animate spawner
      this.drawSpawner(spawner.graphics, true, spawner.aliveCount);
    }

    // Update enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];

      if (!enemy.active) {
        // Decrement spawner's alive count if this enemy was from a spawner
        if (enemy.spawnerId >= 0) {
          const spawner = this.getSpawnerById(enemy.spawnerId);
          if (spawner && spawner.aliveCount > 0) {
            spawner.aliveCount--;
          }
        }

        if (this.onEnemyDeath) {
          this.onEnemyDeath(enemy.x, enemy.y);
        }
        this.container.removeChild(enemy.graphics);
        enemy.destroy();
        this.enemies.splice(i, 1);
        continue;
      }

      enemy.update(deltaTime, playerX, playerY);

      // Check collision with player
      const dx = playerX - enemy.x;
      const dy = playerY - enemy.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const collisionDist = (PLAYER_SIZE / 2) + (ENEMY_SIZE / 2);

      if (dist < collisionDist && this.onPlayerDamage) {
        this.onPlayerDamage(ENEMY_DAMAGE);
      }
    }
  }

  getEnemies(): Enemy[] {
    return this.enemies;
  }

  damageEnemyAt(x: number, y: number, radius: number, damage: number): boolean {
    for (const enemy of this.enemies) {
      if (!enemy.active) continue;

      const dx = x - enemy.x;
      const dy = y - enemy.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < radius + enemy.radius) {
        enemy.takeDamage(damage);
        return true;
      }
    }
    return false;
  }

  clear(): void {
    for (const enemy of this.enemies) {
      this.container.removeChild(enemy.graphics);
      enemy.destroy();
    }
    this.enemies = [];

    for (const spawner of this.spawners) {
      this.container.removeChild(spawner.graphics);
      spawner.graphics.destroy();
    }
    this.spawners = [];
    this.nextSpawnerId = 0;
  }
}
