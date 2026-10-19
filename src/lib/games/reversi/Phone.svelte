<script lang="ts">
  import type { Seats } from '../../room/protocol';
  import { other, type Slot } from '../types';
  import Board from './Board.svelte';
  import type { ReversiPhone } from './logic';

  let { view, seats, act }: { view: ReversiPhone; seats: Seats; me: Slot; act: (action: unknown) => void } = $props();

  let aim = $state<number | null>(null);
  let seq = -1;

  $effect.pre(() => {
    const current = view.last?.seq ?? 0;
    if (current !== seq) {
      seq = current;
      aim = null;
    }
  });

  const partner = $derived(seats[other(view.me)]?.name ?? 'l’autre');

  function cell(index: number) {
    if (!view.myTurn || !view.moves.includes(index)) return;
    if (aim === index) {
      act({ type: 'place', cell: index });
      return;
    }
    aim = index;
    act({ type: 'aim', cell: index });
  }
</script>

<div class="reversi p{view.me}">
  <p class="status" class:mine={view.myTurn}>
    {#if view.phase === 'over'}
      {view.winner === null ? 'Égalité !' : view.winner === view.me ? 'Gagné, le plateau est à toi !' : `${partner} a gagné…`}
    {:else if view.myTurn}
      {view.passed !== null ? `${partner} ne peut pas jouer, encore à toi ! ` : 'À toi ! '}Touche une case marquée, puis encore pour poser.
    {:else}
      Au tour de {partner}…
    {/if}
  </p>
  <div class="counts">
    <span class="p0">{view.counts[0]}</span>
    <span class="p1">{view.counts[1]}</span>
  </div>
  <div class="board">
    <Board
      board={view.board}
      turn={view.turn}
      moves={view.myTurn ? view.moves : []}
      {aim}
      last={view.last}
      interactive={view.myTurn}
      oncell={cell}
    />
  </div>
  {#if view.myTurn}
    <button class="btn player block place" disabled={aim === null} onclick={() => aim !== null && act({ type: 'place', cell: aim })}>
      Poser le pion
    </button>
  {/if}
</div>

<style>
  .reversi {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
  }

  .status {
    font-weight: 800;
    font-size: 1.05rem;
    line-height: 1.35;
    min-height: 2.8em;
  }

  .status.mine {
    padding: 0.4rem 0.8rem;
    border-radius: 0.8rem;
    border: 2px solid var(--ink);
    background: var(--pc);
    color: var(--pc-ink);
    box-shadow: 3px 4px 0 var(--ink);
  }

  .counts {
    display: flex;
    justify-content: center;
    gap: 0.6rem;
  }

  .counts span {
    min-width: 3.4rem;
    padding: 0.1rem 0.6rem;
    border-radius: 0.6rem;
    border: 2px solid var(--ink);
    background: var(--pc);
    color: var(--pc-ink);
    font-family: var(--display);
    font-size: 1.3rem;
    text-align: center;
  }

  .board {
    font-size: 0.75rem;
  }

  .place {
    margin-top: auto;
    min-height: 4rem;
    font-size: 1.4rem;
  }
</style>
