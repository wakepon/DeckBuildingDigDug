import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EnemyManager } from '../EnemyManager';
import { EventBus } from '../EventBus';
import { ENEMY_DAMAGE, ELITE_DAMAGE } from '../constants';

// Mock PIXI.js
vi.mock('pixi.js', () => {
  class MockGraphics {
    x = 0;
    y = 0;
    clear() { return this; }
    circle() { return this; }
    rect() { return this; }
    roundRect() { return this; }
    fill() { return this; }
    stroke() { return this; }
    moveTo() { return this; }
    lineTo() { return this; }
    destroy() {}
  }

  class MockContainer {
    children: unknown[] = [];
    addChild(child: unknown) {
      this.children.push(child);
    }
    removeChild(child: unknown) {
      const index = this.children.indexOf(child);
      if (index > -1) {
        this.children.splice(index, 1);
      }
    }
    destroy() {}
  }

  return {
    Graphics: MockGraphics,
    Container: MockContainer,
  };
});

// Mock Enemy
vi.mock('../Enemy', () => {
  return {
    Enemy: class MockEnemy {
      x: number;
      y: number;
      radius: number = 12;
      active: boolean = true;
      graphics: unknown;
      spawnerId: number;

      constructor(x: number, y: number, spawnerId: number) {
        this.x = x;
        this.y = y;
        this.spawnerId = spawnerId;
        this.graphics = {};
      }

      update() {}
      destroy() {}
    },
  };
});

// Mock EliteEnemy
vi.mock('../EliteEnemy', () => {
  return {
    EliteEnemy: class MockEliteEnemy {
      x: number;
      y: number;
      radius: number = 21.6;
      active: boolean = true;
      graphics: unknown;

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.graphics = {};
      }

      update() {}
      destroy() {}
    },
  };
});

// Mock TreasureChest
vi.mock('../TreasureChest', () => {
  return {
    TreasureChest: class MockTreasureChest {
      graphics: unknown = {};
      destroy() {}
    },
  };
});

describe('EnemyManager Damage Integration', () => {
  let enemyManager: EnemyManager;
  let eventBus: EventBus;
  let damageReceived: number | null;

  beforeEach(() => {
    eventBus = new EventBus();
    enemyManager = new EnemyManager(eventBus);
    damageReceived = null;

    eventBus.on('PLAYER_DAMAGED', (event) => {
      damageReceived = event.damage;
    });
  });

  describe('Normal Enemy Damage', () => {
    it('should deal ENEMY_DAMAGE when normal enemy collides with player', () => {
      // Spawn enemy at player position
      const playerX = 100;
      const playerY = 100;

      enemyManager.spawnEnemy(playerX, playerY);

      // Update with player at same position (collision)
      enemyManager.update(0.016, playerX, playerY);

      expect(damageReceived).toBe(ENEMY_DAMAGE);
    });

    it('should deal ENEMY_DAMAGE value of 2', () => {
      const playerX = 100;
      const playerY = 100;

      enemyManager.spawnEnemy(playerX, playerY);
      enemyManager.update(0.016, playerX, playerY);

      expect(damageReceived).toBe(2);
    });

    it('should not deal damage when enemy is far from player', () => {
      const playerX = 100;
      const playerY = 100;
      const enemyX = 500;
      const enemyY = 500;

      enemyManager.spawnEnemy(enemyX, enemyY);
      enemyManager.update(0.016, playerX, playerY);

      expect(damageReceived).toBeNull();
    });
  });

  describe('Elite Enemy Damage', () => {
    it('should deal ELITE_DAMAGE when elite enemy collides with player', () => {
      const playerX = 200;
      const playerY = 200;

      enemyManager.spawnEliteEnemy(playerX, playerY);
      enemyManager.update(0.016, playerX, playerY);

      expect(damageReceived).toBe(ELITE_DAMAGE);
    });

    it('should deal ELITE_DAMAGE value of 8', () => {
      const playerX = 200;
      const playerY = 200;

      enemyManager.spawnEliteEnemy(playerX, playerY);
      enemyManager.update(0.016, playerX, playerY);

      expect(damageReceived).toBe(8);
    });

    it('should deal 4x normal enemy damage', () => {
      const playerX = 200;
      const playerY = 200;

      enemyManager.spawnEliteEnemy(playerX, playerY);
      enemyManager.update(0.016, playerX, playerY);

      expect(damageReceived).toBe(ENEMY_DAMAGE * 4);
    });

    it('should not deal damage when elite is far from player', () => {
      const playerX = 200;
      const playerY = 200;
      const eliteX = 600;
      const eliteY = 600;

      enemyManager.spawnEliteEnemy(eliteX, eliteY);
      enemyManager.update(0.016, playerX, playerY);

      expect(damageReceived).toBeNull();
    });
  });

  describe('Damage comparison', () => {
    it('elite should deal more damage than normal enemy', () => {
      const playerX = 300;
      const playerY = 300;

      // Test normal enemy
      enemyManager.spawnEnemy(playerX, playerY);
      enemyManager.update(0.016, playerX, playerY);
      const normalDamage = damageReceived;

      // Clear
      enemyManager.clear();
      damageReceived = null;

      // Test elite enemy
      enemyManager.spawnEliteEnemy(playerX, playerY);
      enemyManager.update(0.016, playerX, playerY);
      const eliteDamage = damageReceived;

      expect(eliteDamage).toBeGreaterThan(normalDamage!);
      expect(eliteDamage).toBe(normalDamage! * 4);
    });
  });
});
