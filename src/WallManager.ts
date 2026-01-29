import { Container, Graphics, Text } from 'pixi.js';
import {
  GRID_COLS,
  GRID_ROWS,
  TILE_SIZE,
  WALL_COLORS,
  WALL_HP_SCALING,
  PLAYER_SPAWN_RADIUS,
  STAIRS_MIN_DISTANCE,
  OUTER_WALL_HP,
  OUTER_WALL_COLOR,
  DEBUG_DISPLAY_TEXT_STYLE,
  DEBUG_DISPLAY_HP_COLORS,
} from './constants';
import { FloorManager } from './FloorManager';
import { DebugDisplayManager } from './DebugDisplayManager';

interface Wall {
  hp: number;
  graphics: Graphics;
}

interface GridDimensions {
  cols: number;
  rows: number;
}

interface WorldDimensions {
  width: number;
  height: number;
}

interface SpawnArea {
  centerX: number;
  centerY: number;
  radius: number;
}

export class WallManager {
  public container: Container;
  public hpTextContainer: Container;
  private walls: (Wall | null)[][];
  private _stairsPosition: { x: number; y: number } = { x: 0, y: 0 };
  private floorManager: FloorManager | null = null;
  private _currentGridCols: number;
  private _currentGridRows: number;
  private _spawnCenterX: number;
  private _spawnCenterY: number;
  private debugDisplayManager: DebugDisplayManager | null = null;
  private hpTexts: (Text | null)[][] = [];
  private _isHPTextVisible: boolean = false;

  constructor(floorManager?: FloorManager) {
    this.container = new Container();
    this.hpTextContainer = new Container();
    this.walls = [];
    this.floorManager = floorManager || null;

    // Initialize grid dimensions from floor manager or use defaults
    const dims = this.calculateGridDimensions();
    this._currentGridCols = dims.cols;
    this._currentGridRows = dims.rows;

    // Initialize spawn center
    const spawnCenter = this.calculateSpawnCenter();
    this._spawnCenterX = spawnCenter.x;
    this._spawnCenterY = spawnCenter.y;

    this.initializeWalls();
  }

  private calculateGridDimensions(): GridDimensions {
    if (this.floorManager) {
      return this.floorManager.getFloorGridDimensions();
    }
    // Fallback to max grid size if no floor manager
    return { cols: GRID_COLS, rows: GRID_ROWS };
  }

  private calculateSpawnCenter(): { x: number; y: number } {
    if (this.floorManager) {
      return this.floorManager.getRandomSpawnCenter();
    }
    // Fallback to center of max grid
    return {
      x: Math.floor(GRID_COLS / 2),
      y: Math.floor(GRID_ROWS / 2),
    };
  }

