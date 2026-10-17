import type { Rng } from '../../random';

export const ORDER = 7;

export function buildDeck(order = ORDER): number[][] {
  const cards: number[][] = [];
  cards.push(Array.from({ length: order + 1 }, (_, i) => i));
  for (let j = 0; j < order; j++) {
    cards.push([0, ...Array.from({ length: order }, (_, k) => order + 1 + order * j + k)]);
  }
  for (let i = 0; i < order; i++) {
    for (let j = 0; j < order; j++) {
      cards.push([i + 1, ...Array.from({ length: order }, (_, k) => order + 1 + order * k + ((i * k + j) % order))]);
    }
  }
  return cards;
}

export interface Placement {
  symbol: number;
  x: number;
  y: number;
  size: number;
  rotate: number;
}

export function layoutCard(symbols: readonly number[], rng: Rng): Placement[] {
  const [center, ...ring] = rng.shuffle(symbols);
  const offset = rng.next() * Math.PI * 2;
  const placements: Placement[] = [{ symbol: center, x: 0, y: 0, size: 0.46 + rng.next() * 0.12, rotate: rng.int(360) - 180 }];
  ring.forEach((symbol, k) => {
    const angle = offset + (k * Math.PI * 2) / ring.length;
    const radius = 0.6 + (rng.next() - 0.5) * 0.06;
    placements.push({
      symbol,
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      size: 0.32 + rng.next() * 0.14,
      rotate: rng.int(360) - 180,
    });
  });
  return placements;
}
