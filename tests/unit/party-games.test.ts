import { describe, expect, it } from 'vitest';
import { bluff, FIND_POINTS, FOOL_POINTS, type BluffPhone, type BluffTv } from '../../src/lib/games/bluff/logic';
import { RARE_WORDS } from '../../src/lib/games/bluff/words';
import { buildGrid, wordCells } from '../../src/lib/games/crossword/grid';
import { crossword, HINT_COST, toLetters, WORD_POINTS, type CrosswordPhone, type CrosswordTv } from '../../src/lib/games/crossword/logic';
import { ENTRIES } from '../../src/lib/games/crossword/words';
import { telephone, type TelephonePage, type TelephonePhone, type TelephoneTv } from '../../src/lib/games/telephone/logic';
import { CATALOG, GAME_ORDER } from '../../src/lib/games/catalog';
import { heart, type HeartPhone, type HeartTv } from '../../src/lib/games/heart/logic';
import { HEART_QUESTIONS } from '../../src/lib/games/heart/questions';
import { memories, type MemoriesTv } from '../../src/lib/games/memories/logic';
import { MEMORY_QUESTIONS } from '../../src/lib/games/memories/questions';
import { sweet, type SweetTv } from '../../src/lib/games/sweet/logic';
import { SWEET_PROMPTS } from '../../src/lib/games/sweet/prompts';
import { pointsFor, wavelength, type WavelengthPhone, type WavelengthTv } from '../../src/lib/games/wavelength/logic';
import { SPECTRUMS } from '../../src/lib/games/wavelength/spectrums';
import { createRng } from '../../src/lib/random';
import type { Slot } from '../../src/lib/games/types';
import { createTestContext } from './helpers';

it('lists every game of the catalog in the menu, once', () => {
  expect([...GAME_ORDER].sort()).toEqual(Object.keys(CATALOG).sort());
});

describe('Dessin téléphone', () => {
  function setup(settings = {}) {
    const test = createTestContext({ seed: 3, starter: 0, settings });
    const game = telephone.create(test.ctx);
    const tv = () => game.tv() as TelephoneTv;
    const phone = (slot: Slot) => game.phone(slot) as TelephonePhone;
    return { test, game, tv, phone };
  }

  const strokesOf = (page: TelephonePage) => (page.kind === 'drawing' ? page.strokes : null);
  const line = (id: number) => ({ type: 'stroke', id, color: '#1d1612', size: 10, points: [10, 10, 200, 200], end: true });

  it('passes words and drawings between notebooks so nobody guesses their own word', () => {
    const { game, tv, phone } = setup({ steps: 4 });
    game.act(0, { type: 'start', text: 'Licorne' });
    game.act(1, { type: 'start', index: 1 });
    const second = (phone(1) as Extract<TelephonePhone, { task: 'draw' }>).prompt;
    expect(tv().phase).toBe('draw');
    expect(phone(0)).toMatchObject({ task: 'draw', prompt: 'Licorne' });

    game.act(0, line(1));
    game.act(0, { type: 'done' });
    game.act(1, line(1));
    game.act(1, line(2));
    game.act(1, { type: 'done' });
    expect(tv().phase).toBe('write');
    const write = phone(1);
    if (write.task !== 'write') throw new Error('expected write');
    expect(write.drawing).toHaveLength(1);
    expect(JSON.stringify(phone(1))).not.toContain('Licorne');

    game.act(1, { type: 'write', text: 'Cheval' });
    game.act(0, { type: 'write', text: 'Dragon' });
    expect(phone(0)).toMatchObject({ task: 'draw', prompt: 'Cheval' });
    expect(phone(1)).toMatchObject({ task: 'draw', prompt: 'Dragon' });
    expect(tv().pages).toEqual([]);
    expect(JSON.stringify(tv())).not.toContain(second);
  });

  it('moves on when the drawing time runs out, then shows each notebook page by page at the players’ pace', () => {
    const { game, tv, test } = setup({ steps: 2, time: 45 });
    game.act(0, { type: 'start', text: 'Chat' });
    game.act(1, { type: 'start', text: 'Lune' });
    game.act(0, line(1));
    test.clock.advance(45_000);
    expect(tv().phase).toBe('write');
    game.act(0, { type: 'write', text: 'Fromage' });
    game.act(1, { type: 'write', text: 'Tigre' });
    expect(tv()).toMatchObject({ phase: 'show', chain: 0, page: 0, length: 3 });
    expect(tv().pages[0]).toMatchObject({ kind: 'text', text: 'Chat' });
    test.clock.advance(120_000);
    expect(tv().page).toBe(0);
    game.act(1, { type: 'next' });
    expect(tv().pages[1]).toMatchObject({ kind: 'drawing', by: 0 });
    expect(strokesOf(tv().pages[1])).toHaveLength(1);
    game.act(0, { type: 'next' });
    expect(tv().pages[2]).toMatchObject({ kind: 'text', text: 'Tigre', by: 1 });
    game.act(0, { type: 'next' });
    expect(tv()).toMatchObject({ chain: 1, page: 0 });
    game.act(0, { type: 'next' });
    expect(strokesOf(tv().pages[1])).toHaveLength(0);
    game.act(0, { type: 'next' });
    expect(tv().last).toBe(true);
    game.act(1, { type: 'next' });
    expect(test.results[0]).toMatchObject({ winner: null, coop: { won: true } });
    expect(test.results[0].detail).toContain('« Chat » est devenu « Tigre »');
  });

  it('ignores drawing from someone who already handed in, and empty words', () => {
    const { game, tv } = setup();
    game.act(0, { type: 'start', text: '   ' });
    expect(tv().done).toEqual([false, false]);
    game.act(0, { type: 'start', index: 0 });
    game.act(1, { type: 'start', index: 0 });
    game.act(0, { type: 'done' });
    game.act(0, line(1));
    game.act(1, { type: 'done' });
    game.act(1, { type: 'write', text: 'Rien' });
    expect(tv().done).toEqual([false, true]);
  });
});

