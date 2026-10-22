<script lang="ts">
  import { BANDS } from './logic';

  /** A half-circle dial from 0 (left) to 100 (right), with the scoring bands around `target` when it is known. */
  let { needle = null, target = null }: { needle?: number | null; target?: number | null } = $props();

  const CX = 200;
  const CY = 200;
  const R = 180;
  const BAND_COLORS = ['#e8213f', '#ff7a2e', '#ffd23d'];

  function point(value: number, radius = R): [number, number] {
    const angle = Math.PI - (Math.min(100, Math.max(0, value)) / 100) * Math.PI;
    return [CX + radius * Math.cos(angle), CY - radius * Math.sin(angle)];
  }

  function wedge(from: number, to: number): string {
    const [x1, y1] = point(from);
    const [x2, y2] = point(to);
    return `M${CX} ${CY} L${x1} ${y1} A${R} ${R} 0 0 1 ${x2} ${y2} Z`;
  }
</script>

<svg viewBox="0 0 400 214" class="dial" role="img" aria-label="Cadran">
  <path d={`M${CX - R} ${CY} A${R} ${R} 0 0 1 ${CX + R} ${CY} Z`} fill="#fff3e6" stroke="#2a0c1d" stroke-width="5" />
  {#if target !== null}
    {#each [...BANDS].reverse() as band, index (band.points)}
      <path d={wedge(target - band.reach, target + band.reach)} fill={BAND_COLORS[BANDS.length - 1 - index]} />
    {/each}
    {@const [x, y] = point(target, R - 24)}
    <text {x} {y} text-anchor="middle" dominant-baseline="middle" class="points">{BANDS[0].points}</text>
  {/if}
  {#each [10, 20, 30, 40, 50, 60, 70, 80, 90] as tick (tick)}
    {@const [x1, y1] = point(tick, R - 4)}
    {@const [x2, y2] = point(tick, R - 14)}
    <line {x1} {y1} {x2} {y2} stroke="#2a0c1d" stroke-width="2" opacity="0.4" />
  {/each}
  {#if needle !== null}
    {@const [nx, ny] = point(needle, R - 8)}
    <line x1={CX} y1={CY} x2={nx} y2={ny} stroke="#2a0c1d" stroke-width="8" stroke-linecap="round" />
  {/if}
  <circle cx={CX} cy={CY} r="16" fill="#3b46ff" stroke="#2a0c1d" stroke-width="5" />
</svg>

<style>
  .dial {
    display: block;
    width: 100%;
    height: auto;
    overflow: visible;
  }

  .points {
    font-family: var(--display);
    font-size: 22px;
    fill: #fff3e6;
    stroke: #2a0c1d;
    stroke-width: 3px;
    paint-order: stroke;
  }
</style>
