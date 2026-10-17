<script lang="ts">
  import { onMount } from 'svelte';
  import { CATALOG } from '../lib/games/catalog';
  import type { GameId } from '../lib/games/types';
  import Icon from '../lib/ui/Icon.svelte';

  let { game, until }: { game: GameId; until: number } = $props();
  let now = $state(Date.now());
  const remaining = $derived(Math.max(1, Math.ceil((until - now) / 1000)));
  const definition = $derived(CATALOG[game]);

  onMount(() => {
    const timer = setInterval(() => (now = Date.now()), 100);
    return () => clearInterval(timer);
  });
</script>

<section class="countdown" style:--accent={definition.accent}>
  <div class="game">
    <Icon name={definition.icon} size="2.2em" />
    <span>{definition.title}</span>
  </div>
  {#key remaining}
    <div class="number">{remaining}</div>
  {/key}
  <p>Prenez vos téléphones !</p>
</section>

<style>
  .countdown {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1em;
  }

  .game {
    display: flex;
    align-items: center;
    gap: 0.5em;
    font-family: var(--display);
    font-size: 2.2em;
  }

  .number {
    width: 2.2em;
    height: 2.2em;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: var(--accent);
    color: var(--ink);
    border: 0.06em solid var(--ink);
    box-shadow: 0 0.06em 0 var(--ink);
    font-family: var(--display);
    font-size: 8em;
    animation: count 0.9s ease-out;
  }

  p {
    font-size: 1.4em;
    color: var(--muted);
  }

  @keyframes count {
    0% {
      transform: scale(0.3) rotate(-20deg);
      opacity: 0;
    }
    35% {
      transform: scale(1.12) rotate(4deg);
      opacity: 1;
    }
    60% {
      transform: scale(0.96);
    }
    100% {
      transform: scale(1);
    }
  }
</style>
