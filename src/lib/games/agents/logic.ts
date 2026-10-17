import type { Rng } from '../../random';
import { normalize } from '../../text';
import { isInt, isRecord, other, type GameContext, type GameDefinition, type GameInstance, type Slot } from '../types';
import { WORDS } from './words';

export type KeyCell = 'agent' | 'assassin' | 'neutral';

export const GRID = 25;
export const TOKENS = 9;
export const TOTAL_AGENTS = 15;
const REVEAL_DELAY_MS = 1000;
const FINISH_DELAY_MS = 3200;

const DISTRIBUTION: [KeyCell, KeyCell, number][] = [
  ['agent', 'agent', 3],
  ['agent', 'assassin', 1],
  ['assassin', 'agent', 1],
  ['agent', 'neutral', 5],
  ['neutral', 'agent', 5],
  ['assassin', 'assassin', 1],
  ['assassin', 'neutral', 1],
  ['neutral', 'assassin', 1],
  ['neutral', 'neutral', 7],
];

export function generateKeys(rng: Rng): [KeyCell[], KeyCell[]] {
  const pairs = rng.shuffle(DISTRIBUTION.flatMap(([a, b, count]) => Array.from({ length: count }, () => [a, b] as const)));
  return [pairs.map(([a]) => a), pairs.map(([, b]) => b)];
}

export interface TileView {
  word: string;
  found: boolean;
  bystander: [boolean, boolean];
}

export interface RevealInfo {
  seq: number;
  tile: number;
  by: Slot;
  side: Slot;
  result: KeyCell;
}

export type AgentsPhase = 'clue' | 'guess' | 'sudden' | 'over';

export interface AgentsTv {
  phase: AgentsPhase;
  tiles: TileView[];
  tokens: number;
  maxTokens: number;
  giver: Slot;
  clue: { word: string; count: number } | null;
  guesses: number;
  pending: [number | null, number | null];
  revealing: { tile: number; by: Slot } | null;
  lastReveal: RevealInfo | null;
  found: number;
  total: number;
  won: boolean | null;
  keys: [KeyCell[], KeyCell[]] | null;
}

export type AgentsRole = 'cluing' | 'waiting' | 'guessing' | 'watching' | 'sudden' | 'over';

export interface AgentsPhone {
  phase: AgentsPhase;
  role: AgentsRole;
  me: Slot;
  tiles: TileView[];
  myKey: KeyCell[];
  partnerKey: KeyCell[] | null;
  tokens: number;
  maxTokens: number;
  clue: { word: string; count: number } | null;
  guesses: number;
  pending: number | null;
  partnerPending: number | null;
  revealing: { tile: number; by: Slot } | null;
  lastReveal: RevealInfo | null;
  found: number;
  total: number;
  canStop: boolean;
  error: string | null;
  won: boolean | null;
  guard: string;
}

class Agents implements GameInstance {
  private readonly words: string[];
  private readonly keys: [KeyCell[], KeyCell[]];
  private readonly found: boolean[] = Array<boolean>(GRID).fill(false);
  private readonly bystander: [boolean[], boolean[]] = [Array<boolean>(GRID).fill(false), Array<boolean>(GRID).fill(false)];
  private phase: AgentsPhase = 'clue';
  private tokens = TOKENS;
  private giver: Slot;
  private clue: { word: string; count: number } | null = null;
  private guesses = 0;
  private turnNumber = 0;
  private readonly pending: [number | null, number | null] = [null, null];
  private readonly errors: [string | null, string | null] = [null, null];
  private revealing: { tile: number; by: Slot } | null = null;
  private lastReveal: RevealInfo | null = null;
  private revealSeq = 0;
  private won: boolean | null = null;

  constructor(private readonly ctx: GameContext) {
    this.words = ctx.rng.shuffle(WORDS).slice(0, GRID);
    this.keys = generateKeys(ctx.rng);
    this.giver = ctx.starter;
    ctx.fx('turn', [this.giver]);
  }

