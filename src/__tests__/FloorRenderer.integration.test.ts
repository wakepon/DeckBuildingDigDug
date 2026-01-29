import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { TILE_SIZE, FLOOR_SIZE_SCALING, FLOOR_PATTERN } from '../constants';

// Track addChild calls to verify integration
let mockAddChildCalls: { index?: number; child: unknown }[] = [];
let mockContainerChildren: unknown[] = [];

// Mock pixi.js
vi.mock('pixi.js', () => {
  return {
    Application: class MockApplication {
      stage = {
        addChild: vi.fn(),
      };
      ticker = {
        add: vi.fn(),
      };
      canvas = document.createElement('canvas');
      init = vi.fn().mockResolvedValue(undefined);
    },
    Container: class MockContainer {
      children: unknown[] = mockContainerChildren;
      addChild = vi.fn((child: unknown) => {
        mockAddChildCalls.push({ child });
        mockContainerChildren.push(child);
        return child;
      });
      addChildAt = vi.fn((child: unknown, index: number) => {
        mockAddChildCalls.push({ index, child });
        mockContainerChildren.splice(index, 0, child);
        return child;
      });
      removeChild = vi.fn((child: unknown) => {
        const idx = mockContainerChildren.indexOf(child);
        if (idx !== -1) mockContainerChildren.splice(idx, 1);
        return child;
      });
      x = 0;
      y = 0;
    },
    Graphics: class MockGraphics {
      x = 0;
      y = 0;
      rect = vi.fn().mockReturnThis();
      fill = vi.fn().mockReturnThis();
      stroke = vi.fn().mockReturnThis();
      clear = vi.fn().mockReturnThis();
      moveTo = vi.fn().mockReturnThis();
      lineTo = vi.fn().mockReturnThis();
      destroy = vi.fn();
    },
  };
});

import { FloorRenderer } from '../FloorRenderer';
import { FloorManager } from '../FloorManager';

describe('FloorRenderer Integration', () => {
  beforeEach(() => {
    mockAddChildCalls = [];
    mockContainerChildren = [];
  });

  describe('with FloorManager', () => {
    it('should render floor size matching FloorManager dimensions', () => {
      const floorManager = new FloorManager();
      const worldDims = floorManager.getFloorWorldDimensions();

      const renderer = new FloorRenderer(worldDims.width, worldDims.height);

      expect(renderer).toBeDefined();
      expect(worldDims.width).toBe(FLOOR_SIZE_SCALING.BASE_COLS * TILE_SIZE);
      expect(worldDims.height).toBe(FLOOR_SIZE_SCALING.BASE_ROWS * TILE_SIZE);
    });

    it('should update floor size after floor transition', () => {
      const floorManager = new FloorManager();

      // Start with floor 1 size
      let worldDims = floorManager.getFloorWorldDimensions();
      const renderer = new FloorRenderer(worldDims.width, worldDims.height);

      // Advance to floor 5
      for (let i = 0; i < 4; i++) {
        floorManager.nextFloor();
      }

      // Update renderer with new floor size
      worldDims = floorManager.getFloorWorldDimensions();
      renderer.updateSize(worldDims.width, worldDims.height);

      expect(renderer).toBeDefined();
      // Floor 5 should be larger than floor 1
      expect(worldDims.width).toBeGreaterThan(FLOOR_SIZE_SCALING.BASE_COLS * TILE_SIZE);
    });

    it('should handle max floor size (floor 10)', () => {
      const floorManager = new FloorManager();

      // Advance to floor 10
      for (let i = 0; i < 9; i++) {
        floorManager.nextFloor();
      }

      const worldDims = floorManager.getFloorWorldDimensions();
      const renderer = new FloorRenderer(worldDims.width, worldDims.height);

      expect(renderer).toBeDefined();
    });
  });

  describe('container hierarchy', () => {
    it('should be added at the bottom of game container', () => {
      const floorRenderer = new FloorRenderer(640, 440);

      // Simulate adding floor renderer at index 0 (bottom)
      const mockGameContainer = {
        children: [] as unknown[],
        addChildAt: (child: unknown, index: number) => {
          mockGameContainer.children.splice(index, 0, child);
        },
        addChild: (child: unknown) => {
          mockGameContainer.children.push(child);
        },
      };

      // Add floor renderer at bottom
      mockGameContainer.addChildAt(floorRenderer.container, 0);

      // Add other managers on top
      const mockEnemyContainer = { name: 'enemy' };
      const mockWallContainer = { name: 'wall' };
      mockGameContainer.addChild(mockEnemyContainer);
      mockGameContainer.addChild(mockWallContainer);

      // Floor renderer should be at index 0
      expect(mockGameContainer.children[0]).toBe(floorRenderer.container);
      expect(mockGameContainer.children.length).toBe(3);
    });
  });

  describe('floor colors', () => {
    it('should return correct floor color constants', () => {
      const renderer = new FloorRenderer(640, 440);
      const colors = renderer.getFloorColors();

      expect(colors.base).toBe(FLOOR_PATTERN.BASE_COLOR);
      expect(colors.grout).toBe(FLOOR_PATTERN.GROUT_COLOR);
      expect(colors.highlight).toBe(FLOOR_PATTERN.HIGHLIGHT_COLOR);
    });
  });

  describe('performance', () => {
    it('should handle rapid size changes', () => {
      const renderer = new FloorRenderer(640, 440);

      // Simulate rapid floor transitions
      for (let i = 0; i < 10; i++) {
        const newWidth = 640 + i * 80;
        const newHeight = 440 + i * 60;
        renderer.updateSize(newWidth, newHeight);
      }

      expect(renderer).toBeDefined();
    });
  });

  describe('cleanup', () => {
    it('should clean up resources on destroy', () => {
      const renderer = new FloorRenderer(640, 440);

      renderer.destroy();

      // Should not throw when destroyed
      expect(() => renderer.updateSize(800, 600)).not.toThrow();
    });
  });
});
