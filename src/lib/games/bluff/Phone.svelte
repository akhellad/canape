<script lang="ts">
  import { fly } from 'svelte/transition';
  import type { Seats } from '../../room/protocol';
  import Blob from '../../ui/Blob.svelte';
  import { other, type Slot } from '../types';
  import type { Author, BluffPhone } from './logic';

  let { view, seats, act }: { view: BluffPhone; seats: Seats; me: Slot; act: (action: unknown) => void } = $props();
  const partner = $derived(seats[other(view.me)]?.name ?? 'l’autre');
  const LETTERS = ['A', 'B', 'C', 'D', 'E'];

  let text = $state('');
  let round = -1;

  $effect.pre(() => {
    if (view.round !== round) {
      round = view.round;
      text = '';
    }
  });

  function submit(event: SubmitEvent) {
    event.preventDefault();
    if (text.trim()) act({ type: 'write', text });
  }

  function tag(author: Author | null): string {
    if (author === 'real') return 'La vraie !';
    if (author === 'decoy') return 'Piège du jeu';
    if (author === view.me) return 'Ton bluff';
    return `Bluff de ${partner}`;
  }
</script>

<div class="bluff p{view.me}">
  <div class="head">
    <span>Mot {view.round + 1} / {view.rounds}</span>
    <span>Toi <b>{view.scores[view.me]}</b> · {partner} <b>{view.scores[other(view.me)]}</b></span>
    {#if view.phase === 'write' && view.remaining !== null && !view.ready}
      <span class="time" class:urgent={view.remaining <= 15}>{view.remaining} s</span>
    {/if}
  </div>

  <div class="word paper">
    <b>{view.word}</b>
    <span>{view.nature}</span>
  </div>

  {#if view.phase === 'write'}
    {#if view.ready}
      <div class="wait" in:fly={{ y: 20, duration: 300 }}>
        <Blob slot={view.me} size="4rem" mood="wink" bounce />
        <p>Bluff envoyé ! On attend {partner}…</p>
      </div>
    {:else}
      <p class="lead">Invente une définition qui a l’air vraie :</p>
      <form class="write" onsubmit={submit}>
        <textarea class="field" bind:value={text} maxlength="160" rows="4" placeholder="Se dit de…"></textarea>
        <button class="btn go block" type="submit" disabled={!text.trim()}>Envoyer mon bluff</button>
      </form>
    {/if}
  {:else}
    {#if view.phase === 'vote'}
      <p class="lead">{view.vote === null ? 'Laquelle est la vraie ?' : `C’est noté ! On attend ${partner}…`}</p>
    {:else if view.gained !== null}
      <p class="lead result" class:good={view.gained > 0}>{view.gained > 0 ? `+${view.gained} points !` : 'Pas de points cette fois…'}</p>
    {/if}
    <ul class="options">
      {#each view.options as option, index (index)}
        <li>
          <button
            class="option"
            class:mine={view.vote === index}
            class:own={view.own === index}
            class:real={option.author === 'real'}
            disabled={view.phase !== 'vote' || view.vote !== null || view.own === index}
            onclick={() => act({ type: 'vote', option: index })}
          >
            <span class="letter">{LETTERS[index]}</span>
            <span class="text">{option.text}</span>
            {#if view.phase === 'reveal'}
              <em>{tag(option.author)}</em>
            {:else if view.own === index}
              <em>Ton bluff</em>
            {/if}
          </button>
        </li>
      {/each}
    </ul>
    {#if view.phase === 'reveal'}
      <button class="btn primary block" onclick={() => act({ type: 'next' })}>{view.last ? 'Voir le résultat' : 'Mot suivant'}</button>
    {/if}
  {/if}
</div>

<style>
  .bluff {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
  }

  .head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
    font-weight: 800;
    font-size: 0.95rem;
  }

  .head b {
    font-family: var(--display);
    font-weight: 400;
    font-size: 1.2em;
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

  .word {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2rem;
    padding: 0.9rem;
    background: var(--tangerine);
    transform: rotate(-1.5deg);
  }

  .word b {
    font-family: var(--display);
    font-weight: 400;
    font-size: 2rem;
    overflow-wrap: anywhere;
    text-align: center;
  }

  .word span {
    font-weight: 800;
    font-style: italic;
  }

  .lead {
    font-weight: 800;
    font-size: 1.1rem;
  }

  .result {
    align-self: center;
    padding: 0.2rem 0.9rem;
    border-radius: 999px;
    border: 2px solid var(--ink);
    background: var(--paper-2);
  }

  .result.good {
    background: var(--mint);
  }

  .write {
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
  }

  textarea {
    resize: none;
    font-size: 1.1rem;
    line-height: 1.4;
  }

  .options {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .option {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 0.6rem;
    padding: 0.7rem 0.8rem;
    border-radius: 0.9rem;
    border: 2px solid var(--ink);
    background: var(--cream);
    color: var(--ink);
    box-shadow: 3px 4px 0 var(--ink);
    text-align: left;
    font-weight: 700;
    line-height: 1.35;
  }

  .option:disabled {
    cursor: default;
  }

  .option.own {
    border-style: dashed;
    box-shadow: none;
    background: var(--paper-2);
  }

  .option.mine {
    background: var(--butter);
    transform: translate(2px, 3px);
    box-shadow: none;
  }

  .option.real {
    background: #c9f5e6;
  }

  .letter {
    flex-shrink: 0;
    width: 1.8rem;
    height: 1.8rem;
    display: grid;
    place-items: center;
    border-radius: 50%;
    border: 2px solid var(--ink);
    background: var(--tangerine);
    font-family: var(--display);
  }

  .text {
    flex: 1;
    min-width: 0;
  }

  em {
    flex-basis: 100%;
    font-style: normal;
    font-weight: 900;
    font-size: 0.85rem;
    text-align: right;
  }

  .wait {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.8rem;
    font-weight: 800;
    font-size: 1.15rem;
    text-align: center;
  }
</style>
