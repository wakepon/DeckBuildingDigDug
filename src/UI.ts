import { Container, Graphics, Text } from 'pixi.js';
import { UI_BAR_WIDTH, UI_BAR_HEIGHT, UI_PADDING, SCREEN_WIDTH, OXYGEN_WARNING_THRESHOLD } from './constants';

const OXYGEN_BAR_WIDTH = 300;
const OXYGEN_BAR_HEIGHT = 24;

export class UI {
  public container: Container;

  // Oxygen bar (center top, larger)
  private oxygenBarBg: Graphics;
  private oxygenBarFill: Graphics;
  private oxygenText: Text;
  private oxygenWarningTime: number = 0;

  // HP bar (left side)
  private hpBarBg: Graphics;
  private hpBarFill: Graphics;
  private hpText: Text;

  // EXP bar (below HP)
  private expBarBg: Graphics;
  private expBarFill: Graphics;
  private expText: Text;

  // Floor display (right side)
  private floorBg: Graphics;
  private floorText: Text;

  constructor() {
    this.container = new Container();

    // ===== OXYGEN BAR (Center, prominent) =====
    const oxygenX = (SCREEN_WIDTH - OXYGEN_BAR_WIDTH) / 2;
    const oxygenY = UI_PADDING;

    this.oxygenBarBg = new Graphics();
    this.oxygenBarBg.roundRect(0, 0, OXYGEN_BAR_WIDTH, OXYGEN_BAR_HEIGHT, 6);
    this.oxygenBarBg.fill(0x222244);
    this.oxygenBarBg.roundRect(0, 0, OXYGEN_BAR_WIDTH, OXYGEN_BAR_HEIGHT, 6);
    this.oxygenBarBg.stroke({ width: 2, color: 0x4444aa });
    this.oxygenBarBg.x = oxygenX;
    this.oxygenBarBg.y = oxygenY;
    this.container.addChild(this.oxygenBarBg);

    this.oxygenBarFill = new Graphics();
    this.oxygenBarFill.x = oxygenX + 3;
    this.oxygenBarFill.y = oxygenY + 3;
    this.container.addChild(this.oxygenBarFill);

    this.oxygenText = new Text({
      text: '酸素量: 60',
      style: {
        fontFamily: 'Arial',
        fontSize: 14,
        fill: 0xffffff,
        fontWeight: 'bold',
        dropShadow: {
          color: 0x000000,
          distance: 1,
          blur: 2,
        },
      },
    });
    this.oxygenText.x = oxygenX + OXYGEN_BAR_WIDTH / 2;
    this.oxygenText.y = oxygenY + 4;
    this.oxygenText.anchor.set(0.5, 0);
    this.container.addChild(this.oxygenText);

    // ===== HP BAR (Left side) =====
    this.hpBarBg = new Graphics();
    this.hpBarBg.roundRect(0, 0, UI_BAR_WIDTH, UI_BAR_HEIGHT, 4);
    this.hpBarBg.fill(0x333333);
    this.hpBarBg.x = UI_PADDING;
    this.hpBarBg.y = UI_PADDING + OXYGEN_BAR_HEIGHT + 8;
    this.container.addChild(this.hpBarBg);

    this.hpBarFill = new Graphics();
    this.hpBarFill.x = UI_PADDING + 2;
    this.hpBarFill.y = UI_PADDING + OXYGEN_BAR_HEIGHT + 10;
    this.container.addChild(this.hpBarFill);

    this.hpText = new Text({
      text: 'HP',
      style: {
        fontFamily: 'Arial',
        fontSize: 11,
        fill: 0xffffff,
        fontWeight: 'bold',
      },
    });
    this.hpText.x = UI_PADDING + 5;
    this.hpText.y = UI_PADDING + OXYGEN_BAR_HEIGHT + 9;
    this.container.addChild(this.hpText);

    // ===== EXP BAR (Below HP) =====
    this.expBarBg = new Graphics();
    this.expBarBg.roundRect(0, 0, UI_BAR_WIDTH, UI_BAR_HEIGHT - 4, 4);
    this.expBarBg.fill(0x333333);
    this.expBarBg.x = UI_PADDING;
    this.expBarBg.y = UI_PADDING + OXYGEN_BAR_HEIGHT + UI_BAR_HEIGHT + 12;
    this.container.addChild(this.expBarBg);

    this.expBarFill = new Graphics();
    this.expBarFill.x = UI_PADDING + 2;
    this.expBarFill.y = UI_PADDING + OXYGEN_BAR_HEIGHT + UI_BAR_HEIGHT + 14;
    this.container.addChild(this.expBarFill);

    this.expText = new Text({
      text: 'EXP: 0',
      style: {
        fontFamily: 'Arial',
        fontSize: 10,
        fill: 0xffffff,
      },
    });
    this.expText.x = UI_PADDING + 5;
    this.expText.y = UI_PADDING + OXYGEN_BAR_HEIGHT + UI_BAR_HEIGHT + 13;
    this.container.addChild(this.expText);

    // ===== FLOOR DISPLAY (Right side) =====
    this.floorBg = new Graphics();
    this.floorBg.roundRect(0, 0, 80, 36, 6);
    this.floorBg.fill({ color: 0x222222, alpha: 0.8 });
    this.floorBg.roundRect(0, 0, 80, 36, 6);
    this.floorBg.stroke({ width: 2, color: 0xffdd00 });
    this.floorBg.x = SCREEN_WIDTH - 90;
    this.floorBg.y = UI_PADDING + OXYGEN_BAR_HEIGHT + 8;
    this.container.addChild(this.floorBg);

    this.floorText = new Text({
      text: 'B1F',
      style: {
        fontFamily: 'Arial',
        fontSize: 20,
        fill: 0xffdd00,
        fontWeight: 'bold',
        dropShadow: {
          color: 0x000000,
          distance: 1,
          blur: 2,
        },
      },
    });
    this.floorText.anchor.set(0.5);
    this.floorText.x = SCREEN_WIDTH - 50;
    this.floorText.y = UI_PADDING + OXYGEN_BAR_HEIGHT + 26;
    this.container.addChild(this.floorText);

    // Initialize displays
    this.updateOxygen(60, 60);
    this.updateHP(100, 100);
    this.updateEXP(0);
    this.updateFloor(1);
  }