describe('Mots croisés', () => {
  it('has clean answers and clues', () => {
    expect(ENTRIES.length).toBeGreaterThan(300);
    for (const entry of ENTRIES) expect(entry.word).toMatch(/^[A-Z]{2,12}$/);
    expect(new Set(ENTRIES.map((entry) => entry.word)).size).toBe(ENTRIES.length);
  });

  it('builds connected grids where crossing words agree and no words touch side by side', () => {
    for (let seed = 0; seed < 40; seed++) {
      const grid = buildGrid(createRng(seed), ENTRIES, 12);
      expect(grid.words.length).toBeGreaterThanOrEqual(11);
      expect(grid.rows).toBeLessThanOrEqual(13);
      expect(grid.cols).toBeLessThanOrEqual(13);
      for (const word of grid.words) {
        expect(
          wordCells(word, grid.cols)
            .map((cell) => grid.cells[cell])
            .join(''),
        ).toBe(word.word);
      }
      // Every run of letters in the grid, across or down, is one of the placed words.
      const runs: string[] = [];
      for (let r = 0; r < grid.rows; r++) {
        const line = Array.from({ length: grid.cols }, (_, c) => grid.cells[r * grid.cols + c] ?? ' ').join('');
        runs.push(...line.split(' ').filter((run) => run.length > 1));
      }
      for (let c = 0; c < grid.cols; c++) {
        const line = Array.from({ length: grid.rows }, (_, r) => grid.cells[r * grid.cols + c] ?? ' ').join('');
        runs.push(...line.split(' ').filter((run) => run.length > 1));
      }
      expect(runs.sort()).toEqual(grid.words.map((word) => word.word).sort());
    }
  });

  function setup(settings = {}) {
    const test = createTestContext({ seed: 4, settings });
    const game = crossword.create(test.ctx);
    const tv = () => game.tv() as CrosswordTv;
    const phone = (slot: Slot) => game.phone(slot) as CrosswordPhone;
    return { test, game, tv, phone };
  }

  it('deals each clue to one player and lets only them answer it', () => {
    const { game, tv, phone } = setup();
    const clue = phone(0).clues.find((candidate) => candidate.owner === 1)!;
    expect(clue.clue).toBeNull();
    expect(phone(1).clues[clue.id].clue).not.toBeNull();
    const answer = ENTRIES.find((entry) => entry.clue === phone(1).clues[clue.id].clue)!.word;
    game.act(0, { type: 'answer', id: clue.id, text: answer });
    expect(tv().found).toBe(0);
    game.act(1, { type: 'answer', id: clue.id, text: 'nope' });
    expect(phone(1).wrong?.id).toBe(clue.id);
    game.act(1, { type: 'answer', id: clue.id, text: answer.toLowerCase() });
    expect(tv().found).toBeGreaterThanOrEqual(1);
    expect(phone(0).clues[clue.id].pattern.join('')).toBe(answer);
    expect(tv().score).toBe(tv().found * WORD_POINTS);
  });

  it('reveals a letter for a few points, and ends on a full grid once the players move on', () => {
    const { game, tv, phone, test } = setup({ split: 0, size: 8 });
    const first = phone(0).clues[0];
    game.act(0, { type: 'hint', id: 0 });
    expect(phone(0).clues[0].pattern.filter(Boolean)).toHaveLength(first.pattern.filter(Boolean).length + 1);
    for (const clue of phone(0).clues) {
      const answer = ENTRIES.find((entry) => entry.clue === clue.clue)!.word;
      game.act(clue.id % 2 === 0 ? 0 : 1, { type: 'answer', id: clue.id, text: answer });
    }
    expect(tv()).toMatchObject({ phase: 'done', complete: true });
    expect(tv().score).toBe(tv().total * WORD_POINTS - HINT_COST);
    expect(test.results).toHaveLength(0);
    game.act(1, { type: 'next' });
    expect(test.results[0].coop).toEqual({ won: true, score: tv().score });
  });

  it('shows the solution when time runs out', () => {
    const { tv, test } = setup({ time: 5 });
    test.clock.advance(5 * 60_000 + 1000);
    expect(tv().phase).toBe('done');
    expect(tv().letters.filter(Boolean).length).toBe(tv().blocks.filter((block) => !block).length);
  });

  it('reads answers the way crosswords spell them', () => {
    expect(toLetters('Éléphant ')).toBe('ELEPHANT');
    expect(toLetters('cœur')).toBe('COEUR');
    expect(toLetters("l'été")).toBe('LETE');
  });
});

