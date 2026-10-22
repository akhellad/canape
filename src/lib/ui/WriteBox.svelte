<script lang="ts">
  import { fly } from 'svelte/transition';
  import Blob from './Blob.svelte';
  import type { Slot } from '../games/types';

  /** A secret written answer: the field, then a waiting note once it is sent. `resetKey` clears it. */
  let {
    slot,
    sent,
    waiting,
    placeholder,
    button = 'Envoyer',
    maxlength = 80,
    multiline = false,
    resetKey,
    onsend,
  }: {
    slot: Slot;
    sent: boolean;
    waiting: string;
    placeholder: string;
    button?: string;
    maxlength?: number;
    multiline?: boolean;
    resetKey: unknown;
    onsend: (text: string) => void;
  } = $props();

  let text = $state('');
  let key: unknown = undefined;

  $effect.pre(() => {
    if (resetKey !== key) {
      key = resetKey;
      text = '';
    }
  });

  function submit(event: SubmitEvent) {
    event.preventDefault();
    if (text.trim()) onsend(text.trim());
  }
</script>

{#if sent}
  <div class="wait" in:fly={{ y: 20, duration: 300 }}>
    <Blob {slot} size="4rem" mood="happy" bounce />
    <p>{waiting}</p>
  </div>
{:else}
  <form class="write" onsubmit={submit}>
    {#if multiline}
      <textarea class="field" bind:value={text} {maxlength} rows="3" {placeholder}></textarea>
    {:else}
      <input class="field" bind:value={text} {maxlength} {placeholder} autocomplete="off" enterkeyhint="send" />
    {/if}
    <button class="btn go block" type="submit" disabled={!text.trim()}>{button}</button>
  </form>
{/if}

<style>
  .write {
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
  }

  textarea {
    resize: none;
    font-size: 1.1rem;
    line-height: 1.4;
  }

  .wait {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.8rem;
    padding: 1.5rem 0;
    font-weight: 800;
    font-size: 1.15rem;
    text-align: center;
  }
</style>
