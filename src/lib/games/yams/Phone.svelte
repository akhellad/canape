<script lang="ts">
  import type { Seats } from '../../room/protocol';
  import { other, type Slot } from '../types';
  import Die from './Die.svelte';
  import { CATEGORIES, ROLLS, type CategoryId, type YamsPhone } from './logic';
  import Sheet from './Sheet.svelte';

  let { view, seats, act }: { view: YamsPhone; seats: Seats; me: Slot; act: (action: unknown) => void } = $props();
  const partner = $derived(seats[other(view.me)]?.name ?? 'l’autre');
  const rolled = $derived(view.rollsLeft < ROLLS);

  let selected = $state<CategoryId | null>(null);
  let seq = '';

  $effect.pre(() => {
    const key = `${view.turn}-${view.rollSeq}`;
    if (key !== seq) {
      seq = key;
      selected = null;
    }
  });

  const label = (id: CategoryId) => CATEGORIES.find((category) => category.id === id)?.label ?? id;
</script>

<div class="yams p{view.me}">
  <p class="status" class:mine={view.myTurn}>
    {#if view.phase === 'over'}
      {view.winner === null ? 'Égalité !' : view.winner === view.me ? 'Gagné, bravo !' : `${partner} a gagné…`}
    {:else if view.myTurn}
      {rolled ? 'Touche les dés à garder, relance, ou choisis une case.' : 'À toi ! Lance les dés.'}
    {:else}
      {partner} joue… Regarde la télé !
    {/if}
  </p>

  {#if view.myTurn}
    <div class="dice">
      {#each view.dice as value, index (index)}
        <button
          class="die"
          disabled={!rolled || view.rollsLeft === 0}
          aria-pressed={view.held[index]}
          aria-label={`Dé ${index + 1} : ${value}${view.held[index] ? ', gardé' : ''}`}
          onclick={() => act({ type: 'hold', index })}
        >
          {#if rolled}
            {#key view.rollSeq}<Die {value} held={view.held[index]} rolling={!view.held[index]} delay={index * 60} size="100%" />{/key}
          {:else}
            <Die value={6} size="100%" />
          {/if}
        </button>
      {/each}
    </div>
    <button class="btn player block roll" disabled={view.rollsLeft === 0} onclick={() => act({ type: 'roll' })}>
      {view.rollsLeft === 0 ? 'Plus de lancer' : `Lancer (${view.rollsLeft})`}
    </button>
  {/if}

  <div class="sheet">
    <Sheet
      sheet={view.sheets[view.me]}
      total={view.totals[view.me]}
      potential={view.myTurn ? view.potential : {}}
      {selected}
      onpick={view.myTurn ? (category) => (selected = category) : undefined}
    />
  </div>

  {#if view.myTurn && selected}
    <button class="btn go block confirm" onclick={() => selected && act({ type: 'score', category: selected })}>
      Marquer {view.potential[selected] ?? 0} en {label(selected)}
    </button>
  {/if}
  <p class="other">{partner} : <b>{view.totals[other(view.me)]}</b> points</p>
</div>

<style>
  .yams {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }

  .status {
    font-weight: 800;
    line-height: 1.35;
  }

  .status.mine {
    padding: 0.4rem 0.8rem;
    border-radius: 0.8rem;
    border: 2px solid var(--ink);
    background: var(--pc);
    color: var(--pc-ink);
    box-shadow: 3px 4px 0 var(--ink);
  }

  .dice {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 0.5rem;
    padding: 1rem 0.7rem 0.8rem;
    border-radius: 1rem;
    border: 3px solid var(--ink);
    background: radial-gradient(circle at 50% 40%, #19b48a, #0f6b52 70%);
  }

  .die:disabled {
    cursor: default;
  }

  .roll {
    min-height: 3.6rem;
    font-size: 1.3rem;
  }

  .sheet {
    font-size: 0.95rem;
  }

  .confirm {
    position: sticky;
    bottom: calc(0.6rem + env(safe-area-inset-bottom));
  }

  .other {
    text-align: center;
    font-weight: 700;
  }
</style>
