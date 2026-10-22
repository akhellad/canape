import { cleanLine } from '../../text';
import { choiceOf, resolveSettings, type SettingDef } from '../settings';
import { isInt, isRecord, other, type GameContext, type GameDefinition, type GameInstance, type Slot } from '../types';
import { SPECTRUMS, type Spectrum } from './spectrums';

export const ROUNDS = 8;
const MAX_CLUE = 60;
/** Half-widths of the scoring bands around the target, best first, on a 0–100 dial. */
export const BANDS = [
  { reach: 3, points: 4 },
  { reach: 9, points: 3 },
  { reach: 15, points: 2 },
] as const;

export const WAVELENGTH_SETTINGS: readonly SettingDef[] = [
  {
    id: 'rounds',
    label: 'Manches',
    kind: 'choice',
    options: [6, 8, 10, 12].map((value) => ({ value, label: `${value}` })),
    default: ROUNDS,
  },
];

export function pointsFor(guess: number, target: number): number {
  const distance = Math.abs(guess - target);
  return BANDS.find((band) => distance <= band.reach)?.points ?? 0;
}

/** `clue`: the psychic sees the target and writes a clue. `guess`: the other moves the needle. */
export type Phase = 'clue' | 'guess' | 'reveal';

export interface WavelengthTv {
  phase: Phase;
  round: number;
  rounds: number;
  psychic: Slot;
  spectrum: Spectrum;
  clue: string | null;
  needle: number;
  target: number | null;
  points: number | null;
  score: number;
  max: number;
  last: boolean;
}

export interface WavelengthPhone {
  phase: Phase;
  me: Slot;
  role: 'psychic' | 'guesser';
  round: number;
  rounds: number;
  spectrum: Spectrum;
  clue: string | null;
  needle: number;
  /** Only the psychic sees it before the reveal. */
  target: number | null;
  points: number | null;
  score: number;
  last: boolean;
  guard: string;
}

export function verdict(score: number, max: number): string {
  const ratio = max ? score / max : 0;
  if (ratio >= 0.75) return 'Télépathes certifiés';
  if (ratio >= 0.55) return 'Sur la même longueur d’onde';
  if (ratio >= 0.35) return 'Quelques parasites sur la ligne';
  return 'Deux radios sur des fréquences différentes';
}

class Wavelength implements GameInstance {
  private phase: Phase = 'clue';
  private round = 0;
  private readonly rounds: number;
  private spectrum!: Spectrum;
  private target = 50;
  private clue: string | null = null;
  private needle = 50;
  private points: number | null = null;
  private score = 0;

  constructor(private readonly ctx: GameContext) {
    this.rounds = choiceOf(resolveSettings(WAVELENGTH_SETTINGS, ctx.settings, ctx.rng), 'rounds');
    this.deal();
  }

  /** Partners take turns giving the clue. */
  private get psychic(): Slot {
    return ((this.ctx.starter + this.round) % 2) as Slot;
  }

  private deal(): void {
    this.spectrum = this.ctx.draw('wavelength', SPECTRUMS, (spectrum) => `${spectrum.left}|${spectrum.right}`);
    // Keep the target off the very edges, so every band fits on the dial.
    this.target = 4 + this.ctx.rng.int(93);
    this.clue = null;
    this.needle = 50;
    this.points = null;
    this.phase = 'clue';
    this.ctx.fx('turn', [this.psychic]);
    this.ctx.update();
  }

  act(slot: Slot, action: unknown): void {
    if (!isRecord(action)) return;
    if (this.phase === 'clue' && action.type === 'clue' && slot === this.psychic) {
      const clue = cleanLine(action.text, MAX_CLUE);
      if (!clue) return;
      this.clue = clue;
      this.phase = 'guess';
      this.ctx.fx('turn', [other(slot)]);
      this.ctx.update();
    } else if (this.phase === 'guess' && slot !== this.psychic && (action.type === 'aim' || action.type === 'lock')) {
      if (!isInt(action.value, 0, 100)) return;
      this.needle = action.value;
      if (action.type === 'lock') this.reveal();
      else this.ctx.update();
    } else if (this.phase === 'reveal' && action.type === 'next') {
      this.next();
    }
  }

  private reveal(): void {
    this.points = pointsFor(this.needle, this.target);
    this.score += this.points;
    this.phase = 'reveal';
    this.ctx.fx('reveal', 'all');
    this.ctx.fx(this.points >= 3 ? 'correct' : this.points > 0 ? 'match' : 'wrong', 'all');
    this.ctx.update();
  }

  private next(): void {
    this.round += 1;
    if (this.round < this.rounds) {
      this.deal();
      return;
    }
    const max = this.rounds * BANDS[0].points;
    this.ctx.finish({
      winner: null,
      title: verdict(this.score, max),
      detail: `${this.score} points sur ${max}.`,
      coop: { won: this.score >= max / 2, score: this.score },
    });
  }

  tv(): WavelengthTv {
    const revealed = this.phase === 'reveal';
    return {
      phase: this.phase,
      round: this.round,
      rounds: this.rounds,
      psychic: this.psychic,
      spectrum: this.spectrum,
      clue: this.clue,
      needle: this.needle,
      target: revealed ? this.target : null,
      points: this.points,
      score: this.score,
      max: this.rounds * BANDS[0].points,
      last: this.round === this.rounds - 1,
    };
  }

  phone(slot: Slot): WavelengthPhone {
    const psychic = slot === this.psychic;
    return {
      phase: this.phase,
      me: slot,
      role: psychic ? 'psychic' : 'guesser',
      round: this.round,
      rounds: this.rounds,
      spectrum: this.spectrum,
      clue: this.clue,
      needle: this.needle,
      target: psychic || this.phase === 'reveal' ? this.target : null,
      points: this.points,
      score: this.score,
      last: this.round === this.rounds - 1,
      guard: `${this.round}-${this.phase}`,
    };
  }
}

export const wavelength: GameDefinition = {
  id: 'wavelength',
  title: 'Même longueur d’onde',
  tagline: 'Un indice, une aiguille : pensez-vous pareil ?',
  accent: '#2fd1a5',
  coop: true,
  rules: [
    'Une échelle s’affiche, par exemple « Froid ↔ Chaud ». Chacun son tour, l’un de vous voit sur son téléphone une cible secrète quelque part sur le cadran.',
    'Il écrit un indice qui devrait tomber pile à cet endroit : pour une cible côté chaud, « Une soupe de mamie » par exemple.',
    'L’autre fait glisser l’aiguille sur son téléphone, l’aiguille bouge sur la télé, puis il valide. Dans le mille : 4 points, tout près : 3, pas loin : 2.',
    'Discutez du résultat, puis passez à la manche suivante quand vous voulez. Vous jouez en équipe !',
  ],
  settings: WAVELENGTH_SETTINGS,
  create: (ctx) => new Wavelength(ctx),
};
