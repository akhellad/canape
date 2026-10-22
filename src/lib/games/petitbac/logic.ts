import { normalize } from '../../text';
import { choiceOf, listOf, resolveSettings, type SettingDef } from '../settings';
import {
  isInt,
  isRecord,
  other,
  SLOTS,
  type GameContext,
  type GameDefinition,
  type GameInstance,
  type Slot,
  type TimerHandle,
} from '../types';
import { CATEGORIES, LETTERS } from './categories';

export const ROUNDS = 3;
export const CATEGORY_COUNT = 6;
export const WRITE_SECONDS = 90;
const STOP_MS = 2600;
const MAX_LENGTH = 40;

export const PETITBAC_SETTINGS: readonly SettingDef[] = [
  { id: 'categories', label: 'Catégories', kind: 'list', pool: CATEGORIES, min: 3, max: 10, size: CATEGORY_COUNT, maxLength: 32 },
  {
    id: 'rounds',
    label: 'Manches',
    kind: 'choice',
    options: [2, 3, 4, 5, 6].map((value) => ({ value, label: `${value}` })),
    default: ROUNDS,
  },
  {
    id: 'time',
    label: 'Temps par manche',
    kind: 'choice',
    options: [60, 90, 120, 180, 240].map((value) => ({ value, label: value < 120 ? `${value} s` : `${value / 60} min` })),
    default: WRITE_SECONDS,
  },
];

/** `recap` is the pause between rounds: scores are shown until someone asks for the next letter. */
export type Phase = 'write' | 'stop' | 'review' | 'recap';

export interface Cell {
  text: string;
  valid: boolean;
  vetoed: boolean;
  points: number;
}

export interface PetitBacTv {
  phase: Phase;
  round: number;
  rounds: number;
  letter: string;
  categories: string[];
  remaining: number;
  total: number;
  filled: [number, number];
  stopper: Slot | null;
  grid: [Cell[], Cell[]] | null;
  done: [boolean, boolean];
  scores: [number, number];
  roundPoints: [number, number] | null;
  last: boolean;
}

export interface PetitBacPhone {
  phase: Phase;
  me: Slot;
  round: number;
  rounds: number;
  letter: string;
  categories: string[];
  remaining: number;
  stopper: Slot | null;
  grid: [Cell[], Cell[]] | null;
  done: boolean;
  scores: [number, number];
  roundPoints: [number, number] | null;
  last: boolean;
  guard: string;
}

export function startsWith(answer: string, letter: string): boolean {
  const clean = normalize(answer).replace(/^(le|la|les|un|une|des|l|d) /, '');
  return clean.length >= 2 && clean[0] === normalize(letter);
}

class PetitBac implements GameInstance {
  private phase: Phase = 'write';
  private round = 0;
  private letter = 'A';
  private categories: string[] = [];
  private answers: [string[], string[]] = [[], []];
  private vetoes: [boolean[], boolean[]] = [[], []];
  private done: [boolean, boolean] = [false, false];
  private readonly scores: [number, number] = [0, 0];
  private stopper: Slot | null = null;
  private deadline = 0;
  private timer: TimerHandle | null = null;
  private tick: TimerHandle | null = null;
  private lastPoints: [number, number] | null = null;
  private readonly rounds: number;
  private readonly seconds: number;

  constructor(private readonly ctx: GameContext) {
    const settings = resolveSettings(PETITBAC_SETTINGS, ctx.settings, ctx.rng);
    // The same categories all game long, like on paper: only the letter changes.
    this.categories = listOf(settings, 'categories');
    this.rounds = choiceOf(settings, 'rounds');
    this.seconds = choiceOf(settings, 'time');
    this.start();
  }

  private start(): void {
    const count = this.categories.length;
    this.letter = this.ctx.draw('petitbac-letter', LETTERS, (letter) => letter);
    this.answers = [Array(count).fill(''), Array(count).fill('')];
    this.vetoes = [Array(count).fill(false), Array(count).fill(false)];
    this.done = [false, false];
    this.stopper = null;
    this.lastPoints = null;
    this.phase = 'write';
    this.deadline = this.ctx.now() + this.seconds * 1000;
    this.ctx.cancel(this.timer);
    this.timer = this.ctx.after(this.seconds * 1000, () => this.stop(null));
    this.scheduleTick();
    this.ctx.fx('reveal', 'all');
    this.ctx.update();
  }

  private scheduleTick(): void {
    this.ctx.cancel(this.tick);
    this.tick = this.ctx.after(1000, () => {
      if (this.phase !== 'write') return;
      if (this.remaining() <= 10) this.ctx.fx('tick', 'all');
      this.scheduleTick();
      this.ctx.update();
    });
  }

