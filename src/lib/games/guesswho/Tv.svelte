<script lang="ts">
  import type { Seats } from '../../room/protocol';
  import Blob from '../../ui/Blob.svelte';
  import { flipIn, slap } from '../../ui/motion';
  import { other, SLOTS, type Slot } from '../types';
  import Face from './Face.svelte';
  import type { GuessWhoTv } from './logic';
  import { PEOPLE } from './people';

  let { view, seats }: { view: GuessWhoTv; seats: Seats } = $props();
  const people = $derived(view.board.map((index) => PEOPLE[index]));
  const name = (slot: Slot) => seats[slot]?.name ?? `Joueur ${slot + 1}`;
</script>

<section class="guesswho">
  <div class="banner">
    {#if view.phase === 'over' && view.guess}
      <h2 class="pop" in:slap>
        <span class="name-tag p{view.guess.by}">{name(view.guess.by)}</span>
        {view.guess.correct ? 'a trouvé !' : 's’est trompé…'}
      </h2>
    {:else}
      {#key view.turn}
        <h2 class="pop turn">À <span class="name-tag p{view.turn}">{name(view.turn)}</span> de poser une question</h2>
      {/key}
      <p class="sticker">{name(other(view.turn))} répond par oui ou par non</p>
    {/if}
  </div>

  <div class="boards">
    {#each SLOTS as slot (slot)}
      <div class="board p{slot}" class:active={view.phase === 'play' && view.turn === slot}>
        <header>
          <Blob
            {slot}
            size="1.8em"
            mood={view.winner === null ? 'happy' : view.winner === slot ? 'happy' : 'sad'}
            crown={view.winner === slot}
          />
          <span class="title">{name(slot)} enquête</span>
          {#key view.left[slot]}<span class="sticker left" in:slap>{view.left[slot]} suspect{view.left[slot] > 1 ? 's' : ''}</span>{/key}
        </header>
        <div class="grid">
          {#each people as person, index (person.name)}
            {@const down = view.down[slot][index]}
            {@const accused = view.guess?.by === slot && view.guess.person === index}
            <div class="card" class:down class:accused class:right={accused && view.guess?.correct}>
              <div class="inner">
                <div class="front"><Face {person} /><span>{person.name}</span></div>
                <div class="back" aria-hidden="true"></div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>

  {#if view.phase === 'over' && view.secrets}
    <div class="reveal">
      {#each SLOTS as slot (slot)}
        {@const person = people[view.secrets[slot]]}
        <div class="secret paper p{slot}" in:flipIn={{ delay: 300 + slot * 300 }}>
          <span class="whose">{name(slot)} était</span>
          <Face {person} size="7em" />
          <b>{person.name}</b>
        </div>
      {/each}
    </div>
  {/if}
</section>

<style>
  .guesswho {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1em;
  }

  .banner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4em;
  }

  h2 {
    font-size: 2.6em;
    text-align: center;
  }

  .turn {
    animation: pop-in 0.35s var(--spring);
  }

  .banner .sticker {
    background: var(--cream);
    font-size: 1em;
  }

  .boards {
    flex: 1;
    min-height: 0;
    display: flex;
    gap: 3em;
    align-items: flex-start;
  }

  .board {
    display: flex;
    flex-direction: column;
    gap: 0.6em;
    padding: 0.8em;
    border-radius: 1.2em;
    border: 0.16em dashed rgba(42, 12, 29, 0.35);
    transition:
      background 0.3s ease,
      transform 0.4s var(--spring);
  }

  .board.active {
    border: 0.16em solid var(--ink);
    background: var(--pc-soft);
    box-shadow: var(--shadow);
    transform: rotate(-0.6deg);
  }

  header {
    display: flex;
    align-items: center;
    gap: 0.5em;
  }

  .title {
    font-family: var(--display);
    font-size: 1.5em;
  }

  .left {
    margin-left: auto;
    background: var(--pc);
    color: var(--pc-ink);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(6, 4.6em);
    gap: 0.45em;
  }

  .card {
    aspect-ratio: 0.8;
    perspective: 30em;
  }

  .inner {
    position: relative;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    transition: transform 0.5s var(--spring);
  }

  .down .inner {
    transform: rotateX(180deg);
  }

  .front,
  .back {
    position: absolute;
    inset: 0;
    border-radius: 0.6em;
    border: 0.12em solid var(--ink);
    backface-visibility: hidden;
  }

  .front {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    padding: 0.2em 0.2em 0.1em;
    background: var(--cream);
    overflow: hidden;
  }

  .front span {
    font-weight: 800;
    font-size: 0.68em;
    line-height: 1.1;
  }

  .back {
    transform: rotateX(180deg);
    background: var(--pink-2);
    background-image: repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.2) 0 0.3em, transparent 0.3em 0.6em);
  }

  .accused .front {
    box-shadow: 0 0 0 0.25em var(--cherry);
  }

  .right .front {
    box-shadow: 0 0 0 0.25em var(--mint);
  }

  .reveal {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4em;
    background: rgba(42, 12, 29, 0.4);
    border-radius: 2em;
  }

  .secret {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4em;
    padding: 1em 1.8em 1.2em;
    background: var(--cream);
  }

  .secret:nth-child(2) {
    transform: rotate(3deg);
  }

  .secret:nth-child(1) {
    transform: rotate(-3deg);
  }

  .whose {
    font-weight: 800;
  }

  .secret b {
    font-family: var(--display);
    font-weight: 400;
    font-size: 2em;
  }
</style>
