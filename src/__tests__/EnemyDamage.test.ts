import { describe, it, expect } from 'vitest';
import {
  ENEMY_DAMAGE,
  ELITE_DAMAGE,
} from '../constants';

describe('Enemy Damage Constants', () => {
  describe('ENEMY_DAMAGE', () => {
    it('should be 2', () => {
      expect(ENEMY_DAMAGE).toBe(2);
    });

    it('should be a positive integer', () => {
      expect(ENEMY_DAMAGE).toBeGreaterThan(0);
      expect(Number.isInteger(ENEMY_DAMAGE)).toBe(true);
    });
  });

  describe('ELITE_DAMAGE', () => {
    it('should be 8', () => {
      expect(ELITE_DAMAGE).toBe(8);
    });

    it('should be a positive integer', () => {
      expect(ELITE_DAMAGE).toBeGreaterThan(0);
      expect(Number.isInteger(ELITE_DAMAGE)).toBe(true);
    });

    it('should be 4 times ENEMY_DAMAGE', () => {
      expect(ELITE_DAMAGE).toBe(ENEMY_DAMAGE * 4);
    });
  });

  describe('Damage ratio', () => {
    it('elite damage should be greater than normal enemy damage', () => {
      expect(ELITE_DAMAGE).toBeGreaterThan(ENEMY_DAMAGE);
    });
  });
});
