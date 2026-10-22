<script lang="ts">
  import type { Seats } from '../../room/protocol';
  import { slap } from '../../ui/motion';
  import { other, type Slot } from '../types';
  import Face from './Face.svelte';
  import type { GuessWhoPhone } from './logic';
  import { describe, PEOPLE } from './people';

  let { view, seats, act }: { view: GuessWhoPhone; seats: Seats; me: Slot; act: (action: unknown) => void } = $props();
  const partner = $derived(seats[other(view.me)]?.name ?? 'l’autre');
  const people = $derived(view.board.map((index) => PEOPLE[index]));
  const me = $derived(people[view.secret]);

  let accusing = $state(false);
  let suspect = $state<number | null>(null);
  let showCard = $state(true);

  $effect.pre(() => {
    if (!view.myTurn) {
      accusing = false;
      suspect = null;
    }
  });

  function tap(index: number) {
    if (view.phase !== 'play') return;
    if (accusing) {
      suspect = index;
      return;
    }
    act({ type: 'toggle', person: index });
  }
</script>

<div class="guesswho p{view.me}">
  <button class="mine paper" onclick={() => (showCard = !showCard)} aria-expanded={showCard}>
    <span class="portrait"><Face person={me} /></span>
    <span class="who">
      <span class="label">Ton personnage secret</span>
      <b>{me.name}</b>
      {#if showCard}
        <span class="traits">{describe(me).join(' · ')}</span>
      {/if}
    </span>
  </button>

  {#if view.phase === 'over'}
    <div class="end" in:slap>
      <h2>{view.winner === view.me ? 'Gagné !' : 'Perdu…'}</h2>
      {#if view.theirs !== null}<p>{partner} était <b>{people[view.theirs].name}</b>.</p>{/if}
    </div>
  {:else if view.myTurn}
    {#if accusing}
      <p class="status mine-turn">Touche le suspect que tu accuses.</p>
    {:else}
      <p class="status mine-turn">À toi ! Pose ta question à voix haute, puis écarte les suspects.</p>
    {/if}
  {:else}
    <p class="status">{partner} te pose une question : réponds oui ou non, à voix haute.</p>
  {/if}

  <div class="grid" class:accusing>
    {#each people as person, index (person.name)}
      <button
        class="card"
        class:down={view.down[index]}
        class:chosen={suspect === index}
        disabled={view.phase !== 'play'}
        onclick={() => tap(index)}
        aria-label={person.name}
      >
        <Face {person} />
        <span>{person.name}</span>
      </button>
    {/each}
  </div>

  {#if view.myTurn}
    <div class="actions">
      {#if accusing}
        <button class="btn danger" disabled={suspect === null} onclick={() => suspect !== null && act({ type: 'guess', person: suspect })}>
          {suspect === null ? 'Accuser…' : `Accuser ${people[suspect].name}`}
        </button>
        <button class="btn" onclick={() => ((accusing = false), (suspect = null))}>Annuler</button>
      {:else}
        <button class="btn go" onclick={() => act({ type: 'end' })}>J’ai fini mon tour</button>
        <button class="btn primary" onclick={() => (accusing = true)}>Je sais qui c’est !</button>
      {/if}
    </div>
  {/if}
</div>

<style>
  .guesswho {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }

  .mine {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    padding: 0.5rem 0.8rem;
    text-align: left;
    background: var(--blush);
    transform: rotate(-1deg);
  }

  .portrait {
    width: 3.6rem;
    flex-shrink: 0;
  }

  .who {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
  }

  .label {
    font-size: 0.75rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .who b {
    font-family: var(--display);
    font-weight: 400;
    font-size: 1.5rem;
    line-height: 1;
  }

  .traits {
    font-size: 0.8rem;
    font-weight: 600;
    line-height: 1.3;
  }

  .status {
    font-weight: 800;
    line-height: 1.35;
  }

  .mine-turn {
    padding: 0.4rem 0.8rem;
    border-radius: 0.8rem;
    border: 2px solid var(--ink);
    background: var(--pc);
    color: var(--pc-ink);
    box-shadow: 3px 4px 0 var(--ink);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.4rem;
  }

  .card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.2rem 0.2rem 0.15rem;
    border-radius: 0.6rem;
    border: 2px solid var(--ink);
    background: var(--cream);
    font-size: 0.72rem;
    font-weight: 800;
    transition:
      transform 0.25s var(--spring),
      opacity 0.2s ease,
      background 0.2s ease;
  }

  .card :global(svg) {
    width: 100%;
    height: auto;
  }

  .card.down {
    background: var(--pink-2);
    opacity: 0.45;
    transform: scale(0.92) rotate(-3deg);
  }

  .card.down :global(svg) {
    filter: grayscale(1);
  }

  .accusing .card:not(.down) {
    outline: 3px dashed var(--cherry);
    outline-offset: 2px;
  }

  .card.chosen {
    background: var(--cherry);
    color: var(--cream);
    transform: scale(1.06);
  }

  .actions {
    position: sticky;
    bottom: calc(0.6rem + env(safe-area-inset-bottom));
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.6rem;
  }

  .actions .btn {
    font-size: 1rem;
    padding-inline: 0.6rem;
  }

  .end {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
    font-weight: 700;
  }

  .end h2 {
    font-size: 2.2rem;
  }
</style>
