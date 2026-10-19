import { describe, expect, it } from 'vitest';
import { connect4, type Connect4Phone, type Connect4Tv } from '../../src/lib/games/connect4/logic';
import {
  battleship,
  FLEET,
  isValidFleet,
  randomFleet,
  shipCells,
  SIZE,
  type BattleshipPhone,
  type BattleshipTv,
} from '../../src/lib/games/battleship/logic';
import { sketch, ROUNDS, type SketchPhone, type SketchTv } from '../../src/lib/games/sketch/logic';
import { createRng } from '../../src/lib/random';
import { createTestContext } from './helpers';
import type { Slot } from '../../src/lib/games/types';

describe('Puissance 4', () => {
  function setup(starter: Slot = 0) {
    const test = createTestContext({ starter });
    const game = connect4.create(test.ctx);
    return { test, game, tv: () => game.tv() as Connect4Tv, phone: (slot: Slot) => game.phone(slot) as Connect4Phone };
  }

  it('alternates turns and ignores the wrong player', () => {
    const { game, tv } = setup(0);
    game.act(1, { type: 'drop', col: 3 });
    expect(tv().moves).toBe(0);
    game.act(0, { type: 'drop', col: 3 });
    expect(tv().grid[5][3]).toBe(0);
    expect(tv().turn).toBe(1);
  });

  it('detects horizontal, vertical and diagonal wins', () => {
    const scenarios: number[][] = [
      [0, 0, 1, 1, 2, 2, 3],
      [0, 1, 0, 1, 0, 1, 0],
      [0, 1, 1, 2, 2, 3, 2, 3, 3, 6, 3],
      [6, 5, 5, 4, 4, 3, 4, 3, 3, 0, 3],
    ];
    for (const moves of scenarios) {
      const { game, tv, test } = setup(0);
      moves.forEach((col, index) => game.act((index % 2) as Slot, { type: 'drop', col }));
      expect(tv().phase).toBe('won');
      expect(tv().winLine.length).toBeGreaterThanOrEqual(4);
      test.clock.advance(3000);
      expect(test.results[0].winner).toBe(0);
    }
  });

  it('refuses a full column and declares a draw on a full board', () => {
    const { game, tv, test } = setup(0);
    const order = [
      0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 2, 3, 2, 3, 2, 3, 3, 2, 3, 2, 3, 2, 4, 5, 4, 5, 4, 5, 5, 4, 5, 4, 5, 4, 6, 6, 6, 6, 6, 6,
    ];
    let slot: Slot = 0;
    for (const col of order) {
      const before = tv().moves;
      game.act(slot, { type: 'drop', col });
      if (tv().moves > before) slot = slot === 0 ? 1 : 0;
    }
    expect(tv().moves).toBe(42);
    expect(tv().phase).toBe('draw');
    test.clock.advance(3000);
    expect(test.results[0].winner).toBeNull();
  });

  it('only lets the current player aim', () => {
    const { game, tv, phone } = setup(1);
    game.act(0, { type: 'aim', col: 6 });
    expect(tv().aim).toBe(3);
    game.act(1, { type: 'aim', col: 6 });
    expect(phone(1).aim).toBe(6);
    expect(phone(1).myTurn).toBe(true);
    expect(phone(0).myTurn).toBe(false);
  });
});

