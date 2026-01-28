import { describe, it, expect, beforeEach } from 'vitest';
import { PlayerStats } from '../PlayerStats';
import { AUTO_AIM_DEFAULT_ENABLED } from '../constants';

describe('PlayerStats - Auto-aim functionality', () => {
  let playerStats: PlayerStats;

  beforeEach(() => {
    playerStats = new PlayerStats();
  });

  describe('autoAimEnabled property', () => {
    it('should have auto-aim set to default value from constants', () => {
      expect(playerStats.autoAimEnabled).toBe(AUTO_AIM_DEFAULT_ENABLED);
    });
  });

  describe('setAutoAimEnabled', () => {
    it('should enable auto-aim when called with true', () => {
      playerStats.setAutoAimEnabled(true);
      expect(playerStats.autoAimEnabled).toBe(true);
    });

    it('should disable auto-aim when called with false', () => {
      playerStats.setAutoAimEnabled(true);
      playerStats.setAutoAimEnabled(false);
      expect(playerStats.autoAimEnabled).toBe(false);
    });
  });

  describe('toggleAutoAim', () => {
    it('should toggle auto-aim from default to opposite', () => {
      const initialState = playerStats.autoAimEnabled;
      const result = playerStats.toggleAutoAim();
      expect(result).toBe(!initialState);
      expect(playerStats.autoAimEnabled).toBe(!initialState);
    });

    it('should toggle from enabled to disabled', () => {
      playerStats.setAutoAimEnabled(true);
      const result = playerStats.toggleAutoAim();
      expect(result).toBe(false);
      expect(playerStats.autoAimEnabled).toBe(false);
    });

    it('should toggle from disabled to enabled', () => {
      playerStats.setAutoAimEnabled(false);
      const result = playerStats.toggleAutoAim();
      expect(result).toBe(true);
      expect(playerStats.autoAimEnabled).toBe(true);
    });
  });

  describe('reset', () => {
    it('should reset auto-aim to default value', () => {
      // Change from default
      playerStats.setAutoAimEnabled(!AUTO_AIM_DEFAULT_ENABLED);
      expect(playerStats.autoAimEnabled).toBe(!AUTO_AIM_DEFAULT_ENABLED);

      // Reset
      playerStats.reset();
      expect(playerStats.autoAimEnabled).toBe(AUTO_AIM_DEFAULT_ENABLED);
    });
  });
});
