import type { Rng } from '../../random';
import { choiceOf, resolveSettings, type SettingDef } from '../settings';
import { isInt, isRecord, other, type GameContext, type GameDefinition, type GameInstance, type Slot } from '../types';

export const SIZE = 8;
export const FLEET = [
  { name: 'cuirassé', size: 4 },
  { name: 'croiseur', size: 3 },
  { name: 'sous-marin', size: 3 },
  { name: 'torpilleur', size: 2 },
] as const;

/** `shot` is the plain cannon; the others can each be used once per game. */
export type Weapon = 'shot' | 'bomb' | 'torpedo' | 'sonar';
export const SPECIALS: readonly Exclude<Weapon, 'shot'>[] = ['bomb', 'torpedo', 'sonar'];
export const WEAPON_NAMES: Record<Weapon, string> = { shot: 'Tir', bomb: 'Bombe', torpedo: 'Torpille', sonar: 'Sonar' };

export const BATTLESHIP_SETTINGS: readonly SettingDef[] = [
  {
    id: 'specials',
    label: 'Armes spéciales',
    kind: 'choice',
    options: [
      { value: 1, label: 'Oui' },
      { value: 0, label: 'Non' },
    ],
    default: 1,
  },
  {
    id: 'again',
    label: 'Touché : on rejoue',
    kind: 'choice',
    options: [
      { value: 1, label: 'Oui' },
      { value: 0, label: 'Non' },
    ],
    default: 1,
  },
];

const FIRE_DELAY_MS = 1100;
const NEXT_TURN_DELAY_MS = 1700;
const FINISH_DELAY_MS = 3000;

export interface Ship {
  id: number;
  size: number;
  row: number;
  col: number;
  horizontal: boolean;
}

export type Shot = 'hit' | 'miss' | null;

export interface ShipView extends Ship {
  sunk: boolean;
}

/** A sonar ping: how many ship cells, hit or not, hide in the 3×3 square around `cell`. */
export interface Scan {
  cell: number;
  count: number;
}

export interface BoardView {
  shots: Shot[];
  ships: ShipView[];
  scans: Scan[];
}

export interface LastShot {
  seq: number;
  shooter: Slot;
  target: Slot;
  cell: number;
  weapon: Weapon;
  cells: number[];
  result: 'miss' | 'hit' | 'sunk' | 'scan';
  ship: string | null;
  count: number;
  again: boolean;
}

export interface BattleshipTv {
  phase: 'place' | 'battle' | 'over';
  ready: [boolean, boolean];
  turn: Slot;
  aim: number | null;
  zone: number[];
  weapon: Weapon;
  firing: { target: Slot; cell: number } | null;
  last: LastShot | null;
  boards: [BoardView, BoardView];
  afloat: [number, number];
  specials: boolean;
  arsenal: [Weapon[], Weapon[]];
  winner: Slot | null;
}

export type BattleshipPhone =
  | { phase: 'place'; me: Slot; ships: ShipView[]; ready: boolean; otherReady: boolean; rejected: number; guard: string }
  | {
      phase: 'battle' | 'over';
      me: Slot;
      myTurn: boolean;
      busy: boolean;
      aim: number | null;
      weapon: Weapon;
      specials: boolean;
      arsenal: Weapon[];
      firing: { target: Slot; cell: number } | null;
      last: LastShot | null;
      own: BoardView;
      enemy: BoardView;
      afloat: [number, number];
      winner: Slot | null;
      guard: string;
    };

export function shipCells(ship: Ship): number[] {
  return Array.from({ length: ship.size }, (_, k) => (ship.horizontal ? ship.row * SIZE + ship.col + k : (ship.row + k) * SIZE + ship.col));
}

export function inBounds(ship: Ship): boolean {
  if (ship.row < 0 || ship.col < 0) return false;
  return ship.horizontal ? ship.row < SIZE && ship.col + ship.size <= SIZE : ship.col < SIZE && ship.row + ship.size <= SIZE;
}

export function isValidFleet(ships: Ship[]): boolean {
  const taken = new Set<number>();
  for (const ship of ships) {
    if (!inBounds(ship)) return false;
    for (const cell of shipCells(ship)) {
      if (taken.has(cell)) return false;
      taken.add(cell);
    }
  }
  return true;
}

