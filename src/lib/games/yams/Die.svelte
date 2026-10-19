<script lang="ts">
  import { untrack } from 'svelte';

  let {
    value,
    held = false,
    rolling = false,
    delay = 0,
    size = '4em',
  }: { value: number; held?: boolean; rolling?: boolean; delay?: number; size?: string } = $props();

  // Only tumble when the die appears after a roll, not when it gets held or released later.
  const tumble = untrack(() => rolling);

  const PIPS: Record<number, [number, number][]> = {
    1: [[50, 50]],
    2: [
      [28, 28],
      [72, 72],
    ],
    3: [
      [28, 28],
      [50, 50],
      [72, 72],
    ],
    4: [
      [28, 28],
      [72, 28],
      [28, 72],
      [72, 72],
    ],
    5: [
      [28, 28],
      [72, 28],
      [50, 50],
      [28, 72],
      [72, 72],
    ],
    6: [
      [28, 26],
      [72, 26],
      [28, 50],
      [72, 50],
      [28, 74],
      [72, 74],
    ],
  };
</script>

<svg
  class="die"
  class:held
  class:rolling={tumble}
  viewBox="0 0 100 100"
  width={size}
  height={size}
  style:animation-delay={`${delay}ms`}
  aria-label={`Dé : ${value}`}
  role="img"
>
  <rect x="5" y="5" width="90" height="90" rx="20" class="body" />
  {#each PIPS[value] ?? [] as [x, y], index (index)}
    <circle cx={x} cy={y} r="9" class="pip" />
  {/each}
</svg>

<style>
  .die {
    display: block;
    overflow: visible;
    filter: drop-shadow(0.08em 0.1em 0 var(--ink));
    transition: transform 0.25s var(--spring);
  }

  .body {
    fill: var(--cream);
    stroke: var(--ink);
    stroke-width: 5;
  }

  .pip {
    fill: var(--ink);
  }

  .held .body {
    fill: var(--butter);
  }

  .held {
    transform: translateY(-14%) rotate(-4deg);
  }

  .rolling {
    animation: tumble 0.6s cubic-bezier(0.2, 0.8, 0.3, 1.2) both;
  }

  @keyframes tumble {
    0% {
      transform: translateY(-60%) rotate(-200deg) scale(0.6);
      opacity: 0;
    }
    60% {
      transform: translateY(6%) rotate(12deg) scale(1.05);
      opacity: 1;
    }
    100% {
      transform: none;
    }
  }
</style>
