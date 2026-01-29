/**
 * Camera class that handles viewport scrolling and coordinate transformations.
 * Keeps a target (typically the player) centered on screen while respecting world bounds.
 */
export class Camera {
  private _x: number = 0;
  private _y: number = 0;
  private _screenWidth: number;
  private _screenHeight: number;
  private _worldWidth: number;
  private _worldHeight: number;

  constructor(
    screenWidth: number,
    screenHeight: number,
    worldWidth: number,
    worldHeight: number
  ) {
    this._screenWidth = screenWidth;
    this._screenHeight = screenHeight;
    this._worldWidth = worldWidth;
    this._worldHeight = worldHeight;
  }

  /**
   * Camera X position (negative offset for rendering)
   */
  get x(): number {
    return this._x;
  }

  /**
   * Camera Y position (negative offset for rendering)
   */
  get y(): number {
    return this._y;
  }

  /**
   * Screen width in pixels
   */
  get screenWidth(): number {
    return this._screenWidth;
  }

  /**
   * Screen height in pixels
   */
  get screenHeight(): number {
    return this._screenHeight;
  }

  /**
   * World width in pixels
   */
  get worldWidth(): number {
    return this._worldWidth;
  }

  /**
   * World height in pixels
   */
  get worldHeight(): number {
    return this._worldHeight;
  }

  /**
   * Update camera to follow a target, keeping it centered on screen.
   * Camera position is clamped to world bounds to prevent showing beyond world edges.
   */
  follow(targetX: number, targetY: number): void {
    // Calculate desired camera position to center target on screen
    const desiredX = this._screenWidth / 2 - targetX;
    const desiredY = this._screenHeight / 2 - targetY;

    // Calculate bounds
    // minX/minY: maximum negative offset (showing right/bottom of world)
    // maxX/maxY: minimum offset (0, showing left/top of world)
    const minX = this._screenWidth - this._worldWidth;
    const maxX = 0;
    const minY = this._screenHeight - this._worldHeight;
    const maxY = 0;

    // Clamp camera position to bounds
    this._x = Math.max(minX, Math.min(maxX, desiredX));
    this._y = Math.max(minY, Math.min(maxY, desiredY));
  }

  /**
   * Convert world coordinates to screen coordinates.
   * Used for determining where to render objects on screen.
   */
  worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
    return {
      x: worldX + this._x,
      y: worldY + this._y,
    };
  }

  /**
   * Convert screen coordinates to world coordinates.
   * Used for translating mouse position to world position.
   */
  screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
    return {
      x: screenX - this._x,
      y: screenY - this._y,
    };
  }

  /**
   * Update world dimensions and re-clamp camera position.
   * Used when transitioning to floors with different sizes.
   */
  updateWorldSize(worldWidth: number, worldHeight: number): void {
    this._worldWidth = worldWidth;
    this._worldHeight = worldHeight;

    // Re-clamp position with new bounds
    const minX = this._screenWidth - this._worldWidth;
    const maxX = 0;
    const minY = this._screenHeight - this._worldHeight;
    const maxY = 0;

    this._x = Math.max(minX, Math.min(maxX, this._x));
    this._y = Math.max(minY, Math.min(maxY, this._y));
  }
}
