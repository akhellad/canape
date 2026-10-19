<script lang="ts">
  import Trash2 from '@lucide/svelte/icons/trash-2';
  import Undo2 from '@lucide/svelte/icons/undo-2';
  import { fly } from 'svelte/transition';
  import type { Seats } from '../../room/protocol';
  import Blob from '../../ui/Blob.svelte';
  import { other, type Slot } from '../types';
  import { BRUSHES, CANVAS, PALETTE, type SketchPhone } from './logic';
  import Pattern from './Pattern.svelte';
  import { drawStroke, prepare, redraw, type Surface } from './render';

  interface LocalStroke {
    id: number;
    color: string;
    size: number;
    points: number[];
    pending: number[];
    started: boolean;
  }

  let { view, seats, act }: { view: SketchPhone; seats: Seats; me: Slot; act: (action: unknown) => void } = $props();

  const LEVELS = ['', 'Facile', 'Moyen', 'Difficile'];
  const partner = $derived(seats[other(view.me)]?.name ?? 'l’autre');

  let color = $state<string>(PALETTE[0]);
  let brush = $state<number>(BRUSHES[1]);
  let canvas = $state<HTMLCanvasElement | null>(null);
  let guess = $state('');

  let strokes: LocalStroke[] = [];
  let current: LocalStroke | null = null;
  let nextId = 1;
  let flushTimer: ReturnType<typeof setTimeout> | null = null;
  let round = -1;

  const canDraw = $derived(view.role === 'drawer' && view.canDraw);

  $effect.pre(() => {
    if (view.round !== round) {
      round = view.round;
      strokes = [];
      current = null;
      nextId = 1;
      guess = '';
    }
  });

  $effect(() => {
    if (canvas) repaint();
  });

  function surface(): Surface | null {
    return canvas ? prepare(canvas) : null;
  }

  function repaint() {
    const target = surface();
    if (!target) return;
    redraw(target, strokes);
  }

  function paintCurrent() {
    if (!current) return;
    const target = surface();
    if (target) drawStroke(target, current, Math.max(0, current.points.length / 2 - 1));
  }

  function toCanvas(event: PointerEvent): [number, number] {
    const rect = (canvas as HTMLCanvasElement).getBoundingClientRect();
    const clamp = (value: number) => Math.min(CANVAS, Math.max(0, Math.round(value)));
    const x = clamp(((event.clientX - rect.left) / rect.width) * CANVAS);
    const y = clamp(((event.clientY - rect.top) / rect.height) * CANVAS);
    return [x, y];
  }

  function down(event: PointerEvent) {
    if (!canDraw || !canvas || current) return;
    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);
    const [x, y] = toCanvas(event);
    current = { id: nextId++, color, size: brush, points: [x, y], pending: [x, y], started: false };
    strokes.push(current);
    paintCurrent();
    schedule();
  }

  function move(event: PointerEvent) {
    if (!current) return;
    event.preventDefault();
    const [x, y] = toCanvas(event);
    const n = current.points.length;
    const dx = x - current.points[n - 2];
    const dy = y - current.points[n - 1];
    if (dx * dx + dy * dy < 25) return;
    current.points.push(x, y);
    current.pending.push(x, y);
    paintCurrent();
    schedule();
  }

  function up() {
    if (!current) return;
    flush(true);
    current = null;
  }

  function schedule() {
    if (!flushTimer) flushTimer = setTimeout(() => flush(false), 50);
  }

  function flush(end: boolean) {
    if (flushTimer) clearTimeout(flushTimer);
    flushTimer = null;
    if (!current || (!current.pending.length && !end)) return;
    const message: Record<string, unknown> = { type: 'stroke', id: current.id, points: current.pending, end };
    if (!current.started) {
      message.color = current.color;
      message.size = current.size;
      current.started = true;
    }
    current.pending = [];
    act(message);
  }

  function undo() {
    if (!strokes.length) return;
    strokes.pop();
    act({ type: 'undo' });
    repaint();
  }

  function wipe() {
    strokes = [];
    act({ type: 'clear' });
    repaint();
  }

  function submit(event: SubmitEvent) {
    event.preventDefault();
    const text = guess.trim();
    if (!text) return;
    act({ type: 'guess', text });
    guess = '';
  }
</script>

