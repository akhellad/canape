<script lang="ts">
  import { fly } from 'svelte/transition';
  import { backOut } from 'svelte/easing';
  import type { Seats } from '../../room/protocol';
  import Blob from '../../ui/Blob.svelte';
  import { slap } from '../../ui/motion';
  import { other, SLOTS, type Slot } from '../types';
  import { MAX_GUESSES, type MastermindTv } from './logic';
  import Pegs from './Pegs.svelte';

  let { view, seats }: { view: MastermindTv; seats: Seats } = $props();
  const name = (slot: Slot) => seats[slot]?.name ?? `Joueur ${slot + 1}`;
</script>

<section class="mastermind">
  <div class="banner">
    {#if view.phase === 'setup'}
      <h2 class="pop">Composez votre code secret</h2>
      <p class="sticker">Sur vos téléphones, sans montrer à l’autre !</p>
    {:else if view.phase === 'over'}
      <h2 class="pop" in:slap>
        {#if view.winner === null}Égalité !{:else}<span class="name-tag p{view.winner}">{name(view.winner)}</span> a cassé le code !{/if}
      </h2>
    {:else}
      {#key view.turn}
        <h2 class="pop turn">À <span class="name-tag p{view.turn}">{name(view.turn)}</span> de proposer</h2>
      {/key}
    {/if}
  </div>

  <div class="boards">
    {#each SLOTS as slot (slot)}
      {@const guesses = view.guesses[slot]}
      <div class="board p{slot}" class:active={view.phase === 'play' && view.turn === slot} class:solved={view.solved[slot]}>
        <header>
          <Blob {slot} size="2em" bounce={view.phase === 'play' && view.turn === slot} crown={view.winner === slot} />
          <span><b>{name(slot)}</b> cherche le code de {name(other(slot))}</span>
        </header>
        <div class="code">
          {#if view.phase === 'setup'}
            <span class="sticker" class:ok={view.ready[other(slot)]}>{view.ready[other(slot)] ? 'Code prêt' : 'Code en préparation…'}</span>
          {:else if view.codes}
            <div in:slap><Pegs pegs={view.codes[other(slot)]} /></div>
          {:else}
            <Pegs pegs={[null, null, null, null]} hidden />
          {/if}
        </div>
        <ol class="rows">
          {#each { length: MAX_GUESSES } as _, index (index)}
            {@const guess = guesses[index]}
            <li class:filled={guess} class:win={guess?.exact === 4}>
              <span class="n">{index + 1}</span>
              {#if guess}
                <div in:fly={{ x: -40, duration: 450, easing: backOut }}><Pegs pegs={guess.pegs} feedback={guess} /></div>
              {/if}
            </li>
          {/each}
        </ol>
      </div>
    {/each}
  </div>
</section>

<style>
  .mastermind {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1em;
  }

  .banner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4em;
  }

  h2 {
    font-size: 2.8em;
  }

  .turn {
    animation: pop-in 0.35s var(--spring);
  }

  .banner .sticker {
    background: var(--cream);
    font-size: 1em;
  }

  .boards {
    flex: 1;
    min-height: 0;
    display: flex;
    gap: 4em;
  }

  .board {
    width: 24em;
    display: flex;
    flex-direction: column;
    gap: 0.6em;
    padding: 1em 1.2em;
    border-radius: 1.3em;
    border: 0.16em solid var(--ink);
    background: #4a1534;
    color: var(--cream);
    box-shadow: var(--shadow);
    transition: transform 0.4s var(--spring);
  }

  .board.active {
    transform: rotate(-1deg) scale(1.03);
    box-shadow:
      var(--shadow),
      0 0 0 0.3em var(--pc);
  }

  .board.solved {
    background: #0f6b52;
  }

  header {
    display: flex;
    align-items: center;
    gap: 0.6em;
    font-weight: 700;
  }

  header b {
    font-family: var(--display);
    font-weight: 400;
    font-size: 1.3em;
  }

  .code {
    display: flex;
    justify-content: center;
    padding: 0.5em;
    border-radius: 0.8em;
    background: rgba(0, 0, 0, 0.25);
    font-size: 1.3em;
    min-height: 2.6em;
    align-items: center;
  }

  .code .sticker {
    font-size: 0.6em;
    background: var(--cream);
  }

  .code .sticker.ok {
    background: var(--mint);
  }

  .rows {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.25em;
    font-size: 1.05em;
  }

  li {
    display: flex;
    align-items: center;
    gap: 0.8em;
    min-height: 2.05em;
    padding: 0.1em 0.5em;
    border-radius: 0.6em;
    background: rgba(255, 255, 255, 0.06);
  }

  li.win {
    background: var(--mint);
    color: var(--ink);
  }

  .n {
    width: 1.4em;
    font-weight: 800;
    opacity: 0.9;
    text-align: right;
  }
</style>
