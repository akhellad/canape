import { normalize } from '../../text';
import { choiceOf, resolveSettings, type SettingDef } from '../settings';
import { isInt, isRecord, type GameContext, type GameDefinition, type GameInstance, type Slot, type TimerHandle } from '../types';
import { buildGrid, wordCells, type Direction, type Grid } from './grid';
import { ENTRIES } from './words';

export const WORD_POINTS = 10;
export const HINT_COST = 3;

export const CROSSWORD_SETTINGS: readonly SettingDef[] = [
  {
    id: 'size',
    label: 'Taille de la grille',
    kind: 'choice',
    options: [
      { value: 8, label: 'Petite' },
      { value: 12, label: 'Moyenne' },
      { value: 16, label: 'Grande' },
    ],
    default: 12,
  },
  {
    id: 'time',
    label: 'Temps',
    kind: 'choice',
    options: [
      { value: 5, label: '5 min' },
      { value: 10, label: '10 min' },
      { value: 15, label: '15 min' },
      { value: 0, label: 'Illimité' },
    ],
    default: 10,
  },
  {
    id: 'split',
    label: 'Définitions',
    kind: 'choice',
    options: [
      { value: 1, label: 'Chacun les siennes' },
      { value: 0, label: 'Tout partager' },
    ],
    default: 1,
  },
];

export interface ClueView {
  id: number;
  number: number;
  dir: Direction;
  length: number;
  /** Known letters, `null` where the square is still blank. */
  pattern: (string | null)[];
  found: Slot | null;
  /** Only set for the phones that own the clue. */
  clue: string | null;
  owner: Slot | null;
}

export interface CrosswordTv {
  phase: 'play' | 'done';
  rows: number;
  cols: number;
  /** Letters players can see; the full solution once the game is over. */
  letters: (string | null)[];
  blocks: boolean[];
  numbers: (number | null)[];
  finders: (Slot | null)[];
  found: number;
  total: number;
  hints: number;
  score: number;
  remaining: number | null;
  timeTotal: number | null;
  last: { seq: number; by: Slot; word: string } | null;
  complete: boolean;
}

export interface CrosswordPhone {
  phase: 'play' | 'done';
  me: Slot;
  clues: ClueView[];
  found: number;
  total: number;
  score: number;
  remaining: number | null;
  wrong: { seq: number; id: number } | null;
  complete: boolean;
  guard: string;
}

/** What a player typed, as grid letters: capitals, no accents, nothing but letters. */
export function toLetters(text: string): string {
  return normalize(text)
    .replace(/[^a-z]/g, '')
    .toUpperCase();
}

class Crossword implements GameInstance {
  private phase: 'play' | 'done' = 'play';
  private readonly grid: Grid;
  private readonly owners: (Slot | null)[];
  private readonly found: (Slot | null)[];
  private readonly revealed = new Set<number>();
  private hints = 0;
  private deadline: number | null = null;
  private readonly minutes: number;
  private tick: TimerHandle | null = null;
  private last: CrosswordTv['last'] = null;
  private wrong: [CrosswordPhone['wrong'], CrosswordPhone['wrong']] = [null, null];
  private seq = 0;

  constructor(private readonly ctx: GameContext) {
    const settings = resolveSettings(CROSSWORD_SETTINGS, ctx.settings, ctx.rng);
    this.grid = buildGrid(ctx.rng, ENTRIES, choiceOf(settings, 'size'));
    const split = choiceOf(settings, 'split') === 1;
    // Deal the clues out one each, so both players have to talk to fill the grid.
    const dealt = ctx.rng.shuffle(this.grid.words.map((_, index) => index));
    this.owners = this.grid.words.map((_, index) => (split ? ((dealt.indexOf(index) % 2) as Slot) : null));
    this.found = this.grid.words.map(() => null);
    this.minutes = choiceOf(settings, 'time');
    if (this.minutes > 0) this.deadline = ctx.now() + this.minutes * 60_000;
    this.scheduleTick();
    ctx.fx('reveal', 'all');
  }

  act(slot: Slot, action: unknown): void {
    if (!isRecord(action) || typeof action.type !== 'string') return;
    if (this.phase === 'done') {
      if (action.type === 'next') this.end();
      return;
    }
    if (action.type === 'giveup') {
      this.stop();
      return;
    }
    if (!isInt(action.id, 0, this.grid.words.length - 1) || this.found[action.id] !== null) return;
    if (!this.mayUse(slot, action.id)) return;
    if (action.type === 'answer' && typeof action.text === 'string') this.answer(slot, action.id, action.text);
    else if (action.type === 'hint') this.hint(action.id);
  }

  private mayUse(slot: Slot, id: number): boolean {
    const owner = this.owners[id];
    return owner === null || owner === slot;
  }

  private answer(slot: Slot, id: number, text: string): void {
    const word = this.grid.words[id];
    if (toLetters(text.slice(0, 40)) !== word.word) {
      this.seq += 1;
      this.wrong[slot] = { seq: this.seq, id };
      this.ctx.fx('wrong', [slot]);
      this.ctx.update();
      return;
    }
    this.found[id] = slot;
    this.seq += 1;
    this.last = { seq: this.seq, by: slot, word: word.word };
    this.ctx.fx('correct', 'all');
    // Words whose squares are now all filled in by crossings count as found too.
    this.grid.words.forEach((other, index) => {
      if (this.found[index] === null && wordCells(other, this.grid.cols).every((cell) => this.known(cell))) this.found[index] = slot;
    });
    if (this.found.every((finder) => finder !== null)) this.stop();
    this.ctx.update();
  }

