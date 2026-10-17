import { describe, expect, it } from 'vitest';
import { buildDeck, layoutCard } from '../../src/lib/games/kifkif/deck';
import { kifkif, PENALTY_MS, PILE_SIZE, type KifKifPhone, type KifKifTv } from '../../src/lib/games/kifkif/logic';
import { SYMBOLS } from '../../src/lib/games/kifkif/symbols';
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
import { agents, generateKeys, TOKENS, type AgentsPhone, type AgentsTv, type KeyCell } from '../../src/lib/games/agents/logic';
import { sketch, ROUNDS, type SketchPhone, type SketchTv } from '../../src/lib/games/sketch/logic';
import { createRng } from '../../src/lib/random';
import { createTestContext } from './helpers';
import type { Slot } from '../../src/lib/games/types';

describe('Kif-Kif deck', () => {
  const deck = buildDeck();

  it('builds 57 cards of 8 distinct symbols', () => {
    expect(deck).toHaveLength(57);
    for (const card of deck) {
      expect(new Set(card).size).toBe(8);
      for (const symbol of card) expect(symbol).toBeGreaterThanOrEqual(0);
    }
    expect(new Set(deck.flat()).size).toBe(SYMBOLS.length);
  });

  it('shares exactly one symbol between any two cards', () => {
    for (let i = 0; i < deck.length; i++) {
      for (let j = i + 1; j < deck.length; j++) {
        const shared = deck[i].filter((symbol) => deck[j].includes(symbol));
        expect(shared).toHaveLength(1);
      }
    }
  });

  it('lays symbols out inside the card without overlapping', () => {
    const rng = createRng(7);
    for (const card of deck) {
      const items = layoutCard(card, rng);
      expect(items.map((item) => item.symbol).sort()).toEqual([...card].sort());
      for (const item of items) expect(Math.hypot(item.x, item.y) + item.size / 2).toBeLessThan(1);
      for (let a = 0; a < items.length; a++) {
        for (let b = a + 1; b < items.length; b++) {
          const distance = Math.hypot(items[a].x - items[b].x, items[a].y - items[b].y);
          expect(distance).toBeGreaterThan((items[a].size + items[b].size) / 2);
        }
      }
    }
  });
});

describe('Kif-Kif game', () => {
  const deck = buildDeck();

  function setup() {
    const test = createTestContext({ seed: 3 });
    const game = kifkif.create(test.ctx);
    const tv = () => game.tv() as KifKifTv;
    const phone = (slot: Slot) => game.phone(slot) as KifKifPhone;
    const common = (slot: Slot) => {
      const card = phone(slot).card;
      if (!card) throw new Error('no card');
      return deck[card.id].find((symbol) => deck[tv().center.id].includes(symbol)) as number;
    };
    return { test, game, tv, phone, common };
  }

  it('moves a matched card to the center', () => {
    const { game, tv, phone, common, test } = setup();
    const card = phone(0).card?.id;
    game.act(0, { type: 'tap', center: tv().center.id, symbol: common(0) });
    expect(tv().center.id).toBe(card);
    expect(tv().remaining).toEqual([PILE_SIZE - 1, PILE_SIZE]);
    expect(test.fx.some((event) => event.kind === 'match')).toBe(true);
  });

  it('locks a player after a wrong symbol and ignores stale taps', () => {
    const { game, tv, phone, common, test } = setup();
    const card = phone(1).card;
    const wrong = card?.items.find((item) => item.symbol !== common(1))?.symbol as number;
    game.act(1, { type: 'tap', center: tv().center.id, symbol: wrong });
    expect(phone(1).lockMs).toBe(PENALTY_MS);
    game.act(1, { type: 'tap', center: tv().center.id, symbol: common(1) });
    expect(tv().remaining[1]).toBe(PILE_SIZE);
    test.clock.advance(PENALTY_MS);
    const before = tv().center.id;
    game.act(1, { type: 'tap', center: before + 1000, symbol: common(1) });
    expect(tv().center.id).toBe(before);
    game.act(1, { type: 'tap', center: before, symbol: common(1) });
    expect(tv().remaining[1]).toBe(PILE_SIZE - 1);
  });

  it('declares the first player to empty their pile the winner', () => {
    const { game, tv, common, test } = setup();
    for (let i = 0; i < PILE_SIZE; i++) game.act(0, { type: 'tap', center: tv().center.id, symbol: common(0) });
    expect(tv().phase).toBe('over');
    test.clock.advance(5000);
    expect(test.results[0].winner).toBe(0);
  });
});

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

