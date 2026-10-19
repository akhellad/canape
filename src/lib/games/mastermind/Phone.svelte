<script lang="ts">
  import type { Seats } from '../../room/protocol';
  import { slap } from '../../ui/motion';
  import { other, type Slot } from '../types';
  import { COLOR_NAMES, COLORS, LENGTH, MAX_GUESSES, type MastermindPhone } from './logic';
  import Pegs from './Pegs.svelte';

  let { view, seats, act }: { view: MastermindPhone; seats: Seats; me: Slot; act: (action: unknown) => void } = $props();
  const partner = $derived(seats[other(view.me)]?.name ?? 'l’autre');

  let slots = $state<(number | null)[]>([null, null, null, null]);
  let stage = '';

  $effect.pre(() => {
    const key = `${view.phase}-${view.mine.length}-${view.ready}`;
    if (key !== stage) {
      stage = key;
      slots = [null, null, null, null];
    }
  });

  const full = $derived(slots.every((slot) => slot !== null));
  const composing = $derived((view.phase === 'setup' && !view.ready) || view.myTurn);

  function add(color: number) {
    const index = slots.indexOf(null);
    if (index >= 0) slots[index] = color;
  }

  function submit() {
    if (!full) return;
    act({ type: view.phase === 'setup' ? 'code' : 'guess', pegs: $state.snapshot(slots) });
  }
</script>

<div class="mastermind p{view.me}">
  {#if view.phase === 'setup'}
    <p class="status">
      {view.ready
        ? view.otherReady
          ? 'C’est parti !'
          : `Code enregistré ! On attend ${partner}…`
        : `Compose le code que ${partner} devra trouver.`}
    </p>
  {:else if view.phase === 'over'}
    <div class="end" in:slap>
      <h2>{view.winner === null ? 'Égalité !' : view.winner === view.me ? 'Code cassé, gagné !' : 'Perdu…'}</h2>
      {#if view.theirCode}<p>Le code de {partner} :</p>
        <div class="big"><Pegs pegs={view.theirCode} /></div>{/if}
    </div>
  {:else}
    <p class="status" class:mine={view.myTurn}>
      {view.myTurn ? `À toi ! Essai ${view.mine.length + 1} sur ${MAX_GUESSES}.` : `${partner} réfléchit…`}
    </p>
  {/if}

  {#if view.code && view.phase !== 'setup'}
    <div class="own">Ton code : <Pegs pegs={view.code} /></div>
  {/if}

  {#if composing}
    <div class="compose board">
      <div class="slots">
        {#each slots as slot, index (index)}
          <button
            class="slot"
            class:empty={slot === null}
            style:--peg={slot === null ? 'transparent' : COLORS[slot]}
            aria-label={slot === null ? `Emplacement ${index + 1} vide` : `Retirer ${COLOR_NAMES[slot]}`}
            onclick={() => (slots[index] = null)}
          ></button>
        {/each}
      </div>
      <div class="palette">
        {#each COLORS as color, index (color)}
          <button class="color" style:--peg={color} aria-label={COLOR_NAMES[index]} disabled={full} onclick={() => add(index)}></button>
        {/each}
      </div>
      <button class="btn go block" disabled={!full} onclick={submit}>
        {view.phase === 'setup' ? 'Valider mon code' : 'Proposer'}
      </button>
    </div>
  {:else if view.phase === 'setup' && view.ready}
    <div class="board saved">
      <Pegs pegs={view.code ?? []} />
      <button class="btn ghost" onclick={() => act({ type: 'unready' })}>Modifier</button>
    </div>
  {/if}

  {#if view.phase !== 'setup'}
    <div class="history board">
      <span class="title">Tes essais sur le code de {partner}</span>
      {#if !view.mine.length}<span class="none">Aucun essai pour l’instant.</span>{/if}
      {#each [...view.mine].reverse() as guess, index (view.mine.length - index)}
        <div class="line"><span>{view.mine.length - index}</span><Pegs pegs={guess.pegs} feedback={guess} /></div>
      {/each}
    </div>
    <p class="legend">● bonne couleur bien placée · ○ bonne couleur mal placée</p>
  {/if}
</div>

<style>
  .mastermind {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
  }

  .status {
    font-weight: 800;
    font-size: 1.05rem;
    line-height: 1.35;
  }

  .status.mine {
    padding: 0.4rem 0.8rem;
    border-radius: 0.8rem;
    border: 2px solid var(--ink);
    background: var(--pc);
    color: var(--pc-ink);
    box-shadow: 3px 4px 0 var(--ink);
  }

  .own {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-weight: 800;
    font-size: 0.85rem;
  }

  .board {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    padding: 0.9rem;
    border-radius: 1rem;
    border: 3px solid var(--ink);
    background: #4a1534;
    color: var(--cream);
    box-shadow: 4px 5px 0 var(--ink);
  }

  .saved {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .saved .btn {
    --btn-fg: var(--cream);
    border-color: var(--cream);
    min-height: 2.6rem;
  }

  .slots {
    display: flex;
    justify-content: center;
    gap: 0.7rem;
  }

  .slot {
    width: 3.4rem;
    height: 3.4rem;
    border-radius: 50%;
    border: 3px solid var(--ink);
    background: radial-gradient(circle at 34% 30%, rgba(255, 255, 255, 0.55) 0 14%, transparent 15%), var(--peg);
    transition: transform 0.2s var(--spring);
  }

  .slot.empty {
    border: 3px dashed rgba(255, 243, 230, 0.6);
    background: transparent;
  }

  .slot:not(.empty) {
    animation: pop-in 0.25s var(--spring);
  }

  .palette {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 0.5rem;
  }

  .color {
    aspect-ratio: 1;
    border-radius: 50%;
    border: 3px solid var(--ink);
    background: var(--peg);
    box-shadow: 0 0 0 2px var(--cream);
  }

  .color:active:not(:disabled) {
    transform: scale(0.9);
  }

  .color:disabled {
    opacity: 0.4;
  }

  .history {
    gap: 0.4rem;
    font-size: 0.95rem;
  }

  .title {
    font-weight: 800;
    font-size: 0.85rem;
    opacity: 0.85;
  }

  .none {
    opacity: 0.7;
  }

  .line {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .line > span {
    width: 1.4rem;
    text-align: right;
    font-weight: 800;
    opacity: 0.6;
  }

  .legend {
    font-size: 0.85rem;
    font-weight: 700;
    text-align: center;
  }

  .end {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    font-weight: 700;
  }

  .end h2 {
    font-size: 2rem;
  }

  .big {
    font-size: 1.5rem;
    padding: 0.5rem 0.8rem;
    border-radius: 1rem;
    background: #4a1534;
    border: 3px solid var(--ink);
  }
</style>
