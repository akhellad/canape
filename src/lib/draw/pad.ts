import { isInt } from '../games/types';

export const CANVAS = 1000;
/** The paper colour: the eraser paints with it, and every drawing starts on it. */
export const PAPER = '#fffdf7';
export const PALETTE = [
  '#1d1612',
  '#5b5552',
  '#a8a29e',
  '#ffffff',
  '#7a1f2b',
  '#e9465a',
  '#ff8fb1',
  '#f08a2c',
  '#f4c430',
  '#f3d9b1',
  '#8b5a4a',
  '#2f6b45',
  '#7bc96f',
  '#2ec4b6',
  '#9fd8ff',
  '#3c7ce0',
  '#1f2f8a',
  '#8e5bd6',
] as const;
export const BRUSHES = [4, 10, 20, 36, 60] as const;
const MAX_POINTS = 40000;
const MAX_FILLS = 200;

/** A brush line, or a paint-bucket fill when `fill` is set (its single point is where it was poured). */
export interface Stroke {
  id: number;
  color: string;
  size: number;
  points: number[];
  ended: boolean;
  fill?: boolean;
}

/** One drawing, built from the drawer's `stroke`, `fill`, `undo` and `clear` actions. */
export class Pad {
  strokes: Stroke[] = [];
  /** Bumped on every change, so views know when to repaint. */
  rev = 0;
  private points = 0;
  private fills = 0;

  /** Applies a drawing action; returns whether it changed anything. */
  apply(action: Record<string, unknown>): boolean {
    switch (action.type) {
      case 'stroke':
        return this.stroke(action);
      case 'fill':
        return this.fill(action);
      case 'undo':
        if (!this.strokes.length) return false;
        this.strokes.pop();
        return this.changed();
      case 'clear':
        if (!this.strokes.length) return false;
        this.strokes = [];
        return this.changed();
      default:
        return false;
    }
  }

  reset(): void {
    this.strokes = [];
    this.points = 0;
    this.fills = 0;
    this.changed();
  }

  private changed(): true {
    this.rev += 1;
    return true;
  }

  private stroke(action: Record<string, unknown>): boolean {
    if (!isInt(action.id, 0, 1e6) || !Array.isArray(action.points) || action.points.length % 2 !== 0 || action.points.length > 600) {
      return false;
    }
    const points = action.points;
    if (!points.every((value) => isInt(value, 0, CANVAS))) return false;
    let stroke = this.strokes.find((candidate) => candidate.id === action.id);
    if (!stroke) {
      const color = [...PALETTE, PAPER].find((candidate) => candidate === action.color) ?? PALETTE[0];
      const size = BRUSHES.find((candidate) => candidate === action.size) ?? BRUSHES[1];
      stroke = { id: action.id, color, size, points: [], ended: false };
      this.strokes.push(stroke);
    }
    if (stroke.ended || stroke.fill) return false;
    if (this.points + points.length / 2 > MAX_POINTS) return false;
    stroke.points.push(...(points as number[]));
    this.points += points.length / 2;
    if (action.end === true) stroke.ended = true;
    return this.changed();
  }

  private fill(action: Record<string, unknown>): boolean {
    if (!isInt(action.id, 0, 1e6) || !isInt(action.x, 0, CANVAS) || !isInt(action.y, 0, CANVAS)) return false;
    if (this.fills >= MAX_FILLS || this.strokes.some((candidate) => candidate.id === action.id)) return false;
    const color = PALETTE.find((candidate) => candidate === action.color);
    if (!color) return false;
    this.fills += 1;
    this.strokes.push({ id: action.id, color, size: 0, points: [action.x, action.y], ended: true, fill: true });
    return this.changed();
  }
}