export function randomFleet(rng: Rng): Ship[] {
  for (;;) {
    const ships: Ship[] = [];
    for (const [id, { size }] of FLEET.entries()) {
      for (let attempt = 0; attempt < 100; attempt++) {
        const horizontal = rng.next() < 0.5;
        const ship: Ship = {
          id,
          size,
          horizontal,
          row: rng.int(horizontal ? SIZE : SIZE - size + 1),
          col: rng.int(horizontal ? SIZE - size + 1 : SIZE),
        };
        if (isValidFleet([...ships, ship])) {
          ships.push(ship);
          break;
        }
      }
    }
    if (ships.length === FLEET.length) return ships;
  }
}

/** The cells a weapon aimed at `cell` reaches, before looking at what is there. */
export function weaponArea(weapon: Weapon, cell: number): number[] {
  const row = Math.floor(cell / SIZE);
  const col = cell % SIZE;
  const at = (r: number, c: number) => (r >= 0 && r < SIZE && c >= 0 && c < SIZE ? [r * SIZE + c] : []);
  switch (weapon) {
    case 'shot':
      return [cell];
    case 'bomb':
      return [...at(row, col), ...at(row - 1, col), ...at(row + 1, col), ...at(row, col - 1), ...at(row, col + 1)];
    case 'torpedo':
      // Launched from the left edge of the row, it runs until it meets a ship.
      return Array.from({ length: SIZE }, (_, c) => row * SIZE + c);
    case 'sonar':
      return [-1, 0, 1].flatMap((dr) => [-1, 0, 1].flatMap((dc) => at(row + dr, col + dc)));
  }
}

function clampToBoard(ship: Ship): Ship {
  const maxRow = ship.horizontal ? SIZE - 1 : SIZE - ship.size;
  const maxCol = ship.horizontal ? SIZE - ship.size : SIZE - 1;
  return { ...ship, row: Math.min(Math.max(ship.row, 0), maxRow), col: Math.min(Math.max(ship.col, 0), maxCol) };
}

class Battleship implements GameInstance {
  private phase: BattleshipTv['phase'] = 'place';
  private readonly fleets: [Ship[], Ship[]];
  private readonly ready: [boolean, boolean] = [false, false];
  private readonly rejected: [number, number] = [0, 0];
  private readonly shots: [Shot[], Shot[]] = [Array<Shot>(SIZE * SIZE).fill(null), Array<Shot>(SIZE * SIZE).fill(null)];
  private turn: Slot;
  private aim: number | null = null;
  private weapon: Weapon = 'shot';
  private readonly arsenal: [Set<Weapon>, Set<Weapon>];
  private readonly scans: [Scan[], Scan[]] = [[], []];
  private readonly again: boolean;
  private readonly specials: boolean;
  private firing: { target: Slot; cell: number } | null = null;
  private busy = false;
  private last: LastShot | null = null;
  private shotSeq = 0;
  private winner: Slot | null = null;

  constructor(private readonly ctx: GameContext) {
    this.turn = ctx.starter;
    this.fleets = [randomFleet(ctx.rng), randomFleet(ctx.rng)];
    const settings = resolveSettings(BATTLESHIP_SETTINGS, ctx.settings, ctx.rng);
    this.specials = choiceOf(settings, 'specials') === 1;
    this.arsenal = [new Set(this.specials ? SPECIALS : []), new Set(this.specials ? SPECIALS : [])];
    this.again = choiceOf(settings, 'again') === 1;
  }

  act(slot: Slot, action: unknown): void {
    if (!isRecord(action) || typeof action.type !== 'string') return;
    if (this.phase === 'place') this.placeAction(slot, action);
    else if (this.phase === 'battle') this.battleAction(slot, action);
  }

