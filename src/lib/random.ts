export interface Rng {
  next(): number;
  int(max: number): number;
  pick<T>(list: readonly T[]): T;
  shuffle<T>(list: readonly T[]): T[];
}

export function createRng(seed: number): Rng {
  let state = seed >>> 0;

  function next(): number {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function int(max: number): number {
    return Math.floor(next() * max);
  }

  function pick<T>(list: readonly T[]): T {
    return list[int(list.length)];
  }

  function shuffle<T>(list: readonly T[]): T[] {
    const result = [...list];
    for (let i = result.length - 1; i > 0; i--) {
      const j = int(i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  return { next, int, pick, shuffle };
}

export function randomSeed(): number {
  return Math.floor(Math.random() * 4294967296);
}

const ID_ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';

export function randomId(length = 16): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => ID_ALPHABET[byte % ID_ALPHABET.length]).join('');
}

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function randomRoomCode(): string {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join('');
}

export function isRoomCode(value: string): boolean {
  return /^[A-HJ-NP-Z2-9]{4}$/.test(value);
}
