import { levenshtein, normalize } from '../../text';
import { Pad, type Stroke } from '../../draw/pad';
import { choiceOf, resolveSettings, type SettingDef } from '../settings';
import { isInt, isRecord, other, type GameContext, type GameDefinition, type GameInstance, type Slot, type TimerHandle } from '../types';
import { SKETCH_WORDS } from './words';

export const ROUNDS = 6;
export const DRAW_SECONDS = 80;
const MAX_GUESSES = 6;
/** Hints show up at these fractions of the drawing time. */
const HINT_AT = [0.5, 0.75];

export const SKETCH_SETTINGS: readonly SettingDef[] = [
  {
    id: 'rounds',
    label: 'Manches',
    kind: 'choice',
    options: [4, 6, 8, 10].map((value) => ({ value, label: `${value}` })),
    default: ROUNDS,
  },
  {
    id: 'time',
    label: 'Temps de dessin',
    kind: 'choice',
    options: [45, 60, 80, 100, 120, 180].map((value) => ({ value, label: value < 120 ? `${value} s` : `${value / 60} min` })),
    default: DRAW_SECONDS,
  },
  {
    id: 'hints',
    label: 'Lettres dévoilées',
    kind: 'choice',
    options: [
      { value: 0, label: 'Aucune' },
      { value: 1, label: 'Une' },
      { value: 2, label: 'Deux' },
    ],
    default: 2,
  },
];

export type Level = 1 | 2 | 3;

export interface GuessView {
  seq: number;
  text: string;
  near: boolean;
}

export interface SketchTv {
  phase: 'choose' | 'draw' | 'reveal';
  round: number;
  rounds: number;
  last: boolean;
  drawer: Slot;
  level: Level | null;
  pattern: string;
  word: string | null;
  remaining: number;
  total: number;
  strokes: Stroke[];
  strokeRev: number;
  guesses: GuessView[];
  success: boolean | null;
  points: number;
  score: number;
  found: number;
}

export type SketchPhone = {
  phase: 'choose' | 'draw' | 'reveal';
  me: Slot;
  round: number;
  rounds: number;
  last: boolean;
  remaining: number;
  guesses: GuessView[];
  success: boolean | null;
  points: number;
  score: number;
  guard: string;
} & (
  | {
      role: 'drawer';
      choices: { word: string; level: Level }[];
      word: string | null;
      level: Level | null;
      canDraw: boolean;
      strokeCount: number;
    }
  | {
      role: 'guesser';
      pattern: string;
      word: string | null;
      level: Level | null;
      lastGuess: { seq: number; correct: boolean; near: boolean } | null;
    }
);

export const ARTICLES = /\b(le|la|les|un|une|des|du|de|l|d|a|au|aux)\b/g;

/** Both sides lose their articles and spaces, so « faire la fête » matches « faire fete » or « Faire la fête ». */
function simplify(text: string): string {
  return normalize(text).replace(ARTICLES, ' ').replace(/\s+/g, '');
}

export function isAnswer(guess: string, word: string): { correct: boolean; near: boolean } {
  const a = simplify(guess);
  const b = simplify(word);
  if (!a) return { correct: false, near: false };
  if (a === b || a === `${b}s` || `${a}s` === b || a === `${b}x` || `${a}x` === b) return { correct: true, near: false };
  const distance = levenshtein(a, b);
  const typos = b.length >= 12 ? 2 : b.length >= 6 ? 1 : 0;
  if (distance <= typos) return { correct: true, near: false };
  return { correct: false, near: distance <= Math.max(2, Math.floor(b.length / 4)) || (a.length >= 4 && b.includes(a)) };
}

