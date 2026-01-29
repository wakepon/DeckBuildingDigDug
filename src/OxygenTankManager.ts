import { Container } from 'pixi.js';
import { OxygenTank } from './OxygenTank';
import { EventBus } from './EventBus';
import {
  OXYGEN_TANK_SPAWN_CHANCE,
  OXYGEN_TANK_RESTORE,
  OXYGEN_TANK_INITIAL_COUNT,
  OXYGEN_MAX,
  TILE_SIZE,
  FLOOR_SIZE_SCALING,
} from './constants';

// Interface for spawn center position (grid coordinates)
interface SpawnCenter {
  x: number;
  y: number;
}

export class OxygenTankManager {
  public container: Container;
  private tanks: OxygenTank[] = [];
  private eventBus: EventBus;
  private spawnCenterX: number;
  private spawnCenterY: number;

  constructor(eventBus: EventBus, spawnCenter?: SpawnCenter) {
    this.eventBus = eventBus;
    this.container = new Container();

    // Use provided spawn center or default to floor 1 center
    this.spawnCenterX = spawnCenter?.x ?? Math.floor(FLOOR_SIZE_SCALING.BASE_COLS / 2);
    this.spawnCenterY = spawnCenter?.y ?? Math.floor(FLOOR_SIZE_SCALING.BASE_ROWS / 2);
  }

  // Update spawn center for floor transitions
  setSpawnCenter(spawnCenter: SpawnCenter): void {
    this.spawnCenterX = spawnCenter.x;
    this.spawnCenterY = spawnCenter.y;
  }

  // Called at floor start to place tanks in safe zone
  spawnInitialTanks(): void {
    const positions = this.getSafeZonePositions();

    for (let i = 0; i < Math.min(OXYGEN_TANK_INITIAL_COUNT, positions.length); i++) {
      const pos = positions[i];
      this.spawnTank(pos.x, pos.y);
    }
  }

  // Made public for testing purposes
  getSafeZonePositions(): { x: number; y: number }[] {
    const positions: { x: number; y: number }[] = [];
    const centerX = (this.spawnCenterX + 0.5) * TILE_SIZE;
    const centerY = (this.spawnCenterY + 0.5) * TILE_SIZE;

    // Place tanks in corners of safe zone
    const offset = TILE_SIZE * 0.8;
    positions.push(
      { x: centerX - offset, y: centerY - offset },
      { x: centerX + offset, y: centerY - offset },
      { x: centerX - offset, y: centerY + offset },
      { x: centerX + offset, y: centerY + offset }
    );

    return positions;
  }

  // Called when a wall is destroyed
  onWallDestroyed(x: number, y: number): void {
    if (Math.random() < OXYGEN_TANK_SPAWN_CHANCE) {
      this.spawnTank(x, y);
    }
  }

  spawnTank(x: number, y: number): void {
    const tank = new OxygenTank(x, y);
    this.tanks.push(tank);
    this.container.addChild(tank.graphics);
  }

  update(deltaTime: number, playerX: number, playerY: number): void {
    for (let i = this.tanks.length - 1; i >= 0; i--) {
      const tank = this.tanks[i];

      const collected = tank.update(deltaTime, playerX, playerY);

      if (collected || !tank.active) {
        if (tank.collected) {
          const amount = OXYGEN_MAX * OXYGEN_TANK_RESTORE;
          this.eventBus.emit({ type: 'OXYGEN_TANK_COLLECTED', amount });
        }
        this.container.removeChild(tank.graphics);
        tank.destroy();
        this.tanks.splice(i, 1);
      }
    }
  }

  clear(): void {
    for (const tank of this.tanks) {
      this.container.removeChild(tank.graphics);
      tank.destroy();
    }
    this.tanks = [];
  }
}
