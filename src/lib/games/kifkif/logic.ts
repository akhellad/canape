import { isInt, isRecord, type GameContext, type GameDefinition, type GameInstance, type Slot } from '../types';
import { buildDeck, layoutCard, type Placement } from './deck';
import { SYMBOLS } from './symbols';

export const PILE_SIZE = 10;
export const PENALTY_MS = 1500;
const FINISH_DELAY_MS = 2600;

export interface CardView {
  id: number;
  items: Placement[];
}

export interface MatchInfo {
  seq: number;
  slot: Slot;
  symbol: number;
  card: number;
}

export interface KifKifTv {
  phase: 'play' | 'over';
  center: CardView;
  tops: [CardView | null, CardView | null];
  remaining: [number, number];
  total: number;
  lastMatch: MatchInfo | null;
  misses: [number, number];
  locked: [boolean, boolean];
  winner: Slot | null;
}

export interface KifKifPhone {
  phase: 'play' | 'over';
  me: Slot;
  card: CardView | null;
  center: number;
  remaining: [number, number];
  total: number;
  lockMs: number;
  lastMatch: MatchInfo | null;
  misses: number;
  winner: Slot | null;
  guard: string;
}

const DECK = buildDeck();

class KifKif implements GameInstance {
  private phase: KifKifTv['phase'] = 'play';
  private center: number;
  private readonly piles: [number[], number[]];
  private readonly lockUntil: [number, number] = [0, 0];
  private readonly misses: [number, number] = [0, 0];
  private readonly layouts = new Map<number, Placement[]>();
  private lastMatch: MatchInfo | null = null;
  private matchSeq = 0;
  private winner: Slot | null = null;

  constructor(private readonly ctx: GameContext) {
    const order = ctx.rng.shuffle(DECK.map((_, index) => index));
    this.center = order[0];
    this.piles = [order.slice(1, 1 + PILE_SIZE), order.slice(1 + PILE_SIZE, 1 + PILE_SIZE * 2)];
  }

  act(slot: Slot, action: unknown): void {
    if (this.phase !== 'play' || !isRecord(action) || action.type !== 'tap') return;
    if (action.center !== this.center || !isInt(action.symbol, 0, SYMBOLS.length - 1)) return;
    if (this.ctx.now() < this.lockUntil[slot]) return;
    const top = this.piles[slot][0];
    if (top === undefined || !DECK[top].includes(action.symbol)) return;

    if (DECK[this.center].includes(action.symbol)) {
      this.matchSeq += 1;
      this.lastMatch = { seq: this.matchSeq, slot, symbol: action.symbol, card: top };
      this.center = top;
      this.piles[slot].shift();
      this.ctx.fx('match', 'all');
      if (this.piles[slot].length === 0) this.win(slot);
    } else {
      this.misses[slot] += 1;
      this.lockUntil[slot] = this.ctx.now() + PENALTY_MS;
      this.ctx.fx('error', [slot]);
      this.ctx.after(PENALTY_MS, () => this.ctx.update());
    }
    this.ctx.update();
  }

  private win(slot: Slot): void {
    this.phase = 'over';
    this.winner = slot;
    const loser: Slot = slot === 0 ? 1 : 0;
    this.ctx.after(FINISH_DELAY_MS, () =>
      this.ctx.finish({
        winner: slot,
        title: `${this.ctx.name(slot)} a l’œil le plus rapide !`,
        detail: `Il restait ${this.piles[loser].length} carte${this.piles[loser].length > 1 ? 's' : ''} à ${this.ctx.name(loser)}.`,
      }),
    );
  }

  private card(id: number | undefined): CardView | null {
    if (id === undefined) return null;
    let items = this.layouts.get(id);
    if (!items) {
      items = layoutCard(DECK[id], this.ctx.rng);
      this.layouts.set(id, items);
    }
    return { id, items };
  }

  private isLocked(slot: Slot): boolean {
    return this.ctx.now() < this.lockUntil[slot];
  }

  tv(): KifKifTv {
    return {
      phase: this.phase,
      center: this.card(this.center) as CardView,
      tops: [this.card(this.piles[0][0]), this.card(this.piles[1][0])],
      remaining: [this.piles[0].length, this.piles[1].length],
      total: PILE_SIZE,
      lastMatch: this.lastMatch,
      misses: [...this.misses] as [number, number],
      locked: [this.isLocked(0), this.isLocked(1)],
      winner: this.winner,
    };
  }

  phone(slot: Slot): KifKifPhone {
    const card = this.card(this.piles[slot][0]);
    return {
      phase: this.phase,
      me: slot,
      card,
      center: this.center,
      remaining: [this.piles[0].length, this.piles[1].length],
      total: PILE_SIZE,
      lockMs: Math.max(0, this.lockUntil[slot] - this.ctx.now()),
      lastMatch: this.lastMatch,
      misses: this.misses[slot],
      winner: this.winner,
      guard: `c${card?.id ?? 'none'}`,
    };
  }
}

export const kifkif: GameDefinition = {
  id: 'kifkif',
  title: 'Kif-Kif',
  tagline: 'Trouvez le symbole en commun, plus vite que l’autre.',
  icon: 'eyes',
  accent: '#e9465a',
  coop: false,
  rules: [
    'La télé montre la carte du milieu, et ton téléphone montre ta carte.',
    'Ta carte et celle du milieu ont toujours exactement un symbole en commun. Trouve-le et touche-le sur ton téléphone !',
    'Ta carte part alors au milieu, et tu passes à la suivante. Attention : une erreur te bloque 1,5 seconde.',
    `Le premier qui se débarrasse de ses ${PILE_SIZE} cartes gagne.`,
  ],
  create: (ctx) => new KifKif(ctx),
};
