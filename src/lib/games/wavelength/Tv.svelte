<script lang="ts">
  import type { Seats } from '../../room/protocol';
  import Blob from '../../ui/Blob.svelte';
  import { slap } from '../../ui/motion';
  import { other, type Slot } from '../types';
  import Dial from './Dial.svelte';
  import type { WavelengthTv } from './logic';

  let { view, seats }: { view: WavelengthTv; seats: Seats } = $props();
  const name = (slot: Slot) => seats[slot]?.name ?? `Joueur ${slot + 1}`;
  const guesser = $derived(other(view.psychic));
</script>

<section class="wave">
  <header>
    <span class="sticker">Manche {view.round + 1} / {view.rounds}</span>
    <div class="score paper">Score d’équipe <b>{view.score}</b> / {view.max}</div>
  </header>

  <div class="board">
    <span class="end left">{view.spectrum.left}</span>
    <div class="dial">
      <Dial needle={view.phase === 'clue' ? null : view.needle} target={view.target} />
    </div>
    <span class="end right">{view.spectrum.right}</span>
  </div>

  {#if view.phase === 'clue'}
    <div class="status">
      <Blob slot={view.psychic} size="2.6em" mood="wink" bounce />
      <p><b class="name-tag p{view.psychic}">{name(view.psychic)}</b> voit la cible et cherche un indice…</p>
    </div>
  {:else}
    {#key view.clue}
      <div class="clue" in:slap={{ rotate: -3 }}>
        <span>L’indice de {name(view.psychic)}</span>
        <h2 class="pop">« {view.clue} »</h2>
      </div>
    {/key}
    {#if view.phase === 'guess'}
      <p class="hint">{name(guesser)} place l’aiguille sur son téléphone…</p>
    {:else}
      <p class="verdict" class:good={(view.points ?? 0) >= 3} in:slap>
        {view.points === 4 ? 'Dans le mille !' : view.points ? `+${view.points} points` : 'Raté !'}
      </p>
      <p class="next sticker">Discutez-en, puis appuyez sur « {view.last ? 'Voir le résultat' : 'Manche suivante'} »</p>
    {/if}
  {/if}
</section>

<style>
  .wave {
    width: 100%;
    max-width: 84em;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.2em;
  }

  header {
    display: flex;
    align-items: center;
    gap: 1.4em;
  }

  .score {
    padding: 0.3em 1em;
    font-weight: 800;
    font-size: 1.2em;
  }

  .score b {
    font-family: var(--display);
    font-weight: 400;
    font-size: 1.4em;
  }

  .board {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr min(56vh, 46vw) 1fr;
    align-items: end;
    gap: 1.6em;
  }

  .end {
    padding: 0.4em 0.9em;
    border-radius: 0.6em;
    border: 0.15em solid var(--ink);
    background: var(--cream);
    box-shadow: var(--shadow-sm);
    font-family: var(--display);
    font-size: 2em;
    line-height: 1.15;
  }

  .left {
    justify-self: end;
    text-align: right;
    transform: rotate(-2deg);
  }

  .right {
    justify-self: start;
    transform: rotate(2deg);
  }

  .status {
    display: flex;
    align-items: center;
    gap: 0.8em;
    font-weight: 800;
    font-size: 1.4em;
  }

  .clue {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2em;
  }

  .clue span {
    font-weight: 800;
    font-size: 1.2em;
  }

  h2 {
    font-size: 3.4em;
    text-align: center;
  }

  .hint {
    font-weight: 700;
    font-size: 1.3em;
    color: var(--ink-2);
  }

  .verdict {
    padding: 0.1em 1em;
    border-radius: 999px;
    border: 0.14em solid var(--ink);
    background: var(--paper-2);
    font-family: var(--display);
    font-size: 2.2em;
  }

  .verdict.good {
    background: var(--mint);
  }

  .next {
    background: var(--butter);
    text-transform: none;
    font-size: 1.1em;
    animation: wiggle 1.6s ease-in-out infinite;
  }
</style>
