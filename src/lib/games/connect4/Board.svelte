<script lang="ts">
  import type { Slot } from '../types';
  import { COLS, ROWS, type Cell } from './logic';

  let {
    grid,
    aim,
    turn,
    phase,
    winLine,
    held,
    interactive = false,
    oncolumn,
  }: {
    grid: Cell[][];
    aim: number;
    turn: Slot;
    phase: 'play' | 'won' | 'draw';
    winLine: [number, number][];
    held: boolean;
    interactive?: boolean;
    oncolumn?: (col: number) => void;
  } = $props();

  const uid = `c4-${Math.random().toString(36).slice(2, 9)}`;
  const winning = $derived(new Set(winLine.map(([row, col]) => row * COLS + col)));
  const fullColumns = $derived(Array.from({ length: COLS }, (_, col) => grid[0][col] !== null));
  const ends = $derived.by(() => {
    if (winLine.length < 2) return null;
    const sorted = [...winLine].sort((a, b) => a[0] * 10 + a[1] - (b[0] * 10 + b[1]));
    const [r1, c1] = sorted[0];
    const [r2, c2] = sorted[sorted.length - 1];
    return { x1: c1 * 100 + 50, y1: r1 * 100 + 50, x2: c2 * 100 + 50, y2: r2 * 100 + 50 };
  });

  // The disc falls from the lane above the board, through the holes, with a small bounce.
  function fall(_node: Element, { row }: { row: number }) {
    const distance = ((row + 1.15) * 100) / 0.84;
    return {
      duration: 380 + row * 75,
      css: (t: number) => {
        const y = (1 - bounce(t)) * -distance;
        return `transform: translateY(${y}%)`;
      },
    };
  }

  function bounce(t: number): number {
    if (t < 0.62) return (t / 0.62) ** 2;
    if (t < 0.85) {
      const k = (t - 0.735) / 0.115;
      return 1 - 0.07 * (1 - k * k);
    }
    const k = (t - 0.925) / 0.075;
    return 1 - 0.02 * (1 - k * k);
  }
</script>

<div class="board">
  <div class="lane">
    {#if held && phase === 'play'}
      <div class="held" style:transform={`translateX(${aim * 100}%)`}>
        <div class="disc p{turn} floating"></div>
      </div>
    {/if}
  </div>
  <div class="frame">
    <div class="grid discs">
      {#each grid as line, row (row)}
        {#each line as cell, col (col)}
          <div class="slot">
            {#if cell !== null}
              <div
                class="disc p{cell}"
                class:win={winning.has(row * COLS + col)}
                class:dim={phase === 'won' && !winning.has(row * COLS + col)}
                in:fall={{ row }}
              ></div>
            {/if}
          </div>
        {/each}
      {/each}
    </div>

    <svg class="panel" viewBox="-14 -14 728 628" aria-hidden="true">
      <defs>
        <mask id={`${uid}-holes`}>
          <rect x="-14" y="-14" width="728" height="628" fill="#fff" />
          {#each { length: ROWS } as _, row (row)}
            {#each { length: COLS } as _, col (col)}
              <circle cx={col * 100 + 50} cy={row * 100 + 50} r="38" fill="#000" />
            {/each}
          {/each}
        </mask>
      </defs>
      <g mask={`url(#${uid}-holes)`}>
        <rect x="-8" y="-8" width="716" height="616" rx="34" fill="var(--board-dark)" />
        <rect x="-8" y="-8" width="716" height="598" rx="34" fill="var(--board)" />
      </g>
      {#each { length: ROWS } as _, row (row)}
        {#each { length: COLS } as _, col (col)}
          <circle class="rim" cx={col * 100 + 50} cy={row * 100 + 50} r="38" />
        {/each}
      {/each}
      <rect x="-8" y="-8" width="716" height="616" rx="34" class="outline" />
      {#if ends && phase === 'won'}
        <line class="strike" x1={ends.x1} y1={ends.y1} x2={ends.x2} y2={ends.y2} />
      {/if}
    </svg>

    {#if interactive}
      <div class="columns">
        {#each fullColumns as full, col (col)}
          <button class="column" class:aimed={col === aim} disabled={full} aria-label={`Colonne ${col + 1}`} onclick={() => oncolumn?.(col)}
          ></button>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .board {
    --board: #e8213f;
    --board-dark: #a3102c;
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .lane {
    position: relative;
    aspect-ratio: 7 / 1;
    width: 100%;
  }

  .held {
    position: absolute;
    left: 0;
    top: 0;
    width: calc(100% / 7);
    height: 100%;
    display: grid;
    place-items: center;
    transition: transform 0.3s var(--spring);
  }

  .frame {
    position: relative;
    width: 100%;
    aspect-ratio: 7 / 6;
  }

  .grid {
    position: absolute;
    inset: 0;
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    grid-template-rows: repeat(6, minmax(0, 1fr));
  }

  .slot {
    display: grid;
    place-items: center;
  }

  .disc {
    width: 84%;
    aspect-ratio: 1;
    border-radius: 50%;
    background:
      radial-gradient(circle at 34% 30%, rgba(255, 255, 255, 0.6) 0 12%, transparent 13%),
      radial-gradient(circle at 50% 50%, var(--pc) 0 52%, var(--pc-dark) 53% 58%, var(--pc) 59%);
    border: 0.14em solid var(--ink);
    will-change: transform;
  }

  .lane .disc {
    width: 80%;
    box-shadow: 0.1em 0.14em 0 var(--ink);
  }

  .floating {
    animation: bob 1.1s ease-in-out infinite;
  }

  .disc.win {
    animation: glow 0.6s ease-in-out infinite alternate;
  }

  .disc.dim {
    filter: saturate(0.4) brightness(0.7);
    transition: filter 0.6s ease;
  }

  .panel {
    position: absolute;
    inset: -2%;
    width: 104%;
    height: 104%;
    overflow: visible;
    filter: drop-shadow(0.22em 0.28em 0 var(--ink));
    pointer-events: none;
  }

  .rim {
    fill: none;
    stroke: var(--ink);
    stroke-width: 6;
  }

  .outline {
    fill: none;
    stroke: var(--ink);
    stroke-width: 10;
  }

  .strike {
    stroke: var(--cream);
    stroke-width: 22;
    stroke-linecap: round;
    stroke-dasharray: 700;
    stroke-dashoffset: 700;
    filter: drop-shadow(0 0 0 var(--ink));
    paint-order: stroke;
    animation: strike 0.6s 0.5s ease-out forwards;
    opacity: 0.92;
  }

  .columns {
    position: absolute;
    inset: 0;
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
  }

  .column {
    border-radius: 0.6em;
    transition: background 0.15s ease;
  }

  .column.aimed {
    background: rgba(255, 243, 230, 0.28);
  }

  .column:disabled {
    cursor: default;
  }

  @keyframes glow {
    from {
      transform: scale(1);
      filter: brightness(1);
    }
    to {
      transform: scale(1.08);
      filter: brightness(1.25);
    }
  }

  @keyframes strike {
    to {
      stroke-dashoffset: 0;
    }
  }
</style>
