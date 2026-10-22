<script lang="ts" module>
  import type { Slot } from '../games/types';

  export interface DuoCard {
    slot: Slot;
    label: string;
    written: boolean;
    /** Null until the answers are shown. */
    text: string | null;
  }
</script>

<script lang="ts">
  import Blob from './Blob.svelte';
  import { flipIn } from './motion';

  /** Two answer cards side by side: face down while people write, then turned over together. */
  let { cards }: { cards: DuoCard[] } = $props();
</script>

<div class="duo">
  {#each cards as card, index (index)}
    <article class="card p{card.slot}" class:written={card.written} style:--tilt={`${index ? 1.5 : -1.5}deg`}>
      <header>
        <Blob slot={card.slot} size="2em" mood={card.written ? 'happy' : 'wink'} bounce={!card.written && card.text === null} />
        <span>{card.label}</span>
      </header>
      {#if card.text !== null}
        <p class="text" in:flipIn={{ duration: 700, delay: index * 250 }}>{card.text}</p>
      {:else}
        <p class="hidden">{card.written ? 'C’est écrit !' : 'écrit en secret…'}</p>
      {/if}
    </article>
  {/each}
</div>

<style>
  .duo {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2.4em;
  }

  .card {
    min-height: 13em;
    display: flex;
    flex-direction: column;
    gap: 0.8em;
    padding: 1.1em 1.4em 1.4em;
    border-radius: var(--radius);
    border: var(--line) solid var(--ink);
    background: var(--cream);
    color: var(--ink);
    box-shadow: var(--shadow);
    transform: rotate(var(--tilt));
  }

  header {
    display: flex;
    align-items: center;
    gap: 0.6em;
    font-weight: 800;
    font-size: 1.2em;
  }

  header span {
    padding: 0.1em 0.8em;
    border-radius: 999px;
    border: 0.1em solid var(--ink);
    background: var(--pc);
    color: var(--pc-ink);
  }

  .text {
    margin: 0;
    flex: 1;
    display: grid;
    place-items: center;
    text-align: center;
    font-family: var(--display);
    font-size: 2.2em;
    line-height: 1.2;
    overflow-wrap: anywhere;
  }

  .hidden {
    margin: 0;
    flex: 1;
    display: grid;
    place-items: center;
    font-weight: 800;
    font-size: 1.4em;
    color: var(--ink-2);
    border-radius: 0.8em;
    border: 0.12em dashed var(--ink);
    background: repeating-linear-gradient(135deg, var(--paper) 0 0.6em, var(--paper-2) 0.6em 1.2em);
  }

  .written .hidden {
    border-style: solid;
    color: var(--ink);
  }
</style>