class Sketch implements GameInstance {
  private round = 0;
  private phase: SketchTv['phase'] = 'choose';
  private drawer: Slot;
  private choices: { word: string; level: Level }[] = [];
  private word: string | null = null;
  private level: Level | null = null;
  private deadline = 0;
  private startedAt = 0;
  private readonly pad = new Pad();
  private guesses: GuessView[] = [];
  private guessSeq = 0;
  private lastGuess: { seq: number; correct: boolean; near: boolean } | null = null;
  private revealed = new Set<number>();
  private success: boolean | null = null;
  private points = 0;
  private score = 0;
  private found = 0;
  private tick: TimerHandle | null = null;
  private readonly rounds: number;
  private readonly drawSeconds: number;
  private readonly hints: number;

  constructor(private readonly ctx: GameContext) {
    const settings = resolveSettings(SKETCH_SETTINGS, ctx.settings, ctx.rng);
    this.rounds = choiceOf(settings, 'rounds');
    this.drawSeconds = choiceOf(settings, 'time');
    this.hints = choiceOf(settings, 'hints');
    this.drawer = ctx.starter;
    this.prepareRound();
  }

  act(slot: Slot, action: unknown): void {
    if (!isRecord(action) || typeof action.type !== 'string') return;
    // Either player moves on once they are done looking at the drawing.
    if (action.type === 'next' && this.phase === 'reveal') this.nextRound();
    else if (slot === this.drawer) this.drawerAction(action);
    else if (action.type === 'guess' && this.phase === 'draw') this.guess(action.text);
  }

  private prepareRound(): void {
    this.phase = 'choose';
    this.drawer = ((this.ctx.starter + this.round) % 2) as Slot;
    this.choices = ([1, 2, 3] as Level[]).map((level) => ({ word: this.drawWord(level), level }));
    this.word = null;
    this.level = null;
    this.pad.reset();
    this.guesses = [];
    this.lastGuess = null;
    this.revealed = new Set();
    this.success = null;
    this.points = 0;
    this.ctx.fx('turn', [this.drawer]);
    this.ctx.update();
  }

  private drawWord(level: Level): string {
    return this.ctx.draw(`sketch-${level}`, SKETCH_WORDS[level], (word) => word);
  }

  private drawerAction(action: Record<string, unknown>): void {
    if (action.type === 'choose' && this.phase === 'choose' && isInt(action.index, 0, this.choices.length - 1)) {
      const choice = this.choices[action.index];
      this.word = choice.word;
      this.level = choice.level;
      this.phase = 'draw';
      this.startedAt = this.ctx.now();
      this.deadline = this.startedAt + this.drawSeconds * 1000;
      this.ctx.fx('turn', [other(this.drawer)]);
      this.scheduleTick();
      this.ctx.update();
      return;
    }
    if (this.phase !== 'draw') return;
    if (action.type === 'skip') this.reveal(false);
    else if (this.pad.apply(action)) this.ctx.update();
  }

  private guess(raw: unknown): void {
    if (typeof raw !== 'string' || !this.word) return;
    const text = raw.trim().slice(0, 40);
    if (!text) return;
    const { correct, near } = isAnswer(text, this.word);
    this.guessSeq += 1;
    this.lastGuess = { seq: this.guessSeq, correct, near };
    this.guesses = [...this.guesses, { seq: this.guessSeq, text, near }].slice(-MAX_GUESSES);
    if (correct) {
      this.reveal(true);
      return;
    }
    this.ctx.fx('wrong', 'all');
    this.ctx.update();
  }

  private scheduleTick(): void {
    this.ctx.cancel(this.tick);
    this.tick = this.ctx.after(1000, () => {
      if (this.phase !== 'draw') return;
      const elapsed = (this.ctx.now() - this.startedAt) / 1000;
      HINT_AT.slice(0, this.hints).forEach((fraction, index) => {
        if (elapsed >= fraction * this.drawSeconds && this.revealed.size <= index) this.revealLetter();
      });
      if (this.ctx.now() >= this.deadline) {
        this.reveal(false);
        return;
      }
      if (this.remaining() <= 10) this.ctx.fx('tick', 'all');
      this.scheduleTick();
      this.ctx.update();
    });
  }

