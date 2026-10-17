<script lang="ts">
  import { bounceOut } from 'svelte/easing';
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

  const winning = $derived(new Set(winLine.map(([row, col]) => row * COLS + col)));
  const fullColumns = $derived(Array.from({ length: COLS }, (_, col) => grid[0][col] !== null));

  function drop(_node: Element, { row }: { row: number }) {
    return {
      duration: 320 + row * 70,
      easing: bounceOut,
      css: (t: number) => `transform: translateY(${(1 - t) * -(row + 1.25) * 122}%)`,
    };
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
                in:drop={{ row }}
              ></div>
            {/if}
          </div>
        {/each}
      {/each}
    </div>
    <div class="grid panel" aria-hidden="true">
      {#each { length: ROWS * COLS } as _, index (index)}
        <div class="hole"></div>
      {/each}
    </div>
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
    --board: #2f5fd6;
    --board-dark: #1f44a8;
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
    transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
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

  .discs {
    padding: 2.5%;
    border: 0.22em solid transparent;
  }

  .slot {
    display: grid;
    place-items: center;
  }

  .disc {
    width: 82%;
    aspect-ratio: 1;
    border-radius: 50%;
    background:
      radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.55), transparent 42%),
      radial-gradient(circle at 50% 50%, var(--pc) 58%, var(--pc-dark) 100%);
    box-shadow: inset 0 -0.12em 0 rgba(0, 0, 0, 0.25);
    border: 0.12em solid var(--ink);
  }

  .lane .disc {
    width: 82%;
  }

  .floating {
    animation: bob 1.1s ease-in-out infinite;
  }

  .disc.win {
    animation: glow 0.7s ease-in-out infinite alternate;
    z-index: 1;
  }

  .disc.dim {
    filter: saturate(0.5) brightness(0.75);
  }

  .panel {
    padding: 2.5%;
    background: var(--board);
    border: 0.22em solid var(--ink);
    border-radius: 1em;
    box-shadow:
      0 0.35em 0 var(--ink),
      inset 0 -0.4em 0 var(--board-dark);
  }

  .hole {
    background: radial-gradient(circle at 50% 50%, transparent 0 39%, var(--ink) 39.5% 42%, var(--board) 42.5%);
  }

  .columns {
    position: absolute;
    inset: 0;
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
  }

  .column {
    border-radius: 0.6em;
  }

  .column.aimed {
    background: rgba(255, 255, 255, 0.12);
  }

  .column:disabled {
    cursor: default;
  }

  @keyframes glow {
    from {
      box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.9);
      transform: scale(1);
    }
    to {
      box-shadow: 0 0 0 0.35em rgba(255, 255, 255, 0.85);
      transform: scale(1.06);
    }
  }
</style>
