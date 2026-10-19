import { isInt, isRecord, other, SLOTS, type GameContext, type GameDefinition, type GameInstance, type Slot } from '../types';

export const COLORS = ['#e8213f', '#ff7a2e', '#ffd23d', '#2fd1a5', '#3b46ff', '#b9a6ff'] as const;
export const COLOR_NAMES = ['rouge', 'orange', 'jaune', 'vert', 'bleu', 'violet'] as const;
export const LENGTH = 4;
export const MAX_GUESSES = 10;
const FINISH_DELAY_MS = 3200;

export interface Guess {
  pegs: number[];
  exact: number;
  near: number;
}

export interface MastermindTv {
  phase: 'setup' | 'play' | 'over';
  ready: [boolean, boolean];
  turn: Slot;
  guesses: [Guess[], Guess[]];
  codes: [number[], number[]] | null;
  solved: [boolean, boolean];
  winner: Slot | null;
}

export interface MastermindPhone {
  phase: 'setup' | 'play' | 'over';
  me: Slot;
  myTurn: boolean;
  ready: boolean;
  otherReady: boolean;
  code: number[] | null;
  mine: Guess[];
  theirs: Guess[];
  theirCode: number[] | null;
  solved: [boolean, boolean];
  winner: Slot | null;
  guard: string;
}

export function score(code: readonly number[], guess: readonly number[]): { exact: number; near: number } {
  let exact = 0;
  const codeLeft: number[] = [];
  const guessLeft: number[] = [];
  for (let i = 0; i < LENGTH; i++) {
    if (code[i] === guess[i]) exact += 1;
    else {
      codeLeft.push(code[i]);
      guessLeft.push(guess[i]);
    }
  }
  let near = 0;
  for (const peg of guessLeft) {
    const index = codeLeft.indexOf(peg);
    if (index >= 0) {
      near += 1;
      codeLeft.splice(index, 1);
    }
  }
  return { exact, near };
}

function isCode(value: unknown): value is number[] {
  return Array.isArray(value) && value.length === LENGTH && value.every((peg) => isInt(peg, 0, COLORS.length - 1));
}

class Mastermind implements GameInstance {
  private phase: MastermindTv['phase'] = 'setup';
  private readonly codes: [number[] | null, number[] | null] = [null, null];
  private turn: Slot;
  private readonly guesses: [Guess[], Guess[]] = [[], []];
  private winner: Slot | null = null;

  constructor(private readonly ctx: GameContext) {
    this.turn = ctx.starter;
  }

  act(slot: Slot, action: unknown): void {
    if (!isRecord(action) || typeof action.type !== 'string') return;
    if (this.phase === 'setup') {
      if (action.type === 'code' && isCode(action.pegs)) {
        this.codes[slot] = [...action.pegs];
        this.ctx.fx('lock', [slot]);
      } else if (action.type === 'unready') {
        this.codes[slot] = null;
      } else return;
      if (this.codes[0] && this.codes[1]) {
        this.phase = 'play';
        this.ctx.fx('turn', [this.turn]);
      }
      this.ctx.update();
      return;
    }
    if (this.phase !== 'play' || slot !== this.turn || action.type !== 'guess' || !isCode(action.pegs)) return;
    const target = this.codes[other(slot)] as number[];
    const result = score(target, action.pegs);
    this.guesses[slot].push({ pegs: [...action.pegs], ...result });
    this.ctx.fx(result.exact === LENGTH ? 'correct' : result.exact + result.near > 0 ? 'drop' : 'miss', 'all');
    this.afterGuess(slot);
    this.ctx.update();
  }

  private solved(slot: Slot): boolean {
    return this.guesses[slot].some((guess) => guess.exact === LENGTH);
  }

  private afterGuess(slot: Slot): void {
    const starter = this.ctx.starter;
    const second = other(starter);
    const solved = [this.solved(0), this.solved(1)];
    // The second player always gets as many tries as the first one before the game ends.
    const evened = this.guesses[second].length >= this.guesses[starter].length;
    const anySolved = solved[0] || solved[1];
    const exhausted = this.guesses[0].length >= MAX_GUESSES && this.guesses[1].length >= MAX_GUESSES;
    if ((anySolved && evened) || exhausted) {
      this.end(solved[0] === solved[1] ? null : solved[0] ? 0 : 1);
      return;
    }
    this.turn = other(slot);
    this.ctx.fx('turn', [this.turn]);
  }

  private end(winner: Slot | null): void {
    this.phase = 'over';
    this.winner = winner;
    const tries = (slot: Slot) => this.guesses[slot].length;
    this.ctx.after(FINISH_DELAY_MS, () =>
      this.ctx.finish({
        winner,
        title:
          winner === null
            ? this.solved(0)
              ? 'Codes cassés en même temps, égalité !'
              : 'Aucun code cassé, égalité !'
            : `${this.ctx.name(winner)} a cassé le code en ${tries(winner)} essai${tries(winner) > 1 ? 's' : ''} !`,
        detail: SLOTS.map((slot) => `${this.ctx.name(slot)} : ${tries(slot)} essai${tries(slot) > 1 ? 's' : ''}`).join(' · '),
      }),
    );
  }

  tv(): MastermindTv {
    return {
      phase: this.phase,
      ready: [this.codes[0] !== null, this.codes[1] !== null],
      turn: this.turn,
      guesses: [[...this.guesses[0]], [...this.guesses[1]]],
      codes: this.phase === 'over' ? [this.codes[0] ?? [], this.codes[1] ?? []] : null,
      solved: [this.solved(0), this.solved(1)],
      winner: this.winner,
    };
  }

  phone(slot: Slot): MastermindPhone {
    return {
      phase: this.phase,
      me: slot,
      myTurn: this.phase === 'play' && slot === this.turn,
      ready: this.codes[slot] !== null,
      otherReady: this.codes[other(slot)] !== null,
      code: this.codes[slot],
      mine: [...this.guesses[slot]],
      theirs: [...this.guesses[other(slot)]],
      theirCode: this.phase === 'over' ? this.codes[other(slot)] : null,
      solved: [this.solved(0), this.solved(1)],
      winner: this.winner,
      guard: `${this.phase}-${this.guesses[0].length}-${this.guesses[1].length}`,
    };
  }
}

export const mastermind: GameDefinition = {
  id: 'mastermind',
  title: 'Code secret',
  tagline: 'Cachez un code de couleurs, cassez celui de l’autre.',
  accent: '#2a0c1d',
  coop: false,
  rules: [
    'Chacun compose en secret un code de 4 couleurs sur son téléphone (une couleur peut revenir plusieurs fois).',
    'Chacun son tour, propose une combinaison pour trouver le code de l’autre. Un pion plein : bonne couleur, bien placée. Un pion creux : bonne couleur, mal placée.',
    `Le premier qui casse le code gagne, à nombre d’essais égal. Vous avez ${MAX_GUESSES} essais chacun.`,
  ],
  create: (ctx) => new Mastermind(ctx),
};
