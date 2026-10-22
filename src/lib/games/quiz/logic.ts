import { isInt, isRecord, SLOTS, type GameContext, type GameDefinition, type GameInstance, type Slot, type TimerHandle } from '../types';
import { choiceOf, resolveSettings, type SettingDef } from '../settings';
import { QUESTIONS, type Question } from './questions';

export const QUESTION_COUNT = 10;
export const ANSWER_SECONDS = 20;
const BASE_POINTS = 10;
const SPEED_POINTS = 10;
/** Extra points for whoever finds the right answer first. */
export const FIRST_POINTS = 15;

export const QUIZ_SETTINGS: readonly SettingDef[] = [
  {
    id: 'count',
    label: 'Questions',
    kind: 'choice',
    options: [5, 10, 15, 20].map((value) => ({ value, label: `${value}` })),
    default: QUESTION_COUNT,
  },
  {
    id: 'time',
    label: 'Temps pour répondre',
    kind: 'choice',
    options: [10, 15, 20, 30].map((value) => ({ value, label: `${value} s` })),
    default: ANSWER_SECONDS,
  },
];
const BOTH_ANSWERED_DELAY_MS = 900;
const REVEAL_MS = 5200;

export interface QuizPick {
  choice: number;
  points: number;
  first: boolean;
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
  first: boolean;
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
  private first: Slot | null = null;
  private readonly scores: [number, number] = [0, 0];
  private startedAt = 0;
  private deadline = 0;
  private timer: TimerHandle | null = null;
  private tick: TimerHandle | null = null;
  private readonly count: number;
  private readonly seconds: number;

  constructor(private readonly ctx: GameContext) {
    const settings = resolveSettings(QUIZ_SETTINGS, ctx.settings, ctx.rng);
    this.count = choiceOf(settings, 'count');
    this.seconds = choiceOf(settings, 'time');
    this.ask();
  }

  private get bonus(): boolean {
    return this.index === this.count - 1;
  }

  private ask(): void {
    this.question = this.ctx.draw('quiz', QUESTIONS, (question) => question.text);
    this.choices = this.ctx.rng.shuffle([this.question.answer, ...this.question.wrong]);
    this.answer = this.choices.indexOf(this.question.answer);
    this.picks = [null, null];
    this.gained = [0, 0];
    this.first = null;
    this.phase = 'question';
    this.startedAt = this.ctx.now();
    this.deadline = this.startedAt + this.seconds * 1000;
    this.ctx.cancel(this.timer);
    this.timer = this.ctx.after(this.seconds * 1000, () => this.reveal());
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
    const right = SLOTS.filter((slot) => this.picks[slot]?.choice === this.answer).sort((x, y) => this.picks[x]!.at - this.picks[y]!.at);
    // A dead heat earns nobody the bonus: it rewards being faster, not as fast.
    const tie = right.length === 2 && this.picks[0]!.at === this.picks[1]!.at;
    this.first = right.length && !tie ? right[0] : null;
    for (const slot of right) {
      const left = Math.max(0, this.deadline - this.picks[slot]!.at) / (this.seconds * 1000);
      const firstBonus = this.first === slot ? FIRST_POINTS : 0;
      this.gained[slot] = (BASE_POINTS + Math.round(SPEED_POINTS * left) + firstBonus) * multiplier;
      this.scores[slot] += this.gained[slot];
    }
    this.ctx.fx('reveal', 'all');
    for (const slot of SLOTS) this.ctx.fx(this.gained[slot] > 0 ? 'correct' : 'wrong', [slot]);
    this.ctx.update();
    this.timer = this.ctx.after(REVEAL_MS, () => this.next());
  }

  private next(): void {
    this.index += 1;
    if (this.index < this.count) {
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
      count: this.count,
      bonus: this.bonus,
      category: this.question.category,
      text: this.question.text,
      choices: this.choices,
      answer: reveal ? this.answer : null,
      locked: [this.picks[0] !== null, this.picks[1] !== null],
      picks: reveal
        ? [
            this.picks[0] ? { choice: this.picks[0].choice, points: this.gained[0], first: this.first === 0 } : null,
            this.picks[1] ? { choice: this.picks[1].choice, points: this.gained[1], first: this.first === 1 } : null,
          ]
        : null,
      scores: [...this.scores] as [number, number],
      remaining: this.remaining(),
      total: this.seconds,
    };
  }

  phone(slot: Slot): QuizPhone {
    const reveal = this.phase === 'reveal';
    return {
      phase: this.phase,
      me: slot,
      index: this.index,
      count: this.count,
      bonus: this.bonus,
      text: this.question.text,
      choices: this.choices,
      mine: this.picks[slot]?.choice ?? null,
      answer: reveal ? this.answer : null,
      points: reveal ? this.gained[slot] : null,
      first: reveal && this.first === slot,
      scores: [...this.scores] as [number, number],
      remaining: this.remaining(),
      guard: `${this.index}-${this.phase}`,
    };
  }
}

export const quiz: GameDefinition = {
  id: 'quiz',
  title: 'Quiz',
  tagline: 'De la culture G, et le premier qui trouve rafle les points.',
  accent: '#3b46ff',
  coop: false,
  rules: [
    'Une question s’affiche sur la télé, avec quatre réponses. Choisis la tienne sur ton téléphone avant la fin du temps.',
    `Bonne réponse : 10 points, plus un bonus de rapidité. Le premier à trouver la bonne réponse gagne ${FIRST_POINTS} points de plus. Mauvaise réponse : rien.`,
    'La dernière question compte double. Le plus gros score gagne !',
  ],
  settings: QUIZ_SETTINGS,
  create: (ctx) => new Quiz(ctx),
};