  act(slot: Slot, action: unknown): void {
    if (!isRecord(action) || typeof action.type !== 'string') return;
    if (action.type === 'answers' && (this.phase === 'write' || this.phase === 'stop')) {
      const list = action.list;
      if (!Array.isArray(list) || list.length !== this.categories.length || !list.every((item) => typeof item === 'string')) return;
      this.answers[slot] = list.map((item: string) => item.trim().slice(0, MAX_LENGTH));
      if (this.phase === 'write') this.ctx.update();
      return;
    }
    if (action.type === 'stop' && this.phase === 'write') {
      const complete = this.answers[slot].every((answer) => startsWith(answer, this.letter));
      if (complete) this.stop(slot);
      return;
    }
    if (action.type === 'next' && this.phase === 'recap') {
      this.next();
      return;
    }
    if (this.phase !== 'review') return;
    if (action.type === 'veto' && isInt(action.index, 0, this.categories.length - 1) && !this.done[slot]) {
      const target = other(slot);
      this.vetoes[target][action.index] = !this.vetoes[target][action.index];
      this.ctx.fx('error', 'all');
      this.ctx.update();
    } else if (action.type === 'done') {
      this.done[slot] = true;
      this.ctx.fx('lock', [slot]);
      if (this.done[0] && this.done[1]) this.recap();
      this.ctx.update();
    }
  }

  private stop(by: Slot | null): void {
    if (this.phase !== 'write') return;
    this.ctx.cancel(this.timer);
    this.ctx.cancel(this.tick);
    this.phase = 'stop';
    this.stopper = by;
    this.ctx.fx('lose', 'all');
    this.ctx.update();
    // Phones send their last answers when they see the stop.
    this.timer = this.ctx.after(STOP_MS, () => {
      this.phase = 'review';
      this.ctx.fx('reveal', 'all');
      this.ctx.update();
    });
  }

  private grid(): [Cell[], Cell[]] {
    const valid = SLOTS.map((slot) =>
      this.answers[slot].map((answer, index) => startsWith(answer, this.letter) && !this.vetoes[slot][index]),
    );
    return SLOTS.map((slot) =>
      this.answers[slot].map((text, index) => {
        const mine = valid[slot][index];
        const theirs = valid[other(slot)][index];
        const same = mine && theirs && normalize(text) === normalize(this.answers[other(slot)][index]);
        return { text, valid: mine, vetoed: this.vetoes[slot][index], points: mine ? (same ? 5 : 10) : 0 };
      }),
    ) as [Cell[], Cell[]];
  }

  private roundPoints(grid: [Cell[], Cell[]]): [number, number] {
    return [grid[0].reduce((sum, cell) => sum + cell.points, 0), grid[1].reduce((sum, cell) => sum + cell.points, 0)];
  }

  private recap(): void {
    const points = this.roundPoints(this.grid());
    this.scores[0] += points[0];
    this.scores[1] += points[1];
    this.lastPoints = points;
    this.phase = 'recap';
    this.ctx.fx('reveal', 'all');
  }

  private next(): void {
    this.round += 1;
    if (this.round < this.rounds) {
      this.start();
      return;
    }
    const [a, b] = this.scores;
    const winner: Slot | null = a === b ? null : a > b ? 0 : 1;
    this.ctx.finish({
      winner,
      title: winner === null ? 'Égalité au Petit Bac !' : `${this.ctx.name(winner)} remporte le Petit Bac !`,
      scores: [a, b],
    });
  }

  private remaining(): number {
    if (this.phase !== 'write') return 0;
    return Math.max(0, Math.ceil((this.deadline - this.ctx.now()) / 1000));
  }

  private shownPoints(grid: [Cell[], Cell[]] | null): [number, number] | null {
    if (this.phase === 'recap') return this.lastPoints;
    return grid ? this.roundPoints(grid) : null;
  }

  tv(): PetitBacTv {
    const grid = this.phase === 'review' || this.phase === 'recap' ? this.grid() : null;
    return {
      phase: this.phase,
      round: this.round,
      rounds: this.rounds,
      letter: this.letter,
      categories: this.categories,
      remaining: this.remaining(),
      total: this.seconds,
      filled: [this.filled(0), this.filled(1)],
      stopper: this.stopper,
      grid,
      done: [...this.done],
      scores: [...this.scores],
      roundPoints: this.shownPoints(grid),
      last: this.round === this.rounds - 1,
    };
  }

  private filled(slot: Slot): number {
    return this.answers[slot].filter((answer) => answer.length > 0).length;
  }

  phone(slot: Slot): PetitBacPhone {
    const grid = this.phase === 'review' || this.phase === 'recap' ? this.grid() : null;
    return {
      phase: this.phase,
      me: slot,
      round: this.round,
      rounds: this.rounds,
      letter: this.letter,
      categories: this.categories,
      remaining: this.remaining(),
      stopper: this.stopper,
      grid,
      done: this.done[slot],
      scores: [...this.scores],
      roundPoints: this.shownPoints(grid),
      last: this.round === this.rounds - 1,
      guard: `${this.round}-${this.phase}`,
    };
  }
}

export const petitbac: GameDefinition = {
  id: 'petitbac',
  title: 'Petit Bac',
  tagline: 'Une lettre, vos catégories, et le premier qui crie stop.',
  accent: '#ffd23d',
  coop: false,
  rules: [
    'Choisissez vos catégories : elles restent les mêmes toute la partie, seule la lettre change.',
    'Pour chaque catégorie, écris un mot qui commence par la lettre. Tout rempli ? Appuie sur « Stop ! » : la manche s’arrête aussi pour l’autre.',
    'Les réponses s’affichent sur la télé. Tu peux refuser une réponse de l’autre si elle ne tient pas la route.',
    'Réponse valable : 10 points, 5 si vous avez écrit la même. Le plus gros total gagne !',
  ],
  settings: PETITBAC_SETTINGS,
  create: (ctx) => new PetitBac(ctx),
};