describe('Touché-coulé', () => {
  it('always generates valid fleets', () => {
    const rng = createRng(11);
    for (let i = 0; i < 300; i++) {
      const fleet = randomFleet(rng);
      expect(fleet).toHaveLength(FLEET.length);
      expect(isValidFleet(fleet)).toBe(true);
    }
  });

  function setup() {
    const test = createTestContext({ seed: 5, starter: 0 });
    const game = battleship.create(test.ctx);
    const tv = () => game.tv() as BattleshipTv;
    const phone = (slot: Slot) => game.phone(slot) as BattleshipPhone;
    return { test, game, tv, phone };
  }

  it('moves and rotates ships only to valid positions', () => {
    const { game, phone, test } = setup();
    const before = phone(0);
    if (before.phase !== 'place') throw new Error('expected placement');
    const ship = before.ships[3];
    game.act(0, { type: 'rotate', ship: 3 });
    const rotated = phone(0);
    if (rotated.phase !== 'place') throw new Error('expected placement');
    if (rotated.rejected === 0) expect(rotated.ships[3].horizontal).toBe(!ship.horizontal);
    expect(isValidFleet(rotated.ships)).toBe(true);
    const occupied = shipCells(rotated.ships[0])[0];
    game.act(0, { type: 'move', ship: 3, row: Math.floor(occupied / SIZE), col: occupied % SIZE });
    const moved = phone(0);
    if (moved.phase !== 'place') throw new Error('expected placement');
    expect(isValidFleet(moved.ships)).toBe(true);
    expect(test.fx.filter((event) => event.kind === 'error').length).toBe(moved.rejected);
  });

  it('plays a full battle until a fleet is sunk', () => {
    const { game, tv, phone, test } = setup();
    game.act(0, { type: 'ready' });
    game.act(1, { type: 'ready' });
    expect(tv().phase).toBe('battle');
    const next = [0, 0];
    let guard = 0;
    while (tv().phase === 'battle' && guard++ < 400) {
      const shooter = tv().turn;
      const target = shooter === 0 ? 1 : 0;
      let cell = next[shooter];
      while (tv().boards[target].shots[cell] !== null) cell += 1;
      next[shooter] = cell + 1;
      game.act(target, { type: 'fire', cell });
      expect(tv().firing).toBeNull();
      game.act(shooter, { type: 'fire', cell });
      game.act(shooter, { type: 'fire', cell: (cell + 1) % 64 });
      expect(tv().firing?.cell).toBe(cell);
      test.clock.advance(1100);
      expect(tv().boards[target].shots[cell]).not.toBeNull();
      test.clock.advance(1700);
    }
    expect(tv().phase).toBe('over');
    const winner = tv().winner as Slot;
    expect(tv().afloat[winner === 0 ? 1 : 0]).toBe(0);
    const view = phone(winner);
    if (view.phase === 'place') throw new Error('unexpected phase');
    expect(view.enemy.ships).toHaveLength(FLEET.length);
    test.clock.advance(4000);
    expect(test.results[0].winner).toBe(winner);
  });
});

describe('Gribouille', () => {
  function setup() {
    const test = createTestContext({ seed: 8, starter: 0 });
    const game = sketch.create(test.ctx);
    const tv = () => game.tv() as SketchTv;
    const phone = (slot: Slot) => game.phone(slot) as SketchPhone;
    return { test, game, tv, phone };
  }

  function drawer(view: SketchPhone) {
    if (view.role !== 'drawer') throw new Error('expected drawer');
    return view;
  }

  it('lets the drawer pick a word and the guesser find it', () => {
    const { game, tv, phone } = setup();
    const choices = drawer(phone(0)).choices;
    expect(choices.map((choice) => choice.level)).toEqual([1, 2, 3]);
    game.act(0, { type: 'choose', index: 0 });
    expect(tv().phase).toBe('draw');
    expect(tv().pattern.replace(/[^_]/g, '')).not.toHaveLength(0);
    game.act(0, { type: 'stroke', id: 1, color: '#e9465a', size: 18, points: [10, 10, 20, 20] });
    game.act(0, { type: 'stroke', id: 1, points: [30, 30], end: true });
    expect(tv().strokes[0].points).toEqual([10, 10, 20, 20, 30, 30]);
    game.act(1, { type: 'guess', text: 'pas du tout' });
    expect(tv().guesses).toHaveLength(1);
    game.act(1, { type: 'guess', text: choices[0].word.toUpperCase() });
    expect(tv().phase).toBe('reveal');
    expect(tv().success).toBe(true);
    expect(tv().points).toBeGreaterThan(0);
  });

  it('accepts small typos and accent differences', () => {
    const { game, tv, phone } = setup();
    game.act(0, { type: 'choose', index: 1 });
    const word = drawer(phone(0)).word as string;
    const typo = word.length >= 6 ? word.slice(0, 2) + word.slice(3) : word;
    game.act(1, { type: 'guess', text: typo.normalize('NFD').replace(/[̀-ͯ]/g, '') });
    expect(tv().success).toBe(true);
  });

  it('ends the round when time runs out and reveals letters on the way', () => {
    const { game, tv, test } = setup();
    game.act(0, { type: 'choose', index: 2 });
    const hidden = () =>
      tv()
        .pattern.split('')
        .filter((char) => char === '_').length;
    const start = hidden();
    test.clock.advance(61_000);
    expect(hidden()).toBeLessThan(start);
    test.clock.advance(20_000);
    expect(tv().phase).toBe('reveal');
    expect(tv().success).toBe(false);
  });

  it('plays all rounds, alternating drawers, then finishes', () => {
    const { game, tv, phone, test } = setup();
    const drawers: Slot[] = [];
    for (let round = 0; round < ROUNDS; round++) {
      const current = tv().drawer;
      drawers.push(current);
      game.act(current, { type: 'choose', index: 0 });
      game.act(current, { type: 'skip' });
      expect(tv().phase).toBe('reveal');
      test.clock.advance(5000);
    }
    expect(drawers).toEqual([0, 1, 0, 1, 0, 1]);
    expect(test.results).toHaveLength(1);
    expect(test.results[0].coop?.won).toBe(false);
    expect(phone(0).phase).toBe('reveal');
  });
});
