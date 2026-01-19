import { Container } from 'pixi.js';
import { Gem } from './Gem';
import { GEM_EXP_VALUE } from './constants';

export class GemManager {
  public container: Container;
  private gems: Gem[] = [];
  private onExpGained: ((exp: number) => void) | null = null;
  private expValue: number = GEM_EXP_VALUE;

  constructor() {
    this.container = new Container();
  }

  setOnExpGained(callback: (exp: number) => void): void {
    this.onExpGained = callback;
  }

  setExpValue(value: number): void {
    this.expValue = value;
  }

  spawnGem(x: number, y: number): void {
    const gem = new Gem(x, y);
    this.gems.push(gem);
    this.container.addChild(gem.graphics);
  }

  update(deltaTime: number, playerX: number, playerY: number): void {
    for (let i = this.gems.length - 1; i >= 0; i--) {
      const gem = this.gems[i];

      const collected = gem.update(deltaTime, playerX, playerY);

      if (collected || !gem.active) {
        if (gem.collected && this.onExpGained) {
          this.onExpGained(this.expValue);
        }
        this.container.removeChild(gem.graphics);
        gem.destroy();
        this.gems.splice(i, 1);
      }
    }
  }

  clear(): void {
    for (const gem of this.gems) {
      this.container.removeChild(gem.graphics);
      gem.destroy();
    }
    this.gems = [];
  }
}
