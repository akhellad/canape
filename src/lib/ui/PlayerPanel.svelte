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
  {#if active}<span class="turn">À toi !</span>{/if}
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
    border: 0.16em solid transparent;
    transition:
      border-color 0.3s ease,
      background 0.3s ease,
      transform 0.3s ease;
  }

  .panel.active {
    border-color: var(--pc);
    background: var(--pc-soft);
    transform: scale(1.04);
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
    top: -0.9em;
    padding: 0.2em 0.9em;
    border-radius: 999px;
    background: var(--pc);
    color: var(--ink);
    border: 0.12em solid var(--ink);
    font-family: var(--display);
    font-size: 1.15em;
    animation: bob 1s ease-in-out infinite;
  }
</style>
