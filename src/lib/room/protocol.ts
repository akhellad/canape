import type { Settings } from '../games/settings';
import { isRecord, type FxEvent, type GameId, type GameResult, type Slot } from '../games/types';

export const PROTOCOL = 2;

export interface SeatInfo {
  name: string;
  connected: boolean;
  trophies: number;
}

export type Seats = [SeatInfo | null, SeatInfo | null];

export type ScreenBody =
  | { kind: 'lobby' }
  | { kind: 'menu' }
  | { kind: 'rules'; game: GameId; ready: [boolean, boolean]; settings: Settings }
  | { kind: 'countdown'; game: GameId }
  | { kind: 'playing'; game: GameId; view: unknown; paused: boolean }
  | { kind: 'result'; game: GameId; result: GameResult };

export type PhoneScreen = ScreenBody & {
  slot: Slot;
  seats: Seats;
  fx: FxEvent[];
};

export type RoomCommand =
  | { op: 'pick'; game: GameId }
  | { op: 'set'; key: string; value: unknown }
  | { op: 'ready' }
  | { op: 'back' }
  | { op: 'again' }
  | { op: 'menu' }
  | { op: 'quit' };

export type ClientMessage =
  | { t: 'hello'; protocol: number; clientId: string; name: string }
  | { t: 'room'; cmd: RoomCommand }
  | { t: 'game'; action: unknown }
  | { t: 'pong'; at: number };

export type HostMessage =
  | { t: 'welcome'; slot: Slot }
  | { t: 'screen'; screen: PhoneScreen }
  | { t: 'rejected'; reason: 'full' | 'protocol' }
  | { t: 'ping'; at: number };

const OPS = new Set(['pick', 'set', 'ready', 'back', 'again', 'menu', 'quit']);

export function parseClientMessage(data: unknown): ClientMessage | null {
  if (!isRecord(data) || typeof data.t !== 'string') return null;
  switch (data.t) {
    case 'hello':
      if (typeof data.protocol !== 'number' || typeof data.clientId !== 'string' || typeof data.name !== 'string') return null;
      if (data.clientId.length < 8 || data.clientId.length > 64) return null;
      return { t: 'hello', protocol: data.protocol, clientId: data.clientId, name: data.name };
    case 'room': {
      const cmd = data.cmd;
      if (!isRecord(cmd) || typeof cmd.op !== 'string' || !OPS.has(cmd.op)) return null;
      if (cmd.op === 'pick') return typeof cmd.game === 'string' ? { t: 'room', cmd: { op: 'pick', game: cmd.game as GameId } } : null;
      if (cmd.op === 'set') return typeof cmd.key === 'string' ? { t: 'room', cmd: { op: 'set', key: cmd.key, value: cmd.value } } : null;
      return { t: 'room', cmd: { op: cmd.op } as RoomCommand };
    }
    case 'game':
      return { t: 'game', action: data.action };
    case 'pong':
      return { t: 'pong', at: typeof data.at === 'number' ? data.at : 0 };
    default:
      return null;
  }
}

export function parseHostMessage(data: unknown): HostMessage | null {
  if (!isRecord(data) || typeof data.t !== 'string') return null;
  switch (data.t) {
    case 'welcome':
      return data.slot === 0 || data.slot === 1 ? { t: 'welcome', slot: data.slot } : null;
    case 'screen':
      return isRecord(data.screen) && typeof data.screen.kind === 'string'
        ? { t: 'screen', screen: data.screen as unknown as PhoneScreen }
        : null;
    case 'rejected':
      return data.reason === 'full' || data.reason === 'protocol' ? { t: 'rejected', reason: data.reason } : null;
    case 'ping':
      return { t: 'ping', at: typeof data.at === 'number' ? data.at : 0 };
    default:
      return null;
  }
}
