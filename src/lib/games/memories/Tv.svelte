<script lang="ts">
  import type { Seats } from '../../room/protocol';
  import DuoCards from '../../ui/DuoCards.svelte';
  import { slap } from '../../ui/motion';
  import { SLOTS, type Slot } from '../types';
  import type { MemoriesTv } from './logic';

  let { view, seats }: { view: MemoriesTv; seats: Seats } = $props();
  const name = (slot: Slot) => seats[slot]?.name ?? `Joueur ${slot + 1}`;
  const HEARTS = { same: '♥', close: '♡', different: '·' };
</script>

<section class="memories">
  <span class="sticker">Souvenir {view.round + 1} / {view.rounds}</span>
  {#key view.round}
    <h2 class="pop" in:slap={{ rotate: -3 }}>{view.question}</h2>
  {/key}

  <DuoCards
    cards={SLOTS.map((slot) => ({
      slot,
      label: `La version de ${name(slot)}`,
      written: view.written[slot],
      text: view.answers ? view.answers[slot] : null,
    }))}
  />

  {#if view.phase === 'reveal'}
    <p class="next sticker">Même souvenir ? Décidez ensemble sur un téléphone quand vous avez fini d’en parler</p>
  {/if}

  <footer class="paper">
    <span>Score d’équipe</span>
    {#key view.score}<b in:slap>{view.score}</b>{/key}
    <span class="trail" aria-label="Souvenirs déjà comparés">
      {#each view.matches as match, index (index)}<i class={match}>{HEARTS[match]}</i>{/each}
    </span>
  </footer>
</section>

<style>
  .memories {
    width: 100%;
    max-width: 80em;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.6em;
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

  footer {
    display: flex;
    align-items: center;
    gap: 0.8em;
    padding: 0.4em 1.4em;
    font-weight: 800;
    font-size: 1.2em;
    transform: rotate(-1deg);
  }

  footer b {
    font-family: var(--display);
    font-weight: 400;
    font-size: 1.6em;
  }

  .trail {
    display: flex;
    gap: 0.2em;
    font-size: 1.4em;
  }

  i {
    font-style: normal;
    color: var(--cherry);
  }

  i.different {
    color: var(--ink-2);
  }
</style>
