import { Pad, type Stroke } from '../../draw/pad';
import { choiceOf, resolveSettings, type SettingDef } from '../settings';
import { SKETCH_WORDS } from '../sketch/words';
import {
  isInt,
  isRecord,
  other,
  SLOTS,
  type GameContext,
  type GameDefinition,
  type GameInstance,
  type Slot,
  type TimerHandle,
} from '../types';

export const STEPS = 4;
export const DRAW_SECONDS = 90;
const MAX_TEXT = 40;
const SUGGESTIONS = 3;

export const TELEPHONE_SETTINGS: readonly SettingDef[] = [
  {
    id: 'steps',
    label: 'Longueur des chaînes',
    kind: 'choice',
    options: [
      { value: 2, label: 'Courte' },
      { value: 4, label: 'Moyenne' },
      { value: 6, label: 'Longue' },
    ],
    default: STEPS,
  },
  {
    id: 'time',
    label: 'Temps de dessin',
    kind: 'choice',
    options: [45, 60, 90, 120, 180].map((value) => ({ value, label: value < 120 ? `${value} s` : `${value / 60} min` })),
    default: DRAW_SECONDS,
  },
];

export type TelephonePage = { kind: 'text'; text: string; by: Slot } | { kind: 'drawing'; strokes: Stroke[]; by: Slot };

/**
 * `start`: each picks the word that opens their notebook. Then come `draw` and `write` steps in turn:
 * you draw in your notebook what the other last wrote there, and write what you see in theirs.
 * `show` goes through both notebooks, one page at a time, at the players' pace.
 */
export type Phase = 'start' | 'draw' | 'write' | 'show';

export interface TelephoneTv {
  phase: Phase;
  step: number;
  steps: number;
  done: [boolean, boolean];
  remaining: number;
  total: number;
  /** While showing: the chain on screen, and its pages up to the current one. */
  chain: Slot | null;
  pages: TelephonePage[];
  page: number;
  length: number;
  last: boolean;
}

export type TelephonePhone = {
  phase: Phase;
  me: Slot;
  step: number;
  steps: number;
  done: boolean;
  partnerDone: boolean;
  remaining: number;
  guard: string;
} & (
  | { task: 'start'; suggestions: string[] }
  | { task: 'draw'; prompt: string }
  | { task: 'write'; drawing: Stroke[] }
  | { task: 'show'; chain: Slot; page: number; length: number; last: boolean }
);

function cleanText(raw: unknown): string {
  return typeof raw === 'string'
    ? raw
        .replace(/[\u0000-\u001f\u007f]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, MAX_TEXT)
        .trim()
    : '';
}

class Telephone implements GameInstance {
  private phase: Phase = 'start';
  private step = 0;
  private readonly steps: number;
  private readonly drawSeconds: number;
  private readonly chains: [TelephonePage[], TelephonePage[]] = [[], []];
  private readonly suggestions: [string[], string[]];
  private done: [boolean, boolean] = [false, false];
  private pads: [Pad, Pad] = [new Pad(), new Pad()];
  private texts: [string, string] = ['', ''];
  private deadline = 0;
  private timer: TimerHandle | null = null;
  private tick: TimerHandle | null = null;
  private showChain: Slot;
  private showPage = 0;

  constructor(private readonly ctx: GameContext) {
    const settings = resolveSettings(TELEPHONE_SETTINGS, ctx.settings, ctx.rng);
    this.steps = choiceOf(settings, 'steps');
    this.drawSeconds = choiceOf(settings, 'time');
    this.showChain = ctx.starter;
    const deal = () =>
      Array.from({ length: SUGGESTIONS }, (_, index) =>
        this.ctx.draw(`sketch-${index === 2 ? 2 : 1}`, SKETCH_WORDS[index === 2 ? 2 : 1], (w) => w),
      );
    this.suggestions = [deal(), deal()];
    ctx.fx('turn', 'all');
  }

  /**
   * The chain `slot` works on during the current step. With two players, each one draws in their own
   * notebook and guesses in the other's: whoever guesses never knows where the chain started.
   */
  private chainOf(slot: Slot): Slot {
    return this.step % 2 === 1 ? slot : other(slot);
  }

  act(slot: Slot, action: unknown): void {
    if (!isRecord(action) || typeof action.type !== 'string') return;
    if (this.phase === 'show') {
      if (action.type === 'next') this.nextPage();
      return;
    }
    if (this.done[slot]) return;
    if (this.phase === 'start' && action.type === 'start') {
      const text = isInt(action.index, 0, SUGGESTIONS - 1) ? this.suggestions[slot][action.index] : cleanText(action.text);
      if (!text) return;
      this.chains[slot].push({ kind: 'text', text, by: slot });
      this.finishTask(slot);
    } else if (this.phase === 'draw') {
      if (action.type === 'done') this.finishTask(slot);
      else if (this.pads[slot].apply(action)) this.ctx.update();
    } else if (this.phase === 'write' && action.type === 'write') {
      const text = cleanText(action.text);
      if (!text) return;
      this.texts[slot] = text;
      this.finishTask(slot);
    }
  }

  private finishTask(slot: Slot): void {
    this.done[slot] = true;
    this.ctx.fx('lock', [slot]);
    if (this.done[0] && this.done[1]) this.nextStep();
    this.ctx.update();
  }