describe('Agents doubles', () => {
  it('generates crossed keys with the official distribution', () => {
    const [a, b] = generateKeys(createRng(9));
    const count = (key: KeyCell[], cell: KeyCell) => key.filter((value) => value === cell).length;
    for (const key of [a, b]) {
      expect(count(key, 'agent')).toBe(9);
      expect(count(key, 'assassin')).toBe(3);
      expect(count(key, 'neutral')).toBe(13);
    }
    expect(a.filter((cell, index) => cell === 'agent' || b[index] === 'agent')).toHaveLength(15);
    expect(a.filter((cell, index) => cell === 'agent' && b[index] === 'agent')).toHaveLength(3);
  });

  function setup() {
    const test = createTestContext({ seed: 21, starter: 0 });
    const game = agents.create(test.ctx);
    const tv = () => game.tv() as AgentsTv;
    const phone = (slot: Slot) => game.phone(slot) as AgentsPhone;
    const guess = (slot: Slot, tile: number) => {
      game.act(slot, { type: 'select', tile });
      game.act(slot, { type: 'confirm', tile });
      test.clock.advance(1000);
    };
    return { test, game, tv, phone, guess };
  }

  it('validates clues', () => {
    const { game, phone, tv } = setup();
    game.act(0, { type: 'clue', word: 'deux mots', count: 2 });
    expect(phone(0).error).toMatch(/seul mot/);
    game.act(0, { type: 'clue', word: tv().tiles[4].word.toLowerCase(), count: 2 });
    expect(phone(0).error).toMatch(/grille/);
    game.act(1, { type: 'clue', word: 'mer', count: 2 });
    expect(tv().phase).toBe('clue');
    game.act(0, { type: 'clue', word: 'mer', count: 2 });
    expect(tv().phase).toBe('guess');
    expect(tv().clue).toEqual({ word: 'MER', count: 2 });
    expect(phone(1).role).toBe('guessing');
    expect(phone(0).role).toBe('watching');
  });

  it('continues on agents, ends the turn on a bystander and loses on an assassin', () => {
    const { game, phone, tv, guess } = setup();
    const key = phone(0).myKey;
    game.act(0, { type: 'clue', word: 'mer', count: 3 });
    const agent = key.indexOf('agent');
    guess(1, agent);
    expect(tv().tiles[agent].found).toBe(true);
    expect(tv().phase).toBe('guess');
    expect(phone(1).canStop).toBe(true);
    const neutral = key.indexOf('neutral');
    guess(1, neutral);
    expect(tv().tiles[neutral].bystander[0]).toBe(true);
    expect(tv().tokens).toBe(TOKENS - 1);
    expect(tv().phase).toBe('clue');
    expect(tv().giver).toBe(1);
    const otherKey = phone(1).myKey;
    game.act(1, { type: 'clue', word: 'chat', count: 1 });
    const assassin = otherKey.indexOf('assassin');
    guess(0, assassin);
    expect(tv().phase).toBe('over');
    expect(tv().won).toBe(false);
    expect(tv().keys).not.toBeNull();
  });

  it('wins once all fifteen agents are found', () => {
    const { game, phone, tv, guess, test } = setup();
    const keys: [KeyCell[], KeyCell[]] = [phone(0).myKey, phone(1).myKey];
    let guard = 0;
    while (tv().phase !== 'over' && guard++ < 40) {
      const giver = tv().giver;
      const guesser: Slot = giver === 0 ? 1 : 0;
      game.act(giver, { type: 'clue', word: `indice`, count: 9 });
      const targets = keys[giver]
        .map((cell, index) => (cell === 'agent' && !tv().tiles[index].found ? index : -1))
        .filter((index) => index >= 0);
      for (const tile of targets) {
        if (tv().phase !== 'guess' || tv().giver !== giver) break;
        guess(guesser, tile);
      }
      if (tv().phase === 'guess') game.act(guesser, { type: 'stop' });
    }
    expect(tv().won).toBe(true);
    expect(tv().found).toBe(15);
    test.clock.advance(4000);
    expect(test.results[0].coop?.won).toBe(true);
  });

  it('enters sudden death when time tokens run out', () => {
    const { game, phone, tv, guess } = setup();
    for (let turn = 0; turn < TOKENS; turn++) {
      const giver = tv().giver;
      const guesser: Slot = giver === 0 ? 1 : 0;
      game.act(giver, { type: 'clue', word: 'rien', count: 1 });
      const key = phone(giver).myKey;
      const neutral = key.findIndex((cell, index) => cell === 'neutral' && !tv().tiles[index].bystander[giver] && !tv().tiles[index].found);
      guess(guesser, neutral);
    }
    expect(tv().phase).toBe('sudden');
    expect(phone(0).role).toBe('sudden');
    const partnerKey = phone(1).myKey;
    const agent = partnerKey.findIndex((cell, index) => cell === 'agent' && !tv().tiles[index].found);
    guess(0, agent);
    expect(tv().tiles[agent].found).toBe(true);
    const neutral = partnerKey.findIndex((cell, index) => cell === 'neutral' && !tv().tiles[index].bystander[1]);
    guess(0, neutral);
    expect(tv().phase).toBe('over');
    expect(tv().won).toBe(false);
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

  it('enforces single-stroke and straight-line modes', () => {
    const { game, tv, test } = setup();
    let guard = 0;
    while (tv().mode !== 'oneStroke' && guard++ < 50) {
      game.act(tv().drawer, { type: 'choose', index: 0 });
      game.act(tv().drawer, { type: 'skip' });
      test.clock.advance(5000);
      if (test.results.length) break;
    }
    if (tv().mode === 'oneStroke') {
      const current = tv().drawer;
      game.act(current, { type: 'choose', index: 0 });
      game.act(current, { type: 'stroke', id: 1, points: [1, 1, 2, 2], end: true });
      game.act(current, { type: 'stroke', id: 2, points: [5, 5, 6, 6], end: true });
      expect(tv().strokes).toHaveLength(1);
    }
  });
});