  private placeAction(slot: Slot, action: Record<string, unknown>): void {
    if (action.type === 'ready') {
      this.ready[slot] = true;
      if (this.ready[0] && this.ready[1]) {
        this.phase = 'battle';
        this.ctx.fx('turn', [this.turn]);
      }
      this.ctx.update();
      return;
    }
    if (action.type === 'unready') {
      this.ready[slot] = false;
      this.ctx.update();
      return;
    }
    if (this.ready[slot]) return;
    if (action.type === 'shuffle') {
      this.fleets[slot] = randomFleet(this.ctx.rng);
      this.ctx.update();
      return;
    }
    if (!isInt(action.ship, 0, FLEET.length - 1)) return;
    const ships = this.fleets[slot];
    const current = ships[action.ship];
    let candidate: Ship | null = null;
    if (action.type === 'move' && isInt(action.row, 0, SIZE - 1) && isInt(action.col, 0, SIZE - 1)) {
      candidate = clampToBoard({ ...current, row: action.row, col: action.col });
    } else if (action.type === 'rotate') {
      candidate = clampToBoard({ ...current, horizontal: !current.horizontal });
    }
    if (!candidate) return;
    const next = ships.map((ship) => (ship.id === current.id ? candidate : ship));
    if (isValidFleet(next)) {
      this.fleets[slot] = next;
    } else {
      this.rejected[slot] += 1;
      this.ctx.fx('error', [slot]);
    }
    this.ctx.update();
  }

  private battleAction(slot: Slot, action: Record<string, unknown>): void {
    if (slot !== this.turn || this.busy || !isInt(action.cell, 0, SIZE * SIZE - 1)) return;
    const target = other(slot);
    if (this.shots[target][action.cell] !== null) return;
    const weapon = (['shot', ...SPECIALS] as Weapon[]).find((candidate) => candidate === (action.weapon ?? 'shot'));
    if (!weapon || (weapon !== 'shot' && !this.arsenal[slot].has(weapon))) return;
    if (action.type === 'aim') {
      if (this.aim === action.cell && this.weapon === weapon) return;
      this.aim = action.cell;
      this.weapon = weapon;
      this.ctx.fx('aim', 'all');
      this.ctx.update();
    } else if (action.type === 'fire') {
      this.busy = true;
      this.aim = action.cell;
      this.weapon = weapon;
      if (weapon !== 'shot') this.arsenal[slot].delete(weapon);
      this.firing = { target, cell: action.cell };
      this.ctx.fx('fire', 'all');
      this.ctx.update();
      this.ctx.after(FIRE_DELAY_MS, () => this.resolve(slot, target, action.cell as number, weapon));
    }
  }

  private shipAt(owner: Slot, cell: number): Ship | null {
    return this.fleets[owner].find((candidate) => shipCells(candidate).includes(cell)) ?? null;
  }

  /** The cells the weapon really strikes: torpedoes stop at the first ship they meet. */
  private strike(target: Slot, cell: number, weapon: Weapon): number[] {
    const area = weaponArea(weapon, cell).filter((candidate) => this.shots[target][candidate] === null);
    if (weapon !== 'torpedo') return area;
    const stop = area.findIndex((candidate) => this.shipAt(target, candidate) !== null);
    return stop < 0 ? area : area.slice(0, stop + 1);
  }

  private resolve(shooter: Slot, target: Slot, cell: number, weapon: Weapon): void {
    this.shotSeq += 1;
    this.firing = null;
    if (weapon === 'sonar') {
      const count = weaponArea('sonar', cell).filter((candidate) => this.shipAt(target, candidate) !== null).length;
      this.scans[target].push({ cell, count });
      this.last = { seq: this.shotSeq, shooter, target, cell, weapon, cells: [], result: 'scan', ship: null, count, again: false };
      this.ctx.fx('reveal', 'all');
      this.nextTurn(target);
      return;
    }

    const afloatBefore = this.fleets[target].filter((ship) => !this.isSunk(target, ship));
    const cells = this.strike(target, cell, weapon);
    let hits = 0;
    for (const struck of cells) {
      const ship = this.shipAt(target, struck);
      this.shots[target][struck] = ship ? 'hit' : 'miss';
      if (ship) hits += 1;
    }
    const sunk = afloatBefore.filter((ship) => this.isSunk(target, ship));
    const again = this.again && hits > 0;
    this.last = {
      seq: this.shotSeq,
      shooter,
      target,
      cell,
      weapon,
      cells,
      result: sunk.length ? 'sunk' : hits ? 'hit' : 'miss',
      ship: sunk.length ? sunk.map((ship) => FLEET[ship.id].name).join(' et ') : null,
      count: hits,
      again,
    };
    this.ctx.fx(sunk.length ? 'sunk' : hits ? 'hit' : 'miss', 'all');

    if (this.afloat(target) === 0) {
      this.phase = 'over';
      this.winner = shooter;
      this.ctx.update();
      this.ctx.after(FINISH_DELAY_MS, () =>
        this.ctx.finish({
          winner: shooter,
          title: `${this.ctx.name(shooter)} a coulé toute la flotte !`,
          detail: `${this.ctx.name(target)} n’a plus un seul navire.`,
        }),
      );
      return;
    }

    this.nextTurn(again ? shooter : target);
  }

