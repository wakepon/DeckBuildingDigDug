import { Application, Container } from 'pixi.js';
import { SCREEN_WIDTH, SCREEN_HEIGHT, WORLD_WIDTH, WORLD_HEIGHT } from './constants';
import { WallManager } from './WallManager';
import { InputManager } from './InputManager';
import { Player } from './Player';
import { BulletManager } from './BulletManager';
import { ParticleManager } from './ParticleManager';
import { EnemyManager } from './EnemyManager';
import { GemManager } from './GemManager';
import { UI } from './UI';

export class Game {
  private app: Application;
  private gameContainer: Container;
  private wallManager!: WallManager;
  private inputManager!: InputManager;
  private player!: Player;
  private bulletManager!: BulletManager;
  private particleManager!: ParticleManager;
  private enemyManager!: EnemyManager;
  private gemManager!: GemManager;
  private ui!: UI;

  constructor() {
    this.app = new Application();
    this.gameContainer = new Container();
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

    // Initialize input manager
    this.inputManager = new InputManager();
    this.inputManager.setCanvas(this.app.canvas);

    // Initialize wall manager
    this.wallManager = new WallManager();

    // Initialize player
    this.player = new Player(this.inputManager, this.wallManager);

    // Initialize bullet manager
    this.bulletManager = new BulletManager(
      this.wallManager,
      this.inputManager,
      this.player
    );

    // Initialize particle manager
    this.particleManager = new ParticleManager();

    // Initialize enemy manager
    this.enemyManager = new EnemyManager();

    // Initialize gem manager
    this.gemManager = new GemManager();

    // Initialize UI
    this.ui = new UI();

    // Connect managers
    this.bulletManager.setEnemyManager(this.enemyManager);

    // Wall destruction -> particles + enemy spawn
    this.bulletManager.setOnWallDestroyed((x, y, color) => {
      this.particleManager.emit(x, y, color);
      this.enemyManager.onWallDestroyed(x, y);
    });

    // Enemy death -> gem spawn + death particles
    this.enemyManager.setOnEnemyDeath((x, y) => {
      this.gemManager.spawnGem(x, y);
      this.particleManager.emit(x, y, 0xff4444); // Red particles for enemy death
    });

    // Enemy damages player
    this.enemyManager.setOnPlayerDamage((damage) => {
      this.player.takeDamage(damage);
    });

    // Gem collected -> add exp
    this.gemManager.setOnExpGained((exp) => {
      this.player.addExp(exp);
    });

    // Build scene hierarchy
    this.gameContainer.addChild(this.wallManager.container);
    this.gameContainer.addChild(this.gemManager.container);
    this.gameContainer.addChild(this.bulletManager.container);
    this.gameContainer.addChild(this.enemyManager.container);
    this.gameContainer.addChild(this.player.container);
    this.gameContainer.addChild(this.particleManager.container);

    this.app.stage.addChild(this.gameContainer);
    this.app.stage.addChild(this.ui.container); // UI is on top, not affected by camera

    // Start game loop
    this.app.ticker.add(this.update.bind(this));
  }

  private update(): void {
    const deltaTime = this.app.ticker.deltaMS / 1000;

    // Update game components
    this.player.update(deltaTime);

    // Get camera position for bullet manager
    const cameraX = this.gameContainer.x;
    const cameraY = this.gameContainer.y;

    this.bulletManager.update(deltaTime, cameraX, cameraY);
    this.enemyManager.update(deltaTime, this.player.x, this.player.y);
    this.gemManager.update(deltaTime, this.player.x, this.player.y);
    this.particleManager.update(deltaTime);
    this.wallManager.update();

    // Update UI
    this.ui.updateHP(this.player.hp, this.player.maxHp);
    this.ui.updateEXP(this.player.exp);

    // Update camera to follow player
    this.updateCamera();
  }

  private updateCamera(): void {
    // Center camera on player
    const targetX = SCREEN_WIDTH / 2 - this.player.x;
    const targetY = SCREEN_HEIGHT / 2 - this.player.y;

    // Clamp camera to world bounds
    const minX = SCREEN_WIDTH - WORLD_WIDTH;
    const maxX = 0;
    const minY = SCREEN_HEIGHT - WORLD_HEIGHT;
    const maxY = 0;

    this.gameContainer.x = Math.max(minX, Math.min(maxX, targetX));
    this.gameContainer.y = Math.max(minY, Math.min(maxY, targetY));
  }

  get stage() {
    return this.app.stage;
  }
}
