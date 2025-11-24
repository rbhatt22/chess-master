let gameId = null;
let selectedSquare = null;
let boardState = null;
let possibleMoves = [];

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

    // Restore selection and highlights if they exist
    if (selectedSquare) {
        const [row, col] = selectedSquare;
        const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (square) {
            square.classList.add('selected');
        }
        // Only highlight if checkbox is checked
        const showMovesCheckbox = document.getElementById('showMovesCheckbox');
        if (showMovesCheckbox && showMovesCheckbox.checked) {
            highlightPossibleMoves();
        }
    }
}

// Handle square click
async function handleSquareClick(row, col) {
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

        // Check if this is a valid move
        const isValidMove = possibleMoves.some(([r, c]) => r === row && c === col);
        if (isValidMove) {
            // Try to make move
            const fromSquare = `${files[selectedCol]}${ranks[selectedRow]}`;
            const toSquare = `${files[col]}${ranks[row]}`;
            await makeMove(`${fromSquare} ${toSquare}`);
            clearSelection();
        } else {
            // If clicking on another piece of the same color, select that instead
            if (piece && piece.color === boardState.currentPlayer) {
                clearSelection();
                await selectSquare(row, col);
            } else {
                clearSelection();
            }
        }
        return;
    }

    // Select square if it has a piece of current player's color
    if (piece && piece.color === boardState.currentPlayer) {
        await selectSquare(row, col);
    }
}

// Select square and show possible moves
async function selectSquare(row, col) {
    selectedSquare = [row, col];
    const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (square) {
        square.classList.add('selected');
    }

    // Always fetch possible moves for validation, but only show them if checkbox is checked
    try {
        const response = await fetch(`/api/game/${gameId}/possible-moves?row=${row}&col=${col}`);
        const data = await response.json();
        possibleMoves = data.possibleMoves || [];
        
        // Only highlight if checkbox is checked
        const showMovesCheckbox = document.getElementById('showMovesCheckbox');
        if (showMovesCheckbox && showMovesCheckbox.checked) {
            highlightPossibleMoves();
        }
    } catch (error) {
        console.error('Failed to fetch possible moves:', error);
        possibleMoves = [];
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
    possibleMoves = [];
    clearPossibleMovesHighlight();
}

// Highlight possible moves
function highlightPossibleMoves() {
    possibleMoves.forEach(([row, col]) => {
        const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (square) {
            const piece = boardState.board[row][col];
            if (piece) {
                // Square has an enemy piece - highlight as capturable
                square.classList.add('capturable');
            } else {
                // Empty square - highlight as possible move
                square.classList.add('possible-move');
            }
        }
    });
}

// Clear possible moves highlight
function clearPossibleMovesHighlight() {
    document.querySelectorAll('.possible-move, .capturable').forEach(square => {
        square.classList.remove('possible-move', 'capturable');
    });
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
            clearSelection();
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

// Checkbox event listener for showing possible moves
document.getElementById('showMovesCheckbox').addEventListener('change', (e) => {
    if (!e.target.checked) {
        // If unchecked, clear any existing highlights
        clearPossibleMovesHighlight();
        possibleMoves = [];
    } else {
        // If checked and a piece is selected, show moves
        if (selectedSquare) {
            const [row, col] = selectedSquare;
            selectSquare(row, col);
        }
    }
});

// Initialize on load
initGame();

