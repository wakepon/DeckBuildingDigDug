import { Container, Graphics } from 'pixi.js';
import {
  GRID_COLS,
  GRID_ROWS,
  TILE_SIZE,
  WALL_COLORS,
  PLAYER_SPAWN_CENTER_X,
  PLAYER_SPAWN_CENTER_Y,
  PLAYER_SPAWN_RADIUS,
} from './constants';

interface Wall {
  hp: number;
  graphics: Graphics;
}

export class WallManager {
  public container: Container;
  private walls: (Wall | null)[][];

  constructor() {
    this.container = new Container();
    this.walls = [];
    this.initializeWalls();
  }

  private initializeWalls(): void {
    for (let y = 0; y < GRID_ROWS; y++) {
      this.walls[y] = [];
      for (let x = 0; x < GRID_COLS; x++) {
        // Check if this position is in the player spawn area
        if (this.isPlayerSpawnArea(x, y)) {
          this.walls[y][x] = null;
          continue;
        }

        // Create wall with random HP (1-3)
        const hp = Math.floor(Math.random() * 3) + 1;
        const wall = this.createWall(x, y, hp);
        this.walls[y][x] = wall;
      }
    }
  }

  private isPlayerSpawnArea(x: number, y: number): boolean {
    const dx = Math.abs(x - PLAYER_SPAWN_CENTER_X);
    const dy = Math.abs(y - PLAYER_SPAWN_CENTER_Y);
    return dx <= PLAYER_SPAWN_RADIUS && dy <= PLAYER_SPAWN_RADIUS;
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
    const color = WALL_COLORS[hp] || WALL_COLORS[1];
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
    return WALL_COLORS[wall.hp] || WALL_COLORS[1];
  }

  public damageWall(x: number, y: number, damage: number): boolean {
    const wall = this.getWall(x, y);
    if (!wall) return false;

    wall.hp -= damage;

    if (wall.hp <= 0) {
      // Destroy wall
      this.container.removeChild(wall.graphics);
      wall.graphics.destroy();
      this.walls[y][x] = null;
      return true; // Wall destroyed
    } else {
      // Update wall appearance
      this.drawWall(wall.graphics, wall.hp);
      return false; // Wall damaged but not destroyed
    }
  }

  public update(): void {
    // Future: Add wall animations, effects, etc.
  }
}
