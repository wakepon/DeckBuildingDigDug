import { Container } from 'pixi.js';
import { Gem } from './Gem';
import { GEM_EXP_VALUE } from './constants';

export class GemManager {
  public container: Container;
  private gems: Gem[] = [];
  private onExpGained: ((exp: number) => void) | null = null;

  constructor() {
    this.container = new Container();
  }

  setOnExpGained(callback: (exp: number) => void): void {
    this.onExpGained = callback;
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
          this.onExpGained(GEM_EXP_VALUE);
        }
        this.container.removeChild(gem.graphics);
        gem.destroy();
        this.gems.splice(i, 1);
      }
    }
  }
}
