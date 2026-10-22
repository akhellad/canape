<script lang="ts">
  import Brush from '@lucide/svelte/icons/brush';
  import Eraser from '@lucide/svelte/icons/eraser';
  import PaintBucket from '@lucide/svelte/icons/paint-bucket';
  import Trash2 from '@lucide/svelte/icons/trash-2';
  import Undo2 from '@lucide/svelte/icons/undo-2';
  import type { Snippet } from 'svelte';
  import { BRUSHES, CANVAS, PALETTE, PAPER } from './pad';
  import { drawStroke, floodFill, prepare, redraw, type Surface } from './render';

  interface LocalStroke {
    id: number;
    color: string;
    size: number;
    points: number[];
    pending: number[];
    started: boolean;
    fill?: boolean;
  }

  type Tool = 'brush' | 'eraser' | 'fill';

  /**
   * The drawer's canvas and tools. Strokes show up locally at once and stream to the TV as
   * `stroke`, `fill`, `undo` and `clear` actions; a new `resetKey` starts a blank page.
   */
  let { act, enabled, resetKey, actions }: { act: (action: unknown) => void; enabled: boolean; resetKey: unknown; actions?: Snippet } =
    $props();

  let color = $state<string>(PALETTE[0]);
  let brush = $state<number>(BRUSHES[2]);
  let tool = $state<Tool>('brush');
  let canvas = $state<HTMLCanvasElement | null>(null);

  let strokes: LocalStroke[] = [];
  let current: LocalStroke | null = null;
  let nextId = 1;
  let flushTimer: ReturnType<typeof setTimeout> | null = null;
  let page: unknown = undefined;

  $effect.pre(() => {
    if (resetKey !== page) {
      page = resetKey;
      strokes = [];
      current = null;
      nextId = 1;
      if (canvas) repaint();
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
    if (!enabled || !canvas || current) return;
    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);
    const [x, y] = toCanvas(event);
    if (tool === 'fill') {
      const fill: LocalStroke = { id: nextId++, color, size: 0, points: [x, y], pending: [], started: true, fill: true };
      strokes.push(fill);
      const target = surface();
      if (target) floodFill(target, x, y, color);
      act({ type: 'fill', id: fill.id, x, y, color });
      return;
    }
    const ink = tool === 'eraser' ? PAPER : color;
    current = { id: nextId++, color: ink, size: brush, points: [x, y], pending: [x, y], started: false };
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
</script>

<div class="canvas-wrap paper" class:locked={!enabled}>
  <canvas bind:this={canvas} onpointerdown={down} onpointermove={move} onpointerup={up} onpointercancel={up} aria-label="Zone de dessin"
  ></canvas>
</div>
<div class="tools">
  <div class="row">
    <button
      class="tool"
      class:active={tool === 'brush'}
      aria-label="Pinceau"
      aria-pressed={tool === 'brush'}
      onclick={() => (tool = 'brush')}><Brush size={22} /></button
    >
    <button
      class="tool"
      class:active={tool === 'eraser'}
      aria-label="Gomme"
      aria-pressed={tool === 'eraser'}
      onclick={() => (tool = 'eraser')}><Eraser size={22} /></button
    >
    <button
      class="tool"
      class:active={tool === 'fill'}
      aria-label="Pot de peinture"
      aria-pressed={tool === 'fill'}
      onclick={() => (tool = 'fill')}><PaintBucket size={22} /></button
    >
    <span class="gap"></span>
    <button class="tool" aria-label="Annuler le dernier trait" onclick={undo}><Undo2 size={22} /></button>
    <button class="tool" aria-label="Tout effacer" onclick={wipe}><Trash2 size={22} /></button>
  </div>
  <div class="colors">
    {#each PALETTE as swatch (swatch)}
      <button
        class="swatch"
        class:active={color === swatch && tool !== 'eraser'}
        style:background={swatch}
        aria-label="Couleur"
        onclick={() => {
          color = swatch;
          if (tool === 'eraser') tool = 'brush';
        }}
      ></button>
    {/each}
  </div>
  <div class="row">
    {#each BRUSHES as size (size)}
      <button class="brush" class:active={brush === size} aria-label="Épaisseur" onclick={() => (brush = size)} disabled={tool === 'fill'}>
        <span
          style:width={`${Math.max(4, size / 2.4)}px`}
          style:height={`${Math.max(4, size / 2.4)}px`}
          style:background={tool === 'eraser' ? PAPER : color}
        ></span>
      </button>
    {/each}
    {@render actions?.()}
  </div>
</div>

<style>
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
    grid-template-columns: repeat(9, minmax(0, 1fr));
    gap: 0.35rem;
  }

  .swatch {
    aspect-ratio: 1;
    border-radius: 50%;
    border: 2px solid var(--ink);
    min-height: 1.9rem;
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

  .brush.active,
  .tool.active {
    background: var(--butter);
    transform: translate(2px, 3px);
    box-shadow: none;
  }

  .brush:disabled {
    opacity: 0.35;
  }

  .gap {
    flex: 1;
  }

  .brush span {
    display: block;
    border-radius: 50%;
    border: 1px solid var(--ink);
  }
</style>
