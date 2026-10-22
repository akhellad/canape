<script lang="ts">
  import type { Seats } from '../../room/protocol';
  import WriteBox from '../../ui/WriteBox.svelte';
  import { other, type Slot } from '../types';
  import type { HeartPhone } from './logic';

  let { view, seats, act }: { view: HeartPhone; seats: Seats; me: Slot; act: (action: unknown) => void } = $props();
  const partner = $derived(seats[other(view.me)]?.name ?? 'l’autre');
  const subject = $derived(view.role === 'subject');
</script>

<div class="heart p{view.me}">
  <div class="head">
    <span>Question {view.round + 1} / {view.rounds}</span>
    <span>Toi <b>{view.scores[view.me]}</b> · {partner} <b>{view.scores[other(view.me)]}</b></span>
  </div>

  <div class="question paper">
    <span class="for">{subject ? 'Question pour toi' : `Question pour ${partner}`}</span>
    <p>{view.question}</p>
  </div>

  {#if view.phase === 'answer'}
    <p class="lead">{subject ? 'Réponds sincèrement, en secret :' : `Devine ce que ${partner} va répondre :`}</p>
    <WriteBox
      slot={view.me}
      sent={view.written}
      waiting={`C’est noté ! On attend ${partner}…`}
      placeholder={subject ? 'Ma réponse' : `La réponse de ${partner}`}
      resetKey={view.round}
      onsend={(text) => act({ type: 'write', text })}
    />
  {:else}
    <div class="answers">
      <div class="answer"><span>{subject ? 'Ta réponse' : `La réponse de ${partner}`}</span><b>{view.answer}</b></div>
      <div class="answer"><span>{subject ? `Le pari de ${partner}` : 'Ton pari'}</span><b>{view.guess}</b></div>
    </div>
    {#if subject}
      <p class="lead">Alors, {partner} te connaît bien ?</p>
      <div class="verdicts">
        <button class="btn go" onclick={() => act({ type: 'judge', verdict: 'right' })}>Bien vu ! +2</button>
        <button class="btn primary" onclick={() => act({ type: 'judge', verdict: 'close' })}>Presque +1</button>
        <button class="btn" onclick={() => act({ type: 'judge', verdict: 'wrong' })}>Raté</button>
      </div>
    {:else}
      <p class="wait">Discutez-en… puis {partner} juge ton pari.</p>
    {/if}
  {/if}
</div>

<style>
  .heart {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
  }

  .head {
    display: flex;
    justify-content: space-between;
    font-weight: 800;
    font-size: 0.95rem;
  }

  .head b {
    font-family: var(--display);
    font-weight: 400;
    font-size: 1.2em;
  }

  .question {
    padding: 0.9rem 1rem;
    background: var(--blush);
    transform: rotate(-1deg);
  }

  .for {
    font-weight: 800;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .question p {
    margin: 0.3rem 0 0;
    font-family: var(--display);
    font-size: 1.5rem;
    line-height: 1.25;
  }

  .lead,
  .wait {
    font-weight: 800;
    font-size: 1.1rem;
  }

  .wait {
    text-align: center;
    padding: 1rem 0;
  }

  .answers {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .answer {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    padding: 0.7rem 0.9rem;
    border-radius: 0.9rem;
    border: 2px solid var(--ink);
    background: var(--cream);
    box-shadow: 3px 4px 0 var(--ink);
  }

  .answer span {
    font-weight: 800;
    font-size: 0.85rem;
  }

  .answer b {
    font-family: var(--display);
    font-weight: 400;
    font-size: 1.4rem;
    overflow-wrap: anywhere;
  }

  .verdicts {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 0.5rem;
  }

  .verdicts .btn {
    padding-inline: 0.4rem;
    font-size: 0.95rem;
  }
</style>
