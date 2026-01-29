// Game screen dimensions
export const SCREEN_WIDTH = 800;
export const SCREEN_HEIGHT = 600;

// Grid settings
export const TILE_SIZE = 40;
export const GRID_COLS = 40;
export const GRID_ROWS = 30;

// World dimensions (in pixels)
export const WORLD_WIDTH = GRID_COLS * TILE_SIZE;
export const WORLD_HEIGHT = GRID_ROWS * TILE_SIZE;

// Outer wall settings (indestructible boundary walls)
export const OUTER_WALL_HP = -1; // Special value for indestructible walls
export const OUTER_WALL_COLOR = 0x0A0A14; // Very dark (almost black) - permanent boundary

// Wall HP colors (higher HP = darker/stronger color)
export const WALL_COLORS: Record<number, number> = {
  [OUTER_WALL_HP]: OUTER_WALL_COLOR, // Outer wall (indestructible)
  1: 0x8B4513,  // Light brown - weak wall
  2: 0x654321,  // Medium brown - medium wall
  3: 0x3D2914,  // Dark brown - strong wall
  4: 0x4A5568,  // Gray - reinforced wall
  5: 0x2D3748,  // Dark gray - steel wall
  6: 0x1A365D,  // Dark blue - iron wall
  7: 0x553C9A,  // Purple - hardened wall
  8: 0x702459,  // Dark magenta - fortified wall
  9: 0x7B341E,  // Dark red-brown - bedrock wall
  10: 0x1A1A2E, // Near black - obsidian wall
};

