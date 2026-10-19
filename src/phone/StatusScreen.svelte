<script lang="ts">
  import type { ClientStatus } from '../lib/room/player-client';
  import Blob from '../lib/ui/Blob.svelte';

  let { status, onretry }: { status: ClientStatus; onretry: () => void } = $props();

  const content = $derived.by(() => {
    switch (status) {
      case 'unreachable':
        return {
          title: 'Télé introuvable',
          text: 'Vérifie que la page est bien ouverte sur la télé, et que le téléphone a Internet. On réessaie tout seuls.',
          retry: true,
          spinner: false,
        };
      case 'full':
        return { title: 'Partie complète', text: 'Deux joueurs sont déjà connectés à cette télé.', retry: true, spinner: false };
      case 'outdated':
        return {
          title: 'Nouvelle version',
          text: 'La télé utilise une autre version du jeu. Recharge les deux pages.',
          retry: false,
          spinner: false,
        };
      default:
        return { title: 'Connexion à la télé…', text: 'Ça prend quelques secondes.', retry: false, spinner: true };
    }
  });
</script>

<div class="status">
  <Blob slot={0} size="4rem" mood={content.spinner ? 'happy' : 'wow'} bounce={content.spinner} />
  <h1 class="pop">{content.title}</h1>
  <p>{content.text}</p>
  {#if content.spinner}
    <div class="spinner" aria-hidden="true"></div>
  {/if}
  {#if content.retry}
    <button class="btn primary" onclick={onretry}>Réessayer</button>
  {/if}
  {#if status === 'outdated'}
    <button class="btn primary" onclick={() => location.reload()}>Recharger</button>
  {/if}
</div>

<style>
  .status {
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 1.5rem;
    text-align: center;
  }

  h1 {
    font-size: 2rem;
  }

  p {
    max-width: 22rem;
    color: var(--ink-2);
    font-weight: 600;
    line-height: 1.4;
  }

  .spinner {
    width: 2.6rem;
    height: 2.6rem;
    border-radius: 50%;
    border: 0.3rem solid var(--blush);
    border-top-color: var(--ink);
    animation: spin 0.9s linear infinite;
  }
</style>
