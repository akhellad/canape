<script lang="ts">
  import type { Seats } from '../../room/protocol';
  import { other, type Slot } from '../types';
  import Board from './Board.svelte';
  import { dropRow, type Connect4Phone } from './logic';

  let { view, seats, act }: { view: Connect4Phone; seats: Seats; me: Slot; act: (action: unknown) => void } = $props();

  let aim = $state(3);
  let armed = $state<number | null>(null);
  let turn = -1;

  $effect.pre(() => {
    aim = view.aim;
    if (view.moves !== turn) {
      turn = view.moves;
      armed = null;
    }
  });

  const partner = $derived(seats[other(view.me)]?.name ?? 'l’autre');

  function column(col: number) {
    if (!view.myTurn || dropRow(view.grid, col) === -1) return;
    if (armed === col) {
      act({ type: 'drop', col });
      return;
    }
    armed = col;
    aim = col;
    act({ type: 'aim', col });
  }
</script>

<div class="c4 p{view.me}">
  <p class="status" class:mine={view.myTurn}>
    {#if view.phase === 'won'}
      {view.winner === view.me ? 'Gagné, bien joué !' : `${partner} a gagné…`}
    {:else if view.phase === 'draw'}
      Match nul !
    {:else if view.myTurn}
      À toi ! Vise une colonne, puis touche-la encore pour lâcher.
    {:else}
      Au tour de {partner}…
    {/if}
  </p>
  <div class="board">
    <Board
      grid={view.grid}
      {aim}
      turn={view.turn}
      phase={view.phase}
      winLine={view.winLine}
      held={view.myTurn}
      interactive={view.myTurn}
      oncolumn={column}
    />
  </div>
  {#if view.myTurn}
    <button class="btn player block drop" onclick={() => act({ type: 'drop', col: aim })}>Lâcher le jeton</button>
  {/if}
</div>

<style>
  .c4 {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .status {
    font-weight: 800;
    font-size: 1.15rem;
    line-height: 1.35;
    min-height: 3em;
  }

  .status.mine {
    color: var(--pc);
  }

  .board {
    font-size: 0.8rem;
  }

  .drop {
    margin-top: auto;
    min-height: 4rem;
    font-size: 1.5rem;
  }
</style>
