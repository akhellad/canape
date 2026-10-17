import { randomId } from '../random';
import { Link } from './link';
import type { ClientTransport, Dial, DialHandlers, HostTransport, ListenHandlers } from './transport';

type Envelope =
  | { kind: 'connect'; id: string }
  | { kind: 'accept'; id: string }
  | { kind: 'data'; id: string; to: 'host' | 'client'; payload: unknown }
  | { kind: 'close'; id: string; to: 'host' | 'client' };

const channelName = (code: string) => `lmdc-local-${code}`;

export class LocalHostTransport implements HostTransport {
  private channel: BroadcastChannel | null = null;
  private readonly links = new Map<string, Link>();

  listen(code: string, handlers: ListenHandlers): void {
    this.dispose();
    const channel = new BroadcastChannel(channelName(code));
    this.channel = channel;

    channel.onmessage = (event: MessageEvent<Envelope>) => {
      const message = event.data;
      if (message.kind === 'connect') {
        const id = message.id;
        const link = new Link(
          (payload) => channel.postMessage({ kind: 'data', id, to: 'client', payload } satisfies Envelope),
          () => channel.postMessage({ kind: 'close', id, to: 'client' } satisfies Envelope),
        );
        link.onClose(() => this.links.delete(id));
        this.links.set(id, link);
        channel.postMessage({ kind: 'accept', id } satisfies Envelope);
        handlers.onLink(link);
        link.markOpen();
      } else if (message.kind === 'data' && message.to === 'host') {
        this.links.get(message.id)?.receive(message.payload);
      } else if (message.kind === 'close' && message.to === 'host') {
        this.links.get(message.id)?.markClosed();
      }
    };

    setTimeout(() => {
      if (this.channel === channel) handlers.onReady();
    }, 0);
  }

  dispose(): void {
    for (const link of this.links.values()) link.close();
    this.links.clear();
    this.channel?.close();
    this.channel = null;
  }
}

export class LocalClientTransport implements ClientTransport {
  private readonly channels = new Set<BroadcastChannel>();

  dial(code: string, handlers: DialHandlers): Dial {
    const id = randomId();
    const channel = new BroadcastChannel(channelName(code));
    this.channels.add(channel);
    let link: Link | null = null;

    const timeout = setTimeout(() => {
      if (!link) {
        cleanup();
        handlers.onError('unavailable');
      }
    }, 2500);

    const cleanup = () => {
      clearTimeout(timeout);
      channel.close();
      this.channels.delete(channel);
    };

    channel.onmessage = (event: MessageEvent<Envelope>) => {
      const message = event.data;
      if (message.id !== id) return;
      if (message.kind === 'accept' && !link) {
        clearTimeout(timeout);
        link = new Link(
          (payload) => channel.postMessage({ kind: 'data', id, to: 'host', payload } satisfies Envelope),
          () => channel.postMessage({ kind: 'close', id, to: 'host' } satisfies Envelope),
        );
        link.onClose(cleanup);
        link.markOpen();
        handlers.onOpen(link);
      } else if (message.kind === 'data' && message.to === 'client') {
        link?.receive(message.payload);
      } else if (message.kind === 'close' && message.to === 'client') {
        link?.markClosed();
      }
    };

    channel.postMessage({ kind: 'connect', id } satisfies Envelope);

    return {
      cancel: () => {
        if (link) link.close();
        else cleanup();
      },
    };
  }

  dispose(): void {
    for (const channel of this.channels) channel.close();
    this.channels.clear();
  }
}
