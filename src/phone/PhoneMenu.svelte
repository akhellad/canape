<script lang="ts">
  import { CATALOG, GAME_ORDER } from '../lib/games/catalog';
  import type { GameId } from '../lib/games/types';
  import GameArt from '../lib/ui/GameArt.svelte';

  let { onpick }: { onpick: (game: GameId) => void } = $props();

  const GROUPS = [
    { title: 'En équipe', ids: GAME_ORDER.filter((id) => CATALOG[id].coop) },
    { title: 'En duel', ids: GAME_ORDER.filter((id) => !CATALOG[id].coop) },
  ];
</script>

<div class="menu">
  <h1 class="pop">À quoi on joue ?</h1>
  {#each GROUPS as group (group.title)}
    <h2>{group.title}</h2>
    <div class="list">
      {#each group.ids as id, index (id)}
        {@const game = CATALOG[id]}
        <button
          class="game paper"
          style:--accent={game.accent}
          style:--tilt={`${index % 2 ? 0.8 : -0.8}deg`}
          style:animation-delay={`${index * 45}ms`}
          onclick={() => onpick(id)}
        >
          <span class="badge"><GameArt game={id} size="2.6rem" /></span>
          <span class="text">
            <span class="title">{game.title}</span>
            <span class="tagline">{game.tagline}</span>
          </span>
        </button>
      {/each}
    </div>
  {/each}
</div>

<style>
  .menu {
    display: flex;
    flex-direction: column;
    gap: 1.1rem;
  }

  h1 {
    font-size: 2.3rem;
    transform: rotate(-2deg);
    transform-origin: left;
  }

  h2 {
    font-size: 1.2rem;
    margin-top: 0.4rem;
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
  }

  .game {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.9rem;
    padding: 0.7rem 0.9rem 0.7rem 0.7rem;
    text-align: left;
    font-size: 1rem;
    transform: rotate(var(--tilt));
    animation: drop-in 0.45s var(--snap) backwards;
    transition:
      transform 0.1s ease,
      box-shadow 0.1s ease;
  }

  .game:active {
    transform: translate(4px, 5px);
    box-shadow: 0 0 0 var(--ink);
  }

  .badge {
    width: 3.6rem;
    height: 3.6rem;
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
    gap: 0.15rem;
  }

  .title {
    font-family: var(--display);
    font-size: 1.3rem;
    line-height: 1.1;
  }

  .tagline {
    color: var(--ink-2);
    font-weight: 600;
    font-size: 0.9rem;
    line-height: 1.25;
  }
</style>
