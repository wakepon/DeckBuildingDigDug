import { Application, Container } from 'pixi.js';
import { EventBus } from './EventBus';
import { SCREEN_WIDTH, SCREEN_HEIGHT, WORLD_WIDTH, WORLD_HEIGHT, TILE_SIZE, PLAYER_SPAWN_CENTER_X, PLAYER_SPAWN_CENTER_Y, ELITE_COLOR } from './constants';
import { WallManager } from './WallManager';
import { InputManager } from './InputManager';
import { Player } from './Player';
import { BulletManager } from './BulletManager';
import { ParticleManager } from './ParticleManager';
import { EnemyManager } from './EnemyManager';
import { GemManager } from './GemManager';
import { UI } from './UI';
import { OxygenController } from './OxygenController';
import { OverlayEffect } from './OverlayEffect';
import { FloorManager } from './FloorManager';
import { OxygenTankManager } from './OxygenTankManager';
import { Stairs } from './Stairs';
import { TransitionEffect } from './TransitionEffect';
import { PlayerStats } from './PlayerStats';
import { UpgradeSystem } from './UpgradeSystem';
import { StatsDisplay } from './StatsDisplay';
import { DebugWindow } from './DebugWindow';
import { AutoAimSystem } from './AutoAimSystem';

export class Game {
  private app: Application;
  private gameContainer: Container;
  private eventBus: EventBus;
  private wallManager!: WallManager;
  private inputManager!: InputManager;
  private player!: Player;
  private bulletManager!: BulletManager;
  private particleManager!: ParticleManager;
  private enemyManager!: EnemyManager;
  private gemManager!: GemManager;
  private ui!: UI;
  private oxygenController!: OxygenController;
  private overlayEffect!: OverlayEffect;
  private floorManager!: FloorManager;
  private oxygenTankManager!: OxygenTankManager;
  private stairs!: Stairs;
  private transitionEffect!: TransitionEffect;
  private playerStats!: PlayerStats;
  private upgradeSystem!: UpgradeSystem;
  private statsDisplay!: StatsDisplay;
  private debugWindow!: DebugWindow;
  private autoAimSystem!: AutoAimSystem;
  private isTransitioning: boolean = false;
  private isPaused: boolean = false;

  constructor() {
    this.app = new Application();
    this.gameContainer = new Container();
    this.eventBus = new EventBus();
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

    // Initialize player stats (must be before other systems that use it)
    this.playerStats = new PlayerStats();

    // Initialize floor manager
    this.floorManager = new FloorManager();

    // Initialize wall manager with floor manager for HP scaling
    this.wallManager = new WallManager(this.floorManager);

    // Initialize stairs
    const stairsPos = this.wallManager.stairsPosition;
    this.stairs = new Stairs(stairsPos.x, stairsPos.y);

    // Initialize player with stats
    this.player = new Player(this.inputManager, this.wallManager, this.playerStats);

    // Initialize bullet manager with stats
    this.bulletManager = new BulletManager(
      this.wallManager,
      this.inputManager,
      this.player,
      this.playerStats,
      this.eventBus
    );

    // Initialize particle manager
    this.particleManager = new ParticleManager();

    // Initialize enemy manager with EventBus, scaled HP and spawn chance
    this.enemyManager = new EnemyManager(this.eventBus);
    this.enemyManager.setEnemyHP(this.floorManager.getEnemyHP());
    this.enemyManager.setEnemySpawnChance(this.floorManager.getEnemySpawnChance());

    // Initialize gem manager with stats, EventBus, and scaled EXP
    this.gemManager = new GemManager(this.playerStats, this.eventBus);
    this.gemManager.setExpValue(this.floorManager.getGemExpValue());

    // Initialize oxygen tank manager with EventBus
    this.oxygenTankManager = new OxygenTankManager(this.eventBus);

    // Initialize oxygen controller with stats
    this.oxygenController = new OxygenController(this.playerStats);

    // Initialize overlay effect
    this.overlayEffect = new OverlayEffect();

    // Initialize transition effect
    this.transitionEffect = new TransitionEffect();

    // Initialize upgrade system
    this.upgradeSystem = new UpgradeSystem(this.playerStats);

    // Initialize stats display
    this.statsDisplay = new StatsDisplay(this.playerStats);

    // Initialize debug window
    this.debugWindow = new DebugWindow(this.playerStats);

    // Debug window stats changed callback
    this.debugWindow.setOnStatsChanged(() => {
      this.statsDisplay.updateDisplay();
    });

    // Initialize auto-aim system
    this.autoAimSystem = new AutoAimSystem();
    this.autoAimSystem.setEnabled(this.playerStats.autoAimEnabled);

    // Initialize UI
    this.ui = new UI();

    // Connect managers
    this.bulletManager.setEnemyManager(this.enemyManager);
    this.bulletManager.setAutoAimSystem(this.autoAimSystem);

    // Setup EventBus listeners
    this.setupEventListeners();

    // Initial oxygen tanks in safe zone
    this.oxygenTankManager.spawnInitialTanks();

    // Build scene hierarchy
    this.gameContainer.addChild(this.wallManager.container);
    this.gameContainer.addChild(this.stairs.graphics);
    this.gameContainer.addChild(this.oxygenTankManager.container);
    this.gameContainer.addChild(this.gemManager.container);
    this.gameContainer.addChild(this.bulletManager.container);
    this.gameContainer.addChild(this.enemyManager.container);
    this.gameContainer.addChild(this.player.container);
    this.gameContainer.addChild(this.particleManager.container);

    this.app.stage.addChild(this.gameContainer);
    this.app.stage.addChild(this.overlayEffect.container); // Overlay on top of game
    this.app.stage.addChild(this.ui.container); // UI is on top of everything
    this.app.stage.addChild(this.statsDisplay.container); // Stats display
    this.app.stage.addChild(this.transitionEffect.graphics); // Transition on top of all
    this.app.stage.addChild(this.upgradeSystem.container); // Upgrade UI on very top
    this.app.stage.addChild(this.debugWindow.container); // Debug window on very top

    // Start game loop
    this.app.ticker.add(this.update.bind(this));
  }

