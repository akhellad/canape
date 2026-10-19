<script lang="ts">
  import { BONUS, BONUS_THRESHOLD, CATEGORIES, upperTotal, type CategoryId, type Sheet } from './logic';

  let {
    sheet,
    total,
    potential = {},
    last = null,
    selected = null,
    onpick,
  }: {
    sheet: Sheet;
    total: number;
    potential?: Partial<Record<CategoryId, number>>;
    last?: CategoryId | null;
    selected?: CategoryId | null;
    onpick?: (category: CategoryId) => void;
  } = $props();

  const upper = $derived(upperTotal(sheet));
</script>

<table class="sheet">
  <tbody>
    {#each CATEGORIES as category, index (category.id)}
      {@const value = sheet[category.id]}
      {@const maybe = potential[category.id]}
      <tr class:gap={index === 6} class:last={last === category.id} class:selected={selected === category.id}>
        <th>{category.label}</th>
        <td>
          {#if value !== null}
            <span class="value">{value}</span>
          {:else if maybe !== undefined}
            {#if onpick}
              <button class="maybe" class:zero={maybe === 0} onclick={() => onpick(category.id)}>{maybe}</button>
            {:else}
              <span class="maybe" class:zero={maybe === 0}>{maybe}</span>
            {/if}
          {/if}
        </td>
      </tr>
      {#if index === 5}
        <tr class="bonus">
          <th>Bonus ({upper}/{BONUS_THRESHOLD})</th>
          <td>{upper >= BONUS_THRESHOLD ? BONUS : '–'}</td>
        </tr>
      {/if}
    {/each}
    <tr class="total">
      <th>Total</th>
      <td>{total}</td>
    </tr>
  </tbody>
</table>

<style>
  .sheet {
    width: 100%;
    border-collapse: collapse;
    background: var(--cream);
    border: 0.14em solid var(--ink);
    border-radius: 0.8em;
    overflow: hidden;
    box-shadow: var(--shadow-sm);
  }

  tr + tr {
    border-top: 0.06em solid rgba(42, 12, 29, 0.18);
  }

  tr.gap,
  tr.bonus {
    border-top: 0.12em solid var(--ink);
  }

  th {
    text-align: left;
    font-weight: 700;
    padding: 0.2em 0.6em;
  }

  td {
    width: 3.2em;
    text-align: center;
    font-weight: 800;
    padding: 0.15em 0.4em;
    border-left: 0.06em solid rgba(42, 12, 29, 0.18);
  }

  .value {
    font-family: var(--display);
    font-weight: 400;
    font-size: 1.15em;
  }

  .maybe {
    display: inline-block;
    min-width: 2em;
    padding: 0 0.3em;
    border-radius: 0.4em;
    background: var(--butter);
    border: 0.08em solid var(--ink);
    font-weight: 800;
  }

  .maybe.zero {
    background: var(--paper-2);
    color: var(--ink-2);
  }

  .last {
    animation: flash 1.4s ease-out;
  }

  .selected td {
    background: var(--mint);
  }

  .bonus th,
  .bonus td {
    font-size: 0.85em;
    color: var(--ink-2);
  }

  .total {
    background: var(--ink);
    color: var(--cream);
  }

  .total td {
    font-family: var(--display);
    font-weight: 400;
    font-size: 1.3em;
  }

  @keyframes flash {
    0%,
    40% {
      background: var(--butter);
    }
    100% {
      background: transparent;
    }
  }
</style>
