import type { Rng } from '../random';

export type Slot = 0 | 1;
export const SLOTS: readonly Slot[] = [0, 1];
export const other = (slot: Slot): Slot => (slot === 0 ? 1 : 0);

export type GameId =
  | 'sketch'
  | 'quiz'
  | 'couple'
  | 'taboo'
  | 'petitbac'
  | 'guesswho'
  | 'mastermind'
  | 'connect4'
  | 'reversi'
  | 'battleship'
  | 'yams'
  | 'memory';

export type FxKind =
  | 'join'
  | 'turn'
  | 'drop'
  | 'aim'
  | 'fire'
  | 'hit'
  | 'miss'
  | 'sunk'
  | 'match'
  | 'error'
  | 'correct'
  | 'wrong'
  | 'reveal'
  | 'tick'
  | 'flip'
  | 'roll'
  | 'lock'
  | 'win'
  | 'lose';

export interface FxEvent {
  seq: number;
  kind: FxKind;
  targets: Slot[] | 'all';
}

export interface GameResult {
  winner: Slot | null;
  title: string;
  detail?: string;
  scores?: [number, number];
  coop?: { won: boolean; score?: number };
}

export interface TimerHandle {
  readonly id: number;
}

export interface GameContext {
  readonly starter: Slot;
  readonly rng: Rng;
  name(slot: Slot): string;
  now(): number;
  after(ms: number, callback: () => void): TimerHandle;
  cancel(handle: TimerHandle | null | undefined): void;
  update(): void;
  fx(kind: FxKind, targets?: Slot[] | 'all'): void;
  finish(result: GameResult): void;
  /** Draws from a pool, avoiding items already seen in previous games on this TV. */
  draw<T>(deck: string, pool: readonly T[], key: (item: T) => string): T;
}

export interface GameInstance {
  act(slot: Slot, action: unknown): void;
  tv(): unknown;
  phone(slot: Slot): unknown;
}

export interface GameDefinition {
  id: GameId;
  title: string;
  tagline: string;
  accent: string;
  coop: boolean;
  rules: string[];
  create(ctx: GameContext): GameInstance;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isInt(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max;
}
