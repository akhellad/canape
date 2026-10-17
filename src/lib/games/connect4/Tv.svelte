<script lang="ts">
  import type { Seats } from '../../room/protocol';
  import PlayerPanel from '../../ui/PlayerPanel.svelte';
  import { SLOTS } from '../types';
  import Board from './Board.svelte';
  import type { Connect4Tv } from './logic';

  let { view, seats }: { view: Connect4Tv; seats: Seats } = $props();
  const name = (slot: 0 | 1) => seats[slot]?.name ?? `Joueur ${slot + 1}`;
</script>

<section class="c4">
  <div class="banner">
    {#if view.phase === 'won' && view.winner !== null}
      <h2 class="win p{view.winner}">{name(view.winner)} aligne quatre jetons !</h2>
    {:else if view.phase === 'draw'}
      <h2>Grille pleine : match nul !</h2>
    {:else}
      <h2>Au tour de <span class="p{view.turn} who">{name(view.turn)}</span></h2>
    {/if}
  </div>
  <div class="row">
    {#each SLOTS as slot (slot)}
      <div class="side" style:order={slot === 0 ? 0 : 2}>
        <PlayerPanel
          {slot}
          name={name(slot)}
          active={view.phase === 'play' && view.turn === slot}
          crown={view.winner === slot}
          mood={view.phase === 'won' && view.winner !== slot ? 'sad' : 'happy'}
        >
          <div class="sample p{slot}"></div>
        </PlayerPanel>
      </div>
    {/each}
    <div class="board" style:order={1}>
      <Board grid={view.grid} aim={view.aim} turn={view.turn} phase={view.phase} winLine={view.winLine} held />
    </div>
  </div>
</section>

<style>
  .c4 {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.6em;
  }

  .banner h2 {
    font-size: 2.4em;
    text-align: center;
  }

  .who {
    color: var(--pc);
  }

  .win {
    color: var(--pc);
    animation: pop-in 0.5s ease-out;
  }

  .row {
    flex: 1;
    min-height: 0;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 3em;
  }

  .board {
    height: 100%;
    max-height: 72vh;
    aspect-ratio: 7 / 7;
    display: flex;
    align-items: flex-end;
  }

  .sample {
    width: 2.2em;
    height: 2.2em;
    border-radius: 50%;
    background: var(--pc);
    border: 0.14em solid var(--ink);
  }
</style>
