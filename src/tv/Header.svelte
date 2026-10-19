<script lang="ts">
  import type { Seats } from '../lib/room/protocol';
  import Pastille from '../lib/ui/Pastille.svelte';
  import Wordmark from '../lib/ui/Wordmark.svelte';
  import PlayerChip from './PlayerChip.svelte';

  let { seats, code, network, soundOn }: { seats: Seats; code: string; network: 'connecting' | 'ready' | 'error'; soundOn: boolean } =
    $props();
</script>

<header class="header">
  <div class="brand">
    <Pastille size="2.6em" text={false} />
    <Wordmark size="1.45em" />
  </div>
  <div class="right">
    {#if !soundOn}
      <span class="hint">Son coupé : appuie sur OK de la télécommande</span>
    {/if}
    {#if network !== 'ready'}
      <span class="network sticker" class:error={network === 'error'}>{network === 'error' ? 'Reconnexion…' : 'Connexion…'}</span>
    {/if}
    <PlayerChip slot={0} seat={seats[0]} />
    <PlayerChip slot={1} seat={seats[1]} />
    <span class="code">Salle <b>{code}</b></span>
  </div>
</header>

<style>
  .header {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1em;
    min-height: 3.2em;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 0.7em;
  }

  .right {
    display: flex;
    align-items: center;
    gap: 0.8em;
  }

  .hint {
    font-size: 0.8em;
    font-weight: 700;
    color: var(--muted);
    max-width: 15em;
    text-align: right;
    line-height: 1.2;
  }

  .network {
    background: var(--cream);
  }

  .network.error {
    background: var(--cherry);
    color: var(--cream);
  }

  .code {
    display: inline-flex;
    align-items: baseline;
    gap: 0.4em;
    padding: 0.25em 0.8em 0.3em;
    border-radius: 0.6em;
    background: var(--ink);
    color: var(--blush);
    font-weight: 800;
    font-size: 1.05em;
    transform: rotate(2deg);
    box-shadow: 0.12em 0.16em 0 rgba(42, 12, 29, 0.35);
  }

  .code b {
    font-family: var(--display);
    font-weight: 400;
    font-size: 1.25em;
    color: var(--butter);
    letter-spacing: 0.12em;
  }
</style>
