import { DeckHistory } from '../../src/lib/games/deck';
import { Link } from '../../src/lib/net/link';
import { createRng } from '../../src/lib/random';
import type { TimerHost } from '../../src/lib/room/scheduler';
import type { FxKind, GameContext, GameResult, Slot } from '../../src/lib/games/types';

interface Pending {
  id: number;
  due: number;
  callback: () => void;
}

export class ManualClock implements TimerHost {
  time = 1_000_000;
  private seq = 0;
  private pending: Pending[] = [];

  now = (): number => this.time;

  setTimeout = (callback: () => void, ms: number): unknown => {
    const id = ++this.seq;
    this.pending.push({ id, due: this.time + ms, callback });
    return id;
  };

  clearTimeout = (handle: unknown): void => {
    this.pending = this.pending.filter((entry) => entry.id !== handle);
  };

  advance(ms: number): void {
    const target = this.time + ms;
    for (;;) {
      const next = this.pending.filter((entry) => entry.due <= target).sort((a, b) => a.due - b.due || a.id - b.id)[0];
      if (!next) break;
      this.pending = this.pending.filter((entry) => entry !== next);
      this.time = next.due;
      next.callback();
    }
    this.time = target;
  }
}

export interface TestContext {
  ctx: GameContext;
  clock: ManualClock;
  fx: { kind: FxKind; targets: Slot[] | 'all' }[];
  results: GameResult[];
  updates: () => number;
}

export function createTestContext(options: { seed?: number; starter?: Slot } = {}): TestContext {
  const clock = new ManualClock();
  const fx: TestContext['fx'] = [];
  const results: GameResult[] = [];
  let updates = 0;
  const rng = createRng(options.seed ?? 42);
  const decks = new DeckHistory();
  const ctx: GameContext = {
    starter: options.starter ?? 0,
    rng,
    name: (slot) => (slot === 0 ? 'Léa' : 'Tom'),
    now: () => clock.now(),
    after: (ms, callback) => ({ id: clock.setTimeout(callback, ms) as number }),
    cancel: (handle) => {
      if (handle) clock.clearTimeout(handle.id);
    },
    update: () => {
      updates += 1;
    },
    fx: (kind, targets = 'all') => {
      fx.push({ kind, targets });
    },
    finish: (result) => {
      results.push(result);
    },
    draw: (deck, pool, key) => decks.draw(deck, pool, key, rng),
  };
  return { ctx, clock, fx, results, updates: () => updates };
}

export function linkPair(): [Link, Link] {
  let a: Link;
  let b: Link;
  a = new Link(
    (data) => queueMicrotask(() => b.receive(JSON.parse(JSON.stringify(data)))),
    () => queueMicrotask(() => b.markClosed()),
  );
  b = new Link(
    (data) => queueMicrotask(() => a.receive(JSON.parse(JSON.stringify(data)))),
    () => queueMicrotask(() => a.markClosed()),
  );
  a.markOpen();
  b.markOpen();
  return [a, b];
}

export async function settle(rounds = 6): Promise<void> {
  for (let i = 0; i < rounds; i++) await Promise.resolve();
}
