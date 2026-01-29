import { Container, Graphics } from 'pixi.js';
import { TILE_SIZE, FLOOR_PATTERN } from './constants';

interface FloorColors {
  base: number;
  grout: number;
  highlight: number;
}

/**
 * FloorRenderer draws the dungeon floor pattern using pixi.js Graphics.
 * It creates a stone tile pattern with grout lines and subtle color variations.
 * The pattern is deterministic based on tile position for consistent appearance.
 */
export class FloorRenderer {
  public container: Container;
  private graphics: Graphics;
  private worldWidth: number;
  private worldHeight: number;
  private destroyed: boolean = false;

  constructor(worldWidth: number, worldHeight: number) {
    this.container = new Container();
    this.graphics = new Graphics();
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;

    this.container.addChild(this.graphics);
    this.drawPattern();
  }

  /**
   * Update the floor size and redraw the pattern.
   * Called during floor transitions when the world size changes.
   */
  public updateSize(worldWidth: number, worldHeight: number): void {
    if (this.destroyed) return;

    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    this.drawPattern();
  }

  /**
   * Draw the stone tile pattern on the floor.
   * Uses deterministic color variations based on tile position.
   */
  private drawPattern(): void {
    if (this.destroyed) return;

    this.graphics.clear();

    const cols = Math.ceil(this.worldWidth / TILE_SIZE);
    const rows = Math.ceil(this.worldHeight / TILE_SIZE);

    // Draw grout background first (covers entire floor)
    this.graphics.rect(0, 0, this.worldWidth, this.worldHeight);
    this.graphics.fill(FLOOR_PATTERN.GROUT_COLOR);

    // Draw each tile
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        this.drawTile(col, row);
      }
    }
  }

  /**
   * Draw a single floor tile at the specified grid position.
   * Includes deterministic color variation and edge highlights.
   */
  private drawTile(col: number, row: number): void {
    const groutWidth = FLOOR_PATTERN.GROUT_WIDTH;
    const halfGrout = groutWidth / 2;

    // Tile position and size (accounting for grout)
    const x = col * TILE_SIZE + halfGrout;
    const y = row * TILE_SIZE + halfGrout;
    const tileWidth = TILE_SIZE - groutWidth;
    const tileHeight = TILE_SIZE - groutWidth;

    // Skip tiles that would be too small or outside bounds
    if (tileWidth <= 0 || tileHeight <= 0) return;

    // Calculate deterministic color variation based on position
    const tileColor = this.getTileColor(col, row);

    // Draw the tile base
    this.graphics.rect(x, y, tileWidth, tileHeight);
    this.graphics.fill(tileColor);

    // Draw highlight on top and left edges for depth effect
    this.drawTileHighlight(x, y, tileWidth, tileHeight);
  }

  /**
   * Calculate deterministic tile color based on position.
   * Uses a simple hash function for consistent but varied appearance.
   */
  private getTileColor(col: number, row: number): number {
    // Simple hash based on position for deterministic variation
    const hash = this.positionHash(col, row);
    const variation = (hash % 5) - 2; // -2 to +2 variation

    const baseR = (FLOOR_PATTERN.BASE_COLOR >> 16) & 0xff;
    const baseG = (FLOOR_PATTERN.BASE_COLOR >> 8) & 0xff;
    const baseB = FLOOR_PATTERN.BASE_COLOR & 0xff;

    const variationAmount = FLOOR_PATTERN.COLOR_VARIATION & 0xff;

    // Apply variation to each channel
    const r = Math.max(0, Math.min(255, baseR + variation * variationAmount));
    const g = Math.max(0, Math.min(255, baseG + variation * variationAmount));
    const b = Math.max(0, Math.min(255, baseB + variation * variationAmount));

    return (r << 16) | (g << 8) | b;
  }

  /**
   * Generate a deterministic hash value from grid position.
   */
  private positionHash(col: number, row: number): number {
    // Simple but effective hash for tile variation
    const seed = col * 31 + row * 17;
    return Math.abs((seed * 1103515245 + 12345) % 2147483647);
  }

  /**
   * Draw highlight edges on a tile for a 3D depth effect.
   */
  private drawTileHighlight(x: number, y: number, width: number, height: number): void {
    // Top edge highlight
    this.graphics.moveTo(x + 1, y + 1);
    this.graphics.lineTo(x + width - 1, y + 1);
    this.graphics.stroke({
      width: 1,
      color: FLOOR_PATTERN.HIGHLIGHT_COLOR,
      alpha: FLOOR_PATTERN.HIGHLIGHT_ALPHA,
    });

    // Left edge highlight
    this.graphics.moveTo(x + 1, y + 1);
    this.graphics.lineTo(x + 1, y + height - 1);
    this.graphics.stroke({
      width: 1,
      color: FLOOR_PATTERN.HIGHLIGHT_COLOR,
      alpha: FLOOR_PATTERN.HIGHLIGHT_ALPHA,
    });
  }

  /**
   * Get floor color constants for external reference.
   */
  public getFloorColors(): FloorColors {
    return {
      base: FLOOR_PATTERN.BASE_COLOR,
      grout: FLOOR_PATTERN.GROUT_COLOR,
      highlight: FLOOR_PATTERN.HIGHLIGHT_COLOR,
    };
  }

  /**
   * Clean up graphics resources.
   * Safe to call multiple times.
   */
  public destroy(): void {
    if (this.destroyed) return;

    this.destroyed = true;
    this.graphics.destroy();
  }
}
