<script lang="ts">
  import Menu from '@lucide/svelte/icons/menu';
  import type { Slot } from '../lib/games/types';
  import Blob from '../lib/ui/Blob.svelte';
  import Pastille from '../lib/ui/Pastille.svelte';

  let { slot, name, onmenu }: { slot: Slot; name: string; onmenu?: () => void } = $props();
</script>

<div class="bar">
  <Pastille size="2.3rem" text={false} />
  <span class="me p{slot}"><Blob {slot} size="1.1rem" />{name}</span>
  {#if onmenu}
    <button class="menu" onclick={onmenu} aria-label="Menu de la partie"><Menu size={22} /></button>
  {:else}
    <span class="spacer"></span>
  {/if}
</div>

<style>
  .bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.6rem;
  }

  .me {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.3rem 0.9rem 0.3rem 0.5rem;
    border-radius: 999px;
    background: var(--pc);
    color: var(--pc-ink);
    border: 2px solid var(--ink);
    box-shadow: 2px 3px 0 var(--ink);
    font-weight: 900;
    max-width: 60vw;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .menu {
    width: 2.75rem;
    height: 2.75rem;
    display: grid;
    place-items: center;
    border-radius: 0.8rem;
    background: var(--cream);
    color: var(--ink);
    border: 2px solid var(--ink);
    box-shadow: 2px 3px 0 var(--ink);
  }

  .spacer {
    width: 2.75rem;
  }
</style>
