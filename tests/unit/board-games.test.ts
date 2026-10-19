import { describe, expect, it } from 'vitest';
import { guesswho, type GuessWhoPhone, type GuessWhoTv } from '../../src/lib/games/guesswho/logic';
import { describe as describePerson, PEOPLE } from '../../src/lib/games/guesswho/people';
import { LENGTH, MAX_GUESSES, mastermind, score, type MastermindPhone, type MastermindTv } from '../../src/lib/games/mastermind/logic';
import { memory, PAIRS, type MemoryPhone, type MemoryTv } from '../../src/lib/games/memory/logic';
import { CATEGORIES as BAC_CATEGORIES } from '../../src/lib/games/petitbac/categories';
import { petitbac, ROUNDS as BAC_ROUNDS, startsWith, type PetitBacPhone, type PetitBacTv } from '../../src/lib/games/petitbac/logic';
import type { Slot } from '../../src/lib/games/types';
import { CATEGORIES, scoreFor, total, yams, type Sheet, type YamsTv } from '../../src/lib/games/yams/logic';
import { createTestContext } from './helpers';

describe('Qui est-ce ?', () => {
  it('has 24 distinct suspects and readable descriptions', () => {
    expect(PEOPLE).toHaveLength(24);
    const looks = new Set(PEOPLE.map(({ name: _, ...look }) => JSON.stringify(look)));
    expect(looks.size).toBe(24);
    expect(describePerson(PEOPLE[2])[0]).toBe('Cheveux bouclés, roux');
  });

  it('keeps secrets off the TV, lets players flip suspects and ends on a guess', () => {
    const test = createTestContext({ seed: 3, starter: 0 });
    const game = guesswho.create(test.ctx);
    const tv = () => game.tv() as GuessWhoTv;
    const phone = (slot: Slot) => game.phone(slot) as GuessWhoPhone;
    expect(tv().secrets).toBeNull();
    expect(phone(0).secret).not.toBe(phone(1).secret);
    game.act(1, { type: 'toggle', person: 4 });
    expect(tv().left).toEqual([24, 23]);
    game.act(1, { type: 'end' });
    expect(tv().turn).toBe(0);
    game.act(0, { type: 'end' });
    expect(tv().turn).toBe(1);
    game.act(1, { type: 'guess', person: phone(0).secret });
    expect(tv().phase).toBe('over');
    expect(tv().winner).toBe(1);
    test.clock.advance(4000);
    expect(test.results[0].winner).toBe(1);
  });

  it('makes a wrong guess lose the game', () => {
    const test = createTestContext({ seed: 5, starter: 0 });
    const game = guesswho.create(test.ctx);
    const wrong = PEOPLE.findIndex((_, index) => index !== (game.phone(1) as GuessWhoPhone).secret);
    game.act(0, { type: 'guess', person: wrong });
    expect((game.tv() as GuessWhoTv).winner).toBe(1);
  });
});

