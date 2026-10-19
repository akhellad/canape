<script lang="ts">
  import type { Seats } from '../../room/protocol';
  import { slap } from '../../ui/motion';
  import PlayerPanel from '../../ui/PlayerPanel.svelte';
  import { other, SLOTS, type Slot } from '../types';
  import Board from './Board.svelte';
  import type { ReversiTv } from './logic';

  let { view, seats }: { view: ReversiTv; seats: Seats } = $props();
  const name = (slot: Slot) => seats[slot]?.name ?? `Joueur ${slot + 1}`;
</script>

<section class="reversi">
  <div class="banner">
    {#if view.phase === 'over'}
      <h2 class="pop" in:slap>
        {#if view.winner === null}Égalité !{:else}<span class="name-tag p{view.winner}">{name(view.winner)}</span> domine le plateau !{/if}
      </h2>
    {:else}
      {#key view.turn}<h2 class="pop">Au tour de <span class="name-tag p{view.turn}">{name(view.turn)}</span></h2>{/key}
    {/if}
    {#if view.passed !== null}
      {#key view.last?.seq}<p class="sticker pass" in:slap>{name(view.passed)} ne peut pas jouer : il passe son tour</p>{/key}
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
          mood={view.phase === 'over' && view.winner === other(slot)
            ? 'sad'
            : view.counts[slot] >= view.counts[other(slot)]
              ? 'happy'
              : 'wow'}
        >
          {#key view.counts[slot]}<b class="count" in:slap>{view.counts[slot]}</b>{/key}
          <span>pions</span>
        </PlayerPanel>
      </div>
    {/each}
    <div class="board" style:order={1}>
      <Board board={view.board} turn={view.turn} moves={view.moves} aim={view.aim} last={view.last} />
    </div>
  </div>
</section>

<style>
  .reversi {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1em;
  }

  .banner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5em;
    min-height: 4.6em;
  }

  h2 {
    font-size: 3em;
    animation: pop-in 0.35s var(--spring);
  }

  .pass {
    background: var(--cream);
    font-size: 1em;
  }

  .row {
    flex: 1;
    min-height: 0;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 3.4em;
  }

  .board {
    height: 100%;
    max-height: 70vh;
    aspect-ratio: 1;
    font-size: 1.1em;
  }

  .count {
    font-family: var(--display);
    font-weight: 400;
    font-size: 3em;
    line-height: 1;
  }
</style>
