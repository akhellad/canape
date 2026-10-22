import type { Rng } from '../../random';
import type { Entry } from './words';

export type Direction = 'across' | 'down';

export interface Placed {
  word: string;
  clue: string;
  row: number;
  col: number;
  dir: Direction;
}

export interface Grid {
  rows: number;
  cols: number;
  /** Row-major letters, null for black cells. */
  cells: (string | null)[];
  words: (Placed & { number: number })[];
}

const ATTEMPTS = 30;

function cellsOf(word: string, row: number, col: number, dir: Direction): [number, number][] {
  return [...word].map((_, k) => (dir === 'across' ? [row, col + k] : [row + k, col]));
}

/**
 * Builds a crossword by hanging words on letters already in the grid, never letting two
 * words touch side by side. Keeps the best of a few random tries.
 */
export function buildGrid(rng: Rng, pool: readonly Entry[], target: number, size = 13): Grid {
  const usable = pool.filter((entry) => entry.word.length >= 3 && entry.word.length <= size - 2);
  let best: Placed[] = [];
  for (let attempt = 0; attempt < ATTEMPTS && best.length < target; attempt++) {
    const placed = tryBuild(rng, usable, target, size);
    if (placed.length > best.length) best = placed;
  }
  return finish(best);
}

function tryBuild(rng: Rng, pool: readonly Entry[], target: number, size: number): Placed[] {
  const board = new Map<string, string>();
  const key = (row: number, col: number) => `${row},${col}`;
  const at = (row: number, col: number) => board.get(key(row, col));
  const placed: Placed[] = [];
  const order = rng.shuffle(pool);
  const first = order.find((entry) => entry.word.length >= 6) ?? order[0];
  const put = (entry: Entry, row: number, col: number, dir: Direction) => {
    for (const [r, c] of cellsOf(entry.word, row, col, dir)) board.set(key(r, c), entry.word[r - row + c - col]);
    placed.push({ word: entry.word, clue: entry.clue, row, col, dir });
  };
  put(first, Math.floor(size / 2), Math.floor((size - first.word.length) / 2), 'across');

  const fits = (word: string, row: number, col: number, dir: Direction): number => {
    const [dr, dc] = dir === 'across' ? [0, 1] : [1, 0];
    const end = [row + dr * (word.length - 1), col + dc * (word.length - 1)];
    if (row < 0 || col < 0 || end[0] >= size || end[1] >= size) return -1;
    if (at(row - dr, col - dc) || at(end[0] + dr, end[1] + dc)) return -1;
    let crossings = 0;
    for (let k = 0; k < word.length; k++) {
      const r = row + dr * k;
      const c = col + dc * k;
      const existing = at(r, c);
      if (existing) {
        if (existing !== word[k]) return -1;
        crossings += 1;
        continue;
      }
      // A fresh letter must not sit next to another word's letter.
      if (at(r + dc, c + dr) || at(r - dc, c - dr)) return -1;
    }
    // Running along an existing word, letter for letter, is not a crossing.
    return crossings === word.length ? -1 : crossings;
  };

  for (const entry of order) {
    if (placed.length >= target) break;
    if (placed.some((other) => other.word === entry.word)) continue;
    const options: { row: number; col: number; dir: Direction; score: number }[] = [];
    for (const other of placed) {
      const dir: Direction = other.dir === 'across' ? 'down' : 'across';
      cellsOf(other.word, other.row, other.col, other.dir).forEach(([r, c], k) => {
        for (let i = 0; i < entry.word.length; i++) {
          if (entry.word[i] !== other.word[k]) continue;
          const row = dir === 'down' ? r - i : r;
          const col = dir === 'across' ? c - i : c;
          const score = fits(entry.word, row, col, dir);
          if (score > 0) options.push({ row, col, dir, score });
        }
      });
    }
    if (!options.length) continue;
    const top = Math.max(...options.map((option) => option.score));
    const choice = rng.pick(options.filter((option) => option.score === top));
    put(entry, choice.row, choice.col, choice.dir);
  }
  return placed;
}

function finish(placed: Placed[]): Grid {
  const all = placed.flatMap((word) => cellsOf(word.word, word.row, word.col, word.dir));
  const top = Math.min(...all.map(([r]) => r));
  const left = Math.min(...all.map(([, c]) => c));
  const rows = Math.max(...all.map(([r]) => r)) - top + 1;
  const cols = Math.max(...all.map(([, c]) => c)) - left + 1;
  const cells: (string | null)[] = Array(rows * cols).fill(null);
  const shifted = placed.map((word) => ({ ...word, row: word.row - top, col: word.col - left }));
  for (const word of shifted) {
    cellsOf(word.word, word.row, word.col, word.dir).forEach(([r, c], k) => (cells[r * cols + c] = word.word[k]));
  }
  // Number the starting cells in reading order, as printed grids do.
  const starts = [...new Set(shifted.map((word) => word.row * cols + word.col))].sort((a, b) => a - b);
  const words = shifted
    .map((word) => ({ ...word, number: starts.indexOf(word.row * cols + word.col) + 1 }))
    .sort((a, b) => a.number - b.number || (a.dir === 'across' ? -1 : 1));
  return { rows, cols, cells, words };
}

export function wordCells(word: Placed, cols: number): number[] {
  return cellsOf(word.word, word.row, word.col, word.dir).map(([r, c]) => r * cols + c);
}
