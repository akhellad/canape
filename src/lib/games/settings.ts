import type { Rng } from '../random';
import { normalize } from '../text';

export type SettingValue = number | string[];
export type Settings = Record<string, SettingValue>;

export interface ChoiceSetting {
  id: string;
  label: string;
  kind: 'choice';
  options: readonly { value: number; label: string }[];
  default: number;
}

/** A list of short labels the players build together, picked from a pool or typed in. */
export interface ListSetting {
  id: string;
  label: string;
  kind: 'list';
  pool: readonly string[];
  min: number;
  max: number;
  /** How many items a fresh list draws from the pool. */
  size: number;
  maxLength: number;
}

export type SettingDef = ChoiceSetting | ListSetting;

function cleanItem(raw: unknown, maxLength: number): string {
  return String(raw ?? '')
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
    .trim();
}

function cleanList(def: ListSetting, raw: unknown): string[] | null {
  if (!Array.isArray(raw) || raw.length > def.max) return null;
  const seen = new Set<string>();
  const items: string[] = [];
  for (const entry of raw) {
    const item = cleanItem(entry, def.maxLength);
    const key = normalize(item);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    items.push(item);
  }
  return items.length >= def.min ? items : null;
}

function validValue(def: SettingDef, raw: unknown): SettingValue | null {
  if (def.kind === 'choice') return def.options.some((option) => option.value === raw) ? (raw as number) : null;
  return cleanList(def, raw);
}

function fallback(def: SettingDef, rng: Rng): SettingValue {
  if (def.kind === 'choice') return def.default;
  return rng.shuffle(def.pool).slice(0, def.size);
}

/** Keeps the valid values of `raw` and fills every missing or broken one with its default. */
export function resolveSettings(defs: readonly SettingDef[], raw: unknown, rng: Rng): Settings {
  const source = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {};
  const settings: Settings = {};
  for (const def of defs) settings[def.id] = validValue(def, source[def.id]) ?? fallback(def, rng);
  return settings;
}

/** Returns the settings with one value changed, or null if the change is not allowed. */
export function changeSetting(defs: readonly SettingDef[], current: Settings, id: unknown, value: unknown): Settings | null {
  const def = defs.find((candidate) => candidate.id === id);
  if (!def) return null;
  const clean = validValue(def, value);
  if (clean === null) return null;
  return { ...current, [def.id]: clean };
}

export function choiceOf(settings: Settings, id: string): number {
  const value = settings[id];
  if (typeof value !== 'number') throw new Error(`Missing setting: ${id}`);
  return value;
}

export function listOf(settings: Settings, id: string): string[] {
  const value = settings[id];
  if (!Array.isArray(value)) throw new Error(`Missing setting: ${id}`);
  return value;
}

export function settingLabel(def: SettingDef, value: SettingValue | undefined): string {
  if (def.kind === 'choice') return def.options.find((option) => option.value === value)?.label ?? '';
  return Array.isArray(value) ? `${value.length}` : '';
}
