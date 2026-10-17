<script lang="ts">
  import { CATALOG, GAME_ORDER } from '../lib/games/catalog';
  import type { GameId } from '../lib/games/types';
  import Icon from '../lib/ui/Icon.svelte';

  let { onpick }: { onpick: (game: GameId) => void } = $props();
</script>

<div class="menu">
  <h1>À quoi on joue ?</h1>
  <div class="list">
    {#each GAME_ORDER as id, index (id)}
      {@const game = CATALOG[id]}
      <button class="game paper" style:--accent={game.accent} style:animation-delay={`${index * 50}ms`} onclick={() => onpick(id)}>
        <span class="badge"><Icon name={game.icon} size="2rem" /></span>
        <span class="text">
          <span class="title">{game.title} <em class:coop={game.coop}>{game.coop ? 'En équipe' : 'En duel'}</em></span>
          <span class="tagline">{game.tagline}</span>
        </span>
      </button>
    {/each}
  </div>
</div>

<style>
  .menu {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  h1 {
    font-size: 2rem;
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }

  .game {
    display: flex;
    align-items: center;
    gap: 0.9rem;
    padding: 0.8rem 0.9rem;
    text-align: left;
    font-size: 1rem;
    animation: rise 0.35s backwards ease-out;
    transition: transform 0.08s ease;
  }

  .game:active {
    transform: translateY(3px);
  }

  .badge {
    width: 3.3rem;
    height: 3.3rem;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border-radius: 0.9rem;
    background: var(--accent);
    border: 2px solid var(--ink);
  }

  .text {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .title {
    font-family: var(--display);
    font-size: 1.35rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  em {
    font-style: normal;
    font-family: var(--body);
    font-size: 0.7rem;
    font-weight: 800;
    padding: 0.1rem 0.5rem;
    border-radius: 999px;
    background: var(--paper-2);
    border: 1.5px solid var(--ink);
  }

  em.coop {
    background: var(--yellow);
  }

  .tagline {
    color: #4a3f38;
    font-size: 0.92rem;
    line-height: 1.3;
  }
</style>
