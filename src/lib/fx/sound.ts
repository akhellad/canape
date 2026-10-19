import type { FxKind } from '../games/types';

let context: AudioContext | null = null;
let master: GainNode | null = null;

export function audioReady(): boolean {
  return context?.state === 'running';
}

export async function unlockAudio(): Promise<boolean> {
  try {
    if (!context) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return false;
      context = new Ctor();
      master = context.createGain();
      master.gain.value = 0.5;
      master.connect(context.destination);
    }
    if (context.state !== 'running') await context.resume();
    return context.state === 'running';
  } catch {
    return false;
  }
}

function tone(
  frequency: number,
  start: number,
  duration: number,
  options: { type?: OscillatorType; gain?: number; to?: number } = {},
): void {
  if (!context || !master) return;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const at = context.currentTime + start;
  oscillator.type = options.type ?? 'sine';
  oscillator.frequency.setValueAtTime(frequency, at);
  if (options.to) oscillator.frequency.exponentialRampToValueAtTime(options.to, at + duration);
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(options.gain ?? 0.3, at + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
  oscillator.connect(gain).connect(master);
  oscillator.start(at);
  oscillator.stop(at + duration + 0.05);
}

function noise(
  start: number,
  duration: number,
  options: { gain?: number; from?: number; to?: number; type?: BiquadFilterType } = {},
): void {
  if (!context || !master) return;
  const length = Math.floor(context.sampleRate * duration);
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  const source = context.createBufferSource();
  source.buffer = buffer;
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  const at = context.currentTime + start;
  filter.type = options.type ?? 'lowpass';
  filter.frequency.setValueAtTime(options.from ?? 2000, at);
  if (options.to) filter.frequency.exponentialRampToValueAtTime(options.to, at + duration);
  gain.gain.setValueAtTime(options.gain ?? 0.4, at);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
  source.connect(filter).connect(gain).connect(master);
  source.start(at);
}

function notes(sequence: number[], step: number, options: { type?: OscillatorType; gain?: number; length?: number } = {}): void {
  sequence.forEach((frequency, index) => tone(frequency, index * step, options.length ?? step * 1.6, options));
}

export function playFx(kind: FxKind): void {
  if (!audioReady()) return;
  switch (kind) {
    case 'join':
      notes([523, 784], 0.11, { type: 'triangle', gain: 0.25 });
      break;
    case 'turn':
      tone(660, 0, 0.12, { type: 'triangle', gain: 0.15 });
      break;
    case 'drop':
      tone(220, 0, 0.18, { type: 'triangle', gain: 0.35, to: 110 });
      noise(0, 0.08, { gain: 0.25, from: 3000 });
      break;
    case 'aim':
      tone(1200, 0, 0.04, { type: 'square', gain: 0.06 });
      break;
    case 'fire':
      noise(0, 0.9, { gain: 0.25, from: 600, to: 3500, type: 'bandpass' });
      tone(900, 0, 0.9, { type: 'sine', gain: 0.08, to: 300 });
      break;
    case 'hit':
      noise(0, 0.6, { gain: 0.6, from: 1500, to: 120 });
      tone(90, 0, 0.5, { type: 'sine', gain: 0.5, to: 40 });
      break;
    case 'sunk':
      noise(0, 1.1, { gain: 0.7, from: 1200, to: 80 });
      notes([392, 330, 262, 196], 0.14, { type: 'square', gain: 0.1 });
      break;
    case 'miss':
      noise(0, 0.7, { gain: 0.35, from: 4000, to: 400, type: 'bandpass' });
      break;
    case 'match':
      notes([880, 1320], 0.06, { type: 'triangle', gain: 0.22 });
      break;
    case 'error':
      tone(140, 0, 0.25, { type: 'sawtooth', gain: 0.12 });
      break;
    case 'correct':
      notes([523, 659, 784], 0.08, { type: 'triangle', gain: 0.22 });
      break;
    case 'wrong':
      tone(330, 0, 0.2, { type: 'triangle', gain: 0.15, to: 220 });
      break;
    case 'reveal':
      for (let i = 0; i < 8; i++) tone(180 + i * 25, i * 0.1, 0.06, { type: 'square', gain: 0.05 });
      break;
    case 'flip':
      for (let i = 0; i < 4; i++) tone(500 + i * 120, i * 0.05, 0.06, { type: 'triangle', gain: 0.12 });
      noise(0, 0.06, { gain: 0.2, from: 4000 });
      break;
    case 'lock':
      tone(880, 0, 0.08, { type: 'square', gain: 0.08 });
      tone(1320, 0.06, 0.1, { type: 'triangle', gain: 0.1 });
      break;
    case 'tick':
      tone(1000, 0, 0.05, { type: 'square', gain: 0.05 });
      break;
    case 'win':
      notes([523, 659, 784, 1047, 784, 1047], 0.12, { type: 'triangle', gain: 0.25 });
      break;
    case 'lose':
      notes([392, 349, 311, 262], 0.18, { type: 'triangle', gain: 0.2 });
      break;
  }
}
