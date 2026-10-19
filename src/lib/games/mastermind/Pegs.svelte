<script lang="ts">
  import { COLORS, LENGTH, type Guess } from './logic';

  let { pegs, feedback = null, hidden = false }: { pegs: (number | null)[]; feedback?: Guess | null; hidden?: boolean } = $props();

  const pins = $derived(
    feedback
      ? [
          ...Array(feedback.exact).fill('exact'),
          ...Array(feedback.near).fill('near'),
          ...Array(LENGTH - feedback.exact - feedback.near).fill('none'),
        ]
      : [],
  );
</script>

<div class="row" class:hidden>
  <div class="pegs">
    {#each { length: LENGTH } as _, index (index)}
      {@const peg = pegs[index] ?? null}
      <span class="peg" class:empty={peg === null || hidden} style:--peg={peg === null || hidden ? 'transparent' : COLORS[peg]}
        >{hidden ? '?' : ''}</span
      >
    {/each}
  </div>
  {#if feedback}
    <div
      class="pins"
      aria-label={`${feedback.exact} bien placé${feedback.exact > 1 ? 's' : ''}, ${feedback.near} mal placé${feedback.near > 1 ? 's' : ''}`}
    >
      {#each pins as pin, index (index)}<span class="pin {pin}"></span>{/each}
    </div>
  {/if}
</div>

<style>
  .row {
    display: flex;
    align-items: center;
    gap: 0.6em;
  }

  .pegs {
    display: flex;
    gap: 0.35em;
  }

  .peg {
    width: 1.6em;
    height: 1.6em;
    display: grid;
    place-items: center;
    border-radius: 50%;
    border: 0.12em solid var(--ink);
    background: radial-gradient(circle at 34% 30%, rgba(255, 255, 255, 0.55) 0 14%, transparent 15%), var(--peg);
    font-family: var(--display);
    color: var(--cream);
  }

  .peg.empty {
    border-style: dashed;
    border-color: rgba(255, 243, 230, 0.6);
  }

  .hidden .peg {
    background: var(--ink-2);
    border: 0.12em solid var(--ink);
  }

  .pins {
    display: grid;
    grid-template-columns: repeat(2, 0.62em);
    gap: 0.16em;
  }

  .pin {
    width: 0.62em;
    height: 0.62em;
    border-radius: 50%;
    border: 0.1em solid var(--cream);
  }

  .pin.exact {
    background: var(--cream);
  }

  .pin.none {
    border-color: rgba(255, 243, 230, 0.2);
  }
</style>
