import { describe, it, expect, beforeEach, vi } from 'vitest';

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
      return child;
    }
    removeChild(child: unknown) {
      const index = this.children.indexOf(child);
      if (index > -1) {
        this.children.splice(index, 1);
      }
      return child;
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
  let idCounter = 0;
  return {
    Enemy: class MockEnemy {
      x: number;
      y: number;
      radius: number = 12;
      active: boolean = true;
      graphics: unknown;
      id: string;
      hp: number;

      constructor(x: number, y: number, hp: number = 1) {
        this.x = x;
        this.y = y;
        this.hp = hp;
        this.id = `enemy-${idCounter++}`;
        this.graphics = {};
      }

      update() {}
      destroy() {}
      takeDamage(damage: number) {
        this.hp -= damage;
        if (this.hp <= 0) {
          this.active = false;
        }
      }
    },
  };
});

// Mock EliteEnemy
vi.mock('../EliteEnemy', () => {
  let idCounter = 0;
  return {
    EliteEnemy: class MockEliteEnemy {
      x: number;
      y: number;
      radius: number = 21.6;
      active: boolean = true;
      graphics: unknown;
      id: string;
      hp: number;

      constructor(x: number, y: number, hp: number = 5) {
        this.x = x;
        this.y = y;
        this.hp = hp;
        this.id = `elite-${idCounter++}`;
        this.graphics = {};
      }

      update() {}
      destroy() {}
      takeDamage(damage: number) {
        this.hp -= damage;
        if (this.hp <= 0) {
          this.active = false;
        }
      }
    },
  };
});

// Mock TreasureChest
vi.mock('../TreasureChest', () => {
  return {
    TreasureChest: class MockTreasureChest {
      x: number;
      y: number;
      graphics: unknown;
      upgradeCount: number = 1;

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.graphics = {};
      }

      update() {}
      destroy() {}
      checkCollision() { return false; }
    },
  };
});

import { EnemyManager } from '../EnemyManager';
import { EventBus } from '../EventBus';
import { Bullet } from '../Bullet';
import { calculateEnemyReflectionNormal } from '../bounceUtils';
import { BOUNCE_OFFSET } from '../constants';

