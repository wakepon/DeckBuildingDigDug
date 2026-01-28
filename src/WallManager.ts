import { Container, Graphics } from 'pixi.js';
import {
  GRID_COLS,
  GRID_ROWS,
  TILE_SIZE,
  WALL_COLORS,
  WALL_HP_SCALING,
  PLAYER_SPAWN_CENTER_X,
  PLAYER_SPAWN_CENTER_Y,
  PLAYER_SPAWN_RADIUS,
  STAIRS_MIN_DISTANCE,
} from './constants';
import { FloorManager } from './FloorManager';

interface Wall {
  hp: number;
  graphics: Graphics;
}

export class WallManager {
  public container: Container;
  private walls: (Wall | null)[][];
  private _stairsPosition: { x: number; y: number } = { x: 0, y: 0 };
  private floorManager: FloorManager | null = null;

  constructor(floorManager?: FloorManager) {
    this.container = new Container();
    this.walls = [];
    this.floorManager = floorManager || null;
    this.initializeWalls();
  }

  private initializeWalls(): void {
    // Generate stairs position first
    this._stairsPosition = this.generateStairsPosition();

    for (let y = 0; y < GRID_ROWS; y++) {
      this.walls[y] = [];
      for (let x = 0; x < GRID_COLS; x++) {
        // Check if this position is in the player spawn area
        if (this.isPlayerSpawnArea(x, y)) {
          this.walls[y][x] = null;
          continue;
        }

        // Create wall with HP based on floor distribution
        const hp = this.generateWallHP();
        const wall = this.createWall(x, y, hp);
        this.walls[y][x] = wall;
      }
    }
  }

  private generateStairsPosition(): { x: number; y: number } {
    const validPositions: { x: number; y: number }[] = [];

    for (let y = 0; y < GRID_ROWS; y++) {
      for (let x = 0; x < GRID_COLS; x++) {
        // Must not be in spawn area
        if (this.isPlayerSpawnArea(x, y)) continue;

        // Must be at least STAIRS_MIN_DISTANCE away from spawn center
        const dx = Math.abs(x - PLAYER_SPAWN_CENTER_X);
        const dy = Math.abs(y - PLAYER_SPAWN_CENTER_Y);
        const manhattanDist = dx + dy;

        if (manhattanDist >= STAIRS_MIN_DISTANCE) {
          validPositions.push({ x, y });
        }
      }
    }

    // Pick random position
    if (validPositions.length > 0) {
      return validPositions[Math.floor(Math.random() * validPositions.length)];
    }

    // Fallback: far corner
    return { x: GRID_COLS - 2, y: GRID_ROWS - 2 };
  }

  private isPlayerSpawnArea(x: number, y: number): boolean {
    const dx = Math.abs(x - PLAYER_SPAWN_CENTER_X);
    const dy = Math.abs(y - PLAYER_SPAWN_CENTER_Y);
    return dx <= PLAYER_SPAWN_RADIUS && dy <= PLAYER_SPAWN_RADIUS;
  }

  private clampHP(hp: number): number {
    return Math.max(WALL_HP_SCALING.MIN_HP, Math.min(WALL_HP_SCALING.MAX_HP, Math.floor(hp)));
  }

  private getWallColorForHP(hp: number): number {
    const clampedHP = this.clampHP(hp);
    return WALL_COLORS[clampedHP] ?? WALL_COLORS[WALL_HP_SCALING.MIN_HP];
  }

  private createWall(gridX: number, gridY: number, hp: number): Wall {
    const graphics = new Graphics();
    this.drawWall(graphics, hp);

    graphics.x = gridX * TILE_SIZE;
    graphics.y = gridY * TILE_SIZE;

    this.container.addChild(graphics);

    return { hp, graphics };
  }

  private drawWall(graphics: Graphics, hp: number): void {
    const color = this.getWallColorForHP(hp);
    const padding = 1;

    graphics.clear();

    // Draw wall rectangle with slight padding for grid effect
    graphics.rect(padding, padding, TILE_SIZE - padding * 2, TILE_SIZE - padding * 2);
    graphics.fill(color);

    // Add border for depth effect
    graphics.rect(padding, padding, TILE_SIZE - padding * 2, TILE_SIZE - padding * 2);
    graphics.stroke({ width: 1, color: 0x000000, alpha: 0.3 });

    // Add highlight on top-left for 3D effect
    graphics.moveTo(padding + 2, TILE_SIZE - padding - 2);
    graphics.lineTo(padding + 2, padding + 2);
    graphics.lineTo(TILE_SIZE - padding - 2, padding + 2);
    graphics.stroke({ width: 2, color: 0xffffff, alpha: 0.2 });
  }

  public getWall(x: number, y: number): Wall | null {
    if (x < 0 || x >= GRID_COLS || y < 0 || y >= GRID_ROWS) {
      return null;
    }
    return this.walls[y][x];
  }

  public getWallColor(x: number, y: number): number | null {
    const wall = this.getWall(x, y);
    if (!wall) return null;
    return this.getWallColorForHP(wall.hp);
  }

  public damageWall(x: number, y: number, damage: number): boolean {
    const wall = this.getWall(x, y);
    if (!wall) return false;

    const newHp = wall.hp - damage;

    if (newHp <= 0) {
      // Destroy wall
      this.container.removeChild(wall.graphics);
      wall.graphics.destroy();
      this.walls[y][x] = null;
      return true; // Wall destroyed
    } else {
      // Update wall appearance with new HP
      this.drawWall(wall.graphics, newHp);
      // Update wall object immutably
      this.walls[y][x] = { hp: newHp, graphics: wall.graphics };
      return false; // Wall damaged but not destroyed
    }
  }

  public get stairsPosition(): { x: number; y: number } {
    return this._stairsPosition;
  }

  public isStairsPosition(gridX: number, gridY: number): boolean {
    return this._stairsPosition.x === gridX && this._stairsPosition.y === gridY;
  }

  public reset(): void {
    // Clear all walls
    for (let y = 0; y < GRID_ROWS; y++) {
      for (let x = 0; x < GRID_COLS; x++) {
        const wall = this.walls[y]?.[x];
        if (wall) {
          this.container.removeChild(wall.graphics);
          wall.graphics.destroy();
        }
      }
    }
    this.walls = [];

    // Reinitialize
    this.initializeWalls();
  }

  public update(): void {
    // Future: Add wall animations, effects, etc.
  }

  private generateWallHP(): number {
    if (this.floorManager) {
      return this.floorManager.generateWallHP();
    }
    // Fallback to original behavior (HP 1-3)
    return Math.floor(Math.random() * 3) + 1;
  }

  public setFloorManager(floorManager: FloorManager): void {
    this.floorManager = floorManager;
  }
}
