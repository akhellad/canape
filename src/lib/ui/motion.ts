import { backOut, cubicIn, cubicOut, elasticOut } from 'svelte/easing';

function reduced(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** A screen arriving: slides up like a card dealt on the table. */
export function enter(_node: Element, { delay = 140, duration = 520 }: { delay?: number; duration?: number } = {}) {
  if (reduced()) return { duration: 0 };
  return {
    delay,
    duration,
    css: (t: number) => {
      const eased = backOut(t);
      const fade = cubicOut(Math.min(1, t * 2));
      return `opacity: ${fade}; transform: translateY(${(1 - eased) * 3}em) rotate(${(1 - eased) * -1.5}deg) scale(${0.96 + 0.04 * eased})`;
    },
  };
}

/** A screen leaving: shrinks and drops away quickly. */
export function leave(_node: Element, { duration = 200 }: { duration?: number } = {}) {
  if (reduced()) return { duration: 0 };
  return {
    duration,
    css: (t: number) => {
      const u = 1 - cubicIn(1 - t);
      return `opacity: ${u}; transform: translateY(${(1 - u) * 1.2}em) scale(${0.94 + 0.06 * u})`;
    },
  };
}

/** Pops in with an overshoot, like a sticker slapped on. */
export function slap(
  _node: Element,
  { delay = 0, duration = 520, rotate = -8 }: { delay?: number; duration?: number; rotate?: number } = {},
) {
  if (reduced()) return { duration: 0 };
  return {
    delay,
    duration,
    css: (t: number) => {
      const eased = elasticOut(t);
      return `opacity: ${Math.min(1, t * 3)}; transform: scale(${0.3 + 0.7 * eased}) rotate(${(1 - eased) * rotate}deg)`;
    },
  };
}

/** Flips in around the vertical axis, like a card being turned over. */
export function flipIn(_node: Element, { delay = 0, duration = 600 }: { delay?: number; duration?: number } = {}) {
  if (reduced()) return { duration: 0 };
  return {
    delay,
    duration,
    css: (t: number) => {
      const eased = backOut(t);
      return `transform: perspective(40em) rotateY(${(1 - eased) * 90}deg); opacity: ${Math.min(1, t * 4)}`;
    },
  };
}