  update(deltaTime: number): void {
    this.oxygenWarningTime += deltaTime;
  }

  updateOxygen(current: number, max: number): void {
    const ratio = Math.max(0, current / max);

    this.oxygenBarFill.clear();

    const width = (OXYGEN_BAR_WIDTH - 6) * ratio;

    if (width > 0) {
      this.oxygenBarFill.roundRect(0, 0, width, OXYGEN_BAR_HEIGHT - 6, 4);

      // Color based on oxygen ratio with pulsing effect when low
      let color: number;
      let alpha = 1;

      if (ratio > 0.5) {
        color = 0x44aaff; // Blue - safe
      } else if (ratio > OXYGEN_WARNING_THRESHOLD) {
        color = 0x44ddff; // Light blue - caution
      } else if (ratio > 0) {
        // Warning - pulse between orange and red
        const pulse = (Math.sin(this.oxygenWarningTime * 8) + 1) / 2;
        color = pulse > 0.5 ? 0xff8844 : 0xff4444;
        alpha = 0.8 + pulse * 0.2;
      } else {
        color = 0xff0000; // Red - depleted
      }

      this.oxygenBarFill.fill({ color, alpha });
    }

    // Add bubbles effect for visual interest
    if (ratio > 0.1) {
      const bubbleCount = Math.floor(ratio * 5);
      for (let i = 0; i < bubbleCount; i++) {
        const bx = (width * 0.2) + (i * width * 0.15);
        const by = (OXYGEN_BAR_HEIGHT - 6) / 2 + Math.sin(this.oxygenWarningTime * 3 + i) * 3;
        this.oxygenBarFill.circle(bx, by, 2);
        this.oxygenBarFill.fill({ color: 0xffffff, alpha: 0.3 });
      }
    }

    this.oxygenText.text = `酸素量: ${Math.ceil(current)}`;

    // Text color change when critical
    if (ratio <= OXYGEN_WARNING_THRESHOLD) {
      this.oxygenText.style.fill = ratio <= 0 ? 0xff0000 : 0xffaa00;
    } else {
      this.oxygenText.style.fill = 0xffffff;
    }
  }

  updateHP(current: number, max: number): void {
    const ratio = Math.max(0, current / max);

    this.hpBarFill.clear();
    if (ratio > 0) {
      const width = (UI_BAR_WIDTH - 4) * ratio;
      this.hpBarFill.roundRect(0, 0, width, UI_BAR_HEIGHT - 4, 3);

      // Color based on HP ratio
      let color: number;
      if (ratio > 0.6) {
        color = 0x44ff44; // Green
      } else if (ratio > 0.3) {
        color = 0xffff44; // Yellow
      } else {
        color = 0xff4444; // Red
      }
      this.hpBarFill.fill(color);
    }

    this.hpText.text = `HP: ${Math.ceil(current)}/${max}`;
  }

  updateEXP(exp: number, level: number = 1, requiredExp: number = 10): void {
    // Calculate progress towards next level
    const ratio = exp / requiredExp;

    this.expBarFill.clear();
    if (ratio > 0) {
      const width = (UI_BAR_WIDTH - 4) * Math.min(ratio, 1);
      this.expBarFill.roundRect(0, 0, width, UI_BAR_HEIGHT - 8, 2);
      this.expBarFill.fill(0x00ffff);
    }

    this.expText.text = `Lv.${level} (${exp}/${requiredExp})`;
  }

  updateFloor(floor: number): void {
    this.floorText.text = `B${floor}F`;
  }
}
