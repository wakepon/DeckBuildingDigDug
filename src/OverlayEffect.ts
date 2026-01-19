import { Container, Graphics } from 'pixi.js';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from './constants';

export class OverlayEffect {
  public container: Container;
  private warningOverlay: Graphics;
  private depletedOverlay: Graphics;

  private isWarning: boolean = false;
  private isDepleted: boolean = false;
  private time: number = 0;

  constructor() {
    this.container = new Container();

    // Warning overlay (orange tint on edges)
    this.warningOverlay = new Graphics();
    this.warningOverlay.visible = false;
    this.container.addChild(this.warningOverlay);

    // Depleted overlay (red pulsing edges)
    this.depletedOverlay = new Graphics();
    this.depletedOverlay.visible = false;
    this.container.addChild(this.depletedOverlay);
  }

  setWarning(warning: boolean): void {
    this.isWarning = warning;
    this.warningOverlay.visible = warning && !this.isDepleted;
  }

  setDepleted(depleted: boolean): void {
    this.isDepleted = depleted;
    this.depletedOverlay.visible = depleted;
    this.warningOverlay.visible = this.isWarning && !depleted;
  }

  update(deltaTime: number): void {
    this.time += deltaTime;

    if (this.isWarning && !this.isDepleted) {
      this.drawWarningOverlay();
    }

    if (this.isDepleted) {
      this.drawDepletedOverlay();
    }
  }

  private drawWarningOverlay(): void {
    this.warningOverlay.clear();

    // Pulsing alpha
    const pulse = (Math.sin(this.time * 4) + 1) / 2;
    const alpha = 0.1 + pulse * 0.15;

    const edgeWidth = 40;

    // Draw vignette-like effect on edges
    // Top edge
    this.warningOverlay.rect(0, 0, SCREEN_WIDTH, edgeWidth);
    this.warningOverlay.fill({ color: 0xff8800, alpha });

    // Bottom edge
    this.warningOverlay.rect(0, SCREEN_HEIGHT - edgeWidth, SCREEN_WIDTH, edgeWidth);
    this.warningOverlay.fill({ color: 0xff8800, alpha });

    // Left edge
    this.warningOverlay.rect(0, edgeWidth, edgeWidth, SCREEN_HEIGHT - edgeWidth * 2);
    this.warningOverlay.fill({ color: 0xff8800, alpha });

    // Right edge
    this.warningOverlay.rect(SCREEN_WIDTH - edgeWidth, edgeWidth, edgeWidth, SCREEN_HEIGHT - edgeWidth * 2);
    this.warningOverlay.fill({ color: 0xff8800, alpha });
  }

  private drawDepletedOverlay(): void {
    this.depletedOverlay.clear();

    // Faster, more intense pulsing
    const pulse = (Math.sin(this.time * 8) + 1) / 2;
    const alpha = 0.2 + pulse * 0.3;

    const edgeWidth = 60;

    // Draw intense red vignette
    // Top edge
    this.depletedOverlay.rect(0, 0, SCREEN_WIDTH, edgeWidth);
    this.depletedOverlay.fill({ color: 0xff0000, alpha });

    // Bottom edge
    this.depletedOverlay.rect(0, SCREEN_HEIGHT - edgeWidth, SCREEN_WIDTH, edgeWidth);
    this.depletedOverlay.fill({ color: 0xff0000, alpha });

    // Left edge
    this.depletedOverlay.rect(0, edgeWidth, edgeWidth, SCREEN_HEIGHT - edgeWidth * 2);
    this.depletedOverlay.fill({ color: 0xff0000, alpha });

    // Right edge
    this.depletedOverlay.rect(SCREEN_WIDTH - edgeWidth, edgeWidth, edgeWidth, SCREEN_HEIGHT - edgeWidth * 2);
    this.depletedOverlay.fill({ color: 0xff0000, alpha });

    // Corner intensification
    const cornerSize = 80;
    const cornerAlpha = alpha * 1.2;

    // Top-left corner
    this.depletedOverlay.rect(0, 0, cornerSize, cornerSize);
    this.depletedOverlay.fill({ color: 0xff0000, alpha: cornerAlpha });

    // Top-right corner
    this.depletedOverlay.rect(SCREEN_WIDTH - cornerSize, 0, cornerSize, cornerSize);
    this.depletedOverlay.fill({ color: 0xff0000, alpha: cornerAlpha });

    // Bottom-left corner
    this.depletedOverlay.rect(0, SCREEN_HEIGHT - cornerSize, cornerSize, cornerSize);
    this.depletedOverlay.fill({ color: 0xff0000, alpha: cornerAlpha });

    // Bottom-right corner
    this.depletedOverlay.rect(SCREEN_WIDTH - cornerSize, SCREEN_HEIGHT - cornerSize, cornerSize, cornerSize);
    this.depletedOverlay.fill({ color: 0xff0000, alpha: cornerAlpha });
  }
}
