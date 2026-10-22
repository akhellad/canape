<script lang="ts">
  import { CATALOG, GAME_ORDER } from '../lib/games/catalog';
  import GameArt from '../lib/ui/GameArt.svelte';

  const TILTS = [-2.2, 1.6, -1.2, 2.4, -1.8, 1.2, -2.6];
</script>

<section class="menu">
  <div class="title">
    <h1 class="pop">À quoi on joue ?</h1>
    <p>Choisissez un jeu sur votre téléphone</p>
  </div>
  <div class="grid">
    {#each GAME_ORDER as id, index (id)}
      {@const game = CATALOG[id]}
      <article
        class="tile paper"
        style:--accent={game.accent}
        style:--tilt={`${TILTS[index % TILTS.length]}deg`}
        style:--delay={`${index * 90}ms`}
      >
        <div class="art"><GameArt game={id} size="3.6em" animated /></div>
        <div class="text">
          <h2>{game.title}</h2>
          <p>{game.tagline}</p>
        </div>
        <span class="sticker" class:coop={game.coop}>{game.coop ? 'En équipe' : 'En duel'}</span>
      </article>
    {/each}
  </div>
</section>

<style>
  .menu {
    width: 100%;
    max-width: 92em;
    display: flex;
    flex-direction: column;
    gap: 1.4em;
  }

  .title {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5em;
  }

  h1 {
    font-size: 3.2em;
    transform: rotate(-1.5deg);
  }

  .title p {
    font-weight: 700;
    font-size: 1.3em;
    color: var(--muted);
  }

  /* Seven tiles a row keeps every game on one TV screen. */
  .grid {
    display: grid;
    grid-template-columns: repeat(7, 10.9em);
    justify-content: center;
    gap: 1.4em 1.1em;
    margin: 0 auto;
    font-size: 0.86em;
  }

  .tile {
    position: relative;
    width: 10.9em;
    display: flex;
    flex-direction: column;
    overflow: visible;
    padding: 0;
    transform: rotate(var(--tilt));
    animation:
      drop-in 0.7s var(--snap) backwards,
      float 6s ease-in-out infinite;
    animation-delay: var(--delay), calc(var(--delay) * 3);
  }

  .art {
    display: grid;
    place-items: center;
    height: 4em;
    background: var(--accent);
    border-bottom: var(--line) solid var(--ink);
    border-radius: calc(var(--radius) - 0.16em) calc(var(--radius) - 0.16em) 0 0;
    background-image: radial-gradient(circle, rgba(255, 255, 255, 0.22) 0.14em, transparent 0.16em);
    background-size: 0.8em 0.8em;
  }

  .text {
    display: flex;
    flex-direction: column;
    gap: 0.35em;
    padding: 0.6em 0.75em 0.8em;
  }

  h2 {
    font-size: 1.2em;
  }

  .text p {
    color: var(--ink-2);
    font-weight: 600;
    font-size: 0.78em;
    line-height: 1.25;
  }

  .sticker {
    position: absolute;
    top: -0.8em;
    right: -0.7em;
    font-size: 0.7em;
    background: var(--cream);
    transform: rotate(7deg);
  }

  .sticker.coop {
    background: var(--butter);
  }
</style>
