<script lang="ts">
  import type { SeatInfo } from '../lib/room/protocol';
  import type { Slot } from '../lib/games/types';
  import Blob from '../lib/ui/Blob.svelte';
  import Icon from '../lib/ui/Icon.svelte';

  let { slot, seat }: { slot: Slot; seat: SeatInfo | null } = $props();
</script>

<div class="chip p{slot}" class:empty={!seat} class:offline={seat && !seat.connected}>
  <Blob {slot} size="1.4em" mood={seat?.connected === false ? 'sad' : 'happy'} />
  <span class="name">{seat?.name ?? `Joueur ${slot + 1}`}</span>
  {#if seat}
    <span class="trophies" title="Victoires"><Icon name="trophy" size="1em" />{seat.trophies}</span>
    {#if !seat.connected}<span class="away">absent</span>{/if}
  {/if}
</div>

<style>
  .chip {
    display: flex;
    align-items: center;
    gap: 0.5em;
    padding: 0.25em 0.8em 0.25em 0.5em;
    border-radius: 999px;
    background: var(--plum-2);
    border: 0.12em solid var(--pc);
    font-weight: 800;
    transition: opacity 0.3s ease;
  }

  .name {
    max-width: 9em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .empty {
    border-style: dashed;
    color: var(--muted);
    opacity: 0.8;
  }

  .offline {
    opacity: 0.75;
  }

  .trophies {
    display: inline-flex;
    align-items: center;
    gap: 0.2em;
    padding: 0.05em 0.5em;
    border-radius: 999px;
    background: var(--pc);
    color: var(--ink);
    font-size: 0.85em;
  }

  .away {
    font-size: 0.75em;
    color: var(--cream);
    background: var(--bad);
    border-radius: 999px;
    padding: 0.05em 0.5em;
  }
</style>
