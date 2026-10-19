import { describe, expect, it } from 'vitest';
import { couple, ROUNDS as COUPLE_ROUNDS, type CouplePhone, type CoupleTv } from '../../src/lib/games/couple/logic';
import { PREFER_PROMPTS, WHO_PROMPTS } from '../../src/lib/games/couple/prompts';
import { DeckHistory, type HistoryStore } from '../../src/lib/games/deck';
import { QUESTIONS } from '../../src/lib/games/quiz/questions';
import { ANSWER_SECONDS, QUESTION_COUNT, quiz, type QuizPhone, type QuizTv } from '../../src/lib/games/quiz/logic';
import { flipsFor, initialBoard, legalMoves, reversi, SIZE, type ReversiTv } from '../../src/lib/games/reversi/logic';
import { SKETCH_WORDS } from '../../src/lib/games/sketch/words';
import { CARDS } from '../../src/lib/games/taboo/cards';
import { taboo, TURN_SECONDS, TURNS, type TabooPhone, type TabooTv } from '../../src/lib/games/taboo/logic';
import type { Slot } from '../../src/lib/games/types';
import { createRng } from '../../src/lib/random';
import { createTestContext } from './helpers';

describe('Pioche sans répétition', () => {
  function memoryStore(): HistoryStore & { data: Record<string, string[]> } {
    const data: Record<string, string[]> = {};
    return { data, load: (deck) => data[deck] ?? [], save: (deck, keys) => (data[deck] = keys) };
  }

  it('deals every item once before repeating, even across games', () => {
    const store = memoryStore();
    const pool = Array.from({ length: 30 }, (_, i) => `mot${i}`);
    const first = new DeckHistory(store);
    const seen = new Set<string>();
    for (let i = 0; i < 20; i++) seen.add(first.draw('test', pool, (w) => w, createRng(i)));
    const second = new DeckHistory(store);
    for (let i = 0; i < 10; i++) seen.add(second.draw('test', pool, (w) => w, createRng(100 + i)));
    expect(seen.size).toBe(30);
  });

  it('keeps going once the pool is exhausted, starting with the oldest items', () => {
    const decks = new DeckHistory();
    const pool = ['a', 'b', 'c', 'd'];
    const rng = createRng(3);
    const dealt = Array.from({ length: 4 }, () => decks.draw('x', pool, (w) => w, rng));
    const next = decks.draw('x', pool, (w) => w, rng);
    expect(dealt.slice(0, 2)).toContain(next);
  });
});

describe('Banques de contenu', () => {
  it('has lots of unique content', () => {
    const words = [...SKETCH_WORDS[1], ...SKETCH_WORDS[2], ...SKETCH_WORDS[3]].map((w) => w.toLowerCase());
    expect(words.length).toBeGreaterThan(1000);
    expect(new Set(words).size).toBe(words.length);
    expect(QUESTIONS.length).toBeGreaterThan(450);
    expect(new Set(QUESTIONS.map((q) => q.text)).size).toBe(QUESTIONS.length);
    for (const q of QUESTIONS) expect(new Set([q.answer, ...q.wrong]).size).toBe(4);
    expect(WHO_PROMPTS.length + PREFER_PROMPTS.length).toBeGreaterThan(300);
    expect(CARDS.length).toBeGreaterThan(350);
    expect(new Set(CARDS.map((card) => card.word.toLowerCase())).size).toBe(CARDS.length);
  });
});

describe('Quiz', () => {
  function setup() {
    const test = createTestContext({ seed: 4 });
    const game = quiz.create(test.ctx);
    return { test, game, tv: () => game.tv() as QuizTv, phone: (slot: Slot) => game.phone(slot) as QuizPhone };
  }

  it('hides the answer until both have locked in, then rewards speed', () => {
    const { game, tv, phone, test } = setup();
    expect(tv().answer).toBeNull();
    const question = QUESTIONS.find((q) => q.text === tv().text);
    const right = tv().choices.indexOf(question!.answer);
    const wrongChoice = (right + 1) % 4;
    test.clock.advance(2000);
    game.act(0, { type: 'answer', choice: right });
    game.act(0, { type: 'answer', choice: wrongChoice });
    expect(phone(0).mine).toBe(right);
    expect(tv().locked).toEqual([true, false]);
    test.clock.advance(8000);
    game.act(1, { type: 'answer', choice: right });
    test.clock.advance(1000);
    expect(tv().phase).toBe('reveal');
    expect(tv().answer).toBe(right);
    const [fast, slow] = tv().scores;
    expect(fast).toBeGreaterThan(slow);
    expect(slow).toBeGreaterThanOrEqual(10);
  });

  it('plays all questions without repeats and doubles the last one', () => {
    const { game, tv, test } = setup();
    const texts = new Set<string>();
    let lastGain = 0;
    for (let i = 0; i < QUESTION_COUNT; i++) {
      texts.add(tv().text);
      const question = QUESTIONS.find((q) => q.text === tv().text)!;
      const before = tv().scores[0];
      game.act(0, { type: 'answer', choice: tv().choices.indexOf(question.answer) });
      test.clock.advance(ANSWER_SECONDS * 1000);
      lastGain = tv().scores[0] - before;
      test.clock.advance(6000);
    }
    expect(texts.size).toBe(QUESTION_COUNT);
    expect(lastGain).toBeGreaterThanOrEqual(20);
    expect(test.results).toHaveLength(1);
    expect(test.results[0].winner).toBe(0);
  });
});

