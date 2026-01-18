import { Game } from './Game';

async function main() {
  const game = new Game();
  await game.init();
  console.log('Break & Breath initialized!');
}

main().catch(console.error);
