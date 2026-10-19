<script lang="ts">
  let { items, tilt = -1.5 }: { items: string[]; tilt?: number } = $props();
  const run = $derived([...items, ...items, ...items, ...items]);
</script>

<div class="marquee" style:--tilt={`${tilt}deg`} aria-hidden="true">
  <div class="track">
    {#each [0, 1] as copy (copy)}
      <span class="group">
        {#each run as item, i (i)}<span class="item">{item}</span><span class="star">✦</span>{/each}
      </span>
    {/each}
  </div>
</div>

<style>
  .marquee {
    width: calc(100% + 6em);
    margin: 0 -3em;
    overflow: hidden;
    background: var(--ink);
    color: var(--cream);
    border-block: 0.16em solid var(--ink);
    transform: rotate(var(--tilt));
    padding: 0.35em 0 0.45em;
    box-shadow: 0 0.3em 0 rgba(42, 12, 29, 0.25);
  }

  .track {
    display: flex;
    width: max-content;
    animation: marquee 60s linear infinite;
  }

  .group {
    display: flex;
    align-items: center;
  }

  .item {
    font-family: var(--display);
    font-size: 1.5em;
    padding: 0 0.6em;
    white-space: nowrap;
  }

  .star {
    color: var(--butter);
    font-size: 1.2em;
  }
</style>