describe('Le menteur', () => {
  function setup(settings = {}) {
    const test = createTestContext({ seed: 6, settings });
    const game = bluff.create(test.ctx);
    const tv = () => game.tv() as BluffTv;
    const phone = (slot: Slot) => game.phone(slot) as BluffPhone;
    return { test, game, tv, phone };
  }

  it('has a big bank of rare words with natures and definitions', () => {
    expect(RARE_WORDS.length).toBeGreaterThan(100);
    for (const entry of RARE_WORDS) {
      expect(entry.nature).toBeTruthy();
      expect(entry.definition.length).toBeGreaterThan(5);
    }
    expect(new Set(RARE_WORDS.map((entry) => entry.word)).size).toBe(RARE_WORDS.length);
  });

  it('mixes both bluffs with the real definition and a decoy, and scores the votes', () => {
    const { game, tv, phone, test } = setup();
    const real = RARE_WORDS.find((entry) => entry.word === tv().word)!.definition;
    game.act(0, { type: 'write', text: 'petit gâteau breton' });
    expect(tv().ready).toEqual([true, false]);
    expect(tv().options).toEqual([]);
    game.act(1, { type: 'write', text: 'oiseau des marais' });
    expect(tv().phase).toBe('vote');
    expect(tv().options).toHaveLength(4);
    expect(tv().options.every((option) => option.author === null)).toBe(true);
    const own = phone(0).own!;
    expect(phone(0).options[own].text).toBe('Petit gâteau breton');
    game.act(0, { type: 'vote', option: own });
    expect(phone(0).vote).toBeNull();
    const realIndex = tv().options.findIndex((option) => option.text === real);
    game.act(0, { type: 'vote', option: realIndex });
    game.act(1, { type: 'vote', option: own });
    expect(tv().phase).toBe('reveal');
    expect(tv().scores).toEqual([FIND_POINTS + FOOL_POINTS, 0]);
    expect(tv().options[realIndex].author).toBe('real');
    expect(tv().options.filter((option) => option.author === 'decoy')).toHaveLength(1);
    test.clock.advance(300_000);
    expect(tv().phase).toBe('reveal');
    game.act(1, { type: 'next' });
    expect(tv()).toMatchObject({ phase: 'write', round: 1 });
  });

  it('always offers four definitions, whatever the word', () => {
    for (let seed = 0; seed < 300; seed++) {
      const test = createTestContext({ seed });
      const game = bluff.create(test.ctx);
      game.act(0, { type: 'write', text: 'a' });
      game.act(1, { type: 'write', text: 'b' });
      expect((game.tv() as BluffTv).options).toHaveLength(4);
    }
  });

  it('fills in with a decoy when someone runs out of time, and finishes after the last word', () => {
    const { game, tv, test } = setup({ rounds: 3, time: 60 });
    for (let round = 0; round < 3; round++) {
      game.act(0, { type: 'write', text: 'une invention' });
      test.clock.advance(60_000);
      expect(tv().phase).toBe('vote');
      expect(tv().options).toHaveLength(4);
      game.act(0, { type: 'vote', option: tv().options.findIndex((option) => option.text !== 'Une invention') });
      game.act(1, { type: 'vote', option: 0 });
      game.act(0, { type: 'next' });
    }
    expect(test.results).toHaveLength(1);
  });
});

