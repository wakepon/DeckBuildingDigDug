import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ENEMY_HP, ELITE_HP_MULTIPLIER } from '../constants';

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

import { EnemyManager } from '../EnemyManager';

describe('EnemyManager HP initialization', () => {
  let enemyManager: EnemyManager;

  beforeEach(() => {
    enemyManager = new EnemyManager();
  });

  describe('Default enemy HP', () => {
    it('should use ENEMY_HP constant (1) as default', () => {
      // Spawn an enemy
      enemyManager.spawnEnemy(100, 100);

      const enemies = enemyManager.getEnemies();
      expect(enemies).toHaveLength(1);

      // Enemy should have HP equal to ENEMY_HP (1)
      expect(enemies[0].hp).toBe(ENEMY_HP);
      expect(enemies[0].hp).toBe(1);
    });

    it('ENEMY_HP constant should be 1', () => {
      expect(ENEMY_HP).toBe(1);
    });
  });

  describe('setEnemyHP', () => {
    it('should allow overriding enemy HP for floor scaling', () => {
      // Set scaled HP (e.g., floor 2: 1 * 1.2 = 2 after ceil)
      enemyManager.setEnemyHP(2);
      enemyManager.spawnEnemy(100, 100);

      const enemies = enemyManager.getEnemies();
      expect(enemies[0].hp).toBe(2);
    });

    it('should allow setting HP to simulate later floors', () => {
      // Floor 6: ceil(1 * (1 + 0.2 * 5)) = ceil(2.0) = 2
      enemyManager.setEnemyHP(2);
      enemyManager.spawnEnemy(200, 200);

      const enemies = enemyManager.getEnemies();
      expect(enemies[0].hp).toBe(2);
    });
  });

  describe('Elite enemy HP', () => {
    it('should use ENEMY_HP * ELITE_HP_MULTIPLIER as elite HP', () => {
      enemyManager.spawnEliteEnemy(100, 100);

      const elites = enemyManager.getEliteEnemies();
      expect(elites).toHaveLength(1);

      // Elite HP should be ENEMY_HP * 5 = 1 * 5 = 5
      const expectedHP = ENEMY_HP * ELITE_HP_MULTIPLIER;
      expect(elites[0].hp).toBe(expectedHP);
      expect(elites[0].hp).toBe(5);
    });

    it('should scale elite HP when base HP is changed', () => {
      // Set scaled HP for floor 2: 2
      enemyManager.setEnemyHP(2);
      enemyManager.spawnEliteEnemy(100, 100);

      const elites = enemyManager.getEliteEnemies();
      // Elite HP should be 2 * 5 = 10
      expect(elites[0].hp).toBe(2 * ELITE_HP_MULTIPLIER);
      expect(elites[0].hp).toBe(10);
    });

    it('ELITE_HP_MULTIPLIER should be 5', () => {
      expect(ELITE_HP_MULTIPLIER).toBe(5);
    });
  });

  describe('Multiple enemies with different HP', () => {
    it('should spawn enemies with current HP setting', () => {
      // Spawn with default HP
      enemyManager.spawnEnemy(100, 100);

      // Change HP and spawn another
      enemyManager.setEnemyHP(3);
      enemyManager.spawnEnemy(200, 200);

      const enemies = enemyManager.getEnemies();
      expect(enemies).toHaveLength(2);
      expect(enemies[0].hp).toBe(1); // Default ENEMY_HP
      expect(enemies[1].hp).toBe(3); // Scaled HP
    });
  });
});
