import type { FxKind } from '../games/types';

const PATTERNS: Partial<Record<FxKind, number | number[]>> = {
  turn: [70],
  hit: [90, 40, 90],
  sunk: [200, 60, 200],
  lock: [30],
  flip: [25],
  error: [40, 40, 40, 40, 40],
  correct: [50],
  wrong: [120],
  win: [100, 60, 100, 60, 260],
  lose: [350],
};

export function vibrate(kind: FxKind): void {
  const pattern = PATTERNS[kind];
  if (!pattern || typeof navigator.vibrate !== 'function') return;
  try {
    navigator.vibrate(pattern);
  } catch {
    return;
  }
}

export async function keepAwake(): Promise<() => void> {
  const wakeLock = (navigator as Navigator & { wakeLock?: { request(type: 'screen'): Promise<{ release(): Promise<void> }> } }).wakeLock;
  if (!wakeLock) return () => undefined;
  let sentinel: { release(): Promise<void> } | null = null;
  const request = async () => {
    try {
      sentinel = await wakeLock.request('screen');
    } catch {
      sentinel = null;
    }
  };
  const onVisible = () => {
    if (document.visibilityState === 'visible') void request();
  };
  await request();
  document.addEventListener('visibilitychange', onVisible);
  return () => {
    document.removeEventListener('visibilitychange', onVisible);
    void sentinel?.release();
  };
}
