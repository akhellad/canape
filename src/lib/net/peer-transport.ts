import { Peer, type DataConnection, type PeerJSOption } from 'peerjs';
import { Link } from './link';
import type { ClientTransport, Dial, DialHandlers, HostTransport, ListenHandlers } from './transport';

export const PEER_PREFIX = 'lmdc-salon-';

const NETWORK_ERRORS = new Set(['network', 'server-error', 'socket-error', 'socket-closed', 'disconnected', 'webrtc']);

function wrap(connection: DataConnection): Link {
  const link = new Link(
    (data) => void connection.send(data),
    () => connection.close(),
  );
  connection.on('open', () => link.markOpen());
  connection.on('data', (data) => link.receive(data));
  connection.on('close', () => link.markClosed());
  connection.on('error', () => link.markClosed());
  if (connection.open) link.markOpen();
  return link;
}

export function peerOptions(server: string | null): PeerJSOption {
  const options: PeerJSOption = { debug: 0 };
  if (server) {
    const [host, port] = server.split(':');
    options.host = host;
    options.port = Number(port) || 9000;
    options.path = '/';
    options.secure = location.protocol === 'https:' && host !== 'localhost' && host !== '127.0.0.1';
  }
  return options;
}

export class PeerHostTransport implements HostTransport {
  private peer: Peer | null = null;

  constructor(private readonly options: PeerJSOption) {}

  listen(code: string, handlers: ListenHandlers): void {
    this.peer?.destroy();
    const peer = new Peer(PEER_PREFIX + code, this.options);
    this.peer = peer;

    peer.on('open', () => {
      if (this.peer === peer) handlers.onReady();
    });
    peer.on('connection', (connection) => {
      if (this.peer === peer) handlers.onLink(wrap(connection));
    });
    peer.on('disconnected', () => {
      if (this.peer === peer && !peer.destroyed) peer.reconnect();
    });
    peer.on('error', (error) => {
      if (this.peer !== peer || error.type === 'peer-unavailable') return;
      peer.destroy();
      this.peer = null;
      handlers.onError(error.type === 'unavailable-id' ? 'taken' : 'network');
    });
  }

  dispose(): void {
    this.peer?.destroy();
    this.peer = null;
  }
}

export class PeerClientTransport implements ClientTransport {
  private peer: Peer | null = null;
  private current: DialHandlers | null = null;

  constructor(private readonly options: PeerJSOption) {}

  dial(code: string, handlers: DialHandlers): Dial {
    this.current = handlers;
    let cancelled = false;
    let connection: DataConnection | null = null;
    const peer = this.ensurePeer();

    const connect = () => {
      if (cancelled || peer.destroyed) return;
      connection = peer.connect(PEER_PREFIX + code, { reliable: true, serialization: 'json' });
      const link = wrap(connection);
      let opened = false;
      link.onOpen(() => {
        opened = true;
        if (!cancelled) handlers.onOpen(link);
      });
      link.onClose(() => {
        if (!opened && !cancelled) handlers.onError('network');
      });
    };

    if (peer.open) connect();
    else peer.once('open', connect);

    return {
      cancel: () => {
        cancelled = true;
        if (this.current === handlers) this.current = null;
        peer.off('open', connect);
        connection?.close();
      },
    };
  }

  dispose(): void {
    this.current = null;
    this.peer?.destroy();
    this.peer = null;
  }

  private ensurePeer(): Peer {
    if (this.peer && !this.peer.destroyed) return this.peer;
    const peer = new Peer(this.options);
    peer.on('disconnected', () => {
      if (this.peer === peer && !peer.destroyed) peer.reconnect();
    });
    peer.on('error', (error) => {
      const handlers = this.current;
      if (error.type === 'peer-unavailable') {
        handlers?.onError('unavailable');
        return;
      }
      if (NETWORK_ERRORS.has(error.type) && this.peer === peer) {
        peer.destroy();
        this.peer = null;
      }
      handlers?.onError('network');
    });
    this.peer = peer;
    return peer;
  }
}
