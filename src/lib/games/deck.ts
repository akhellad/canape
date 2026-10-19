import type { Rng } from '../random';

export interface HistoryStore {
  load(deck: string): string[];
  save(deck: string, keys: string[]): void;
}

const MAX_HISTORY = 4000;

/**
 * Remembers what each deck already dealt, oldest first, so a word or a question
 * only comes back once (almost) everything else in its pool has been seen.
 */
export class DeckHistory {
  private readonly cache = new Map<string, string[]>();

  constructor(private readonly store?: HistoryStore) {}

  draw<T>(deck: string, pool: readonly T[], key: (item: T) => string, rng: Rng): T {
    if (!pool.length) throw new Error(`Empty deck: ${deck}`);
    let seen = this.seen(deck);
    let fresh = pool.filter((item) => !seen.has(key(item)));
    if (!fresh.length) {
      // Everything was dealt: forget the oldest half so they can come back first.
      const history = this.history(deck);
      const keep = history.slice(history.length - Math.floor(pool.length / 2));
      this.cache.set(deck, keep);
      seen = new Set(keep);
      fresh = pool.filter((item) => !seen.has(key(item)));
    }
    const item = rng.pick(fresh.length ? fresh : pool);
    const history = [...this.history(deck), key(item)].slice(-MAX_HISTORY);
    this.cache.set(deck, history);
    this.store?.save(deck, history);
    return item;
  }

  private history(deck: string): string[] {
    let history = this.cache.get(deck);
    if (!history) {
      history = this.store?.load(deck) ?? [];
      this.cache.set(deck, history);
    }
    return history;
  }

  private seen(deck: string): Set<string> {
    return new Set(this.history(deck));
  }
}
