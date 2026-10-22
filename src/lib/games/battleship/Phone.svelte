<script lang="ts">
  import BombIcon from '@lucide/svelte/icons/bomb';
  import Crosshair from '@lucide/svelte/icons/crosshair';
  import MoveRight from '@lucide/svelte/icons/move-right';
  import Radar from '@lucide/svelte/icons/radar';
  import { fly } from 'svelte/transition';
  import type { Seats } from '../../room/protocol';
  import Icon from '../../ui/Icon.svelte';
  import { other, type Slot } from '../types';
  import { SIZE, SPECIALS, WEAPON_NAMES, weaponArea, type BattleshipPhone, type Weapon } from './logic';
  import Sea from './Sea.svelte';

  let { view, seats, act }: { view: BattleshipPhone; seats: Seats; me: Slot; act: (action: unknown) => void } = $props();

  let selected = $state<number | null>(null);
  let aim = $state<number | null>(null);
  let weapon = $state<Weapon>('shot');

  const WEAPON_HELP: Record<Weapon, string> = {
    shot: 'Un tir sur une case.',
    bomb: 'Frappe la case et ses quatre voisines, en croix.',
    torpedo: 'Part du bord gauche de la ligne et file jusqu’au premier navire.',
    sonar: 'Compte les cases de navire dans le carré 3×3 autour de la cible.',
  };
  const WEAPON_ICONS = { shot: Crosshair, bomb: BombIcon, torpedo: MoveRight, sonar: Radar };

  $effect.pre(() => {
    if (view.phase !== 'place') selected = null;
    if (view.phase === 'place' || !view.myTurn) {
      aim = null;
      weapon = 'shot';
    } else if (view.aim !== null) aim = view.aim;
    if (view.phase !== 'place' && weapon !== 'shot' && !view.arsenal.includes(weapon)) weapon = 'shot';
  });

  function choose(next: Weapon) {
    if (view.phase === 'place' || !view.myTurn || view.busy) return;
    weapon = next;
    if (aim !== null) act({ type: 'aim', cell: aim, weapon });
  }

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
    act({ type: 'aim', cell, weapon });
  }

  function fire() {
    if (aim === null || view.phase === 'place' || !view.myTurn || view.busy) return;
    act({ type: 'fire', cell: aim, weapon });
  }

  const lastText = $derived.by(() => {
    if (view.phase === 'place' || !view.last) return null;
    const mine = view.last.shooter === view.me;
    const again = view.last.again ? (mine ? ' Rejoue !' : ` ${partner} rejoue.`) : '';
    if (view.last.result === 'scan') {
      const found = `${view.last.count} case${view.last.count > 1 ? 's' : ''} de navire`;
      return mine ? `Sonar : ${found} dans la zone.` : `${partner} a sondé ta flotte : ${found}.`;
    }
    if (view.last.result === 'miss') return mine ? 'À l’eau…' : `${partner} a raté !`;
    const hits = view.last.count > 1 ? ` (${view.last.count} cases)` : '';
    if (view.last.result === 'hit') return (mine ? `Touché${hits} !` : `${partner} t’a touché${hits} !`) + again;
    return (mine ? `Coulé ! Tu as eu son ${view.last.ship}.` : `Aïe, ton ${view.last.ship} est coulé…`) + again;
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
          <Icon name={view.last.result === 'miss' || view.last.result === 'scan' ? 'water-wave' : 'collision'} size="1.3em" />{lastText}
        </div>
      {/key}
    {/if}
    {#if view.myTurn}
      <p class="status mine">{view.busy ? 'Feu !' : 'À toi ! Choisis une case, puis fais feu.'}</p>
      {#if view.specials}
        <div class="weapons" role="radiogroup" aria-label="Arme">
          {#each ['shot', ...SPECIALS] as Weapon[] as option (option)}
            {@const WeaponIcon = WEAPON_ICONS[option]}
            <button
              class="weapon"
              role="radio"
              aria-checked={weapon === option}
              class:active={weapon === option}
              disabled={view.busy || (option !== 'shot' && !view.arsenal.includes(option))}
              onclick={() => choose(option)}><WeaponIcon size={20} /><span>{WEAPON_NAMES[option]}</span></button
            >
          {/each}
        </div>
        <p class="help">{WEAPON_HELP[weapon]}{weapon === 'shot' ? '' : ' Une seule fois par partie !'}</p>
      {/if}
      <Sea
        shots={view.enemy.shots}
        ships={view.enemy.ships}
        scans={view.enemy.scans}
        zone={aim !== null && !view.busy ? weaponArea(weapon, aim) : []}
        aim={view.busy ? null : aim}
        firing={view.firing ? view.firing.cell : null}
        mode="target"
        oncell={target}
      />
      <button class="btn danger block fire" disabled={aim === null || view.busy} onclick={fire}>
        <Icon name="bomb" size="1.4em" />{weapon === 'sonar' ? 'Sonder !' : weapon === 'shot' ? 'Feu !' : `${WEAPON_NAMES[weapon]} !`}
      </button>
      <div class="mini">
        <span>Ta flotte</span>
        <Sea shots={view.own.shots} ships={view.own.ships} scans={view.own.scans} />
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
        scans={view.own.scans}
        firing={view.firing ? view.firing.cell : null}
        impact={view.last && view.last.target === view.me ? view.last : null}
      />
      <div class="mini">
        <span>Flotte de {partner}</span>
        <Sea shots={view.enemy.shots} ships={view.enemy.ships} scans={view.enemy.scans} />
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

  .weapons {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.4rem;
  }

  .weapon {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.15rem;
    min-height: 3.2rem;
    padding: 0.3rem 0.2rem;
    border-radius: 0.8rem;
    border: 2px solid var(--ink);
    background: var(--cream);
    color: var(--ink);
    font-weight: 800;
    font-size: 0.8rem;
    box-shadow: 2px 3px 0 var(--ink);
  }

  .weapon.active {
    background: var(--butter);
    transform: translate(2px, 3px);
    box-shadow: none;
  }

  .weapon:disabled {
    opacity: 0.35;
    text-decoration: line-through;
  }

  .help {
    margin: 0;
    font-weight: 700;
    font-size: 0.9rem;
    color: var(--ink-2);
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
