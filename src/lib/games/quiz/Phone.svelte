<script lang="ts">
  import type { Seats } from '../../room/protocol';
  import Blob from '../../ui/Blob.svelte';
  import { slap } from '../../ui/motion';
  import { other, type Slot } from '../types';
  import type { QuizPhone } from './logic';

  let { view, seats, act }: { view: QuizPhone; seats: Seats; me: Slot; act: (action: unknown) => void } = $props();
  const LETTERS = ['A', 'B', 'C', 'D'];
  const partner = $derived(seats[other(view.me)]?.name ?? 'l’autre');
  const reveal = $derived(view.phase === 'reveal');
  const right = $derived(reveal && view.mine !== null && view.mine === view.answer);
</script>

<div class="quiz p{view.me}">
  <div class="head">
    <span>Question {view.index + 1} / {view.count}{view.bonus ? ' · ×2' : ''}</span>
    <span class="scores">
      <b class="p0">{view.scores[0]}</b>
      <b class="p1">{view.scores[1]}</b>
    </span>
    {#if !reveal}<span class="time" class:urgent={view.remaining <= 5}>{view.remaining} s</span>{/if}
  </div>

  <p class="question">{view.text}</p>

  {#if reveal}
    <div class="verdict" class:right in:slap>
      <Blob slot={view.me} size="3.4rem" mood={right ? 'happy' : 'sad'} bounce={right} />
      <h2>{right ? `Bien vu ! +${view.points}` : view.mine === null ? 'Trop tard…' : 'Raté !'}</h2>
      {#if view.first}<span class="sticker first">Le plus rapide !</span>{/if}
    </div>
  {/if}

  <div class="choices">
    {#each view.choices as choice, index (index)}
      <button
        class="choice c{index}"
        class:mine={view.mine === index}
        class:dim={(view.mine !== null && view.mine !== index && !reveal) || (reveal && view.answer !== index)}
        class:good={reveal && view.answer === index}
        disabled={view.mine !== null || reveal}
        onclick={() => act({ type: 'answer', choice: index })}
      >
        <span class="letter">{LETTERS[index]}</span>
        <span class="label">{choice}</span>
        {#if view.mine === index && !reveal}<span class="sticker locked">Verrouillé</span>{/if}
      </button>
    {/each}
  </div>

  {#if view.mine !== null && !reveal}
    <p class="wait">Réponse envoyée ! On attend {partner}…</p>
  {/if}
</div>

<style>
  .quiz {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
  }

  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    font-weight: 800;
  }

  .scores {
    display: flex;
    gap: 0.3rem;
  }

  .scores b {
    min-width: 2.4rem;
    padding: 0 0.4rem;
    border-radius: 0.5rem;
    border: 2px solid var(--ink);
    background: var(--pc);
    color: var(--pc-ink);
    text-align: center;
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

  .question {
    font-family: var(--display);
    font-size: 1.35rem;
    line-height: 1.2;
  }

  .verdict {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.7rem;
    padding: 0.5rem 0.9rem;
    border-radius: 1rem;
    border: 3px solid var(--ink);
    background: var(--paper-2);
    box-shadow: 3px 4px 0 var(--ink);
  }

  .verdict.right {
    background: var(--mint);
  }

  .verdict h2 {
    font-size: 1.7rem;
  }

  .choices {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .choice {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.8rem;
    min-height: 4.2rem;
    padding: 0.6rem 0.9rem 0.6rem 0.6rem;
    border-radius: 1rem;
    border: 3px solid var(--ink);
    background: var(--tone);
    color: var(--tone-ink, var(--ink));
    box-shadow: 4px 5px 0 var(--ink);
    font-weight: 800;
    font-size: 1.1rem;
    text-align: left;
    transition:
      transform 0.25s var(--spring),
      opacity 0.25s ease,
      box-shadow 0.1s ease;
  }

  .choice:active:not(:disabled) {
    transform: translate(4px, 5px);
    box-shadow: none;
  }

  .choice:disabled {
    cursor: default;
  }

  .c0 {
    --tone: var(--cobalt);
    --tone-ink: var(--cream);
  }

  .c1 {
    --tone: var(--butter);
  }

  .c2 {
    --tone: var(--mint);
  }

  .c3 {
    --tone: var(--tangerine);
  }

  .letter {
    flex-shrink: 0;
    width: 2.2rem;
    height: 2.2rem;
    display: grid;
    place-items: center;
    border-radius: 0.6rem;
    background: var(--cream);
    color: var(--ink);
    border: 2px solid var(--ink);
    font-family: var(--display);
    font-weight: 400;
  }

  .mine {
    transform: scale(1.03) rotate(-1deg);
  }

  .dim {
    opacity: 0.4;
  }

  .good {
    transform: scale(1.03) rotate(1deg);
    box-shadow:
      4px 5px 0 var(--ink),
      0 0 0 4px var(--cream);
  }

  .locked {
    position: absolute;
    top: -0.7rem;
    right: 0.6rem;
    font-size: 0.65rem;
    background: var(--cream);
    transform: rotate(4deg);
  }

  .wait {
    text-align: center;
    font-weight: 800;
  }
</style>