  private nextStep(): void {
    this.ctx.cancel(this.timer);
    this.ctx.cancel(this.tick);
    if (this.phase === 'draw') {
      for (const slot of SLOTS) this.chains[this.chainOf(slot)].push({ kind: 'drawing', strokes: this.pads[slot].strokes, by: slot });
    } else if (this.phase === 'write') {
      for (const slot of SLOTS) this.chains[this.chainOf(slot)].push({ kind: 'text', text: this.texts[slot], by: slot });
    }
    this.step += 1;
    this.done = [false, false];
    if (this.step > this.steps) {
      this.phase = 'show';
      this.showPage = 0;
      this.ctx.fx('reveal', 'all');
      return;
    }
    this.ctx.fx('turn', 'all');
    if (this.step % 2 === 1) {
      this.phase = 'draw';
      this.pads = [new Pad(), new Pad()];
      this.deadline = this.ctx.now() + this.drawSeconds * 1000;
      this.timer = this.ctx.after(this.drawSeconds * 1000, () => {
        // Time is up: whatever is on the page goes on.
        this.nextStep();
        this.ctx.update();
      });
      this.scheduleTick();
    } else {
      this.phase = 'write';
      this.texts = ['', ''];
    }
  }

  private scheduleTick(): void {
    this.ctx.cancel(this.tick);
    this.tick = this.ctx.after(1000, () => {
      if (this.phase !== 'draw') return;
      if (this.remaining() <= 10) this.ctx.fx('tick', 'all');
      this.scheduleTick();
      this.ctx.update();
    });
  }

  private nextPage(): void {
    this.showPage += 1;
    if (this.showPage < this.chains[this.showChain].length) {
      this.ctx.fx('flip', 'all');
      this.ctx.update();
      return;
    }
    if (this.showChain === this.ctx.starter) {
      this.showChain = other(this.showChain);
      this.showPage = 0;
      this.ctx.fx('reveal', 'all');
      this.ctx.update();
      return;
    }
    const journey = (chain: TelephonePage[]) => {
      const first = chain[0];
      const end = chain[chain.length - 1];
      return first.kind === 'text' && end.kind === 'text' ? `« ${first.text} » est devenu « ${end.text} »` : null;
    };
    const journeys = SLOTS.map((slot) => journey(this.chains[slot])).filter(Boolean);
    this.ctx.finish({
      winner: null,
      title: 'Quel voyage !',
      detail: journeys.length ? `${journeys.join(', et ')}.` : 'Deux chaînes, deux chefs-d’œuvre.',
      coop: { won: true },
    });
  }

  private remaining(): number {
    if (this.phase !== 'draw') return 0;
    return Math.max(0, Math.ceil((this.deadline - this.ctx.now()) / 1000));
  }

  private get lastPage(): boolean {
    return this.showChain !== this.ctx.starter && this.showPage === this.chains[this.showChain].length - 1;
  }

  tv(): TelephoneTv {
    const showing = this.phase === 'show';
    return {
      phase: this.phase,
      step: this.step,
      steps: this.steps,
      done: [...this.done],
      remaining: this.remaining(),
      total: this.drawSeconds,
      chain: showing ? this.showChain : null,
      pages: showing ? this.chains[this.showChain].slice(0, this.showPage + 1) : [],
      page: this.showPage,
      length: showing ? this.chains[this.showChain].length : 0,
      last: showing && this.lastPage,
    };
  }

  phone(slot: Slot): TelephonePhone {
    const base = {
      phase: this.phase,
      me: slot,
      step: this.step,
      steps: this.steps,
      done: this.done[slot],
      partnerDone: this.done[other(slot)],
      remaining: this.remaining(),
      guard: `${this.phase}-${this.step}-${this.showChain}-${this.showPage}`,
    };
    if (this.phase === 'start') return { ...base, task: 'start', suggestions: this.suggestions[slot] };
    if (this.phase === 'show') {
      return {
        ...base,
        task: 'show',
        chain: this.showChain,
        page: this.showPage,
        length: this.chains[this.showChain].length,
        last: this.lastPage,
      };
    }
    const previous = this.chains[this.chainOf(slot)].at(-1);
    if (this.phase === 'draw') return { ...base, task: 'draw', prompt: previous?.kind === 'text' ? previous.text : '' };
    return { ...base, task: 'write', drawing: previous?.kind === 'drawing' ? previous.strokes : [] };
  }
}

export const telephone: GameDefinition = {
  id: 'telephone',
  title: 'Dessin téléphone',
  tagline: 'Un mot, un dessin, une devinette… et le mot se transforme.',
  accent: '#2fd1a5',
  coop: true,
  rules: [
    'Chacun choisit en secret le mot qu’il va dessiner dans son carnet.',
    'Ensuite, chacun écrit ce qu’il voit dans le dessin de l’autre… et l’autre doit dessiner cette réponse, pas son mot de départ ! Le mot se transforme d’étape en étape.',
    'À la fin, la télé déroule chaque carnet page par page. Appuyez sur « Suivant » quand vous avez fini de rire.',
  ],
  settings: TELEPHONE_SETTINGS,
  create: (ctx) => new Telephone(ctx),
};
