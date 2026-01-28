import { Game } from './Game';

async function main() {
  try {
    const game = new Game();
    await game.init();
  } catch (error) {
    console.error('Failed to initialize game:', error);
    throw new Error('Game initialization failed');
  }
}

main().catch(console.error);
