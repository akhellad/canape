import { joinUrl } from '../config';
import { readStorage, STORAGE_KEYS } from '../storage';

const WIDTH = 390;
const HEIGHT = 780;
let opened = 0;

// Browsers allow a single window.open per click, so each click opens one player.
// joinUrl keeps the TV's transport, otherwise players dial a host that isn't listening.
export function launchDevPlayer(): void {
  const code = readStorage(STORAGE_KEYS.room);
  if (!code) return;
  const left = 1060 + (opened % 4) * (WIDTH + 20);
  opened += 1;
  window.open(joinUrl(code), '_blank', `noopener,width=${WIDTH},height=${HEIGHT},left=${left},top=60`);
}
