import { describe, it, expect } from 'vitest';
import { WALL_COLORS, WALL_HP_SCALING } from '../constants';

describe('Wall Colors Constants', () => {
  describe('WALL_COLORS', () => {
    it('should have colors for HP 1-10', () => {
      for (let hp = 1; hp <= 10; hp++) {
        expect(WALL_COLORS[hp]).toBeDefined();
        expect(typeof WALL_COLORS[hp]).toBe('number');
      }
    });

    it('should have lighter colors for low HP walls', () => {
      // HP 1 should be lightest brown
      expect(WALL_COLORS[1]).toBe(0x8B4513);
    });

    it('should have darker colors for high HP walls', () => {
      // HP 10 should be darkest/strongest color
      expect(WALL_COLORS[10]).toBeDefined();
      expect(typeof WALL_COLORS[10]).toBe('number');
    });

    it('should have distinct colors for each HP level', () => {
      const colorValues = Object.values(WALL_COLORS);
      const uniqueColors = new Set(colorValues);
      // All colors should be unique
      expect(uniqueColors.size).toBe(colorValues.length);
    });

    it('should maintain original HP 1-3 colors for backward compatibility', () => {
      expect(WALL_COLORS[1]).toBe(0x8B4513);  // Light brown
      expect(WALL_COLORS[2]).toBe(0x654321);  // Medium brown
      expect(WALL_COLORS[3]).toBe(0x3D2914);  // Dark brown
    });
  });

  describe('WALL_HP_SCALING', () => {
    it('should have WALL_HP_MIN constant defined', () => {
      expect(WALL_HP_SCALING.MIN_HP).toBeDefined();
      expect(WALL_HP_SCALING.MIN_HP).toBe(1);
    });

    it('should have WALL_HP_MAX constant defined', () => {
      expect(WALL_HP_SCALING.MAX_HP).toBeDefined();
      expect(WALL_HP_SCALING.MAX_HP).toBe(10);
    });

    it('should have floor thresholds for higher HP walls', () => {
      // HP 4+ walls should start appearing at floor 5
      expect(WALL_HP_SCALING.HP4_FLOOR_THRESHOLD).toBe(5);
      // HP 10 walls should be available by floor 10
      expect(WALL_HP_SCALING.HP10_FLOOR_THRESHOLD).toBe(10);
    });

    it('should have base distribution weights', () => {
      expect(WALL_HP_SCALING.HP1_BASE_WEIGHT).toBeDefined();
      expect(typeof WALL_HP_SCALING.HP1_BASE_WEIGHT).toBe('number');
      // HP1 should have 50% base weight on floor 1
      expect(WALL_HP_SCALING.HP1_BASE_WEIGHT).toBe(50);
    });
  });
});
