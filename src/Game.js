import { Board } from './Board.js';

export class Game {
  constructor() {
    this.board = new Board();
    this.currentPlayer = 'white';
    this.gameOver = false;
    this.winner = null;
  }

  getCurrentPlayer() {
    return this.currentPlayer;
  }

  switchPlayer() {
    this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
  }

  parseMove(move) {
    // Parse moves like "e2 e4" or "e2e4"
    const cleanMove = move.replace(/\s+/g, '');
    
    if (cleanMove.length === 4) {
      const from = cleanMove.substring(0, 2);
      const to = cleanMove.substring(2, 4);
      return { from, to };
    }
    
    if (cleanMove.includes(' ')) {
      const parts = cleanMove.split(' ');
      if (parts.length === 2) {
        return { from: parts[0], to: parts[1] };
      }
    }
    
    return null;
  }

  algebraicToCoordinates(algebraic) {
    // Convert "e4" to [row, col]
    if (algebraic.length !== 2) return null;
    
    const col = algebraic.charCodeAt(0) - 97; // 'a' = 0, 'b' = 1, etc.
    const row = 8 - parseInt(algebraic[1]);   // '1' = row 7, '2' = row 6, etc.
    
    if (col < 0 || col > 7 || row < 0 || row > 7) {
      return null;
    }
    
    return [row, col];
  }

  isValidMove(fromRow, fromCol, toRow, toCol) {
    const piece = this.board.getPiece(fromRow, fromCol);
    
    if (!piece) {
      return { valid: false, reason: 'No piece at source square' };
    }
    
    if (piece.color !== this.currentPlayer) {
      return { valid: false, reason: 'Not your piece' };
    }
    
    const targetPiece = this.board.getPiece(toRow, toCol);
    if (targetPiece && targetPiece.color === piece.color) {
      return { valid: false, reason: 'Cannot capture your own piece' };
    }
    
    // Basic move validation based on piece type
    const moveValid = this.validatePieceMove(piece, fromRow, fromCol, toRow, toCol);
    if (!moveValid.valid) {
      return moveValid;
    }
    
    return { valid: true };
  }

  validatePieceMove(piece, fromRow, fromCol, toRow, toCol) {
    const rowDiff = toRow - fromRow;
    const colDiff = toCol - fromCol;
    const absRowDiff = Math.abs(rowDiff);
    const absColDiff = Math.abs(colDiff);
    
    switch (piece.type) {
      case 'pawn':
        return this.validatePawnMove(piece, fromRow, fromCol, toRow, toCol, rowDiff, colDiff);
      case 'rook':
        return this.validateRookMove(fromRow, fromCol, toRow, toCol);
      case 'knight':
        return this.validateKnightMove(absRowDiff, absColDiff);
      case 'bishop':
        return this.validateBishopMove(fromRow, fromCol, toRow, toCol);
      case 'queen':
        return this.validateQueenMove(fromRow, fromCol, toRow, toCol);
      case 'king':
        return this.validateKingMove(absRowDiff, absColDiff);
      default:
        return { valid: false, reason: 'Unknown piece type' };
    }
  }

  validatePawnMove(piece, fromRow, fromCol, toRow, toCol, rowDiff, colDiff) {
    const direction = piece.color === 'white' ? -1 : 1;
    const startRow = piece.color === 'white' ? 6 : 1;
    const targetPiece = this.board.getPiece(toRow, toCol);
    
    // Forward move
    if (colDiff === 0) {
      if (rowDiff === direction && !targetPiece) {
        return { valid: true };
      }
      if (rowDiff === 2 * direction && fromRow === startRow && !targetPiece && !this.board.getPiece(fromRow + direction, fromCol)) {
        return { valid: true };
      }
    }
    
    // Capture move (diagonal)
    if (Math.abs(colDiff) === 1 && rowDiff === direction && targetPiece && targetPiece.color !== piece.color) {
      return { valid: true };
    }
    
    return { valid: false, reason: 'Invalid pawn move' };
  }

  validateRookMove(fromRow, fromCol, toRow, toCol) {
    // Rook moves horizontally or vertically
    if (fromRow !== toRow && fromCol !== toCol) {
      return { valid: false, reason: 'Rook must move horizontally or vertically' };
    }
    
    // Check if path is clear
    if (!this.isPathClear(fromRow, fromCol, toRow, toCol)) {
      return { valid: false, reason: 'Path is blocked' };
    }
    
    return { valid: true };
  }

