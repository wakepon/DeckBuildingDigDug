import { Container, Graphics } from 'pixi.js';
import { InputManager } from './InputManager';

/**
 * Crosshair - マウス位置に照準マークを表示
 */
export class Crosshair {
  public container: Container;
  private graphics: Graphics;
  private inputManager: InputManager;

  constructor(inputManager: InputManager) {
    this.inputManager = inputManager;
    this.container = new Container();
    this.graphics = new Graphics();
    this.container.addChild(this.graphics);

    this.drawCrosshair();
  }

  /**
   * 丸に十字のクロスヘアを描画
   */
  private drawCrosshair(): void {
    this.graphics.clear();

    const radius = 12; // 円の半径
    const lineLength = 18; // 十字の線の長さ
    const lineWidth = 2; // 線の太さ
    const color = 0xffffff; // 白色
    const alpha = 0.8; // 透明度

    // 外側の円
    this.graphics.circle(0, 0, radius);
    this.graphics.stroke({ width: lineWidth, color, alpha });

    // 十字の線（縦）
    this.graphics.moveTo(0, -lineLength / 2);
    this.graphics.lineTo(0, -radius - 2);
    this.graphics.stroke({ width: lineWidth, color, alpha });

    this.graphics.moveTo(0, radius + 2);
    this.graphics.lineTo(0, lineLength / 2);
    this.graphics.stroke({ width: lineWidth, color, alpha });

    // 十字の線（横）
    this.graphics.moveTo(-lineLength / 2, 0);
    this.graphics.lineTo(-radius - 2, 0);
    this.graphics.stroke({ width: lineWidth, color, alpha });

    this.graphics.moveTo(radius + 2, 0);
    this.graphics.lineTo(lineLength / 2, 0);
    this.graphics.stroke({ width: lineWidth, color, alpha });

    // 中心の点
    this.graphics.circle(0, 0, 1.5);
    this.graphics.fill({ color, alpha });
  }

  /**
   * マウス位置に追従して更新
   */
  update(): void {
    this.container.x = this.inputManager.mouseX;
    this.container.y = this.inputManager.mouseY;
  }
}
