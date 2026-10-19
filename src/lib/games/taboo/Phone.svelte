<script lang="ts">
  import type { Seats } from '../../room/protocol';
  import Blob from '../../ui/Blob.svelte';
  import { flipIn, slap } from '../../ui/motion';
  import { other, type Slot } from '../types';
  import type { TabooPhone } from './logic';

  let { view, seats, act }: { view: TabooPhone; seats: Seats; me: Slot; act: (action: unknown) => void } = $props();
  const partner = $derived(seats[other(view.me)]?.name ?? 'l’autre');
  const FEEDBACK = { found: 'Trouvé !', pass: 'Passé', buzz: 'Buzz, mot interdit !' };
</script>

<div class="taboo p{view.me}">
  <div class="head">
    <span>Manche {view.turn + 1} / {view.turns}</span>
    <span>Score : <b>{view.score}</b></span>
    {#if view.phase === 'play'}<span class="time" class:urgent={view.remaining <= 10}>{view.remaining} s</span>{/if}
  </div>

  {#if view.phase === 'summary'}
    <div class="center" in:slap>
      <Blob slot={view.me} size="4rem" mood={view.turnFound > 3 ? 'happy' : 'wink'} bounce />
      <h2>Temps écoulé !</h2>
      <p>{view.turnFound} mot{view.turnFound > 1 ? 's' : ''} trouvé{view.turnFound > 1 ? 's' : ''} cette manche.</p>
    </div>
  {:else if view.role === 'describer'}
    {#if view.phase === 'ready'}
      <div class="center">
        <Blob slot={view.me} size="4rem" mood="wink" bounce />
        <h2>À toi de faire deviner !</h2>
        <p>Montre pas ton écran à {partner}. Tu as 60 secondes : fais deviner un max de mots, à l’oral.</p>
        <button class="btn go block start" onclick={() => act({ type: 'start' })}>C’est parti !</button>
      </div>
    {:else if view.card}
      {#key view.card.word}
        <div class="card paper" in:flipIn={{ duration: 420 }}>
          <span class="label">Fais deviner</span>
          <h2 class="word">{view.card.word}</h2>
          <span class="label">Sans dire</span>
          <ul>
            {#each view.card.forbidden as word (word)}<li>{word}</li>{/each}
          </ul>
        </div>
      {/key}
      <div class="actions">
        <button class="btn go found" onclick={() => act({ type: 'found' })}>Trouvé !</button>
        <button class="btn" onclick={() => act({ type: 'pass' })}>Passer</button>
        <button class="btn danger" onclick={() => act({ type: 'buzz' })}>Buzz</button>
      </div>
    {/if}
  {:else}
    <div class="center">
      <Blob slot={view.me} size="4.4rem" mood={view.phase === 'play' ? 'wow' : 'happy'} bounce={view.phase === 'play'} />
      <h2>{view.phase === 'ready' ? `${partner} se prépare…` : 'Devine à voix haute !'}</h2>
      <p>{view.phase === 'ready' ? 'Écoute bien, tu devras trouver un max de mots.' : `Écoute ${partner} et crie tes idées.`}</p>
      {#if view.phase === 'play' && view.last}
        {#key view.last.seq}
          <p class="last {view.last.outcome}" in:slap>{FEEDBACK[view.last.outcome]} C’était « {view.last.word} »</p>
        {/key}
      {/if}
      {#if view.phase === 'play'}
        <button class="btn danger block buzz" onclick={() => act({ type: 'buzz' })}>Buzz ! Mot interdit</button>
      {/if}
    </div>
  {/if}
</div>

<style>
  .taboo {
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
    animation: wiggle 0.5s ease-in-out infinite;
  }

  .center {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.9rem;
    text-align: center;
  }

  .center h2 {
    font-size: 2rem;
  }

  .center p {
    font-weight: 600;
    line-height: 1.4;
    max-width: 22rem;
  }

  .start,
  .buzz {
    margin-top: 1rem;
    min-height: 4rem;
    font-size: 1.4rem;
  }

  .card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
    padding: 1.1rem 1rem 1.2rem;
    text-align: center;
    transform: rotate(-1deg);
  }

  .label {
    font-weight: 800;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--ink-2);
  }

  .word {
    font-size: 2.4rem;
    padding: 0.1rem 0.6rem 0.25rem;
    margin-bottom: 0.4rem;
    border-radius: 0.6rem;
    background: var(--mint);
    border: 3px solid var(--ink);
    transform: rotate(-2deg);
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  li {
    padding: 0.35rem;
    border-radius: 0.6rem;
    background: var(--blush);
    font-weight: 800;
    font-size: 1.2rem;
  }

  li::before {
    content: '✕ ';
    color: var(--cherry);
    font-weight: 900;
  }

  .actions {
    margin-top: auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.7rem;
  }

  .found {
    grid-column: span 2;
    min-height: 4.4rem;
    font-size: 1.6rem;
  }

  .last {
    padding: 0.4rem 0.8rem;
    border-radius: 0.8rem;
    border: 2px solid var(--ink);
    background: var(--cream);
    font-weight: 800 !important;
  }

  .last.found {
    background: var(--mint);
  }

  .last.buzz {
    background: var(--blush);
  }
</style>
