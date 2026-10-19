<script lang="ts">
  import { CATALOG } from '../lib/games/catalog';
  import { SLOTS, type GameId } from '../lib/games/types';
  import type { Seats } from '../lib/room/protocol';
  import Blob from '../lib/ui/Blob.svelte';
  import GameArt from '../lib/ui/GameArt.svelte';

  let { game, ready, seats }: { game: GameId; ready: [boolean, boolean]; seats: Seats } = $props();
  const definition = $derived(CATALOG[game]);
</script>

<section class="rules" style:--accent={definition.accent}>
  <header>
    <div class="badge"><GameArt {game} size="5em" animated /></div>
    <div>
      <span class="sticker">{definition.coop ? 'Jeu en équipe' : 'Jeu en duel'}</span>
      <h1 class="pop">{definition.title}</h1>
    </div>
  </header>

  <ol class="list">
    {#each definition.rules as rule, index (index)}
      <li class="paper" style:--tilt={`${index % 2 ? 0.8 : -0.8}deg`} style:animation-delay={`${150 + index * 140}ms`}>
        <span class="number">{index + 1}</span>
        <p>{rule}</p>
      </li>
    {/each}
  </ol>

  <div class="ready">
    {#each SLOTS as slot (slot)}
      <div class="who p{slot}" class:ok={ready[slot]}>
        <Blob {slot} size="2.4em" bounce={ready[slot]} mood={ready[slot] ? 'happy' : 'wink'} />
        <span class="name">{seats[slot]?.name ?? `Joueur ${slot + 1}`}</span>
        <span class="state">{ready[slot] ? 'Prêt !' : 'lit les règles…'}</span>
      </div>
    {/each}
  </div>
</section>

<style>
  .rules {
    width: 100%;
    max-width: 68em;
    display: flex;
    flex-direction: column;
    gap: 1.8em;
  }

  header {
    display: flex;
    align-items: center;
    gap: 1.4em;
  }

  .badge {
    width: 7.4em;
    height: 7.4em;
    display: grid;
    place-items: center;
    border-radius: 1.4em;
    background: var(--accent);
    border: 0.18em solid var(--ink);
    box-shadow: var(--shadow);
    transform: rotate(-4deg);
  }

  .sticker {
    transform: rotate(-3deg);
    margin-bottom: 0.4em;
  }

  h1 {
    font-size: 4.4em;
  }

  .list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 1em;
  }

  .list li {
    display: flex;
    align-items: center;
    gap: 1em;
    padding: 0.9em 1.4em;
    font-size: 1.35em;
    font-weight: 600;
    line-height: 1.35;
    transform: rotate(var(--tilt));
    animation: drop-in 0.6s var(--snap) backwards;
  }

  .number {
    flex-shrink: 0;
    width: 1.9em;
    height: 1.9em;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: var(--accent);
    border: 0.12em solid var(--ink);
    font-family: var(--display);
    color: var(--cream);
    -webkit-text-stroke: 0.06em var(--ink);
    paint-order: stroke fill;
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
    padding: 0.5em 1.3em 0.5em 0.8em;
    border-radius: 999px;
    border: 0.15em dashed var(--ink);
    font-weight: 800;
    font-size: 1.15em;
    transition: transform 0.4s var(--spring);
  }

  .who.ok {
    border-style: solid;
    background: var(--pc);
    color: var(--pc-ink);
    box-shadow: var(--shadow-sm);
    transform: scale(1.06) rotate(-1.5deg);
  }

  .name {
    font-family: var(--display);
    font-weight: 400;
    font-size: 1.3em;
  }

  .state {
    opacity: 0.8;
  }
</style>