  act(slot: Slot, action: unknown): void {
    if (!isRecord(action) || typeof action.type !== 'string' || this.phase === 'over') return;
    switch (action.type) {
      case 'clue':
        this.giveClue(slot, action.word, action.count);
        break;
      case 'select':
        this.select(slot, action.tile);
        break;
      case 'unselect':
        if (this.pending[slot] !== null) {
          this.pending[slot] = null;
          this.ctx.update();
        }
        break;
      case 'confirm':
        this.confirm(slot, action.tile);
        break;
      case 'stop':
        if (this.phase === 'guess' && slot === other(this.giver) && this.guesses > 0 && !this.revealing) this.endTurn();
        break;
    }
  }

  private giveClue(slot: Slot, rawWord: unknown, count: unknown): void {
    if (this.phase !== 'clue' || slot !== this.giver || typeof rawWord !== 'string' || !isInt(count, 0, 9)) return;
    const raw = rawWord.trim();
    const normalized = normalize(raw);
    let error: string | null = null;
    if (!normalized || normalized.length < 2 || raw.length > 24) error = 'Écris un vrai mot, entre 2 et 24 lettres.';
    else if (/\s/.test(raw)) error = 'Un seul mot, sans espace.';
    else if (/[0-9]/.test(normalized)) error = 'Pas de chiffres dans l’indice.';
    else if (this.words.some((word, index) => !this.found[index] && normalize(word) === normalized))
      error = 'Ce mot est sur la grille, c’est interdit !';
    this.errors[slot] = error;
    if (!error) {
      this.clue = { word: raw.toLocaleUpperCase('fr-FR'), count };
      this.phase = 'guess';
      this.guesses = 0;
      this.ctx.fx('turn', [other(slot)]);
    } else {
      this.ctx.fx('error', [slot]);
    }
    this.ctx.update();
  }

  private canPick(slot: Slot, tile: number): boolean {
    if (this.found[tile]) return false;
    if (this.phase === 'guess') return slot === other(this.giver) && !this.bystander[this.giver][tile];
    if (this.phase === 'sudden') return this.agentsLeft(other(slot)) > 0 && !this.bystander[other(slot)][tile];
    return false;
  }

  private select(slot: Slot, tile: unknown): void {
    if (this.revealing || !isInt(tile, 0, GRID - 1) || !this.canPick(slot, tile)) return;
    this.pending[slot] = this.pending[slot] === tile ? null : tile;
    this.ctx.update();
  }

  private confirm(slot: Slot, tile: unknown): void {
    if (this.revealing || !isInt(tile, 0, GRID - 1) || this.pending[slot] !== tile || !this.canPick(slot, tile)) return;
    this.revealing = { tile, by: slot };
    this.ctx.fx('reveal', 'all');
    this.ctx.update();
    this.ctx.after(REVEAL_DELAY_MS, () => this.apply(tile, slot));
  }

  private apply(tile: number, by: Slot): void {
    const side: Slot = this.phase === 'sudden' ? other(by) : this.giver;
    const result = this.keys[side][tile];
    this.revealing = null;
    this.pending[0] = this.pending[0] === tile ? null : this.pending[0];
    this.pending[1] = this.pending[1] === tile ? null : this.pending[1];
    this.revealSeq += 1;
    this.lastReveal = { seq: this.revealSeq, tile, by, side, result };

    if (result === 'assassin') {
      this.end(false, 'L’assassin a frappé…', `${this.ctx.name(by)} a désigné « ${this.words[tile].toLocaleUpperCase('fr-FR')} ».`);
      return;
    }
    if (result === 'neutral') {
      this.bystander[side][tile] = true;
      this.ctx.fx('wrong', 'all');
      if (this.phase === 'sudden')
        this.end(false, 'Mort subite…', `« ${this.words[tile].toLocaleUpperCase('fr-FR')} » n’était qu’un passant.`);
      else this.endTurn();
      return;
    }

    this.found[tile] = true;
    this.guesses += 1;
    this.ctx.fx('correct', 'all');
    if (this.allFound()) {
      this.end(
        true,
        'Mission accomplie !',
        `Les ${TOTAL_AGENTS} agents sont retrouvés, avec ${this.tokens} jeton${this.tokens > 1 ? 's' : ''} d’avance.`,
      );
      return;
    }
    if (this.phase === 'guess' && this.agentsLeft(this.giver) === 0) this.endTurn();
    else this.ctx.update();
  }

