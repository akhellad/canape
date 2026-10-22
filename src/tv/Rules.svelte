<script lang="ts">
  import { CATALOG } from '../lib/games/catalog';
  import { settingLabel, type Settings } from '../lib/games/settings';
  import { SLOTS, type GameId } from '../lib/games/types';
  import type { Seats } from '../lib/room/protocol';
  import Blob from '../lib/ui/Blob.svelte';
  import GameArt from '../lib/ui/GameArt.svelte';

  let { game, ready, settings, seats }: { game: GameId; ready: [boolean, boolean]; settings: Settings; seats: Seats } = $props();
  const definition = $derived(CATALOG[game]);
  const choices = $derived((definition.settings ?? []).filter((def) => def.kind === 'choice'));
  const lists = $derived((definition.settings ?? []).filter((def) => def.kind === 'list'));
</script>

<section class="rules" style:--accent={definition.accent}>
  <header>
    <div class="badge"><GameArt {game} size="5em" animated /></div>
    <div>
      <span class="sticker">{definition.coop ? 'Jeu en équipe' : 'Jeu en duel'}</span>
      <h1 class="pop">{definition.title}</h1>
    </div>
  </header>

  <div class="body" class:split={definition.settings?.length}>
    <ol class="list">
      {#each definition.rules as rule, index (index)}
        <li class="paper" style:--tilt={`${index % 2 ? 0.8 : -0.8}deg`} style:animation-delay={`${150 + index * 140}ms`}>
          <span class="number">{index + 1}</span>
          <p>{rule}</p>
        </li>
      {/each}
    </ol>

    {#if definition.settings?.length}
      <div class="settings paper">
        <h2>Réglages</h2>
        {#each choices as def (def.id)}
          <span class="setting"><span>{def.label}</span><b>{settingLabel(def, settings[def.id])}</b></span>
        {/each}
        {#each lists as def (def.id)}
          {@const items = settings[def.id]}
          <div class="items">
            <span class="label">{def.label}</span>
            {#if Array.isArray(items)}
              {#each items as item (item)}<span class="chip">{item}</span>{/each}
            {/if}
          </div>
        {/each}
        <p class="tip">Modifiables sur les téléphones</p>
      </div>
    {/if}
  </div>

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
    max-width: 72em;
    display: flex;
    flex-direction: column;
    gap: 1.4em;
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
    padding: 0.75em 1.4em;
    font-size: 1.3em;
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

  .split .list {
    gap: 0.7em;
  }

  .split .list li {
    padding: 0.55em 1.1em;
    font-size: 1.12em;
  }

  .body.split {
    display: grid;
    grid-template-columns: minmax(0, 1.7fr) minmax(0, 1fr);
    gap: 1.6em;
    align-items: start;
  }

  .settings {
    display: flex;
    flex-direction: column;
    gap: 0.6em;
    padding: 1em 1.2em;
    transform: rotate(1deg);
    animation: drop-in 0.6s var(--snap) backwards;
    animation-delay: 400ms;
  }

  h2 {
    margin: 0;
    font-family: var(--display);
    font-weight: 400;
    font-size: 1.6em;
  }

  .setting {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.5em;
    font-weight: 700;
    font-size: 1.15em;
  }

  .setting b {
    font-family: var(--display);
    font-weight: 400;
    font-size: 1.25em;
  }

  .items {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.4em;
  }

  .label {
    flex-basis: 100%;
    font-weight: 800;
    font-size: 1.15em;
  }

  .chip {
    padding: 0.15em 0.7em;
    border-radius: 999px;
    border: 0.12em solid var(--ink);
    background: var(--butter);
    color: var(--ink);
    font-weight: 800;
  }

  .tip {
    margin: 0;
    color: var(--ink-2);
    font-weight: 700;
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
