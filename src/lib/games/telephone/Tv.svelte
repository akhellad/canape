<script lang="ts">
  import { backOut } from 'svelte/easing';
  import { fly, scale } from 'svelte/transition';
  import DrawingView from '../../draw/DrawingView.svelte';
  import type { Seats } from '../../room/protocol';
  import Blob from '../../ui/Blob.svelte';
  import Timer from '../../ui/Timer.svelte';
  import { SLOTS, type Slot } from '../types';
  import type { TelephonePage, TelephoneTv } from './logic';

  let { view, seats }: { view: TelephoneTv; seats: Seats } = $props();
  const name = (slot: Slot) => seats[slot]?.name ?? `Joueur ${slot + 1}`;

  const headline = $derived.by(() => {
    if (view.phase === 'start') return 'Choisissez votre mot en secret';
    if (view.phase === 'draw') return 'À vos crayons !';
    return 'Qu’est-ce que c’est que ça ?';
  });

  const task = (slot: Slot) => {
    if (view.done[slot]) return 'a fini';
    if (view.phase === 'start') return 'choisit un mot…';
    if (view.phase === 'draw') return 'dessine…';
    return 'devine…';
  };

  const current = $derived(view.pages.at(-1) ?? null);
  const earlier = $derived(view.pages.slice(0, -1));

  function caption(page: TelephonePage, index: number): string {
    if (index === 0) return `Le mot de ${name(page.by)}`;
    return page.kind === 'drawing' ? `Dessiné par ${name(page.by)}` : `Deviné par ${name(page.by)}`;
  }
</script>

{#if view.phase === 'show' && view.chain !== null && current}
  <section class="show">
    <header>
      <span class="sticker">Page {view.page + 1} / {view.length}</span>
      <h2 class="pop">Le carnet de <span class="name-tag p{view.chain}">{name(view.chain)}</span></h2>
    </header>
    <div class="book">
      {#if earlier.length}
        <ol class="trail">
          {#each earlier as page, index (index)}
            <li class="paper mini">
              {#if page.kind === 'drawing'}
                <DrawingView strokes={page.strokes} rev={index} />
              {:else}
                <span class="text">{page.text}</span>
              {/if}
            </li>
          {/each}
        </ol>
      {/if}
      {#key `${view.chain}-${view.page}`}
        <figure class="page" in:scale={{ duration: 450, easing: backOut, start: 0.8 }}>
          {#if current.kind === 'drawing'}
            <div class="canvas paper"><DrawingView strokes={current.strokes} rev={view.page} /></div>
          {:else}
            <div class="word paper"><span>{current.text}</span></div>
          {/if}
          <figcaption>{caption(current, view.page)}</figcaption>
        </figure>
      {/key}
    </div>
    <p class="hint sticker">
      {view.last ? 'Appuyez sur « Terminer »' : 'Appuyez sur « Suivant »'} sur un téléphone quand vous voulez
    </p>
  </section>
{:else}
  <section class="play">
    <h2 class="pop">{headline}</h2>
    {#if view.phase !== 'start'}<span class="sticker">Étape {view.step} / {view.steps}</span>{/if}
    {#if view.phase === 'draw'}
      <Timer remaining={view.remaining} total={view.total} />
    {/if}
    <div class="players">
      {#each SLOTS as slot (slot)}
        <div class="player paper p{slot}" class:done={view.done[slot]} in:fly={{ y: 30, duration: 400, delay: slot * 120 }}>
          <Blob {slot} size="4em" mood={view.done[slot] ? 'happy' : 'wink'} bounce={!view.done[slot]} />
          <b>{name(slot)}</b>
          <span>{task(slot)}</span>
        </div>
      {/each}
    </div>
    <p class="hint">Les carnets restent secrets jusqu’à la fin…</p>
  </section>
{/if}

<style>
  .play,
  .show {
    width: 100%;
    max-width: 90em;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.4em;
  }

  h2 {
    font-size: 3.4em;
    text-align: center;
  }

  .players {
    display: flex;
    gap: 3em;
  }

  .player {
    width: 16em;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5em;
    padding: 1.4em;
    font-weight: 800;
    font-size: 1.2em;
    transition: transform 0.4s var(--spring);
  }

  .player b {
    font-family: var(--display);
    font-weight: 400;
    font-size: 1.6em;
  }

  .player.done {
    background: var(--pc);
    color: var(--pc-ink);
    transform: rotate(-2deg) scale(1.04);
  }

  .hint {
    font-weight: 700;
    font-size: 1.2em;
    color: var(--ink-2);
  }

  header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4em;
  }

  .book {
    flex: 1;
    min-height: 0;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2.4em;
  }

  .trail {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(2, 8.5em);
    gap: 0.8em;
  }

  .mini {
    width: 8.5em;
    height: 8.5em;
    display: grid;
    place-items: center;
    overflow: hidden;
    padding: 0;
    box-shadow: var(--shadow-sm);
  }

  .mini .text {
    padding: 0.4em;
    font-family: var(--display);
    font-size: 1.1em;
    text-align: center;
    overflow-wrap: anywhere;
  }

  .page {
    margin: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.6em;
  }

  .canvas,
  .word {
    width: min(52vh, 38vw);
    aspect-ratio: 1;
    overflow: hidden;
    border-width: 0.25em;
    box-shadow: 0.45em 0.55em 0 var(--ink);
  }

  .word {
    display: grid;
    place-items: center;
    padding: 1em;
    background: var(--butter);
    transform: rotate(-1.5deg);
  }

  .word span {
    font-family: var(--display);
    font-size: 3.6em;
    line-height: 1.1;
    text-align: center;
    overflow-wrap: anywhere;
  }

  figcaption {
    font-weight: 800;
    font-size: 1.3em;
  }

  .hint.sticker {
    background: var(--butter);
    color: var(--ink);
    white-space: normal;
    text-transform: none;
    animation: wiggle 1.6s ease-in-out infinite;
  }
</style>
