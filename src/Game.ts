import { Application } from 'pixi.js';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from './constants';
import { WallManager } from './WallManager';

export class Game {
  private app: Application;
  private wallManager: WallManager | null = null;

  constructor() {
    this.app = new Application();
  }

  async init(): Promise<void> {
    // Initialize PixiJS Application
    await this.app.init({
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
      backgroundColor: 0x16213e,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    // Add canvas to DOM
    const container = document.getElementById('game-container');
    if (container) {
      container.appendChild(this.app.canvas);
    }

    // Initialize game components
    this.wallManager = new WallManager();
    this.app.stage.addChild(this.wallManager.container);

    // Start game loop
    this.app.ticker.add(this.update.bind(this));
  }

  private update(): void {
    // Main game loop - will be used for animations and game logic
    if (this.wallManager) {
      this.wallManager.update();
    }
  }

  get stage() {
    return this.app.stage;
  }
}