  validateKnightMove(absRowDiff, absColDiff) {
    // Knight moves in L-shape
    if ((absRowDiff === 2 && absColDiff === 1) || (absRowDiff === 1 && absColDiff === 2)) {
      return { valid: true };
    }
    return { valid: false, reason: 'Invalid knight move' };
  }

  validateBishopMove(fromRow, fromCol, toRow, toCol) {
    // Bishop moves diagonally
    if (Math.abs(toRow - fromRow) !== Math.abs(toCol - fromCol)) {
      return { valid: false, reason: 'Bishop must move diagonally' };
    }
    
    // Check if path is clear
    if (!this.isPathClear(fromRow, fromCol, toRow, toCol)) {
      return { valid: false, reason: 'Path is blocked' };
    }
    
    return { valid: true };
  }

  validateQueenMove(fromRow, fromCol, toRow, toCol) {
    // Queen moves like rook or bishop
    const isRookMove = (fromRow === toRow || fromCol === toCol);
    const isBishopMove = (Math.abs(toRow - fromRow) === Math.abs(toCol - fromCol));
    
    if (!isRookMove && !isBishopMove) {
      return { valid: false, reason: 'Invalid queen move' };
    }
    
    // Check if path is clear
    if (!this.isPathClear(fromRow, fromCol, toRow, toCol)) {
      return { valid: false, reason: 'Path is blocked' };
    }
    
    return { valid: true };
  }

  validateKingMove(absRowDiff, absColDiff) {
    // King moves one square in any direction
    if (absRowDiff <= 1 && absColDiff <= 1 && (absRowDiff + absColDiff > 0)) {
      return { valid: true };
    }
    return { valid: false, reason: 'Invalid king move' };
  }

  isPathClear(fromRow, fromCol, toRow, toCol) {
    const rowStep = toRow === fromRow ? 0 : (toRow > fromRow ? 1 : -1);
    const colStep = toCol === fromCol ? 0 : (toCol > fromCol ? 1 : -1);
    
    let currentRow = fromRow + rowStep;
    let currentCol = fromCol + colStep;
    
    while (currentRow !== toRow || currentCol !== toCol) {
      if (this.board.getPiece(currentRow, currentCol)) {
        return false;
      }
      currentRow += rowStep;
      currentCol += colStep;
    }
    
    return true;
  }

  makeMove(moveString) {
    if (this.gameOver) {
      return { success: false, message: 'Game is over!' };
    }
    
    const move = this.parseMove(moveString);
    if (!move) {
      return { success: false, message: 'Invalid move format. Use format like "e2 e4" or "e2e4"' };
    }
    
    const from = this.algebraicToCoordinates(move.from);
    const to = this.algebraicToCoordinates(move.to);
    
    if (!from || !to) {
      return { success: false, message: 'Invalid square coordinates' };
    }
    
    const [fromRow, fromCol] = from;
    const [toRow, toCol] = to;
    
    const validation = this.isValidMove(fromRow, fromCol, toRow, toCol);
    if (!validation.valid) {
      return { success: false, message: validation.reason };
    }
    
    // Check for check (simplified - we'll enhance this later)
    const capturedPiece = this.board.getPiece(toRow, toCol);
    this.board.movePiece(fromRow, fromCol, toRow, toCol);
    
    // Check for checkmate (simplified - we'll enhance this later)
    if (capturedPiece && capturedPiece.type === 'king') {
      this.gameOver = true;
      this.winner = this.currentPlayer;
      return { success: true, message: `Checkmate! ${this.currentPlayer} wins!` };
    }
    
    this.switchPlayer();
    return { success: true, message: `Move made: ${move.from} to ${move.to}` };
  }

  display() {
    this.board.print();
    if (this.gameOver) {
      console.log(`Game Over! ${this.winner} wins!\n`);
    } else {
      console.log(`Current player: ${this.currentPlayer}\n`);
    }
  }

  getState() {
    return {
      board: this.board.toJSON(),
      currentPlayer: this.currentPlayer,
      gameOver: this.gameOver,
      winner: this.winner
    };
  }

