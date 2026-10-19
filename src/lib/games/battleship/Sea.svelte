<script lang="ts">
  import Icon from '../../ui/Icon.svelte';
  import { replay } from '../../ui/replay';
  import { SIZE, type ShipView, type Shot } from './logic';

  let {
    shots,
    ships,
    aim = null,
    firing = null,
    impact = null,
    mode = 'view',
    selected = null,
    shake = 0,
    oncell,
    onship,
  }: {
    shots: Shot[];
    ships: ShipView[];
    aim?: number | null;
    firing?: number | null;
    impact?: { seq: number; cell: number; result: 'miss' | 'hit' | 'sunk' } | null;
    mode?: 'view' | 'target' | 'place';
    selected?: number | null;
    shake?: number;
    oncell?: (cell: number) => void;
    onship?: (id: number) => void;
  } = $props();

  const step = 100 / SIZE;
  const cells = Array.from({ length: SIZE * SIZE }, (_, index) => index);
  const pos = (cell: number) => ({ left: (cell % SIZE) * step, top: Math.floor(cell / SIZE) * step });
</script>

<div class="sea" use:replay={{ key: `${shake}-${impact && impact.result !== 'miss' ? impact.seq : 0}`, className: 'shake' }}>
  <div class="water" aria-hidden="true"></div>

  {#each ships as ship (ship.id)}
    <div
      class="ship"
      class:sunk={ship.sunk}
      class:vertical={!ship.horizontal}
      class:selected={selected === ship.id}
      style:left={`${ship.col * step}%`}
      style:top={`${ship.row * step}%`}
      style:width={`${(ship.horizontal ? ship.size : 1) * step}%`}
      style:height={`${(ship.horizontal ? 1 : ship.size) * step}%`}
    >
      <div class="hull">
        {#each { length: ship.size } as _, index (index)}<span class="porthole"></span>{/each}
      </div>
    </div>
  {/each}

  {#each cells as cell (cell)}
    {#if shots[cell]}
      <div class="mark" style:left={`${pos(cell).left}%`} style:top={`${pos(cell).top}%`}>
        {#if shots[cell] === 'hit'}
          <span class="burst"><Icon name="collision" size="100%" /></span>
        {:else}
          <span class="splash"></span>
        {/if}
      </div>
    {/if}
  {/each}

  {#if impact}
    {#key impact.seq}
      <div
        class="impact"
        class:strong={impact.result !== 'miss'}
        style:left={`${pos(impact.cell).left}%`}
        style:top={`${pos(impact.cell).top}%`}
      >
        <span class="ring"></span>
        <span class="ring late"></span>
      </div>
    {/key}
  {/if}

  {#if aim !== null && firing === null}
    <div class="reticle" style:left={`${pos(aim).left}%`} style:top={`${pos(aim).top}%`}></div>
  {/if}

  {#if firing !== null}
    <div class="reticle locked" style:left={`${pos(firing).left}%`} style:top={`${pos(firing).top}%`}>
      <span class="bomb"><Icon name="bomb" size="100%" /></span>
    </div>
  {/if}

  {#if mode !== 'view'}
    <div class="hitbox">
      {#each cells as cell (cell)}
        {@const ship =
          mode === 'place'
            ? ships.find((candidate) => {
                const row = Math.floor(cell / SIZE);
                const col = cell % SIZE;
                return candidate.horizontal
                  ? row === candidate.row && col >= candidate.col && col < candidate.col + candidate.size
                  : col === candidate.col && row >= candidate.row && row < candidate.row + candidate.size;
              })
            : undefined}
        <button
          class="cell"
          disabled={mode === 'target' && shots[cell] !== null}
          aria-label={`Case ${String.fromCharCode(65 + Math.floor(cell / SIZE))}${(cell % SIZE) + 1}`}
          onclick={() => (ship ? onship?.(ship.id) : oncell?.(cell))}
        ></button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .sea {
    position: relative;
    width: 100%;
    aspect-ratio: 1;
    border-radius: 0.8em;
    border: 0.2em solid var(--ink);
    box-shadow: 0.25em 0.3em 0 var(--ink);
    overflow: hidden;
    background: #2a35c9;
  }

  .water {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255, 255, 255, 0.13) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.13) 1px, transparent 1px),
      radial-gradient(circle at 30% 20%, #5663ff 0%, #2f3bd9 45%, #1f27a3 100%);
    background-size:
      12.5% 12.5%,
      12.5% 12.5%,
      100% 100%;
  }

  .sea:global(.shake) {
    animation: shake 0.45s ease-in-out;
  }

  .ship {
    position: absolute;
    padding: 0.35%;
    transition:
      left 0.25s ease,
      top 0.25s ease,
      width 0.25s ease,
      height 0.25s ease;
  }

  .hull {
    width: 100%;
    height: 100%;
    border-radius: 999px;
    background: linear-gradient(180deg, #fff3e6, #ffc4dc);
    border: 0.14em solid var(--ink);
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 0 6%;
  }

  .vertical .hull {
    flex-direction: column;
    padding: 6% 0;
    background: linear-gradient(90deg, #fff3e6, #ffc4dc);
  }

  .porthole {
    width: 0.45em;
    height: 0.45em;
    border-radius: 50%;
    background: #2a0c1d;
  }

  .sunk .hull {
    background: repeating-linear-gradient(135deg, #8c1650 0 0.5em, #e8213f 0.5em 1em);
  }

  .selected .hull {
    background: linear-gradient(180deg, #ffe58a, #ffd23d);
    box-shadow: 0 0 0 0.18em var(--cream);
    animation: bob 0.9s ease-in-out infinite;
  }

  .mark,
  .impact,
  .reticle {
    position: absolute;
    width: 12.5%;
    height: 12.5%;
    display: grid;
    place-items: center;
    pointer-events: none;
  }

  .burst {
    width: 78%;
    height: 78%;
    animation: pop-in 0.35s ease-out;
  }

  .splash {
    width: 28%;
    height: 28%;
    border-radius: 50%;
    background: #e8f3ff;
    border: 0.1em solid #1f27a3;
    animation: pop-in 0.35s ease-out;
  }

  .ring {
    position: absolute;
    width: 70%;
    height: 70%;
    border-radius: 50%;
    border: 0.18em solid #e8f3ff;
    animation: ripple 0.9s ease-out forwards;
  }

  .ring.late {
    animation-delay: 0.18s;
  }

  .impact.strong .ring {
    border-color: #ffb347;
    border-width: 0.28em;
  }

  .reticle {
    border: 0.18em dashed var(--butter);
    border-radius: 50%;
    animation: spin 3s linear infinite;
    z-index: 2;
  }

  .reticle.locked {
    border-style: solid;
    border-color: var(--cherry);
    animation: none;
  }

  .bomb {
    width: 80%;
    height: 80%;
    animation: fall 1.05s cubic-bezier(0.55, 0, 0.9, 0.4) forwards;
  }

  .hitbox {
    position: absolute;
    inset: 0;
    display: grid;
    grid-template-columns: repeat(8, minmax(0, 1fr));
    grid-template-rows: repeat(8, minmax(0, 1fr));
    z-index: 3;
  }

  .cell:disabled {
    cursor: default;
  }

  @keyframes ripple {
    from {
      transform: scale(0.3);
      opacity: 1;
    }
    to {
      transform: scale(2.2);
      opacity: 0;
    }
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes fall {
    from {
      transform: translateY(-420%) scale(2.6) rotate(-30deg);
      opacity: 0.2;
    }
    to {
      transform: translateY(0) scale(1) rotate(0);
      opacity: 1;
    }
  }
</style>
