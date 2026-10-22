<script lang="ts">
  import Check from '@lucide/svelte/icons/check';
  import type { Seats } from '../../room/protocol';
  import { replay } from '../../ui/replay';
  import { other, type Slot } from '../types';
  import { HINT_COST, type ClueView, type CrosswordPhone } from './logic';

  let { view, seats, act }: { view: CrosswordPhone; seats: Seats; me: Slot; act: (action: unknown) => void } = $props();
  const partner = $derived(seats[other(view.me)]?.name ?? 'l’autre');

  let open = $state<number | null>(null);
  let text = $state('');
  let quitting = $state(false);

  const groups = $derived([
    { title: 'Horizontalement', clues: view.clues.filter((clue) => clue.dir === 'across') },
    { title: 'Verticalement', clues: view.clues.filter((clue) => clue.dir === 'down') },
  ]);
  const mine = (clue: ClueView) => clue.owner === null || clue.owner === view.me;
  const minutes = $derived(
    view.remaining === null ? null : `${Math.floor(view.remaining / 60)}:${String(view.remaining % 60).padStart(2, '0')}`,
  );

  $effect.pre(() => {
    if (open !== null && view.clues[open]?.found !== null) {
      open = null;
      text = '';
    }
  });

  function toggle(clue: ClueView) {
    if (view.phase !== 'play' || clue.found !== null || !mine(clue)) return;
    open = open === clue.id ? null : clue.id;
    text = '';
  }

  function submit(event: SubmitEvent, id: number) {
    event.preventDefault();
    if (!text.trim()) return;
    act({ type: 'answer', id, text });
  }
</script>

<div class="cross p{view.me}">
  <div class="head">
    <span><b>{view.found}</b> / {view.total} mots</span>
    <span>Score : <b>{view.score}</b></span>
    {#if minutes && view.phase === 'play'}<span class="time" class:urgent={(view.remaining ?? 99) <= 30}>{minutes}</span>{/if}
  </div>

  {#if view.phase === 'done'}
    <div class="over">
      <h2 class="pop">{view.complete ? 'Grille complète !' : 'Fin de la grille'}</h2>
      <p>La solution est sur la télé.</p>
      <button class="btn primary block" onclick={() => act({ type: 'next' })}>Voir le résultat</button>
    </div>
  {/if}

  {#each groups as group (group.title)}
    <section>
      <h3>{group.title}</h3>
      <ul>
        {#each group.clues as clue (clue.id)}
          <li
            class:found={clue.found !== null}
            class:theirs={!mine(clue)}
            use:replay={{ key: view.wrong?.id === clue.id ? view.wrong.seq : 0, className: 'shake' }}
          >
            <button class="clue" disabled={!mine(clue) || clue.found !== null || view.phase !== 'play'} onclick={() => toggle(clue)}>
              <span class="number">{clue.number}</span>
              <span class="body">
                <span class="text">{clue.clue ?? `Définition de ${partner}`}</span>
                <span class="pattern" aria-label={`${clue.length} lettres`}>
                  {#each clue.pattern as letter, index (index)}<span class="box">{letter ?? ''}</span>{/each}
                </span>
              </span>
              {#if clue.found !== null}<span class="ok"><Check size={20} /></span>{/if}
            </button>
            {#if open === clue.id}
              <form class="answer" onsubmit={(event) => submit(event, clue.id)}>
                <input
                  class="field"
                  bind:value={text}
                  maxlength="40"
                  placeholder={`${clue.length} lettres`}
                  autocomplete="off"
                  autocapitalize="characters"
                  spellcheck="false"
                  enterkeyhint="done"
                />
                <button class="btn go" type="submit" disabled={!text.trim()}>Valider</button>
                <button
                  class="hint"
                  type="button"
                  disabled={clue.pattern.filter((letter) => letter === null).length <= 1}
                  onclick={() => act({ type: 'hint', id: clue.id })}>Une lettre (−{HINT_COST} pts)</button
                >
              </form>
            {/if}
          </li>
        {/each}
      </ul>
    </section>
  {/each}

  {#if view.phase === 'play'}
    {#if quitting}
      <div class="quit paper">
        <p>Arrêter la grille et voir la solution ?</p>
        <div class="row">
          <button class="btn ghost" onclick={() => (quitting = false)}>Non, on continue</button>
          <button class="btn danger" onclick={() => act({ type: 'giveup' })}>Oui, on arrête</button>
        </div>
      </div>
    {:else}
      <button class="btn ghost block" onclick={() => (quitting = true)}>On sèche, voir la solution</button>
    {/if}
  {/if}
</div>

<style>
  .cross {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
  }

  .head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 800;
  }

  .head b {
    font-family: var(--display);
    font-weight: 400;
    font-size: 1.2em;
  }

  .time {
    padding: 0.1rem 0.7rem;
    border-radius: 999px;
    border: 2px solid var(--ink);
    background: var(--cream);
  }

  .time.urgent {
    background: var(--cherry);
    color: var(--cream);
  }

  h3 {
    margin: 0 0 0.4rem;
    font-family: var(--display);
    font-weight: 400;
    font-size: 1.3rem;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  li {
    border-radius: 0.9rem;
    border: 2px solid var(--ink);
    background: var(--cream);
    box-shadow: 3px 4px 0 var(--ink);
    overflow: hidden;
  }

  li:global(.shake) {
    animation: shake 0.45s ease-in-out;
  }

  li.found {
    background: #c9f5e6;
  }

  li.theirs {
    background: var(--paper-2);
    box-shadow: none;
    border-style: dashed;
  }

  .clue {
    width: 100%;
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
    padding: 0.6rem 0.7rem;
    text-align: left;
    color: var(--ink);
  }

  .clue:disabled {
    cursor: default;
  }

  .number {
    flex-shrink: 0;
    width: 1.8rem;
    height: 1.8rem;
    display: grid;
    place-items: center;
    border-radius: 50%;
    border: 2px solid var(--ink);
    background: var(--lilac);
    font-weight: 900;
  }

  .body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .text {
    font-weight: 700;
    line-height: 1.3;
  }

  .theirs .text {
    font-style: italic;
    color: var(--ink-2);
  }

  .pattern {
    display: flex;
    flex-wrap: wrap;
    gap: 0.15rem;
  }

  .box {
    width: 1.35rem;
    height: 1.5rem;
    display: grid;
    place-items: center;
    border: 1.5px solid var(--ink);
    border-radius: 0.2rem;
    background: #fff;
    font-weight: 900;
    font-size: 0.9rem;
  }

  .ok {
    color: #0f7a5c;
  }

  .answer {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.5rem;
    padding: 0 0.7rem 0.7rem;
  }

  .answer .field {
    padding: 0.55rem 0.8rem;
    font-size: 1.1rem;
    text-transform: uppercase;
  }

  .hint {
    grid-column: span 2;
    justify-self: start;
    padding: 0.3rem 0.7rem;
    min-height: 2.4rem;
    border-radius: 999px;
    border: 2px dashed var(--ink);
    color: var(--ink);
    font-weight: 800;
  }

  .hint:disabled {
    opacity: 0.4;
  }

  .over {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.6rem;
    text-align: center;
    font-weight: 700;
  }

  .over h2 {
    font-size: 2rem;
  }

  .quit {
    padding: 0.9rem;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    font-weight: 800;
    text-align: center;
  }

  .row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }
</style>
