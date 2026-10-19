<script lang="ts">
  import type { Seats } from '../../room/protocol';
  import Blob from '../../ui/Blob.svelte';
  import { flipIn, slap } from '../../ui/motion';
  import Timer from '../../ui/Timer.svelte';
  import { SLOTS, type Slot } from '../types';
  import type { CoupleTv } from './logic';

  let { view, seats }: { view: CoupleTv; seats: Seats } = $props();
  const name = (slot: Slot) => seats[slot]?.name ?? `Joueur ${slot + 1}`;
  const reveal = $derived(view.phase === 'reveal');
  const heart = 'M0 12C-17 0 -19 -12 -11 -17C-5 -20 0 -15 0 -12C0 -15 5 -20 11 -17C19 -12 17 0 0 12Z';
</script>

<section class="couple">
  <div class="top">
    <span class="sticker round">Question {view.round + 1} / {view.rounds}</span>
    <div class="hearts" aria-label={`${view.matches} réponses communes`}>
      {#each { length: view.rounds } as _, index (index)}
        <svg viewBox="-20 -20 40 34" class="heart" class:full={index < view.matches}>
          <path d={heart} />
        </svg>
      {/each}
    </div>
    {#if !reveal}<div class="timer"><Timer remaining={view.remaining} total={view.total} /></div>{/if}
  </div>

  {#key view.round}
    <div class="prompt paper" in:flipIn>
      <span class="kicker">{view.prompt.kind === 'who' ? 'Qui de nous deux…' : 'Tu préfères…'}</span>
      {#if view.prompt.kind === 'who'}
        <h2>…{view.prompt.text} ?</h2>
      {:else}
        <h2 class="options">
          <span class="option o0">{view.prompt.options[0]}</span>
          <em>ou</em>
          <span class="option o1">{view.prompt.options[1]}</span>
        </h2>
      {/if}
    </div>
  {/key}

  <div class="cards">
    {#each SLOTS as slot (slot)}
      {@const answer = view.answers?.[slot] ?? null}
      <div class="column p{slot}">
        <span class="owner">{name(slot)} répond</span>
        {#if reveal}
          <div class="card face" in:flipIn={{ delay: slot * 250 }}>
            {#if answer === null}
              <span class="none">Pas de réponse</span>
            {:else if view.prompt.kind === 'who'}
              <Blob slot={answer as Slot} size="3.4em" mood="happy" />
              <span class="pick">{name(answer as Slot)}</span>
            {:else}
              <span class="pick option o{answer}">{view.prompt.options[answer]}</span>
            {/if}
          </div>
        {:else}
          <div class="card back" class:locked={view.locked[slot]}>
            <svg viewBox="-20 -20 40 34" class="seal"><path d={heart} /></svg>
            <span>{view.locked[slot] ? 'Réponse cachée' : 'réfléchit…'}</span>
          </div>
        {/if}
      </div>
    {/each}
    {#if reveal}
      <div class="verdict" class:match={view.match} in:slap={{ delay: 650, rotate: -12 }}>
        {view.match ? 'D’accord !' : 'Pas d’accord…'}
      </div>
    {/if}
  </div>
</section>

<style>
  .couple {
    width: 100%;
    max-width: 76em;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 1.8em;
  }

  .top {
    display: flex;
    align-items: center;
    gap: 1.2em;
  }

  .round {
    background: var(--cream);
    font-size: 1em;
  }

  .hearts {
    display: flex;
    gap: 0.25em;
  }

  .heart {
    width: 1.6em;
    height: 1.4em;
    fill: rgba(255, 243, 230, 0.45);
    stroke: var(--ink);
    stroke-width: 3;
    transition:
      fill 0.3s ease,
      transform 0.4s var(--spring);
  }

  .heart.full {
    fill: var(--cherry);
    transform: scale(1.15);
  }

  .timer {
    margin-left: auto;
    font-size: 0.85em;
  }

  .prompt {
    padding: 1.1em 1.6em 1.3em;
    transform: rotate(-1deg);
    display: flex;
    flex-direction: column;
    gap: 0.3em;
  }

  .kicker {
    font-family: var(--display);
    font-size: 1.8em;
    color: var(--pink-3);
  }

  h2 {
    font-size: 3.4em;
    line-height: 1.08;
  }

  .options {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.4em;
  }

  .options em {
    font-style: normal;
    font-size: 0.6em;
  }

  .option {
    display: inline-block;
    padding: 0.05em 0.35em 0.12em;
    border-radius: 0.3em;
    border: 0.06em solid var(--ink);
    box-shadow: 0.06em 0.08em 0 var(--ink);
  }

  .o0 {
    background: var(--lilac);
    transform: rotate(-2deg);
  }

  .o1 {
    background: var(--mint);
    transform: rotate(2deg);
  }

  .cards {
    position: relative;
    display: flex;
    justify-content: center;
    gap: 10em;
  }

  .column {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.6em;
  }

  .owner {
    font-weight: 800;
    font-size: 1.2em;
  }

  .card {
    width: 17em;
    height: 12em;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5em;
    border-radius: 1.2em;
    border: 0.18em solid var(--ink);
    box-shadow: var(--shadow);
    text-align: center;
  }

  .back {
    background: var(--pc);
    color: var(--pc-ink);
    background-image: repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.16) 0 0.6em, transparent 0.6em 1.2em);
    font-weight: 800;
    font-size: 1.1em;
    opacity: 0.55;
    transition:
      opacity 0.3s ease,
      transform 0.4s var(--spring);
  }

  .back.locked {
    opacity: 1;
    transform: rotate(-2deg) scale(1.03);
  }

  .seal {
    width: 3em;
    height: 2.6em;
    fill: var(--cherry);
    stroke: var(--ink);
    stroke-width: 3;
  }

  .locked .seal {
    animation: beat 1.2s ease-in-out infinite;
  }

  .face {
    background: var(--cream);
  }

  .pick {
    font-family: var(--display);
    font-size: 2.2em;
    line-height: 1.05;
    padding: 0 0.3em;
  }

  .none {
    font-weight: 800;
    color: var(--ink-2);
  }

  .verdict {
    position: absolute;
    left: 50%;
    top: 50%;
    translate: -50% -40%;
    padding: 0.2em 0.6em 0.3em;
    border-radius: 0.4em;
    border: 0.12em solid var(--ink);
    background: var(--paper-2);
    box-shadow: var(--shadow);
    font-family: var(--display);
    font-size: 2.6em;
    white-space: nowrap;
    rotate: -6deg;
  }

  .verdict.match {
    background: var(--mint);
  }

  @keyframes beat {
    0%,
    100% {
      transform: scale(1);
    }
    20% {
      transform: scale(1.2);
    }
    40% {
      transform: scale(1);
    }
  }
</style>
