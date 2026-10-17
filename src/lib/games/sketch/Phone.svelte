<script lang="ts">
  import Trash2 from '@lucide/svelte/icons/trash-2';
  import Undo2 from '@lucide/svelte/icons/undo-2';
  import { fly } from 'svelte/transition';
  import type { Seats } from '../../room/protocol';
  import Icon from '../../ui/Icon.svelte';
  import { other, type Slot } from '../types';
  import { BRUSHES, CANVAS, MODES, PALETTE, type SketchPhone } from './logic';
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
  const mode = $derived(MODES[view.mode]);

  let color = $state<string>(PALETTE[0]);
  let brush = $state<number>(BRUSHES[1]);
  let canvas = $state<HTMLCanvasElement | null>(null);
  let strokeDone = $state(false);
  let guess = $state('');

  let strokes: LocalStroke[] = [];
  let current: LocalStroke | null = null;
  let nextId = 1;
  let flushTimer: ReturnType<typeof setTimeout> | null = null;
  let round = -1;

  const canDraw = $derived(view.role === 'drawer' && view.canDraw && !strokeDone);

  $effect.pre(() => {
    if (view.round !== round) {
      round = view.round;
      strokes = [];
      current = null;
      nextId = 1;
      strokeDone = false;
      guess = '';
    }
  });

  $effect(() => {
    if (canvas) repaint();
  });

  function surface(): Surface | null {
    return canvas ? prepare(canvas) : null;
  }

  function displayed(stroke: LocalStroke) {
    if (view.mode !== 'straight' || stroke.points.length <= 4) return stroke;
    const p = stroke.points;
    return { ...stroke, points: [p[0], p[1], p[p.length - 2], p[p.length - 1]] };
  }

  function repaint() {
    const target = surface();
    if (!target) return;
    redraw(target, view.mode === 'blind' ? [] : strokes.map(displayed));
  }

  function paintCurrent() {
    if (!current || view.mode === 'blind') return;
    if (view.mode === 'straight') {
      repaint();
      return;
    }
    const target = surface();
    if (target) drawStroke(target, current, Math.max(0, current.points.length / 2 - 1));
  }

  function toCanvas(event: PointerEvent): [number, number] {
    const rect = (canvas as HTMLCanvasElement).getBoundingClientRect();
    const clamp = (value: number) => Math.min(CANVAS, Math.max(0, Math.round(value)));
    let x = clamp(((event.clientX - rect.left) / rect.width) * CANVAS);
    const y = clamp(((event.clientY - rect.top) / rect.height) * CANVAS);
    if (view.mode === 'mirror') x = CANVAS - x;
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
    if (view.mode === 'oneStroke') strokeDone = true;
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
      <Icon name={view.success ? 'party-popper' : 'loudly-crying-face'} size="3.4rem" />
      <h2>{view.success ? `Trouvé ! +${view.points}` : 'Raté…'}</h2>
      {#if view.word}<p>C’était : <b>{view.word}</b></p>{/if}
    </div>
  {:else if view.role === 'drawer'}
    {#if view.mode !== 'normal'}
      <div class="mode paper">
        <Icon name={mode.icon} size="2rem" />
        <div>
          <b>{mode.title}</b>
          <p>{mode.description}</p>
        </div>
      </div>
    {/if}
    {#if view.phase === 'choose'}
      <p class="lead">Choisis le mot que tu vas dessiner :</p>
      <div class="choices">
        {#each view.choices as choice, index (choice.word)}
          <button class="choice paper" onclick={() => act({ type: 'choose', index })}>
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
        {#if view.mode === 'blind'}
          <div class="veil"><Icon name="see-no-evil-monkey" size="3rem" /><span>Tu dessines à l’aveugle !</span></div>
        {/if}
        {#if strokeDone}
          <div class="veil light"><span>Trait terminé ! Croise les doigts.</span></div>
        {/if}
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
          {#if view.mode !== 'oneStroke'}
            <button class="tool" aria-label="Annuler le dernier trait" onclick={undo}><Undo2 size={22} /></button>
            <button class="tool" aria-label="Tout effacer" onclick={wipe}><Trash2 size={22} /></button>
          {/if}
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
        <Icon name="thinking-face" size="3.4rem" />
        <p>{partner} choisit un mot…</p>
        {#if view.mode !== 'normal'}<p class="sub">Contrainte : {mode.title}</p>{/if}
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
    color: var(--yellow);
  }

  .time {
    padding: 0.1rem 0.6rem;
    border-radius: 999px;
    background: var(--plum-2);
  }

  .time.urgent {
    background: var(--red);
  }

  .lead {
    font-weight: 800;
    font-size: 1.1rem;
    line-height: 1.35;
  }

  .target {
    font-family: var(--display);
    font-weight: 400;
    font-size: 1.5rem;
    color: var(--yellow);
    text-transform: uppercase;
  }

  .mode {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    padding: 0.6rem 0.8rem;
    background: var(--yellow);
  }

  .mode b {
    font-family: var(--display);
    font-weight: 400;
    font-size: 1.2rem;
  }

  .mode p {
    font-size: 0.9rem;
    line-height: 1.3;
  }

  .choices {
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
  }

  .choice {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.2rem;
    padding: 0.9rem 1rem;
    text-align: left;
  }

  .choice:active {
    transform: translateY(3px);
  }

  .level {
    font-weight: 800;
    font-size: 0.85rem;
    color: #5b4d44;
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

  .veil {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    background: var(--plum-2);
    color: var(--cream);
    font-weight: 900;
    font-size: 1.1rem;
    pointer-events: none;
  }

  .veil.light {
    background: rgba(29, 22, 18, 0.55);
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
  }

  .swatch.active {
    box-shadow: 0 0 0 3px var(--cream);
    transform: scale(1.08);
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
  }

  .brush.active {
    background: var(--yellow);
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
    border: 2px solid var(--muted);
    color: var(--muted);
    font-weight: 800;
  }

  .last {
    color: var(--muted);
  }

  .last b {
    color: var(--text);
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
    font-size: 2.4rem;
  }

  .reveal.success h2 {
    color: var(--yellow);
  }

  .reveal b {
    color: var(--yellow);
    text-transform: uppercase;
  }

  .sub {
    color: var(--muted);
  }

  .pattern {
    font-size: 1.7rem;
    padding: 0.6rem 0;
  }

  .feedback {
    text-align: center;
    font-weight: 800;
    color: var(--muted);
  }

  .feedback.near {
    color: var(--orange);
  }

  .guess {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.6rem;
  }

  .guess input {
    min-width: 0;
    padding: 0.8rem;
    border-radius: 0.9rem;
    border: 3px solid var(--ink);
    background: var(--cream);
    color: var(--ink);
    font-weight: 800;
    font-size: 1.1rem;
    outline: none;
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
    background: var(--plum-2);
    font-weight: 800;
  }

  .guesses li.near {
    border: 2px solid var(--orange);
  }

  .guesses em {
    font-style: normal;
    color: var(--orange);
  }
</style>
