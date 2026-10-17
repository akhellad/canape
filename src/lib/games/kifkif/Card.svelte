<script lang="ts">
  import Icon from '../../ui/Icon.svelte';
  import type { CardView } from './logic';
  import { SYMBOLS } from './symbols';

  let {
    card,
    interactive = false,
    highlight = null,
    pressed = null,
    onpick,
  }: {
    card: CardView;
    interactive?: boolean;
    highlight?: number | null;
    pressed?: number | null;
    onpick?: (symbol: number) => void;
  } = $props();

  const RADIUS = 45;
</script>

<div class="card" data-card={card.id}>
  {#each card.items as item (item.symbol)}
    {@const size = item.size * RADIUS}
    {@const style = `left:${50 + item.x * RADIUS - size / 2}%;top:${50 + item.y * RADIUS - size / 2}%;width:${size}%;height:${size}%`}
    {#if interactive}
      <button
        class="item"
        class:highlight={highlight === item.symbol}
        class:pressed={pressed === item.symbol}
        {style}
        data-symbol={item.symbol}
        aria-label={SYMBOLS[item.symbol].name}
        onpointerdown={(event) => {
          event.preventDefault();
          onpick?.(item.symbol);
        }}
      >
        <span class="glyph" style:transform={`rotate(${item.rotate}deg)`}><Icon name={SYMBOLS[item.symbol].icon} size="100%" /></span>
      </button>
    {:else}
      <div class="item" class:highlight={highlight === item.symbol} {style} data-symbol={item.symbol}>
        <span class="glyph" style:transform={`rotate(${item.rotate}deg)`}
          ><Icon name={SYMBOLS[item.symbol].icon} size="100%" label={SYMBOLS[item.symbol].name} /></span
        >
      </div>
    {/if}
  {/each}
</div>

<style>
  .card {
    position: relative;
    width: 100%;
    aspect-ratio: 1;
    border-radius: 50%;
    background: radial-gradient(circle at 50% 45%, #fffdf7 0%, var(--cream) 60%, #efe3cc 100%);
    border: 0.25em solid var(--ink);
    box-shadow:
      0 0.3em 0 var(--ink),
      inset 0 0 0 0.35em var(--cream),
      inset 0 0 0 0.5em #e7d7bb;
  }

  .item {
    position: absolute;
    display: grid;
    place-items: center;
    border-radius: 50%;
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
  }

  .glyph {
    width: 100%;
    height: 100%;
    display: block;
  }

  .pressed {
    animation: press 0.25s ease-out;
  }

  .highlight::after {
    content: '';
    position: absolute;
    inset: -12%;
    border-radius: 50%;
    border: 0.25em solid var(--orange);
    animation: halo 1.1s ease-out 2;
  }

  @keyframes press {
    50% {
      transform: scale(0.82);
    }
  }

  @keyframes halo {
    from {
      transform: scale(0.7);
      opacity: 1;
    }
    to {
      transform: scale(1.35);
      opacity: 0;
    }
  }
</style>