// Wall HP scaling constants
export const WALL_HP_SCALING = {
  MIN_HP: 1,
  MAX_HP: 10,
  BASE_MAX_HP: 3,           // Base max HP on floors 1-4
  HP4_VALUE: 4,             // Starting HP value at floor 5
  HP4_FLOOR_THRESHOLD: 5,   // HP 4+ walls start appearing at floor 5
  HP10_FLOOR_THRESHOLD: 10, // HP 10 walls available by floor 10
  HP_SCALING_NUMERATOR: 6,  // HP scaling numerator (6 HP levels)
  HP_SCALING_DENOMINATOR: 5, // HP scaling denominator (5 floor increments)
  HP1_BASE_WEIGHT: 50,      // HP 1 has 50% base weight on floor 1
  HP1_WEIGHT_REDUCTION_PER_FLOOR: 3, // HP 1 weight reduction per floor
  HP1_MAX_WEIGHT_REDUCTION: 30,      // Maximum HP 1 weight reduction
  HIGH_HP_THRESHOLD: 3,     // HP threshold for floor bonus
  HIGH_HP_FLOOR_BONUS: 0.5, // Floor bonus for high HP walls
  MIN_WEIGHT: 1,            // Minimum weight for any HP level
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
export const ENEMY_HP = 1;
export const ENEMY_COLOR = 0xff4444;
export const ENEMY_DAMAGE = 2;
export const ELITE_DAMAGE = 8; // 4x normal enemy damage
export const ENEMY_SPAWN_CHANCE = 0.20; // 20% chance on wall break

// Edge Spawning Settings
export const EDGE_SPAWN_BASE_INTERVAL = 2.0; // Base seconds between spawns
export const EDGE_SPAWN_MIN_INTERVAL = 0.1; // Minimum spawn interval
export const EDGE_SPAWN_INTERVAL_DECAY = 0.95; // Multiply interval by this each spawn
export const EDGE_SPAWN_OFFSET = 50; // Pixels outside screen edge
export const EDGE_SPAWN_MAX_ENEMIES = 200; // Maximum enemies alive

// Elite limits
export const ELITE_MAX_PER_FLOOR = 2; // Max elites per floor

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

// Floor size scaling constants
// Floors start smaller and grow larger as player progresses
export const FLOOR_SIZE_SCALING = {
  BASE_COLS: 13,             // Starting grid columns on floor 1
  BASE_ROWS: 9,              // Starting grid rows on floor 1
  COLS_PER_FLOOR: 27 / 9,    // Additional columns per floor (reaches 40 by floor 10)
  ROWS_PER_FLOOR: 21 / 9,    // Additional rows per floor (reaches 30 by floor 10)
  MAX_FLOOR_FOR_SCALING: 10, // Floor at which max size is reached
};

// FloorSizeConfig interface for configurable floor sizing
export interface FloorSizeConfig {
  readonly baseCols: number;          // Starting grid columns on floor 1
  readonly baseRows: number;          // Starting grid rows on floor 1
  readonly maxCols: number;           // Maximum grid columns
  readonly maxRows: number;           // Maximum grid rows
  readonly colsPerFloor: number;      // Additional columns per floor
  readonly rowsPerFloor: number;      // Additional rows per floor
  readonly maxFloorForScaling: number; // Floor at which max size is reached
}

// Default floor size configuration (matches FLOOR_SIZE_SCALING behavior)
export const DEFAULT_FLOOR_SIZE_CONFIG: FloorSizeConfig = {
  baseCols: FLOOR_SIZE_SCALING.BASE_COLS,
  baseRows: FLOOR_SIZE_SCALING.BASE_ROWS,
  maxCols: GRID_COLS,
  maxRows: GRID_ROWS,
  colsPerFloor: FLOOR_SIZE_SCALING.COLS_PER_FLOOR,
  rowsPerFloor: FLOOR_SIZE_SCALING.ROWS_PER_FLOOR,
  maxFloorForScaling: FLOOR_SIZE_SCALING.MAX_FLOOR_FOR_SCALING,
};

// Validate a FloorSizeConfig
export function validateFloorSizeConfig(config: FloorSizeConfig): boolean {
  if (config.baseCols <= 0) {
    throw new Error('baseCols must be positive');
  }
  if (config.baseRows <= 0) {
    throw new Error('baseRows must be positive');
  }
  if (config.maxCols <= 0) {
    throw new Error('maxCols must be positive');
  }
  if (config.maxRows <= 0) {
    throw new Error('maxRows must be positive');
  }
  if (config.colsPerFloor < 0) {
    throw new Error('colsPerFloor must be non-negative');
  }
  if (config.rowsPerFloor < 0) {
    throw new Error('rowsPerFloor must be non-negative');
  }
  if (config.maxFloorForScaling <= 0) {
    throw new Error('maxFloorForScaling must be positive');
  }
  if (!Number.isInteger(config.maxFloorForScaling)) {
    throw new Error('maxFloorForScaling must be an integer');
  }
  if (config.baseCols > config.maxCols) {
    throw new Error('baseCols cannot exceed maxCols');
  }
  if (config.baseRows > config.maxRows) {
    throw new Error('baseRows cannot exceed maxRows');
  }

  return true;
}

// Factory function to create FloorSizeConfig with defaults
export function createFloorSizeConfig(
  overrides?: Partial<FloorSizeConfig>
): FloorSizeConfig {
  const config: FloorSizeConfig = {
    ...DEFAULT_FLOOR_SIZE_CONFIG,
    ...overrides,
  };

  validateFloorSizeConfig(config);

  return config;
}

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
export const UPGRADE_BOUNCE = 1; // +1 bounce per upgrade
export const UPGRADE_PIERCE_ENEMY = 2; // Pierce 2 enemies per upgrade

// Multi-way shot settings
export const MULTI_WAY_SHOT_ANGLE_SPREAD = (20 * Math.PI) / 180; // 20 degrees in radians

// Bounce settings
export const BOUNCE_OFFSET = 2; // pixels to offset bullet from wall after bounce

// Multi-way shot damage multipliers by level
export const MULTI_WAY_SHOT_DAMAGE_MULTIPLIERS: Record<number, number> = {
  1: 1.0,  // Level 1: 1 bullet, 100% damage
  2: 0.5,  // Level 2: 3 bullets, 50% damage each
  3: 0.4,  // Level 3: 5 bullets, 40% damage each
};

// Multi-way shot bullet counts by level
export const MULTI_WAY_SHOT_BULLET_COUNTS: Record<number, number> = {
  1: 1,  // Level 1: 1 bullet
  2: 3,  // Level 2: 3 bullets (center, +20deg, -20deg)
  3: 5,  // Level 3: 5 bullets (center, +/-20deg, +/-40deg)
};

// Elite enemy settings
export const ELITE_SPAWN_CHANCE = 0.01; // 1% chance on wall break
export const ELITE_HP_MULTIPLIER = 5;
export const ELITE_SIZE_MULTIPLIER = 1.8;
export const ELITE_SPEED_MULTIPLIER = 0.7; // 70% speed of normal enemy
export const ELITE_COLOR = 0xff00ff; // Magenta

// Treasure chest settings
export const CHEST_SIZE = 28;
export const CHEST_COLOR = 0xffd700; // Gold
export const CHEST_MIN_UPGRADES = 1;
export const CHEST_MAX_UPGRADES = 3;

// Auto-aim settings
export const AUTO_AIM_CONE_ANGLE = (60 * Math.PI) / 180; // 60 degrees in radians (30 degrees each side)
export const AUTO_AIM_MAX_RANGE = 400; // Maximum targeting range in pixels
export const AUTO_AIM_TOGGLE_KEY = 'KeyQ'; // Key to toggle auto-aim
export const AUTO_AIM_DEFAULT_ENABLED = false; // Whether auto-aim is enabled by default

// Floor pattern settings (dungeon stone tile pattern)
export const FLOOR_PATTERN = {
  BASE_COLOR: 0x1a1a2e,       // Dark blue-gray base color
  GROUT_COLOR: 0x0d0d1a,      // Darker grout between tiles
  HIGHLIGHT_COLOR: 0x2a2a4e,  // Subtle highlight on tile edges
  GROUT_WIDTH: 2,             // Width of grout lines in pixels
  COLOR_VARIATION: 0x080808,  // Amount of color variation per tile
  HIGHLIGHT_ALPHA: 0.3,       // Alpha for highlight edges
};
