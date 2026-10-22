import { cleanLine } from '../../text';
import { choiceOf, resolveSettings, type SettingDef } from '../settings';
import { isRecord, type GameContext, type GameDefinition, type GameInstance, type Slot } from '../types';
import { SWEET_LETTERS, SWEET_PROMPTS } from './prompts';

export const ROUNDS = 5;
const MAX_LENGTH = 140;

export const SWEET_SETTINGS: readonly SettingDef[] = [
  {
    id: 'rounds',
    label: 'Mots doux',
    kind: 'choice',
    options: [3, 5, 8].map((value) => ({ value, label: `${value}` })),
    default: ROUNDS,
  },
  {
    id: 'letter',
    label: 'Lettre imposée',
    kind: 'choice',
    options: [
      { value: 0, label: 'Non' },
      { value: 1, label: 'Oui' },
    ],
    default: 0,
  },
];

export interface SweetPage {
  prompt: string;
  letter: string | null;
  texts: [string, string];
}

/** `book` is the end: every sweet word of the game on one screen, before leaving. */
export type Phase = 'write' | 'reveal' | 'book';

export interface SweetTv {
  phase: Phase;
  round: number;
  rounds: number;
  prompt: string;
  letter: string | null;
  written: [boolean, boolean];
  texts: [string, string] | null;
  book: SweetPage[];
  last: boolean;
}

export interface SweetPhone {
  phase: Phase;
  me: Slot;
  round: number;
  rounds: number;
  prompt: string;
  letter: string | null;
  written: boolean;
  texts: [string, string] | null;
  last: boolean;
  guard: string;
}

class Sweet implements GameInstance {
  private phase: Phase = 'write';
  private round = 0;
  private readonly rounds: number;
  private readonly withLetter: boolean;
  private prompt = '';
  private letter: string | null = null;
  private texts: [string, string] = ['', ''];
  private readonly book: SweetPage[] = [];

  constructor(private readonly ctx: GameContext) {
    const settings = resolveSettings(SWEET_SETTINGS, ctx.settings, ctx.rng);
    this.rounds = choiceOf(settings, 'rounds');
    this.withLetter = choiceOf(settings, 'letter') === 1;
    this.ask();
  }

  private ask(): void {
    this.prompt = this.ctx.draw('sweet', SWEET_PROMPTS, (prompt) => prompt);
    this.letter = this.withLetter ? this.ctx.rng.pick(SWEET_LETTERS) : null;
    this.texts = ['', ''];
    this.phase = 'write';
    this.ctx.fx('turn', 'all');
    this.ctx.update();
  }

  act(slot: Slot, action: unknown): void {
    if (!isRecord(action)) return;
    if (this.phase === 'write' && action.type === 'write' && !this.texts[slot]) {
      const text = cleanLine(action.text, MAX_LENGTH);
      if (!text) return;
      this.texts[slot] = text;
      this.ctx.fx('lock', [slot]);
      if (this.texts[0] && this.texts[1]) {
        this.phase = 'reveal';
        this.book.push({ prompt: this.prompt, letter: this.letter, texts: [...this.texts] });
        this.ctx.fx('reveal', 'all');
      }
      this.ctx.update();
    } else if (action.type === 'next' && this.phase === 'reveal') {
      this.round += 1;
      if (this.round < this.rounds) {
        this.ask();
        return;
      }
      this.phase = 'book';
      this.ctx.fx('win', 'all');
      this.ctx.update();
    } else if (action.type === 'next' && this.phase === 'book') {
      this.ctx.finish({
        winner: null,
        title: 'Que de mots doux !',
        detail: `${this.ctx.name(0)} et ${this.ctx.name(1)} se sont dit ${this.book.length * 2} jolies choses.`,
        coop: { won: true },
      });
    }
  }

  tv(): SweetTv {
    return {
      phase: this.phase,
      round: this.round,
      rounds: this.rounds,
      prompt: this.prompt,
      letter: this.letter,
      written: [this.texts[0] !== '', this.texts[1] !== ''],
      texts: this.phase === 'reveal' ? [...this.texts] : null,
      book: this.phase === 'book' ? this.book : [],
      last: this.round === this.rounds - 1,
    };
  }

  phone(slot: Slot): SweetPhone {
    return {
      phase: this.phase,
      me: slot,
      round: this.round,
      rounds: this.rounds,
      prompt: this.prompt,
      letter: this.letter,
      written: this.texts[slot] !== '',
      texts: this.phase === 'reveal' ? [...this.texts] : null,
      last: this.round === this.rounds - 1,
      guard: `${this.round}-${this.phase}`,
    };
  }
}

export const sweet: GameDefinition = {
  id: 'sweet',
  title: 'Mots doux',
  tagline: 'Une phrase à compléter pour l’autre, et le cœur qui fond.',
  accent: '#e8213f',
  coop: true,
  rules: [
    'Un début de phrase s’affiche : « Ce que j’aime chez toi, c’est… ». Chacun la complète en secret pour l’autre.',
    'Les deux mots doux apparaissent ensemble sur la télé. Prenez le temps de les savourer avant de passer au suivant.',
    'Pour pimenter, activez la lettre imposée : ta réponse doit commencer par cette lettre. À la fin, retrouvez tous vos mots doux réunis.',
  ],
  settings: SWEET_SETTINGS,
  create: (ctx) => new Sweet(ctx),
};
