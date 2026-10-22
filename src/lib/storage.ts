export const STORAGE_KEYS = {
  room: 'lmdc:room',
  name: 'lmdc:name',
  clientId: 'lmdc:client',
  trophies: 'lmdc:trophies',
  sound: 'lmdc:sound',
  records: 'lmdc:records',
  seen: 'lmdc:seen',
  settings: 'lmdc:settings',
} as const;

type Area = 'local' | 'session';

function area(kind: Area): Storage {
  return kind === 'local' ? localStorage : sessionStorage;
}

export function readStorage(key: string, kind: Area = 'local'): string | null {
  try {
    return area(kind).getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(key: string, value: string, kind: Area = 'local'): void {
  try {
    area(kind).setItem(key, value);
  } catch {
    return;
  }
}

export function readJson<T>(key: string, fallback: T): T {
  const raw = readStorage(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown): void {
  writeStorage(key, JSON.stringify(value));
}
