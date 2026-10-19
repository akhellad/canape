<script lang="ts">
  import type { Seats } from '../../room/protocol';
  import { slap } from '../../ui/motion';
  import PlayerPanel from '../../ui/PlayerPanel.svelte';
  import { other, SLOTS, type Slot } from '../types';
  import Card from './Card.svelte';
  import type { MemoryTv } from './logic';

  let { view, seats }: { view: MemoryTv; seats: Seats } = $props();
  const name = (slot: Slot) => seats[slot]?.name ?? `Joueur ${slot + 1}`;
  const miss = $derived(view.busy && view.last?.match === false);
</script>

<section class="memory">
  <div class="banner">
    {#if view.phase === 'over'}
      <h2 class="pop" in:slap>
        {#if view.winner === null}Égalité !{:else}<span class="name-tag p{view.winner}">{name(view.winner)}</span> a la meilleure mémoire !{/if}
      </h2>
    {:else}
      {#key view.turn}<h2 class="pop turn">Au tour de <span class="name-tag p{view.turn}">{name(view.turn)}</span></h2>{/key}
    {/if}
    {#if view.busy && view.last}
      {#key view.last.seq}
        <p class="sticker verdict" class:ok={view.last.match} in:slap>
          {view.last.match ? (view.streak > 1 ? `Paire ! Série de ${view.streak}` : 'Paire ! Rejoue') : 'Raté…'}
        </p>
      {/key}
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
          mood={view.phase === 'over' && view.winner === other(slot) ? 'sad' : 'happy'}
        >
          {#key view.scores[slot]}<b class="count" in:slap>{view.scores[slot]}</b>{/key}
          <span>paire{view.scores[slot] > 1 ? 's' : ''}</span>
        </PlayerPanel>
      </div>
    {/each}
    <div class="grid" style:order={1}>
      {#each view.cards as card, index (index)}
        <Card {card} {miss} />
      {/each}
    </div>
  </div>
</section>

<style>
  .memory {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1em;
  }

  .banner {
    display: flex;
    align-items: center;
    gap: 1em;
    min-height: 4em;
  }

  h2 {
    font-size: 2.8em;
  }

  .turn {
    animation: pop-in 0.35s var(--spring);
  }

  .verdict {
    font-size: 1.2em;
    background: var(--paper-2);
  }

  .verdict.ok {
    background: var(--mint);
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

  .grid {
    width: min(100%, 38em);
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 0.8em;
    font-size: 1em;
  }

  .count {
    font-family: var(--display);
    font-weight: 400;
    font-size: 3em;
    line-height: 1;
  }
</style>
