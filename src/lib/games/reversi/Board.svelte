<script lang="ts">
  import type { Slot } from '../types';
  import { SIZE, type Disc } from './logic';

  let {
    board,
    turn,
    moves,
    aim,
    last,
    showMoves = true,
    interactive = false,
    oncell,
  }: {
    board: Disc[];
    turn: Slot;
    moves: number[];
    aim: number | null;
    last: { cell: number; flipped: number[]; seq: number } | null;
    showMoves?: boolean;
    interactive?: boolean;
    oncell?: (cell: number) => void;
  } = $props();

  const legal = $derived(new Set(moves));
  const flipped = $derived(new Map((last?.flipped ?? []).map((cell) => [cell, distance(cell, last?.cell ?? cell)])));

  function distance(a: number, b: number): number {
    return Math.max(Math.abs(Math.floor(a / SIZE) - Math.floor(b / SIZE)), Math.abs((a % SIZE) - (b % SIZE)));
  }
</script>

<div class="board" class:interactive>
  {#each board as disc, cell (cell)}
    {@const playable = legal.has(cell)}
    <button
      class="cell"
      class:playable={playable && showMoves}
      class:aimed={aim === cell}
      disabled={!interactive || !playable}
      aria-label={`Case ${String.fromCharCode(65 + (cell % SIZE))}${Math.floor(cell / SIZE) + 1}`}
      onclick={() => oncell?.(cell)}
    >
      {#if disc !== null}
        {#key `${disc}-${last && (last.cell === cell || flipped.has(cell)) ? last.seq : 0}`}
          <span
            class="disc p{disc}"
            class:placed={last?.cell === cell}
            class:flipped={flipped.has(cell)}
            style:animation-delay={`${(flipped.get(cell) ?? 0) * 90 + 120}ms`}
          ></span>
        {/key}
      {:else if aim === cell}
        <span class="disc ghost p{turn}"></span>
      {:else if playable && showMoves}
        <span class="hint p{turn}"></span>
      {/if}
    </button>
  {/each}
</div>

<style>
  .board {
    width: 100%;
    aspect-ratio: 1;
    display: grid;
    grid-template-columns: repeat(8, minmax(0, 1fr));
    grid-template-rows: repeat(8, minmax(0, 1fr));
    gap: 0.12em;
    padding: 0.4em;
    background: var(--ink);
    border: 0.18em solid var(--ink);
    border-radius: 1em;
    box-shadow: 0.3em 0.4em 0 var(--ink);
  }

  .cell {
    position: relative;
    display: grid;
    place-items: center;
    border-radius: 0.3em;
    background: #19b48a;
    background-image: radial-gradient(circle at 30% 25%, rgba(255, 255, 255, 0.14), transparent 60%);
    perspective: 20em;
  }

  .cell:disabled {
    cursor: default;
  }

  .cell.aimed {
    background-color: #5fe3bd;
  }

  .disc {
    width: 80%;
    aspect-ratio: 1;
    border-radius: 50%;
    background: radial-gradient(circle at 34% 30%, rgba(255, 255, 255, 0.55) 0 12%, transparent 13%), var(--pc);
    border: 0.12em solid var(--ink);
    box-shadow: 0 0.12em 0 var(--ink);
  }

  .disc.placed {
    animation: place 0.45s var(--snap) both;
  }

  .disc.flipped {
    animation: flip 0.5s ease-in-out both;
  }

  .ghost {
    opacity: 0.5;
    animation: bob 0.9s ease-in-out infinite;
  }

  .hint {
    width: 26%;
    aspect-ratio: 1;
    border-radius: 50%;
    background: var(--pc);
    border: 0.08em solid var(--ink);
    opacity: 0.55;
  }

  .interactive .playable {
    background-color: #2fd1a5;
  }

  .interactive .hint {
    width: 34%;
    opacity: 0.85;
    animation: pulse-ring 1.4s ease-out infinite;
  }

  @keyframes place {
    from {
      transform: scale(1.8) translateY(-30%);
      opacity: 0;
    }
    to {
      transform: none;
      opacity: 1;
    }
  }

  @keyframes flip {
    0% {
      transform: rotateY(90deg) translateY(0);
    }
    50% {
      transform: rotateY(30deg) translateY(-25%);
    }
    100% {
      transform: rotateY(0) translateY(0);
    }
  }
</style>
