import { isInt, isRecord, other, type GameContext, type GameDefinition, type GameInstance, type Slot } from '../types';

export const ROWS = 6;
export const COLS = 7;
const FINISH_DELAY_MS = 2600;

export type Cell = Slot | null;

export interface Connect4Tv {
  grid: Cell[][];
  turn: Slot;
  aim: number;
  moves: number;
  last: { row: number; col: number } | null;
  winLine: [number, number][];
  phase: 'play' | 'won' | 'draw';
  winner: Slot | null;
}

export interface Connect4Phone extends Connect4Tv {
  me: Slot;
  myTurn: boolean;
  guard: string;
}

export function dropRow(grid: Cell[][], col: number): number {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (grid[row][col] === null) return row;
  }
  return -1;
}

export function findLine(grid: Cell[][], row: number, col: number): [number, number][] | null {
  const player = grid[row][col];
  if (player === null) return null;
  for (const [dr, dc] of [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ]) {
    const line: [number, number][] = [[row, col]];
    for (const sign of [1, -1]) {
      let r = row + dr * sign;
      let c = col + dc * sign;
      while (r >= 0 && r < ROWS && c >= 0 && c < COLS && grid[r][c] === player) {
        line.push([r, c]);
        r += dr * sign;
        c += dc * sign;
      }
    }
    if (line.length >= 4) return line;
  }
  return null;
}

class Connect4 implements GameInstance {
  private readonly grid: Cell[][] = Array.from({ length: ROWS }, () => Array<Cell>(COLS).fill(null));
  private turn: Slot;
  private aim = 3;
  private moves = 0;
  private last: { row: number; col: number } | null = null;
  private winLine: [number, number][] = [];
  private phase: Connect4Tv['phase'] = 'play';
  private winner: Slot | null = null;

  constructor(private readonly ctx: GameContext) {
    this.turn = ctx.starter;
    ctx.fx('turn', [this.turn]);
  }

  act(slot: Slot, action: unknown): void {
    if (this.phase !== 'play' || slot !== this.turn || !isRecord(action) || !isInt(action.col, 0, COLS - 1)) return;
    if (action.type === 'aim') {
      if (this.aim === action.col) return;
      this.aim = action.col;
      this.ctx.update();
    } else if (action.type === 'drop') {
      this.drop(action.col);
    }
  }

  private drop(col: number): void {
    const row = dropRow(this.grid, col);
    if (row === -1) return;
    this.grid[row][col] = this.turn;
    this.aim = col;
    this.moves += 1;
    this.last = { row, col };
    this.ctx.fx('drop');

    const line = findLine(this.grid, row, col);
    if (line) {
      this.phase = 'won';
      this.winner = this.turn;
      this.winLine = line;
      const winner = this.turn;
      this.ctx.after(FINISH_DELAY_MS, () =>
        this.ctx.finish({ winner, title: `${this.ctx.name(winner)} aligne quatre jetons !`, detail: `En ${this.moves} coups` }),
      );
    } else if (this.moves === ROWS * COLS) {
      this.phase = 'draw';
      this.ctx.after(FINISH_DELAY_MS, () => this.ctx.finish({ winner: null, title: 'Grille pleine, match nul !' }));
    } else {
      this.turn = other(this.turn);
      this.aim = this.firstOpenColumn();
      this.ctx.fx('turn', [this.turn]);
    }
    this.ctx.update();
  }

  private firstOpenColumn(): number {
    const order = [3, 2, 4, 1, 5, 0, 6];
    return order.find((col) => dropRow(this.grid, col) !== -1) ?? 3;
  }

  tv(): Connect4Tv {
    return {
      grid: this.grid.map((row) => [...row]),
      turn: this.turn,
      aim: this.aim,
      moves: this.moves,
      last: this.last,
      winLine: this.winLine,
      phase: this.phase,
      winner: this.winner,
    };
  }

  phone(slot: Slot): Connect4Phone {
    return {
      ...this.tv(),
      me: slot,
      myTurn: this.phase === 'play' && slot === this.turn,
      guard: `m${this.moves}`,
    };
  }
}

export const connect4: GameDefinition = {
  id: 'connect4',
  title: 'Puissance 4',
  tagline: 'Alignez quatre jetons avant l’autre.',
  icon: 'bullseye',
  accent: '#5b8fe8',
  coop: false,
  rules: [
    'Chacun son tour, faites tomber un jeton dans une colonne.',
    'Touche une colonne pour viser, puis touche-la encore (ou « Lâcher ») pour faire tomber le jeton.',
    'Le premier qui aligne quatre jetons, en ligne, en colonne ou en diagonale, gagne.',
  ],
  create: (ctx) => new Connect4(ctx),
};
