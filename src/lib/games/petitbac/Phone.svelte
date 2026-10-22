<script lang="ts">
  import { onDestroy } from 'svelte';
  import type { Seats } from '../../room/protocol';
  import { other, type Slot } from '../types';
  import { startsWith, type PetitBacPhone } from './logic';

  let { view, seats, act }: { view: PetitBacPhone; seats: Seats; me: Slot; act: (action: unknown) => void } = $props();
  const partner = $derived(seats[other(view.me)]?.name ?? 'l’autre');

  let answers = $state<string[]>([]);
  let round = -1;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let flushedStop = false;

  $effect.pre(() => {
    if (view.round !== round) {
      round = view.round;
      answers = view.categories.map(() => '');
      flushedStop = false;
    }
  });

  // When someone shouts stop, send what we have right away.
  $effect(() => {
    if (view.phase === 'stop' && !flushedStop) {
      flushedStop = true;
      send();
    }
  });

  onDestroy(() => {
    if (timer) clearTimeout(timer);
  });

  const complete = $derived(answers.length > 0 && answers.every((answer) => startsWith(answer, view.letter)));

  function send() {
    if (timer) clearTimeout(timer);
    timer = null;
    act({ type: 'answers', list: answers.map((answer) => answer.trim()) });
  }

  function changed() {
    if (timer) clearTimeout(timer);
    timer = setTimeout(send, 300);
  }

  function stop() {
    send();
    act({ type: 'stop' });
  }
</script>

<div class="bac p{view.me}">
  <div class="head">
    <span class="letter">{view.letter}</span>
    <div class="info">
      <span>Manche {view.round + 1} / {view.rounds}</span>
      <span>Toi <b>{view.scores[view.me]}</b> · {partner} <b>{view.scores[other(view.me)]}</b></span>
    </div>
    {#if view.phase === 'write'}<span class="time" class:urgent={view.remaining <= 10}>{view.remaining} s</span>{/if}
  </div>

  {#if view.phase === 'recap' && view.roundPoints}
    <div class="recap">
      <h2 class="pop">Fin de la manche {view.round + 1}</h2>
      <p>Cette manche : toi <b>+{view.roundPoints[view.me]}</b> · {partner} <b>+{view.roundPoints[other(view.me)]}</b></p>
      <p class="totals">Total : toi <b>{view.scores[view.me]}</b> · {partner} <b>{view.scores[other(view.me)]}</b></p>
      <p class="calm">Les réponses restent affichées sur la télé : discutez-en tranquillement.</p>
      <button class="btn primary block" onclick={() => act({ type: 'next' })}>
        {view.last ? 'Voir le résultat final' : 'Manche suivante'}
      </button>
    </div>
  {:else if view.phase === 'review' && view.grid}
    {@const mine = view.grid[view.me]}
    {@const theirs = view.grid[other(view.me)]}
    <p class="status">Vérifie les réponses de {partner} : touche celles que tu refuses.</p>
    <ul class="review">
      {#each view.categories as category, index (category)}
        <li>
          <span class="category">{category}</span>
          <button
            class="their"
            class:vetoed={theirs[index].vetoed}
            class:invalid={!theirs[index].valid && !theirs[index].vetoed}
            disabled={view.done || !theirs[index].text}
            onclick={() => act({ type: 'veto', index })}
          >
            <span>{theirs[index].text || '—'}</span>
            <em>{theirs[index].vetoed ? 'Refusé' : theirs[index].valid ? `+${theirs[index].points}` : 'Invalide'}</em>
          </button>
          <span class="own">Toi : {mine[index].text || '—'} <b>{mine[index].vetoed ? 'refusé' : `+${mine[index].points}`}</b></span>
        </li>
      {/each}
    </ul>
    {#if view.done}
      <p class="wait">C’est noté ! On attend {partner}…</p>
    {:else}
      <button class="btn go block" onclick={() => act({ type: 'done' })}>C’est bon pour moi</button>
    {/if}
  {:else}
    <form class="answers" onsubmit={(event) => event.preventDefault()}>
      {#each view.categories as category, index (category)}
        <label class:ok={startsWith(answers[index] ?? '', view.letter)}>
          <span>{category}</span>
          <input
            class="field"
            bind:value={answers[index]}
            oninput={changed}
            onblur={send}
            disabled={view.phase !== 'write'}
            maxlength="40"
            autocomplete="off"
            autocapitalize="sentences"
            spellcheck="false"
            enterkeyhint="next"
            placeholder={`${view.letter}…`}
          />
        </label>
      {/each}
    </form>
    {#if view.phase === 'stop'}
      <p class="wait">Stop ! Stylos posés.</p>
    {:else}
      <button class="btn danger block stop" disabled={!complete} onclick={stop}>Stop !</button>
    {/if}
  {/if}
</div>

<style>
  .bac {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
  }

  .head {
    display: flex;
    align-items: center;
    gap: 0.8rem;
  }

  .letter {
    width: 3.4rem;
    height: 3.4rem;
    display: grid;
    place-items: center;
    border-radius: 0.6rem;
    border: 3px solid var(--ink);
    background: var(--butter);
    box-shadow: 3px 4px 0 var(--ink);
    font-family: var(--display);
    font-size: 2.2rem;
    transform: rotate(-4deg);
  }

  .info {
    display: flex;
    flex-direction: column;
    font-weight: 800;
    font-size: 0.9rem;
  }

  .time {
    margin-left: auto;
    padding: 0.1rem 0.6rem;
    border-radius: 999px;
    border: 2px solid var(--ink);
    background: var(--cream);
    font-weight: 800;
  }

  .time.urgent {
    background: var(--cherry);
    color: var(--cream);
  }

  .answers {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    font-weight: 800;
    font-size: 0.9rem;
  }

  label.ok span::after {
    content: ' ✓';
    color: var(--good);
  }

  .field {
    padding: 0.6rem 0.8rem;
    font-size: 1.1rem;
  }

  .stop {
    min-height: 3.8rem;
    font-size: 1.5rem;
  }

  .status,
  .wait {
    font-weight: 800;
    text-align: center;
  }

  .review {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .review li {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .category {
    font-weight: 800;
    font-size: 0.85rem;
  }

  .their {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.55rem 0.8rem;
    border-radius: 0.8rem;
    border: 2px solid var(--ink);
    background: var(--cream);
    box-shadow: 3px 4px 0 var(--ink);
    font-family: var(--display);
    font-size: 1.15rem;
    text-align: left;
  }

  .their em {
    font-family: var(--body);
    font-style: normal;
    font-weight: 800;
    font-size: 0.75rem;
    padding: 0.05rem 0.45rem;
    border-radius: 999px;
    background: var(--mint);
    border: 1.5px solid var(--ink);
  }

  .their.vetoed {
    background: var(--blush);
  }

  .their.vetoed span {
    text-decoration: line-through;
  }

  .their.vetoed em {
    background: var(--cherry);
    color: var(--cream);
  }

  .their.invalid em {
    background: var(--paper-2);
  }

  .recap {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.8rem;
    text-align: center;
    font-weight: 700;
    font-size: 1.1rem;
  }

  .recap h2 {
    font-size: 2rem;
  }

  .recap b {
    font-family: var(--display);
    font-weight: 400;
    font-size: 1.3em;
  }

  .calm {
    color: var(--ink-2);
    font-size: 0.95rem;
  }

  .own {
    font-size: 0.85rem;
    font-weight: 600;
  }
</style>
