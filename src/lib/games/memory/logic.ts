import { isInt, isRecord, other, type GameContext, type GameDefinition, type GameInstance, type Slot } from '../types';

export const PAIRS = 12;
export const SYMBOL_COUNT = 16;
const MATCH_MS = 900;
const MISS_MS = 1600;
const FINISH_DELAY_MS = 2200;

export interface MemoryCard {
  symbol: number | null;
  found: Slot | null;
  open: boolean;
}

export interface MemoryTv {
  phase: 'play' | 'over';
  turn: Slot;
  cards: MemoryCard[];
  scores: [number, number];
  busy: boolean;
  streak: number;
  last: { seq: number; match: boolean } | null;
  winner: Slot | null;
}

export interface MemoryPhone extends MemoryTv {
  me: Slot;
  myTurn: boolean;
  guard: string;
}

class Memory implements GameInstance {
  private phase: MemoryTv['phase'] = 'play';
  private turn: Slot;
  private readonly symbols: number[];
  private readonly found: (Slot | null)[];
  private open: number[] = [];
  private readonly scores: [number, number] = [0, 0];
  private busy = false;
  private streak = 0;
  private seq = 0;
  private last: MemoryTv['last'] = null;
  private winner: Slot | null = null;

  constructor(private readonly ctx: GameContext) {
    this.turn = ctx.starter;
    const chosen = ctx.rng.shuffle(Array.from({ length: SYMBOL_COUNT }, (_, index) => index)).slice(0, PAIRS);
    this.symbols = ctx.rng.shuffle([...chosen, ...chosen]);
    this.found = this.symbols.map(() => null);
    ctx.fx('turn', [this.turn]);
  }

  act(slot: Slot, action: unknown): void {
    if (this.phase !== 'play' || this.busy || slot !== this.turn) return;
    if (!isRecord(action) || action.type !== 'flip' || !isInt(action.card, 0, this.symbols.length - 1)) return;
    const card = action.card;
    if (this.found[card] !== null || this.open.includes(card)) return;
    this.open.push(card);
    this.ctx.fx('flip', 'all');
    if (this.open.length === 2) this.resolve(slot);
    this.ctx.update();
  }

  private resolve(slot: Slot): void {
    const [a, b] = this.open;
    const match = this.symbols[a] === this.symbols[b];
    this.busy = true;
    this.seq += 1;
    this.last = { seq: this.seq, match };
    if (match) {
      this.found[a] = slot;
      this.found[b] = slot;
      this.scores[slot] += 1;
      this.streak += 1;
      this.ctx.fx('correct', 'all');
    } else {
      this.streak = 0;
      this.ctx.fx('wrong', 'all');
    }
    this.ctx.after(match ? MATCH_MS : MISS_MS, () => {
      this.open = [];
      this.busy = false;
      if (this.found.every((owner) => owner !== null)) {
        this.end();
      } else if (!match) {
        this.turn = other(this.turn);
        this.ctx.fx('turn', [this.turn]);
      }
      this.ctx.update();
    });
  }

  private end(): void {
    this.phase = 'over';
    const [a, b] = this.scores;
    this.winner = a === b ? null : a > b ? 0 : 1;
    const winner = this.winner;
    this.ctx.after(FINISH_DELAY_MS, () =>
      this.ctx.finish({
        winner,
        title: winner === null ? 'Autant de paires chacun, égalité !' : `${this.ctx.name(winner)} a la meilleure mémoire !`,
        scores: [a, b],
      }),
    );
  }

  tv(): MemoryTv {
    return {
      phase: this.phase,
      turn: this.turn,
      cards: this.symbols.map((symbol, index) => {
        const open = this.open.includes(index);
        const found = this.found[index];
        return { symbol: open || found !== null ? symbol : null, found, open };
      }),
      scores: [...this.scores],
      busy: this.busy,
      streak: this.streak,
      last: this.last,
      winner: this.winner,
    };
  }

  phone(slot: Slot): MemoryPhone {
    return { ...this.tv(), me: slot, myTurn: this.phase === 'play' && slot === this.turn && !this.busy, guard: `${this.turn}-${this.seq}` };
  }
}

export const memory: GameDefinition = {
  id: 'memory',
  title: 'Memory',
  tagline: 'Retournez les cartes et retenez où se cachent les paires.',
  accent: '#b9a6ff',
  coop: false,
  rules: [
    `${PAIRS * 2} cartes sont posées face cachée sur la télé. À ton tour, retourne-en deux depuis ton téléphone.`,
    'Si elles sont identiques, tu gagnes la paire et tu rejoues. Sinon, elles se retournent et c’est à l’autre.',
    'Ouvrez l’œil : tout ce que l’autre retourne, vous le voyez aussi. Le plus de paires gagne !',
  ],
  create: (ctx) => new Memory(ctx),
};
