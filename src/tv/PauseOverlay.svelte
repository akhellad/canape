<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';

  let { waitingFor, resumeAt }: { waitingFor: string[]; resumeAt: number | null } = $props();
  let now = $state(Date.now());

  onMount(() => {
    const timer = setInterval(() => (now = Date.now()), 200);
    return () => clearInterval(timer);
  });

  const seconds = $derived(resumeAt ? Math.max(1, Math.ceil((resumeAt - now) / 1000)) : 0);
</script>

<div class="overlay" transition:fade={{ duration: 250 }}>
  <div class="box paper">
    {#if waitingFor.length}
      <div class="spinner" aria-hidden="true"></div>
      <h2>En attente de {waitingFor.join(' et ')}…</h2>
      <p>Le téléphone s’est déconnecté. La partie reprendra dès son retour.</p>
    {:else}
      <h2>C’est reparti dans</h2>
      {#key seconds}<div class="seconds">{seconds}</div>{/key}
    {/if}
  </div>
</div>

<style>
  .overlay {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    background: rgba(20, 14, 26, 0.65);
    z-index: 15;
  }

  .box {
    padding: 1.8em 2.6em;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.8em;
    text-align: center;
    max-width: 36em;
  }

  h2 {
    font-size: 2.2em;
  }

  .spinner {
    width: 3em;
    height: 3em;
    border-radius: 50%;
    border: 0.35em solid var(--paper-2);
    border-top-color: var(--orange);
    animation: spin 0.9s linear infinite;
  }

  .seconds {
    font-family: var(--display);
    font-size: 5em;
    animation: pop-in 0.4s ease-out;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
