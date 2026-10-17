import type { Link } from './link';

export type ListenError = 'taken' | 'network';
export type DialError = 'unavailable' | 'network';

export interface ListenHandlers {
  onReady(): void;
  onLink(link: Link): void;
  onError(error: ListenError): void;
}

export interface HostTransport {
  listen(code: string, handlers: ListenHandlers): void;
  dispose(): void;
}

export interface DialHandlers {
  onOpen(link: Link): void;
  onError(error: DialError): void;
}

export interface Dial {
  cancel(): void;
}

export interface ClientTransport {
  dial(code: string, handlers: DialHandlers): Dial;
  dispose(): void;
}
