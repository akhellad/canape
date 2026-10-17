<script lang="ts">
  import { CATALOG } from '../lib/games/catalog';
  import { SLOTS, type GameId } from '../lib/games/types';
  import type { Seats } from '../lib/room/protocol';
  import Blob from '../lib/ui/Blob.svelte';
  import Icon from '../lib/ui/Icon.svelte';

  let { game, ready, seats }: { game: GameId; ready: [boolean, boolean]; seats: Seats } = $props();
  const definition = $derived(CATALOG[game]);
</script>

<section class="rules">
  <header style:--accent={definition.accent}>
    <div class="badge"><Icon name={definition.icon} size="3.4em" /></div>
    <div>
      <span class="kicker">{definition.coop ? 'Jeu en équipe' : 'Jeu en duel'}</span>
      <h1>{definition.title}</h1>
    </div>
  </header>

  <ol class="list">
    {#each definition.rules as rule, index (index)}
      <li class="paper" style:animation-delay={`${120 + index * 120}ms`}>
        <span class="number">{index + 1}</span>
        <p>{rule}</p>
      </li>
    {/each}
  </ol>

  <div class="ready">
    {#each SLOTS as slot (slot)}
      <div class="who p{slot}" class:ok={ready[slot]}>
        <Blob {slot} size="2.4em" bounce={ready[slot]} />
        <span class="name">{seats[slot]?.name ?? `Joueur ${slot + 1}`}</span>
        <span class="state">{ready[slot] ? 'Prêt !' : 'lit les règles…'}</span>
      </div>
    {/each}
  </div>
</section>

<style>
  .rules {
    width: 100%;
    max-width: 66em;
    display: flex;
    flex-direction: column;
    gap: 1.8em;
    animation: rise 0.45s ease-out;
  }

  header {
    display: flex;
    align-items: center;
    gap: 1.2em;
  }

  .badge {
    width: 5.4em;
    height: 5.4em;
    display: grid;
    place-items: center;
    border-radius: 1.3em;
    background: var(--accent);
    border: 0.18em solid var(--ink);
    box-shadow: var(--shadow);
  }

  .kicker {
    color: var(--muted);
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-size: 0.9em;
  }

  h1 {
    font-size: 3.6em;
  }

  .list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.9em;
  }

  .list li {
    display: flex;
    align-items: center;
    gap: 1em;
    padding: 0.9em 1.3em;
    font-size: 1.3em;
    line-height: 1.35;
    animation: rise 0.5s backwards ease-out;
  }

  .number {
    flex-shrink: 0;
    width: 1.9em;
    height: 1.9em;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: var(--yellow);
    border: 0.12em solid var(--ink);
    font-family: var(--display);
  }

  .ready {
    display: flex;
    justify-content: center;
    gap: 2em;
  }

  .who {
    display: flex;
    align-items: center;
    gap: 0.7em;
    padding: 0.5em 1.2em 0.5em 0.7em;
    border-radius: 999px;
    border: 0.14em dashed var(--pc);
    font-weight: 800;
    font-size: 1.15em;
  }

  .who.ok {
    border-style: solid;
    background: var(--pc-soft);
  }

  .name {
    font-family: var(--display);
    font-size: 1.3em;
  }

  .state {
    color: var(--muted);
  }

  .ok .state {
    color: var(--text);
  }
</style>