describe('Code secret', () => {
  it('scores well-placed and misplaced pegs like the board game', () => {
    expect(score([0, 1, 2, 3], [0, 1, 2, 3])).toEqual({ exact: 4, near: 0 });
    expect(score([0, 1, 2, 3], [3, 2, 1, 0])).toEqual({ exact: 0, near: 4 });
    expect(score([0, 0, 1, 1], [0, 1, 0, 2])).toEqual({ exact: 1, near: 2 });
    expect(score([5, 5, 5, 5], [5, 0, 0, 0])).toEqual({ exact: 1, near: 0 });
  });

  function setup() {
    const test = createTestContext({ seed: 2, starter: 0 });
    const game = mastermind.create(test.ctx);
    game.act(0, { type: 'code', pegs: [1, 2, 3, 4] });
    game.act(1, { type: 'code', pegs: [0, 0, 5, 5] });
    return { test, game, tv: () => game.tv() as MastermindTv, phone: (slot: Slot) => game.phone(slot) as MastermindPhone };
  }

  it('hides the codes and gives the second player a last chance', () => {
    const { game, tv, test, phone } = setup();
    expect(tv().phase).toBe('play');
    expect(tv().codes).toBeNull();
    expect(phone(0).theirCode).toBeNull();
    game.act(1, { type: 'guess', pegs: [1, 2, 3, 4] });
    expect(tv().guesses[1]).toHaveLength(0);
    game.act(0, { type: 'guess', pegs: [0, 0, 5, 5] });
    expect(tv().phase).toBe('play');
    expect(tv().turn).toBe(1);
    game.act(1, { type: 'guess', pegs: [1, 2, 3, 4] });
    expect(tv().phase).toBe('over');
    expect(tv().winner).toBeNull();
    test.clock.advance(4000);
    expect(test.results[0].winner).toBeNull();
  });

  it('declares the first to crack the code, after equal tries', () => {
    const { game, tv } = setup();
    game.act(0, { type: 'guess', pegs: [0, 0, 5, 5] });
    game.act(1, { type: 'guess', pegs: [4, 3, 2, 1] });
    expect(tv().winner).toBe(0);
    expect(tv().guesses[1][0]).toMatchObject({ exact: 0, near: LENGTH });
  });

  it('ends in a draw when nobody cracks the code', () => {
    const { game, tv } = setup();
    for (let i = 0; i < MAX_GUESSES; i++) {
      game.act(0, { type: 'guess', pegs: [1, 1, 1, 1] });
      game.act(1, { type: 'guess', pegs: [0, 0, 0, 0] });
    }
    expect(tv().phase).toBe('over');
    expect(tv().winner).toBeNull();
  });
});

describe('Petit Bac', () => {
  it('checks the first letter, ignoring articles and accents', () => {
    expect(startsWith('Éléphant', 'E')).toBe(true);
    expect(startsWith('le chat', 'C')).toBe(true);
    expect(startsWith('C', 'C')).toBe(false);
    expect(startsWith('', 'C')).toBe(false);
    expect(BAC_CATEGORIES.length).toBeGreaterThan(80);
  });

  it('scores unique, shared and vetoed answers, over all rounds', () => {
    const test = createTestContext({ seed: 7 });
    const game = petitbac.create(test.ctx);
    const tv = () => game.tv() as PetitBacTv;
    for (let round = 0; round < BAC_ROUNDS; round++) {
      const letter = tv().letter;
      const words = (suffix: string) => Array.from({ length: 6 }, (_, i) => `${letter}${suffix}${i}`);
      const mine = words('aaa');
      const theirs = words('bbb');
      theirs[0] = mine[0];
      theirs[1] = 'zzz';
      game.act(0, { type: 'answers', list: mine });
      game.act(1, { type: 'answers', list: theirs });
      game.act(1, { type: 'stop' });
      expect(tv().phase).toBe('write');
      game.act(0, { type: 'stop' });
      expect(tv().phase).toBe('stop');
      expect(tv().stopper).toBe(0);
      test.clock.advance(3000);
      expect(tv().phase).toBe('review');
      game.act(1, { type: 'veto', index: 2 });
      const grid = tv().grid!;
      expect(grid[0][0].points).toBe(5);
      expect(grid[1][1].points).toBe(0);
      expect(grid[0][2]).toMatchObject({ vetoed: true, points: 0 });
      expect(tv().roundPoints).toEqual([5 + 10 * 4, 5 + 10 * 4]);
      game.act(0, { type: 'done' });
      game.act(1, { type: 'done' });
    }
    expect(test.results[0].scores).toEqual([135, 135]);
    expect((game.phone(0) as PetitBacPhone).scores).toEqual([135, 135]);
  });

  it('stops the round on its own when time runs out', () => {
    const test = createTestContext({ seed: 1 });
    const game = petitbac.create(test.ctx);
    test.clock.advance(91_000);
    expect((game.tv() as PetitBacTv).phase).toBe('stop');
    test.clock.advance(3000);
    expect((game.tv() as PetitBacTv).phase).toBe('review');
  });
});

