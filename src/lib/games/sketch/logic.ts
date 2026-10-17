import type { IconName } from '../../icons/icons';
import { levenshtein, normalize } from '../../text';
import { isInt, isRecord, other, type GameContext, type GameDefinition, type GameInstance, type Slot, type TimerHandle } from '../types';
import { SKETCH_WORDS } from './words';

export const ROUNDS = 6;
export const DRAW_SECONDS = 80;
export const CANVAS = 1000;
export const PALETTE = ['#1d1612', '#e9465a', '#f08a2c', '#f4c430', '#4e9a6b', '#3c7ce0', '#8b5a4a', '#ff8fb1'] as const;
export const BRUSHES = [8, 18, 36] as const;
const REVEAL_MS = 5000;
const MAX_POINTS_PER_ROUND = 40000;
const MAX_GUESSES = 6;
const HINT_TIMES = [40, 60];

export type SketchMode = 'normal' | 'blind' | 'oneStroke' | 'straight' | 'mirror';
export type Level = 1 | 2 | 3;

export const MODES: Record<SketchMode, { title: string; description: string; icon: IconName }> = {
  normal: { title: 'Dessin libre', description: 'Aucune contrainte, fais-toi plaisir.', icon: 'artist-palette' },
  blind: {
    title: 'Les yeux bandés',
    description: 'Ton dessin n’apparaît pas sur ton téléphone. Seule la télé le voit !',
    icon: 'see-no-evil-monkey',
  },
  oneStroke: { title: 'D’un seul trait', description: 'Tu as droit à un seul trait : ne lève pas le doigt !', icon: 'fountain-pen' },
  straight: { title: 'Que des lignes droites', description: 'Chaque trait devient une ligne droite.', icon: 'straight-ruler' },
  mirror: { title: 'Dessin miroir', description: 'Tout ce que tu dessines apparaît inversé, comme dans un miroir.', icon: 'mirror' },
};

export interface Stroke {
  id: number;
  color: string;
  size: number;
  points: number[];
  ended: boolean;
}

export interface GuessView {
  seq: number;
  text: string;
  near: boolean;
}

export interface SketchTv {
  phase: 'choose' | 'draw' | 'reveal';
  round: number;
  rounds: number;
  drawer: Slot;
  mode: SketchMode;
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
  mode: SketchMode;
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

function isAnswer(guess: string, word: string): { correct: boolean; near: boolean } {
  const a = normalize(guess)
    .replace(/\b(le|la|les|un|une|des|l|d)\b/g, '')
    .replace(/\s+/g, '');
  const b = normalize(word).replace(/\s+/g, '');
  if (!a) return { correct: false, near: false };
  if (a === b || a === `${b}s` || `${a}s` === b) return { correct: true, near: false };
  const distance = levenshtein(a, b);
  if (b.length >= 6 && distance <= 1) return { correct: true, near: false };
  return { correct: false, near: distance <= Math.max(2, Math.floor(b.length / 4)) || (a.length >= 4 && b.includes(a)) };
}

class Sketch implements GameInstance {
  private round = 0;
  private phase: SketchTv['phase'] = 'choose';
  private drawer: Slot;
  private mode: SketchMode = 'normal';
  private choices: { word: string; level: Level }[] = [];
  private word: string | null = null;
  private level: Level | null = null;
  private deadline = 0;
  private startedAt = 0;
  private strokes: Stroke[] = [];
  private strokeRev = 0;
  private pointCount = 0;
  private guesses: GuessView[] = [];
  private guessSeq = 0;
  private lastGuess: { seq: number; correct: boolean; near: boolean } | null = null;
  private revealed = new Set<number>();
  private success: boolean | null = null;
  private points = 0;
  private score = 0;
  private found = 0;
  private readonly used = new Set<string>();
  private tick: TimerHandle | null = null;

  constructor(private readonly ctx: GameContext) {
    this.drawer = ctx.starter;
    this.prepareRound();
  }

  act(slot: Slot, action: unknown): void {
    if (!isRecord(action) || typeof action.type !== 'string') return;
    if (slot === this.drawer) this.drawerAction(action);
    else if (action.type === 'guess' && this.phase === 'draw') this.guess(action.text);
  }

  private prepareRound(): void {
    this.phase = 'choose';
    this.drawer = ((this.ctx.starter + this.round) % 2) as Slot;
    this.mode =
      this.round === 0
        ? 'normal'
        : this.ctx.rng.next() < 0.4
          ? 'normal'
          : this.ctx.rng.pick(['blind', 'oneStroke', 'straight', 'mirror'] as const);
    this.choices = ([1, 2, 3] as Level[]).map((level) => ({ word: this.drawWord(level), level }));
    this.word = null;
    this.level = null;
    this.strokes = [];
    this.strokeRev += 1;
    this.pointCount = 0;
    this.guesses = [];
    this.lastGuess = null;
    this.revealed = new Set();
    this.success = null;
    this.points = 0;
    this.ctx.fx('turn', [this.drawer]);
    this.ctx.update();
  }

  private drawWord(level: Level): string {
    const available = SKETCH_WORDS[level].filter((word) => !this.used.has(word));
    const word = this.ctx.rng.pick(available.length ? available : SKETCH_WORDS[level]);
    this.used.add(word);
    return word;
  }

