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
  x: number;
  y: number;
  graphics: Graphics;
  timer: number;
  spawnedCount: number;
  active: boolean;
}

export class EnemyManager {
  public container: Container;
  private enemies: Enemy[] = [];
  private spawners: Spawner[] = [];
  private onEnemyDeath: ((x: number, y: number) => void) | null = null;
  private onPlayerDamage: ((damage: number) => void) | null = null;

  constructor() {
    this.container = new Container();
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

    // Check for enemy spawn (20% chance)
    if (Math.random() < ENEMY_SPAWN_CHANCE) {
      this.spawnEnemy(x, y);
    }
  }

  private createSpawner(x: number, y: number): void {
    const graphics = new Graphics();
    this.drawSpawner(graphics, true);
    graphics.x = x;
    graphics.y = y;

    const spawner: Spawner = {
      x,
      y,
      graphics,
      timer: SPAWNER_INTERVAL,
      spawnedCount: 0,
      active: true,
    };

    this.spawners.push(spawner);
    this.container.addChild(graphics);
  }

  private drawSpawner(graphics: Graphics, active: boolean): void {
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
  }

  spawnEnemy(x: number, y: number): void {
    const enemy = new Enemy(x, y);
    this.enemies.push(enemy);
    this.container.addChild(enemy.graphics);
  }

  update(deltaTime: number, playerX: number, playerY: number): void {
    // Update spawners
    for (let i = this.spawners.length - 1; i >= 0; i--) {
      const spawner = this.spawners[i];

      if (!spawner.active) {
        this.drawSpawner(spawner.graphics, false);
        continue;
      }

      // Check if player is close enough to disable
      const dx = playerX - spawner.x;
      const dy = playerY - spawner.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < SPAWNER_DISABLE_RANGE) {
        spawner.active = false;
        this.drawSpawner(spawner.graphics, false);
        continue;
      }

      // Spawn timer
      spawner.timer -= deltaTime;
      if (spawner.timer <= 0 && spawner.spawnedCount < SPAWNER_MAX_ENEMIES) {
        this.spawnEnemy(spawner.x, spawner.y);
        spawner.spawnedCount++;
        spawner.timer = SPAWNER_INTERVAL;
      }

      // Animate spawner
      this.drawSpawner(spawner.graphics, true);
    }

    // Update enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];

      if (!enemy.active) {
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
}