  private setupEventListeners(): void {
    // Wall destruction -> particles + enemy spawn + oxygen tank spawn + stairs reveal
    this.eventBus.on('WALL_DESTROYED', (event) => {
      this.particleManager.emit(event.x, event.y, event.color);
      this.enemyManager.onWallDestroyed(event.x, event.y);
      this.oxygenTankManager.onWallDestroyed(event.x, event.y);

      // Check if stairs should be revealed
      const gridX = Math.floor(event.x / TILE_SIZE);
      const gridY = Math.floor(event.y / TILE_SIZE);
      if (this.wallManager.isStairsPosition(gridX, gridY)) {
        this.stairs.reveal();
        this.particleManager.emit(event.x, event.y, 0xffdd00); // Golden particles
      }
    });

    // Enemy death -> gem spawn + death particles
    this.eventBus.on('ENEMY_DIED', (event) => {
      this.gemManager.spawnGem(event.x, event.y);
      this.particleManager.emit(event.x, event.y, 0xff4444); // Red particles for enemy death
    });

    // Elite enemy death -> multiple gem spawn + death particles
    this.eventBus.on('ELITE_DIED', (event) => {
      // Spawn multiple gems for elite enemies
      for (let i = 0; i < 3; i++) {
        const offsetX = (Math.random() - 0.5) * 30;
        const offsetY = (Math.random() - 0.5) * 30;
        this.gemManager.spawnGem(event.x + offsetX, event.y + offsetY);
      }
      this.particleManager.emit(event.x, event.y, ELITE_COLOR); // Elite color particles
    });

    // Treasure chest collected -> show upgrade selection
    this.eventBus.on('CHEST_COLLECTED', (event) => {
      this.showUpgradeSelection(event.upgradeCount);
    });

    // Gem collected -> add exp and check level up
    this.eventBus.on('GEM_COLLECTED', (event) => {
      const leveledUp = this.playerStats.addExp(event.exp);
      if (leveledUp) {
        this.eventBus.emit({ type: 'LEVEL_UP' });
      }
    });

    // Level up -> show upgrade selection
    this.eventBus.on('LEVEL_UP', () => {
      this.showUpgradeSelection(1);
    });

    // Upgrade selected -> handle special effects
    this.eventBus.on('UPGRADE_SELECTED', (event) => {
      if (event.upgradeType === 'maxHp') {
        // Heal the amount of HP gained
        const oldMaxHp = this.playerStats.maxHp - 20; // UPGRADE_MAX_HP
        this.player.onMaxHpIncrease(oldMaxHp);
      }
      // Update stats display
      this.statsDisplay.updateDisplay();
    });

    // Player damaged -> take damage
    this.eventBus.on('PLAYER_DAMAGED', (event) => {
      this.player.takeDamage(event.damage);
    });

    // Oxygen warning -> overlay effect
    this.eventBus.on('OXYGEN_WARNING', (event) => {
      this.overlayEffect.setWarning(event.ratio < 0.2);
    });

    // Oxygen depleted -> overlay effect
    this.eventBus.on('OXYGEN_DEPLETED', () => {
      this.overlayEffect.setDepleted(true);
    });

    // Oxygen tank collected -> restore oxygen
    this.eventBus.on('OXYGEN_TANK_COLLECTED', (event) => {
      this.oxygenController.addOxygen(event.amount);
    });
  }

