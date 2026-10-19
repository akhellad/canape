<script lang="ts">
  import type { GameResult, Slot } from '../lib/games/types';
  import Blob from '../lib/ui/Blob.svelte';

  let { result, slot, onagain, onmenu }: { result: GameResult; slot: Slot; onagain: () => void; onmenu: () => void } = $props();

  const outcome = $derived.by(() => {
    if (result.coop)
      return result.coop.won
        ? { heading: 'Bravo l’équipe !', mood: 'happy' as const, tone: 'good' }
        : { heading: 'Pas cette fois…', mood: 'sad' as const, tone: 'bad' };
    if (result.winner === null) return { heading: 'Égalité !', mood: 'wink' as const, tone: '' };
    return result.winner === slot
      ? { heading: 'Victoire !', mood: 'happy' as const, tone: 'good' }
      : { heading: 'Défaite…', mood: 'sad' as const, tone: 'bad' };
  });
</script>

<div class="result">
  <Blob {slot} size="4.4rem" mood={outcome.mood} bounce={outcome.tone === 'good'} crown={result.winner === slot} />
  <h1 class={outcome.tone}>{outcome.heading}</h1>
  <p class="title">{result.title}</p>
  {#if result.detail}<p class="detail">{result.detail}</p>{/if}
  <div class="actions">
    <button class="btn primary block" onclick={onagain}>Rejouer</button>
    <button class="btn ghost block" onclick={onmenu}>Changer de jeu</button>
  </div>
</div>

<style>
  .result {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.8rem;
    text-align: center;
    padding-top: 1.5rem;
  }

  h1 {
    font-size: 2.6rem;
  }

  h1 {
    color: var(--cream);
    -webkit-text-stroke: 0.035em var(--ink);
    paint-order: stroke fill;
    text-shadow:
      0.03em 0.03em 0 var(--ink),
      0.06em 0.06em 0 var(--ink);
    --tilt: -3deg;
    animation: stamp 0.6s 0.15s var(--snap) both;
  }

  .good {
    color: var(--butter);
  }

  .bad {
    color: var(--blush);
  }

  .title {
    font-weight: 800;
    font-size: 1.2rem;
  }

  .detail {
    color: var(--ink-2);
    font-weight: 600;
  }

  .actions {
    margin-top: auto;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
  }
</style>
