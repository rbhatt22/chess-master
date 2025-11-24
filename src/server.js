import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Game } from './Game.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Store game instances (in production, use a proper session/store)
const games = new Map();

// Middleware
app.use(express.json());
app.use(express.static(join(__dirname, '../public')));

// Create a new game
app.post('/api/game/new', (req, res) => {
  const gameId = Date.now().toString();
  const game = new Game();
  games.set(gameId, game);
  res.json({ gameId, state: game.getState() });
});

// Get game state
app.get('/api/game/:gameId', (req, res) => {
  const { gameId } = req.params;
  const game = games.get(gameId);
  
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }
  
  res.json({ state: game.getState() });
});

// Make a move
app.post('/api/game/:gameId/move', (req, res) => {
  const { gameId } = req.params;
  const { move } = req.body;
  
  const game = games.get(gameId);
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }
  
  if (!move) {
    return res.status(400).json({ error: 'Move is required' });
  }
  
  const result = game.makeMove(move);
  res.json({
    success: result.success,
    message: result.message,
    state: game.getState()
  });
});

// Reset game
app.post('/api/game/:gameId/reset', (req, res) => {
  const { gameId } = req.params;
  const game = games.get(gameId);
  
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }
  
  const newGame = new Game();
  games.set(gameId, newGame);
  res.json({ state: newGame.getState() });
});

// Get possible moves for a square
app.get('/api/game/:gameId/possible-moves', (req, res) => {
  const { gameId } = req.params;
  const { row, col } = req.query;
  
  const game = games.get(gameId);
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }
  
  if (row === undefined || col === undefined) {
    return res.status(400).json({ error: 'Row and col parameters are required' });
  }
  
  const possibleMoves = game.getPossibleMoves(parseInt(row), parseInt(col));
  res.json({ possibleMoves });
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Chess Master web server running on http://localhost:${PORT}`);
  console.log(`Open your browser and navigate to http://localhost:${PORT}`);
});