describe('Jeux de couple', () => {
  it('have plenty of distinct questions', () => {
    for (const bank of [HEART_QUESTIONS, MEMORY_QUESTIONS, SWEET_PROMPTS]) {
      expect(bank.length).toBeGreaterThan(30);
      expect(new Set(bank).size).toBe(bank.length);
    }
  });

  it('Je te connais par cœur: hides answers until both wrote, and only the one asked can judge', () => {
    const test = createTestContext({ seed: 2, starter: 0, settings: { rounds: 6 } });
    const game = heart.create(test.ctx);
    const tv = () => game.tv() as HeartTv;
    expect(tv().subject).toBe(0);
    expect((game.phone(1) as HeartPhone).role).toBe('guesser');
    game.act(0, { type: 'write', text: 'Les lasagnes' });
    expect(tv().answer).toBeNull();
    expect(tv().written).toEqual([true, false]);
    game.act(1, { type: 'write', text: 'La pizza' });
    expect(tv()).toMatchObject({ phase: 'reveal', answer: 'Les lasagnes', guess: 'La pizza' });
    test.clock.advance(600_000);
    expect(tv().phase).toBe('reveal');
    game.act(1, { type: 'judge', verdict: 'right' });
    expect(tv().phase).toBe('reveal');
    game.act(0, { type: 'judge', verdict: 'close' });
    expect(tv()).toMatchObject({ round: 1, subject: 1, scores: [0, 1] });
    for (let round = 1; round < 6; round++) {
      const subject = tv().subject;
      game.act(0, { type: 'write', text: 'a' });
      game.act(1, { type: 'write', text: 'b' });
      game.act(subject, { type: 'judge', verdict: 'right' });
    }
    expect(test.results[0]).toMatchObject({ scores: [6, 5], winner: 0 });
  });

  it('Nos souvenirs: compares both versions and lets either partner settle it', () => {
    const test = createTestContext({ seed: 2, settings: { rounds: 5 } });
    const game = memories.create(test.ctx);
    const tv = () => game.tv() as MemoriesTv;
    game.act(1, { type: 'write', text: 'Au café' });
    expect(tv().answers).toBeNull();
    game.act(0, { type: 'write', text: 'Au cinéma' });
    expect(tv().answers).toEqual(['Au cinéma', 'Au café']);
    game.act(1, { type: 'match', match: 'close' });
    expect(tv()).toMatchObject({ round: 1, score: 1, phase: 'answer' });
    for (let round = 1; round < 5; round++) {
      game.act(0, { type: 'write', text: 'x' });
      game.act(1, { type: 'write', text: 'x' });
      game.act(0, { type: 'match', match: 'same' });
    }
    expect(test.results[0].coop).toEqual({ won: true, score: 9 });
  });

  it('Mots doux: reveals both notes together, then gathers them all in a notebook', () => {
    const test = createTestContext({ seed: 2, settings: { rounds: 3, letter: 1 } });
    const game = sweet.create(test.ctx);
    const tv = () => game.tv() as SweetTv;
    expect(tv().letter).toMatch(/^[A-Z]$/);
    for (let round = 0; round < 3; round++) {
      game.act(0, { type: 'write', text: `ton sourire ${round}` });
      expect(tv().texts).toBeNull();
      game.act(1, { type: 'write', text: `tes yeux ${round}` });
      expect(tv().texts).toEqual([`ton sourire ${round}`, `tes yeux ${round}`]);
      game.act(round % 2 === 0 ? 1 : 0, { type: 'next' });
    }
    expect(tv().phase).toBe('book');
    expect(tv().book.map((page) => page.texts[1])).toEqual(['tes yeux 0', 'tes yeux 1', 'tes yeux 2']);
    expect(test.results).toHaveLength(0);
    game.act(0, { type: 'next' });
    expect(test.results[0].coop).toEqual({ won: true });
  });
});

