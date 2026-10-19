<script lang="ts">
  let { remaining, total }: { remaining: number; total: number } = $props();
  const circumference = 2 * Math.PI * 38;
  const progress = $derived(total > 0 ? Math.max(0, Math.min(1, remaining / total)) : 0);
</script>

<div class="timer" class:urgent={remaining <= 10 && remaining > 0} role="timer" aria-label={`${remaining} secondes`}>
  <svg viewBox="0 0 100 100" aria-hidden="true">
    <circle cx="50" cy="50" r="48" class="face" />
    <circle cx="50" cy="50" r="38" class="track" />
    <circle cx="50" cy="50" r="38" class="value" stroke-dasharray={circumference} stroke-dashoffset={circumference * (1 - progress)} />
  </svg>
  <span>{remaining}</span>
</div>

<style>
  .timer {
    position: relative;
    width: 6.5em;
    height: 6.5em;
    display: grid;
    place-items: center;
  }

  svg {
    position: absolute;
    inset: 0;
    transform: rotate(-90deg);
  }

  circle {
    fill: none;
    stroke-width: 12;
  }

  .track {
    stroke: var(--cream);
  }

  .face {
    fill: var(--cream);
    stroke: var(--ink);
    stroke-width: 4;
  }

  .value {
    stroke: var(--pink);
    stroke-linecap: round;
    transition:
      stroke-dashoffset 0.9s linear,
      stroke 0.3s ease;
  }

  span {
    position: relative;
    font-family: var(--display);
    font-size: 2.4em;
    color: var(--ink);
  }

  .timer {
    filter: drop-shadow(0.12em 0.16em 0 var(--ink));
  }

  .urgent .value {
    stroke: var(--cherry);
  }

  .urgent span {
    animation: pop-in 0.5s ease-out infinite;
  }
</style>