  private showUpgradeSelection(count: number): void {
    this.isPaused = true;
    this.upgradeSystem.show(count);
  }

  private update(): void {
    const deltaTime = this.app.ticker.deltaMS / 1000;

    // Check for debug window toggle (Shift + 1)
    if (this.inputManager.wasDebugKeyJustPressed()) {
      this.debugWindow.toggle();
    }

    // Check for auto-aim toggle (Q key)
    if (this.inputManager.wasAutoAimToggleJustPressed()) {
      const newState = this.playerStats.toggleAutoAim();
      this.autoAimSystem.setEnabled(newState);
      this.eventBus.emit({ type: 'AUTO_AIM_TOGGLED', enabled: newState });
    }

    // Update last move direction for auto-aim
    this.inputManager.updateLastMoveDirection();

    // Update previous keys state at the end of frame processing for input
    this.inputManager.updatePreviousKeys();

    // Update transition effect
    this.transitionEffect.update(deltaTime);

    // Check if upgrade selection is done
    if (this.isPaused && !this.upgradeSystem.active) {
      this.isPaused = false;
    }

    // Don't update game during transition or upgrade selection
    if (this.isTransitioning || this.isPaused) return;

    // Update game components
    this.player.update(deltaTime);

    // Get camera position for bullet manager
    const cameraX = this.gameContainer.x;
    const cameraY = this.gameContainer.y;

    this.bulletManager.update(deltaTime, cameraX, cameraY);
    this.enemyManager.update(deltaTime, this.player.x, this.player.y);
    this.gemManager.update(deltaTime, this.player.x, this.player.y);
    this.oxygenTankManager.update(deltaTime, this.player.x, this.player.y);
    this.particleManager.update(deltaTime);
    this.wallManager.update();
    this.stairs.update(deltaTime);

    // Update oxygen
    this.oxygenController.update(deltaTime);

    // Update overlay effects
    this.overlayEffect.update(deltaTime);

    // Check stairs collision for floor transition
    if (this.stairs.checkCollision(this.player.x, this.player.y)) {
      this.startFloorTransition();
    }

    // Update UI
    this.ui.update(deltaTime);
    this.ui.updateOxygen(this.oxygenController.oxygen, this.oxygenController.maxOxygen);
    this.ui.updateHP(this.player.hp, this.player.maxHp);
    this.ui.updateEXP(this.playerStats.exp, this.playerStats.level, this.playerStats.getRequiredExp());

    // Update camera to follow player
    this.updateCamera();
  }

  private startFloorTransition(): void {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    // Fade out
    this.transitionEffect.fadeOut(() => {
      // Move to next floor
      this.floorManager.nextFloor();

      // Reset floor state
      this.resetFloor();

      // Update UI
      this.ui.updateFloor(this.floorManager.currentFloor);

      // Fade in
      this.transitionEffect.fadeIn(() => {
        this.isTransitioning = false;
      });
    });
  }

  private resetFloor(): void {
    // Reset wall manager (generates new walls and stairs position)
    this.wallManager.reset();

    // Create new stairs at new position
    const oldStairs = this.stairs;
    this.gameContainer.removeChild(oldStairs.graphics);
    oldStairs.destroy();

    const stairsPos = this.wallManager.stairsPosition;
    this.stairs = new Stairs(stairsPos.x, stairsPos.y);
    // Add stairs after walls but before other objects
    this.gameContainer.addChildAt(this.stairs.graphics, 1);

    // Reset player position to spawn area
    this.player.resetPosition(
      (PLAYER_SPAWN_CENTER_X + 0.5) * TILE_SIZE,
      (PLAYER_SPAWN_CENTER_Y + 0.5) * TILE_SIZE
    );

    // Clear enemies
    this.enemyManager.clear();

    // Clear gems
    this.gemManager.clear();

    // Clear oxygen tanks and spawn initial tanks
    this.oxygenTankManager.clear();
    this.oxygenTankManager.spawnInitialTanks();

    // Clear bullets
    this.bulletManager.clear();

    // Clear particles
    this.particleManager.clear();

    // Note: Oxygen is NOT reset during floor transition
    // This allows oxygen to carry over between floors, adding strategic depth

    // Update enemy manager with new floor difficulty
    this.enemyManager.setEnemyHP(this.floorManager.getEnemyHP());
    this.enemyManager.setEnemySpawnChance(this.floorManager.getEnemySpawnChance());

    // Update gem manager with new floor EXP value
    this.gemManager.setExpValue(this.floorManager.getGemExpValue());

    // Reset camera to spawn position
    this.gameContainer.x = 0;
    this.gameContainer.y = 0;
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
