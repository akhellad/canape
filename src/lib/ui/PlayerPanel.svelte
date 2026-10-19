<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { Slot } from '../games/types';
  import Blob from './Blob.svelte';

  let {
    slot,
    name,
    active = false,
    mood = 'happy',
    crown = false,
    children,
  }: {
    slot: Slot;
    name: string;
    active?: boolean;
    mood?: 'happy' | 'wow' | 'sad' | 'wink';
    crown?: boolean;
    children?: Snippet;
  } = $props();
</script>

<div class="panel p{slot}" class:active>
  <Blob {slot} size="4.2em" bounce={active || crown} {mood} {crown} />
  <span class="name">{name}</span>
  {#if children}<div class="extra">{@render children()}</div>{/if}
  {#if active}<span class="turn sticker">À toi !</span>{/if}
</div>

<style>
  .panel {
    position: relative;
    width: 13em;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.6em;
    padding: 1.2em 1em;
    border-radius: 1.4em;
    border: 0.16em dashed rgba(42, 12, 29, 0.35);
    /* Background and text color switch together, so the name never sits on a half-faded fill. */
    transition: transform 0.4s var(--spring);
  }

  .panel.active {
    border: 0.16em solid var(--ink);
    background: var(--pc);
    color: var(--pc-ink);
    box-shadow: var(--shadow);
    transform: scale(1.05) rotate(-1.5deg);
  }

  .name {
    font-family: var(--display);
    font-size: 1.9em;
    text-align: center;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .extra {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4em;
    text-align: center;
  }

  .turn {
    position: absolute;
    top: -1em;
    font-size: 1.1em;
    background: var(--cream);
    animation: wiggle 1s ease-in-out infinite;
    --tilt: 4deg;
  }
</style>
