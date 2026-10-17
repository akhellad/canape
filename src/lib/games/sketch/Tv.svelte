<script lang="ts">
  import { onMount } from 'svelte';
  import { fly, scale } from 'svelte/transition';
  import { backOut } from 'svelte/easing';
  import type { Seats } from '../../room/protocol';
  import Blob from '../../ui/Blob.svelte';
  import Icon from '../../ui/Icon.svelte';
  import { other, type Slot } from '../types';
  import { MODES, type SketchTv } from './logic';
  import Pattern from './Pattern.svelte';
  import { drawStroke, prepare, redraw } from './render';
  import Timer from './Timer.svelte';

  let { view, seats }: { view: SketchTv; seats: Seats } = $props();
  const name = (slot: Slot) => seats[slot]?.name ?? `Joueur ${slot + 1}`;
  const mode = $derived(MODES[view.mode]);
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
    if (stale || shrunk || view.mode === 'straight' || resized !== lastResize) {
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
      <Blob slot={view.drawer} size="3.4em" bounce={view.phase === 'draw'} />
      <span><b>{name(view.drawer)}</b> dessine</span>
      <span class="sub">{name(other(view.drawer))} devine</span>
    </div>
    {#key `${view.round}-${view.mode}`}
      <div class="mode paper" class:special={view.mode !== 'normal'} in:scale={{ duration: 500, easing: backOut, start: 0.6 }}>
        <Icon name={mode.icon} size="2.6em" />
        <div>
          <b>{mode.title}</b>
          <p>{mode.description}</p>
        </div>
      </div>
    {/key}
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
          <Icon name="thinking-face" size="4em" />
          <p>{name(view.drawer)} choisit un mot…</p>
        </div>
      {:else if view.phase === 'reveal'}
        <div class="overlay result" class:success={view.success} in:scale={{ duration: 450, easing: backOut, start: 0.7 }}>
          <Icon name={view.success ? 'party-popper' : 'loudly-crying-face'} size="4em" />
          <p>{view.success ? 'Trouvé !' : 'Raté…'} C’était :</p>
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
    gap: 2em;
    align-items: center;
  }

  aside {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 1.1em;
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
    color: var(--muted);
  }

  .drawer {
    display: flex;
    flex-direction: column;
    gap: 0.3em;
    font-size: 1.3em;
  }

  .drawer b {
    font-family: var(--display);
    font-size: 1.4em;
    font-weight: 400;
    color: var(--pc);
  }

  .sub {
    color: var(--muted);
    font-weight: 800;
  }

  .mode {
    display: flex;
    align-items: center;
    gap: 0.8em;
    padding: 0.9em 1em;
    max-width: 22em;
  }

  .mode.special {
    background: var(--yellow);
    animation: wiggle 0.6s ease-in-out 2;
  }

  .mode b {
    font-family: var(--display);
    font-size: 1.5em;
    font-weight: 400;
  }

  .mode p {
    line-height: 1.3;
  }

  .score {
    display: flex;
    flex-direction: column;
  }

  .score b {
    font-family: var(--display);
    font-size: 3em;
    font-weight: 400;
    color: var(--yellow);
  }

  .board {
    height: 100%;
    display: flex;
    align-items: center;
  }

  .canvas-wrap {
    position: relative;
    height: min(74vh, 46vw);
    aspect-ratio: 1;
    background: #fffdf7;
    overflow: hidden;
    border-width: 0.25em;
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
    gap: 0.6em;
    background: rgba(251, 246, 236, 0.85);
    color: var(--ink);
    font-family: var(--display);
    font-size: 1.8em;
    text-align: center;
  }

  .overlay.result {
    background: rgba(35, 26, 45, 0.82);
    color: var(--cream);
  }

  .overlay.result.success {
    background: rgba(46, 110, 72, 0.88);
  }

  .answer {
    font-size: 1.6em;
  }

  .points {
    color: var(--yellow);
    font-size: 1.3em;
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
    gap: 0.5em;
  }

  .guesses li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.6em;
    padding: 0.5em 0.9em;
    border-radius: 1em 1em 1em 0.3em;
    background: var(--plum-2);
    border: 0.12em solid var(--plum-3);
    font-weight: 800;
    font-size: 1.2em;
  }

  .guesses li.near {
    border-color: var(--orange);
  }

  .guesses em {
    font-style: normal;
    color: var(--orange);
    font-size: 0.85em;
    white-space: nowrap;
  }
</style>
