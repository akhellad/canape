type State = 'connecting' | 'open' | 'closed';

export class Link {
  private state: State = 'connecting';
  private readonly openListeners = new Set<() => void>();
  private readonly dataListeners = new Set<(data: unknown) => void>();
  private readonly closeListeners = new Set<() => void>();

  constructor(
    private readonly sendImpl: (data: unknown) => void,
    private readonly closeImpl: () => void,
  ) {}

  get isOpen(): boolean {
    return this.state === 'open';
  }

  get isClosed(): boolean {
    return this.state === 'closed';
  }

  send(data: unknown): boolean {
    if (this.state !== 'open') return false;
    try {
      this.sendImpl(data);
      return true;
    } catch {
      this.markClosed();
      return false;
    }
  }

  close(): void {
    if (this.state === 'closed') return;
    this.markClosed();
    try {
      this.closeImpl();
    } catch {
      return;
    }
  }

  onOpen(listener: () => void): void {
    if (this.state === 'open') listener();
    else if (this.state === 'connecting') this.openListeners.add(listener);
  }

  onData(listener: (data: unknown) => void): void {
    this.dataListeners.add(listener);
  }

  onClose(listener: () => void): void {
    if (this.state === 'closed') listener();
    else this.closeListeners.add(listener);
  }

  markOpen(): void {
    if (this.state !== 'connecting') return;
    this.state = 'open';
    for (const listener of [...this.openListeners]) listener();
    this.openListeners.clear();
  }

  receive(data: unknown): void {
    if (this.state !== 'open') return;
    for (const listener of [...this.dataListeners]) listener(data);
  }

  markClosed(): void {
    if (this.state === 'closed') return;
    this.state = 'closed';
    const listeners = [...this.closeListeners];
    this.openListeners.clear();
    this.dataListeners.clear();
    this.closeListeners.clear();
    for (const listener of listeners) listener();
  }
}