describe('BulletManager enemy bounce behavior', () => {
  let eventBus: EventBus;
  let enemyManager: EnemyManager;

  beforeEach(() => {
    eventBus = new EventBus();
    enemyManager = new EnemyManager(eventBus);
  });

  describe('damageEnemyAt return value', () => {
    it('should return enemy position when enemy is hit', () => {
      // Spawn enemy at known position
      const enemyX = 100;
      const enemyY = 100;
      enemyManager.spawnEnemy(enemyX, enemyY);

      // Hit the enemy
      const bulletRadius = 4;
      const damage = 10;
      const result = enemyManager.damageEnemyAt(
        enemyX,
        enemyY,
        bulletRadius,
        damage
      );

      // Result should include position and radius
      expect(result).not.toBeNull();
      if (result) {
        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('x');
        expect(result).toHaveProperty('y');
        expect(result).toHaveProperty('radius');
        expect(result.x).toBe(enemyX);
        expect(result.y).toBe(enemyY);
        expect(result.radius).toBeGreaterThan(0);
      }
    });

    it('should return null when no enemy is hit', () => {
      // Spawn enemy at known position
      enemyManager.spawnEnemy(100, 100);

      // Try to hit at far away position
      const result = enemyManager.damageEnemyAt(
        500,
        500,
        4,
        10
      );

      expect(result).toBeNull();
    });

    it('should return elite enemy position when elite is hit', () => {
      // Spawn elite enemy at known position
      const enemyX = 150;
      const enemyY = 150;
      enemyManager.spawnEliteEnemy(enemyX, enemyY);

      // Hit the elite enemy
      const bulletRadius = 4;
      const damage = 10;
      const result = enemyManager.damageEnemyAt(
        enemyX,
        enemyY,
        bulletRadius,
        damage
      );

      // Result should include position and radius
      expect(result).not.toBeNull();
      if (result) {
        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('x');
        expect(result).toHaveProperty('y');
        expect(result).toHaveProperty('radius');
        expect(result.x).toBe(enemyX);
        expect(result.y).toBe(enemyY);
        expect(result.radius).toBeGreaterThan(0);
      }
    });
  });

  describe('bullet bounce on enemy - unit tests', () => {
    it('should apply bounce to bullet when hasBounce is true and canPierceEnemy is false', () => {
      // Create bullet with bounce but no pierce
      const bullet = new Bullet(100, 100, 1, 0, 8, 0, 2, 0);

      expect(bullet.hasBounce).toBe(true);
      expect(bullet.canPierceEnemy).toBe(false);
      expect(bullet.bounceRemaining).toBe(2);

      // Simulate enemy at position (120, 100)
      const enemyX = 120;
      const enemyY = 100;

      // Calculate normal pointing away from enemy
      const normal = calculateEnemyReflectionNormal(
        bullet.x,
        bullet.y,
        enemyX,
        enemyY
      );

      // Bullet is to the left of enemy, so normal should point left
      expect(normal.x).toBeLessThan(0);

      // Apply bounce
      bullet.applyBounce(normal);

      // Bounce count should decrement
      expect(bullet.bounceRemaining).toBe(1);

      // Velocity should be reflected (was moving right, now moving left)
      expect(bullet.vx).toBeLessThan(0);
    });

    it('should pierce through enemy when canPierceEnemy is true', () => {
      // Create bullet with both pierce and bounce
      const bullet = new Bullet(100, 100, 1, 0, 8, 0, 2, 2);

      expect(bullet.hasBounce).toBe(true);
      expect(bullet.canPierceEnemy).toBe(true);
      expect(bullet.pierceEnemyRemaining).toBe(2);

      const originalVx = bullet.vx;
      const originalVy = bullet.vy;
      const originalBounceRemaining = bullet.bounceRemaining;

      // Simulate pierce by decrementing pierce counter
      bullet.pierceEnemyRemaining--;

      // Pierce counter should decrement
      expect(bullet.pierceEnemyRemaining).toBe(1);
      // Bounce counter should remain unchanged
      expect(bullet.bounceRemaining).toBe(originalBounceRemaining);
      // Velocity should remain unchanged (bullet continues through)
      expect(bullet.vx).toBe(originalVx);
      expect(bullet.vy).toBe(originalVy);
    });

    it('should use bounce after pierce is exhausted', () => {
      // Create bullet with 1 pierce and 2 bounces
      const bullet = new Bullet(100, 100, 1, 0, 8, 0, 2, 1);

      expect(bullet.canPierceEnemy).toBe(true);
      expect(bullet.pierceEnemyRemaining).toBe(1);
      expect(bullet.bounceRemaining).toBe(2);

      // First enemy: pierce through
      bullet.pierceEnemyRemaining--;
      expect(bullet.canPierceEnemy).toBe(false);
      expect(bullet.bounceRemaining).toBe(2);

      // Second enemy: must bounce
      const normal = calculateEnemyReflectionNormal(100, 100, 120, 100);
      bullet.applyBounce(normal);

      expect(bullet.bounceRemaining).toBe(1);
    });

    it('should not allow bounce when bounceRemaining is 0', () => {
      // Create bullet with no bounce
      const bullet = new Bullet(100, 100, 1, 0, 8, 0, 0, 0);

      expect(bullet.hasBounce).toBe(false);
      expect(bullet.bounceRemaining).toBe(0);
    });
  });

  describe('enemy reflection normal calculation', () => {
    it('should calculate correct normal for bullet approaching from left', () => {
      const bulletX = 80;  // Bullet to the left
      const bulletY = 100;
      const enemyX = 100;
      const enemyY = 100;

      const normal = calculateEnemyReflectionNormal(bulletX, bulletY, enemyX, enemyY);

      // Normal should point left (negative x)
      expect(normal.x).toBeCloseTo(-1);
      expect(normal.y).toBeCloseTo(0);
    });

    it('should calculate correct normal for bullet approaching from right', () => {
      const bulletX = 120;  // Bullet to the right
      const bulletY = 100;
      const enemyX = 100;
      const enemyY = 100;

      const normal = calculateEnemyReflectionNormal(bulletX, bulletY, enemyX, enemyY);

      // Normal should point right (positive x)
      expect(normal.x).toBeCloseTo(1);
      expect(normal.y).toBeCloseTo(0);
    });

    it('should calculate correct diagonal normal', () => {
      const bulletX = 110;  // Bullet to upper-right
      const bulletY = 90;
      const enemyX = 100;
      const enemyY = 100;

      const normal = calculateEnemyReflectionNormal(bulletX, bulletY, enemyX, enemyY);

      // Normal should point upper-right (positive x, negative y)
      expect(normal.x).toBeGreaterThan(0);
      expect(normal.y).toBeLessThan(0);

      // Should be unit vector
      const magnitude = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
      expect(magnitude).toBeCloseTo(1);
    });
  });

  describe('bullet offset from enemy', () => {
    it('should offset bullet away from enemy center', () => {
      const enemyX = 100;
      const enemyY = 100;
      const bulletX = 80;  // Bullet approaching from left
      const bulletY = 100;

      const normal = calculateEnemyReflectionNormal(bulletX, bulletY, enemyX, enemyY);

      // Calculate expected offset position (using same logic as offsetBulletFromEnemy)
      const offsetDistance = BOUNCE_OFFSET + 5;
      const expectedX = enemyX + normal.x * offsetDistance;
      const expectedY = enemyY + normal.y * offsetDistance;

      // Offset position should be further from enemy than bullet was
      expect(expectedX).toBeLessThan(enemyX);
      expect(expectedY).toBeCloseTo(enemyY);
    });
  });
});
