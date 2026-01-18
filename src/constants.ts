// Game screen dimensions
export const SCREEN_WIDTH = 800;
export const SCREEN_HEIGHT = 600;

// Grid settings
export const TILE_SIZE = 40;
export const GRID_COLS = 20;
export const GRID_ROWS = 15;

// World dimensions (in pixels)
export const WORLD_WIDTH = GRID_COLS * TILE_SIZE;
export const WORLD_HEIGHT = GRID_ROWS * TILE_SIZE;

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

// Player settings
export const PLAYER_SIZE = 30;
export const PLAYER_SPEED = 200; // pixels per second
export const PLAYER_COLOR = 0x00ff88;

// Bullet settings
export const BULLET_SPEED = 500; // pixels per second
export const BULLET_SIZE = 8;
export const BULLET_COLOR = 0xffff00;
export const FIRE_RATE = 0.2; // seconds between shots

// Particle settings (for wall destruction)
export const PARTICLE_COUNT = 12;
export const PARTICLE_SPEED_MIN = 100;
export const PARTICLE_SPEED_MAX = 300;
export const PARTICLE_LIFETIME = 0.5; // seconds
export const PARTICLE_SIZE_MIN = 4;
export const PARTICLE_SIZE_MAX = 10;

// Player combat settings
export const PLAYER_MAX_HP = 100;
export const PLAYER_INVINCIBILITY_TIME = 0.5; // seconds

// Enemy settings
export const ENEMY_SIZE = 24;
export const ENEMY_SPEED = 80; // pixels per second
export const ENEMY_HP = 3;
export const ENEMY_COLOR = 0xff4444;
export const ENEMY_DAMAGE = 1;
export const ENEMY_SPAWN_CHANCE = 0.20; // 20% chance on wall break

// Spawner settings (infinite spawn point)
export const SPAWNER_CHANCE = 0.05; // 5% chance on wall break
export const SPAWNER_INTERVAL = 2.0; // seconds between spawns
export const SPAWNER_MAX_ENEMIES = 5;
export const SPAWNER_DISABLE_RANGE = 60; // pixels - player must get close to disable
export const SPAWNER_SIZE = 30;
export const SPAWNER_COLOR = 0x8800ff;

// Gem settings
export const GEM_SIZE = 12;
export const GEM_COLOR = 0x00ffff;
export const GEM_ATTRACT_RANGE = 100; // pixels
export const GEM_ATTRACT_SPEED = 300; // pixels per second
export const GEM_COLLECT_RANGE = 20; // pixels
export const GEM_EXP_VALUE = 1;

// UI settings
export const UI_BAR_WIDTH = 200;
export const UI_BAR_HEIGHT = 16;
export const UI_PADDING = 10;
