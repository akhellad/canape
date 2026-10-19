import { isRecord, other, type GameContext, type GameDefinition, type GameInstance, type Slot, type TimerHandle } from '../types';
import { CARDS, type Card } from './cards';

export const TURNS = 4;
export const TURN_SECONDS = 60;
const SUMMARY_MS = 4500;
const GOAL = 16;

export type Outcome = 'found' | 'pass' | 'buzz';

export interface Resolved {
  seq: number;
  word: string;
  outcome: Outcome;
}

export interface TabooTv {
  phase: 'ready' | 'play' | 'summary';
  turn: number;
  turns: number;
  describer: Slot;
  remaining: number;
  total: number;
  resolved: Resolved[];
  turnFound: number;
  score: number;
  goal: number;
}

export type TabooPhone = {
  phase: 'ready' | 'play' | 'summary';
  me: Slot;
  turn: number;
  turns: number;
  remaining: number;
  turnFound: number;
  score: number;
  last: Resolved | null;
  guard: string;
} & ({ role: 'describer'; card: Card | null } | { role: 'guesser' });

class Taboo implements GameInstance {
  private phase: TabooTv['phase'] = 'ready';
  private turn = 0;
  private describer: Slot;
  private card: Card | null = null;
  private deadline = 0;
  private resolved: Resolved[] = [];
  private seq = 0;
  private score = 0;
  private turnFound = 0;
  private timer: TimerHandle | null = null;
  private tick: TimerHandle | null = null;

  constructor(private readonly ctx: GameContext) {
    this.describer = ctx.starter;
    ctx.fx('turn', [this.describer]);
  }

  act(slot: Slot, action: unknown): void {
    if (!isRecord(action) || typeof action.type !== 'string') return;
    if (this.phase === 'ready' && action.type === 'start' && slot === this.describer) {
      this.start();
      return;
    }
    if (this.phase !== 'play') return;
    if (action.type === 'buzz') this.resolve('buzz');
    else if (slot === this.describer && action.type === 'found') this.resolve('found');
    else if (slot === this.describer && action.type === 'pass') this.resolve('pass');
  }

  private start(): void {
    this.phase = 'play';
    this.turnFound = 0;
    this.resolved = [];
    this.deadline = this.ctx.now() + TURN_SECONDS * 1000;
    this.card = this.drawCard();
    this.ctx.cancel(this.timer);
    this.timer = this.ctx.after(TURN_SECONDS * 1000, () => this.endTurn());
    this.scheduleTick();
    this.ctx.fx('reveal', 'all');
    this.ctx.update();
  }

  private drawCard(): Card {
    return this.ctx.draw('taboo', CARDS, (card) => card.word);
  }

  private resolve(outcome: Outcome): void {
    if (!this.card) return;
    this.seq += 1;
    this.resolved = [...this.resolved, { seq: this.seq, word: this.card.word, outcome }];
    if (outcome === 'found') {
      this.score += 1;
      this.turnFound += 1;
    }
    this.ctx.fx(outcome === 'found' ? 'correct' : outcome === 'buzz' ? 'error' : 'wrong', 'all');
    this.card = this.drawCard();
    this.ctx.update();
  }

  private scheduleTick(): void {
    this.ctx.cancel(this.tick);
    this.tick = this.ctx.after(1000, () => {
      if (this.phase !== 'play') return;
      if (this.remaining() <= 10) this.ctx.fx('tick', 'all');
      this.scheduleTick();
      this.ctx.update();
    });
  }

  private endTurn(): void {
    if (this.phase !== 'play') return;
    this.ctx.cancel(this.tick);
    this.phase = 'summary';
    this.card = null;
    this.ctx.fx('lose', 'all');
    this.ctx.update();
    this.timer = this.ctx.after(SUMMARY_MS, () => this.nextTurn());
  }

  private nextTurn(): void {
    this.turn += 1;
    if (this.turn >= TURNS) {
      this.ctx.finish({
        winner: null,
        title: `${this.score} mot${this.score > 1 ? 's' : ''} trouvé${this.score > 1 ? 's' : ''} !`,
        detail: this.score >= GOAL ? 'Vous parlez la même langue.' : `Objectif : ${GOAL} mots. Vous y êtes presque…`,
        coop: { won: this.score >= GOAL, score: this.score },
      });
      return;
    }
    this.describer = other(this.describer);
    this.phase = 'ready';
    this.resolved = [];
    this.turnFound = 0;
    this.ctx.fx('turn', [this.describer]);
    this.ctx.update();
  }

  private remaining(): number {
    if (this.phase !== 'play') return this.phase === 'ready' ? TURN_SECONDS : 0;
    return Math.max(0, Math.ceil((this.deadline - this.ctx.now()) / 1000));
  }

  tv(): TabooTv {
    return {
      phase: this.phase,
      turn: this.turn,
      turns: TURNS,
      describer: this.describer,
      remaining: this.remaining(),
      total: TURN_SECONDS,
      resolved: this.resolved,
      turnFound: this.turnFound,
      score: this.score,
      goal: GOAL,
    };
  }

  phone(slot: Slot): TabooPhone {
    const base = {
      phase: this.phase,
      me: slot,
      turn: this.turn,
      turns: TURNS,
      remaining: this.remaining(),
      turnFound: this.turnFound,
      score: this.score,
      last: this.resolved[this.resolved.length - 1] ?? null,
      guard: `${this.turn}-${this.phase}`,
    };
    if (slot === this.describer) return { ...base, role: 'describer', card: this.card };
    return { ...base, role: 'guesser' };
  }
}

export const taboo: GameDefinition = {
  id: 'taboo',
  title: 'Mots interdits',
  tagline: 'Faites deviner un max de mots… sans dire les mots interdits.',
  accent: '#2fd1a5',
  coop: true,
  rules: [
    `Chacun son tour, l’un fait deviner des mots à l’oral pendant ${TURN_SECONDS} secondes. Le mot et ses mots interdits s’affichent sur son téléphone.`,
    'Interdit de dire le mot, ses mots interdits, ou de mimer ! L’autre devine à voix haute.',
    'Trouvé ? Appuie sur « Trouvé ». Trop dur ? « Passer ». Un mot interdit lâché ? N’importe qui peut appuyer sur « Buzz ».',
    `${TURNS} manches en équipe : visez ${GOAL} mots au total !`,
  ],
  create: (ctx) => new Taboo(ctx),
};
