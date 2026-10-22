import { describe, expect, it } from 'vitest';
import { guesswho, type GuessWhoPhone, type GuessWhoTv } from '../../src/lib/games/guesswho/logic';
import { describe as describePerson, PEOPLE } from '../../src/lib/games/guesswho/people';
import { CATEGORIES as BAC_CATEGORIES } from '../../src/lib/games/petitbac/categories';
import { petitbac, ROUNDS as BAC_ROUNDS, startsWith, type PetitBacPhone, type PetitBacTv } from '../../src/lib/games/petitbac/logic';
import type { Slot } from '../../src/lib/games/types';
import { createTestContext } from './helpers';

describe('Qui est-ce ?', () => {
  it('has a large cast of distinct suspects and readable descriptions', () => {
    expect(PEOPLE.length).toBeGreaterThanOrEqual(48);
    const looks = new Set(PEOPLE.map(({ name: _, ...look }) => JSON.stringify(look)));
    expect(looks.size).toBe(PEOPLE.length);
    expect(new Set(PEOPLE.map((person) => person.name)).size).toBe(PEOPLE.length);
    expect(describePerson(PEOPLE[2])[0]).toBe('Cheveux bouclés, roux');
    expect(describePerson(PEOPLE[24])[0]).toBe('Cheveux en couettes, blonds');
  });

  it('deals a different board of 24 suspects each game', () => {
    const board = (seed: number) => (guesswho.create(createTestContext({ seed }).ctx).tv() as GuessWhoTv).board;
    expect(board(1)).toHaveLength(24);
    expect(new Set(board(1)).size).toBe(24);
    expect(board(1)).not.toEqual(board(2));
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
    const wrong = (game.phone(1) as GuessWhoPhone).secret === 0 ? 1 : 0;
    game.act(0, { type: 'guess', person: wrong });
    expect((game.tv() as GuessWhoTv).winner).toBe(1);
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
      expect(tv().phase).toBe('recap');
      expect(tv().roundPoints).toEqual([45, 45]);
      test.clock.advance(120_000);
      expect(tv().phase).toBe('recap');
      game.act(round % 2 ? 1 : 0, { type: 'next' });
    }
    expect(test.results[0].scores).toEqual([135, 135]);
    expect((game.phone(0) as PetitBacPhone).scores).toEqual([135, 135]);
  });

  it('plays the chosen categories every round, for the chosen number of rounds and time', () => {
    const categories = ['Prénom', 'Pays', 'Truc qui colle'];
    const test = createTestContext({ seed: 3, settings: { categories, rounds: 2, time: 60 } });
    const game = petitbac.create(test.ctx);
    const tv = () => game.tv() as PetitBacTv;
    expect(tv().categories).toEqual(categories);
    expect(tv().total).toBe(60);
    game.act(0, { type: 'answers', list: ['a', 'b'] });
    expect(tv().filled).toEqual([0, 0]);
    test.clock.advance(61_000 + 3000);
    expect(tv().phase).toBe('review');
    game.act(0, { type: 'done' });
    game.act(1, { type: 'done' });
    game.act(0, { type: 'next' });
    expect(tv().round).toBe(1);
    expect(tv().categories).toEqual(categories);
    expect(tv().last).toBe(true);
  });

  it('falls back to six random categories when the settings are broken', () => {
    const test = createTestContext({ seed: 3, settings: { categories: ['Seule'], rounds: 99 } });
    const tv = petitbac.create(test.ctx).tv() as PetitBacTv;
    expect(tv.categories).toHaveLength(6);
    expect(tv.rounds).toBe(BAC_ROUNDS);
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
