import type { Link } from '../net/link';
import { DeckHistory, type HistoryStore } from '../games/deck';
import { changeSetting, resolveSettings, type Settings } from '../games/settings';
import { createRng } from '../random';
import { sanitizeName } from '../text';
import {
  other,
  SLOTS,
  type FxEvent,
  type FxKind,
  type GameContext,
  type GameDefinition,
  type GameId,
  type GameInstance,
  type GameResult,
  type Slot,
} from '../games/types';
import {
  PROTOCOL,
  parseClientMessage,
  type HostMessage,
  type PhoneScreen,
  type RoomCommand,
  type ScreenBody,
  type Seats,
} from './protocol';
import { PausableScheduler, type TimerHost } from './scheduler';

export const HEARTBEAT_MS = 2000;
export const TIMEOUT_MS = 8000;
export const COUNTDOWN_MS = 3200;
export const RESUME_MS = 3000;
const HELLO_TIMEOUT_MS = 10000;
const FX_HISTORY = 24;

interface Seat {
  clientId: string;
  name: string;
  link: Link | null;
  lastSeen: number;
  trophies: number;
}

class Session {
  readonly scheduler: PausableScheduler;
  instance: GameInstance | null = null;
  finished = false;
  resumeAt: number | null = null;
  resumeHandle: unknown = null;

  constructor(
    readonly game: GameId,
    host: TimerHost,
  ) {
    this.scheduler = new PausableScheduler(host);
  }

  get halted(): boolean {
    return this.scheduler.paused || this.resumeAt !== null;
  }
}

type Stage =
  | { kind: 'lobby' }
  | { kind: 'menu' }
  | { kind: 'rules'; game: GameId; ready: [boolean, boolean]; settings: Settings }
  | { kind: 'countdown'; game: GameId; until: number }
  | { kind: 'playing'; game: GameId; session: Session }
  | { kind: 'result'; game: GameId; session: Session; result: GameResult };

export type TvStage =
  | { kind: 'lobby' }
  | { kind: 'menu' }
  | { kind: 'rules'; game: GameId; ready: [boolean, boolean]; settings: Settings }
  | { kind: 'countdown'; game: GameId; until: number }
  | { kind: 'playing'; game: GameId; view: unknown; waitingFor: string[]; resumeAt: number | null }
  | { kind: 'result'; game: GameId; view: unknown; result: GameResult };

export interface TvSnapshot {
  seats: Seats;
  stage: TvStage;
  fx: FxEvent[];
  toast: { seq: number; text: string } | null;
}

export interface TrophyStore {
  load(name: string): number;
  save(name: string, count: number): void;
}

export interface SettingsStore {
  load(game: GameId): unknown;
  save(game: GameId, settings: Settings): void;
}

export interface HostRoomOptions {
  timers: TimerHost;
  catalog: Readonly<Record<GameId, GameDefinition>>;
  onChange(): void;
  trophies?: TrophyStore;
  history?: HistoryStore;
  settings?: SettingsStore;
  seed?: () => number;
}

export class HostRoom {
  private readonly seats: [Seat | null, Seat | null] = [null, null];
  private stage: Stage = { kind: 'lobby' };
  private starter: Slot = 1;
  private fxLog: FxEvent[] = [];
  private fxSeq = 0;
  private toast: { seq: number; text: string } | null = null;
  private readonly pending = new Set<Link>();
  private readonly sent = new Map<Link, string>();
  private flushQueued = false;
  private stageHandle: unknown = null;
  private heartbeatHandle: unknown = null;
  private disposed = false;
  private readonly decks: DeckHistory;
  private readonly chosen = new Map<GameId, Settings>();

  constructor(private readonly options: HostRoomOptions) {
    this.decks = new DeckHistory(options.history);
    this.heartbeatHandle = options.timers.setTimeout(this.heartbeat, HEARTBEAT_MS);
  }

  accept(link: Link): void {
    if (this.disposed) {
      link.close();
      return;
    }
    this.pending.add(link);
    link.onData((data) => this.receive(link, data));
    link.onClose(() => this.handleClose(link));
    this.options.timers.setTimeout(() => {
      if (this.pending.has(link)) link.close();
    }, HELLO_TIMEOUT_MS);
  }

  tv(): TvSnapshot {
    return {
      seats: this.seatInfos(),
      stage: this.tvStage(),
      fx: this.fxLog,
      toast: this.toast,
    };
  }