  private revealLetter(): void {
    if (!this.word) return;
    const letters = [...this.word]
      .map((char, index) => ({ char, index }))
      .filter(({ char, index }) => /[a-zà-ÿœ]/i.test(char) && !this.revealed.has(index));
    if (letters.length <= 2) return;
    this.revealed.add(this.ctx.rng.pick(letters).index);
  }

  private remaining(): number {
    if (this.phase !== 'draw') return 0;
    return Math.max(0, Math.ceil((this.deadline - this.ctx.now()) / 1000));
  }

  private reveal(success: boolean): void {
    this.ctx.cancel(this.tick);
    this.tick = null;
    const remaining = this.remaining();
    this.phase = 'reveal';
    this.success = success;
    this.points = success && this.level ? this.level * (20 + Math.round((40 * remaining) / this.drawSeconds)) : 0;
    this.score += this.points;
    if (success) this.found += 1;
    this.ctx.fx(success ? 'correct' : 'lose', 'all');
    this.ctx.update();
  }

  private nextRound(): void {
    this.round += 1;
    if (this.round < this.rounds) {
      this.prepareRound();
      return;
    }
    this.ctx.finish({
      winner: null,
      title: `Score d’équipe : ${this.score} points`,
      detail: `${this.found} dessin${this.found > 1 ? 's' : ''} trouvé${this.found > 1 ? 's' : ''} sur ${this.rounds}.`,
      coop: { won: this.found >= this.rounds / 2, score: this.score },
    });
  }

  private pattern(): string {
    if (!this.word) return '';
    return [...this.word].map((char, index) => (/[a-zà-ÿœ]/i.test(char) && !this.revealed.has(index) ? '_' : char)).join('');
  }

  tv(): SketchTv {
    return {
      phase: this.phase,
      round: this.round,
      rounds: this.rounds,
      last: this.round === this.rounds - 1,
      drawer: this.drawer,
      level: this.level,
      pattern: this.pattern(),
      word: this.phase === 'reveal' ? this.word : null,
      remaining: this.remaining(),
      total: this.drawSeconds,
      strokes: this.pad.strokes,
      strokeRev: this.pad.rev,
      guesses: this.guesses,
      success: this.success,
      points: this.points,
      score: this.score,
      found: this.found,
    };
  }

  phone(slot: Slot): SketchPhone {
    const base = {
      phase: this.phase,
      me: slot,
      round: this.round,
      rounds: this.rounds,
      last: this.round === this.rounds - 1,
      remaining: this.remaining(),
      guesses: this.guesses,
      success: this.success,
      points: this.points,
      score: this.score,
      guard: `${this.round}-${this.phase}`,
    };
    if (slot === this.drawer) {
      return {
        ...base,
        role: 'drawer',
        choices: this.phase === 'choose' ? this.choices : [],
        word: this.word,
        level: this.level,
        canDraw: this.phase === 'draw',
        strokeCount: this.pad.strokes.length,
      };
    }
    return {
      ...base,
      role: 'guesser',
      pattern: this.pattern(),
      word: this.phase === 'reveal' ? this.word : null,
      level: this.level,
      lastGuess: this.lastGuess,
    };
  }
}

export const sketch: GameDefinition = {
  id: 'sketch',
  title: 'Gribouille',
  tagline: 'L’un dessine sur son téléphone, l’autre devine sur la télé.',
  accent: '#ff7a2e',
  coop: true,
  rules: [
    'Chacun son tour, l’un choisit un mot (facile, moyen ou difficile) et le dessine sur son téléphone, avec pinceau, gomme et pot de peinture. Le dessin apparaît en direct sur la télé.',
    'L’autre tape ses propositions sur son téléphone. Plus vous trouvez vite, plus vous marquez de points !',
    'Une fois le mot dévoilé, prenez le temps d’admirer le chef-d’œuvre : on passe au dessin suivant quand l’un de vous appuie sur « Suivant ».',
    'Vous jouez en équipe : battez votre record !',
  ],
  settings: SKETCH_SETTINGS,
  create: (ctx) => new Sketch(ctx),
};
