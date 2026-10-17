<script lang="ts">
  import { CATALOG, GAME_ORDER } from '../lib/games/catalog';
  import Icon from '../lib/ui/Icon.svelte';
</script>

<section class="menu">
  <div class="title">
    <h1>À quoi on joue ?</h1>
    <p>Choisissez un jeu sur votre téléphone</p>
  </div>
  <div class="grid">
    {#each GAME_ORDER as id, index (id)}
      {@const game = CATALOG[id]}
      <article class="tile paper" style:--accent={game.accent} style:animation-delay={`${index * 70}ms`}>
        <div class="badge"><Icon name={game.icon} size="2.6em" /></div>
        <h2>{game.title}</h2>
        <p>{game.tagline}</p>
        <span class="tag" class:coop={game.coop}>{game.coop ? 'En équipe' : 'En duel'}</span>
      </article>
    {/each}
  </div>
</section>

<style>
  .menu {
    width: 100%;
    max-width: 80em;
    display: flex;
    flex-direction: column;
    gap: 2.4em;
  }

  .title {
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 0.4em;
  }

  h1 {
    font-size: 3.4em;
  }

  .title p {
    color: var(--muted);
    font-size: 1.2em;
  }

  .grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1.6em;
  }

  .tile {
    width: 23em;
    display: flex;
    flex-direction: column;
    gap: 0.5em;
    padding: 1.3em 1.4em 1.4em;
    position: relative;
    animation: rise 0.5s backwards ease-out;
  }

  .badge {
    width: 4em;
    height: 4em;
    display: grid;
    place-items: center;
    border-radius: 1em;
    background: var(--accent);
    border: 0.15em solid var(--ink);
    margin-bottom: 0.3em;
  }

  h2 {
    font-size: 1.9em;
  }

  .tile p {
    color: #4a3f38;
    font-size: 1.02em;
    line-height: 1.3;
  }

  .tag {
    position: absolute;
    top: 1.2em;
    right: 1.2em;
    padding: 0.2em 0.7em;
    border-radius: 999px;
    background: var(--paper-2);
    border: 0.1em solid var(--ink);
    font-size: 0.85em;
    font-weight: 800;
  }

  .tag.coop {
    background: var(--yellow);
  }
</style>