  private drawerAction(action: Record<string, unknown>): void {
    if (action.type === 'choose' && this.phase === 'choose' && isInt(action.index, 0, this.choices.length - 1)) {
      const choice = this.choices[action.index];
      this.word = choice.word;
      this.level = choice.level;
      this.phase = 'draw';
      this.startedAt = this.ctx.now();
      this.deadline = this.startedAt + DRAW_SECONDS * 1000;
      this.ctx.fx('turn', [other(this.drawer)]);
      this.scheduleTick();
      this.ctx.update();
      return;
    }
    if (this.phase !== 'draw') return;
    switch (action.type) {
      case 'stroke':
        this.stroke(action);
        break;
      case 'undo':
        if (this.mode !== 'oneStroke' && this.strokes.length) {
          this.strokes.pop();
          this.strokeRev += 1;
          this.ctx.update();
        }
        break;
      case 'clear':
        if (this.mode !== 'oneStroke' && this.strokes.length) {
          this.strokes = [];
          this.strokeRev += 1;
          this.ctx.update();
        }
        break;
      case 'skip':
        this.reveal(false);
        break;
    }
  }

  private stroke(action: Record<string, unknown>): void {
    if (!isInt(action.id, 0, 1e6) || !Array.isArray(action.points) || action.points.length % 2 !== 0 || action.points.length > 600) return;
    const points = action.points;
    if (!points.every((value) => isInt(value, 0, CANVAS))) return;
    let stroke = this.strokes.find((candidate) => candidate.id === action.id);
    if (!stroke) {
      if (this.mode === 'oneStroke' && this.strokes.length > 0) return;
      const color = PALETTE.find((candidate) => candidate === action.color) ?? PALETTE[0];
      const size = BRUSHES.find((candidate) => candidate === action.size) ?? BRUSHES[1];
      stroke = { id: action.id, color, size, points: [], ended: false };
      this.strokes.push(stroke);
    }
    if (stroke.ended) return;
    if (this.pointCount + points.length / 2 > MAX_POINTS_PER_ROUND) return;
    if (this.mode === 'straight') {
      const merged = [...stroke.points, ...(points as number[])];
      stroke.points = merged.length > 4 ? [merged[0], merged[1], merged[merged.length - 2], merged[merged.length - 1]] : merged;
    } else {
      stroke.points.push(...(points as number[]));
      this.pointCount += points.length / 2;
    }
    if (action.end === true) stroke.ended = true;
    this.strokeRev += 1;
    this.ctx.update();
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
      HINT_TIMES.forEach((time, index) => {
        if (elapsed >= time && this.revealed.size <= index) this.revealLetter();
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
    this.points = success && this.level ? this.level * (20 + Math.ceil(remaining / 2)) : 0;
    this.score += this.points;
    if (success) this.found += 1;
    this.ctx.fx(success ? 'correct' : 'lose', 'all');
    this.ctx.update();
    this.ctx.after(REVEAL_MS, () => this.nextRound());
  }

  private nextRound(): void {
    this.round += 1;
    if (this.round < ROUNDS) {
      this.prepareRound();
      return;
    }
    this.ctx.finish({
      winner: null,
      title: `Score d’équipe : ${this.score} points`,
      detail: `${this.found} dessin${this.found > 1 ? 's' : ''} trouvé${this.found > 1 ? 's' : ''} sur ${ROUNDS}.`,
      coop: { won: this.found >= ROUNDS / 2, score: this.score },
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
      rounds: ROUNDS,
      drawer: this.drawer,
      mode: this.mode,
      level: this.level,
      pattern: this.pattern(),
      word: this.phase === 'reveal' ? this.word : null,
      remaining: this.remaining(),
      total: DRAW_SECONDS,
      strokes: this.strokes,
      strokeRev: this.strokeRev,
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
      rounds: ROUNDS,
      mode: this.mode,
      remaining: this.remaining(),
      guesses: this.guesses,
      success: this.success,
      points: this.points,
      score: this.score,
      guard: `${this.round}-${this.phase}`,
    };
    if (slot === this.drawer) {
      const lockedOneStroke = this.mode === 'oneStroke' && this.strokes.some((stroke) => stroke.ended);
      return {
        ...base,
        role: 'drawer',
        choices: this.phase === 'choose' ? this.choices : [],
        word: this.word,
        level: this.level,
        canDraw: this.phase === 'draw' && !lockedOneStroke,
        strokeCount: this.strokes.length,
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
  tagline: 'L’un dessine, l’autre devine… avec des contraintes farfelues.',
  icon: 'artist-palette',
  accent: '#f08a2c',
  coop: true,
  rules: [
    'Chacun son tour, l’un choisit un mot (facile, moyen ou difficile) et le dessine sur son téléphone. Le dessin apparaît en direct sur la télé.',
    'L’autre tape ses propositions sur son téléphone. Plus vous trouvez vite, plus vous marquez de points !',
    'Certaines manches ajoutent une contrainte : les yeux bandés, d’un seul trait, que des lignes droites ou en miroir.',
    `Vous jouez en équipe : ${ROUNDS} manches pour battre votre record.`,
  ],
  create: (ctx) => new Sketch(ctx),
};
