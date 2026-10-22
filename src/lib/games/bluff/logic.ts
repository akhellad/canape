import { choiceOf, resolveSettings, type SettingDef } from '../settings';
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
import { RARE_WORDS, type RareWord } from './words';

export const ROUNDS = 5;
export const WRITE_SECONDS = 120;
/** For spotting the real definition. */
export const FIND_POINTS = 3;
/** For each time the other falls for your made-up definition. */
export const FOOL_POINTS = 2;
const MAX_LENGTH = 160;

export const BLUFF_SETTINGS: readonly SettingDef[] = [
  {
    id: 'rounds',
    label: 'Mots',
    kind: 'choice',
    options: [3, 5, 7].map((value) => ({ value, label: `${value}` })),
    default: ROUNDS,
  },
  {
    id: 'time',
    label: 'Temps pour inventer',
    kind: 'choice',
    options: [
      { value: 60, label: '1 min' },
      { value: 120, label: '2 min' },
      { value: 180, label: '3 min' },
      { value: 0, label: 'Illimité' },
    ],
    default: WRITE_SECONDS,
  },
];

/** Who a definition comes from: a player, the dictionary, or a decoy borrowed from another word. */
export type Author = Slot | 'real' | 'decoy';

export interface BluffOption {
  text: string;
  /** Hidden until the reveal. */
  author: Author | null;
  votes: Slot[];
}

export type Phase = 'write' | 'vote' | 'reveal';

export interface BluffTv {
  phase: Phase;
  round: number;
  rounds: number;
  word: string;
  nature: string;
  options: BluffOption[];
  ready: [boolean, boolean];
  scores: [number, number];
  gained: [number, number] | null;
  remaining: number | null;
  total: number | null;
  last: boolean;
}

export interface BluffPhone {
  phase: Phase;
  me: Slot;
  round: number;
  rounds: number;
  word: string;
  nature: string;
  options: BluffOption[];
  /** Index of the player's own definition among the options, which they cannot vote for. */
  own: number | null;
  vote: number | null;
  ready: boolean;
  scores: [number, number];
  gained: number | null;
  remaining: number | null;
  last: boolean;
  guard: string;
}

function clean(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  const text = raw
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_LENGTH)
    .trim();
  return text ? text[0].toLocaleUpperCase('fr-FR') + text.slice(1) : '';
}

class Bluff implements GameInstance {
  private phase: Phase = 'write';
  private round = 0;
  private readonly rounds: number;
  private readonly seconds: number;
  private current!: RareWord;
  private fakes: [string, string] = ['', ''];
  private options: { text: string; author: Author }[] = [];
  private votes: [number | null, number | null] = [null, null];
  private readonly scores: [number, number] = [0, 0];
  private gained: [number, number] | null = null;
  private deadline: number | null = null;
  private timer: TimerHandle | null = null;
  private tick: TimerHandle | null = null;

  constructor(private readonly ctx: GameContext) {
    const settings = resolveSettings(BLUFF_SETTINGS, ctx.settings, ctx.rng);
    this.rounds = choiceOf(settings, 'rounds');
    this.seconds = choiceOf(settings, 'time');
    this.start();
  }

  private start(): void {
    this.current = this.ctx.draw('bluff', RARE_WORDS, (entry) => entry.word);
    this.phase = 'write';
    this.fakes = ['', ''];
    this.options = [];
    this.votes = [null, null];
    this.gained = null;
    this.ctx.cancel(this.timer);
    this.deadline = this.seconds > 0 ? this.ctx.now() + this.seconds * 1000 : null;
    if (this.seconds > 0) this.timer = this.ctx.after(this.seconds * 1000, () => this.openVote());
    this.scheduleTick();
    this.ctx.fx('reveal', 'all');
    this.ctx.update();
  }

  private scheduleTick(): void {
    if (this.deadline === null) return;
    this.ctx.cancel(this.tick);
    this.tick = this.ctx.after(1000, () => {
      if (this.phase !== 'write') return;
      if ((this.remaining() ?? 99) <= 10) this.ctx.fx('tick', 'all');
      this.scheduleTick();
      this.ctx.update();
    });
  }

  act(slot: Slot, action: unknown): void {
    if (!isRecord(action) || typeof action.type !== 'string') return;
    if (this.phase === 'write' && action.type === 'write' && !this.fakes[slot]) {
      const text = clean(action.text);
      if (!text) return;
      this.fakes[slot] = text;
      this.ctx.fx('lock', [slot]);
      if (this.fakes[0] && this.fakes[1]) this.openVote();
      this.ctx.update();
    } else if (this.phase === 'vote' && action.type === 'vote' && this.votes[slot] === null) {
      if (!isInt(action.option, 0, this.options.length - 1) || this.options[action.option].author === slot) return;
      this.votes[slot] = action.option;
      this.ctx.fx('lock', [slot]);
      if (this.votes[0] !== null && this.votes[1] !== null) this.reveal();
      this.ctx.update();
    } else if (this.phase === 'reveal' && action.type === 'next') {
      this.next();
    }
  }

