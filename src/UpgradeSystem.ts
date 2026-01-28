import { Container, Graphics, Text } from 'pixi.js';
import { SCREEN_WIDTH, SCREEN_HEIGHT, UPGRADE_CHOICES } from './constants';
import { PlayerStats, UpgradeType, UPGRADE_DATA } from './PlayerStats';

export class UpgradeSystem {
  public container: Container;
  private background: Graphics;
  private title: Text;
  private upgradeCards: Container[] = [];
  private currentChoices: UpgradeType[] = [];
  private playerStats: PlayerStats;
  private isActive: boolean = false;
  private onUpgradeSelected: ((type: UpgradeType) => void) | null = null;
  private pendingUpgrades: number = 0;

  constructor(playerStats: PlayerStats) {
    this.playerStats = playerStats;
    this.container = new Container();
    this.container.visible = false;

    // Dark overlay background
    this.background = new Graphics();
    this.background.rect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    this.background.fill({ color: 0x000000, alpha: 0.8 });
    this.container.addChild(this.background);

    // Title
    this.title = new Text({
      text: 'LEVEL UP!',
      style: {
        fontFamily: 'Arial',
        fontSize: 48,
        fontWeight: 'bold',
        fill: 0xffdd00,
        dropShadow: {
          color: 0x000000,
          blur: 4,
          distance: 2,
        },
      },
    });
    this.title.anchor.set(0.5, 0.5);
    this.title.x = SCREEN_WIDTH / 2;
    this.title.y = 80;
    this.container.addChild(this.title);

    // Make background interactive to prevent clicks through
    this.background.eventMode = 'static';
  }

  setOnUpgradeSelected(callback: (type: UpgradeType) => void): void {
    this.onUpgradeSelected = callback;
  }

  // Show upgrade selection with specified count
  show(upgradeCount: number = 1): void {
    this.pendingUpgrades = upgradeCount;
    this.showNextUpgrade();
  }

  private showNextUpgrade(): void {
    if (this.pendingUpgrades <= 0) {
      this.hide();
      return;
    }

    this.pendingUpgrades--;
    this.isActive = true;
    this.container.visible = true;

    // Update title for multiple upgrades
    if (this.pendingUpgrades > 0) {
      this.title.text = `LEVEL UP! (残り${this.pendingUpgrades + 1}回)`;
    } else {
      this.title.text = 'LEVEL UP!';
    }

    // Clear previous cards
    this.clearCards();

    // Get random upgrades (filtered by max level)
    this.currentChoices = this.playerStats.getRandomUpgrades(UPGRADE_CHOICES);

    // Handle case when no upgrades are available (all maxed)
    if (this.currentChoices.length === 0) {
      this.showAllMaxedMessage();
      return;
    }

    // Create upgrade cards
    const cardWidth = 180;
    const cardHeight = 220;
    const cardSpacing = 30;
    const actualChoices = this.currentChoices.length;
    const totalWidth = actualChoices * cardWidth + (actualChoices - 1) * cardSpacing;
    const startX = (SCREEN_WIDTH - totalWidth) / 2;

    for (let i = 0; i < this.currentChoices.length; i++) {
      const upgradeType = this.currentChoices[i];
      const card = this.createUpgradeCard(upgradeType, cardWidth, cardHeight);
      card.x = startX + i * (cardWidth + cardSpacing);
      card.y = SCREEN_HEIGHT / 2 - cardHeight / 2 + 30;
      this.container.addChild(card);
      this.upgradeCards.push(card);
    }
  }

  private showAllMaxedMessage(): void {
    // Show message that all upgrades are maxed
    const messageText = new Text({
      text: '全てのアップグレードが最大レベルです!',
      style: {
        fontFamily: 'Arial',
        fontSize: 24,
        fontWeight: 'bold',
        fill: 0xffdd00,
      },
    });
    messageText.anchor.set(0.5, 0.5);
    messageText.x = SCREEN_WIDTH / 2;
    messageText.y = SCREEN_HEIGHT / 2;
    this.container.addChild(messageText);

    // Create a continue button
    const button = new Container();
    const buttonBg = new Graphics();
    buttonBg.roundRect(0, 0, 160, 50, 8);
    buttonBg.fill(0x44ff44);
    button.addChild(buttonBg);

    const buttonText = new Text({
      text: '続ける',
      style: {
        fontFamily: 'Arial',
        fontSize: 20,
        fontWeight: 'bold',
        fill: 0x000000,
      },
    });
    buttonText.anchor.set(0.5, 0.5);
    buttonText.x = 80;
    buttonText.y = 25;
    button.addChild(buttonText);

    button.x = SCREEN_WIDTH / 2 - 80;
    button.y = SCREEN_HEIGHT / 2 + 50;
    button.eventMode = 'static';
    button.cursor = 'pointer';
    button.on('pointerdown', () => {
      this.container.removeChild(messageText);
      this.container.removeChild(button);
      messageText.destroy();
      button.destroy({ children: true });
      this.showNextUpgrade();
    });

    this.container.addChild(button);
  }

