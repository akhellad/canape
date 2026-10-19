<script lang="ts">
  import { fade, scale } from 'svelte/transition';
  import { backOut } from 'svelte/easing';
  import { CATALOG } from '../lib/games/catalog';
  import type { GameId, GameResult } from '../lib/games/types';
  import type { Seats } from '../lib/room/protocol';
  import Blob from '../lib/ui/Blob.svelte';
  import Confetti from '../lib/ui/Confetti.svelte';

  let {
    game,
    result,
    seats,
    record,
  }: { game: GameId; result: GameResult; seats: Seats; record: { best: number; beaten: boolean } | null } = $props();

  const celebrate = $derived(result.winner !== null || result.coop?.won === true);
  const kicker = $derived(
    result.coop
      ? result.coop.won
        ? 'Bravo l’équipe !'
        : 'Pas cette fois…'
      : result.winner === null
        ? 'Égalité'
        : `Victoire de ${seats[result.winner]?.name ?? ''}`,
  );
</script>

<div class="overlay" transition:fade={{ duration: 300 }}>
  {#if celebrate}<Confetti />{/if}
  <div class="card paper" in:scale={{ duration: 650, easing: backOut, start: 0.4 }}>
    <div class="blobs">
      {#if result.winner !== null}
        <Blob slot={result.winner} size="5.4em" bounce crown />
      {:else}
        <Blob slot={0} size="4.4em" bounce={celebrate} mood={celebrate ? 'happy' : 'sad'} />
        <Blob slot={1} size="4.4em" bounce={celebrate} mood={celebrate ? 'happy' : 'sad'} />
      {/if}
    </div>
    <span class="sticker kicker">{CATALOG[game].title} · {kicker}</span>
    <h1>{result.title}</h1>
    {#if result.scores}
      <div class="scores">
        {#each [0, 1] as const as slot (slot)}
          <div class="score p{slot}" class:best={result.winner === slot}>
            <span>{seats[slot]?.name ?? `Joueur ${slot + 1}`}</span>
            <b>{result.scores[slot]}</b>
          </div>
        {/each}
      </div>
    {:else if result.detail}
      <p class="detail">{result.detail}</p>
    {/if}
    {#if record}
      <p class="record sticker" class:beaten={record.beaten}>
        {record.beaten ? 'Nouveau record !' : `Votre record : ${record.best}`}
      </p>
    {/if}
    <p class="next">Rejouer ou changer de jeu depuis vos téléphones</p>
  </div>
</div>

<style>
  .overlay {
    position: absolute;
    inset: -2em -3em;
    display: grid;
    place-items: center;
    background: rgba(42, 12, 29, 0.72);
    z-index: 20;
  }

  .card {
    max-width: 46em;
    padding: 2em 3.2em 2.2em;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.8em;
    text-align: center;
    border-width: 0.22em;
    box-shadow: 0.4em 0.5em 0 var(--ink);
    transform: rotate(-1.5deg);
  }

  .blobs {
    display: flex;
    gap: 1em;
    align-items: flex-end;
    margin-top: -5em;
  }

  .kicker {
    background: var(--pink);
    transform: rotate(-3deg);
  }

  h1 {
    font-size: 3.4em;
    --tilt: -1deg;
    animation: stamp 0.7s 0.25s var(--snap) both;
  }

  .detail {
    font-size: 1.35em;
    font-weight: 700;
  }

  .scores {
    display: flex;
    gap: 1.2em;
  }

  .score {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 9em;
    padding: 0.5em 1.2em;
    border-radius: 1em;
    border: 0.14em solid var(--ink);
    background: var(--pc);
    color: var(--pc-ink);
    font-weight: 800;
    transform: scale(0.92);
  }

  .score.best {
    opacity: 1;
    box-shadow: var(--shadow-sm);
    transform: scale(1.08) rotate(2deg);
  }

  .score b {
    font-family: var(--display);
    font-weight: 400;
    font-size: 2.6em;
    line-height: 1.1;
  }

  .record {
    font-size: 1.1em;
    background: var(--paper-2);
  }

  .record.beaten {
    background: var(--butter);
    animation: wiggle 0.6s ease-in-out 3;
  }

  .next {
    margin-top: 0.4em;
    color: var(--ink-2);
    font-weight: 600;
  }
</style>
