import { Container, Graphics, Text } from 'pixi.js';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from './constants';
import { PlayerStats, UpgradeType, UPGRADE_DATA } from './PlayerStats';

export class DebugWindow {
  public container: Container;
  private playerStats: PlayerStats;
  private background: Graphics;
  private titleText: Text | null = null;
  private upgradeRows: Container[] = [];
  private _isVisible: boolean = false;
  private onStatsChangedCallback: (() => void) | null = null;

  // Layout constants
  private readonly WINDOW_WIDTH = 320;
  private readonly WINDOW_HEIGHT = 340;
  private readonly ROW_HEIGHT = 30;
  private readonly PADDING = 15;
  private readonly BUTTON_SIZE = 24;

  constructor(playerStats: PlayerStats) {
    this.playerStats = playerStats;
    this.container = new Container();
    this.background = new Graphics();

    this.setupWindow();
    this.container.visible = false;
  }

  private setupWindow(): void {
    // Position at center of screen
    this.container.x = (SCREEN_WIDTH - this.WINDOW_WIDTH) / 2;
    this.container.y = (SCREEN_HEIGHT - this.WINDOW_HEIGHT) / 2;

    // Draw background
    this.background.roundRect(0, 0, this.WINDOW_WIDTH, this.WINDOW_HEIGHT, 10);
    this.background.fill({ color: 0x000000, alpha: 0.85 });
    this.background.roundRect(0, 0, this.WINDOW_WIDTH, this.WINDOW_HEIGHT, 10);
    this.background.stroke({ width: 2, color: 0x444444 });
    this.container.addChild(this.background);

    // Title
    this.titleText = new Text({
      text: 'DEBUG WINDOW',
      style: {
        fontFamily: 'Arial',
        fontSize: 16,
        fontWeight: 'bold',
        fill: 0xffff00,
      },
    });
    this.titleText.x = this.PADDING;
    this.titleText.y = this.PADDING;
    this.container.addChild(this.titleText);

    // Create rows for each upgrade type
    this.createUpgradeRows();
  }

  private createUpgradeRows(): void {
    const allTypes = this.getAllUpgradeTypes();
    const startY = 45;

    for (let i = 0; i < allTypes.length; i++) {
      const type = allTypes[i];
      const row = this.createUpgradeRow(type, startY + i * this.ROW_HEIGHT);
      this.upgradeRows.push(row);
      this.container.addChild(row);
    }
  }

  private createUpgradeRow(type: UpgradeType, y: number): Container {
    const row = new Container();
    row.y = y;

    const info = UPGRADE_DATA[type];

    // Icon background
    const iconBg = new Graphics();
    iconBg.roundRect(this.PADDING, 0, 24, 24, 4);
    iconBg.fill({ color: info.color, alpha: 0.3 });
    iconBg.roundRect(this.PADDING, 0, 24, 24, 4);
    iconBg.stroke({ width: 1, color: info.color });
    row.addChild(iconBg);

    // Icon text
    const iconText = new Text({
      text: info.icon,
      style: {
        fontFamily: 'Arial',
        fontSize: 14,
        fill: info.color,
      },
    });
    iconText.anchor.set(0.5, 0.5);
    iconText.x = this.PADDING + 12;
    iconText.y = 12;
    row.addChild(iconText);

    // Upgrade name
    const nameText = new Text({
      text: info.name,
      style: {
        fontFamily: 'Arial',
        fontSize: 12,
        fill: 0xffffff,
      },
    });
    nameText.x = this.PADDING + 35;
    nameText.y = 5;
    row.addChild(nameText);

    // Level display
    const levelText = new Text({
      text: `Lv.${this.playerStats.getUpgradeCount(type)}`,
      style: {
        fontFamily: 'Arial',
        fontSize: 14,
        fontWeight: 'bold',
        fill: 0x88ff88,
      },
    });
    levelText.x = this.WINDOW_WIDTH - this.PADDING - 100;
    levelText.y = 4;
    row.addChild(levelText);

    // Store reference for updates
    (row as Container & { levelText: Text; upgradeType: UpgradeType }).levelText = levelText;
    (row as Container & { upgradeType: UpgradeType }).upgradeType = type;

    // Minus button
    const minusBtn = this.createButton('-', this.WINDOW_WIDTH - this.PADDING - 60, 0, () => {
      this.decrementUpgrade(type);
    });
    row.addChild(minusBtn);

    // Plus button
    const plusBtn = this.createButton('+', this.WINDOW_WIDTH - this.PADDING - 30, 0, () => {
      this.incrementUpgrade(type);
    });
    row.addChild(plusBtn);

    return row;
  }

  private createButton(label: string, x: number, y: number, onClick: () => void): Container {
    const btn = new Container();
    btn.x = x;
    btn.y = y;

    const bg = new Graphics();
    bg.roundRect(0, 0, this.BUTTON_SIZE, this.BUTTON_SIZE, 4);
    bg.fill({ color: 0x333333 });
    bg.roundRect(0, 0, this.BUTTON_SIZE, this.BUTTON_SIZE, 4);
    bg.stroke({ width: 1, color: 0x666666 });
    btn.addChild(bg);

    const text = new Text({
      text: label,
      style: {
        fontFamily: 'Arial',
        fontSize: 16,
        fontWeight: 'bold',
        fill: 0xffffff,
      },
    });
    text.anchor.set(0.5, 0.5);
    text.x = this.BUTTON_SIZE / 2;
    text.y = this.BUTTON_SIZE / 2;
    btn.addChild(text);

    // Make button interactive
    btn.eventMode = 'static';
    btn.cursor = 'pointer';
    btn.on('pointerdown', onClick);

    return btn;
  }

  get isVisible(): boolean {
    return this._isVisible;
  }

  toggle(): void {
    if (this._isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  show(): void {
    this._isVisible = true;
    this.container.visible = true;
    this.updateDisplay();
  }

  hide(): void {
    this._isVisible = false;
    this.container.visible = false;
  }

  setOnStatsChanged(callback: () => void): void {
    this.onStatsChangedCallback = callback;
  }

  incrementUpgrade(type: UpgradeType): void {
    this.playerStats.applyUpgrade(type);
    this.updateDisplay();
    this.notifyStatsChanged();
  }

  decrementUpgrade(type: UpgradeType): boolean {
    const result = this.playerStats.removeUpgrade(type);
    this.updateDisplay();
    if (result) {
      this.notifyStatsChanged();
    }
    return result;
  }

  private notifyStatsChanged(): void {
    if (this.onStatsChangedCallback) {
      this.onStatsChangedCallback();
    }
  }

  getUpgradeLevel(type: UpgradeType): number {
    return this.playerStats.getUpgradeCount(type);
  }

  getAllUpgradeTypes(): UpgradeType[] {
    return PlayerStats.getAllUpgradeTypes();
  }

  updateDisplay(): void {
    for (const row of this.upgradeRows) {
      const typedRow = row as Container & { levelText?: Text; upgradeType?: UpgradeType };
      if (typedRow.levelText && typedRow.upgradeType) {
        typedRow.levelText.text = `Lv.${this.playerStats.getUpgradeCount(typedRow.upgradeType)}`;
      }
    }
  }

  destroy(): void {
    for (const row of this.upgradeRows) {
      row.destroy({ children: true });
    }
    this.upgradeRows = [];

    if (this.titleText) {
      this.titleText.destroy();
      this.titleText = null;
    }

    this.background.destroy();
    this.container.destroy({ children: true });
  }
}
