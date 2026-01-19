import { Graphics } from 'pixi.js';
import {
  GEM_SIZE,
  GEM_COLOR,
  GEM_ATTRACT_RANGE,
  GEM_ATTRACT_SPEED,
  GEM_COLLECT_RANGE,
} from './constants';

export class Gem {
  public graphics: Graphics;
  public x: number;
  public y: number;
  public active: boolean = true;
  public collected: boolean = false;

  private floatOffset: number;
  private floatSpeed: number;
  private attractRange: number;

  constructor(x: number, y: number, attractRange: number = GEM_ATTRACT_RANGE) {
    this.x = x;
    this.y = y;
    this.attractRange = attractRange;
    this.floatOffset = Math.random() * Math.PI * 2;
    this.floatSpeed = 3 + Math.random() * 2;

    this.graphics = new Graphics();
    this.draw();
    this.updatePosition();
  }

  private draw(): void {
    this.graphics.clear();

    // Diamond shape
    const size = GEM_SIZE;
    this.graphics.moveTo(0, -size);
    this.graphics.lineTo(size * 0.6, 0);
    this.graphics.lineTo(0, size);
    this.graphics.lineTo(-size * 0.6, 0);
    this.graphics.closePath();
    this.graphics.fill(GEM_COLOR);

    // Inner shine
    this.graphics.moveTo(0, -size * 0.5);
    this.graphics.lineTo(size * 0.3, 0);
    this.graphics.lineTo(0, size * 0.5);
    this.graphics.lineTo(-size * 0.3, 0);
    this.graphics.closePath();
    this.graphics.fill({ color: 0xffffff, alpha: 0.4 });

    // Glow effect
    this.graphics.circle(0, 0, size * 1.2);
    this.graphics.fill({ color: GEM_COLOR, alpha: 0.2 });
  }

  private updatePosition(): void {
    this.graphics.x = this.x;
    this.graphics.y = this.y;
  }

  // Update attract range (for when player upgrades)
  setAttractRange(range: number): void {
    this.attractRange = range;
  }

  update(deltaTime: number, playerX: number, playerY: number): boolean {
    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Check if collected
    if (dist < GEM_COLLECT_RANGE) {
      this.collected = true;
      this.active = false;
      return true;
    }

    // Attract towards player if in range (using dynamic attract range)
    if (dist < this.attractRange) {
      const speed = GEM_ATTRACT_SPEED * (1 - dist / this.attractRange);
      this.x += (dx / dist) * speed * deltaTime;
      this.y += (dy / dist) * speed * deltaTime;
    }

    // Floating animation
    this.floatOffset += deltaTime * this.floatSpeed;
    this.graphics.y = this.y + Math.sin(this.floatOffset) * 3;
    this.graphics.x = this.x;

    // Rotation for sparkle effect
    this.graphics.rotation = Math.sin(this.floatOffset * 0.5) * 0.2;

    // Pulse scale
    const scale = 1 + Math.sin(this.floatOffset * 2) * 0.1;
    this.graphics.scale.set(scale);

    return false;
  }

  destroy(): void {
    this.graphics.destroy();
  }
}
