import { cleanLine } from '../../text';
import { choiceOf, resolveSettings, type SettingDef } from '../settings';
import { isRecord, other, type GameContext, type GameDefinition, type GameInstance, type Slot } from '../types';
import { HEART_QUESTIONS } from './questions';

export const ROUNDS = 10;
const MAX_LENGTH = 80;

/** What the one being asked thinks of the guess. */
export const VERDICTS = { right: 2, close: 1, wrong: 0 } as const;
export type Verdict = keyof typeof VERDICTS;

export const HEART_SETTINGS: readonly SettingDef[] = [
  {
    id: 'rounds',
    label: 'Questions',
    kind: 'choice',
    options: [6, 10, 14].map((value) => ({ value, label: `${value}` })),
    default: ROUNDS,
  },
];

export interface HeartTv {
  phase: 'answer' | 'reveal';
  round: number;
  rounds: number;
  subject: Slot;
  question: string;
  written: [boolean, boolean];
  /** The subject's answer, then the other's guess; hidden until both are in. */
  answer: string | null;
  guess: string | null;
  scores: [number, number];
  verdicts: Verdict[];
  last: boolean;
}

export interface HeartPhone {
  phase: 'answer' | 'reveal';
  me: Slot;
  round: number;
  rounds: number;
  role: 'subject' | 'guesser';
  question: string;
  written: boolean;
  answer: string | null;
  guess: string | null;
  scores: [number, number];
  last: boolean;
  guard: string;
}

class Heart implements GameInstance {
  private phase: HeartTv['phase'] = 'answer';
  private round = 0;
  private readonly rounds: number;
  private question = '';
  private texts: [string, string] = ['', ''];
  private readonly scores: [number, number] = [0, 0];
  private readonly verdicts: Verdict[] = [];

  constructor(private readonly ctx: GameContext) {
    this.rounds = choiceOf(resolveSettings(HEART_SETTINGS, ctx.settings, ctx.rng), 'rounds');
    this.ask();
  }

  /** Partners take turns being the one the question is about. */
  private get subject(): Slot {
    return ((this.ctx.starter + this.round) % 2) as Slot;
  }

  private ask(): void {
    this.question = this.ctx.draw('heart', HEART_QUESTIONS, (question) => question);
    this.texts = ['', ''];
    this.phase = 'answer';
    this.ctx.fx('turn', 'all');
    this.ctx.update();
  }

  act(slot: Slot, action: unknown): void {
    if (!isRecord(action)) return;
    if (this.phase === 'answer' && action.type === 'write' && !this.texts[slot]) {
      const text = cleanLine(action.text, MAX_LENGTH);
      if (!text) return;
      this.texts[slot] = text;
      this.ctx.fx('lock', [slot]);
      if (this.texts[0] && this.texts[1]) {
        this.phase = 'reveal';
        this.ctx.fx('reveal', 'all');
      }
      this.ctx.update();
    } else if (this.phase === 'reveal' && action.type === 'judge' && slot === this.subject) {
      // Only the one the question was about knows whether the guess is right.
      const verdict = Object.keys(VERDICTS).find((key) => key === action.verdict) as Verdict | undefined;
      if (!verdict) return;
      this.scores[other(this.subject)] += VERDICTS[verdict];
      this.verdicts.push(verdict);
      this.ctx.fx(verdict === 'wrong' ? 'wrong' : 'correct', 'all');
      this.next();
    }
  }

  private next(): void {
    this.round += 1;
    if (this.round < this.rounds) {
      this.ask();
      return;
    }
    const [a, b] = this.scores;
    const winner: Slot | null = a === b ? null : a > b ? 0 : 1;
    this.ctx.finish({
      winner,
      title: winner === null ? 'Vous vous connaissez aussi bien l’un que l’autre !' : `${this.ctx.name(winner)} te connaît par cœur !`,
      detail: `${this.ctx.name(0)} ${a} – ${b} ${this.ctx.name(1)}`,
      scores: [a, b],
    });
  }

  tv(): HeartTv {
    const reveal = this.phase === 'reveal';
    return {
      phase: this.phase,
      round: this.round,
      rounds: this.rounds,
      subject: this.subject,
      question: this.question,
      written: [this.texts[0] !== '', this.texts[1] !== ''],
      answer: reveal ? this.texts[this.subject] : null,
      guess: reveal ? this.texts[other(this.subject)] : null,
      scores: [...this.scores],
      verdicts: [...this.verdicts],
      last: this.round === this.rounds - 1,
    };
  }

  phone(slot: Slot): HeartPhone {
    const reveal = this.phase === 'reveal';
    return {
      phase: this.phase,
      me: slot,
      round: this.round,
      rounds: this.rounds,
      role: slot === this.subject ? 'subject' : 'guesser',
      question: this.question,
      written: this.texts[slot] !== '',
      answer: reveal ? this.texts[this.subject] : null,
      guess: reveal ? this.texts[other(this.subject)] : null,
      scores: [...this.scores],
      last: this.round === this.rounds - 1,
      guard: `${this.round}-${this.phase}`,
    };
  }
}

export const heart: GameDefinition = {
  id: 'heart',
  title: 'Je te connais par cœur',
  tagline: 'Une question sur l’un, l’autre doit deviner sa réponse.',
  accent: '#ff5c9d',
  coop: false,
  rules: [
    'Chacun son tour, une question est posée sur l’un de vous : « Quel est ton plat préféré ? »',
    'Celui ou celle à qui on pose la question répond en secret. L’autre écrit ce qu’il pense que sera la réponse.',
    'Les deux réponses s’affichent sur la télé. Discutez-en, puis la personne concernée juge : bien vu (2 points), presque (1 point) ou raté.',
  ],
  settings: HEART_SETTINGS,
  create: (ctx) => new Heart(ctx),
};
