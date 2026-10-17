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
      <span class="network" class:error={network === 'error'}>{network === 'error' ? 'Reconnexion…' : 'Connexion…'}</span>
    {/if}
    <PlayerChip slot={0} seat={seats[0]} />
    <PlayerChip slot={1} seat={seats[1]} />
    <span class="code">Salle <b>{code}</b></span>
  </div>
</header>

<style>
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1em;
    min-height: 3.2em;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 0.6em;
  }

  .right {
    display: flex;
    align-items: center;
    gap: 0.7em;
  }

  .hint {
    font-size: 0.75em;
    color: var(--muted);
    max-width: 14em;
    text-align: right;
    line-height: 1.2;
  }

  .network {
    padding: 0.2em 0.7em;
    border-radius: 999px;
    background: var(--plum-3);
    font-size: 0.85em;
  }

  .network.error {
    background: var(--bad);
  }

  .code {
    color: var(--muted);
    font-weight: 800;
  }

  .code b {
    color: var(--text);
    letter-spacing: 0.15em;
  }
</style>
