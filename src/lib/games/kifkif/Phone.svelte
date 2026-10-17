<script lang="ts">
  import { backOut } from 'svelte/easing';
  import type { Seats } from '../../room/protocol';
  import { other, type Slot } from '../types';
  import Card from './Card.svelte';
  import type { KifKifPhone } from './logic';

  let { view, seats, act }: { view: KifKifPhone; seats: Seats; me: Slot; act: (action: unknown) => void } = $props();

  let pressed = $state<number | null>(null);
  let lockedUntil = $state(0);
  let now = $state(Date.now());
  let lastTap = 0;

  $effect.pre(() => {
    lockedUntil = view.lockMs > 0 ? Date.now() + view.lockMs : 0;
  });

  $effect(() => {
    if (!lockedUntil) return;
    const timer = setInterval(() => {
      now = Date.now();
      if (now >= lockedUntil) clearInterval(timer);
    }, 100);
    return () => clearInterval(timer);
  });

  const locked = $derived(lockedUntil > now);
  const partner = $derived(seats[other(view.me)]?.name ?? 'l’autre');
  const mine = $derived(view.remaining[view.me]);
  const theirs = $derived(view.remaining[other(view.me)]);

  function pick(symbol: number) {
    const time = Date.now();
    if (locked || view.phase !== 'play' || time - lastTap < 180) return;
    lastTap = time;
    pressed = symbol;
    act({ type: 'tap', center: view.center, symbol });
  }

  function deal(_node: Element) {
    return {
      duration: 300,
      easing: backOut,
      css: (t: number) => `opacity:${t};transform:scale(${0.6 + t * 0.4}) rotate(${(1 - t) * -25}deg)`,
    };
  }
</script>

<div class="kif p{view.me}">
  <div class="scores">
    <span class="me">Toi : <b>{mine}</b> carte{mine > 1 ? 's' : ''}</span>
    <span>{partner} : <b>{theirs}</b></span>
  </div>

  <p class="hint">
    {#if view.phase === 'over'}
      {view.winner === view.me ? 'Bravo, tu as vidé ta pile !' : `${partner} a été plus rapide…`}
    {:else}
      Touche le symbole que ta carte partage avec celle de la télé.
    {/if}
  </p>

  <div class="stack">
    {#if view.card}
      {#key view.card.id}
        <div class="card" class:locked in:deal>
          <Card card={view.card} interactive={view.phase === 'play'} {pressed} onpick={pick} />
        </div>
      {/key}
    {:else}
      <div class="done">Plus de cartes !</div>
    {/if}
    {#if locked}
      <div class="penalty">
        <span>Raté !</span>
        <div class="bar"><div class="fill" style:animation-duration={`${view.lockMs}ms`}></div></div>
      </div>
    {/if}
  </div>
</div>

<style>
  .kif {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
  }

  .scores {
    display: flex;
    justify-content: space-between;
    font-weight: 800;
    font-size: 1.05rem;
  }

  .me b {
    color: var(--pc);
    font-size: 1.3em;
  }

  .hint {
    color: var(--muted);
    line-height: 1.35;
  }

  .stack {
    position: relative;
    display: grid;
    margin-top: auto;
    margin-bottom: auto;
  }

  .card {
    grid-area: 1 / 1;
    font-size: 0.9rem;
    transition: filter 0.2s ease;
  }

  .card.locked {
    filter: grayscale(0.9) brightness(0.7);
    animation: shake 0.4s ease-in-out;
  }

  .done {
    aspect-ratio: 1;
    display: grid;
    place-items: center;
    font-family: var(--display);
    font-size: 2rem;
  }

  .penalty {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.8rem;
    pointer-events: none;
  }

  .penalty span {
    padding: 0.3rem 1.2rem;
    border-radius: 0.8rem;
    background: var(--red);
    color: var(--cream);
    border: 3px solid var(--ink);
    font-family: var(--display);
    font-size: 2.2rem;
    transform: rotate(-6deg);
  }

  .bar {
    width: 50%;
    height: 0.8rem;
    border-radius: 999px;
    background: var(--plum-2);
    border: 2px solid var(--ink);
    overflow: hidden;
  }

  .fill {
    height: 100%;
    background: var(--yellow);
    animation: drain linear forwards;
  }

  @keyframes drain {
    from {
      width: 100%;
    }
    to {
      width: 0;
    }
  }
</style>
