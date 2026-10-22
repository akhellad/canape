<script lang="ts">
  import { fly } from 'svelte/transition';
  import DrawPad from '../../draw/DrawPad.svelte';
  import type { Seats } from '../../room/protocol';
  import Blob from '../../ui/Blob.svelte';
  import { other, type Slot } from '../types';
  import type { SketchPhone } from './logic';
  import Pattern from './Pattern.svelte';

  let { view, seats, act }: { view: SketchPhone; seats: Seats; me: Slot; act: (action: unknown) => void } = $props();

  const LEVELS = ['', 'Facile', 'Moyen', 'Difficile'];
  const partner = $derived(seats[other(view.me)]?.name ?? 'l’autre');

  let guess = $state('');
  let round = -1;

  const canDraw = $derived(view.role === 'drawer' && view.canDraw);

  $effect.pre(() => {
    if (view.round !== round) {
      round = view.round;
      guess = '';
    }
  });

  function submit(event: SubmitEvent) {
    event.preventDefault();
    const text = guess.trim();
    if (!text) return;
    act({ type: 'guess', text });
    guess = '';
  }
</script>

<div class="sketch p{view.me}">
  <div class="head">
    <span>Manche {view.round + 1} / {view.rounds}</span>
    <span>Score : <b>{view.score}</b></span>
    {#if view.phase === 'draw'}<span class="time" class:urgent={view.remaining <= 10}>{view.remaining} s</span>{/if}
  </div>

  {#if view.phase === 'reveal'}
    <div class="reveal" class:success={view.success} in:fly={{ y: 20, duration: 300 }}>
      <Blob slot={view.me} size="4rem" mood={view.success ? 'happy' : 'sad'} bounce={view.success === true} />
      <h2>{view.success ? `Trouvé ! +${view.points}` : 'Raté…'}</h2>
      {#if view.word}<p>C’était : <b>{view.word}</b></p>{/if}
      <p class="calm">Admirez le dessin sur la télé, prenez votre temps.</p>
      <button class="btn primary block next" onclick={() => act({ type: 'next' })}>
        {view.last ? 'Voir le score final' : 'Dessin suivant'}
      </button>
    </div>
  {:else if view.role === 'drawer'}
    {#if view.phase === 'choose'}
      <p class="lead">Choisis le mot que tu vas dessiner :</p>
      <div class="choices">
        {#each view.choices as choice, index (choice.word)}
          <button
            class="choice paper level{choice.level}"
            style:animation-delay={`${index * 80}ms`}
            onclick={() => act({ type: 'choose', index })}
          >
            <span class="level">{LEVELS[choice.level]} · ×{choice.level}</span>
            <span class="word">{choice.word}</span>
          </button>
        {/each}
      </div>
    {:else}
      <p class="lead">Dessine : <b class="target">{view.word}</b></p>
      <DrawPad {act} enabled={canDraw} resetKey={view.round}>
        {#snippet actions()}
          <button class="skip" onclick={() => act({ type: 'skip' })}>Passer</button>
        {/snippet}
      </DrawPad>
      {#if view.guesses.length}
        <p class="last">Dernière idée de {partner} : <b>{view.guesses[view.guesses.length - 1].text}</b></p>
      {/if}
    {/if}
  {:else}
    {#if view.phase === 'choose'}
      <div class="wait">
        <Blob slot={view.me === 0 ? 1 : 0} size="4rem" mood="wink" bounce />
        <p>{partner} choisit un mot…</p>
      </div>
    {:else}
      <p class="lead">Regarde la télé et devine le dessin de {partner} !</p>
      <div class="pattern"><Pattern pattern={view.pattern} /></div>
      {#if view.lastGuess && !view.lastGuess.correct}
        {#key view.lastGuess.seq}
          <p class="feedback" class:near={view.lastGuess.near} in:fly={{ y: -10, duration: 250 }}>
            {view.lastGuess.near ? 'Tout chaud, tu y es presque !' : 'Non, essaie encore !'}
          </p>
        {/key}
      {/if}
      <form class="guess" onsubmit={submit}>
        <input
          bind:value={guess}
          maxlength="40"
          class="field"
          placeholder="Ta proposition"
          autocomplete="off"
          autocapitalize="none"
          spellcheck="false"
          enterkeyhint="send"
        />
        <button class="btn go" type="submit" disabled={!guess.trim()}>Proposer</button>
      </form>
      <ul class="guesses">
        {#each [...view.guesses].reverse() as item (item.seq)}
          <li class:near={item.near}>
            {item.text}{#if item.near}<em>chaud</em>{/if}
          </li>
        {/each}
      </ul>
    {/if}
  {/if}
</div>

<style>
  .sketch {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
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
    animation: wiggle 0.5s ease-in-out infinite;
  }

  .lead {
    font-weight: 800;
    font-size: 1.1rem;
    line-height: 1.35;
  }

  .target {
    display: inline-block;
    font-family: var(--display);
    font-weight: 400;
    font-size: 1.5rem;
    padding: 0 0.4rem;
    border-radius: 0.4rem;
    background: var(--butter);
    border: 2px solid var(--ink);
    transform: rotate(-2deg);
  }

  .choices {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }

  .choice {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.2rem;
    padding: 0.9rem 1rem;
    text-align: left;
    animation: drop-in 0.45s var(--snap) backwards;
    transition:
      transform 0.1s ease,
      box-shadow 0.1s ease;
  }

  .choice:active {
    transform: translate(4px, 5px);
    box-shadow: 0 0 0 var(--ink);
  }

  .level1 {
    background: #d7fff2;
  }

  .level2 {
    background: var(--butter);
  }

  .level3 {
    background: var(--blush);
  }

  .level {
    font-weight: 800;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .word {
    font-family: var(--display);
    font-size: 1.6rem;
  }

  .skip {
    margin-left: auto;
    padding: 0.5rem 0.9rem;
    min-height: 2.75rem;
    border-radius: 0.7rem;
    border: 2px dashed var(--ink);
    font-weight: 800;
  }

  .last {
    font-weight: 600;
  }

  .calm {
    color: var(--ink-2);
    font-size: 0.95rem;
  }

  .next {
    margin-top: 0.6rem;
  }

  .wait,
  .reveal {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.7rem;
    text-align: center;
    font-weight: 800;
    font-size: 1.15rem;
  }

  .reveal h2 {
    font-size: 2.6rem;
    color: var(--cream);
    -webkit-text-stroke: 0.035em var(--ink);
    paint-order: stroke fill;
    text-shadow: 0.04em 0.05em 0 var(--ink);
    --tilt: -3deg;
    animation: stamp 0.55s var(--snap) both;
  }

  .reveal.success h2 {
    color: var(--butter);
  }

  .reveal b {
    text-transform: uppercase;
  }

  .pattern {
    font-size: 1.7rem;
    padding: 0.6rem 0;
  }

  .feedback {
    text-align: center;
    font-weight: 800;
  }

  .feedback.near {
    align-self: center;
    padding: 0.2rem 0.8rem;
    border-radius: 999px;
    border: 2px solid var(--ink);
    background: var(--tangerine);
  }

  .guess {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.6rem;
  }

  .guesses {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .guesses li {
    display: flex;
    justify-content: space-between;
    padding: 0.45rem 0.8rem;
    border-radius: 0.8rem;
    background: var(--cream);
    border: 2px solid var(--ink);
    font-weight: 800;
  }

  .guesses li.near {
    background: #ffd9bf;
  }

  .guesses em {
    font-style: normal;
    color: var(--berry);
  }
</style>
