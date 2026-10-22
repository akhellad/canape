<script lang="ts">
  import { onMount } from 'svelte';
  import type { Stroke } from './pad';
  import { drawStroke, prepare, redraw } from './render';

  /** Paints a drawing that grows stroke by stroke, only repainting from scratch when strokes go away. */
  let { strokes, rev, label = 'Dessin' }: { strokes: readonly Stroke[]; rev: number; label?: string } = $props();

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
    void rev;
    void resized;
    const surface = prepare(canvas);
    if (!surface) return;
    const known = new Set(strokes.map((stroke) => stroke.id));
    const stale = [...drawn.keys()].some((id) => !known.has(id));
    const shrunk = strokes.some((stroke) => (drawn.get(stroke.id) ?? 0) > stroke.points.length / 2);
    if (stale || shrunk || resized !== lastResize || drawn.size === 0) {
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

<canvas bind:this={canvas} aria-label={label}></canvas>

<style>
  canvas {
    width: 100%;
    height: 100%;
    display: block;
  }
</style>