  getPossibleMoves(row, col) {
    const piece = this.board.getPiece(row, col);
    if (!piece || piece.color !== this.currentPlayer) {
      return [];
    }

    const possibleMoves = [];

    // For pieces that move in lines (rook, bishop, queen), check all directions
    if (piece.type === 'rook' || piece.type === 'queen') {
      // Horizontal and vertical directions
      const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
      for (const [rowDir, colDir] of directions) {
        for (let i = 1; i < 8; i++) {
          const newRow = row + rowDir * i;
          const newCol = col + colDir * i;
          if (!this.board.isValidPosition(newRow, newCol)) break;
          
          const validation = this.isValidMove(row, col, newRow, newCol);
          if (validation.valid) {
            possibleMoves.push([newRow, newCol]);
            const targetPiece = this.board.getPiece(newRow, newCol);
            if (targetPiece) break; // Can't move further after capturing
          } else {
            break; // Path is blocked
          }
        }
      }
    }

    if (piece.type === 'bishop' || piece.type === 'queen') {
      // Diagonal directions
      const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
      for (const [rowDir, colDir] of directions) {
        for (let i = 1; i < 8; i++) {
          const newRow = row + rowDir * i;
          const newCol = col + colDir * i;
          if (!this.board.isValidPosition(newRow, newCol)) break;
          
          const validation = this.isValidMove(row, col, newRow, newCol);
          if (validation.valid) {
            possibleMoves.push([newRow, newCol]);
            const targetPiece = this.board.getPiece(newRow, newCol);
            if (targetPiece) break; // Can't move further after capturing
          } else {
            break; // Path is blocked
          }
        }
      }
    }

    // For knight, check all 8 possible L-shaped moves
    if (piece.type === 'knight') {
      const knightMoves = [
        [2, 1], [2, -1], [-2, 1], [-2, -1],
        [1, 2], [1, -2], [-1, 2], [-1, -2]
      ];
      for (const [rowOffset, colOffset] of knightMoves) {
        const newRow = row + rowOffset;
        const newCol = col + colOffset;
        if (this.board.isValidPosition(newRow, newCol)) {
          const validation = this.isValidMove(row, col, newRow, newCol);
          if (validation.valid) {
            possibleMoves.push([newRow, newCol]);
          }
        }
      }
    }

    // For king, check all 8 adjacent squares
    if (piece.type === 'king') {
      const kingMoves = [
        [1, 0], [-1, 0], [0, 1], [0, -1],
        [1, 1], [1, -1], [-1, 1], [-1, -1]
      ];
      for (const [rowOffset, colOffset] of kingMoves) {
        const newRow = row + rowOffset;
        const newCol = col + colOffset;
        if (this.board.isValidPosition(newRow, newCol)) {
          const validation = this.isValidMove(row, col, newRow, newCol);
          if (validation.valid) {
            possibleMoves.push([newRow, newCol]);
          }
        }
      }
    }

    // For pawn, check forward moves and captures
    if (piece.type === 'pawn') {
      const direction = piece.color === 'white' ? -1 : 1;
      const startRow = piece.color === 'white' ? 6 : 1;

      // Forward one square
      const forwardRow = row + direction;
      if (this.board.isValidPosition(forwardRow, col)) {
        const validation = this.isValidMove(row, col, forwardRow, col);
        if (validation.valid) {
          possibleMoves.push([forwardRow, col]);
        }
      }

      // Forward two squares (from starting position)
      if (row === startRow) {
        const forwardTwoRow = row + 2 * direction;
        if (this.board.isValidPosition(forwardTwoRow, col)) {
          const validation = this.isValidMove(row, col, forwardTwoRow, col);
          if (validation.valid) {
            possibleMoves.push([forwardTwoRow, col]);
          }
        }
      }

      // Diagonal captures
      for (const colOffset of [-1, 1]) {
        const captureRow = row + direction;
        const captureCol = col + colOffset;
        if (this.board.isValidPosition(captureRow, captureCol)) {
          const validation = this.isValidMove(row, col, captureRow, captureCol);
          if (validation.valid) {
            possibleMoves.push([captureRow, captureCol]);
          }
        }
      }
    }

    return possibleMoves;
  }
}

