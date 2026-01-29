import { describe, it, expect } from 'vitest';
import {
  FloorSizeConfig,
  validateFloorSizeConfig,
  createFloorSizeConfig,
  DEFAULT_FLOOR_SIZE_CONFIG,
} from '../constants';

describe('FloorSizeConfig', () => {
  describe('DEFAULT_FLOOR_SIZE_CONFIG', () => {
    it('should be defined and match FLOOR_SIZE_SCALING values', () => {
      expect(DEFAULT_FLOOR_SIZE_CONFIG).toBeDefined();
      expect(DEFAULT_FLOOR_SIZE_CONFIG.baseCols).toBe(13);
      expect(DEFAULT_FLOOR_SIZE_CONFIG.baseRows).toBe(9);
      expect(DEFAULT_FLOOR_SIZE_CONFIG.maxCols).toBe(40);
      expect(DEFAULT_FLOOR_SIZE_CONFIG.maxRows).toBe(30);
      expect(DEFAULT_FLOOR_SIZE_CONFIG.maxFloorForScaling).toBe(10);
    });

    it('should have colsPerFloor calculated correctly', () => {
      // (40 - 13) / 9 = 27/9
      expect(DEFAULT_FLOOR_SIZE_CONFIG.colsPerFloor).toBeCloseTo(27 / 9, 5);
    });

    it('should have rowsPerFloor calculated correctly', () => {
      // (30 - 9) / 9 = 21/9
      expect(DEFAULT_FLOOR_SIZE_CONFIG.rowsPerFloor).toBeCloseTo(21 / 9, 5);
    });
  });

  describe('validateFloorSizeConfig', () => {
    describe('valid configurations', () => {
      it('should accept valid configuration with all required fields', () => {
        const config: FloorSizeConfig = {
          baseCols: 10,
          baseRows: 8,
          maxCols: 30,
          maxRows: 20,
          colsPerFloor: 2,
          rowsPerFloor: 1.5,
          maxFloorForScaling: 10,
        };

        expect(() => validateFloorSizeConfig(config)).not.toThrow();
        expect(validateFloorSizeConfig(config)).toBe(true);
      });

      it('should accept DEFAULT_FLOOR_SIZE_CONFIG', () => {
        expect(() => validateFloorSizeConfig(DEFAULT_FLOOR_SIZE_CONFIG)).not.toThrow();
        expect(validateFloorSizeConfig(DEFAULT_FLOOR_SIZE_CONFIG)).toBe(true);
      });

      it('should accept configuration where base equals max', () => {
        const config: FloorSizeConfig = {
          baseCols: 20,
          baseRows: 15,
          maxCols: 20,
          maxRows: 15,
          colsPerFloor: 0,
          rowsPerFloor: 0,
          maxFloorForScaling: 1,
        };

        expect(validateFloorSizeConfig(config)).toBe(true);
      });
    });

    describe('invalid configurations - negative values', () => {
      it('should reject negative baseCols', () => {
        const config: FloorSizeConfig = {
          baseCols: -5,
          baseRows: 8,
          maxCols: 30,
          maxRows: 20,
          colsPerFloor: 2,
          rowsPerFloor: 1.5,
          maxFloorForScaling: 10,
        };

        expect(() => validateFloorSizeConfig(config)).toThrow('baseCols must be positive');
      });

      it('should reject negative baseRows', () => {
        const config: FloorSizeConfig = {
          baseCols: 10,
          baseRows: -8,
          maxCols: 30,
          maxRows: 20,
          colsPerFloor: 2,
          rowsPerFloor: 1.5,
          maxFloorForScaling: 10,
        };

        expect(() => validateFloorSizeConfig(config)).toThrow('baseRows must be positive');
      });

      it('should reject negative maxCols', () => {
        const config: FloorSizeConfig = {
          baseCols: 10,
          baseRows: 8,
          maxCols: -30,
          maxRows: 20,
          colsPerFloor: 2,
          rowsPerFloor: 1.5,
          maxFloorForScaling: 10,
        };

        expect(() => validateFloorSizeConfig(config)).toThrow('maxCols must be positive');
      });

      it('should reject negative maxRows', () => {
        const config: FloorSizeConfig = {
          baseCols: 10,
          baseRows: 8,
          maxCols: 30,
          maxRows: -20,
          colsPerFloor: 2,
          rowsPerFloor: 1.5,
          maxFloorForScaling: 10,
        };

        expect(() => validateFloorSizeConfig(config)).toThrow('maxRows must be positive');
      });

      it('should reject negative colsPerFloor', () => {
        const config: FloorSizeConfig = {
          baseCols: 10,
          baseRows: 8,
          maxCols: 30,
          maxRows: 20,
          colsPerFloor: -2,
          rowsPerFloor: 1.5,
          maxFloorForScaling: 10,
        };

        expect(() => validateFloorSizeConfig(config)).toThrow('colsPerFloor must be non-negative');
      });

      it('should reject negative rowsPerFloor', () => {
        const config: FloorSizeConfig = {
          baseCols: 10,
          baseRows: 8,
          maxCols: 30,
          maxRows: 20,
          colsPerFloor: 2,
          rowsPerFloor: -1.5,
          maxFloorForScaling: 10,
        };

        expect(() => validateFloorSizeConfig(config)).toThrow('rowsPerFloor must be non-negative');
      });

      it('should reject non-positive maxFloorForScaling', () => {
        const config: FloorSizeConfig = {
          baseCols: 10,
          baseRows: 8,
          maxCols: 30,
          maxRows: 20,
          colsPerFloor: 2,
          rowsPerFloor: 1.5,
          maxFloorForScaling: 0,
        };

        expect(() => validateFloorSizeConfig(config)).toThrow('maxFloorForScaling must be positive');
      });
    });

    describe('invalid configurations - base exceeds max', () => {
      it('should reject baseCols greater than maxCols', () => {
        const config: FloorSizeConfig = {
          baseCols: 50,
          baseRows: 8,
          maxCols: 30,
          maxRows: 20,
          colsPerFloor: 2,
          rowsPerFloor: 1.5,
          maxFloorForScaling: 10,
        };

        expect(() => validateFloorSizeConfig(config)).toThrow('baseCols cannot exceed maxCols');
      });

      it('should reject baseRows greater than maxRows', () => {
        const config: FloorSizeConfig = {
          baseCols: 10,
          baseRows: 25,
          maxCols: 30,
          maxRows: 20,
          colsPerFloor: 2,
          rowsPerFloor: 1.5,
          maxFloorForScaling: 10,
        };

        expect(() => validateFloorSizeConfig(config)).toThrow('baseRows cannot exceed maxRows');
      });
    });

    describe('invalid configurations - zero values', () => {
      it('should reject zero baseCols', () => {
        const config: FloorSizeConfig = {
          baseCols: 0,
          baseRows: 8,
          maxCols: 30,
          maxRows: 20,
          colsPerFloor: 2,
          rowsPerFloor: 1.5,
          maxFloorForScaling: 10,
        };

        expect(() => validateFloorSizeConfig(config)).toThrow('baseCols must be positive');
      });

      it('should reject zero baseRows', () => {
        const config: FloorSizeConfig = {
          baseCols: 10,
          baseRows: 0,
          maxCols: 30,
          maxRows: 20,
          colsPerFloor: 2,
          rowsPerFloor: 1.5,
          maxFloorForScaling: 10,
        };

        expect(() => validateFloorSizeConfig(config)).toThrow('baseRows must be positive');
      });
    });

    describe('invalid configurations - non-integer floors', () => {
      it('should reject non-integer maxFloorForScaling', () => {
        const config: FloorSizeConfig = {
          baseCols: 10,
          baseRows: 8,
          maxCols: 30,
          maxRows: 20,
          colsPerFloor: 2,
          rowsPerFloor: 1.5,
          maxFloorForScaling: 5.5,
        };

        expect(() => validateFloorSizeConfig(config)).toThrow('maxFloorForScaling must be an integer');
      });
    });
  });

  describe('createFloorSizeConfig', () => {
    describe('with no parameters', () => {
      it('should return default configuration', () => {
        const config = createFloorSizeConfig();

        expect(config).toEqual(DEFAULT_FLOOR_SIZE_CONFIG);
      });
    });

    describe('with partial parameters', () => {
      it('should override only provided fields', () => {
        const config = createFloorSizeConfig({
          baseCols: 20,
        });

        expect(config.baseCols).toBe(20);
        expect(config.baseRows).toBe(DEFAULT_FLOOR_SIZE_CONFIG.baseRows);
        expect(config.maxCols).toBe(DEFAULT_FLOOR_SIZE_CONFIG.maxCols);
      });

      it('should allow overriding multiple fields', () => {
        const config = createFloorSizeConfig({
          baseCols: 20,
          baseRows: 15,
          maxFloorForScaling: 5,
        });

        expect(config.baseCols).toBe(20);
        expect(config.baseRows).toBe(15);
        expect(config.maxFloorForScaling).toBe(5);
      });
    });

    describe('with full parameters', () => {
      it('should use all provided values', () => {
        const customConfig = {
          baseCols: 12,
          baseRows: 9,
          maxCols: 24,
          maxRows: 18,
          colsPerFloor: 3,
          rowsPerFloor: 2,
          maxFloorForScaling: 5,
        };

        const config = createFloorSizeConfig(customConfig);

        expect(config).toEqual(customConfig);
      });
    });

    describe('validation integration', () => {
      it('should throw for invalid configurations', () => {
        expect(() => createFloorSizeConfig({
          baseCols: -10,
        })).toThrow();
      });

      it('should throw when baseCols exceeds maxCols after merge', () => {
        expect(() => createFloorSizeConfig({
          baseCols: 50,
        })).toThrow('baseCols cannot exceed maxCols');
      });
    });

    describe('immutability', () => {
      it('should return a new object, not modify defaults', () => {
        const config1 = createFloorSizeConfig({ baseCols: 20 });
        const config2 = createFloorSizeConfig();

        expect(config1.baseCols).toBe(20);
        expect(config2.baseCols).toBe(13);
        expect(DEFAULT_FLOOR_SIZE_CONFIG.baseCols).toBe(13);
      });

      it('should not share references with input object', () => {
        const input = { baseCols: 20 };
        const config = createFloorSizeConfig(input);

        // Modify input should not affect config
        input.baseCols = 99;
        expect(config.baseCols).toBe(20);
      });
    });
  });

  describe('FloorSizeConfig interface', () => {
    it('should have all required properties', () => {
      const config: FloorSizeConfig = {
        baseCols: 10,
        baseRows: 8,
        maxCols: 30,
        maxRows: 20,
        colsPerFloor: 2,
        rowsPerFloor: 1.5,
        maxFloorForScaling: 10,
      };

      // TypeScript compile-time check - all properties exist
      expect(typeof config.baseCols).toBe('number');
      expect(typeof config.baseRows).toBe('number');
      expect(typeof config.maxCols).toBe('number');
      expect(typeof config.maxRows).toBe('number');
      expect(typeof config.colsPerFloor).toBe('number');
      expect(typeof config.rowsPerFloor).toBe('number');
      expect(typeof config.maxFloorForScaling).toBe('number');
    });
  });
});
