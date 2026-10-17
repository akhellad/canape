<script lang="ts">
  import { CATALOG } from '../lib/games/catalog';
  import { other, type GameId, type Slot } from '../lib/games/types';
  import type { Seats } from '../lib/room/protocol';
  import Icon from '../lib/ui/Icon.svelte';

  let {
    game,
    ready,
    slot,
    seats,
    onready,
    onback,
  }: { game: GameId; ready: [boolean, boolean]; slot: Slot; seats: Seats; onready: () => void; onback: () => void } = $props();

  const definition = $derived(CATALOG[game]);
  const partner = $derived(seats[other(slot)]?.name ?? 'l’autre');
</script>

<div class="rules">
  <header style:--accent={definition.accent}>
    <span class="badge"><Icon name={definition.icon} size="2.2rem" /></span>
    <h1>{definition.title}</h1>
  </header>
  <ol>
    {#each definition.rules as rule, index (index)}
      <li><span>{index + 1}</span>{rule}</li>
    {/each}
  </ol>
  <div class="actions">
    {#if ready[slot]}
      <p class="wait">{ready[other(slot)] ? 'C’est parti !' : `Prêt ! On attend ${partner}…`}</p>
    {:else}
      <button class="btn go block" onclick={onready}>Je suis prêt !</button>
    {/if}
    <button class="btn ghost block" onclick={onback}>Changer de jeu</button>
  </div>
</div>

<style>
  .rules {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    flex: 1;
  }

  header {
    display: flex;
    align-items: center;
    gap: 0.8rem;
  }

  .badge {
    width: 3.4rem;
    height: 3.4rem;
    display: grid;
    place-items: center;
    border-radius: 0.9rem;
    background: var(--accent);
    border: 2px solid var(--ink);
  }

  h1 {
    font-size: 2rem;
  }

  ol {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  li {
    display: flex;
    gap: 0.7rem;
    line-height: 1.4;
    background: var(--plum-2);
    border-radius: 0.9rem;
    padding: 0.7rem 0.8rem;
  }

  li span {
    flex-shrink: 0;
    width: 1.6rem;
    height: 1.6rem;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: var(--yellow);
    color: var(--ink);
    font-family: var(--display);
  }

  .actions {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
  }

  .wait {
    text-align: center;
    font-weight: 800;
    font-size: 1.15rem;
    padding: 0.8rem;
  }
</style>
