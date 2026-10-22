<script lang="ts">
  import { onDestroy } from 'svelte';
  import type { Seats } from '../../room/protocol';
  import Blob from '../../ui/Blob.svelte';
  import WriteBox from '../../ui/WriteBox.svelte';
  import { other, type Slot } from '../types';
  import Dial from './Dial.svelte';
  import type { WavelengthPhone } from './logic';

  let { view, seats, act }: { view: WavelengthPhone; seats: Seats; me: Slot; act: (action: unknown) => void } = $props();
  const partner = $derived(seats[other(view.me)]?.name ?? 'l’autre');
  const psychic = $derived(view.role === 'psychic');

  let value = $state(50);
  let round = -1;
  let timer: ReturnType<typeof setTimeout> | null = null;

  $effect.pre(() => {
    if (view.round !== round) {
      round = view.round;
      value = 50;
    }
  });

  onDestroy(() => {
    if (timer) clearTimeout(timer);
  });

  // The needle moves on the TV as you slide, without flooding the connection.
  function slide() {
    if (!timer) {
      timer = setTimeout(() => {
        timer = null;
        act({ type: 'aim', value });
      }, 80);
    }
  }

  function lock() {
    if (timer) clearTimeout(timer);
    timer = null;
    act({ type: 'lock', value });
  }
</script>

<div class="wave p{view.me}">
  <div class="head">
    <span>Manche {view.round + 1} / {view.rounds}</span>
    <span>Score d’équipe <b>{view.score}</b></span>
  </div>

  <div class="dial-wrap">
    <Dial
      needle={view.phase === 'guess' ? (psychic ? view.needle : value) : view.phase === 'reveal' ? view.needle : null}
      target={view.target}
    />
    <div class="ends">
      <span>{view.spectrum.left}</span>
      <span>{view.spectrum.right}</span>
    </div>
  </div>

  {#if view.phase === 'clue'}
    {#if psychic}
      <p class="lead">La cible est sur ton cadran. Écris un indice qui tombe pile dessus :</p>
      <WriteBox
        slot={view.me}
        sent={false}
        waiting=""
        placeholder="Mon indice"
        button="Envoyer l’indice"
        maxlength={60}
        resetKey={view.round}
        onsend={(text) => act({ type: 'clue', text })}
      />
    {:else}
      <div class="wait">
        <Blob slot={other(view.me)} size="3.5rem" mood="wink" bounce />
        <p>{partner} réfléchit à un indice…</p>
      </div>
    {/if}
  {:else}
    <div class="clue paper"><span>Indice de {psychic ? 'toi' : partner}</span><b>{view.clue}</b></div>
    {#if view.phase === 'guess'}
      {#if psychic}
        <p class="wait">{partner} cherche… garde ton sérieux !</p>
      {:else}
        <input class="slider" type="range" min="0" max="100" step="1" bind:value oninput={slide} aria-label="Position de l’aiguille" />
        <button class="btn go block" onclick={lock}>C’est là !</button>
      {/if}
    {:else}
      <p class="result" class:good={(view.points ?? 0) >= 3}>
        {view.points ? `+${view.points} points !` : 'Raté, à côté de la plaque…'}
      </p>
      <button class="btn primary block" onclick={() => act({ type: 'next' })}>{view.last ? 'Voir le résultat' : 'Manche suivante'}</button>
    {/if}
  {/if}
</div>

<style>
  .wave {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
  }

  .head {
    display: flex;
    justify-content: space-between;
    font-weight: 800;
  }

  .head b {
    font-family: var(--display);
    font-weight: 400;
    font-size: 1.2em;
  }

  .ends {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 0.3rem;
    font-weight: 900;
  }

  .ends span:last-child {
    text-align: right;
  }

  .lead {
    font-weight: 800;
  }

  .wait {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.6rem;
    text-align: center;
    font-weight: 800;
    font-size: 1.1rem;
  }

  .clue {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.7rem 1rem;
    background: var(--butter);
    transform: rotate(-1deg);
  }

  .clue span {
    font-weight: 800;
    font-size: 0.85rem;
  }

  .clue b {
    font-family: var(--display);
    font-weight: 400;
    font-size: 1.6rem;
    text-align: center;
    overflow-wrap: anywhere;
  }

  .slider {
    width: 100%;
    height: 3rem;
    accent-color: var(--cobalt);
  }

  .result {
    align-self: center;
    padding: 0.2rem 1rem;
    border-radius: 999px;
    border: 2px solid var(--ink);
    background: var(--paper-2);
    font-weight: 900;
    font-size: 1.2rem;
  }

  .result.good {
    background: var(--mint);
  }
</style>