describe('Yams', () => {
  it('scores every combination', () => {
    expect(scoreFor('threes', [3, 3, 1, 3, 6])).toBe(9);
    expect(scoreFor('brelan', [3, 3, 1, 3, 6])).toBe(16);
    expect(scoreFor('carre', [3, 3, 1, 3, 6])).toBe(0);
    expect(scoreFor('full', [2, 2, 5, 5, 5])).toBe(25);
    expect(scoreFor('full', [5, 5, 5, 5, 5])).toBe(0);
    expect(scoreFor('small', [1, 2, 3, 4, 6])).toBe(30);
    expect(scoreFor('small', [1, 2, 3, 5, 6])).toBe(0);
    expect(scoreFor('large', [6, 2, 3, 4, 5])).toBe(40);
    expect(scoreFor('yams', [4, 4, 4, 4, 4])).toBe(50);
    expect(scoreFor('chance', [1, 2, 3, 4, 6])).toBe(16);
    const sheet = Object.fromEntries(CATEGORIES.map((c) => [c.id, 0])) as Sheet;
    Object.assign(sheet, { ones: 3, twos: 6, threes: 9, fours: 12, fives: 15, sixes: 18 });
    expect(total(sheet)).toBe(63 + 35);
  });

  it('requires a roll, limits rolls to three and plays a full game', () => {
    const test = createTestContext({ seed: 4, starter: 0 });
    const game = yams.create(test.ctx);
    const tv = () => game.tv() as YamsTv;
    game.act(0, { type: 'score', category: 'chance' });
    expect(tv().sheets[0].chance).toBeNull();
    game.act(0, { type: 'roll' });
    game.act(0, { type: 'hold', index: 0 });
    const kept = tv().dice[0];
    game.act(0, { type: 'roll' });
    game.act(0, { type: 'roll' });
    game.act(0, { type: 'roll' });
    expect(tv().rollsLeft).toBe(0);
    expect(tv().dice[0]).toBe(kept);
    let guard = 0;
    while (tv().phase === 'play' && guard++ < 40) {
      const current = tv().turn;
      if (tv().rollsLeft === 3) game.act(current, { type: 'roll' });
      const open = CATEGORIES.find((category) => tv().sheets[current][category.id] === null)!;
      game.act(current, { type: 'score', category: open.id });
    }
    expect(tv().phase).toBe('over');
    test.clock.advance(3000);
    const [a, b] = tv().totals;
    expect(test.results[0].scores).toEqual([a, b]);
  });
});

describe('Memory', () => {
  it('keeps the turn on a match, passes it on a miss, and ends when all pairs are found', () => {
    const test = createTestContext({ seed: 8, starter: 0 });
    const game = memory.create(test.ctx);
    const tv = () => game.tv() as MemoryTv;
    expect(tv().cards).toHaveLength(PAIRS * 2);
    expect(tv().cards.every((card) => card.symbol === null)).toBe(true);
    // Peek at the symbols through flips to find pairs.
    const symbols: number[] = [];
    for (let i = 0; i < PAIRS * 2; i += 2) {
      const current = tv().turn;
      game.act(current, { type: 'flip', card: i });
      game.act(current, { type: 'flip', card: i + 1 });
      symbols[i] = tv().cards[i].symbol!;
      symbols[i + 1] = tv().cards[i + 1].symbol!;
      test.clock.advance(2000);
    }
    let guard = 0;
    while (tv().phase === 'play' && guard++ < 50) {
      const current = tv().turn;
      const open = tv()
        .cards.map((card, index) => (card.found === null ? index : -1))
        .filter((index) => index >= 0);
      const first = open[0];
      const second = open.find((index) => index !== first && symbols[index] === symbols[first])!;
      game.act(current, { type: 'flip', card: first });
      game.act(current, { type: 'flip', card: second });
      expect(tv().last?.match).toBe(true);
      test.clock.advance(1000);
      expect(tv().turn).toBe(current);
    }
    expect(tv().phase).toBe('over');
    expect(tv().scores[0] + tv().scores[1]).toBe(PAIRS);
    test.clock.advance(3000);
    expect(test.results).toHaveLength(1);
    expect((game.phone(0) as MemoryPhone).myTurn).toBe(false);
  });
});
