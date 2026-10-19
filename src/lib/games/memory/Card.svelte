<script lang="ts">
  import type { Slot } from '../types';
  import type { MemoryCard } from './logic';
  import Symbol from './Symbol.svelte';

  let {
    card,
    miss = false,
    interactive = false,
    onflip,
  }: { card: MemoryCard; miss?: boolean; interactive?: boolean; onflip?: () => void } = $props();

  // Remember the last symbol shown so the face stays drawn while the card flips back.
  let shown = $state<number | null>(null);
  $effect.pre(() => {
    if (card.symbol !== null) shown = card.symbol;
  });

  const faceUp = $derived(card.symbol !== null);
  const owner = $derived<Slot | null>(card.found);
</script>

<button
  class="card {owner !== null ? `p${owner}` : ''}"
  class:up={faceUp}
  class:found={owner !== null}
  class:miss={miss && card.open}
  class:match={card.open && owner !== null}
  disabled={!interactive || faceUp}
  aria-label={faceUp ? 'Carte retournée' : 'Carte cachée'}
  data-symbol={faceUp ? card.symbol : undefined}
  onclick={onflip}
>
  <span class="inner">
    <span class="back"><span class="heart"></span></span>
    <span class="front"
      >{#if shown !== null}<Symbol symbol={shown} />{/if}</span
    >
  </span>
</button>

<style>
  .card {
    aspect-ratio: 0.78;
    perspective: 40em;
    border-radius: 0.7em;
  }

  .card:disabled {
    cursor: default;
  }

  .inner {
    position: relative;
    display: block;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    transition: transform 0.55s var(--spring);
  }

  .up .inner {
    transform: rotateY(180deg);
  }

  .back,
  .front {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    border-radius: 0.7em;
    border: 0.14em solid var(--ink);
    backface-visibility: hidden;
    box-shadow: 0.12em 0.16em 0 var(--ink);
  }

  .back {
    background: var(--pink-2);
    background-image: radial-gradient(circle, rgba(255, 255, 255, 0.25) 0.14em, transparent 0.16em);
    background-size: 0.7em 0.7em;
  }

  .heart {
    width: 38%;
    aspect-ratio: 1;
    background: var(--cream);
    clip-path: polygon(50% 92%, 6% 44%, 10% 20%, 30% 10%, 50% 26%, 70% 10%, 90% 20%, 94% 44%);
  }

  .front {
    transform: rotateY(180deg);
    background: var(--cream);
    padding: 14%;
  }

  .found .front {
    background: var(--pc-soft);
    border-color: var(--ink);
    box-shadow:
      0.12em 0.16em 0 var(--ink),
      inset 0 0 0 0.18em var(--pc);
  }

  .found:not(.match) .inner {
    transform: rotateY(180deg) scale(0.9);
    opacity: 0.85;
  }

  .match .front {
    animation: match 0.7s ease-out;
  }

  .miss .front {
    animation: miss 0.5s 0.35s ease-in-out;
  }

  @keyframes match {
    40% {
      transform: rotateY(180deg) scale(1.15);
    }
  }

  @keyframes miss {
    25%,
    75% {
      translate: -0.2em 0;
    }
    50% {
      translate: 0.2em 0;
    }
  }
</style>
