export interface TimerHost {
  now(): number;
  setTimeout(callback: () => void, ms: number): unknown;
  clearTimeout(handle: unknown): void;
}

export const browserTimers: TimerHost = {
  now: () => Date.now(),
  setTimeout: (callback, ms) => setTimeout(callback, ms),
  clearTimeout: (handle) => clearTimeout(handle as ReturnType<typeof setTimeout>),
};

interface Entry {
  due: number;
  callback: () => void;
  handle: unknown;
}

export class PausableScheduler {
  private offset = 0;
  private pausedAt: number | null = null;
  private seq = 0;
  private readonly entries = new Map<number, Entry>();

  constructor(private readonly host: TimerHost) {}

  get paused(): boolean {
    return this.pausedAt !== null;
  }

  now(): number {
    return (this.pausedAt ?? this.host.now()) - this.offset;
  }

  after(ms: number, callback: () => void): number {
    const id = ++this.seq;
    const entry: Entry = { due: this.now() + Math.max(0, ms), callback, handle: null };
    this.entries.set(id, entry);
    if (!this.paused) this.arm(id, entry);
    return id;
  }

  cancel(id: number): void {
    const entry = this.entries.get(id);
    if (!entry) return;
    if (entry.handle !== null) this.host.clearTimeout(entry.handle);
    this.entries.delete(id);
  }

  pause(): void {
    if (this.paused) return;
    this.pausedAt = this.host.now();
    for (const entry of this.entries.values()) {
      if (entry.handle !== null) this.host.clearTimeout(entry.handle);
      entry.handle = null;
    }
  }

  resume(): void {
    if (this.pausedAt === null) return;
    this.offset += this.host.now() - this.pausedAt;
    this.pausedAt = null;
    for (const [id, entry] of this.entries) this.arm(id, entry);
  }

  dispose(): void {
    for (const entry of this.entries.values()) {
      if (entry.handle !== null) this.host.clearTimeout(entry.handle);
    }
    this.entries.clear();
  }

  private arm(id: number, entry: Entry): void {
    entry.handle = this.host.setTimeout(
      () => {
        this.entries.delete(id);
        entry.callback();
      },
      Math.max(0, entry.due - this.now()),
    );
  }
}
