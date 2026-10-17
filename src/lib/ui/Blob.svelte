<script lang="ts">
  import type { Slot } from '../games/types';

  type Mood = 'happy' | 'wow' | 'sad' | 'wink';

  let {
    slot,
    size = '3em',
    mood = 'happy',
    bounce = false,
    crown = false,
  }: { slot: Slot; size?: string; mood?: Mood; bounce?: boolean; crown?: boolean } = $props();

  const fill = $derived(slot === 0 ? '#5b8fe8' : '#f08a2c');
</script>

<svg class="blob" class:bounce viewBox="0 0 100 130" width={size} height={`calc(${size} * 1.3)`} aria-hidden="true">
  {#if crown}
    <path
      class="crown"
      d="M28 24 34 4 44 18 50 2 56 18 66 4 72 24Z"
      fill="#f4c430"
      stroke="#1d1612"
      stroke-width="4"
      stroke-linejoin="round"
    />
  {/if}
  <g stroke="#1d1612" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
    <path d="M14 128V62C14 34 30 22 50 22s36 12 36 40v66Z" {fill} />
    {#if mood === 'happy'}
      <path d="M30 60q7 7 14 0M56 60q7 7 14 0" fill="none" stroke-width="4.5" />
    {:else if mood === 'wink'}
      <path d="M30 60q7 7 14 0" fill="none" stroke-width="4.5" />
      <circle cx="63" cy="58" r="4.5" fill="#1d1612" stroke="none" />
    {:else if mood === 'wow'}
      <circle cx="37" cy="58" r="5" fill="#1d1612" stroke="none" />
      <circle cx="63" cy="58" r="5" fill="#1d1612" stroke="none" />
      <ellipse cx="50" cy="80" rx="6" ry="7" fill="#1d1612" stroke="none" />
    {:else}
      <path d="M30 63q7 -7 14 0M56 63q7 -7 14 0" fill="none" stroke-width="4.5" />
      <path d="M41 84q9 -6 18 0" fill="none" stroke-width="4" />
    {/if}
    <ellipse cx="30" cy="74" rx="7" ry="4" fill="#e2574c" stroke="none" opacity="0.5" />
    <ellipse cx="70" cy="74" rx="7" ry="4" fill="#e2574c" stroke="none" opacity="0.5" />
  </g>
</svg>

<style>
  .blob {
    display: block;
    overflow: visible;
  }

  .bounce {
    animation: hop 0.9s ease-in-out infinite;
    transform-origin: 50% 100%;
  }

  @keyframes hop {
    0%,
    100% {
      transform: translateY(0) scale(1, 1);
    }
    15% {
      transform: translateY(0) scale(1.08, 0.92);
    }
    45% {
      transform: translateY(-14%) scale(0.95, 1.06);
    }
    75% {
      transform: translateY(0) scale(1.04, 0.96);
    }
  }
</style>