  private hint(id: number): void {
    const blank = wordCells(this.grid.words[id], this.grid.cols).filter((cell) => !this.known(cell));
    if (blank.length <= 1) return;
    this.revealed.add(this.ctx.rng.pick(blank));
    this.hints += 1;
    this.ctx.fx('flip', 'all');
    this.ctx.update();
  }

  private known(cell: number): boolean {
    if (this.revealed.has(cell)) return true;
    return this.grid.words.some((word, index) => this.found[index] !== null && wordCells(word, this.grid.cols).includes(cell));
  }

  private finderOf(cell: number): Slot | null {
    const index = this.grid.words.findIndex((word, i) => this.found[i] !== null && wordCells(word, this.grid.cols).includes(cell));
    return index < 0 ? null : this.found[index];
  }

  private scheduleTick(): void {
    if (this.deadline === null) return;
    this.ctx.cancel(this.tick);
    this.tick = this.ctx.after(1000, () => {
      if (this.phase !== 'play') return;
      const left = this.remaining() ?? 1;
      if (left <= 0) {
        this.stop();
        return;
      }
      if (left <= 10) this.ctx.fx('tick', 'all');
      this.scheduleTick();
      this.ctx.update();
    });
  }

  /** The grid is over: show the solution and wait for the players to move on. */
  private stop(): void {
    if (this.phase === 'done') return;
    this.phase = 'done';
    this.ctx.cancel(this.tick);
    this.ctx.fx(this.complete ? 'win' : 'reveal', 'all');
    this.ctx.update();
  }

  private end(): void {
    const total = this.grid.words.length;
    const found = this.foundCount;
    this.ctx.finish({
      winner: null,
      title: this.complete ? 'Grille complète, bravo !' : `${found} mot${found > 1 ? 's' : ''} sur ${total}`,
      detail: `${this.score} points${this.hints ? `, ${this.hints} indice${this.hints > 1 ? 's' : ''} utilisé${this.hints > 1 ? 's' : ''}` : ''}.`,
      coop: { won: this.complete, score: this.score },
    });
  }

  private get foundCount(): number {
    return this.found.filter((finder) => finder !== null).length;
  }

  private get complete(): boolean {
    return this.found.every((finder) => finder !== null);
  }

  private get score(): number {
    return Math.max(0, this.foundCount * WORD_POINTS - this.hints * HINT_COST);
  }

  private remaining(): number | null {
    if (this.deadline === null) return null;
    if (this.phase !== 'play') return 0;
    return Math.max(0, Math.ceil((this.deadline - this.ctx.now()) / 1000));
  }

  tv(): CrosswordTv {
    const { rows, cols, cells } = this.grid;
    const numbers: (number | null)[] = cells.map(() => null);
    for (const word of this.grid.words) numbers[word.row * cols + word.col] = word.number;
    const solved = this.phase === 'done';
    return {
      phase: this.phase,
      rows,
      cols,
      letters: cells.map((letter, cell) => (letter && (solved || this.known(cell)) ? letter : null)),
      blocks: cells.map((letter) => letter === null),
      numbers,
      finders: cells.map((_, cell) => this.finderOf(cell)),
      found: this.foundCount,
      total: this.grid.words.length,
      hints: this.hints,
      score: this.score,
      remaining: this.remaining(),
      timeTotal: this.minutes > 0 ? this.minutes * 60 : null,
      last: this.last,
      complete: this.complete,
    };
  }

  phone(slot: Slot): CrosswordPhone {
    const solved = this.phase === 'done';
    const clues = this.grid.words.map((word, id) => {
      const mine = this.mayUse(slot, id);
      return {
        id,
        number: word.number,
        dir: word.dir,
        length: word.word.length,
        pattern: wordCells(word, this.grid.cols).map((cell, k) => (solved || this.known(cell) ? word.word[k] : null)),
        found: this.found[id],
        clue: mine || solved ? word.clue : null,
        owner: this.owners[id],
      };
    });
    return {
      phase: this.phase,
      me: slot,
      clues,
      found: this.foundCount,
      total: this.grid.words.length,
      score: this.score,
      remaining: this.remaining(),
      wrong: this.wrong[slot],
      complete: this.complete,
      guard: this.phase,
    };
  }
}

export const crossword: GameDefinition = {
  id: 'crossword',
  title: 'Mots croisés',
  tagline: 'Une grille, deux têtes, et il faut se parler.',
  accent: '#b9a6ff',
  coop: true,
  rules: [
    'Une grille s’affiche sur la télé. Les définitions sont sur vos téléphones : chacun a les siennes (réglable).',
    'Touche une définition et écris ta réponse. Les lettres trouvées apparaissent dans la grille et aident l’autre.',
    `Bloqué ? Demande une lettre, mais ça coûte ${HINT_COST} points. Chaque mot trouvé en rapporte ${WORD_POINTS}.`,
  ],
  settings: CROSSWORD_SETTINGS,
  create: (ctx) => new Crossword(ctx),
};
