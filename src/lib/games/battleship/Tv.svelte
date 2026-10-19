<script lang="ts">
  import { fly } from 'svelte/transition';
  import { backOut } from 'svelte/easing';
  import type { Seats } from '../../room/protocol';
  import Blob from '../../ui/Blob.svelte';
  import Icon from '../../ui/Icon.svelte';
  import { other, SLOTS, type Slot } from '../types';
  import { FLEET, type BattleshipTv } from './logic';
  import Sea from './Sea.svelte';

  let { view, seats }: { view: BattleshipTv; seats: Seats } = $props();
  const name = (slot: Slot) => seats[slot]?.name ?? `Joueur ${slot + 1}`;

  const headline = $derived.by(() => {
    if (view.phase === 'place') return 'Placez votre flotte en secret sur vos téléphones';
    if (view.phase === 'over' && view.winner !== null) return `${name(view.winner)} a coulé toute la flotte !`;
    if (view.firing) return `${name(view.turn)} fait feu…`;
    return `${name(view.turn)} vise la flotte de ${name(other(view.turn))}`;
  });

  const shotText = $derived.by(() => {
    const last = view.last;
    if (!last) return null;
    if (last.result === 'miss') return { icon: 'water-wave' as const, text: 'À l’eau !' };
    if (last.result === 'hit') return { icon: 'collision' as const, text: 'Touché !' };
    return { icon: 'ship' as const, text: `Coulé ! Le ${last.ship} de ${name(last.target)}` };
  });
</script>

<section class="battle">
  <div class="top">
    <h2 class="pop">{headline}</h2>
    {#if view.phase !== 'place' && shotText && view.last}
      {#key view.last.seq}
        <div class="shot {view.last.result}" in:fly={{ y: -30, duration: 450, easing: backOut }}>
          <Icon name={shotText.icon} size="1.4em" />{shotText.text}
        </div>
      {/key}
    {/if}
  </div>

  <div class="seas">
    {#each SLOTS as owner (owner)}
      {@const board = view.boards[owner]}
      {@const targeted = view.phase === 'battle' && view.turn !== owner}
      <div class="fleet p{owner}" class:targeted>
        <header>
          <Blob slot={owner} size="1.8em" mood={view.afloat[owner] === 0 ? 'sad' : 'happy'} />
          <span class="title">Flotte de {name(owner)}</span>
          {#if view.phase === 'place'}
            <span class="state" class:ok={view.ready[owner]}>{view.ready[owner] ? 'Prête !' : 'en préparation…'}</span>
          {/if}
        </header>
        <div class="sea-wrap">
          <Sea
            shots={board.shots}
            ships={board.ships}
            aim={targeted ? view.aim : null}
            firing={view.firing && view.firing.target === owner ? view.firing.cell : null}
            impact={view.last && view.last.target === owner ? view.last : null}
          />
          {#if view.phase === 'place'}
            <div class="radar" class:ready={view.ready[owner]}>
              <div class="sweep"></div>
              <span>{view.ready[owner] ? 'Flotte en position' : 'Placement en cours…'}</span>
            </div>
          {/if}
        </div>
        <ul class="ships">
          {#each FLEET as ship, id (id)}
            {@const sunk = board.ships.some((candidate) => candidate.id === id && candidate.sunk)}
            <li class:sunk>
              <span class="pill" style:width={`${ship.size * 0.9}em`}></span>
              {ship.name}
            </li>
          {/each}
        </ul>
      </div>
    {/each}
  </div>
</section>

<style>
  .battle {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 1em;
  }

  .top {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5em;
    min-height: 5.4em;
  }

  h2 {
    font-size: 2.8em;
    text-align: center;
  }

  .shot {
    display: inline-flex;
    align-items: center;
    gap: 0.5em;
    padding: 0.3em 1.1em;
    border-radius: 999px;
    border: 0.14em solid var(--ink);
    font-family: var(--display);
    font-size: 1.6em;
    color: var(--ink);
    background: var(--cream);
    box-shadow: var(--shadow-sm);
    transform: rotate(-2deg);
  }

  .shot.hit {
    background: var(--tangerine);
  }

  .shot.sunk {
    background: var(--cherry);
    color: var(--cream);
  }

  .seas {
    flex: 1;
    min-height: 0;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    gap: 4em;
  }

  .fleet {
    display: flex;
    align-items: flex-start;
    flex-direction: column;
    gap: 0.6em;
    transition:
      transform 0.4s ease,
      opacity 0.4s ease;
    opacity: 0.85;
  }

  .fleet.targeted {
    transform: scale(1.04);
    opacity: 1;
  }

  header {
    align-self: stretch;
    display: flex;
    align-items: center;
    gap: 0.6em;
    padding: 0.3em 0.9em 0.3em 0.5em;
    border-radius: 999px;
    border: 0.14em solid var(--ink);
    background: var(--pc);
    color: var(--pc-ink);
    box-shadow: var(--shadow-sm);
  }

  .title {
    font-family: var(--display);
    font-size: 1.6em;
  }

  .state {
    margin-left: auto;
    font-weight: 800;
    opacity: 0.8;
  }

  .state.ok {
    opacity: 1;
  }

  .sea-wrap {
    position: relative;
    width: min(48vh, 34vw);
  }

  .targeted .sea-wrap {
    animation: pulse-ring 1.4s ease-out infinite;
    border-radius: 0.8em;
  }

  .radar {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    border-radius: 0.8em;
    background: rgba(31, 39, 163, 0.82);
    color: var(--cream);
    overflow: hidden;
    font-weight: 800;
    font-size: 1.3em;
  }

  .radar span {
    position: relative;
  }

  .sweep {
    position: absolute;
    width: 140%;
    aspect-ratio: 1;
    background: conic-gradient(from 0deg, rgba(79, 224, 143, 0.4), transparent 25%);
    animation: radar 2.4s linear infinite;
  }

  .radar.ready .sweep {
    background: conic-gradient(from 0deg, rgba(244, 219, 124, 0.45), transparent 25%);
  }

  .ships {
    width: min(48vh, 34vw);
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.4em 1.1em;
    font-weight: 800;
    text-transform: capitalize;
  }

  .ships li {
    display: flex;
    align-items: center;
    gap: 0.4em;
  }

  .pill {
    height: 0.8em;
    border-radius: 999px;
    background: var(--cream);
    border: 0.1em solid var(--ink);
  }

  .ships li.sunk {
    color: var(--muted);
    text-decoration: line-through;
  }

  .ships li.sunk .pill {
    background: var(--cherry);
  }

  @keyframes radar {
    to {
      transform: rotate(360deg);
    }
  }
</style>