describe('Même longueur d’onde', () => {
  function setup(settings = {}) {
    const test = createTestContext({ seed: 5, starter: 0, settings });
    const game = wavelength.create(test.ctx);
    const tv = () => game.tv() as WavelengthTv;
    const phone = (slot: Slot) => game.phone(slot) as WavelengthPhone;
    return { test, game, tv, phone };
  }

  it('has lots of distinct spectrums and scores by distance', () => {
    expect(SPECTRUMS.length).toBeGreaterThan(60);
    expect(new Set(SPECTRUMS.map((s) => `${s.left}|${s.right}`)).size).toBe(SPECTRUMS.length);
    expect(pointsFor(50, 50)).toBe(4);
    expect(pointsFor(53, 50)).toBe(4);
    expect(pointsFor(59, 50)).toBe(3);
    expect(pointsFor(35, 50)).toBe(2);
    expect(pointsFor(30, 50)).toBe(0);
  });

  it('shows the target only to the psychic, moves the needle live, and waits after the reveal', () => {
    const { game, tv, phone, test } = setup();
    expect(phone(0).role).toBe('psychic');
    const target = phone(0).target!;
    expect(target).toBeGreaterThanOrEqual(4);
    expect(phone(1).target).toBeNull();
    expect(tv().target).toBeNull();
    game.act(1, { type: 'clue', text: 'triche' });
    expect(tv().phase).toBe('clue');
    game.act(0, { type: 'clue', text: '  Une soupe de mamie ' });
    expect(tv()).toMatchObject({ phase: 'guess', clue: 'Une soupe de mamie' });
    game.act(0, { type: 'lock', value: target });
    expect(tv().phase).toBe('guess');
    game.act(1, { type: 'aim', value: 12 });
    expect(tv().needle).toBe(12);
    game.act(1, { type: 'aim', value: 140 });
    expect(tv().needle).toBe(12);
    game.act(1, { type: 'lock', value: target });
    expect(tv()).toMatchObject({ phase: 'reveal', target, points: 4, score: 4 });
    test.clock.advance(600_000);
    expect(tv().phase).toBe('reveal');
    game.act(1, { type: 'next' });
    expect(tv()).toMatchObject({ phase: 'clue', round: 1, psychic: 1, needle: 50 });
  });

  it('plays the chosen number of rounds as a team', () => {
    const { game, tv, test } = setup({ rounds: 6 });
    for (let round = 0; round < 6; round++) {
      const psychic = tv().psychic;
      game.act(psychic, { type: 'clue', text: 'indice' });
      game.act(psychic === 0 ? 1 : 0, { type: 'lock', value: 0 });
      game.act(0, { type: 'next' });
    }
    expect(test.results).toHaveLength(1);
    expect(test.results[0].coop?.score).toBe(tv().score);
  });
});