  screenFor(slot: Slot): PhoneScreen {
    return {
      ...this.screenBody(slot),
      slot,
      seats: this.seatInfos(),
      fx: this.fxLog.filter((event) => event.targets === 'all' || event.targets.includes(slot)).slice(-4),
    };
  }

  dispose(): void {
    this.disposed = true;
    this.options.timers.clearTimeout(this.heartbeatHandle);
    this.clearStageTimer();
    this.endSession();
    for (const link of this.pending) link.close();
    for (const seat of this.seats) seat?.link?.close();
  }

  private receive(link: Link, data: unknown): void {
    const message = parseClientMessage(data);
    if (!message) return;
    if (message.t === 'hello') {
      this.hello(link, message.clientId, message.name, message.protocol);
      return;
    }
    const slot = this.slotOf(link);
    if (slot === null) return;
    const seat = this.seats[slot];
    if (seat) seat.lastSeen = this.options.timers.now();
    if (message.t === 'room') this.command(slot, message.cmd);
    else if (message.t === 'game') this.gameAction(slot, message.action);
  }

  private hello(link: Link, clientId: string, rawName: string, protocol: number): void {
    if (protocol !== PROTOCOL) {
      this.send(link, { t: 'rejected', reason: 'protocol' });
      link.close();
      return;
    }
    const wanted = sanitizeName(rawName, '').toLowerCase();
    let slot = this.seats.findIndex((seat) => seat?.clientId === clientId);
    if (slot === -1) slot = this.seats.findIndex((seat) => seat !== null && seat.link === null && seat.name.toLowerCase() === wanted);
    if (slot === -1) slot = this.seats.findIndex((seat) => seat === null);
    if (slot === -1) slot = this.seats.findIndex((seat) => seat !== null && seat.link === null);
    if (slot === -1) {
      this.send(link, { t: 'rejected', reason: 'full' });
      link.close();
      return;
    }

    const index = slot as Slot;
    const previous = this.seats[index];
    const otherSeat = this.seats[other(index)];
    let name = sanitizeName(rawName, `Joueur ${index + 1}`);
    if (otherSeat && otherSeat.name.toLowerCase() === name.toLowerCase()) name = sanitizeName(`${name.slice(0, 12)} 2`, name);

    const sameClient = previous?.clientId === clientId;
    const returning = previous !== null && previous.name.toLowerCase() === name.toLowerCase();
    const trophies = returning ? previous.trophies : (this.options.trophies?.load(name) ?? 0);

    this.pending.delete(link);
    if (previous?.link && previous.link !== link) {
      const stale = previous.link;
      previous.link = null;
      this.sent.delete(stale);
      stale.close();
    }
    this.seats[index] = { clientId, name, link, lastSeen: this.options.timers.now(), trophies };
    this.send(link, { t: 'welcome', slot: index });

    if (!sameClient && !returning) {
      this.emit('join', 'all');
      this.notify(`${name} a rejoint la partie`);
    } else if (!sameClient || !previous?.link) {
      this.notify(`${name} est de retour`);
    }
    if (this.stage.kind === 'lobby' && this.seats[0] && this.seats[1]) this.setStage({ kind: 'menu' });
    this.presenceChanged();
    this.update();
  }

  private handleClose(link: Link): void {
    this.pending.delete(link);
    this.sent.delete(link);
    const slot = this.slotOf(link);
    if (slot === null) return;
    const seat = this.seats[slot];
    if (seat) seat.link = null;
    this.presenceChanged();
    this.update();
  }

  private command(slot: Slot, cmd: RoomCommand): void {
    const stage = this.stage;
    switch (cmd.op) {
      case 'pick':
        if (stage.kind === 'menu' && Object.prototype.hasOwnProperty.call(this.options.catalog, cmd.game)) {
          this.setStage({ kind: 'rules', game: cmd.game, ready: [false, false], settings: this.settingsFor(cmd.game) });
        }
        break;
      case 'set':
        if (stage.kind === 'rules') {
          const next = changeSetting(this.options.catalog[stage.game].settings ?? [], stage.settings, cmd.key, cmd.value);
          if (next && JSON.stringify(next) !== JSON.stringify(stage.settings)) {
            stage.settings = next;
            // Nobody should start on settings they did not see.
            stage.ready = [false, false];
            this.chosen.set(stage.game, next);
            this.options.settings?.save(stage.game, next);
          }
        }
        break;
      case 'ready':
        if (stage.kind === 'rules') {
          stage.ready[slot] = true;
          if (stage.ready[0] && stage.ready[1]) this.startCountdown(stage.game);
        }
        break;
      case 'back':
        if (stage.kind === 'rules') this.setStage({ kind: 'menu' });
        break;
      case 'again':
        if (stage.kind === 'result') this.startCountdown(stage.game);
        break;
      case 'menu':
        if (stage.kind === 'result') this.setStage({ kind: 'menu' });
        break;
      case 'quit':
        if (stage.kind === 'playing' || stage.kind === 'countdown') {
          this.notify(`${this.name(slot)} a quitté la partie`);
          this.setStage({ kind: 'menu' });
        }
        break;
    }
    this.update();
  }

