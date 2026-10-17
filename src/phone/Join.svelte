<script lang="ts">
  import Pastille from '../lib/ui/Pastille.svelte';
  import Wordmark from '../lib/ui/Wordmark.svelte';

  let { name, code, onjoin }: { name: string; code: string; onjoin: (name: string) => void } = $props();
  let value = $state('');

  $effect.pre(() => {
    if (!value && name) value = name;
  });

  function submit(event: SubmitEvent) {
    event.preventDefault();
    if (value.trim()) onjoin(value);
  }
</script>

<div class="join">
  <div class="logo"><Pastille size="min(62vw, 15rem)" animated /></div>
  <Wordmark size="1.9rem" lines={2} />
  <form onsubmit={submit}>
    <label for="name">Ton prénom</label>
    <input id="name" bind:value maxlength="14" autocomplete="given-name" autocapitalize="words" enterkeyhint="go" required />
    <button class="btn primary block" type="submit" disabled={!value.trim()}>Rejoindre la salle {code}</button>
  </form>
</div>

<style>
  .join {
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.4rem;
    padding: 1.5rem 1rem calc(1.5rem + env(safe-area-inset-bottom));
    text-align: center;
  }

  .logo {
    animation: bob 4s ease-in-out infinite;
  }

  form {
    width: 100%;
    max-width: 22rem;
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
    text-align: left;
  }

  label {
    font-weight: 800;
    color: var(--muted);
  }

  input {
    padding: 0.9rem 1rem;
    border-radius: 1rem;
    border: 3px solid var(--ink);
    background: var(--cream);
    color: var(--ink);
    font-size: 1.3rem;
    font-weight: 800;
    outline: none;
  }

  input:focus {
    box-shadow: 0 0 0 3px var(--yellow);
  }
</style>