  private initializeWalls(): void {
    // Generate stairs position first
    this._stairsPosition = this.generateStairsPosition();

    for (let y = 0; y < this._currentGridRows; y++) {
      this.walls[y] = [];
      for (let x = 0; x < this._currentGridCols; x++) {
        // Check if this is an outer wall position (indestructible boundary)
        if (this.isOuterWall(x, y)) {
          const wall = this.createWall(x, y, OUTER_WALL_HP);
          this.walls[y][x] = wall;
          continue;
        }

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

    for (let y = 0; y < this._currentGridRows; y++) {
      for (let x = 0; x < this._currentGridCols; x++) {
        // Must not be on outer wall (boundary)
        if (this.isOuterWall(x, y)) continue;

        // Must not be in spawn area
        if (this.isPlayerSpawnArea(x, y)) continue;

        // Must be at least STAIRS_MIN_DISTANCE away from spawn center
        const dx = Math.abs(x - this._spawnCenterX);
        const dy = Math.abs(y - this._spawnCenterY);
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

    // Fallback: position inside outer walls
    return { x: this._currentGridCols - 2, y: this._currentGridRows - 2 };
  }

  private isPlayerSpawnArea(x: number, y: number): boolean {
    const dx = Math.abs(x - this._spawnCenterX);
    const dy = Math.abs(y - this._spawnCenterY);
    return dx <= PLAYER_SPAWN_RADIUS && dy <= PLAYER_SPAWN_RADIUS;
  }

  /**
   * Check if a grid position is on the outer wall (dungeon perimeter)
   */
  public isOuterWall(x: number, y: number): boolean {
    return (
      x === 0 ||
      x === this._currentGridCols - 1 ||
      y === 0 ||
      y === this._currentGridRows - 1
    );
  }

  private clampHP(hp: number): number {
    return Math.max(WALL_HP_SCALING.MIN_HP, Math.min(WALL_HP_SCALING.MAX_HP, Math.floor(hp)));
  }

  private getWallColorForHP(hp: number): number {
    // Handle outer wall special case
    if (hp === OUTER_WALL_HP) {
      return OUTER_WALL_COLOR;
    }
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
    const padding = -1; // Negative padding to overlap walls and prevent gaps

    graphics.clear();

    // Draw wall rectangle with overlap to prevent gaps
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
    if (x < 0 || x >= this._currentGridCols || y < 0 || y >= this._currentGridRows) {
      return null;
    }
    return this.walls[y]?.[x] ?? null;
  }

  public getWallColor(x: number, y: number): number | null {
    const wall = this.getWall(x, y);
    if (!wall) return null;
    return this.getWallColorForHP(wall.hp);
  }

  public damageWall(x: number, y: number, damage: number): boolean {
    const wall = this.getWall(x, y);
    if (!wall) return false;

    // Outer walls are indestructible
    if (wall.hp === OUTER_WALL_HP) {
      return false;
    }

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
    // Clear all walls using current dimensions
    for (let y = 0; y < this._currentGridRows; y++) {
      for (let x = 0; x < this._currentGridCols; x++) {
        const wall = this.walls[y]?.[x];
        if (wall) {
          this.container.removeChild(wall.graphics);
          wall.graphics.destroy();
        }
      }
    }
    this.walls = [];

    // Recalculate grid dimensions from floor manager
    const dims = this.calculateGridDimensions();
    this._currentGridCols = dims.cols;
    this._currentGridRows = dims.rows;

    // Recalculate spawn center
    const spawnCenter = this.calculateSpawnCenter();
    this._spawnCenterX = spawnCenter.x;
    this._spawnCenterY = spawnCenter.y;

    // Reinitialize
    this.initializeWalls();
  }

  public update(): void {
    this.updateHPDisplay();
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

  /**
   * Get center positions of all existing walls (for auto-aim targeting)
   * @returns Array of {x, y} positions in pixel coordinates
   */
  public getWallCenters(): { x: number; y: number }[] {
    const centers: { x: number; y: number }[] = [];

    for (let y = 0; y < this._currentGridRows; y++) {
      for (let x = 0; x < this._currentGridCols; x++) {
        const wall = this.walls[y]?.[x];
        if (wall) {
          centers.push({
            x: (x + 0.5) * TILE_SIZE,
            y: (y + 0.5) * TILE_SIZE,
          });
        }
      }
    }

    return centers;
  }

  /**
   * Get current grid dimensions
   */
  public getGridDimensions(): GridDimensions {
    return {
      cols: this._currentGridCols,
      rows: this._currentGridRows,
    };
  }

  /**
   * Get current world dimensions in pixels
   */
  public getWorldDimensions(): WorldDimensions {
    return {
      width: this._currentGridCols * TILE_SIZE,
      height: this._currentGridRows * TILE_SIZE,
    };
  }

  /**
   * Get spawn area information
   */
  public getSpawnArea(): SpawnArea {
    return {
      centerX: this._spawnCenterX,
      centerY: this._spawnCenterY,
      radius: PLAYER_SPAWN_RADIUS,
    };
  }

  /**
   * Set the DebugDisplayManager for controlling HP overlay visibility
   */
  public setDebugDisplayManager(manager: DebugDisplayManager): void {
    this.debugDisplayManager = manager;
  }

  /**
   * Get the current DebugDisplayManager instance
   */
  public getDebugDisplayManager(): DebugDisplayManager | null {
    return this.debugDisplayManager;
  }

  /**
   * Update HP display text based on debug display state
   */
  private updateHPDisplay(): void {
    const shouldShow = this.debugDisplayManager?.getState().showBlockHP ?? false;

    if (shouldShow && !this._isHPTextVisible) {
      // Create HP text elements for all walls
      this.createHPTexts();
      this._isHPTextVisible = true;
    } else if (!shouldShow && this._isHPTextVisible) {
      // Hide all HP text elements
      this.clearHPTexts();
      this._isHPTextVisible = false;
    } else if (shouldShow) {
      // Update HP text content
      this.updateHPTexts();
    }
  }

  /**
   * Create a single HP text element for a wall
   */
  private createHPTextElement(hp: number, x: number, y: number): Text {
    const hpText = new Text({
      text: String(hp),
      style: {
        fontFamily: DEBUG_DISPLAY_TEXT_STYLE.fontFamily,
        fontSize: DEBUG_DISPLAY_TEXT_STYLE.fontSize,
        fontWeight: DEBUG_DISPLAY_TEXT_STYLE.fontWeight,
        fill: DEBUG_DISPLAY_HP_COLORS.blockHP,
        stroke: {
          color: DEBUG_DISPLAY_TEXT_STYLE.stroke,
          width: DEBUG_DISPLAY_TEXT_STYLE.strokeThickness,
        },
      },
    });
    hpText.anchor.set(0.5, 0.5);
    hpText.x = (x + 0.5) * TILE_SIZE;
    hpText.y = (y + 0.5) * TILE_SIZE;
    return hpText;
  }

  /**
   * Create HP text elements for all walls
   */
  private createHPTexts(): void {
    for (let y = 0; y < this._currentGridRows; y++) {
      if (!this.hpTexts[y]) {
        this.hpTexts[y] = [];
      }
      for (let x = 0; x < this._currentGridCols; x++) {
        const wall = this.walls[y]?.[x];
        if (wall && wall.hp !== OUTER_WALL_HP) {
          const hpText = this.createHPTextElement(wall.hp, x, y);
          this.hpTexts[y][x] = hpText;
          this.hpTextContainer.addChild(hpText);
        } else {
          this.hpTexts[y][x] = null;
        }
      }
    }
  }

  /**
   * Update HP text content for all walls
   */
  private updateHPTexts(): void {
    for (let y = 0; y < this._currentGridRows; y++) {
      for (let x = 0; x < this._currentGridCols; x++) {
        const wall = this.walls[y]?.[x];
        const hpText = this.hpTexts[y]?.[x];

        if (wall && wall.hp !== OUTER_WALL_HP) {
          if (hpText) {
            hpText.text = String(wall.hp);
          } else {
            // Create new text if wall exists but text doesn't
            const newHpText = this.createHPTextElement(wall.hp, x, y);
            if (!this.hpTexts[y]) {
              this.hpTexts[y] = [];
            }
            this.hpTexts[y][x] = newHpText;
            this.hpTextContainer.addChild(newHpText);
          }
        } else if (hpText) {
          // Wall was destroyed, remove text
          this.hpTextContainer.removeChild(hpText);
          hpText.destroy();
          this.hpTexts[y][x] = null;
        }
      }
    }
  }

  /**
   * Clear all HP text elements
   */
  private clearHPTexts(): void {
    for (let y = 0; y < this.hpTexts.length; y++) {
      for (let x = 0; x < (this.hpTexts[y]?.length ?? 0); x++) {
        const hpText = this.hpTexts[y]?.[x];
        if (hpText) {
          this.hpTextContainer.removeChild(hpText);
          hpText.destroy();
        }
      }
    }
    this.hpTexts = [];
  }

  /**
   * Check if HP text is currently visible
   */
  public isHPTextVisible(): boolean {
    return this._isHPTextVisible;
  }
}
