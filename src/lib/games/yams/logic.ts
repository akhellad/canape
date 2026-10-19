import { isInt, isRecord, other, SLOTS, type GameContext, type GameDefinition, type GameInstance, type Slot } from '../types';

export const DICE = 5;
export const ROLLS = 3;
const FINISH_DELAY_MS = 2500;
export const BONUS_THRESHOLD = 63;
export const BONUS = 35;

export const CATEGORIES = [
  { id: 'ones', label: 'As', upper: true },
  { id: 'twos', label: 'Deux', upper: true },
  { id: 'threes', label: 'Trois', upper: true },
  { id: 'fours', label: 'Quatre', upper: true },
  { id: 'fives', label: 'Cinq', upper: true },
  { id: 'sixes', label: 'Six', upper: true },
  { id: 'brelan', label: 'Brelan', upper: false },
  { id: 'carre', label: 'Carré', upper: false },
  { id: 'full', label: 'Full', upper: false },
  { id: 'small', label: 'Petite suite', upper: false },
  { id: 'large', label: 'Grande suite', upper: false },
  { id: 'yams', label: 'Yams', upper: false },
  { id: 'chance', label: 'Chance', upper: false },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]['id'];
export type Sheet = Record<CategoryId, number | null>;

export function scoreFor(category: CategoryId, dice: readonly number[]): number {
  const counts = [0, 0, 0, 0, 0, 0, 0];
  for (const die of dice) counts[die] += 1;
  const sum = dice.reduce((total, die) => total + die, 0);
  const most = Math.max(...counts);
  const has = (run: number[]) => run.every((face) => counts[face] > 0);
  switch (category) {
    case 'ones':
      return counts[1];
    case 'twos':
      return counts[2] * 2;
    case 'threes':
      return counts[3] * 3;
    case 'fours':
      return counts[4] * 4;
    case 'fives':
      return counts[5] * 5;
    case 'sixes':
      return counts[6] * 6;
    case 'brelan':
      return most >= 3 ? sum : 0;
    case 'carre':
      return most >= 4 ? sum : 0;
    case 'full':
      return counts.includes(3) && counts.includes(2) ? 25 : 0;
    case 'small':
      return has([1, 2, 3, 4]) || has([2, 3, 4, 5]) || has([3, 4, 5, 6]) ? 30 : 0;
    case 'large':
      return has([1, 2, 3, 4, 5]) || has([2, 3, 4, 5, 6]) ? 40 : 0;
    case 'yams':
      return most === 5 ? 50 : 0;
    case 'chance':
      return sum;
  }
}

export function upperTotal(sheet: Sheet): number {
  return CATEGORIES.filter((category) => category.upper).reduce((total, category) => total + (sheet[category.id] ?? 0), 0);
}

export function total(sheet: Sheet): number {
  const all = CATEGORIES.reduce((sum, category) => sum + (sheet[category.id] ?? 0), 0);
  return all + (upperTotal(sheet) >= BONUS_THRESHOLD ? BONUS : 0);
}

function emptySheet(): Sheet {
  return Object.fromEntries(CATEGORIES.map((category) => [category.id, null])) as Sheet;
}

export interface YamsTv {
  phase: 'play' | 'over';
  turn: Slot;
  round: number;
  rounds: number;
  dice: number[];
  held: boolean[];
  rollsLeft: number;
  rollSeq: number;
  sheets: [Sheet, Sheet];
  totals: [number, number];
  last: { slot: Slot; category: CategoryId; points: number; seq: number } | null;
  potential: Partial<Record<CategoryId, number>>;
  winner: Slot | null;
}

export interface YamsPhone extends YamsTv {
  me: Slot;
  myTurn: boolean;
  guard: string;
}

class Yams implements GameInstance {
  private phase: YamsTv['phase'] = 'play';
  private turn: Slot;
  private dice = [1, 2, 3, 4, 5];
  private held = Array<boolean>(DICE).fill(false);
  private rollsLeft = ROLLS;
  private rollSeq = 0;
  private readonly sheets: [Sheet, Sheet] = [emptySheet(), emptySheet()];
  private last: YamsTv['last'] = null;
  private seq = 0;
  private winner: Slot | null = null;

  constructor(private readonly ctx: GameContext) {
    this.turn = ctx.starter;
    ctx.fx('turn', [this.turn]);
  }

