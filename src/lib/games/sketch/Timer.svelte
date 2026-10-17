<script lang="ts">
  let { remaining, total }: { remaining: number; total: number } = $props();
  const circumference = 2 * Math.PI * 42;
  const progress = $derived(total > 0 ? Math.max(0, Math.min(1, remaining / total)) : 0);
</script>

<div class="timer" class:urgent={remaining <= 10 && remaining > 0} role="timer" aria-label={`${remaining} secondes`}>
  <svg viewBox="0 0 100 100" aria-hidden="true">
    <circle cx="50" cy="50" r="42" class="track" />
    <circle cx="50" cy="50" r="42" class="value" stroke-dasharray={circumference} stroke-dashoffset={circumference * (1 - progress)} />
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
    stroke-width: 9;
  }

  .track {
    stroke: var(--plum-3);
  }

  .value {
    stroke: var(--yellow);
    stroke-linecap: round;
    transition:
      stroke-dashoffset 0.9s linear,
      stroke 0.3s ease;
  }

  span {
    font-family: var(--display);
    font-size: 2.4em;
  }

  .urgent .value {
    stroke: var(--red);
  }

  .urgent span {
    animation: pop-in 0.5s ease-out infinite;
  }
</style>
