<script lang="ts">
  import type { Seats } from '../lib/room/protocol';
  import { SLOTS } from '../lib/games/types';
  import Blob from '../lib/ui/Blob.svelte';
  import Marquee from '../lib/ui/Marquee.svelte';
  import { slap } from '../lib/ui/motion';
  import Pastille from '../lib/ui/Pastille.svelte';
  import Qr from '../lib/ui/Qr.svelte';
  import Wordmark from '../lib/ui/Wordmark.svelte';

  let { seats, code, url, host, ready }: { seats: Seats; code: string; url: string; host: string; ready: boolean } = $props();
</script>

<section class="lobby">
  <div class="hero">
    <div class="logo"><Pastille size="min(42vh, 28vw)" animated /></div>
    <Wordmark size="3.4em" lines={2} animated />
  </div>

  <div class="panel">
    <h1 class="pop">Scannez,<br />on joue !</h1>
    <div class="join">
      <div class="qr paper">
        {#if ready}
          <Qr value={url} label="QR code pour rejoindre la partie" />
        {:else}
          <div class="waiting"><span class="dot"></span>Connexion…</div>
        {/if}
        <span class="tape" aria-hidden="true"></span>
      </div>
      <ol class="steps">
        <li><span>1</span>Ouvrez l’appareil photo du téléphone</li>
        <li><span>2</span>Visez le QR code, ouvrez le lien</li>
        <li><span>3</span>Tapez votre prénom, c’est parti</li>
        <li class="manual">Sans QR code : <b>{host}</b>, code <b class="code">{code}</b></li>
      </ol>
    </div>

    <div class="seats">
      {#each SLOTS as slot (slot)}
        {@const seat = seats[slot]}
        <div class="seat p{slot}" class:taken={seat} style:--tilt={slot === 0 ? '-2deg' : '1.5deg'}>
          {#if seat}
            <div in:slap={{ rotate: slot === 0 ? -14 : 14 }}>
              <Blob {slot} size="3.4em" bounce mood={seat.connected ? 'happy' : 'sad'} />
            </div>
            <span class="name">{seat.name}</span>
            <span class="sticker ok">Là !</span>
          {:else}
            <div class="ghost"><Blob {slot} size="3.4em" mood="wow" /></div>
            <span class="name muted">Joueur {slot + 1}…</span>
          {/if}
        </div>
      {/each}
    </div>
  </div>

  <div class="band">
    <Marquee
      items={[
        'Ce soir on joue',
        'Les meme dans le canapé',
        'Deux téléphones, une télé',
        'Pas de compte, pas d’appli',
        'Que le meilleur gagne',
      ]}
    />
  </div>
</section>

<style>
  .lobby {
    position: relative;
    width: 100%;
    height: 100%;
    max-width: 82em;
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-rows: 1fr auto;
    align-items: center;
    column-gap: 4.5em;
  }

  .hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1em;
  }

  .logo {
    animation: float 5s ease-in-out infinite;
    filter: drop-shadow(0.3em 0.4em 0 var(--ink));
  }

  .panel {
    display: flex;
    flex-direction: column;
    gap: 1.6em;
  }

  h1 {
    font-size: 5em;
    transform: rotate(-2deg);
    transform-origin: left;
  }

  .join {
    display: flex;
    align-items: center;
    gap: 2.4em;
  }

  .qr {
    position: relative;
    width: min(30vh, 21vw);
    padding: 0.9em;
    flex-shrink: 0;
    transform: rotate(-3deg);
    animation: drop-in 0.8s var(--snap) backwards;
    --tilt: -3deg;
  }

  .tape {
    position: absolute;
    top: -0.9em;
    left: 50%;
    width: 6em;
    height: 1.7em;
    margin-left: -3em;
    background: rgba(255, 210, 61, 0.85);
    border: 0.08em solid rgba(42, 12, 29, 0.3);
    transform: rotate(4deg);
  }

  .waiting {
    aspect-ratio: 1;
    display: grid;
    place-items: center;
    align-content: center;
    gap: 0.6em;
    font-weight: 800;
  }

  .dot {
    width: 2em;
    height: 2em;
    border-radius: 50%;
    border: 0.3em solid var(--paper-2);
    border-top-color: var(--pink);
    animation: spin 0.9s linear infinite;
  }

  .steps {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.7em;
    font-size: 1.3em;
    font-weight: 700;
  }

  .steps li {
    display: flex;
    align-items: center;
    gap: 0.6em;
  }

  .steps span {
    width: 1.8em;
    height: 1.8em;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: var(--ink);
    color: var(--butter);
    font-family: var(--display);
    font-size: 0.9em;
  }

  .manual {
    margin-top: 0.4em;
    color: var(--muted);
    font-size: 0.85em;
  }

  .manual b {
    color: var(--ink);
  }

  .code {
    letter-spacing: 0.15em;
  }

  .seats {
    display: flex;
    gap: 1.8em;
  }

  .seat {
    position: relative;
    display: flex;
    align-items: flex-end;
    gap: 0.8em;
    padding: 0.8em 1.6em 0.8em 1em;
    border-radius: 1.2em;
    border: 0.16em dashed var(--ink-2);
    min-width: 15em;
    transform: rotate(var(--tilt));
    transition:
      background 0.3s ease,
      transform 0.4s var(--spring);
  }

  .seat.taken {
    border: 0.16em solid var(--ink);
    background: var(--pc);
    color: var(--pc-ink);
    box-shadow: var(--shadow);
  }

  .ok {
    position: absolute;
    top: -0.9em;
    right: -0.8em;
    background: var(--mint);
    transform: rotate(8deg);
  }

  .ghost {
    opacity: 0.35;
    filter: grayscale(0.7);
    animation: bob 2.4s ease-in-out infinite;
  }

  .name {
    font-family: var(--display);
    font-size: 1.7em;
    padding-bottom: 0.25em;
  }

  .muted {
    color: var(--muted);
  }

  .band {
    grid-column: 1 / -1;
    align-self: end;
    margin-bottom: -0.6em;
  }
</style>
