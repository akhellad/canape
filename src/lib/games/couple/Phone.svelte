<script lang="ts">
  import type { Seats } from '../../room/protocol';
  import Blob from '../../ui/Blob.svelte';
  import { slap } from '../../ui/motion';
  import { other, SLOTS, type Slot } from '../types';
  import type { CouplePhone } from './logic';

  let { view, seats, act }: { view: CouplePhone; seats: Seats; me: Slot; act: (action: unknown) => void } = $props();
  const name = (slot: Slot) => seats[slot]?.name ?? `Joueur ${slot + 1}`;
  const reveal = $derived(view.phase === 'reveal');
  const labels = $derived(
    view.prompt.kind === 'who' ? SLOTS.map((slot) => (slot === view.me ? `Moi (${name(slot)})` : name(slot))) : view.prompt.options,
  );
</script>

<div class="couple p{view.me}">
  <div class="head">
    <span>Question {view.round + 1} / {view.rounds}</span>
    <span class="sticker">{view.matches} ♥</span>
    {#if !reveal}<span class="time" class:urgent={view.remaining <= 5}>{view.remaining} s</span>{/if}
  </div>

  <div class="prompt paper">
    <span class="kicker">{view.prompt.kind === 'who' ? 'Qui de nous deux…' : 'Tu préfères…'}</span>
    <p>{view.prompt.kind === 'who' ? `…${view.prompt.text} ?` : `${view.prompt.options[0]} ou ${view.prompt.options[1]} ?`}</p>
  </div>

  {#if reveal}
    <div class="verdict" class:match={view.match} in:slap>
      <Blob slot={view.me} size="3.2rem" mood={view.match ? 'happy' : 'sad'} bounce={view.match === true} />
      <div>
        <h2>{view.match ? 'D’accord !' : 'Pas d’accord…'}</h2>
        {#if view.partner !== null}
          <p>{name(other(view.me))} a répondu : <b>{labels[view.partner]}</b></p>
        {:else}
          <p>{name(other(view.me))} n’a pas répondu.</p>
        {/if}
      </div>
    </div>
  {:else}
    <div class="choices">
      {#each [0, 1] as index (index)}
        <button
          class="choice o{index}"
          class:mine={view.mine === index}
          class:dim={view.mine !== null && view.mine !== index}
          disabled={view.mine !== null}
          onclick={() => act({ type: 'answer', choice: index })}
        >
          {#if view.prompt.kind === 'who'}<Blob slot={index as Slot} size="2.6rem" mood="happy" />{/if}
          <span>{labels[index]}</span>
        </button>
      {/each}
    </div>
    {#if view.mine !== null}<p class="wait">Réponse cachée ! On attend {name(other(view.me))}…</p>{/if}
  {/if}
</div>

<style>
  .couple {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-weight: 800;
  }

  .head .sticker {
    background: var(--cherry);
    color: var(--cream);
  }

  .time {
    padding: 0.1rem 0.6rem;
    border-radius: 999px;
    border: 2px solid var(--ink);
    background: var(--cream);
  }

  .time.urgent {
    background: var(--cherry);
    color: var(--cream);
  }

  .prompt {
    padding: 0.9rem 1rem 1rem;
    transform: rotate(-1deg);
  }

  .kicker {
    font-family: var(--display);
    color: var(--pink-3);
    font-size: 1.1rem;
  }

  .prompt p {
    font-family: var(--display);
    font-size: 1.6rem;
    line-height: 1.12;
  }

  .choices {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
  }

  .choice {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    min-height: 5rem;
    padding: 0.6rem 1rem;
    border-radius: 1.1rem;
    border: 3px solid var(--ink);
    box-shadow: 4px 5px 0 var(--ink);
    font-family: var(--display);
    font-size: 1.45rem;
    text-align: left;
    transition:
      transform 0.25s var(--spring),
      opacity 0.25s ease;
  }

  .choice:active:not(:disabled) {
    transform: translate(4px, 5px);
    box-shadow: none;
  }

  .o0 {
    background: var(--lilac);
  }

  .o1 {
    background: var(--mint);
  }

  .mine {
    transform: scale(1.03) rotate(-1.5deg);
  }

  .dim {
    opacity: 0.4;
  }

  .wait {
    text-align: center;
    font-weight: 800;
  }

  .verdict {
    display: flex;
    align-items: center;
    gap: 0.9rem;
    padding: 0.8rem 1rem;
    border-radius: 1.1rem;
    border: 3px solid var(--ink);
    background: var(--paper-2);
    box-shadow: 4px 5px 0 var(--ink);
  }

  .verdict.match {
    background: var(--mint);
  }

  .verdict h2 {
    font-size: 1.8rem;
  }

  .verdict p {
    font-weight: 600;
  }
</style>
