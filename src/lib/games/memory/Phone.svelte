<script lang="ts">
  import type { Seats } from '../../room/protocol';
  import { other, type Slot } from '../types';
  import Card from './Card.svelte';
  import type { MemoryPhone } from './logic';

  let { view, seats, act }: { view: MemoryPhone; seats: Seats; me: Slot; act: (action: unknown) => void } = $props();
  const partner = $derived(seats[other(view.me)]?.name ?? 'l’autre');
  const miss = $derived(view.busy && view.last?.match === false);
</script>

<div class="memory p{view.me}">
  <p class="status" class:mine={view.myTurn}>
    {#if view.phase === 'over'}
      {view.winner === null ? 'Égalité !' : view.winner === view.me ? 'Gagné, quelle mémoire !' : `${partner} a gagné…`}
    {:else if view.busy && view.last}
      {view.last.match ? 'Paire !' : 'Raté…'}
    {:else if view.myTurn}
      À toi ! Retourne deux cartes.
    {:else}
      Au tour de {partner}… Retiens bien les cartes !
    {/if}
  </p>
  <div class="scores">
    <span class="p0">{view.scores[0]}</span>
    <span class="p1">{view.scores[1]}</span>
  </div>
  <div class="grid">
    {#each view.cards as card, index (index)}
      <Card {card} {miss} interactive={view.myTurn} onflip={() => act({ type: 'flip', card: index })} />
    {/each}
  </div>
</div>

<style>
  .memory {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
  }

  .status {
    font-weight: 800;
    font-size: 1.05rem;
    min-height: 2.8em;
    line-height: 1.35;
  }

  .status.mine {
    padding: 0.4rem 0.8rem;
    border-radius: 0.8rem;
    border: 2px solid var(--ink);
    background: var(--pc);
    color: var(--pc-ink);
    box-shadow: 3px 4px 0 var(--ink);
  }

  .scores {
    display: flex;
    justify-content: center;
    gap: 0.6rem;
  }

  .scores span {
    min-width: 3rem;
    padding: 0.1rem 0.6rem;
    border-radius: 0.6rem;
    border: 2px solid var(--ink);
    background: var(--pc);
    color: var(--pc-ink);
    font-family: var(--display);
    font-size: 1.3rem;
    text-align: center;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.5rem;
    font-size: 0.8rem;
  }
</style>
