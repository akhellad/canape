<script lang="ts">
  import { isRoomCode } from './lib/random';
  import Pastille from './lib/ui/Pastille.svelte';
  import Wordmark from './lib/ui/Wordmark.svelte';

  let { invalid = false, ontv }: { invalid?: boolean; ontv: () => void } = $props();
  let value = $state('');
  const code = $derived(value.trim().toUpperCase());

  function submit(event: SubmitEvent) {
    event.preventDefault();
    if (!isRoomCode(code)) return;
    const url = new URL(location.href);
    url.searchParams.set('room', code);
    location.assign(url.toString());
  }
</script>

<div class="home">
  <Pastille size="min(56vw, 13rem)" animated />
  <Wordmark size="1.8rem" lines={2} />
  <form onsubmit={submit}>
    <label for="code">{invalid ? 'Ce lien n’est pas valide. Tape le code affiché sur la télé :' : 'Code affiché sur la télé'}</label>
    <input
      id="code"
      bind:value
      maxlength="4"
      autocomplete="off"
      autocapitalize="characters"
      spellcheck="false"
      placeholder="ABCD"
      enterkeyhint="go"
    />
    <button class="btn primary block" type="submit" disabled={!isRoomCode(code)}>Rejoindre</button>
  </form>
  <button class="btn ghost" onclick={ontv}>Cet écran est la télé</button>
</div>

<style>
  .home {
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.3rem;
    padding: 1.5rem 1rem calc(1.5rem + env(safe-area-inset-bottom));
    text-align: center;
  }

  form {
    width: 100%;
    max-width: 20rem;
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
  }

  label {
    font-weight: 800;
    color: var(--muted);
    line-height: 1.35;
  }

  input {
    padding: 0.8rem;
    border-radius: 1rem;
    border: 3px solid var(--ink);
    background: var(--cream);
    color: var(--ink);
    font-family: var(--display);
    font-size: 2.2rem;
    letter-spacing: 0.4em;
    text-align: center;
    text-transform: uppercase;
    outline: none;
  }

  input:focus {
    box-shadow: 0 0 0 3px var(--yellow);
  }
</style>
