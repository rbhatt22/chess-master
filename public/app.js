let gameId = null;
let selectedSquare = null;
let boardState = null;

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

// Initialize game
async function initGame() {
    try {
        const response = await fetch('/api/game/new', { method: 'POST' });
        const data = await response.json();
        gameId = data.gameId;
        boardState = data.state;
        renderBoard();
        updateUI();
    } catch (error) {
        showMessage('Failed to initialize game', 'error');
        console.error(error);
    }
}

// Render the chess board
function renderBoard() {
    const board = document.getElementById('chessBoard');
    board.innerHTML = '';

    if (!boardState || !boardState.board) return;

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            const isLight = (row + col) % 2 === 0;
            square.className = `square ${isLight ? 'light' : 'dark'}`;
            square.dataset.row = row;
            square.dataset.col = col;
            square.dataset.square = `${files[col]}${ranks[row]}`;

            // Add piece if present
            const piece = boardState.board[row][col];
            if (piece) {
                square.textContent = piece.symbol;
                square.dataset.piece = `${piece.color}-${piece.type}`;
            }

            // Add coordinate labels
            if (row === 7) {
                const fileLabel = document.createElement('span');
                fileLabel.className = 'coord-label file';
                fileLabel.textContent = files[col];
                square.appendChild(fileLabel);
            }
            if (col === 0) {
                const rankLabel = document.createElement('span');
                rankLabel.className = 'coord-label rank';
                rankLabel.textContent = ranks[row];
                square.appendChild(rankLabel);
            }

            square.addEventListener('click', () => handleSquareClick(row, col));
            board.appendChild(square);
        }
    }
}

// Handle square click
function handleSquareClick(row, col) {
    const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    const piece = boardState.board[row][col];

    // If a square is already selected
    if (selectedSquare) {
        const [selectedRow, selectedCol] = selectedSquare;
        
        // If clicking the same square, deselect
        if (selectedRow === row && selectedCol === col) {
            clearSelection();
            return;
        }

        // Try to make move
        const fromSquare = `${files[selectedCol]}${ranks[selectedRow]}`;
        const toSquare = `${files[col]}${ranks[row]}`;
        makeMove(`${fromSquare} ${toSquare}`);
        clearSelection();
        return;
    }

    // Select square if it has a piece of current player's color
    if (piece && piece.color === boardState.currentPlayer) {
        selectedSquare = [row, col];
        square.classList.add('selected');
    }
}

// Clear selection
function clearSelection() {
    if (selectedSquare) {
        const [row, col] = selectedSquare;
        const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (square) {
            square.classList.remove('selected');
        }
        selectedSquare = null;
    }
}

// Make a move
async function makeMove(move) {
    if (!gameId) {
        showMessage('Game not initialized', 'error');
        return;
    }

    try {
        const response = await fetch(`/api/game/${gameId}/move`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ move })
        });

        const data = await response.json();
        
        if (data.success) {
            boardState = data.state;
            renderBoard();
            updateUI();
            showMessage(data.message, 'success');
        } else {
            showMessage(data.message, 'error');
        }
    } catch (error) {
        showMessage('Failed to make move', 'error');
        console.error(error);
    }
}

// Update UI elements
function updateUI() {
    if (!boardState) return;

    const currentPlayerEl = document.getElementById('currentPlayer');
    const gameStatusEl = document.getElementById('gameStatus');

    currentPlayerEl.textContent = boardState.currentPlayer.charAt(0).toUpperCase() + boardState.currentPlayer.slice(1);
    currentPlayerEl.className = `player ${boardState.currentPlayer}`;

    if (boardState.gameOver) {
        gameStatusEl.textContent = `Game Over! ${boardState.winner} wins!`;
        gameStatusEl.className = 'game-status winner';
    } else {
        gameStatusEl.textContent = '';
        gameStatusEl.className = 'game-status';
    }
}

// Show message
function showMessage(text, type = 'info') {
    const messageEl = document.getElementById('message');
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
    
    setTimeout(() => {
        if (messageEl.textContent === text) {
            messageEl.textContent = '';
            messageEl.className = 'message';
        }
    }, 3000);
}

// Reset game
async function resetGame() {
    if (!gameId) return;

    try {
        const response = await fetch(`/api/game/${gameId}/reset`, { method: 'POST' });
        const data = await response.json();
        boardState = data.state;
        renderBoard();
        updateUI();
        clearSelection();
        showMessage('Game reset', 'success');
    } catch (error) {
        showMessage('Failed to reset game', 'error');
        console.error(error);
    }
}

// Event listeners
document.getElementById('makeMoveBtn').addEventListener('click', () => {
    const moveInput = document.getElementById('moveInput');
    const move = moveInput.value.trim();
    if (move) {
        makeMove(move);
        moveInput.value = '';
    }
});

document.getElementById('moveInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const move = e.target.value.trim();
        if (move) {
            makeMove(move);
            e.target.value = '';
        }
    }
});

document.getElementById('newGameBtn').addEventListener('click', () => {
    initGame();
    clearSelection();
    showMessage('New game started', 'success');
});

document.getElementById('resetBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to reset the game?')) {
        resetGame();
    }
});

// Initialize on load
initGame();