  private gameAction(slot: Slot, action: unknown): void {
    const stage = this.stage;
    if (stage.kind !== 'playing') return;
    const { session } = stage;
    if (session.halted || session.finished || !session.instance) return;
    try {
      session.instance.act(slot, action);
    } catch (error) {
      console.error(error);
    }
  }

  private startCountdown(game: GameId): void {
    const until = this.options.timers.now() + COUNTDOWN_MS;
    this.setStage({ kind: 'countdown', game, until });
    this.stageHandle = this.options.timers.setTimeout(() => {
      this.stageHandle = null;
      this.startGame(game);
    }, COUNTDOWN_MS);
  }

  private settingsFor(game: GameId): Settings {
    const defs = this.options.catalog[game].settings ?? [];
    const saved = this.chosen.get(game) ?? this.options.settings?.load(game);
    const settings = resolveSettings(defs, saved, createRng(this.options.seed?.() ?? Math.floor(Math.random() * 4294967296)));
    this.chosen.set(game, settings);
    return settings;
  }

  private startGame(game: GameId): void {
    const definition = this.options.catalog[game];
    this.starter = other(this.starter);
    const session = new Session(game, this.options.timers);
    const seed = this.options.seed?.() ?? Math.floor(Math.random() * 4294967296);
    const isLive = () => this.stage.kind === 'playing' && this.stage.session === session && !session.finished;
    const rng = createRng(seed);

    const ctx: GameContext = {
      starter: this.starter,
      rng,
      settings: this.chosen.get(game) ?? {},
      name: (slot) => this.name(slot),
      now: () => session.scheduler.now(),
      after: (ms, callback) => ({
        id: session.scheduler.after(ms, () => {
          if (isLive()) callback();
        }),
      }),
      cancel: (handle) => {
        if (handle) session.scheduler.cancel(handle.id);
      },
      update: () => {
        if (isLive()) this.update();
      },
      fx: (kind, targets = 'all') => {
        if (isLive()) this.emit(kind, targets);
      },
      finish: (result) => {
        if (isLive()) this.finish(session, result);
      },
      draw: (deck, pool, key) => this.decks.draw(deck, pool, key, rng),
    };

    this.setStage({ kind: 'playing', game, session });
    session.instance = definition.create(ctx);
    this.presenceChanged();
    this.update();
  }

  private finish(session: Session, result: GameResult): void {
    session.finished = true;
    session.scheduler.dispose();
    this.clearResume(session);
    if (result.winner !== null) {
      const seat = this.seats[result.winner];
      if (seat) {
        seat.trophies += 1;
        this.options.trophies?.save(seat.name, seat.trophies);
      }
      this.emit('win', [result.winner]);
      this.emit('lose', [other(result.winner)]);
    } else if (result.coop) {
      this.emit(result.coop.won ? 'win' : 'lose', 'all');
    }
    this.stage = { kind: 'result', game: session.game, session, result };
    this.update();
  }

  private presenceChanged(): void {
    const stage = this.stage;
    if (stage.kind !== 'playing' || stage.session.finished) return;
    const { session } = stage;
    const missing = SLOTS.some((slot) => !this.seats[slot]?.link);
    if (missing) {
      this.clearResume(session);
      session.scheduler.pause();
      return;
    }
    if (!session.scheduler.paused || session.resumeAt !== null) return;
    session.resumeAt = this.options.timers.now() + RESUME_MS;
    session.resumeHandle = this.options.timers.setTimeout(() => {
      session.resumeAt = null;
      session.resumeHandle = null;
      session.scheduler.resume();
      this.update();
    }, RESUME_MS);
  }

