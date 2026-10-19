<script lang="ts">
  import { fly } from 'svelte/transition';
  import type { Seats } from '../../room/protocol';
  import Icon from '../../ui/Icon.svelte';
  import { other, type Slot } from '../types';
  import { SIZE, type BattleshipPhone } from './logic';
  import Sea from './Sea.svelte';

  let { view, seats, act }: { view: BattleshipPhone; seats: Seats; me: Slot; act: (action: unknown) => void } = $props();

  let selected = $state<number | null>(null);
  let aim = $state<number | null>(null);

  $effect.pre(() => {
    if (view.phase !== 'place') selected = null;
    if (view.phase === 'place' || !view.myTurn) aim = null;
    else if (view.aim !== null) aim = view.aim;
  });

  const partner = $derived(seats[other(view.me)]?.name ?? 'l’autre');

  function pickShip(id: number) {
    if (view.phase !== 'place' || view.ready) return;
    if (selected === id) act({ type: 'rotate', ship: id });
    else selected = id;
  }

  function placeAt(cell: number) {
    if (view.phase !== 'place' || view.ready || selected === null) return;
    act({ type: 'move', ship: selected, row: Math.floor(cell / SIZE), col: cell % SIZE });
  }

  function target(cell: number) {
    if (view.phase === 'place' || !view.myTurn || view.busy) return;
    aim = cell;
    act({ type: 'aim', cell });
  }

  function fire() {
    if (aim === null || view.phase === 'place' || !view.myTurn || view.busy) return;
    act({ type: 'fire', cell: aim });
  }

  const lastText = $derived.by(() => {
    if (view.phase === 'place' || !view.last) return null;
    const mine = view.last.shooter === view.me;
    if (view.last.result === 'miss') return mine ? 'À l’eau…' : `${partner} a raté !`;
    if (view.last.result === 'hit') return mine ? 'Touché !' : `${partner} t’a touché !`;
    return mine ? `Coulé ! Tu as eu son ${view.last.ship}.` : `Aïe, ton ${view.last.ship} est coulé…`;
  });
</script>

<div class="battle p{view.me}">
  {#if view.phase === 'place'}
    <p class="status">
      {#if view.ready}
        Prêt ! {view.otherReady ? 'C’est parti…' : `On attend ${partner}…`}
      {:else if selected === null}
        Touche un navire pour le choisir.
      {:else}
        Touche une case pour le déplacer, ou re-touche-le pour le tourner.
      {/if}
    </p>
    <Sea
      shots={Array(SIZE * SIZE).fill(null)}
      ships={view.ships}
      mode={view.ready ? 'view' : 'place'}
      {selected}
      shake={view.rejected}
      oncell={placeAt}
      onship={pickShip}
    />
    <div class="actions">
      {#if view.ready}
        <button class="btn ghost block" onclick={() => act({ type: 'unready' })}>Modifier ma flotte</button>
      {:else}
        <button class="btn" onclick={() => act({ type: 'shuffle' })}>Mélanger</button>
        <button class="btn go" onclick={() => act({ type: 'ready' })}>Je suis prêt</button>
      {/if}
    </div>
  {:else}
    {#if lastText && view.last}
      {#key view.last.seq}
        <div class="last {view.last.result}" in:fly={{ y: -16, duration: 300 }}>
          <Icon name={view.last.result === 'miss' ? 'water-wave' : 'collision'} size="1.3em" />{lastText}
        </div>
      {/key}
    {/if}
    {#if view.myTurn}
      <p class="status mine">{view.busy ? 'Feu !' : 'À toi ! Choisis une case, puis fais feu.'}</p>
      <Sea
        shots={view.enemy.shots}
        ships={view.enemy.ships}
        aim={view.busy ? null : aim}
        firing={view.firing ? view.firing.cell : null}
        mode="target"
        oncell={target}
      />
      <button class="btn danger block fire" disabled={aim === null || view.busy} onclick={fire}>
        <Icon name="bomb" size="1.4em" />Feu !
      </button>
      <div class="mini">
        <span>Ta flotte</span>
        <Sea shots={view.own.shots} ships={view.own.ships} />
      </div>
    {:else}
      <p class="status">
        {#if view.phase === 'over'}
          {view.winner === view.me ? 'Victoire, toute sa flotte est coulée !' : 'Ta flotte est au fond de l’eau…'}
        {:else}
          {partner} vise ta flotte…
        {/if}
      </p>
      <Sea
        shots={view.own.shots}
        ships={view.own.ships}
        firing={view.firing ? view.firing.cell : null}
        impact={view.last && view.last.target === view.me ? view.last : null}
      />
      <div class="mini">
        <span>Flotte de {partner}</span>
        <Sea shots={view.enemy.shots} ships={view.enemy.ships} />
      </div>
    {/if}
  {/if}
</div>

<style>
  .battle {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
    font-size: 0.85rem;
  }

  .status {
    font-weight: 800;
    font-size: 1.1rem;
    line-height: 1.35;
    min-height: 2.8em;
  }

  .status.mine {
    align-self: flex-start;
    padding: 0.4rem 0.8rem;
    border-radius: 0.8rem;
    border: 2px solid var(--ink);
    background: var(--pc);
    color: var(--pc-ink);
    box-shadow: 3px 4px 0 var(--ink);
  }

  .actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.7rem;
    margin-top: auto;
  }

  .actions .block {
    grid-column: span 2;
  }

  .fire {
    min-height: 4rem;
    font-size: 1.6rem;
  }

  .last {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.9rem;
    border-radius: 0.8rem;
    border: 2px solid var(--ink);
    font-weight: 900;
    font-size: 1.05rem;
    color: var(--ink);
    background: var(--cream);
    box-shadow: 3px 4px 0 var(--ink);
  }

  .last.hit {
    background: var(--tangerine);
  }

  .last.sunk {
    background: var(--cherry);
    color: var(--cream);
  }

  .mini {
    width: 45%;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-weight: 800;
    font-size: 0.6rem;
  }

  .mini span {
    font-size: 0.95rem;
    color: var(--ink-2);
  }
</style>