  act(slot: Slot, action: unknown): void {
    if (this.phase !== 'play' || slot !== this.turn || !isRecord(action)) return;
    if (action.type === 'roll' && this.rollsLeft > 0) {
      if (this.rollsLeft === ROLLS) this.held.fill(false);
      this.dice = this.dice.map((die, index) => (this.held[index] ? die : 1 + this.ctx.rng.int(6)));
      this.rollsLeft -= 1;
      this.rollSeq += 1;
      this.ctx.fx('roll', 'all');
      this.ctx.update();
    } else if (action.type === 'hold' && isInt(action.index, 0, DICE - 1) && this.rollsLeft < ROLLS && this.rollsLeft > 0) {
      this.held[action.index] = !this.held[action.index];
      this.ctx.update();
    } else if (action.type === 'score' && this.rollsLeft < ROLLS && typeof action.category === 'string') {
      const category = CATEGORIES.find((candidate) => candidate.id === action.category);
      if (!category || this.sheets[slot][category.id] !== null) return;
      const points = scoreFor(category.id, this.dice);
      this.sheets[slot][category.id] = points;
      this.seq += 1;
      this.last = { slot, category: category.id, points, seq: this.seq };
      this.ctx.fx(points > 0 ? (category.id === 'yams' ? 'win' : 'correct') : 'wrong', 'all');
      this.nextTurn();
      this.ctx.update();
    }
  }

  private nextTurn(): void {
    if (SLOTS.every((slot) => CATEGORIES.every((category) => this.sheets[slot][category.id] !== null))) {
      this.phase = 'over';
      const [a, b] = [total(this.sheets[0]), total(this.sheets[1])];
      this.winner = a === b ? null : a > b ? 0 : 1;
      const winner = this.winner;
      this.ctx.after(FINISH_DELAY_MS, () =>
        this.ctx.finish({
          winner,
          title: winner === null ? `Égalité parfaite à ${a} points !` : `${this.ctx.name(winner)} gagne le Yams !`,
          scores: [a, b],
        }),
      );
      return;
    }
    this.turn = other(this.turn);
    this.rollsLeft = ROLLS;
    this.held = Array<boolean>(DICE).fill(false);
    this.ctx.fx('turn', [this.turn]);
  }

  private round(): number {
    return Math.min(CATEGORIES.length, CATEGORIES.filter((category) => this.sheets[this.turn][category.id] !== null).length + 1);
  }

  tv(): YamsTv {
    const rolled = this.rollsLeft < ROLLS && this.phase === 'play';
    const potential: YamsTv['potential'] = {};
    if (rolled) {
      for (const category of CATEGORIES) {
        if (this.sheets[this.turn][category.id] === null) potential[category.id] = scoreFor(category.id, this.dice);
      }
    }
    return {
      phase: this.phase,
      turn: this.turn,
      round: this.round(),
      rounds: CATEGORIES.length,
      dice: [...this.dice],
      held: [...this.held],
      rollsLeft: this.rollsLeft,
      rollSeq: this.rollSeq,
      sheets: [{ ...this.sheets[0] }, { ...this.sheets[1] }],
      totals: [total(this.sheets[0]), total(this.sheets[1])],
      last: this.last,
      potential,
      winner: this.winner,
    };
  }

  phone(slot: Slot): YamsPhone {
    return { ...this.tv(), me: slot, myTurn: this.phase === 'play' && slot === this.turn, guard: `${this.seq}` };
  }
}

export const yams: GameDefinition = {
  id: 'yams',
  title: 'Yams',
  tagline: 'Cinq dés, trois lancers, et une grille à remplir.',
  accent: '#8c1650',
  coop: false,
  rules: [
    'À ton tour, lance les dés jusqu’à trois fois. Entre deux lancers, touche les dés que tu veux garder.',
    'Puis choisis une case de ta grille : les points possibles s’affichent. Chaque case ne sert qu’une fois, quitte à y mettre zéro.',
    `Brelan et carré rapportent la somme des dés, full 25, petite suite 30, grande suite 40 et Yams 50. ${BONUS} points de bonus si le haut de la grille atteint ${BONUS_THRESHOLD}.`,
  ],
  create: (ctx) => new Yams(ctx),
};
