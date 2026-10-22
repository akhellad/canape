<script lang="ts">
  import { fly, scale } from 'svelte/transition';
  import { backOut } from 'svelte/easing';
  import type { Seats } from '../../room/protocol';
  import Blob from '../../ui/Blob.svelte';
  import { other, type Slot } from '../types';
  import type { SketchTv } from './logic';
  import Pattern from './Pattern.svelte';
  import DrawingView from '../../draw/DrawingView.svelte';
  import Timer from '../../ui/Timer.svelte';

  let { view, seats }: { view: SketchTv; seats: Seats } = $props();
  const name = (slot: Slot) => seats[slot]?.name ?? `Joueur ${slot + 1}`;
  const levels = ['', 'Facile', 'Moyen', 'Difficile'];
</script>

<section class="sketch">
  <aside class="left">
    <span class="round">Manche {view.round + 1} / {view.rounds}</span>
    <div class="drawer p{view.drawer}">
      <Blob slot={view.drawer} size="4em" bounce={view.phase === 'draw'} />
      <span><b class="name-tag">{name(view.drawer)}</b> dessine</span>
      <span class="sub">{name(other(view.drawer))} devine</span>
    </div>
    <div class="score">
      <span>Score d’équipe</span>
      <b>{view.score}</b>
      <span class="sub">{view.found} trouvé{view.found > 1 ? 's' : ''}</span>
    </div>
  </aside>

  <div class="board">
    <div class="paper canvas-wrap">
      <DrawingView strokes={view.strokes} rev={view.strokeRev} label="Dessin en cours" />
      {#if view.phase === 'choose'}
        <div class="overlay" in:fly={{ y: 20, duration: 300 }}>
          <Blob slot={view.drawer} size="4em" mood="wink" bounce />
          <p>{name(view.drawer)} choisit un mot…</p>
        </div>
      {:else if view.phase === 'reveal'}
        <div class="overlay result" class:success={view.success} in:scale={{ duration: 450, easing: backOut, start: 0.7 }}>
          <p class="verdict">{view.success ? 'Trouvé !' : 'Raté…'}</p>
          <div class="answer"><Pattern pattern="" word={view.word} /></div>
          {#if view.success}<p class="points">+{view.points} points</p>{/if}
        </div>
      {/if}
    </div>
  </div>

  <aside class="right">
    {#if view.phase === 'draw'}
      <Timer remaining={view.remaining} total={view.total} />
      <div class="hint">
        <span class="sub">{view.level ? levels[view.level] : ''}</span>
        <Pattern pattern={view.pattern} />
      </div>
    {/if}
    {#if view.phase === 'reveal'}
      <p class="next sticker">{view.last ? 'Appuyez sur « Voir le score final »' : 'Appuyez sur « Dessin suivant »'} quand vous voulez</p>
    {/if}
    <ul class="guesses">
      {#each view.guesses as guess (guess.seq)}
        <li class:near={guess.near} in:fly={{ x: 40, duration: 300 }}>
          <span>{guess.text}</span>
          {#if guess.near}<em>Tout chaud !</em>{/if}
        </li>
      {/each}
    </ul>
  </aside>
</section>

<style>
  .sketch {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 2.4em;
    align-items: center;
  }

  aside {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 1.4em;
    justify-content: center;
  }

  .left {
    align-items: flex-start;
  }

  .right {
    align-items: center;
  }

  .round {
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .drawer {
    display: flex;
    flex-direction: column;
    gap: 0.4em;
    font-size: 1.3em;
    font-weight: 700;
  }

  .drawer b {
    font-family: var(--display);
    font-size: 1.4em;
    font-weight: 400;
  }

  .sub {
    color: var(--ink-2);
    font-weight: 700;
  }

  .score {
    display: flex;
    flex-direction: column;
    padding: 0.7em 1.2em;
    border-radius: 1em;
    border: 0.15em solid var(--ink);
    background: var(--butter);
    box-shadow: var(--shadow);
    transform: rotate(-2deg);
    font-weight: 800;
  }

  .score b {
    font-family: var(--display);
    font-size: 3.4em;
    font-weight: 400;
    line-height: 1.1;
  }

  .score .sub {
    color: var(--ink);
  }

  .board {
    height: 100%;
    display: flex;
    align-items: center;
  }

  .canvas-wrap {
    position: relative;
    height: min(76vh, 46vw);
    aspect-ratio: 1;
    background: #fffdf7;
    overflow: hidden;
    border-width: 0.25em;
    box-shadow: 0.45em 0.55em 0 var(--ink);
    transform: rotate(-0.6deg);
  }

  .overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5em;
    background: rgba(255, 243, 230, 0.9);
    color: var(--ink);
    font-family: var(--display);
    font-size: 1.8em;
    text-align: center;
  }

  /* A banner along the bottom, so the drawing stays in view while you talk about it. */
  .overlay.result {
    inset: auto 0 0 0;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.2em 0.7em;
    padding: 0.4em 0.6em 0.5em;
    font-size: 1.3em;
    background: var(--ink);
    color: var(--cream);
    border-top: 0.12em solid var(--ink);
  }

  .overlay.result.success {
    background: #0f7a5c;
  }

  .verdict {
    font-size: 1.3em;
    color: var(--cream);
    -webkit-text-stroke: 0.04em var(--ink);
    paint-order: stroke fill;
    text-shadow: 0.05em 0.06em 0 var(--ink);
    --tilt: -4deg;
    animation: stamp 0.6s var(--snap) both;
  }

  .answer {
    font-size: 1.2em;
  }

  .next {
    max-width: 16em;
    white-space: normal;
    text-align: center;
    text-transform: none;
    font-size: 1.1em;
    line-height: 1.3;
    animation: wiggle 1.6s ease-in-out infinite;
  }

  .points {
    font-size: 1.1em;
  }

  .hint {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5em;
    font-size: 2em;
  }

  .hint .sub {
    font-size: 0.45em;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .guesses {
    list-style: none;
    margin: 0;
    padding: 0;
    width: 100%;
    max-width: 20em;
    display: flex;
    flex-direction: column;
    gap: 0.6em;
  }

  .guesses li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.6em;
    padding: 0.5em 0.9em;
    border-radius: 1em 1em 1em 0.2em;
    background: var(--cream);
    border: 0.13em solid var(--ink);
    box-shadow: var(--shadow-sm);
    font-weight: 800;
    font-size: 1.2em;
  }

  .guesses li:nth-child(even) {
    transform: rotate(1deg);
  }

  .guesses li.near {
    background: var(--tangerine);
  }

  .guesses em {
    font-style: normal;
    font-size: 0.85em;
    white-space: nowrap;
  }
</style>