<div class="sketch p{view.me}">
  <div class="head">
    <span>Manche {view.round + 1} / {view.rounds}</span>
    <span>Score : <b>{view.score}</b></span>
    {#if view.phase === 'draw'}<span class="time" class:urgent={view.remaining <= 10}>{view.remaining} s</span>{/if}
  </div>

  {#if view.phase === 'reveal'}
    <div class="reveal" class:success={view.success} in:fly={{ y: 20, duration: 300 }}>
      <Blob slot={view.me} size="4rem" mood={view.success ? 'happy' : 'sad'} bounce={view.success === true} />
      <h2>{view.success ? `Trouvé ! +${view.points}` : 'Raté…'}</h2>
      {#if view.word}<p>C’était : <b>{view.word}</b></p>{/if}
    </div>
  {:else if view.role === 'drawer'}
    {#if view.phase === 'choose'}
      <p class="lead">Choisis le mot que tu vas dessiner :</p>
      <div class="choices">
        {#each view.choices as choice, index (choice.word)}
          <button
            class="choice paper level{choice.level}"
            style:animation-delay={`${index * 80}ms`}
            onclick={() => act({ type: 'choose', index })}
          >
            <span class="level">{LEVELS[choice.level]} · ×{choice.level}</span>
            <span class="word">{choice.word}</span>
          </button>
        {/each}
      </div>
    {:else}
      <p class="lead">Dessine : <b class="target">{view.word}</b></p>
      <div class="canvas-wrap paper" class:locked={!canDraw}>
        <canvas
          bind:this={canvas}
          onpointerdown={down}
          onpointermove={move}
          onpointerup={up}
          onpointercancel={up}
          aria-label="Zone de dessin"
        ></canvas>
      </div>
      <div class="tools">
        <div class="colors">
          {#each PALETTE as swatch (swatch)}
            <button
              class="swatch"
              class:active={color === swatch}
              style:background={swatch}
              aria-label="Couleur"
              onclick={() => (color = swatch)}
            ></button>
          {/each}
        </div>
        <div class="row">
          {#each BRUSHES as size (size)}
            <button class="brush" class:active={brush === size} aria-label="Épaisseur" onclick={() => (brush = size)}>
              <span style:width={`${size / 2.4}px`} style:height={`${size / 2.4}px`} style:background={color}></span>
            </button>
          {/each}
          <button class="tool" aria-label="Annuler le dernier trait" onclick={undo}><Undo2 size={22} /></button>
          <button class="tool" aria-label="Tout effacer" onclick={wipe}><Trash2 size={22} /></button>
          <button class="skip" onclick={() => act({ type: 'skip' })}>Passer</button>
        </div>
      </div>
      {#if view.guesses.length}
        <p class="last">Dernière idée de {partner} : <b>{view.guesses[view.guesses.length - 1].text}</b></p>
      {/if}
    {/if}
  {:else}
    {#if view.phase === 'choose'}
      <div class="wait">
        <Blob slot={view.me === 0 ? 1 : 0} size="4rem" mood="wink" bounce />
        <p>{partner} choisit un mot…</p>
      </div>
    {:else}
      <p class="lead">Regarde la télé et devine le dessin de {partner} !</p>
      <div class="pattern"><Pattern pattern={view.pattern} /></div>
      {#if view.lastGuess && !view.lastGuess.correct}
        {#key view.lastGuess.seq}
          <p class="feedback" class:near={view.lastGuess.near} in:fly={{ y: -10, duration: 250 }}>
            {view.lastGuess.near ? 'Tout chaud, tu y es presque !' : 'Non, essaie encore !'}
          </p>
        {/key}
      {/if}
      <form class="guess" onsubmit={submit}>
        <input
          bind:value={guess}
          maxlength="40"
          class="field"
          placeholder="Ta proposition"
          autocomplete="off"
          autocapitalize="none"
          spellcheck="false"
          enterkeyhint="send"
        />
        <button class="btn go" type="submit" disabled={!guess.trim()}>Proposer</button>
      </form>
      <ul class="guesses">
        {#each [...view.guesses].reverse() as item (item.seq)}
          <li class:near={item.near}>
            {item.text}{#if item.near}<em>chaud</em>{/if}
          </li>
        {/each}
      </ul>
    {/if}
  {/if}
</div>

<style>
  .sketch {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }

  .head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 800;
  }

  .head b {
    font-family: var(--display);
    font-weight: 400;
    font-size: 1.2em;
  }

  .time {
    padding: 0.1rem 0.7rem;
    border-radius: 999px;
    border: 2px solid var(--ink);
    background: var(--cream);
  }

  .time.urgent {
    background: var(--cherry);
    color: var(--cream);
    animation: wiggle 0.5s ease-in-out infinite;
  }

  .lead {
    font-weight: 800;
    font-size: 1.1rem;
    line-height: 1.35;
  }

  .target {
    display: inline-block;
    font-family: var(--display);
    font-weight: 400;
    font-size: 1.5rem;
    padding: 0 0.4rem;
    border-radius: 0.4rem;
    background: var(--butter);
    border: 2px solid var(--ink);
    transform: rotate(-2deg);
  }

  .choices {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }

  .choice {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.2rem;
    padding: 0.9rem 1rem;
    text-align: left;
    animation: drop-in 0.45s var(--snap) backwards;
    transition:
      transform 0.1s ease,
      box-shadow 0.1s ease;
  }

  .choice:active {
    transform: translate(4px, 5px);
    box-shadow: 0 0 0 var(--ink);
  }

  .level1 {
    background: #d7fff2;
  }

  .level2 {
    background: var(--butter);
  }

  .level3 {
    background: var(--blush);
  }

  .level {
    font-weight: 800;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .word {
    font-family: var(--display);
    font-size: 1.6rem;
  }

  .canvas-wrap {
    position: relative;
    width: 100%;
    aspect-ratio: 1;
    background: #fffdf7;
    overflow: hidden;
  }

  canvas {
    width: 100%;
    height: 100%;
    display: block;
    touch-action: none;
  }

  .canvas-wrap.locked canvas {
    pointer-events: none;
  }

  .tools {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .colors {
    display: grid;
    grid-template-columns: repeat(8, minmax(0, 1fr));
    gap: 0.4rem;
  }

  .swatch {
    aspect-ratio: 1;
    border-radius: 50%;
    border: 2px solid var(--ink);
    min-height: 2.2rem;
    transition: transform 0.15s var(--spring);
  }

  .swatch.active {
    box-shadow:
      0 0 0 3px var(--cream),
      0 0 0 5px var(--ink);
    transform: scale(1.12);
  }

  .row {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .brush,
  .tool {
    width: 2.75rem;
    height: 2.75rem;
    display: grid;
    place-items: center;
    border-radius: 0.7rem;
    background: var(--cream);
    color: var(--ink);
    border: 2px solid var(--ink);
    box-shadow: 2px 3px 0 var(--ink);
  }

  .brush:active,
  .tool:active {
    transform: translate(2px, 3px);
    box-shadow: none;
  }

  .brush.active {
    background: var(--butter);
  }

  .brush span {
    display: block;
    border-radius: 50%;
    border: 1px solid var(--ink);
  }

  .skip {
    margin-left: auto;
    padding: 0.5rem 0.9rem;
    min-height: 2.75rem;
    border-radius: 0.7rem;
    border: 2px dashed var(--ink);
    font-weight: 800;
  }

  .last {
    font-weight: 600;
  }

  .wait,
  .reveal {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.7rem;
    text-align: center;
    font-weight: 800;
    font-size: 1.15rem;
  }

  .reveal h2 {
    font-size: 2.6rem;
    color: var(--cream);
    -webkit-text-stroke: 0.035em var(--ink);
    paint-order: stroke fill;
    text-shadow: 0.04em 0.05em 0 var(--ink);
    --tilt: -3deg;
    animation: stamp 0.55s var(--snap) both;
  }

  .reveal.success h2 {
    color: var(--butter);
  }

  .reveal b {
    text-transform: uppercase;
  }

  .pattern {
    font-size: 1.7rem;
    padding: 0.6rem 0;
  }

  .feedback {
    text-align: center;
    font-weight: 800;
  }

  .feedback.near {
    align-self: center;
    padding: 0.2rem 0.8rem;
    border-radius: 999px;
    border: 2px solid var(--ink);
    background: var(--tangerine);
  }

  .guess {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.6rem;
  }

  .guesses {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .guesses li {
    display: flex;
    justify-content: space-between;
    padding: 0.45rem 0.8rem;
    border-radius: 0.8rem;
    background: var(--cream);
    border: 2px solid var(--ink);
    font-weight: 800;
  }

  .guesses li.near {
    background: #ffd9bf;
  }

  .guesses em {
    font-style: normal;
    color: var(--berry);
  }
</style>
