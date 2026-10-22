<script lang="ts">
  import type { Seats } from '../../room/protocol';
  import WriteBox from '../../ui/WriteBox.svelte';
  import { other, type Slot } from '../types';
  import type { MemoriesPhone } from './logic';

  let { view, seats, act }: { view: MemoriesPhone; seats: Seats; me: Slot; act: (action: unknown) => void } = $props();
  const partner = $derived(seats[other(view.me)]?.name ?? 'l’autre');
</script>

<div class="memories p{view.me}">
  <div class="head">
    <span>Souvenir {view.round + 1} / {view.rounds}</span>
    <span>Score d’équipe <b>{view.score}</b></span>
  </div>

  <div class="question paper"><p>{view.question}</p></div>

  {#if view.phase === 'answer'}
    <p class="lead">Écris ta version, sans regarder celle de {partner} :</p>
    <WriteBox
      slot={view.me}
      sent={view.written}
      waiting={`C’est noté ! On attend ${partner}…`}
      placeholder="Ma version"
      resetKey={view.round}
      onsend={(text) => act({ type: 'write', text })}
    />
  {:else if view.answers}
    <div class="answers">
      <div class="answer"><span>Ta version</span><b>{view.answers[view.me]}</b></div>
      <div class="answer"><span>La version de {partner}</span><b>{view.answers[other(view.me)]}</b></div>
    </div>
    <p class="lead">Racontez-vous, puis décidez ensemble :</p>
    <div class="matches">
      <button class="btn go" onclick={() => act({ type: 'match', match: 'same' })}>Même souvenir ! +2</button>
      <button class="btn primary" onclick={() => act({ type: 'match', match: 'close' })}>À peu près +1</button>
      <button class="btn" onclick={() => act({ type: 'match', match: 'different' })}>Pas du tout</button>
    </div>
  {/if}
</div>

<style>
  .memories {
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
    transform: rotate(1deg);
  }

  .question p {
    margin: 0;
    font-family: var(--display);
    font-size: 1.5rem;
    line-height: 1.25;
  }

  .lead {
    font-weight: 800;
    font-size: 1.1rem;
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

  .matches {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
</style>
