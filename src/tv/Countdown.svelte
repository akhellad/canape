<script lang="ts">
  import { onMount } from 'svelte';
  import { CATALOG } from '../lib/games/catalog';
  import type { GameId } from '../lib/games/types';
  import GameArt from '../lib/ui/GameArt.svelte';

  let { game, until }: { game: GameId; until: number } = $props();
  let now = $state(Date.now());
  const remaining = $derived(Math.max(1, Math.ceil((until - now) / 1000)));
  const definition = $derived(CATALOG[game]);
  const COLORS = ['var(--butter)', 'var(--mint)', 'var(--cream)'];

  onMount(() => {
    const timer = setInterval(() => (now = Date.now()), 100);
    return () => clearInterval(timer);
  });
</script>

<section class="countdown" style:--accent={definition.accent}>
  <div class="game">
    <GameArt {game} size="2.6em" animated />
    <span class="pop">{definition.title}</span>
  </div>
  <div class="stage">
    {#key remaining}
      <span class="ring" aria-hidden="true"></span>
      <div class="number" style:--fill={COLORS[remaining % COLORS.length]}>{remaining}</div>
    {/key}
  </div>
  <p class="sticker">Prenez vos téléphones !</p>
</section>

<style>
  .countdown {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.4em;
  }

  .game {
    display: flex;
    align-items: center;
    gap: 0.5em;
    font-family: var(--display);
    font-size: 2.6em;
  }

  .stage {
    position: relative;
    display: grid;
    place-items: center;
    width: 22em;
    height: 22em;
  }

  .number {
    grid-area: 1 / 1;
    font-family: var(--display);
    font-size: 17em;
    line-height: 1;
    color: var(--fill);
    -webkit-text-stroke: 0.04em var(--ink);
    paint-order: stroke fill;
    text-shadow:
      0.03em 0.03em 0 var(--ink),
      0.06em 0.06em 0 var(--ink);
    animation: slam 0.95s var(--snap) both;
  }

  .ring {
    grid-area: 1 / 1;
    width: 14em;
    height: 14em;
    border-radius: 50%;
    border: 0.6em solid var(--cream);
    animation: shock 0.9s ease-out both;
  }

  .sticker {
    font-size: 1.4em;
    transform: rotate(-2deg);
    animation: wiggle 1.2s ease-in-out infinite;
  }

  @keyframes slam {
    0% {
      transform: scale(3) rotate(-20deg);
      opacity: 0;
    }
    30% {
      transform: scale(0.9) rotate(3deg);
      opacity: 1;
    }
    50% {
      transform: scale(1.05) rotate(-1deg);
    }
    85% {
      transform: scale(1);
      opacity: 1;
    }
    100% {
      transform: scale(0.9);
      opacity: 0.2;
    }
  }

  @keyframes shock {
    0%,
    25% {
      transform: scale(0.4);
      opacity: 0;
    }
    30% {
      opacity: 0.9;
    }
    100% {
      transform: scale(1.6);
      opacity: 0;
    }
  }
</style>
