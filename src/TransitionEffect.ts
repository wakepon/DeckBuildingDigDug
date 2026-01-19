import { Graphics } from 'pixi.js';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from './constants';

export class TransitionEffect {
  public graphics: Graphics;
  private alpha: number = 0;
  private targetAlpha: number = 0;
  private fadeSpeed: number = 2; // Alpha change per second
  private isActive: boolean = false;
  private onFadeComplete: (() => void) | null = null;

  constructor() {
    this.graphics = new Graphics();
    this.graphics.rect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    this.graphics.fill(0x000000);
    this.graphics.alpha = 0;
  }

  // Start fade to black
  fadeOut(onComplete?: () => void): void {
    this.targetAlpha = 1;
    this.isActive = true;
    this.onFadeComplete = onComplete || null;
  }

  // Start fade from black
  fadeIn(onComplete?: () => void): void {
    this.targetAlpha = 0;
    this.isActive = true;
    this.onFadeComplete = onComplete || null;
  }

  // Instant black screen
  setBlack(): void {
    this.alpha = 1;
    this.graphics.alpha = 1;
  }

  // Instant clear
  setClear(): void {
    this.alpha = 0;
    this.graphics.alpha = 0;
  }

  update(deltaTime: number): void {
    if (!this.isActive) return;

    const diff = this.targetAlpha - this.alpha;
    if (Math.abs(diff) < 0.01) {
      this.alpha = this.targetAlpha;
      this.graphics.alpha = this.alpha;
      this.isActive = false;

      if (this.onFadeComplete) {
        const callback = this.onFadeComplete;
        this.onFadeComplete = null;
        callback();
      }
      return;
    }

    const direction = diff > 0 ? 1 : -1;
    this.alpha += direction * this.fadeSpeed * deltaTime;

    // Clamp
    if (direction > 0 && this.alpha > this.targetAlpha) {
      this.alpha = this.targetAlpha;
    } else if (direction < 0 && this.alpha < this.targetAlpha) {
      this.alpha = this.targetAlpha;
    }

    this.graphics.alpha = this.alpha;
  }

  get isFading(): boolean {
    return this.isActive;
  }
}