describe('Qui de nous deux ?', () => {
  it('counts a point when both answers match and keeps answers secret until the reveal', () => {
    const test = createTestContext({ seed: 2 });
    const game = couple.create(test.ctx);
    const tv = () => game.tv() as CoupleTv;
    const phone = (slot: Slot) => game.phone(slot) as CouplePhone;
    game.act(0, { type: 'answer', choice: 1 });
    expect(phone(1).partner).toBeNull();
    expect(tv().answers).toBeNull();
    game.act(1, { type: 'answer', choice: 1 });
    test.clock.advance(1000);
    expect(tv().match).toBe(true);
    expect(tv().matches).toBe(1);
    expect(phone(0).partner).toBe(1);
    test.clock.advance(5000);
    game.act(0, { type: 'answer', choice: 0 });
    game.act(1, { type: 'answer', choice: 1 });
    test.clock.advance(1000);
    expect(tv().match).toBe(false);
    expect(tv().matches).toBe(1);
  });

  it('mixes « tu préfères » questions in and finishes as a team', () => {
    const test = createTestContext({ seed: 9 });
    const game = couple.create(test.ctx);
    const kinds: string[] = [];
    for (let round = 0; round < COUPLE_ROUNDS; round++) {
      kinds.push((game.tv() as CoupleTv).prompt.kind);
      game.act(0, { type: 'answer', choice: 0 });
      game.act(1, { type: 'answer', choice: 0 });
      test.clock.advance(6000);
    }
    expect(kinds).toContain('prefer');
    expect(kinds).toContain('who');
    expect(test.results[0].coop).toEqual({ won: true, score: COUPLE_ROUNDS });
  });
});

describe('Mots interdits', () => {
  function setup() {
    const test = createTestContext({ seed: 6, starter: 0 });
    const game = taboo.create(test.ctx);
    return { test, game, tv: () => game.tv() as TabooTv, phone: (slot: Slot) => game.phone(slot) as TabooPhone };
  }

  it('shows the card only to the describer and scores found words', () => {
    const { game, tv, phone } = setup();
    game.act(1, { type: 'start' });
    expect(tv().phase).toBe('ready');
    game.act(0, { type: 'start' });
    const card = phone(0);
    if (card.role !== 'describer' || !card.card) throw new Error('expected describer card');
    expect(card.card.forbidden).toHaveLength(4);
    expect(JSON.stringify(tv())).not.toContain(card.card.word);
    expect(phone(1).role).toBe('guesser');
    game.act(1, { type: 'found' });
    expect(tv().score).toBe(0);
    game.act(0, { type: 'found' });
    game.act(0, { type: 'pass' });
    game.act(1, { type: 'buzz' });
    expect(tv().score).toBe(1);
    expect(tv().resolved.map((item) => item.outcome)).toEqual(['found', 'pass', 'buzz']);
  });

  it('alternates describers over the turns and finishes', () => {
    const { game, tv, test } = setup();
    const describers: Slot[] = [];
    for (let turn = 0; turn < TURNS; turn++) {
      const current = tv().describer;
      describers.push(current);
      game.act(current, { type: 'start' });
      for (let i = 0; i < 5; i++) game.act(current, { type: 'found' });
      test.clock.advance(TURN_SECONDS * 1000);
      expect(tv().phase).toBe('summary');
      test.clock.advance(5000);
    }
    expect(describers).toEqual([0, 1, 0, 1]);
    expect(test.results[0].coop).toEqual({ won: true, score: 20 });
  });
});

describe('Reversi', () => {
  it('starts with four legal moves and flips the sandwiched discs', () => {
    const board = initialBoard();
    expect(legalMoves(board, 0)).toHaveLength(4);
    const move = legalMoves(board, 0)[0];
    expect(flipsFor(board, move, 0)).toHaveLength(1);
    expect(flipsFor(board, 0, 0)).toHaveLength(0);
  });

  it('plays a whole game with legal moves only and declares the winner by count', () => {
    const test = createTestContext({ seed: 1, starter: 0 });
    const game = reversi.create(test.ctx);
    const tv = () => game.tv() as ReversiTv;
    game.act(0, { type: 'place', cell: 0 });
    expect(tv().last).toBeNull();
    let guard = 0;
    while (tv().phase === 'play' && guard++ < 100) {
      const { turn, moves, last } = tv();
      game.act(turn === 0 ? 1 : 0, { type: 'place', cell: moves[0] });
      expect(tv().last).toEqual(last);
      game.act(turn, { type: 'place', cell: moves[moves.length - 1] });
      expect(tv().last?.cell).toBe(moves[moves.length - 1]);
    }
    expect(tv().phase).toBe('over');
    const [a, b] = tv().counts;
    expect(a + b).toBeLessThanOrEqual(SIZE * SIZE);
    test.clock.advance(3000);
    expect(test.results[0].winner).toBe(a === b ? null : a > b ? 0 : 1);
  });
});
