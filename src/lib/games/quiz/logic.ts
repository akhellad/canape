import { isInt, isRecord, SLOTS, type GameContext, type GameDefinition, type GameInstance, type Slot, type TimerHandle } from '../types';
import { QUESTIONS, type Question } from './questions';

export const QUESTION_COUNT = 10;
export const ANSWER_SECONDS = 20;
const BASE_POINTS = 10;
const SPEED_POINTS = 10;
const BOTH_ANSWERED_DELAY_MS = 900;
const REVEAL_MS = 5200;

export interface QuizPick {
  choice: number;
  points: number;
}

export interface QuizTv {
  phase: 'question' | 'reveal';
  index: number;
  count: number;
  bonus: boolean;
  category: string;
  text: string;
  choices: string[];
  answer: number | null;
  locked: [boolean, boolean];
  picks: [QuizPick | null, QuizPick | null] | null;
  scores: [number, number];
  remaining: number;
  total: number;
}

export interface QuizPhone {
  phase: 'question' | 'reveal';
  me: Slot;
  index: number;
  count: number;
  bonus: boolean;
  text: string;
  choices: string[];
  mine: number | null;
  answer: number | null;
  points: number | null;
  scores: [number, number];
  remaining: number;
  guard: string;
}

class Quiz implements GameInstance {
  private phase: QuizTv['phase'] = 'question';
  private index = 0;
  private question!: Question;
  private choices: string[] = [];
  private answer = 0;
  private picks: [{ choice: number; at: number } | null, { choice: number; at: number } | null] = [null, null];
  private gained: [number, number] = [0, 0];
  private readonly scores: [number, number] = [0, 0];
  private startedAt = 0;
  private deadline = 0;
  private timer: TimerHandle | null = null;
  private tick: TimerHandle | null = null;

  constructor(private readonly ctx: GameContext) {
    this.ask();
  }

  private get bonus(): boolean {
    return this.index === QUESTION_COUNT - 1;
  }

  private ask(): void {
    this.question = this.ctx.draw('quiz', QUESTIONS, (question) => question.text);
    this.choices = this.ctx.rng.shuffle([this.question.answer, ...this.question.wrong]);
    this.answer = this.choices.indexOf(this.question.answer);
    this.picks = [null, null];
    this.gained = [0, 0];
    this.phase = 'question';
    this.startedAt = this.ctx.now();
    this.deadline = this.startedAt + ANSWER_SECONDS * 1000;
    this.ctx.cancel(this.timer);
    this.timer = this.ctx.after(ANSWER_SECONDS * 1000, () => this.reveal());
    this.scheduleTick();
    this.ctx.fx('turn', 'all');
    this.ctx.update();
  }

  private scheduleTick(): void {
    this.ctx.cancel(this.tick);
    this.tick = this.ctx.after(1000, () => {
      if (this.phase !== 'question') return;
      if (this.remaining() <= 5) this.ctx.fx('tick', 'all');
      this.scheduleTick();
      this.ctx.update();
    });
  }

  act(slot: Slot, action: unknown): void {
    if (this.phase !== 'question' || !isRecord(action) || action.type !== 'answer') return;
    if (this.picks[slot] || !isInt(action.choice, 0, this.choices.length - 1)) return;
    this.picks[slot] = { choice: action.choice, at: this.ctx.now() };
    this.ctx.fx('lock', [slot]);
    if (this.picks[0] && this.picks[1]) {
      this.ctx.cancel(this.timer);
      this.timer = this.ctx.after(BOTH_ANSWERED_DELAY_MS, () => this.reveal());
    }
    this.ctx.update();
  }

  private reveal(): void {
    if (this.phase !== 'question') return;
    this.ctx.cancel(this.timer);
    this.ctx.cancel(this.tick);
    this.phase = 'reveal';
    const multiplier = this.bonus ? 2 : 1;
    for (const slot of SLOTS) {
      const pick = this.picks[slot];
      if (!pick || pick.choice !== this.answer) continue;
      const left = Math.max(0, this.deadline - pick.at) / (ANSWER_SECONDS * 1000);
      this.gained[slot] = (BASE_POINTS + Math.round(SPEED_POINTS * left)) * multiplier;
      this.scores[slot] += this.gained[slot];
    }
    this.ctx.fx('reveal', 'all');
    for (const slot of SLOTS) this.ctx.fx(this.gained[slot] > 0 ? 'correct' : 'wrong', [slot]);
    this.ctx.update();
    this.timer = this.ctx.after(REVEAL_MS, () => this.next());
  }

  private next(): void {
    this.index += 1;
    if (this.index < QUESTION_COUNT) {
      this.ask();
      return;
    }
    const [a, b] = this.scores;
    const winner: Slot | null = a === b ? null : a > b ? 0 : 1;
    this.ctx.finish({
      winner,
      title: winner === null ? `Égalité parfaite : ${a} partout !` : `${this.ctx.name(winner)} gagne le quiz !`,
      detail: `${this.ctx.name(0)} ${a} – ${b} ${this.ctx.name(1)}`,
      scores: [a, b],
    });
  }

  private remaining(): number {
    if (this.phase !== 'question') return 0;
    return Math.max(0, Math.ceil((this.deadline - this.ctx.now()) / 1000));
  }

  tv(): QuizTv {
    const reveal = this.phase === 'reveal';
    return {
      phase: this.phase,
      index: this.index,
      count: QUESTION_COUNT,
      bonus: this.bonus,
      category: this.question.category,
      text: this.question.text,
      choices: this.choices,
      answer: reveal ? this.answer : null,
      locked: [this.picks[0] !== null, this.picks[1] !== null],
      picks: reveal
        ? [
            this.picks[0] ? { choice: this.picks[0].choice, points: this.gained[0] } : null,
            this.picks[1] ? { choice: this.picks[1].choice, points: this.gained[1] } : null,
          ]
        : null,
      scores: [...this.scores] as [number, number],
      remaining: this.remaining(),
      total: ANSWER_SECONDS,
    };
  }

  phone(slot: Slot): QuizPhone {
    const reveal = this.phase === 'reveal';
    return {
      phase: this.phase,
      me: slot,
      index: this.index,
      count: QUESTION_COUNT,
      bonus: this.bonus,
      text: this.question.text,
      choices: this.choices,
      mine: this.picks[slot]?.choice ?? null,
      answer: reveal ? this.answer : null,
      points: reveal ? this.gained[slot] : null,
      scores: [...this.scores] as [number, number],
      remaining: this.remaining(),
      guard: `${this.index}-${this.phase}`,
    };
  }
}

export const quiz: GameDefinition = {
  id: 'quiz',
  title: 'Quiz',
  tagline: 'Dix questions de culture G, le plus rapide rafle les points.',
  accent: '#3b46ff',
  coop: false,
  rules: [
    `Une question s’affiche sur la télé, avec quatre réponses. Choisis la tienne sur ton téléphone, tu as ${ANSWER_SECONDS} secondes.`,
    'Bonne réponse : 10 points, plus un bonus de rapidité. Mauvaise réponse : rien.',
    `La dernière des ${QUESTION_COUNT} questions compte double. Le plus gros score gagne !`,
  ],
  create: (ctx) => new Quiz(ctx),
};
