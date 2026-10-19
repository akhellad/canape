<script lang="ts">
  import { onDestroy } from 'svelte';
  import { backOut } from 'svelte/easing';
  import { fly } from 'svelte/transition';

  let { toast }: { toast: { seq: number; text: string } | null } = $props();
  let visible = $state<{ seq: number; text: string } | null>(null);
  let shown = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;

  $effect(() => {
    if (!toast || toast.seq === shown) return;
    shown = toast.seq;
    visible = toast;
    clearTimeout(timer);
    timer = setTimeout(() => (visible = null), 3200);
  });

  onDestroy(() => clearTimeout(timer));
</script>

{#if visible}
  {#key visible.seq}
    <div class="toast paper" in:fly={{ y: 60, duration: 450, easing: backOut }} out:fly={{ y: 40, duration: 250 }}>{visible.text}</div>
  {/key}
{/if}

<style>
  .toast {
    position: absolute;
    left: 50%;
    bottom: 1.6em;
    transform: translateX(-50%) rotate(-1.5deg);
    padding: 0.6em 1.4em;
    font-weight: 800;
    font-size: 1.15em;
    z-index: 30;
    background: var(--butter);
  }
</style>
