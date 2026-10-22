<script lang="ts">
  import { backOut } from 'svelte/easing';
  import { fly } from 'svelte/transition';
  import type { Seats } from '../../room/protocol';
  import DuoCards from '../../ui/DuoCards.svelte';
  import { slap } from '../../ui/motion';
  import { other, SLOTS, type Slot } from '../types';
  import type { SweetTv } from './logic';

  let { view, seats }: { view: SweetTv; seats: Seats } = $props();
  const name = (slot: Slot) => seats[slot]?.name ?? `Joueur ${slot + 1}`;
</script>

{#if view.phase === 'book'}
  <section class="book">
    <h2 class="pop">Votre carnet de mots doux</h2>
    <ol>
      {#each view.book as page, index (index)}
        <li class="paper" in:fly={{ y: 40, duration: 500, delay: index * 150, easing: backOut }}>
          <span class="prompt">{page.prompt}</span>
          {#each SLOTS as slot (slot)}
            <p><b class="p{slot}">{name(slot)} → {name(other(slot))}</b> {page.texts[slot]}</p>
          {/each}
        </li>
      {/each}
    </ol>
    <p class="next sticker">Appuyez sur « Terminer » quand vous avez tout relu</p>
  </section>
{:else}
  <section class="sweet">
    <div class="top">
      <span class="sticker">Mot doux {view.round + 1} / {view.rounds}</span>
      {#if view.letter}<span class="sticker letter">Lettre imposée : {view.letter}</span>{/if}
    </div>
    {#key view.round}
      <h2 class="pop" in:slap={{ rotate: -3 }}>{view.prompt}</h2>
    {/key}

    <DuoCards
      cards={SLOTS.map((slot) => ({
        slot,
        label: `${name(slot)} pour ${name(other(slot))}`,
        written: view.written[slot],
        text: view.texts ? view.texts[slot] : null,
      }))}
    />

    {#if view.phase === 'reveal'}
      <p class="next sticker">Savourez… puis appuyez sur « {view.last ? 'Voir notre carnet' : 'Mot doux suivant'} »</p>
    {/if}
  </section>
{/if}

<style>
  .sweet,
  .book {
    width: 100%;
    max-width: 84em;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.6em;
  }

  .top {
    display: flex;
    gap: 0.8em;
  }

  .letter {
    background: var(--cream);
  }

  h2 {
    font-size: 3.2em;
    line-height: 1.15;
    max-width: 22em;
    text-align: center;
  }

  .next {
    background: var(--butter);
    text-transform: none;
    white-space: normal;
    text-align: center;
    font-size: 1.15em;
    animation: wiggle 1.6s ease-in-out infinite;
  }

  .book h2 {
    font-size: 2.8em;
  }

  ol {
    list-style: none;
    margin: 0;
    padding: 0;
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1em 1.4em;
  }

  li {
    display: flex;
    flex-direction: column;
    gap: 0.35em;
    padding: 0.7em 1em;
    font-size: 1.05em;
  }

  li:nth-child(even) {
    transform: rotate(0.8deg);
  }

  li:nth-child(odd) {
    transform: rotate(-0.8deg);
  }

  .prompt {
    font-family: var(--display);
    font-size: 1.15em;
  }

  li p {
    margin: 0;
    font-weight: 600;
    line-height: 1.3;
    overflow-wrap: anywhere;
  }

  li b {
    padding: 0 0.4em;
    border-radius: 0.3em;
    background: var(--pc);
    color: var(--pc-ink);
    font-size: 0.85em;
  }
</style>
