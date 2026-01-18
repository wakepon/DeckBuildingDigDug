import { Container, Graphics, Text } from 'pixi.js';
import { UI_BAR_WIDTH, UI_BAR_HEIGHT, UI_PADDING } from './constants';

export class UI {
  public container: Container;
  private hpBarBg: Graphics;
  private hpBarFill: Graphics;
  private expBarBg: Graphics;
  private expBarFill: Graphics;
  private hpText: Text;
  private expText: Text;

  constructor() {
    this.container = new Container();

    // HP Bar Background
    this.hpBarBg = new Graphics();
    this.hpBarBg.roundRect(0, 0, UI_BAR_WIDTH, UI_BAR_HEIGHT, 4);
    this.hpBarBg.fill(0x333333);
    this.hpBarBg.x = UI_PADDING;
    this.hpBarBg.y = UI_PADDING;
    this.container.addChild(this.hpBarBg);

    // HP Bar Fill
    this.hpBarFill = new Graphics();
    this.hpBarFill.x = UI_PADDING + 2;
    this.hpBarFill.y = UI_PADDING + 2;
    this.container.addChild(this.hpBarFill);

    // HP Text
    this.hpText = new Text({
      text: 'HP',
      style: {
        fontFamily: 'Arial',
        fontSize: 12,
        fill: 0xffffff,
        fontWeight: 'bold',
      },
    });
    this.hpText.x = UI_PADDING + 5;
    this.hpText.y = UI_PADDING + 1;
    this.container.addChild(this.hpText);

    // EXP Bar Background
    this.expBarBg = new Graphics();
    this.expBarBg.roundRect(0, 0, UI_BAR_WIDTH, UI_BAR_HEIGHT - 4, 4);
    this.expBarBg.fill(0x333333);
    this.expBarBg.x = UI_PADDING;
    this.expBarBg.y = UI_PADDING + UI_BAR_HEIGHT + 5;
    this.container.addChild(this.expBarBg);

    // EXP Bar Fill
    this.expBarFill = new Graphics();
    this.expBarFill.x = UI_PADDING + 2;
    this.expBarFill.y = UI_PADDING + UI_BAR_HEIGHT + 7;
    this.container.addChild(this.expBarFill);

    // EXP Text
    this.expText = new Text({
      text: 'EXP: 0',
      style: {
        fontFamily: 'Arial',
        fontSize: 10,
        fill: 0xffffff,
      },
    });
    this.expText.x = UI_PADDING + 5;
    this.expText.y = UI_PADDING + UI_BAR_HEIGHT + 6;
    this.container.addChild(this.expText);

    this.updateHP(100, 100);
    this.updateEXP(0);
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

    this.hpText.text = `HP: ${current}/${max}`;
  }

  updateEXP(exp: number): void {
    // Simple exp bar - fills up every 10 exp
    const level = Math.floor(exp / 10);
    const expInLevel = exp % 10;
    const ratio = expInLevel / 10;

    this.expBarFill.clear();
    if (ratio > 0 || exp > 0) {
      const width = (UI_BAR_WIDTH - 4) * (ratio === 0 && exp > 0 ? 1 : ratio);
      this.expBarFill.roundRect(0, 0, Math.max(width, ratio > 0 ? width : 0), UI_BAR_HEIGHT - 8, 2);
      this.expBarFill.fill(0x00ffff);
    }

    this.expText.text = `EXP: ${exp} (Lv.${level + 1})`;
  }
}