  private nextTurn(next: Slot): void {
    this.ctx.update();
    this.ctx.after(NEXT_TURN_DELAY_MS, () => {
      this.turn = next;
      this.aim = null;
      this.weapon = 'shot';
      this.busy = false;
      this.ctx.fx('turn', [this.turn]);
      this.ctx.update();
    });
  }

  private isSunk(owner: Slot, ship: Ship): boolean {
    return shipCells(ship).every((cell) => this.shots[owner][cell] === 'hit');
  }

  private afloat(owner: Slot): number {
    return this.fleets[owner].filter((ship) => !this.isSunk(owner, ship)).length;
  }

  private board(owner: Slot, revealAll: boolean): BoardView {
    return {
      shots: [...this.shots[owner]],
      ships: this.fleets[owner].map((ship) => ({ ...ship, sunk: this.isSunk(owner, ship) })).filter((ship) => revealAll || ship.sunk),
      scans: [...this.scans[owner]],
    };
  }

  tv(): BattleshipTv {
    const reveal = this.phase === 'over';
    return {
      phase: this.phase,
      ready: [...this.ready] as [boolean, boolean],
      turn: this.turn,
      aim: this.aim,
      zone: this.aim === null ? [] : weaponArea(this.weapon, this.aim),
      weapon: this.weapon,
      firing: this.firing,
      last: this.last,
      boards: [this.board(0, reveal), this.board(1, reveal)],
      afloat: [this.afloat(0), this.afloat(1)],
      specials: this.specials,
      arsenal: [[...this.arsenal[0]], [...this.arsenal[1]]],
      winner: this.winner,
    };
  }

  phone(slot: Slot): BattleshipPhone {
    if (this.phase === 'place') {
      return {
        phase: 'place',
        me: slot,
        ships: this.fleets[slot].map((ship) => ({ ...ship, sunk: false })),
        ready: this.ready[slot],
        otherReady: this.ready[other(slot)],
        rejected: this.rejected[slot],
        guard: 'place',
      };
    }
    const myTurn = this.phase === 'battle' && slot === this.turn;
    return {
      phase: this.phase,
      me: slot,
      myTurn,
      busy: this.busy,
      aim: myTurn ? this.aim : null,
      weapon: this.weapon,
      specials: this.specials,
      arsenal: [...this.arsenal[slot]],
      firing: this.firing,
      last: this.last,
      own: this.board(slot, true),
      enemy: this.board(other(slot), this.phase === 'over'),
      afloat: [this.afloat(0), this.afloat(1)],
      winner: this.winner,
      guard: `t${this.turn}-${this.shotSeq}-${this.busy ? 1 : 0}`,
    };
  }
}

export const battleship: GameDefinition = {
  id: 'battleship',
  title: 'Touché-coulé',
  tagline: 'Cachez votre flotte, coulez celle de l’autre.',
  accent: '#3b46ff',
  coop: false,
  rules: [
    'Placez vos quatre navires en secret sur votre téléphone. Touche un navire pour le choisir, une case pour le déplacer, et re-touche-le pour le tourner.',
    'Chacun son tour, vise une case de la mer adverse, puis appuie sur « Feu ! ». Si tu touches, tu peux rejouer (réglable).',
    'Une fois par partie, sors une arme spéciale : la bombe frappe en croix, la torpille part du bord gauche et file jusqu’au premier navire, le sonar compte les cases de navire autour de la cible.',
    'Le premier qui coule toute la flotte de l’autre gagne.',
  ],
  settings: BATTLESHIP_SETTINGS,
  create: (ctx) => new Battleship(ctx),
};
