import { Graphics } from 'pixi.js';
import {
  CHEST_SIZE,
  CHEST_COLOR,
  CHEST_MIN_UPGRADES,
  CHEST_MAX_UPGRADES,
  PLAYER_SIZE,
} from './constants';

export class TreasureChest {
  public graphics: Graphics;
  public x: number;
  public y: number;
  public active: boolean = true;
  public upgradeCount: number;

  private time: number = 0;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.upgradeCount = Math.floor(
      Math.random() * (CHEST_MAX_UPGRADES - CHEST_MIN_UPGRADES + 1) + CHEST_MIN_UPGRADES
    );

    this.graphics = new Graphics();
    this.draw();
    this.updatePosition();
  }

  private draw(): void {
    this.graphics.clear();

    const pulse = (Math.sin(this.time * 3) + 1) / 2;
    const bounce = Math.sin(this.time * 2) * 2;

    // Glow effect
    this.graphics.circle(0, bounce, CHEST_SIZE / 2 + 8 + pulse * 4);
    this.graphics.fill({ color: CHEST_COLOR, alpha: 0.2 + pulse * 0.1 });

    // Chest body
    const w = CHEST_SIZE;
    const h = CHEST_SIZE * 0.7;

    // Bottom part
    this.graphics.roundRect(-w / 2, bounce, w, h, 4);
    this.graphics.fill(0x8B4513); // Brown

    // Top lid (slightly open)
    const lidOpen = 2 + pulse * 3;
    this.graphics.roundRect(-w / 2, bounce - h * 0.4 - lidOpen, w, h * 0.4, 4);
    this.graphics.fill(0xA0522D); // Lighter brown

    // Metal band
    this.graphics.rect(-w / 2, bounce + h * 0.3, w, 4);
    this.graphics.fill(CHEST_COLOR);

    // Lock/clasp
    this.graphics.circle(0, bounce + h * 0.3 + 2, 5);
    this.graphics.fill(CHEST_COLOR);

    // Sparkles
    const sparkleCount = 3;
    for (let i = 0; i < sparkleCount; i++) {
      const angle = (this.time * 2 + i * (Math.PI * 2 / sparkleCount)) % (Math.PI * 2);
      const dist = CHEST_SIZE / 2 + 12;
      const sx = Math.cos(angle) * dist;
      const sy = Math.sin(angle) * dist * 0.5 + bounce - 5;
      const sparkleSize = 2 + pulse * 2;

      this.graphics.star(sx, sy, 4, sparkleSize, sparkleSize / 2);
      this.graphics.fill({ color: 0xffffff, alpha: 0.5 + pulse * 0.5 });
    }

    // Number indicator
    if (this.upgradeCount > 1) {
      this.graphics.circle(w / 2 - 2, bounce - h * 0.3, 8);
      this.graphics.fill(0xff4444);
      this.graphics.circle(w / 2 - 2, bounce - h * 0.3, 8);
      this.graphics.stroke({ width: 1, color: 0xffffff });
    }
  }

  private updatePosition(): void {
    this.graphics.x = this.x;
    this.graphics.y = this.y;
  }

  update(deltaTime: number): void {
    this.time += deltaTime;
    this.draw();
  }

  checkCollision(playerX: number, playerY: number): boolean {
    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    return dist < (CHEST_SIZE / 2 + PLAYER_SIZE / 2);
  }

  destroy(): void {
    this.graphics.destroy();
  }
}
