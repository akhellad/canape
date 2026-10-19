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
    padding: 0.2em 0.85em 0.2em 0.45em;
    border-radius: 999px;
    background: var(--pc);
    color: var(--pc-ink);
    border: 0.13em solid var(--ink);
    box-shadow: 0.12em 0.16em 0 var(--ink);
    font-weight: 800;
    transition:
      opacity 0.3s ease,
      transform 0.3s var(--spring);
  }

  .name {
    max-width: 9em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .empty {
    background: transparent;
    color: var(--muted);
    border-style: dashed;
    box-shadow: none;
  }

  .offline {
    opacity: 0.7;
    transform: rotate(-3deg);
  }

  .trophies {
    display: inline-flex;
    align-items: center;
    gap: 0.2em;
    padding: 0.05em 0.5em;
    border-radius: 999px;
    background: var(--cream);
    color: var(--ink);
    border: 0.08em solid var(--ink);
    font-size: 0.85em;
  }

  .away {
    font-size: 0.75em;
    color: var(--cream);
    background: var(--cherry);
    border-radius: 999px;
    padding: 0.05em 0.5em;
  }
</style>
