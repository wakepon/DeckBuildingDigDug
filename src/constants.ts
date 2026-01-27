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

// Oxygen settings
export const OXYGEN_MAX = 60; // 60 seconds worth
export const OXYGEN_DRAIN_RATE = 1; // per second
export const OXYGEN_WARNING_THRESHOLD = 0.2; // 20%
export const OXYGEN_DAMAGE_RATE = 0.03; // 3% of max HP per second when oxygen is 0

// Stairs settings
export const STAIRS_SIZE = 36;
export const STAIRS_COLOR = 0xffdd00;
export const STAIRS_MIN_DISTANCE = 5; // Minimum wall distance from spawn

// Oxygen Tank settings
export const OXYGEN_TANK_SIZE = 20;
export const OXYGEN_TANK_COLOR = 0x44aaff;
export const OXYGEN_TANK_SPAWN_CHANCE = 0.01; // 1% chance on wall break
export const OXYGEN_TANK_RESTORE = 0.1; // 10% of max oxygen
export const OXYGEN_TANK_INITIAL_COUNT = 4; // Tanks in safe zone at floor start

// Floor scaling settings
export const FLOOR_ENEMY_HP_SCALE = 0.2; // +20% HP per floor
export const FLOOR_ENEMY_SPAWN_SCALE = 0.02; // +2% spawn chance per floor
export const FLOOR_GEM_EXP_SCALE = 0.3; // +30% exp per floor

// Transition settings
export const TRANSITION_DURATION = 0.5; // seconds for fade

// Level-up settings
export const EXP_PER_LEVEL_BASE = 10; // Required EXP = 10 × level
export const UPGRADE_CHOICES = 3; // Number of upgrades to choose from

// Upgrade values
export const UPGRADE_ATTACK_POWER = 0.2; // +20%
export const UPGRADE_ATTACK_SPEED = 0.15; // +15%
export const UPGRADE_BULLET_SIZE = 0.25; // +25%
export const UPGRADE_MOVE_SPEED = 0.1; // +10%
export const UPGRADE_MAX_HP = 20; // +20 HP
export const UPGRADE_OXYGEN_REDUCTION = 0.1; // -10%
export const UPGRADE_PENETRATION = 2; // Penetrate 2 walls
export const UPGRADE_GEM_ATTRACT = 0.5; // +50%
export const UPGRADE_MULTI_WAY_SHOT = 1; // +1 bullet direction per upgrade

// Multi-way shot settings
export const MULTI_WAY_SHOT_ANGLE_SPREAD = (30 * Math.PI) / 180; // 30 degrees in radians

// Elite enemy settings
export const ELITE_SPAWN_CHANCE = 0.01; // 1% chance on wall break
export const ELITE_HP_MULTIPLIER = 5;
export const ELITE_SIZE_MULTIPLIER = 1.8;
export const ELITE_COLOR = 0xff00ff; // Magenta

// Treasure chest settings
export const CHEST_SIZE = 28;
export const CHEST_COLOR = 0xffd700; // Gold
export const CHEST_MIN_UPGRADES = 1;
export const CHEST_MAX_UPGRADES = 3;
