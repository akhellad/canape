<script lang="ts">
  import { backOut } from 'svelte/easing';
  import { fly } from 'svelte/transition';
  import type { Seats } from '../../room/protocol';
  import Blob from '../../ui/Blob.svelte';
  import { slap } from '../../ui/motion';
  import Timer from '../../ui/Timer.svelte';
  import type { Slot } from '../types';
  import type { CrosswordTv } from './logic';

  let { view, seats }: { view: CrosswordTv; seats: Seats } = $props();
  const name = (slot: Slot) => seats[slot]?.name ?? `Joueur ${slot + 1}`;
  const cellSize = $derived(`min(${76 / view.rows}vh, ${50 / view.cols}vw)`);
</script>

<section class="cross">
  <div class="board" style:--cell={cellSize} style:grid-template-columns={`repeat(${view.cols}, var(--cell))`}>
    {#each view.blocks as block, cell (cell)}
      {#if block}
        <span class="block"></span>
      {:else}
        {@const finder = view.finders[cell]}
        <span class="square" class:p0={finder === 0} class:p1={finder === 1} class:filled={finder !== null}>
          {#if view.numbers[cell]}<small>{view.numbers[cell]}</small>{/if}
          {#if view.letters[cell]}
            {#key view.letters[cell]}<b in:slap={{ rotate: 0 }}>{view.letters[cell]}</b>{/key}
          {/if}
        </span>
      {/if}
    {/each}
  </div>

  <aside>
    <h2 class="pop">Mots croisés</h2>
    {#if view.remaining !== null && view.timeTotal !== null && view.phase === 'play'}
      <Timer remaining={view.remaining} total={view.timeTotal} />
    {/if}
    <div class="stats paper">
      <span><b>{view.found}</b> / {view.total} mots</span>
      <span>Score <b>{view.score}</b></span>
      {#if view.hints}<span class="sub">{view.hints} indice{view.hints > 1 ? 's' : ''}</span>{/if}
    </div>
    {#if view.last && view.phase === 'play'}
      {#key view.last.seq}
        <div class="last p{view.last.by}" in:fly={{ x: 40, duration: 400, easing: backOut }}>
          <Blob slot={view.last.by} size="2em" mood="happy" />
          <span><b>{name(view.last.by)}</b> a trouvé <b class="word">{view.last.word}</b></span>
        </div>
      {/key}
    {/if}
    {#if view.phase === 'done'}
      <p class="end sticker">
        {view.complete ? 'Grille complète !' : 'Voici la solution.'} Appuyez sur « Voir le résultat » quand vous voulez
      </p>
    {:else}
      <p class="tip">Les définitions sont sur vos téléphones. Parlez-vous !</p>
    {/if}
  </aside>
</section>

<style>
  .cross {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 3em;
  }

  .board {
    display: grid;
    gap: 0;
    padding: 0.4em;
    border-radius: 0.6em;
    border: 0.2em solid var(--ink);
    background: var(--ink);
    box-shadow: var(--shadow);
  }

  .block,
  .square {
    width: var(--cell);
    height: var(--cell);
  }

  .block {
    background: transparent;
  }

  .square {
    position: relative;
    display: grid;
    place-items: center;
    background: var(--cream);
    border: 0.08em solid var(--ink);
    color: var(--ink);
  }

  .square.filled.p0 {
    background: #dfe2ff;
  }

  .square.filled.p1 {
    background: #fff1b8;
  }

  .square small {
    position: absolute;
    top: 0.1em;
    left: 0.2em;
    font-size: calc(var(--cell) * 0.26);
    font-weight: 900;
    line-height: 1;
  }

  .square b {
    font-family: var(--display);
    font-weight: 400;
    font-size: calc(var(--cell) * 0.58);
    line-height: 1;
  }

  aside {
    width: 22em;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.2em;
  }

  h2 {
    font-size: 3em;
    text-align: center;
  }

  .stats {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3em;
    padding: 0.8em 1em;
    font-weight: 800;
    font-size: 1.3em;
    transform: rotate(-1.5deg);
  }

  .stats b {
    font-size: 1.5em;
  }

  .sub {
    font-size: 0.8em;
    color: var(--ink-2);
  }

  .last {
    display: flex;
    align-items: center;
    gap: 0.6em;
    padding: 0.5em 1em 0.5em 0.6em;
    border-radius: 999px;
    border: 0.14em solid var(--ink);
    background: var(--pc);
    color: var(--pc-ink);
    box-shadow: var(--shadow-sm);
    font-weight: 700;
    font-size: 1.1em;
  }

  .last b {
    font-size: 1.1em;
  }

  .tip {
    text-align: center;
    font-weight: 700;
    font-size: 1.15em;
    color: var(--ink-2);
  }

  .end {
    background: var(--butter);
    white-space: normal;
    text-transform: none;
    text-align: center;
    font-size: 1.1em;
    animation: wiggle 1.6s ease-in-out infinite;
  }
</style>
