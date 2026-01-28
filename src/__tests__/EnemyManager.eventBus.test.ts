import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EnemyManager } from '../EnemyManager';
import { EventBus } from '../EventBus';

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

// Mock Enemy with controllable death
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
      takeDamage() {
        this.active = false;
      }
      destroy() {}
    },
  };
});

// Mock EliteEnemy with controllable death
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
      takeDamage() {
        this.active = false;
      }
      destroy() {}
    },
  };
});

// Mock TreasureChest
vi.mock('../TreasureChest', () => {
  return {
    TreasureChest: class MockTreasureChest {
      x: number;
      y: number;
      upgradeCount: number = 1;
      graphics: unknown = {};

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
      }

      update() {}
      checkCollision(playerX: number, playerY: number): boolean {
        const dx = playerX - this.x;
        const dy = playerY - this.y;
        return Math.sqrt(dx * dx + dy * dy) < 30;
      }
      destroy() {}
    },
  };
});

describe('EnemyManager EventBus Integration', () => {
  let enemyManager: EnemyManager;
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
    enemyManager = new EnemyManager(eventBus);
  });

  describe('constructor with EventBus', () => {
    it('should accept an EventBus instance in constructor', () => {
      const bus = new EventBus();

      // Should not throw
      expect(() => new EnemyManager(bus)).not.toThrow();
    });
  });

  describe('ENEMY_DIED event', () => {
    it('should emit ENEMY_DIED event when regular enemy dies', () => {
      const events: Array<{ type: string; x: number; y: number }> = [];

      eventBus.on('ENEMY_DIED', (event) => {
        events.push(event);
      });

      // Spawn enemy
      const enemyX = 100;
      const enemyY = 150;
      enemyManager.spawnEnemy(enemyX, enemyY);

      // Kill the enemy by damaging it
      enemyManager.damageEnemyAt(enemyX, enemyY, 50, 100);

      // Update to process the death
      enemyManager.update(0.016, 500, 500);

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('ENEMY_DIED');
      expect(events[0].x).toBe(enemyX);
      expect(events[0].y).toBe(enemyY);
    });

    it('should emit event with correct coordinates for multiple enemy deaths', () => {
      const events: Array<{ x: number; y: number }> = [];

      eventBus.on('ENEMY_DIED', (event) => {
        events.push({ x: event.x, y: event.y });
      });

      // Spawn and kill multiple enemies
      enemyManager.spawnEnemy(100, 100);
      enemyManager.spawnEnemy(200, 200);

      enemyManager.damageEnemyAt(100, 100, 50, 100);
      enemyManager.damageEnemyAt(200, 200, 50, 100);

      // Update to process deaths
      enemyManager.update(0.016, 500, 500);

      expect(events).toHaveLength(2);
    });
  });

  describe('ELITE_DIED event', () => {
    it('should emit ELITE_DIED event when elite enemy dies', () => {
      const events: Array<{ type: string; x: number; y: number }> = [];

      eventBus.on('ELITE_DIED', (event) => {
        events.push(event);
      });

      // Spawn elite enemy
      const eliteX = 200;
      const eliteY = 250;
      enemyManager.spawnEliteEnemy(eliteX, eliteY);

      // Kill the elite by damaging it
      enemyManager.damageEnemyAt(eliteX, eliteY, 50, 100);

      // Update to process the death
      enemyManager.update(0.016, 500, 500);

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('ELITE_DIED');
      expect(events[0].x).toBe(eliteX);
      expect(events[0].y).toBe(eliteY);
    });
  });

  describe('CHEST_COLLECTED event', () => {
    it('should emit CHEST_COLLECTED event when treasure chest is collected', () => {
      const events: Array<{ type: string; upgradeCount: number }> = [];

      eventBus.on('CHEST_COLLECTED', (event) => {
        events.push(event);
      });

      // Spawn elite and kill it to create chest
      const x = 300;
      const y = 300;
      enemyManager.spawnEliteEnemy(x, y);
      enemyManager.damageEnemyAt(x, y, 50, 100);
      enemyManager.update(0.016, 500, 500); // Process death, creates chest

      // Now player collects the chest by being at its location
      enemyManager.update(0.016, x, y);

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('CHEST_COLLECTED');
      expect(events[0].upgradeCount).toBe(1);
    });
  });

});