  private createUpgradeCard(type: UpgradeType, width: number, height: number): Container {
    const card = new Container();
    const info = UPGRADE_DATA[type];
    const count = this.playerStats.getUpgradeCount(type);

    // Card background
    const bg = new Graphics();
    bg.roundRect(0, 0, width, height, 12);
    bg.fill(0x1a1a2e);
    bg.roundRect(0, 0, width, height, 12);
    bg.stroke({ width: 3, color: info.color });
    card.addChild(bg);

    // Icon background circle
    const iconBg = new Graphics();
    iconBg.circle(width / 2, 50, 35);
    iconBg.fill({ color: info.color, alpha: 0.3 });
    card.addChild(iconBg);

    // Icon text
    const icon = new Text({
      text: info.icon,
      style: {
        fontFamily: 'Arial',
        fontSize: 36,
        fill: info.color,
      },
    });
    icon.anchor.set(0.5, 0.5);
    icon.x = width / 2;
    icon.y = 50;
    card.addChild(icon);

    // Upgrade name
    const nameText = new Text({
      text: info.name,
      style: {
        fontFamily: 'Arial',
        fontSize: 18,
        fontWeight: 'bold',
        fill: 0xffffff,
      },
    });
    nameText.anchor.set(0.5, 0);
    nameText.x = width / 2;
    nameText.y = 100;
    card.addChild(nameText);

    // Description
    const descText = new Text({
      text: info.description,
      style: {
        fontFamily: 'Arial',
        fontSize: 14,
        fill: 0xcccccc,
      },
    });
    descText.anchor.set(0.5, 0);
    descText.x = width / 2;
    descText.y = 130;
    card.addChild(descText);

    // Level display showing progress toward max
    const maxLevel = info.maxLevel;
    const levelDisplayText = `Lv.${count} / ${maxLevel}`;
    const levelText = new Text({
      text: levelDisplayText,
      style: {
        fontFamily: 'Arial',
        fontSize: 12,
        fill: count === 0 ? 0x666666 : 0x88ff88,
      },
    });
    levelText.anchor.set(0.5, 0);
    levelText.x = width / 2;
    levelText.y = 155;
    card.addChild(levelText);

    // Select button
    const button = new Graphics();
    button.roundRect(20, height - 50, width - 40, 36, 8);
    button.fill(info.color);
    card.addChild(button);

    const buttonText = new Text({
      text: '選択',
      style: {
        fontFamily: 'Arial',
        fontSize: 16,
        fontWeight: 'bold',
        fill: 0x000000,
      },
    });
    buttonText.anchor.set(0.5, 0.5);
    buttonText.x = width / 2;
    buttonText.y = height - 32;
    card.addChild(buttonText);

    // Make card interactive
    card.eventMode = 'static';
    card.cursor = 'pointer';

    // Hover effects
    card.on('pointerover', () => {
      card.scale.set(1.05);
      bg.clear();
      bg.roundRect(0, 0, width, height, 12);
      bg.fill(0x2a2a4e);
      bg.roundRect(0, 0, width, height, 12);
      bg.stroke({ width: 4, color: info.color });
    });

    card.on('pointerout', () => {
      card.scale.set(1);
      bg.clear();
      bg.roundRect(0, 0, width, height, 12);
      bg.fill(0x1a1a2e);
      bg.roundRect(0, 0, width, height, 12);
      bg.stroke({ width: 3, color: info.color });
    });

    card.on('pointerdown', () => {
      this.selectUpgrade(type);
    });

    return card;
  }

  private selectUpgrade(type: UpgradeType): void {
    // Apply upgrade
    this.playerStats.applyUpgrade(type);

    // Callback
    if (this.onUpgradeSelected) {
      this.onUpgradeSelected(type);
    }

    // Show next upgrade or hide
    this.showNextUpgrade();
  }

  private clearCards(): void {
    for (const card of this.upgradeCards) {
      this.container.removeChild(card);
      card.destroy();
    }
    this.upgradeCards = [];
    this.currentChoices = [];
  }

  hide(): void {
    this.isActive = false;
    this.container.visible = false;
    this.clearCards();
    this.pendingUpgrades = 0;
  }

  get active(): boolean {
    return this.isActive;
  }

  // Add pending upgrades (for treasure chests)
  addPendingUpgrades(count: number): void {
    if (this.isActive) {
      this.pendingUpgrades += count;
      this.title.text = `LEVEL UP! (残り${this.pendingUpgrades + 1}回)`;
    } else {
      this.show(count);
    }
  }
}