  private clearResume(session: Session): void {
    if (session.resumeHandle !== null) this.options.timers.clearTimeout(session.resumeHandle);
    session.resumeHandle = null;
    session.resumeAt = null;
  }

  private setStage(stage: Stage): void {
    this.clearStageTimer();
    if (stage.kind !== 'result') this.endSession();
    this.stage = stage;
  }

  private endSession(): void {
    const current = this.stage;
    if (current.kind === 'playing' || current.kind === 'result') {
      current.session.finished = true;
      current.session.scheduler.dispose();
      this.clearResume(current.session);
    }
  }

  private clearStageTimer(): void {
    if (this.stageHandle !== null) this.options.timers.clearTimeout(this.stageHandle);
    this.stageHandle = null;
  }

  private emit(kind: FxKind, targets: Slot[] | 'all'): void {
    this.fxSeq += 1;
    this.fxLog = [...this.fxLog, { seq: this.fxSeq, kind, targets }].slice(-FX_HISTORY);
  }

  private notify(text: string): void {
    this.toast = { seq: (this.toast?.seq ?? 0) + 1, text };
  }

  private heartbeat = (): void => {
    if (this.disposed) return;
    const now = this.options.timers.now();
    for (const seat of this.seats) {
      if (!seat?.link) continue;
      if (now - seat.lastSeen > TIMEOUT_MS) seat.link.close();
      else this.send(seat.link, { t: 'ping', at: now });
    }
    this.heartbeatHandle = this.options.timers.setTimeout(this.heartbeat, HEARTBEAT_MS);
  };

  private update(): void {
    if (this.flushQueued || this.disposed) return;
    this.flushQueued = true;
    queueMicrotask(() => this.flush());
  }

  private flush(): void {
    this.flushQueued = false;
    if (this.disposed) return;
    this.options.onChange();
    for (const slot of SLOTS) {
      const link = this.seats[slot]?.link;
      if (!link) continue;
      const screen = this.screenFor(slot);
      const json = JSON.stringify(screen);
      if (this.sent.get(link) === json) continue;
      this.sent.set(link, json);
      this.send(link, { t: 'screen', screen });
    }
  }

  private send(link: Link, message: HostMessage): void {
    link.send(message);
  }

  private slotOf(link: Link): Slot | null {
    if (this.seats[0]?.link === link) return 0;
    if (this.seats[1]?.link === link) return 1;
    return null;
  }

  private name(slot: Slot): string {
    return this.seats[slot]?.name ?? `Joueur ${slot + 1}`;
  }

  private seatInfos(): Seats {
    return [this.seatInfo(0), this.seatInfo(1)];
  }

  private seatInfo(slot: Slot) {
    const seat = this.seats[slot];
    return seat ? { name: seat.name, connected: seat.link !== null, trophies: seat.trophies } : null;
  }

  private screenBody(slot: Slot): ScreenBody {
    const stage = this.stage;
    switch (stage.kind) {
      case 'lobby':
      case 'menu':
        return { kind: stage.kind };
      case 'rules':
        return { kind: 'rules', game: stage.game, ready: [...stage.ready] as [boolean, boolean], settings: stage.settings };
      case 'countdown':
        return { kind: 'countdown', game: stage.game };
      case 'playing':
        return {
          kind: 'playing',
          game: stage.game,
          view: stage.session.instance?.phone(slot) ?? null,
          paused: stage.session.halted,
        };
      case 'result':
        return { kind: 'result', game: stage.game, result: stage.result };
    }
  }

  private tvStage(): TvStage {
    const stage = this.stage;
    switch (stage.kind) {
      case 'lobby':
      case 'menu':
        return { kind: stage.kind };
      case 'rules':
        return { kind: 'rules', game: stage.game, ready: [...stage.ready] as [boolean, boolean], settings: stage.settings };
      case 'countdown':
        return { kind: 'countdown', game: stage.game, until: stage.until };
      case 'playing':
        return {
          kind: 'playing',
          game: stage.game,
          view: stage.session.instance?.tv() ?? null,
          waitingFor: SLOTS.filter((slot) => !this.seats[slot]?.link).map((slot) => this.name(slot)),
          resumeAt: stage.session.resumeAt,
        };
      case 'result':
        return { kind: 'result', game: stage.game, view: stage.session.instance?.tv() ?? null, result: stage.result };
    }
  }
}
