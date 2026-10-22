import { describe, expect, it } from 'vitest';
import { connect4, type Connect4Phone, type Connect4Tv } from '../../src/lib/games/connect4/logic';
import {
  battleship,
  FLEET,
  isValidFleet,
  randomFleet,
  shipCells,
  SIZE,
  weaponArea,
  type BattleshipPhone,
  type BattleshipTv,
} from '../../src/lib/games/battleship/logic';
import { isAnswer, sketch, ROUNDS, type SketchPhone, type SketchTv } from '../../src/lib/games/sketch/logic';
import { PALETTE, PAPER } from '../../src/lib/draw/pad';
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

  function battle(settings = {}) {
    const test = createTestContext({ seed: 5, starter: 0, settings });
    const game = battleship.create(test.ctx);
    const tv = () => game.tv() as BattleshipTv;
    game.act(0, { type: 'ready' });
    game.act(1, { type: 'ready' });
    const fleet = (slot: Slot) => {
      const view = game.phone(slot) as BattleshipPhone;
      if (view.phase === 'place') throw new Error('unexpected phase');
      return view.own.ships;
    };
    const shipCell = (slot: Slot) => shipCells(fleet(slot)[0])[0];
    const waterCell = (slot: Slot) => {
      const taken = new Set(fleet(slot).flatMap(shipCells));
      return Array.from({ length: SIZE * SIZE }, (_, i) => i).find((i) => !taken.has(i) && tv().boards[slot].shots[i] === null)!;
    };
    const shoot = (slot: Slot, cell: number, weapon = 'shot') => {
      game.act(slot, { type: 'fire', cell, weapon });
      test.clock.advance(1100 + 1700);
    };
    return { test, game, tv, fleet, shipCell, waterCell, shoot };
  }

  it('lets the shooter play again after a hit, and passes the turn after a miss', () => {
    const { tv, shipCell, waterCell, shoot } = battle();
    shoot(0, shipCell(1));
    expect(tv().last).toMatchObject({ result: 'hit', again: true });
    expect(tv().turn).toBe(0);
    shoot(0, waterCell(1));
    expect(tv().turn).toBe(1);
  });

  it('passes the turn after a hit when replaying is turned off', () => {
    const { tv, shipCell, shoot } = battle({ again: 0 });
    shoot(0, shipCell(1));
    expect(tv().turn).toBe(1);
  });

  it('uses each special weapon once: bomb in a cross, torpedo to the first ship, sonar counts', () => {
    const { tv, fleet, shipCell, waterCell, shoot, game } = battle({ again: 0 });
    const center = 2 * SIZE + 2;
    shoot(0, center, 'bomb');
    expect(tv().last?.cells.sort()).toEqual(weaponArea('bomb', center).sort());
    expect(tv().arsenal[0]).toEqual(['torpedo', 'sonar']);
    shoot(1, waterCell(0));
    game.act(0, { type: 'fire', cell: 40, weapon: 'bomb' });
    expect(tv().firing).toBeNull();

    const target = shipCell(1);
    const row = Math.floor(target / SIZE);
    const firstShip = weaponArea('torpedo', target).find(
      (cell) => tv().boards[1].shots[cell] === null && fleet(1).some((ship) => shipCells(ship).includes(cell)),
    )!;
    const free = weaponArea('torpedo', target).find((cell) => tv().boards[1].shots[cell] === null)!;
    shoot(0, free, 'torpedo');
    expect(tv().last?.cells.at(-1)).toBe(firstShip);
    expect(tv().last?.cells.every((cell) => Math.floor(cell / SIZE) === row)).toBe(true);
    expect(tv().boards[1].shots[firstShip]).toBe('hit');
    shoot(1, waterCell(0));

    const taken = new Set(fleet(1).flatMap(shipCells));
    const scanAt = Array.from({ length: SIZE * SIZE }, (_, i) => i).find((i) => tv().boards[1].shots[i] === null)!;
    shoot(0, scanAt, 'sonar');
    const expected = weaponArea('sonar', scanAt).filter((cell) => taken.has(cell)).length;
    expect(tv().last).toMatchObject({ result: 'scan', count: expected });
    expect(tv().boards[1].scans).toEqual([{ cell: scanAt, count: expected }]);
    expect(tv().boards[1].shots[scanAt]).toBeNull();
    expect(tv().arsenal[0]).toEqual([]);
    expect(tv().turn).toBe(1);
  });

  it('can be played without special weapons', () => {
    const { tv, game } = battle({ specials: 0 });
    expect(tv().specials).toBe(false);
    game.act(0, { type: 'fire', cell: 0, weapon: 'bomb' });
    expect(tv().firing).toBeNull();
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
      test.clock.advance(60_000);
      expect(tv().phase).toBe('reveal');
      game.act(round % 2 ? 0 : 1, { type: 'next' });
    }
    expect(drawers).toEqual([0, 1, 0, 1, 0, 1]);
    expect(test.results).toHaveLength(1);
    expect(test.results[0].coop?.won).toBe(false);
    expect(phone(0).phase).toBe('reveal');
  });

  it('accepts the exact word even when it holds articles, after a close guess', () => {
    for (const word of ['galette des rois', 'faire la fête', 'poser un lapin', 'feu d’artifice', 'tir à la corde']) {
      expect(isAnswer(word, word).correct).toBe(true);
      expect(isAnswer(word.toUpperCase(), word).correct).toBe(true);
    }
    expect(isAnswer('faire fete', 'faire la fête').correct).toBe(true);
    expect(isAnswer('galette', 'galette des rois')).toEqual({ correct: false, near: true });
    expect(isAnswer('poser lapin', 'poser un lapin').correct).toBe(true);
    expect(isAnswer('chat', 'chien').correct).toBe(false);
  });

  it('keeps paint-bucket fills in the drawing, and undo removes them', () => {
    const { game, tv } = setup();
    game.act(0, { type: 'choose', index: 0 });
    game.act(0, { type: 'fill', id: 1, x: 500, y: 500, color: PALETTE[5] });
    game.act(0, { type: 'fill', id: 2, x: 500, y: 500, color: 'red' });
    game.act(0, { type: 'stroke', id: 3, color: PAPER, size: 36, points: [10, 10, 20, 20], end: true });
    expect(tv().strokes.map((stroke) => [stroke.fill ?? false, stroke.color])).toEqual([
      [true, PALETTE[5]],
      [false, PAPER],
    ]);
    game.act(0, { type: 'undo' });
    game.act(0, { type: 'undo' });
    expect(tv().strokes).toHaveLength(0);
  });

  it('follows the chosen number of rounds, drawing time and hints', () => {
    const test = createTestContext({ seed: 8, starter: 0, settings: { rounds: 4, time: 45, hints: 0 } });
    const game = sketch.create(test.ctx);
    const tv = () => game.tv() as SketchTv;
    expect(tv().rounds).toBe(4);
    game.act(0, { type: 'choose', index: 2 });
    expect(tv().total).toBe(45);
    const hidden = tv().pattern.replace(/[^_]/g, '').length;
    test.clock.advance(44_000);
    expect(tv().pattern.replace(/[^_]/g, '')).toHaveLength(hidden);
    test.clock.advance(2000);
    expect(tv().phase).toBe('reveal');
    for (let round = 1; round < 4; round++) {
      game.act(0, { type: 'next' });
      game.act(tv().drawer, { type: 'choose', index: 0 });
      game.act(tv().drawer, { type: 'skip' });
    }
    expect(tv().last).toBe(true);
    game.act(1, { type: 'next' });
    expect(test.results).toHaveLength(1);
  });
});
