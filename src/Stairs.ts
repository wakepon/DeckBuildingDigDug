import { Graphics } from 'pixi.js';
import { getDistance } from './utils/math';
import {
  STAIRS_SIZE,
  STAIRS_COLOR,
  TILE_SIZE,
  PLAYER_SIZE,
} from './constants';

export class Stairs {
  public graphics: Graphics;
  public gridX: number;
  public gridY: number;
  public revealed: boolean = false;

  private time: number = 0;

  constructor(gridX: number, gridY: number) {
    this.gridX = gridX;
    this.gridY = gridY;

    this.graphics = new Graphics();
    this.graphics.visible = false;
    this.draw();
    this.updatePosition();
  }

  private draw(): void {
    this.graphics.clear();

    const size = STAIRS_SIZE;
    const stepCount = 4;
    const stepHeight = size / stepCount;
    const stepWidth = size;

    // Draw stairs (descending steps)
    for (let i = 0; i < stepCount; i++) {
      const y = i * stepHeight;
      const width = stepWidth - (i * stepWidth / stepCount / 2);
      const x = (stepWidth - width) / 2;

      // Step surface
      this.graphics.rect(x - size / 2, y - size / 2, width, stepHeight - 1);
      this.graphics.fill(STAIRS_COLOR);

      // Step edge (darker)
      this.graphics.rect(x - size / 2, y - size / 2 + stepHeight - 2, width, 2);
      this.graphics.fill(0xcc9900);
    }

    // Glow effect when revealed
    if (this.revealed) {
      const pulse = (Math.sin(this.time * 4) + 1) / 2;
      this.graphics.circle(0, 0, size / 2 + 5 + pulse * 3);
      this.graphics.fill({ color: STAIRS_COLOR, alpha: 0.2 + pulse * 0.1 });
    }

    // Arrow indicator
    this.graphics.moveTo(0, size / 2 - 5);
    this.graphics.lineTo(-6, size / 2 - 12);
    this.graphics.lineTo(6, size / 2 - 12);
    this.graphics.closePath();
    this.graphics.fill(0xffffff);
  }

  private updatePosition(): void {
    this.graphics.x = (this.gridX + 0.5) * TILE_SIZE;
    this.graphics.y = (this.gridY + 0.5) * TILE_SIZE;
  }

  reveal(): void {
    if (!this.revealed) {
      this.revealed = true;
      this.graphics.visible = true;
    }
  }

  update(deltaTime: number): void {
    if (this.revealed) {
      this.time += deltaTime;
      this.draw();
    }
  }

  checkCollision(playerX: number, playerY: number): boolean {
    if (!this.revealed) return false;

    const stairsCenterX = (this.gridX + 0.5) * TILE_SIZE;
    const stairsCenterY = (this.gridY + 0.5) * TILE_SIZE;

    const dist = getDistance(stairsCenterX, stairsCenterY, playerX, playerY);

    return dist < (STAIRS_SIZE / 2 + PLAYER_SIZE / 2);
  }

  get x(): number {
    return (this.gridX + 0.5) * TILE_SIZE;
  }

  get y(): number {
    return (this.gridY + 0.5) * TILE_SIZE;
  }

  destroy(): void {
    this.graphics.destroy();
  }
}
