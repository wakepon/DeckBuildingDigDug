// Game screen dimensions
export const SCREEN_WIDTH = 800;
export const SCREEN_HEIGHT = 600;

// Grid settings
export const TILE_SIZE = 40;
export const GRID_COLS = 20;
export const GRID_ROWS = 15;

// Wall HP colors (higher HP = darker/stronger color)
export const WALL_COLORS: Record<number, number> = {
  1: 0x8B4513,  // Light brown - weak wall
  2: 0x654321,  // Medium brown - medium wall
  3: 0x3D2914,  // Dark brown - strong wall
};

// Player spawn area (3x3 in center)
export const PLAYER_SPAWN_CENTER_X = Math.floor(GRID_COLS / 2);
export const PLAYER_SPAWN_CENTER_Y = Math.floor(GRID_ROWS / 2);
export const PLAYER_SPAWN_RADIUS = 1; // Creates 3x3 area
