<script lang="ts">
  import { CATALOG } from '../lib/games/catalog';
  import { other, type GameId, type Slot } from '../lib/games/types';
  import type { Seats } from '../lib/room/protocol';
  import GameArt from '../lib/ui/GameArt.svelte';

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

<div class="rules" style:--accent={definition.accent}>
  <header style:--accent={definition.accent}>
    <span class="badge"><GameArt {game} size="2.8rem" animated /></span>
    <h1 class="pop">{definition.title}</h1>
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
    width: 4rem;
    height: 4rem;
    flex-shrink: 0;
    box-shadow: 3px 4px 0 var(--ink);
    transform: rotate(-4deg);
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
    background: var(--cream);
    border: 2px solid var(--ink);
    box-shadow: 3px 4px 0 var(--ink);
    border-radius: 0.9rem;
    padding: 0.7rem 0.8rem;
    font-weight: 600;
  }

  li span {
    flex-shrink: 0;
    width: 1.6rem;
    height: 1.6rem;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: var(--accent);
    border: 2px solid var(--ink);
    color: var(--cream);
    -webkit-text-stroke: 0.05em var(--ink);
    paint-order: stroke fill;
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
