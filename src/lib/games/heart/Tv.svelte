<script lang="ts">
  import type { Seats } from '../../room/protocol';
  import DuoCards from '../../ui/DuoCards.svelte';
  import { slap } from '../../ui/motion';
  import { other, SLOTS, type Slot } from '../types';
  import type { HeartTv } from './logic';

  let { view, seats }: { view: HeartTv; seats: Seats } = $props();
  const name = (slot: Slot) => seats[slot]?.name ?? `Joueur ${slot + 1}`;
  const guesser = $derived(other(view.subject));
</script>

<section class="heart">
  <span class="sticker">Question {view.round + 1} / {view.rounds}</span>
  {#key view.round}
    <div class="question" in:slap={{ rotate: -3 }}>
      <span class="name-tag p{view.subject}">{name(view.subject)}</span>
      <h2 class="pop">{view.question}</h2>
    </div>
  {/key}

  <DuoCards
    cards={[
      { slot: view.subject, label: `Réponse de ${name(view.subject)}`, written: view.written[view.subject], text: view.answer },
      { slot: guesser, label: `Le pari de ${name(guesser)}`, written: view.written[guesser], text: view.guess },
    ]}
  />

  {#if view.phase === 'reveal'}
    <p class="next sticker">{name(view.subject)}, quand vous avez fini d’en parler, juge le pari de {name(guesser)} sur ton téléphone</p>
  {/if}

  <footer>
    {#each SLOTS as slot (slot)}
      <div class="score p{slot}">
        <span>{name(slot)}</span>
        {#key view.scores[slot]}<b in:slap>{view.scores[slot]}</b>{/key}
      </div>
    {/each}
  </footer>
</section>

<style>
  .heart {
    width: 100%;
    max-width: 80em;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.6em;
  }

  .question {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4em;
    text-align: center;
  }

  .question .name-tag {
    font-size: 1.6em;
  }

  h2 {
    font-size: 3.2em;
    line-height: 1.15;
    max-width: 22em;
  }

  .next {
    background: var(--butter);
    text-transform: none;
    white-space: normal;
    text-align: center;
    font-size: 1.15em;
    animation: wiggle 1.6s ease-in-out infinite;
  }

  footer {
    display: flex;
    gap: 2em;
  }

  .score {
    display: flex;
    align-items: center;
    gap: 0.7em;
    padding: 0.3em 1.2em;
    border-radius: 999px;
    border: 0.14em solid var(--ink);
    background: var(--pc);
    color: var(--pc-ink);
    box-shadow: var(--shadow-sm);
    font-weight: 800;
    font-size: 1.2em;
  }

  .score b {
    font-family: var(--display);
    font-weight: 400;
    font-size: 1.5em;
  }
</style>