  /** Mixes the real definition with both bluffs and a decoy borrowed from a word of the same kind. */
  private openVote(): void {
    if (this.phase !== 'write') return;
    this.ctx.cancel(this.timer);
    this.ctx.cancel(this.tick);
    const others = RARE_WORDS.filter((entry) => entry.word !== this.current.word);
    const alike = (entry: RareWord) => entry.nature === this.current.nature;
    // Decoys of the same kind first (popped from the end); any word will do for rare kinds like prepositions.
    const decoys = [...this.ctx.rng.shuffle(others.filter((entry) => !alike(entry))), ...this.ctx.rng.shuffle(others.filter(alike))];
    const options: { text: string; author: Author }[] = [{ text: this.current.definition, author: 'real' }];
    for (const slot of SLOTS) if (this.fakes[slot]) options.push({ text: this.fakes[slot], author: slot });
    // Someone ran out of time: an extra decoy keeps four choices on the table.
    while (options.length < 4 && decoys.length) options.push({ text: (decoys.pop() as RareWord).definition, author: 'decoy' });
    this.options = this.ctx.rng.shuffle(options);
    this.phase = 'vote';
    this.ctx.fx('turn', 'all');
    this.ctx.update();
  }

  private reveal(): void {
    this.phase = 'reveal';
    const gained: [number, number] = [0, 0];
    for (const slot of SLOTS) {
      const author = this.options[this.votes[slot] as number].author;
      if (author === 'real') gained[slot] += FIND_POINTS;
      else if (author === other(slot)) gained[other(slot)] += FOOL_POINTS;
    }
    this.gained = gained;
    this.scores[0] += gained[0];
    this.scores[1] += gained[1];
    this.ctx.fx('reveal', 'all');
    for (const slot of SLOTS) this.ctx.fx(gained[slot] > 0 ? 'correct' : 'wrong', [slot]);
  }

  private next(): void {
    this.round += 1;
    if (this.round < this.rounds) {
      this.start();
      return;
    }
    const [a, b] = this.scores;
    const winner: Slot | null = a === b ? null : a > b ? 0 : 1;
    this.ctx.finish({
      winner,
      title: winner === null ? 'Aussi menteurs l’un que l’autre !' : `${this.ctx.name(winner)} est le roi du bluff !`,
      detail: `${this.ctx.name(0)} ${a} – ${b} ${this.ctx.name(1)}`,
      scores: [a, b],
    });
  }

  private remaining(): number | null {
    if (this.deadline === null) return null;
    if (this.phase !== 'write') return 0;
    return Math.max(0, Math.ceil((this.deadline - this.ctx.now()) / 1000));
  }

  private optionViews(): BluffOption[] {
    const revealed = this.phase === 'reveal';
    return this.options.map((option, index) => ({
      text: option.text,
      author: revealed ? option.author : null,
      votes: revealed ? SLOTS.filter((slot) => this.votes[slot] === index) : [],
    }));
  }

  private ready(slot: Slot): boolean {
    return this.phase === 'write' ? this.fakes[slot] !== '' : this.votes[slot] !== null;
  }

  tv(): BluffTv {
    return {
      phase: this.phase,
      round: this.round,
      rounds: this.rounds,
      word: this.current.word,
      nature: this.current.nature,
      options: this.optionViews(),
      ready: [this.ready(0), this.ready(1)],
      scores: [...this.scores],
      gained: this.gained,
      remaining: this.remaining(),
      total: this.seconds > 0 ? this.seconds : null,
      last: this.round === this.rounds - 1,
    };
  }

  phone(slot: Slot): BluffPhone {
    const own = this.options.findIndex((option) => option.author === slot);
    return {
      phase: this.phase,
      me: slot,
      round: this.round,
      rounds: this.rounds,
      word: this.current.word,
      nature: this.current.nature,
      options: this.optionViews(),
      own: own < 0 ? null : own,
      vote: this.votes[slot],
      ready: this.ready(slot),
      scores: [...this.scores],
      gained: this.gained ? this.gained[slot] : null,
      remaining: this.remaining(),
      last: this.round === this.rounds - 1,
      guard: `${this.round}-${this.phase}`,
    };
  }
}

export const bluff: GameDefinition = {
  id: 'bluff',
  title: 'Le menteur',
  tagline: 'Un mot rare, une vraie définition… et vos plus beaux bobards.',
  accent: '#ff7a2e',
  coop: false,
  rules: [
    'Un mot rare s’affiche. Chacun invente en secret une définition crédible sur son téléphone.',
    'La télé mélange la vraie définition, vos deux inventions et un piège du jeu. Trouve la vraie !',
    `Trouver la vraie : ${FIND_POINTS} points. L’autre tombe dans ton bluff : ${FOOL_POINTS} points pour toi.`,
    'Les réponses restent affichées : passez au mot suivant quand vous avez fini d’en rire.',
  ],
  settings: BLUFF_SETTINGS,
  create: (ctx) => new Bluff(ctx),
};
