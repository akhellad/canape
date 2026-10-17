<script lang="ts">
  import { scale } from 'svelte/transition';
  import { backOut } from 'svelte/easing';
  import type { Seats } from '../lib/room/protocol';
  import { SLOTS } from '../lib/games/types';
  import Blob from '../lib/ui/Blob.svelte';
  import Pastille from '../lib/ui/Pastille.svelte';
  import Qr from '../lib/ui/Qr.svelte';

  let { seats, code, url, host, ready }: { seats: Seats; code: string; url: string; host: string; ready: boolean } = $props();
</script>

<section class="lobby">
  <div class="hero">
    <Pastille size="min(40vh, 30vw)" animated />
  </div>

  <div class="panel">
    <h1>Scannez pour jouer !</h1>
    <div class="join">
      <div class="qr paper">
        {#if ready}
          <Qr value={url} label="QR code pour rejoindre la partie" />
        {:else}
          <div class="waiting">Connexion…</div>
        {/if}
      </div>
      <ol class="steps">
        <li>Ouvrez l’appareil photo de votre téléphone.</li>
        <li>Visez le QR code et ouvrez le lien.</li>
        <li>Entrez votre prénom, c’est parti !</li>
        <li class="manual">Sans QR code : allez sur <b>{host}</b> et tapez le code <b class="code">{code}</b>.</li>
      </ol>
    </div>

    <div class="seats">
      {#each SLOTS as slot (slot)}
        {@const seat = seats[slot]}
        <div class="seat p{slot}" class:taken={seat}>
          {#if seat}
            <div in:scale={{ duration: 500, easing: backOut, start: 0.3 }}>
              <Blob {slot} size="3.2em" bounce mood={seat.connected ? 'happy' : 'sad'} />
            </div>
            <span class="name">{seat.name}</span>
          {:else}
            <div class="ghost"><Blob {slot} size="3.2em" mood="wow" /></div>
            <span class="name muted">Joueur {slot + 1}…</span>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</section>

<style>
  .lobby {
    width: 100%;
    max-width: 78em;
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    gap: 4em;
    animation: rise 0.5s ease-out;
  }

  .hero {
    display: grid;
    place-items: center;
    animation: bob 4s ease-in-out infinite;
  }

  .panel {
    display: flex;
    flex-direction: column;
    gap: 1.4em;
  }

  h1 {
    font-size: 3.2em;
  }

  .join {
    display: flex;
    align-items: center;
    gap: 2em;
  }

  .qr {
    width: min(30vh, 22vw);
    padding: 0.9em;
    flex-shrink: 0;
  }

  .waiting {
    aspect-ratio: 1;
    display: grid;
    place-items: center;
    font-weight: 800;
  }

  .steps {
    margin: 0;
    padding-left: 1.3em;
    display: flex;
    flex-direction: column;
    gap: 0.55em;
    font-size: 1.15em;
  }

  .manual {
    list-style: none;
    margin-left: -1.3em;
    margin-top: 0.4em;
    color: var(--muted);
    font-size: 0.9em;
  }

  .manual b {
    color: var(--text);
  }

  .code {
    letter-spacing: 0.15em;
    color: var(--yellow) !important;
  }

  .seats {
    display: flex;
    gap: 2em;
  }

  .seat {
    display: flex;
    align-items: flex-end;
    gap: 0.8em;
    padding: 0.8em 1.4em 0.8em 1em;
    border-radius: 1.2em;
    border: 0.15em dashed var(--plum-3);
    min-width: 14em;
  }

  .seat.taken {
    border: 0.15em solid var(--pc);
    background: var(--pc-soft);
  }

  .ghost {
    opacity: 0.35;
    filter: grayscale(0.6);
  }

  .name {
    font-family: var(--display);
    font-size: 1.6em;
    padding-bottom: 0.3em;
  }

  .muted {
    color: var(--muted);
  }
</style>
