import { isInt, isRecord, other, type GameContext, type GameDefinition, type GameInstance, type Slot } from '../types';

export const SIZE = 8;
const FINISH_DELAY_MS = 2800;
const DIRECTIONS = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
] as const;

export type Disc = Slot | null;

export interface ReversiTv {
  board: Disc[];
  turn: Slot;
  aim: number | null;
  moves: number[];
  last: { cell: number; flipped: number[]; seq: number } | null;
  passed: Slot | null;
  counts: [number, number];
  phase: 'play' | 'over';
  winner: Slot | null;
}

export interface ReversiPhone extends ReversiTv {
  me: Slot;
  myTurn: boolean;
  guard: string;
}

export function initialBoard(): Disc[] {
  const board: Disc[] = Array(SIZE * SIZE).fill(null);
  const mid = SIZE / 2;
  board[(mid - 1) * SIZE + mid - 1] = 1;
  board[(mid - 1) * SIZE + mid] = 0;
  board[mid * SIZE + mid - 1] = 0;
  board[mid * SIZE + mid] = 1;
  return board;
}

export function flipsFor(board: Disc[], cell: number, player: Slot): number[] {
  if (board[cell] !== null) return [];
  const row = Math.floor(cell / SIZE);
  const col = cell % SIZE;
  const flipped: number[] = [];
  for (const [dr, dc] of DIRECTIONS) {
    const line: number[] = [];
    let r = row + dr;
    let c = col + dc;
    while (r >= 0 && r < SIZE && c >= 0 && c < SIZE && board[r * SIZE + c] === other(player)) {
      line.push(r * SIZE + c);
      r += dr;
      c += dc;
    }
    if (line.length && r >= 0 && r < SIZE && c >= 0 && c < SIZE && board[r * SIZE + c] === player) flipped.push(...line);
  }
  return flipped;
}

export function legalMoves(board: Disc[], player: Slot): number[] {
  const moves: number[] = [];
  for (let cell = 0; cell < board.length; cell++) if (flipsFor(board, cell, player).length) moves.push(cell);
  return moves;
}

class Reversi implements GameInstance {
  private readonly board = initialBoard();
  private turn: Slot;
  private aim: number | null = null;
  private last: ReversiTv['last'] = null;
  private passed: Slot | null = null;
  private seq = 0;
  private phase: ReversiTv['phase'] = 'play';
  private winner: Slot | null = null;

  constructor(private readonly ctx: GameContext) {
    this.turn = ctx.starter;
    ctx.fx('turn', [this.turn]);
  }

  act(slot: Slot, action: unknown): void {
    if (this.phase !== 'play' || slot !== this.turn || !isRecord(action) || !isInt(action.cell, 0, SIZE * SIZE - 1)) return;
    const flipped = flipsFor(this.board, action.cell, slot);
    if (!flipped.length) return;
    if (action.type === 'aim') {
      if (this.aim === action.cell) return;
      this.aim = action.cell;
      this.ctx.update();
    } else if (action.type === 'place') {
      this.place(action.cell, flipped);
    }
  }

  private place(cell: number, flipped: number[]): void {
    this.board[cell] = this.turn;
    for (const index of flipped) this.board[index] = this.turn;
    this.seq += 1;
    this.last = { cell, flipped, seq: this.seq };
    this.aim = null;
    this.passed = null;
    this.ctx.fx('flip');

    const next = other(this.turn);
    if (legalMoves(this.board, next).length) {
      this.turn = next;
      this.ctx.fx('turn', [this.turn]);
    } else if (legalMoves(this.board, this.turn).length) {
      this.passed = next;
      this.ctx.fx('turn', [this.turn]);
    } else {
      this.end();
    }
    this.ctx.update();
  }

  private counts(): [number, number] {
    let a = 0;
    let b = 0;
    for (const disc of this.board) {
      if (disc === 0) a += 1;
      else if (disc === 1) b += 1;
    }
    return [a, b];
  }

  private end(): void {
    this.phase = 'over';
    const [a, b] = this.counts();
    this.winner = a === b ? null : a > b ? 0 : 1;
    const winner = this.winner;
    this.ctx.after(FINISH_DELAY_MS, () =>
      this.ctx.finish({
        winner,
        title: winner === null ? 'Plateau partagé, égalité !' : `${this.ctx.name(winner)} domine le plateau !`,
        detail: `${a} pions contre ${b}`,
        scores: [a, b],
      }),
    );
  }

  tv(): ReversiTv {
    return {
      board: [...this.board],
      turn: this.turn,
      aim: this.aim,
      moves: this.phase === 'play' ? legalMoves(this.board, this.turn) : [],
      last: this.last,
      passed: this.passed,
      counts: this.counts(),
      phase: this.phase,
      winner: this.winner,
    };
  }

  phone(slot: Slot): ReversiPhone {
    return { ...this.tv(), me: slot, myTurn: this.phase === 'play' && slot === this.turn, guard: `m${this.seq}` };
  }
}

export const reversi: GameDefinition = {
  id: 'reversi',
  title: 'Reversi',
  tagline: 'Encerclez les pions de l’autre pour les retourner.',
  accent: '#19b48a',
  coop: false,
  rules: [
    'Chacun son tour, pose un pion de façon à encadrer une ligne de pions adverses : ils se retournent à ta couleur.',
    'Les cases jouables sont marquées. Touche une case pour viser, puis touche-la encore pour poser.',
    'Si tu ne peux pas jouer, ton tour passe. À la fin, celui qui a le plus de pions gagne !',
  ],
  create: (ctx) => new Reversi(ctx),
};
