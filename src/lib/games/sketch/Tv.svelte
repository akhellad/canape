<script lang="ts">
  import { onMount } from 'svelte';
  import { fly, scale } from 'svelte/transition';
  import { backOut } from 'svelte/easing';
  import type { Seats } from '../../room/protocol';
  import Blob from '../../ui/Blob.svelte';
  import { other, type Slot } from '../types';
  import type { SketchTv } from './logic';
  import Pattern from './Pattern.svelte';
  import { drawStroke, prepare, redraw } from './render';
  import Timer from '../../ui/Timer.svelte';

  let { view, seats }: { view: SketchTv; seats: Seats } = $props();
  const name = (slot: Slot) => seats[slot]?.name ?? `Joueur ${slot + 1}`;
  const levels = ['', 'Facile', 'Moyen', 'Difficile'];

  let canvas: HTMLCanvasElement;
  let drawn = new Map<number, number>();
  let resized = $state(0);
  let lastResize = -1;

  onMount(() => {
    const observer = new ResizeObserver(() => resized++);
    observer.observe(canvas);
    return () => observer.disconnect();
  });

  $effect(() => {
    void view.strokeRev;
    void resized;
    const strokes = view.strokes;
    const surface = prepare(canvas);
    if (!surface) return;
    const known = new Set(strokes.map((stroke) => stroke.id));
    const stale = [...drawn.keys()].some((id) => !known.has(id));
    const shrunk = strokes.some((stroke) => (drawn.get(stroke.id) ?? 0) > stroke.points.length / 2);
    if (stale || shrunk || resized !== lastResize) {
      lastResize = resized;
      redraw(surface, strokes);
    } else {
      for (const stroke of strokes) {
        const already = drawn.get(stroke.id) ?? 0;
        if (already < stroke.points.length / 2) drawStroke(surface, stroke, already);
      }
    }
    drawn = new Map(strokes.map((stroke) => [stroke.id, stroke.points.length / 2]));
  });
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
      <canvas bind:this={canvas} aria-label="Dessin en cours"></canvas>
      {#if view.phase === 'choose'}
        <div class="overlay" in:fly={{ y: 20, duration: 300 }}>
          <Blob slot={view.drawer} size="4em" mood="wink" bounce />
          <p>{name(view.drawer)} choisit un mot…</p>
        </div>
      {:else if view.phase === 'reveal'}
        <div class="overlay result" class:success={view.success} in:scale={{ duration: 450, easing: backOut, start: 0.7 }}>
          <p class="verdict">{view.success ? 'Trouvé !' : 'Raté…'}</p>
          <p>C’était :</p>
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

  canvas {
    width: 100%;
    height: 100%;
    display: block;
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

  .overlay.result {
    background: rgba(42, 12, 29, 0.86);
    color: var(--cream);
  }

  .overlay.result.success {
    background: rgba(25, 180, 138, 0.92);
  }

  .verdict {
    font-size: 1.6em;
    color: var(--cream);
    -webkit-text-stroke: 0.04em var(--ink);
    paint-order: stroke fill;
    text-shadow: 0.05em 0.06em 0 var(--ink);
    --tilt: -4deg;
    animation: stamp 0.6s var(--snap) both;
  }

  .answer {
    font-size: 1.6em;
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
