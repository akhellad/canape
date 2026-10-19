import { isInt, isRecord, type GameContext, type GameDefinition, type GameInstance, type Slot, type TimerHandle } from '../types';
import { PREFER_PROMPTS, WHO_PROMPTS, type Prompt } from './prompts';

export const ROUNDS = 12;
export const ANSWER_SECONDS = 30;
const PREFER_EVERY = 3;
const BOTH_ANSWERED_DELAY_MS = 700;
const REVEAL_MS = 4600;

export interface CoupleTv {
  phase: 'answer' | 'reveal';
  round: number;
  rounds: number;
  prompt: Prompt;
  locked: [boolean, boolean];
  answers: [number | null, number | null] | null;
  match: boolean | null;
  matches: number;
  remaining: number;
  total: number;
}

export interface CouplePhone {
  phase: 'answer' | 'reveal';
  me: Slot;
  round: number;
  rounds: number;
  prompt: Prompt;
  mine: number | null;
  partner: number | null;
  match: boolean | null;
  matches: number;
  remaining: number;
  guard: string;
}

export function verdict(matches: number, rounds: number): string {
  const ratio = matches / rounds;
  if (ratio >= 0.9) return 'Âmes sœurs certifiées';
  if (ratio >= 0.7) return 'Le duo de choc';
  if (ratio >= 0.5) return 'Ça se tient, mais peut mieux faire';
  if (ratio >= 0.3) return 'Vous vous connaissez vraiment ?';
  return 'Deux inconnus sur un canapé';
}

class Couple implements GameInstance {
  private phase: CoupleTv['phase'] = 'answer';
  private round = 0;
  private prompt!: Prompt;
  private answers: [number | null, number | null] = [null, null];
  private matches = 0;
  private deadline = 0;
  private timer: TimerHandle | null = null;
  private tick: TimerHandle | null = null;

  constructor(private readonly ctx: GameContext) {
    this.ask();
  }

  private ask(): void {
    const prefer = this.round % PREFER_EVERY === PREFER_EVERY - 1;
    this.prompt = prefer
      ? this.ctx.draw('couple-prefer', PREFER_PROMPTS, (prompt) => prompt.text)
      : this.ctx.draw('couple-who', WHO_PROMPTS, (prompt) => prompt.text);
    this.answers = [null, null];
    this.phase = 'answer';
    this.deadline = this.ctx.now() + ANSWER_SECONDS * 1000;
    this.ctx.cancel(this.timer);
    this.timer = this.ctx.after(ANSWER_SECONDS * 1000, () => this.reveal());
    this.scheduleTick();
    this.ctx.fx('turn', 'all');
    this.ctx.update();
  }

  private scheduleTick(): void {
    this.ctx.cancel(this.tick);
    this.tick = this.ctx.after(1000, () => {
      if (this.phase !== 'answer') return;
      if (this.remaining() <= 5) this.ctx.fx('tick', 'all');
      this.scheduleTick();
      this.ctx.update();
    });
  }

  act(slot: Slot, action: unknown): void {
    if (this.phase !== 'answer' || !isRecord(action) || action.type !== 'answer') return;
    if (this.answers[slot] !== null || !isInt(action.choice, 0, 1)) return;
    this.answers[slot] = action.choice;
    this.ctx.fx('lock', [slot]);
    if (this.answers[0] !== null && this.answers[1] !== null) {
      this.ctx.cancel(this.timer);
      this.timer = this.ctx.after(BOTH_ANSWERED_DELAY_MS, () => this.reveal());
    }
    this.ctx.update();
  }

  private get match(): boolean {
    return this.answers[0] !== null && this.answers[0] === this.answers[1];
  }

  private reveal(): void {
    if (this.phase !== 'answer') return;
    this.ctx.cancel(this.timer);
    this.ctx.cancel(this.tick);
    this.phase = 'reveal';
    if (this.match) this.matches += 1;
    this.ctx.fx('reveal', 'all');
    this.ctx.fx(this.match ? 'correct' : 'wrong', 'all');
    this.ctx.update();
    this.timer = this.ctx.after(REVEAL_MS, () => this.next());
  }

  private next(): void {
    this.round += 1;
    if (this.round < ROUNDS) {
      this.ask();
      return;
    }
    this.ctx.finish({
      winner: null,
      title: verdict(this.matches, ROUNDS),
      detail: `Vous êtes tombés d’accord ${this.matches} fois sur ${ROUNDS}.`,
      coop: { won: this.matches >= Math.ceil(ROUNDS * 0.6), score: this.matches },
    });
  }

  private remaining(): number {
    if (this.phase !== 'answer') return 0;
    return Math.max(0, Math.ceil((this.deadline - this.ctx.now()) / 1000));
  }

  tv(): CoupleTv {
    const reveal = this.phase === 'reveal';
    return {
      phase: this.phase,
      round: this.round,
      rounds: ROUNDS,
      prompt: this.prompt,
      locked: [this.answers[0] !== null, this.answers[1] !== null],
      answers: reveal ? ([...this.answers] as [number | null, number | null]) : null,
      match: reveal ? this.match : null,
      matches: this.matches,
      remaining: this.remaining(),
      total: ANSWER_SECONDS,
    };
  }

  phone(slot: Slot): CouplePhone {
    const reveal = this.phase === 'reveal';
    return {
      phase: this.phase,
      me: slot,
      round: this.round,
      rounds: ROUNDS,
      prompt: this.prompt,
      mine: this.answers[slot],
      partner: reveal ? this.answers[slot === 0 ? 1 : 0] : null,
      match: reveal ? this.match : null,
      matches: this.matches,
      remaining: this.remaining(),
      guard: `${this.round}-${this.phase}`,
    };
  }
}

export const couple: GameDefinition = {
  id: 'couple',
  title: 'Qui de nous deux ?',
  tagline: 'Répondez en secret, et voyez si vous êtes sur la même longueur d’onde.',
  accent: '#ff5c9d',
  coop: true,
  rules: [
    'Une question s’affiche : « Qui de nous deux… ? » ou « Tu préfères… ? ». Chacun répond en secret sur son téléphone.',
    'Les réponses sont dévoilées en même temps sur la télé. Vous marquez un point à chaque fois que vous êtes d’accord.',
    `${ROUNDS} questions pour mesurer votre complicité. Pas de triche : on ne regarde pas l’écran de l’autre !`,
  ],
  create: (ctx) => new Couple(ctx),
};
