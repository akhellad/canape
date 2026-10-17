<script lang="ts">
  import { fly } from 'svelte/transition';
  import { backOut } from 'svelte/easing';
  import type { Seats } from '../../room/protocol';
  import Blob from '../../ui/Blob.svelte';
  import Icon from '../../ui/Icon.svelte';
  import { other, type Slot } from '../types';
  import type { AgentsTv, KeyCell } from './logic';

  let { view, seats }: { view: AgentsTv; seats: Seats } = $props();
  const name = (slot: Slot) => seats[slot]?.name ?? `Joueur ${slot + 1}`;
  const guesser = $derived(other(view.giver));
  const assassinTile = $derived(view.lastReveal?.result === 'assassin' ? view.lastReveal.tile : null);
  const keyClass = (cell: KeyCell) => `key-${cell}`;
</script>

<section class="agents">
  <div class="top">
    <div class="clue">
      {#if view.phase === 'over'}
        <Icon name={view.won ? 'party-popper' : 'skull'} size="2.6em" />
        <div>
          <span class="label">{view.won ? 'Mission accomplie !' : 'Mission échouée…'}</span>
          <span class="sub">Les cartes secrètes sont révélées</span>
        </div>
      {:else if view.phase === 'sudden'}
        <Icon name="stopwatch" size="2.6em" />
        <div>
          <span class="label danger">Mort subite !</span>
          <span class="sub">Plus d’indices : la moindre erreur est fatale.</span>
        </div>
      {:else if view.clue}
        <Blob slot={view.giver} size="2.4em" />
        <div>
          <span class="sub">Indice de {name(view.giver)} pour {name(guesser)}</span>
          {#key view.clue.word}
            <span class="word" in:fly={{ y: -20, duration: 400, easing: backOut }}>{view.clue.word} <em>· {view.clue.count}</em></span>
          {/key}
        </div>
      {:else}
        <Blob slot={view.giver} size="2.4em" mood="wink" />
        <div>
          <span class="label">{name(view.giver)} cherche un indice…</span>
          <span class="sub">{name(guesser)}, prépare-toi à deviner</span>
        </div>
      {/if}
    </div>

    <div class="status">
      <div class="tokens" aria-label={`${view.tokens} jetons de temps restants`}>
        {#each { length: view.maxTokens } as _, index (index)}
          <span class="token" class:used={index >= view.tokens}><Icon name="hourglass-done" size="1.6em" /></span>
        {/each}
      </div>
      <div class="found">
        <Icon name="detective" size="1.8em" />
        <span><b>{view.found}</b> / {view.total} agents</span>
        <div class="bar"><div class="fill" style:width={`${(view.found / view.total) * 100}%`}></div></div>
      </div>
    </div>
  </div>

  <div class="grid">
    {#each view.tiles as tile, index (index)}
      {@const pendingBy = view.pending[0] === index ? 0 : view.pending[1] === index ? 1 : null}
      {@const revealing = view.revealing?.tile === index}
      <div
        class="tile"
        class:found={tile.found}
        class:assassin={assassinTile === index}
        class:pending={pendingBy !== null}
        class:revealing
        style:--pending={pendingBy === 1 ? 'var(--p1)' : 'var(--p0)'}
      >
        <div class="face">
          {#if tile.found}
            <Icon name="detective" size="1.6em" />
          {:else if assassinTile === index}
            <Icon name="skull" size="1.6em" />
          {/if}
          <span class="text">{tile.word}</span>
        </div>
        {#if view.keys}
          <div class="keys">
            <span class={keyClass(view.keys[0][index])}></span>
            <span class={keyClass(view.keys[1][index])}></span>
          </div>
        {/if}
        <div class="marks">
          {#each [0, 1] as const as side (side)}
            {#if tile.bystander[side]}
              <span class="mark p{side}" title={`Passant pour ${name(side)}`}><Icon name="person-walking" size="1.1em" /></span>
            {/if}
          {/each}
        </div>
        {#if pendingBy !== null && !revealing}
          <span class="question">?</span>
        {/if}
      </div>
    {/each}
  </div>
</section>

<style>
  .agents {
    width: 100%;
    height: 100%;
    max-width: 92em;
    display: flex;
    flex-direction: column;
    gap: 1.1em;
  }

  .top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2em;
    min-height: 5em;
  }

  .clue {
    display: flex;
    align-items: center;
    gap: 0.9em;
  }

  .clue > div {
    display: flex;
    flex-direction: column;
    gap: 0.15em;
  }

  .label {
    font-family: var(--display);
    font-size: 2.1em;
  }

  .label.danger {
    color: var(--red);
  }

  .sub {
    color: var(--muted);
    font-weight: 800;
  }

  .word {
    font-family: var(--display);
    font-size: 3em;
    letter-spacing: 0.04em;
    color: var(--yellow);
  }

  .word em {
    font-style: normal;
    color: var(--text);
  }

  .status {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.5em;
  }

  .tokens {
    display: flex;
    gap: 0.2em;
  }

  .token {
    transition:
      opacity 0.4s ease,
      filter 0.4s ease;
  }

  .token.used {
    opacity: 0.25;
    filter: grayscale(1);
  }

  .found {
    display: flex;
    align-items: center;
    gap: 0.5em;
    font-weight: 800;
    font-size: 1.1em;
  }

  .found b {
    font-family: var(--display);
    font-size: 1.4em;
    color: var(--green);
  }

  .bar {
    width: 9em;
    height: 0.7em;
    border-radius: 999px;
    background: var(--plum-2);
    border: 0.1em solid var(--ink);
    overflow: hidden;
  }

  .fill {
    height: 100%;
    background: var(--green);
    transition: width 0.6s ease;
  }

  .grid {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    grid-template-rows: repeat(5, minmax(0, 1fr));
    gap: 0.8em;
  }

  .tile {
    position: relative;
    perspective: 50em;
  }

  .face {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4em;
    padding: 0 0.6em;
    border-radius: 0.8em;
    background: var(--cream);
    color: var(--ink);
    border: 0.16em solid var(--ink);
    box-shadow: 0 0.25em 0 var(--ink);
    transition:
      background 0.3s ease,
      transform 0.3s ease;
  }

  .text {
    font-weight: 900;
    font-size: 1.45em;
    letter-spacing: 0.03em;
    text-align: center;
    overflow-wrap: anywhere;
    line-height: 1.05;
  }

  .found .face {
    background: var(--green-dark);
    color: var(--cream);
    animation: flip 0.6s ease-out;
  }

  .found .text {
    font-size: 1.1em;
  }

  .assassin .face {
    background: var(--ink);
    color: var(--cream);
    border-color: var(--red);
    animation:
      flip 0.6s ease-out,
      shake 0.5s 0.6s ease-in-out 2;
  }

  .pending .face {
    background: var(--yellow);
    box-shadow:
      0 0.25em 0 var(--ink),
      0 0 0 0.25em var(--pending);
    transform: translateY(-0.2em);
  }

  .revealing .face {
    animation: wiggle 0.25s ease-in-out infinite;
    background: var(--yellow);
  }

  .question {
    position: absolute;
    top: -0.6em;
    right: -0.4em;
    width: 1.6em;
    height: 1.6em;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: var(--pending);
    border: 0.12em solid var(--ink);
    color: var(--ink);
    font-family: var(--display);
    font-size: 1.2em;
    animation: bob 0.9s ease-in-out infinite;
  }

  .marks {
    position: absolute;
    bottom: 0.25em;
    left: 0.35em;
    right: 0.35em;
    display: flex;
    justify-content: space-between;
    pointer-events: none;
  }

  .mark {
    display: grid;
    place-items: center;
    width: 1.6em;
    height: 1.6em;
    border-radius: 50%;
    background: var(--pc);
    border: 0.1em solid var(--ink);
    animation: pop-in 0.35s ease-out;
  }

  .mark.p1 {
    margin-left: auto;
  }

  .keys {
    position: absolute;
    top: 0.35em;
    left: 0.6em;
    right: 0.6em;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.3em;
  }

  .keys span {
    height: 0.45em;
    border-radius: 999px;
    border: 0.08em solid var(--ink);
  }

  .key-agent {
    background: var(--green);
  }

  .key-assassin {
    background: var(--ink);
  }

  .key-neutral {
    background: var(--paper-2);
  }

  @keyframes flip {
    0% {
      transform: rotateY(90deg);
    }
    100% {
      transform: rotateY(0);
    }
  }
</style>
