import { Game } from './Game.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const game = new Game();

console.log('Welcome to Chess Master!');
console.log('Enter moves in algebraic notation (e.g., "e2 e4" or "e2e4")');
console.log('Type "quit" or "exit" to end the game\n');

game.display();

const promptMove = () => {
  rl.question(`${game.getCurrentPlayer()}'s move: `, (input) => {
    const move = input.trim().toLowerCase();
    
    if (move === 'quit' || move === 'exit') {
      console.log('\nThanks for playing!');
      rl.close();
      return;
    }
    
    if (move === 'board' || move === 'b') {
      game.display();
      promptMove();
      return;
    }
    
    if (move === 'help' || move === 'h') {
      console.log('\nCommands:');
      console.log('  - Enter moves: "e2 e4" or "e2e4"');
      console.log('  - View board: "board" or "b"');
      console.log('  - Quit: "quit" or "exit"');
      console.log('');
      promptMove();
      return;
    }
    
    const result = game.makeMove(move);
    console.log(result.message);
    
    if (result.success) {
      game.display();
    }
    
    if (!game.gameOver) {
      promptMove();
    } else {
      rl.close();
    }
  });
};

promptMove();

