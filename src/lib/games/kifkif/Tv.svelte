<script lang="ts">
  import { cubicOut, backOut } from 'svelte/easing';
  import type { Seats } from '../../room/protocol';
  import Blob from '../../ui/Blob.svelte';
  import { replay } from '../../ui/replay';
  import { SLOTS, type Slot } from '../types';
  import Card from './Card.svelte';
  import type { KifKifTv } from './logic';
  import { SYMBOLS } from './symbols';

  let { view, seats }: { view: KifKifTv; seats: Seats } = $props();
  const name = (slot: Slot) => seats[slot]?.name ?? `Joueur ${slot + 1}`;

  function arrive(_node: Element, { from }: { from: number }) {
    return {
      duration: 520,
      easing: backOut,
      css: (t: number, u: number) => `transform: translateX(${u * from * 70}vw) rotate(${u * from * 70}deg) scale(${0.55 + t * 0.45})`,
    };
  }

  function leave(_node: Element) {
    return { duration: 380, easing: cubicOut, css: (t: number) => `opacity:${t};transform:scale(${0.85 + t * 0.15})` };
  }

  function deal(_node: Element) {
    return {
      duration: 360,
      delay: 120,
      easing: backOut,
      css: (t: number) => `opacity:${t};transform:translateY(${(1 - t) * 30}%) scale(${0.7 + t * 0.3})`,
    };
  }

  const matchSide = $derived(view.lastMatch ? (view.lastMatch.slot === 0 ? -1 : 1) : 0);
  const highlight = $derived(view.lastMatch && view.lastMatch.card === view.center.id ? view.lastMatch.symbol : null);
</script>

<section class="kif" data-center={view.center.id}>
  <h2 class="title">
    {#if view.phase === 'over' && view.winner !== null}
      {name(view.winner)} a vidé sa pile !
    {:else if view.lastMatch}
      {#key view.lastMatch.seq}
        <span class="flash">{name(view.lastMatch.slot)} a trouvé {SYMBOLS[view.lastMatch.symbol].name} !</span>
      {/key}
    {:else}
      Trouvez le symbole en commun !
    {/if}
  </h2>

  <div class="table">
    {#each SLOTS as slot (slot)}
      {@const top = view.tops[slot]}
      <div class="player p{slot}" style:order={slot === 0 ? 0 : 2} class:winner={view.winner === slot}>
        <div class="who">
          <Blob {slot} size="2.4em" bounce={view.winner === slot} crown={view.winner === slot} mood={view.locked[slot] ? 'wow' : 'happy'} />
          <span class="name">{name(slot)}</span>
        </div>
        <div class="hand" class:locked={view.locked[slot]} use:replay={{ key: view.misses[slot], className: 'miss' }}>
          {#if top}
            {#key top.id}
              <div class="mini" in:deal>
                <Card card={top} />
              </div>
            {/key}
          {:else}
            <div class="empty">Plus de cartes !</div>
          {/if}
          {#if view.locked[slot]}<span class="blocked">Bloqué !</span>{/if}
        </div>
        <div class="pile">
          {#each { length: Math.min(view.remaining[slot], 10) } as _, index (index)}
            <span class="back" style:transform={`translateX(${index * 0.32}em) rotate(${(index % 3) - 1}deg)`}></span>
          {/each}
          <span class="count">{view.remaining[slot]} carte{view.remaining[slot] > 1 ? 's' : ''}</span>
        </div>
      </div>
    {/each}

    <div class="center" style:order={1}>
      {#key view.center.id}
        <div class="big" in:arrive={{ from: matchSide }} out:leave>
          <Card card={view.center} {highlight} />
        </div>
      {/key}
    </div>
  </div>
</section>

<style>
  .kif {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1em;
  }

  .title {
    font-size: 2.3em;
    min-height: 1.3em;
    text-align: center;
  }

  .flash {
    display: inline-block;
    animation: pop-in 0.35s ease-out;
  }

  .table {
    flex: 1;
    min-height: 0;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 3em;
  }

  .center {
    display: grid;
    width: min(66vh, 44vw);
  }

  .big {
    grid-area: 1 / 1;
  }

  .player {
    width: min(30vh, 19vw);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.8em;
    transition: transform 0.3s ease;
  }

  .player.winner {
    transform: scale(1.06);
  }

  .who {
    display: flex;
    align-items: center;
    gap: 0.5em;
  }

  .name {
    font-family: var(--display);
    font-size: 1.7em;
  }

  .hand {
    position: relative;
    width: 100%;
    display: grid;
  }

  .mini {
    grid-area: 1 / 1;
    font-size: 0.6em;
  }

  .hand.locked .mini {
    filter: grayscale(0.85) brightness(0.8);
  }

  .hand:global(.miss) {
    animation: shake 0.45s ease-in-out;
  }

  .blocked {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-8deg);
    padding: 0.2em 0.8em;
    border-radius: 0.5em;
    background: var(--red);
    color: var(--cream);
    border: 0.14em solid var(--ink);
    font-family: var(--display);
    font-size: 1.5em;
    white-space: nowrap;
  }

  .empty {
    aspect-ratio: 1;
    display: grid;
    place-items: center;
    border-radius: 50%;
    border: 0.2em dashed var(--muted);
    font-family: var(--display);
    font-size: 1.3em;
    text-align: center;
  }

  .pile {
    position: relative;
    height: 2.4em;
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.6em;
  }

  .back {
    position: absolute;
    left: 0;
    width: 2em;
    height: 2em;
    border-radius: 50%;
    background: repeating-linear-gradient(45deg, var(--pc) 0 0.3em, var(--pc-dark) 0.3em 0.6em);
    border: 0.12em solid var(--ink);
  }

  .count {
    margin-left: 5.6em;
    font-weight: 800;
    font-size: 1.2em;
  }
</style>