  private endTurn(): void {
    this.tokens -= 1;
    this.turnNumber += 1;
    this.clue = null;
    this.guesses = 0;
    this.pending[0] = null;
    this.pending[1] = null;
    if (this.tokens <= 0) {
      this.tokens = 0;
      this.phase = 'sudden';
      this.ctx.fx('turn', 'all');
    } else {
      const next = other(this.giver);
      this.giver = this.agentsLeft(next) > 0 ? next : this.giver;
      this.phase = 'clue';
      this.ctx.fx('turn', [this.giver]);
    }
    this.ctx.update();
  }

  private end(won: boolean, title: string, detail: string): void {
    this.phase = 'over';
    this.won = won;
    this.ctx.fx(won ? 'win' : 'lose', 'all');
    this.ctx.update();
    this.ctx.after(FINISH_DELAY_MS, () =>
      this.ctx.finish({ winner: null, title, detail, coop: { won, score: won ? this.tokens : undefined } }),
    );
  }

  private agentsLeft(side: Slot): number {
    return this.keys[side].filter((cell, index) => cell === 'agent' && !this.found[index]).length;
  }

  private allFound(): boolean {
    return this.keys[0].every((cell, index) => this.found[index] || (cell !== 'agent' && this.keys[1][index] !== 'agent'));
  }

  private foundCount(): number {
    return this.found.filter(Boolean).length;
  }

  private tiles(): TileView[] {
    return this.words.map((word, index) => ({
      word: word.toLocaleUpperCase('fr-FR'),
      found: this.found[index],
      bystander: [this.bystander[0][index], this.bystander[1][index]],
    }));
  }

  tv(): AgentsTv {
    return {
      phase: this.phase,
      tiles: this.tiles(),
      tokens: this.tokens,
      maxTokens: TOKENS,
      giver: this.giver,
      clue: this.clue,
      guesses: this.guesses,
      pending: [...this.pending] as [number | null, number | null],
      revealing: this.revealing,
      lastReveal: this.lastReveal,
      found: this.foundCount(),
      total: TOTAL_AGENTS,
      won: this.won,
      keys: this.phase === 'over' ? [[...this.keys[0]], [...this.keys[1]]] : null,
    };
  }

  phone(slot: Slot): AgentsPhone {
    let role: AgentsRole;
    if (this.phase === 'over') role = 'over';
    else if (this.phase === 'sudden') role = 'sudden';
    else if (this.phase === 'clue') role = slot === this.giver ? 'cluing' : 'waiting';
    else role = slot === this.giver ? 'watching' : 'guessing';
    return {
      phase: this.phase,
      role,
      me: slot,
      tiles: this.tiles(),
      myKey: [...this.keys[slot]],
      partnerKey: this.phase === 'over' ? [...this.keys[other(slot)]] : null,
      tokens: this.tokens,
      maxTokens: TOKENS,
      clue: this.clue,
      guesses: this.guesses,
      pending: this.pending[slot],
      partnerPending: this.pending[other(slot)],
      revealing: this.revealing,
      lastReveal: this.lastReveal,
      found: this.foundCount(),
      total: TOTAL_AGENTS,
      canStop: role === 'guessing' && this.guesses > 0 && !this.revealing,
      error: this.errors[slot],
      won: this.won,
      guard: `${this.phase}-${this.turnNumber}-${role}`,
    };
  }
}

export const agents: GameDefinition = {
  id: 'agents',
  title: 'Agents doubles',
  tagline: 'En équipe : retrouvez vos 15 agents grâce à des indices.',
  icon: 'detective',
  accent: '#4e9a6b',
  coop: true,
  rules: [
    'Vous jouez ensemble. Chacun voit sur son téléphone sa carte secrète : ses agents en vert, ses assassins en noir.',
    'Chacun son tour, l’un tape un indice d’un seul mot et un nombre, pour faire deviner ses agents à l’autre.',
    'L’autre touche les mots sur son téléphone. Agent : on continue. Passant : le tour s’arrête. Assassin : perdu !',
    `Retrouvez les ${TOTAL_AGENTS} agents avant d’avoir utilisé les ${TOKENS} jetons de temps.`,
  ],
  create: (ctx) => new Agents(ctx),
};
