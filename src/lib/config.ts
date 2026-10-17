import { LocalClientTransport, LocalHostTransport } from './net/local-transport';
import { PeerClientTransport, PeerHostTransport, peerOptions } from './net/peer-transport';
import type { ClientTransport, HostTransport } from './net/transport';

const params = new URLSearchParams(location.search);

export const roomParam = params.has('room') ? (params.get('room') ?? '').trim().toUpperCase() : null;
export const transportMode: 'local' | 'peer' = params.get('transport') === 'local' ? 'local' : 'peer';
export const peerServer = params.get('peer');

export function joinUrl(code: string): string {
  const url = new URL(location.href);
  url.search = '';
  url.hash = '';
  url.searchParams.set('room', code);
  if (transportMode === 'local') url.searchParams.set('transport', 'local');
  if (peerServer) url.searchParams.set('peer', peerServer);
  return url.toString();
}

export function displayUrl(): string {
  return `${location.host}${location.pathname}`.replace(/\/$/, '');
}

export function createHostTransport(): HostTransport {
  return transportMode === 'local' ? new LocalHostTransport() : new PeerHostTransport(peerOptions(peerServer));
}

export function createClientTransport(): ClientTransport {
  return transportMode === 'local' ? new LocalClientTransport() : new PeerClientTransport(peerOptions(peerServer));
}
