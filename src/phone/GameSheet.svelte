<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { CATALOG } from '../lib/games/catalog';
  import type { GameId } from '../lib/games/types';

  let { game, onclose, onquit }: { game: GameId; onclose: () => void; onquit: () => void } = $props();
  let confirming = $state(false);
  let showRules = $state(false);
</script>

<div class="backdrop" transition:fade={{ duration: 150 }} onclick={onclose} role="presentation"></div>
<div class="sheet paper" transition:fly={{ y: 300, duration: 250 }} role="dialog" aria-modal="true" aria-label="Menu de la partie">
  <h2>{CATALOG[game].title}</h2>
  {#if showRules}
    <ol class="rules">
      {#each CATALOG[game].rules as rule, index (index)}<li>{rule}</li>{/each}
    </ol>
  {/if}
  {#if confirming}
    <p class="ask">Quitter la partie pour vous deux ?</p>
    <div class="row">
      <button class="btn danger" onclick={onquit}>Oui, quitter</button>
      <button class="btn" onclick={() => (confirming = false)}>Non</button>
    </div>
  {:else}
    <button class="btn block" onclick={() => (showRules = !showRules)}>{showRules ? 'Masquer les règles' : 'Revoir les règles'}</button>
    <button class="btn danger block" onclick={() => (confirming = true)}>Quitter la partie</button>
    <button class="btn block" onclick={onclose}>Reprendre</button>
  {/if}
</div>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(20, 14, 26, 0.6);
    z-index: 40;
  }

  .sheet {
    position: fixed;
    left: 0.75rem;
    right: 0.75rem;
    bottom: calc(0.75rem + env(safe-area-inset-bottom));
    max-width: 32rem;
    margin: 0 auto;
    padding: 1.2rem;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    z-index: 41;
    max-height: 85vh;
    max-height: 85dvh;
    overflow: auto;
  }

  h2 {
    font-size: 1.6rem;
  }

  .rules {
    margin: 0;
    padding-left: 1.2rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    line-height: 1.4;
  }

  .ask {
    font-weight: 800;
    font-size: 1.1rem;
  }

  .row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.7rem;
  }
</style>
