# chess-master
Chess learning game

A chess game built with Node.js.

<img width="1268" height="758" alt="image" src="https://github.com/user-attachments/assets/6240bc19-dbe3-4c97-888a-44170010ea2e" />


## Features

- ✅ Basic chess board with all pieces
- ✅ Move validation for all piece types
- ✅ Turn-based gameplay
- ✅ Terminal-based interface
- ✅ **Web-based interface with modern UI**
- ✅ Algebraic notation support
- ✅ Click-to-move interface

## Getting Started

### Prerequisites

- Node.js (v14 or higher)

### Installation

1. Clone the repository
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

## Running the Game

### Web Interface (Recommended)

Start the web server:

```bash
npm run web
```

Then open your browser and navigate to:
```
http://localhost:3000
```

The web interface features:
- Beautiful, modern UI with gradient background
- Click-to-move functionality
- Visual feedback for selected pieces
- Real-time game state updates
- Responsive design for mobile devices

### Terminal Interface

Run the terminal version:

```bash
npm start
```

## How to Play

### Web Interface

1. Click on a piece to select it (it will be highlighted)
2. Click on the destination square to move
3. Or use the move input field: enter moves like `e2 e4` and click "Move"
4. Use "New Game" to start a fresh game
5. Use "Reset" to reset the current game

### Terminal Interface

1. The game starts with white to move
2. Enter moves in algebraic notation:
   - Format: `e2 e4` or `e2e4`
   - Examples: `e2 e4`, `g1 f3`, `e7 e5`
3. Commands:
   - `board` or `b` - Display the board
   - `help` or `h` - Show help
   - `quit` or `exit` - End the game

## Project Structure

```
chess-master/
├── src/
│   ├── Piece.js    # Piece class and piece types
│   ├── Board.js    # Chess board representation
│   ├── Game.js     # Game logic and move validation
│   ├── index.js    # Terminal interface entry point
│   └── server.js   # Web server (Express)
├── public/
│   ├── index.html  # Web interface HTML
│   ├── styles.css  # Web interface styles
│   └── app.js      # Web interface JavaScript
├── package.json
└── README.md
```

## Future Enhancements

- [ ] Check detection
- [ ] Checkmate detection
- [ ] Castling
- [ ] En passant
- [ ] Pawn promotion
- [ ] Move history
- [ ] Undo/redo functionality
- [x] Web interface
- [ ] AI opponent
- [ ] Game saving/loading
- [ ] Multiplayer support
