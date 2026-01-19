import { Graphics } from 'pixi.js';
import {
  OXYGEN_TANK_SIZE,
  OXYGEN_TANK_COLOR,
  PLAYER_SIZE,
} from './constants';

export class OxygenTank {
  public graphics: Graphics;
  public x: number;
  public y: number;
  public active: boolean = true;
  public collected: boolean = false;

  private time: number = 0;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;

    this.graphics = new Graphics();
    this.draw();
    this.updatePosition();
  }

  private draw(): void {
    this.graphics.clear();

    const width = OXYGEN_TANK_SIZE * 0.6;
    const height = OXYGEN_TANK_SIZE;

    // Tank body
    this.graphics.roundRect(-width / 2, -height / 2, width, height, 4);
    this.graphics.fill(OXYGEN_TANK_COLOR);

    // Tank highlight
    this.graphics.roundRect(-width / 2 + 2, -height / 2 + 2, width / 3, height - 4, 2);
    this.graphics.fill({ color: 0xffffff, alpha: 0.3 });

    // Tank valve (top)
    this.graphics.rect(-3, -height / 2 - 4, 6, 6);
    this.graphics.fill(0x888888);

    // O2 label
    this.graphics.circle(0, 0, 5);
    this.graphics.fill({ color: 0xffffff, alpha: 0.8 });

    // Pulsing glow
    const pulse = (Math.sin(this.time * 3) + 1) / 2;
    this.graphics.circle(0, 0, OXYGEN_TANK_SIZE / 2 + 2 + pulse * 2);
    this.graphics.fill({ color: OXYGEN_TANK_COLOR, alpha: 0.2 + pulse * 0.1 });
  }

  private updatePosition(): void {
    this.graphics.x = this.x;
    this.graphics.y = this.y;
  }

  update(deltaTime: number, playerX: number, playerY: number): boolean {
    this.time += deltaTime;

    // Floating animation
    this.graphics.y = this.y + Math.sin(this.time * 2) * 3;

    // Check collision with player
    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < (OXYGEN_TANK_SIZE / 2 + PLAYER_SIZE / 2)) {
      this.collected = true;
      this.active = false;
      return true;
    }

    this.draw();
    return false;
  }

  destroy(): void {
    this.graphics.destroy();
  }
}
