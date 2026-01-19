import { Container, Graphics, Text } from 'pixi.js';
import { SCREEN_HEIGHT } from './constants';
import { PlayerStats, UpgradeType, UPGRADE_DATA } from './PlayerStats';

export class StatsDisplay {
  public container: Container;
  private playerStats: PlayerStats;
  private background: Graphics;
  private statsTexts: Text[] = [];
  private upgradeIcons: Container;
  private iconSize: number = 20;

  constructor(playerStats: PlayerStats) {
    this.playerStats = playerStats;
    this.container = new Container();

    // Position on left side
    this.container.x = 10;
    this.container.y = SCREEN_HEIGHT - 150;

    // Background panel
    this.background = new Graphics();
    this.container.addChild(this.background);

    // Upgrade icons container
    this.upgradeIcons = new Container();
    this.upgradeIcons.y = 70;
    this.container.addChild(this.upgradeIcons);

    this.updateDisplay();
  }

  updateDisplay(): void {
    // Clear previous texts
    for (const text of this.statsTexts) {
      this.container.removeChild(text);
      text.destroy();
    }
    this.statsTexts = [];

    // Calculate stats to display
    const stats = [
      { label: 'ATK', value: `${Math.round(this.playerStats.attackPower * 100)}%`, color: 0xff4444 },
      { label: 'SPD', value: `${Math.round((1 / this.playerStats.fireRate) * 5 * 100) / 100}/s`, color: 0xffff00 },
      { label: 'MOV', value: `${Math.round(this.playerStats.moveSpeed)}`, color: 0x44ffff },
      { label: 'O2', value: `-${Math.round((1 - this.playerStats.oxygenDrainRate) * 100)}%`, color: 0x88ccff },
    ];

    // Draw background
    this.background.clear();
    this.background.roundRect(0, 0, 100, 60, 6);
    this.background.fill({ color: 0x000000, alpha: 0.6 });

    // Title
    const title = new Text({
      text: 'STATS',
      style: {
        fontFamily: 'Arial',
        fontSize: 10,
        fontWeight: 'bold',
        fill: 0x888888,
      },
    });
    title.x = 5;
    title.y = 3;
    this.container.addChild(title);
    this.statsTexts.push(title);

    // Stats
    for (let i = 0; i < stats.length; i++) {
      const stat = stats[i];
      const x = (i % 2) * 50 + 5;
      const y = Math.floor(i / 2) * 18 + 18;

      const labelText = new Text({
        text: stat.label,
        style: {
          fontFamily: 'Arial',
          fontSize: 9,
          fill: stat.color,
        },
      });
      labelText.x = x;
      labelText.y = y;
      this.container.addChild(labelText);
      this.statsTexts.push(labelText);

      const valueText = new Text({
        text: stat.value,
        style: {
          fontFamily: 'Arial',
          fontSize: 10,
          fontWeight: 'bold',
          fill: 0xffffff,
        },
      });
      valueText.x = x;
      valueText.y = y + 10;
      this.container.addChild(valueText);
      this.statsTexts.push(valueText);
    }

    // Update upgrade icons
    this.updateUpgradeIcons();
  }

  private updateUpgradeIcons(): void {
    // Clear previous icons
    while (this.upgradeIcons.children.length > 0) {
      const child = this.upgradeIcons.children[0];
      this.upgradeIcons.removeChild(child);
      child.destroy();
    }

    // Get unique upgrades and their counts
    const upgradeCounts = new Map<UpgradeType, number>();
    for (const upgrade of this.playerStats.acquiredUpgrades) {
      upgradeCounts.set(upgrade, (upgradeCounts.get(upgrade) || 0) + 1);
    }

    // Create icons
    let index = 0;
    const iconsPerRow = 5;
    upgradeCounts.forEach((count, type) => {
      const info = UPGRADE_DATA[type];
      const x = (index % iconsPerRow) * (this.iconSize + 4);
      const y = Math.floor(index / iconsPerRow) * (this.iconSize + 4);

      const iconContainer = new Container();
      iconContainer.x = x;
      iconContainer.y = y;

      // Icon background
      const bg = new Graphics();
      bg.roundRect(0, 0, this.iconSize, this.iconSize, 4);
      bg.fill({ color: info.color, alpha: 0.3 });
      bg.roundRect(0, 0, this.iconSize, this.iconSize, 4);
      bg.stroke({ width: 1, color: info.color });
      iconContainer.addChild(bg);

      // Icon text
      const iconText = new Text({
        text: info.icon,
        style: {
          fontFamily: 'Arial',
          fontSize: 12,
          fill: info.color,
        },
      });
      iconText.anchor.set(0.5, 0.5);
      iconText.x = this.iconSize / 2;
      iconText.y = this.iconSize / 2;
      iconContainer.addChild(iconText);

      // Count badge if more than 1
      if (count > 1) {
        const badge = new Graphics();
        badge.circle(this.iconSize - 2, 2, 6);
        badge.fill(0xff4444);
        iconContainer.addChild(badge);

        const countText = new Text({
          text: `${count}`,
          style: {
            fontFamily: 'Arial',
            fontSize: 8,
            fontWeight: 'bold',
            fill: 0xffffff,
          },
        });
        countText.anchor.set(0.5, 0.5);
        countText.x = this.iconSize - 2;
        countText.y = 2;
        iconContainer.addChild(countText);
      }

      this.upgradeIcons.addChild(iconContainer);
      index++;
    });
  }
}
