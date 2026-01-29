import { describe, it, expect } from 'vitest';
import {
  DEBUG_DISPLAY_TEXT_STYLE,
  DEBUG_DISPLAY_HP_COLORS,
} from '../constants';

describe('Debug Display Constants', () => {
  describe('DEBUG_DISPLAY_TEXT_STYLE', () => {
    it('should have a fontFamily property', () => {
      expect(DEBUG_DISPLAY_TEXT_STYLE.fontFamily).toBeDefined();
      expect(typeof DEBUG_DISPLAY_TEXT_STYLE.fontFamily).toBe('string');
    });

    it('should have a fontSize property', () => {
      expect(DEBUG_DISPLAY_TEXT_STYLE.fontSize).toBeDefined();
      expect(typeof DEBUG_DISPLAY_TEXT_STYLE.fontSize).toBe('number');
    });

    it('should have a reasonable font size for readability', () => {
      expect(DEBUG_DISPLAY_TEXT_STYLE.fontSize).toBeGreaterThanOrEqual(10);
      expect(DEBUG_DISPLAY_TEXT_STYLE.fontSize).toBeLessThanOrEqual(16);
    });

    it('should have a fontWeight property', () => {
      expect(DEBUG_DISPLAY_TEXT_STYLE.fontWeight).toBeDefined();
    });

    it('should have a stroke property for outline effect', () => {
      expect(DEBUG_DISPLAY_TEXT_STYLE.stroke).toBeDefined();
    });

    it('should have a strokeThickness property', () => {
      expect(DEBUG_DISPLAY_TEXT_STYLE.strokeThickness).toBeDefined();
      expect(typeof DEBUG_DISPLAY_TEXT_STYLE.strokeThickness).toBe('number');
    });
  });

  describe('DEBUG_DISPLAY_HP_COLORS', () => {
    it('should have a color for block HP', () => {
      expect(DEBUG_DISPLAY_HP_COLORS.blockHP).toBeDefined();
      expect(typeof DEBUG_DISPLAY_HP_COLORS.blockHP).toBe('number');
    });

    it('should have a color for enemy HP', () => {
      expect(DEBUG_DISPLAY_HP_COLORS.enemyHP).toBeDefined();
      expect(typeof DEBUG_DISPLAY_HP_COLORS.enemyHP).toBe('number');
    });

    it('should have a color for bullet damage', () => {
      expect(DEBUG_DISPLAY_HP_COLORS.bulletDamage).toBeDefined();
      expect(typeof DEBUG_DISPLAY_HP_COLORS.bulletDamage).toBe('number');
    });

    it('should have distinct colors for each type', () => {
      expect(DEBUG_DISPLAY_HP_COLORS.blockHP).not.toBe(DEBUG_DISPLAY_HP_COLORS.enemyHP);
      expect(DEBUG_DISPLAY_HP_COLORS.enemyHP).not.toBe(DEBUG_DISPLAY_HP_COLORS.bulletDamage);
      expect(DEBUG_DISPLAY_HP_COLORS.blockHP).not.toBe(DEBUG_DISPLAY_HP_COLORS.bulletDamage);
    });
  });
});
