<script lang="ts">
  import type { Seats } from '../../room/protocol';
  import Blob from '../../ui/Blob.svelte';
  import { slap } from '../../ui/motion';
  import { SLOTS, type Slot } from '../types';
  import Die from './Die.svelte';
  import { CATEGORIES, ROLLS, type YamsTv } from './logic';
  import Sheet from './Sheet.svelte';

  let { view, seats }: { view: YamsTv; seats: Seats } = $props();
  const name = (slot: Slot) => seats[slot]?.name ?? `Joueur ${slot + 1}`;
  const label = (id: string) => CATEGORIES.find((category) => category.id === id)?.label ?? id;
  const rolled = $derived(view.rollsLeft < ROLLS);
</script>

<section class="yams">
  {#each SLOTS as slot (slot)}
    <div class="side p{slot}" style:order={slot === 0 ? 0 : 2} class:active={view.phase === 'play' && view.turn === slot}>
      <header>
        <Blob {slot} size="2em" bounce={view.phase === 'play' && view.turn === slot} crown={view.winner === slot} />
        <b>{name(slot)}</b>
      </header>
      <Sheet
        sheet={view.sheets[slot]}
        total={view.totals[slot]}
        potential={view.turn === slot ? view.potential : {}}
        last={view.last?.slot === slot ? view.last.category : null}
      />
    </div>
  {/each}

  <div class="center" style:order={1}>
    {#if view.phase === 'over'}
      <h2 class="pop" in:slap>
        {#if view.winner === null}Égalité !{:else}<span class="name-tag p{view.winner}">{name(view.winner)}</span> gagne !{/if}
      </h2>
    {:else}
      {#key view.turn}<h2 class="pop turn">À <span class="name-tag p{view.turn}">{name(view.turn)}</span> de lancer</h2>{/key}
      <span class="sticker"
        >Tour {view.round} / {view.rounds} · {view.rollsLeft} lancer{view.rollsLeft > 1 ? 's' : ''} restant{view.rollsLeft > 1
          ? 's'
          : ''}</span
      >
    {/if}

    <div class="tray">
      {#if rolled || view.phase === 'over'}
        {#key view.rollSeq}
          <div class="dice">
            {#each view.dice as value, index (index)}
              <Die {value} held={view.held[index]} rolling={!view.held[index]} delay={index * 70} size="5.4em" />
            {/each}
          </div>
        {/key}
      {:else}
        <p class="waiting">{name(view.turn)} prend les dés…</p>
      {/if}
    </div>

    {#if view.last}
      {#key view.last.seq}
        <p class="last sticker p{view.last.slot}" in:slap>
          {name(view.last.slot)} marque {view.last.points} en {label(view.last.category)}
        </p>
      {/key}
    {/if}
  </div>
</section>

<style>
  .yams {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2em;
  }

  .side {
    width: 15.5em;
    display: flex;
    flex-direction: column;
    gap: 0.5em;
    font-size: 0.98em;
    transition: transform 0.4s var(--spring);
  }

  .side.active {
    transform: scale(1.04) rotate(-0.8deg);
  }

  header {
    display: flex;
    align-items: center;
    gap: 0.5em;
    padding: 0.3em 0.9em 0.3em 0.4em;
    border-radius: 999px;
    border: 0.14em solid var(--ink);
    background: var(--pc);
    color: var(--pc-ink);
    box-shadow: var(--shadow-sm);
  }

  header b {
    font-family: var(--display);
    font-weight: 400;
    font-size: 1.4em;
  }

  .center {
    flex: 1;
    max-width: 38em;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.2em;
  }

  h2 {
    font-size: 2.8em;
    text-align: center;
  }

  .turn {
    animation: pop-in 0.35s var(--spring);
  }

  .center > .sticker {
    background: var(--cream);
    font-size: 1em;
  }

  .tray {
    width: 100%;
    min-height: 14em;
    display: grid;
    place-items: center;
    padding: 2em 1.4em;
    border-radius: 2em;
    border: 0.2em solid var(--ink);
    background: #0f6b52;
    background-image: radial-gradient(circle at 50% 40%, #19b48a, #0f6b52 70%);
    box-shadow:
      inset 0 0.4em 0 rgba(0, 0, 0, 0.2),
      var(--shadow);
  }

  .dice {
    display: flex;
    gap: 1.2em;
  }

  .waiting {
    color: var(--cream);
    font-family: var(--display);
    font-size: 1.8em;
  }

  .last {
    font-size: 1.1em;
    background: var(--pc);
    color: var(--pc-ink);
  }
</style>
