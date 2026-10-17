import type { Link } from '../net/link';
import type { ClientTransport, Dial } from '../net/transport';
import type { Slot } from '../games/types';
import { PROTOCOL, parseHostMessage, type ClientMessage, type PhoneScreen, type RoomCommand } from './protocol';
import type { TimerHost } from './scheduler';

export type ClientStatus = 'connecting' | 'online' | 'retrying' | 'unreachable' | 'full' | 'outdated';

const DIAL_TIMEOUT_MS = 9000;
const SILENCE_MS = 7000;
const WATCH_MS = 1000;

export interface PlayerClientOptions {
  transport: ClientTransport;
  timers: TimerHost;
  room: string;
  clientId: string;
  name: string;
  onChange(): void;
}

export class PlayerClient {
  status: ClientStatus = 'connecting';
  screen: PhoneScreen | null = null;
  slot: Slot | null = null;

  private link: Link | null = null;
  private dial: Dial | null = null;
  private attempts = 0;
  private lastMessage = 0;
  private retryHandle: unknown = null;
  private dialHandle: unknown = null;
  private watchHandle: unknown = null;
  private stopped = false;

  constructor(private readonly options: PlayerClientOptions) {}

  start(): void {
    this.stopped = false;
    this.connect();
    this.watchHandle = this.options.timers.setTimeout(this.watch, WATCH_MS);
  }

  stop(): void {
    this.stopped = true;
    this.clearTimers();
    this.options.timers.clearTimeout(this.watchHandle);
    this.dial?.cancel();
    this.link?.close();
    this.link = null;
  }

  wake(): void {
    if (this.stopped || this.status === 'online' || this.status === 'full' || this.status === 'outdated') return;
    this.attempts = 0;
    this.connect();
  }

  retry(): void {
    if (this.stopped) return;
    this.attempts = 0;
    this.connect();
  }

  command(cmd: RoomCommand): boolean {
    return this.send({ t: 'room', cmd });
  }

  act(action: unknown): boolean {
    return this.send({ t: 'game', action });
  }

  private send(message: ClientMessage): boolean {
    return this.link?.send(message) ?? false;
  }

  private connect(): void {
    this.clearTimers();
    this.dial?.cancel();
    this.dial = null;
    const previous = this.link;
    this.link = null;
    previous?.close();

    this.setStatus(this.attempts === 0 && !this.screen ? 'connecting' : 'retrying');

    const dial = this.options.transport.dial(this.options.room, {
      onOpen: (link) => {
        if (this.dial !== dial) {
          link.close();
          return;
        }
        this.options.timers.clearTimeout(this.dialHandle);
        this.dialHandle = null;
        this.link = link;
        this.lastMessage = this.options.timers.now();
        link.onData((data) => this.receive(link, data));
        link.onClose(() => this.lost(link));
        link.send({ t: 'hello', protocol: PROTOCOL, clientId: this.options.clientId, name: this.options.name } satisfies ClientMessage);
      },
      onError: (error) => {
        if (this.dial !== dial || this.link) return;
        this.dial = null;
        if (error === 'unavailable') this.setStatus('unreachable');
        this.scheduleRetry();
      },
    });
    this.dial = dial;

    this.dialHandle = this.options.timers.setTimeout(() => {
      this.dialHandle = null;
      if (this.dial !== dial || this.link) return;
      dial.cancel();
      this.dial = null;
      this.setStatus('unreachable');
      this.scheduleRetry();
    }, DIAL_TIMEOUT_MS);
  }

  private receive(link: Link, data: unknown): void {
    if (link !== this.link) return;
    this.lastMessage = this.options.timers.now();
    const message = parseHostMessage(data);
    if (!message) return;
    switch (message.t) {
      case 'welcome':
        this.slot = message.slot;
        this.attempts = 0;
        this.setStatus('online');
        break;
      case 'screen':
        this.screen = message.screen;
        this.slot = message.screen.slot;
        if (this.status !== 'online') this.status = 'online';
        this.options.onChange();
        break;
      case 'ping':
        link.send({ t: 'pong', at: message.at } satisfies ClientMessage);
        break;
      case 'rejected':
        this.stopped = true;
        this.clearTimers();
        this.setStatus(message.reason === 'full' ? 'full' : 'outdated');
        link.close();
        break;
    }
  }

  private lost(link: Link): void {
    if (link !== this.link) return;
    this.link = null;
    if (this.stopped) return;
    this.setStatus('retrying');
    this.scheduleRetry();
  }

  private scheduleRetry(): void {
    if (this.stopped) return;
    this.options.timers.clearTimeout(this.retryHandle);
    this.attempts += 1;
    const delay = Math.min(600 * this.attempts, 4000);
    this.retryHandle = this.options.timers.setTimeout(() => {
      this.retryHandle = null;
      this.connect();
    }, delay);
  }

  private watch = (): void => {
    if (this.stopped) return;
    if (this.link && this.status === 'online' && this.options.timers.now() - this.lastMessage > SILENCE_MS) {
      this.link.close();
    }
    this.watchHandle = this.options.timers.setTimeout(this.watch, WATCH_MS);
  };

  private clearTimers(): void {
    this.options.timers.clearTimeout(this.retryHandle);
    this.options.timers.clearTimeout(this.dialHandle);
    this.retryHandle = null;
    this.dialHandle = null;
  }

  private setStatus(status: ClientStatus): void {
    if (this.status === status) return;
    this.status = status;
    this.options.onChange();
  }
}
