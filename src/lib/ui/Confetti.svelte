<script lang="ts">
  import { onMount } from 'svelte';

  let { count = 180, duration = 4200 }: { count?: number; duration?: number } = $props();
  let canvas: HTMLCanvasElement;

  const COLORS = ['#3b46ff', '#ffd23d', '#fff3e6', '#e8213f', '#2fd1a5', '#ff7a2e', '#2a0c1d'];

  onMount(() => {
    const context = canvas.getContext('2d');
    if (!context) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    context.scale(ratio, ratio);

    const pieces = Array.from({ length: count }, () => ({
      x: width / 2 + (Math.random() - 0.5) * width * 0.3,
      y: height * 0.35,
      vx: (Math.random() - 0.5) * width * 0.012,
      vy: -(Math.random() * height * 0.022 + height * 0.008),
      size: 8 + Math.random() * 12,
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: Math.random() < 0.25 ? 'heart' : Math.random() < 0.35 ? 'round' : 'rect',
    }));

    const start = performance.now();
    let frame = 0;
    const draw = (now: number) => {
      const elapsed = now - start;
      context.clearRect(0, 0, width, height);
      const fade = Math.max(0, 1 - Math.max(0, elapsed - duration * 0.7) / (duration * 0.3));
      for (const piece of pieces) {
        piece.vy += height * 0.0006;
        piece.vx *= 0.99;
        piece.x += piece.vx;
        piece.y += piece.vy;
        piece.rotation += piece.spin;
        context.save();
        context.globalAlpha = fade;
        context.translate(piece.x, piece.y);
        context.rotate(piece.rotation);
        context.fillStyle = piece.color;
        if (piece.shape === 'heart') {
          const s = piece.size / 16;
          context.scale(s, s);
          context.beginPath();
          context.moveTo(0, 6);
          context.bezierCurveTo(-9, 0, -10, -6, -5.5, -8.5);
          context.bezierCurveTo(-2.5, -10, 0, -7.5, 0, -6);
          context.bezierCurveTo(0, -7.5, 2.5, -10, 5.5, -8.5);
          context.bezierCurveTo(10, -6, 9, 0, 0, 6);
          context.fill();
        } else if (piece.shape === 'round') {
          context.beginPath();
          context.arc(0, 0, piece.size / 2.4, 0, Math.PI * 2);
          context.fill();
        } else {
          context.fillRect(-piece.size / 2, -piece.size / 4, piece.size, piece.size / 2);
        }
        context.restore();
      }
      if (elapsed < duration) frame = requestAnimationFrame(draw);
      else context.clearRect(0, 0, width, height);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  });
</script>

<canvas bind:this={canvas} class="confetti" aria-hidden="true"></canvas>

<style>
  .confetti {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 50;
  }
</style>
