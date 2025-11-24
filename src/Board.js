import { Piece } from './Piece.js';

export class Board {
  constructor() {
    this.squares = this.initializeBoard();
  }

  initializeBoard() {
    const board = Array(8).fill(null).map(() => Array(8).fill(null));

    // Place pawns
    for (let col = 0; col < 8; col++) {
      board[1][col] = new Piece('black', 'pawn');
      board[6][col] = new Piece('white', 'pawn');
    }

    // Place other pieces
    const backRow = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
    for (let col = 0; col < 8; col++) {
      board[0][col] = new Piece('black', backRow[col]);
      board[7][col] = new Piece('white', backRow[col]);
    }

    return board;
  }

  getPiece(row, col) {
    if (this.isValidPosition(row, col)) {
      return this.squares[row][col];
    }
    return null;
  }

  setPiece(row, col, piece) {
    if (this.isValidPosition(row, col)) {
      this.squares[row][col] = piece;
    }
  }

  isValidPosition(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
  }

  movePiece(fromRow, fromCol, toRow, toCol) {
    const piece = this.getPiece(fromRow, fromCol);
    if (!piece) {
      return false;
    }

    this.setPiece(toRow, toCol, piece);
    this.setPiece(fromRow, fromCol, null);
    piece.hasMoved = true;
    return true;
  }

  print() {
    console.log('\n   a b c d e f g h');
    console.log('  ─────────────────');
    for (let row = 0; row < 8; row++) {
      let line = `${8 - row} │`;
      for (let col = 0; col < 8; col++) {
        const piece = this.getPiece(row, col);
        const symbol = piece ? piece.getSymbol() : '·';
        line += ` ${symbol}`;
      }
      line += ` │ ${8 - row}`;
      console.log(line);
    }
    console.log('  ─────────────────');
    console.log('   a b c d e f g h\n');
  }

  toJSON() {
    const board = [];
    for (let row = 0; row < 8; row++) {
      const rowData = [];
      for (let col = 0; col < 8; col++) {
        const piece = this.getPiece(row, col);
        if (piece) {
          rowData.push({
            color: piece.color,
            type: piece.type,
            symbol: piece.getSymbol(),
            char: piece.getChar()
          });
        } else {
          rowData.push(null);
        }
      }
      board.push(rowData);
    }
    return board;
  }
}

