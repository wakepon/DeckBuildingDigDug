import { describe, it, expect } from 'vitest';
import { calculateMultiWayShotDirections } from '../multiWayShotUtils';
import { MULTI_WAY_SHOT_ANGLE_SPREAD } from '../constants';

describe('calculateMultiWayShotDirections', () => {
  describe('single shot (level 1)', () => {
    it('should return single direction for level 1', () => {
      const directions = calculateMultiWayShotDirections(100, 0, 1);
      expect(directions).toHaveLength(1);
    });

    it('should return the original direction for level 1', () => {
      const directions = calculateMultiWayShotDirections(100, 0, 1);
      expect(directions[0].dirX).toBeCloseTo(100, 5);
      expect(directions[0].dirY).toBeCloseTo(0, 5);
    });
  });

  describe('two-way shot (2 bullets)', () => {
    it('should return 2 directions for 2 bullets', () => {
      const directions = calculateMultiWayShotDirections(100, 0, 2);
      expect(directions).toHaveLength(2);
    });

    it('should spread directions symmetrically around the base direction', () => {
      // Shooting to the right (positive X)
      const directions = calculateMultiWayShotDirections(100, 0, 2);
      const halfSpread = MULTI_WAY_SHOT_ANGLE_SPREAD / 2;

      // Direction 1: slightly upward (negative Y in screen coords means up)
      const expectedAngle1 = -halfSpread;
      const expectedDirX1 = Math.cos(expectedAngle1);
      const expectedDirY1 = Math.sin(expectedAngle1);

      // Direction 2: slightly downward
      const expectedAngle2 = halfSpread;
      const expectedDirX2 = Math.cos(expectedAngle2);
      const expectedDirY2 = Math.sin(expectedAngle2);

      // Normalize directions from function
      const dir1Len = Math.sqrt(
        directions[0].dirX ** 2 + directions[0].dirY ** 2
      );
      const dir2Len = Math.sqrt(
        directions[1].dirX ** 2 + directions[1].dirY ** 2
      );

      expect(directions[0].dirX / dir1Len).toBeCloseTo(expectedDirX1, 3);
      expect(directions[0].dirY / dir1Len).toBeCloseTo(expectedDirY1, 3);
      expect(directions[1].dirX / dir2Len).toBeCloseTo(expectedDirX2, 3);
      expect(directions[1].dirY / dir2Len).toBeCloseTo(expectedDirY2, 3);
    });
  });

  describe('three-way shot (3 bullets)', () => {
    it('should return 3 directions for 3 bullets', () => {
      const directions = calculateMultiWayShotDirections(100, 0, 3);
      expect(directions).toHaveLength(3);
    });

    it('should include center direction and two spread directions', () => {
      // Shooting to the right
      const directions = calculateMultiWayShotDirections(100, 0, 3);

      // Center direction should be close to original
      const centerDir = directions[1]; // Middle element
      const centerLen = Math.sqrt(centerDir.dirX ** 2 + centerDir.dirY ** 2);
      expect(centerDir.dirX / centerLen).toBeCloseTo(1, 3);
      expect(centerDir.dirY / centerLen).toBeCloseTo(0, 3);

      // First and last should be spread
      const dir1Len = Math.sqrt(
        directions[0].dirX ** 2 + directions[0].dirY ** 2
      );
      const dir3Len = Math.sqrt(
        directions[2].dirX ** 2 + directions[2].dirY ** 2
      );

      // Directions should be symmetric
      expect(directions[0].dirY / dir1Len).toBeCloseTo(
        -directions[2].dirY / dir3Len,
        3
      );
    });
  });

  describe('five-way shot (5 bullets)', () => {
    it('should return 5 directions for 5 bullets', () => {
      const directions = calculateMultiWayShotDirections(100, 0, 5);
      expect(directions).toHaveLength(5);
    });

    it('should spread directions evenly', () => {
      const directions = calculateMultiWayShotDirections(100, 0, 5);

      // All directions should have same magnitude
      const lengths = directions.map((d) =>
        Math.sqrt(d.dirX ** 2 + d.dirY ** 2)
      );
      const baseLength = lengths[0];
      lengths.forEach((len) => {
        expect(len).toBeCloseTo(baseLength, 3);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle diagonal base direction', () => {
      const directions = calculateMultiWayShotDirections(100, 100, 3);
      expect(directions).toHaveLength(3);

      // Center direction should be 45 degrees
      const centerDir = directions[1];
      const centerLen = Math.sqrt(centerDir.dirX ** 2 + centerDir.dirY ** 2);
      expect(centerDir.dirX / centerLen).toBeCloseTo(
        Math.SQRT1_2,
        3
      );
      expect(centerDir.dirY / centerLen).toBeCloseTo(
        Math.SQRT1_2,
        3
      );
    });

    it('should handle negative direction', () => {
      const directions = calculateMultiWayShotDirections(-100, 0, 2);
      expect(directions).toHaveLength(2);

      // Should still spread around the base direction
      directions.forEach((d) => {
        expect(d.dirX).toBeLessThan(0); // All pointing left
      });
    });

    it('should handle vertical direction', () => {
      const directions = calculateMultiWayShotDirections(0, 100, 3);
      expect(directions).toHaveLength(3);

      // Center should be pointing down
      const centerDir = directions[1];
      const centerLen = Math.sqrt(centerDir.dirX ** 2 + centerDir.dirY ** 2);
      expect(centerDir.dirX / centerLen).toBeCloseTo(0, 3);
      expect(centerDir.dirY / centerLen).toBeCloseTo(1, 3);
    });

    it('should preserve original direction magnitude', () => {
      const baseDirX = 50;
      const baseDirY = 30;
      const baseLen = Math.sqrt(baseDirX ** 2 + baseDirY ** 2);

      const directions = calculateMultiWayShotDirections(baseDirX, baseDirY, 3);

      directions.forEach((d) => {
        const len = Math.sqrt(d.dirX ** 2 + d.dirY ** 2);
        expect(len).toBeCloseTo(baseLen, 3);
      });
    });
  });
});
