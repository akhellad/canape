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
  <div class="card paper" in:scale={{ duration: 600, easing: backOut, start: 0.5 }}>
    <div class="blobs">
      {#if result.winner !== null}
        <Blob slot={result.winner} size="5em" bounce crown />
      {:else}
        <Blob slot={0} size="4.2em" bounce={celebrate} mood={celebrate ? 'happy' : 'sad'} />
        <Blob slot={1} size="4.2em" bounce={celebrate} mood={celebrate ? 'happy' : 'sad'} />
      {/if}
    </div>
    <span class="kicker">{CATALOG[game].title} · {kicker}</span>
    <h1>{result.title}</h1>
    {#if result.detail}<p class="detail">{result.detail}</p>{/if}
    {#if record}
      <p class="record" class:beaten={record.beaten}>
        {record.beaten ? 'Nouveau record !' : `Votre record : ${record.best} points`}
      </p>
    {/if}
    <p class="next">Rejouer ou changer de jeu depuis vos téléphones</p>
  </div>
</div>

<style>
  .overlay {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    background: rgba(20, 14, 26, 0.8);
    z-index: 20;
  }

  .card {
    max-width: 44em;
    padding: 2em 3em 2.2em;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.7em;
    text-align: center;
    border-width: 0.22em;
    box-shadow: 0 0.45em 0 var(--ink);
  }

  .blobs {
    display: flex;
    gap: 1em;
    align-items: flex-end;
    margin-top: -4.5em;
  }

  .kicker {
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #5b4d44;
  }

  h1 {
    font-size: 3em;
  }

  .detail {
    font-size: 1.3em;
  }

  .record {
    padding: 0.3em 1em;
    border-radius: 999px;
    background: var(--paper-2);
    font-weight: 800;
  }

  .record.beaten {
    background: var(--yellow);
    animation: wiggle 0.6s ease-in-out 3;
  }

  .next {
    margin-top: 0.6em;
    color: #5b4d44;
    font-size: 0.95em;
  }
</style>
