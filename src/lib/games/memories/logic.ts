import { cleanLine } from '../../text';
import { choiceOf, resolveSettings, type SettingDef } from '../settings';
import { isRecord, type GameContext, type GameDefinition, type GameInstance, type Slot } from '../types';
import { MEMORY_QUESTIONS } from './questions';

export const ROUNDS = 8;
const MAX_LENGTH = 80;

/** How close the two versions of the story are, decided together. */
export const MATCHES = { same: 2, close: 1, different: 0 } as const;
export type Match = keyof typeof MATCHES;

export const MEMORIES_SETTINGS: readonly SettingDef[] = [
  {
    id: 'rounds',
    label: 'Questions',
    kind: 'choice',
    options: [5, 8, 12].map((value) => ({ value, label: `${value}` })),
    default: ROUNDS,
  },
];

export interface MemoriesTv {
  phase: 'answer' | 'reveal';
  round: number;
  rounds: number;
  question: string;
  written: [boolean, boolean];
  answers: [string, string] | null;
  score: number;
  matches: Match[];
  last: boolean;
}

export interface MemoriesPhone {
  phase: 'answer' | 'reveal';
  me: Slot;
  round: number;
  rounds: number;
  question: string;
  written: boolean;
  answers: [string, string] | null;
  score: number;
  last: boolean;
  guard: string;
}

export function verdict(score: number, max: number): string {
  const ratio = max ? score / max : 0;
  if (ratio >= 0.85) return 'Une seule et même mémoire';
  if (ratio >= 0.6) return 'Vous avez la même histoire en tête';
  if (ratio >= 0.35) return 'Chacun sa version, et c’est mignon';
  return 'Deux romans pour une seule histoire';
}

class Memories implements GameInstance {
  private phase: MemoriesTv['phase'] = 'answer';
  private round = 0;
  private readonly rounds: number;
  private question = '';
  private texts: [string, string] = ['', ''];
  private score = 0;
  private readonly matches: Match[] = [];

  constructor(private readonly ctx: GameContext) {
    this.rounds = choiceOf(resolveSettings(MEMORIES_SETTINGS, ctx.settings, ctx.rng), 'rounds');
    this.ask();
  }

  private ask(): void {
    this.question = this.ctx.draw('memories', MEMORY_QUESTIONS, (question) => question);
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
    } else if (this.phase === 'reveal' && action.type === 'match') {
      // Talked it over: either of you settles it and moves on.
      const match = Object.keys(MATCHES).find((key) => key === action.match) as Match | undefined;
      if (!match) return;
      this.score += MATCHES[match];
      this.matches.push(match);
      this.ctx.fx(match === 'different' ? 'wrong' : 'correct', 'all');
      this.next();
    }
  }

  private next(): void {
    this.round += 1;
    if (this.round < this.rounds) {
      this.ask();
      return;
    }
    const max = this.rounds * MATCHES.same;
    this.ctx.finish({
      winner: null,
      title: verdict(this.score, max),
      detail: `${this.matches.filter((match) => match === 'same').length} souvenir(s) identique(s) sur ${this.rounds}.`,
      coop: { won: this.score >= max / 2, score: this.score },
    });
  }

  tv(): MemoriesTv {
    return {
      phase: this.phase,
      round: this.round,
      rounds: this.rounds,
      question: this.question,
      written: [this.texts[0] !== '', this.texts[1] !== ''],
      answers: this.phase === 'reveal' ? [...this.texts] : null,
      score: this.score,
      matches: [...this.matches],
      last: this.round === this.rounds - 1,
    };
  }

  phone(slot: Slot): MemoriesPhone {
    return {
      phase: this.phase,
      me: slot,
      round: this.round,
      rounds: this.rounds,
      question: this.question,
      written: this.texts[slot] !== '',
      answers: this.phase === 'reveal' ? [...this.texts] : null,
      score: this.score,
      last: this.round === this.rounds - 1,
      guard: `${this.round}-${this.phase}`,
    };
  }
}

export const memories: GameDefinition = {
  id: 'memories',
  title: 'Nos souvenirs',
  tagline: 'Votre histoire, racontée par chacun de vous deux.',
  accent: '#ffc4dc',
  coop: true,
  rules: [
    'Une question sur votre histoire s’affiche : « Où était notre premier rendez-vous ? »',
    'Chacun écrit sa version en secret sur son téléphone.',
    'Les deux versions s’affichent côte à côte. Racontez-vous, riez-en, puis dites ensemble si c’est le même souvenir (2 points), presque (1 point) ou pas du tout.',
  ],
  settings: MEMORIES_SETTINGS,
  create: (ctx) => new Memories(ctx),
};
