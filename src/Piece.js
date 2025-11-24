export class Piece {
  constructor(color, type) {
    this.color = color; // 'white' or 'black'
    this.type = type;   // 'pawn', 'rook', 'knight', 'bishop', 'queen', 'king'
    this.hasMoved = false;
  }

  getSymbol() {
    const symbols = {
      white: {
        pawn: '♙',
        rook: '♖',
        knight: '♘',
        bishop: '♗',
        queen: '♕',
        king: '♔'
      },
      black: {
        pawn: '♟',
        rook: '♜',
        knight: '♞',
        bishop: '♝',
        queen: '♛',
        king: '♚'
      }
    };
    return symbols[this.color][this.type];
  }

  getChar() {
    const chars = {
      white: {
        pawn: 'P',
        rook: 'R',
        knight: 'N',
        bishop: 'B',
        queen: 'Q',
        king: 'K'
      },
      black: {
        pawn: 'p',
        rook: 'r',
        knight: 'n',
        bishop: 'b',
        queen: 'q',
        king: 'k'
      }
    };
    return chars[this.color][this.type];
  }
}

