<script lang="ts">
  let { symbol, size = '100%' }: { symbol: number; size?: string } = $props();
</script>

<svg class="symbol" viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
  <g stroke="#2a0c1d" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
    {#if symbol === 0}
      <path d="M50 84C14 60 10 36 26 26c11-7 22 0 24 8 2-8 13-15 24-8 16 10 12 34-24 58Z" fill="#d01a3b" />
    {:else if symbol === 1}
      <path d="M50 12l11 24 26 3-19 18 5 26-23-13-23 13 5-26-19-18 26-3Z" fill="#ffd23d" />
    {:else if symbol === 2}
      <path d="M62 14A36 36 0 1 0 86 64 30 30 0 1 1 62 14Z" fill="#b9a6ff" />
    {:else if symbol === 3}
      <g fill="none">
        {#each [0, 45, 90, 135, 180, 225, 270, 315] as angle (angle)}
          <path d="M50 10v10" transform={`rotate(${angle} 50 50)`} />
        {/each}
      </g>
      <circle cx="50" cy="50" r="20" fill="#ff7a2e" />
    {:else if symbol === 4}
      <path d="M24 72a14 14 0 0 1 2-28 18 18 0 0 1 34-8 14 14 0 0 1 22 12 12 12 0 0 1-2 24Z" fill="#fff3e6" />
    {:else if symbol === 5}
      <path d="M58 8 24 56h22l-8 36 38-50H54Z" fill="#3b46ff" />
    {:else if symbol === 6}
      <g fill="#ff5c9d">
        {#each [0, 72, 144, 216, 288] as angle (angle)}
          <ellipse cx="50" cy="28" rx="13" ry="18" transform={`rotate(${angle} 50 50)`} />
        {/each}
      </g>
      <circle cx="50" cy="50" r="11" fill="#ffd23d" />
    {:else if symbol === 7}
      <path d="M36 62C40 40 52 24 70 14M64 66C62 44 66 28 70 14" fill="none" stroke="#19b48a" />
      <circle cx="34" cy="70" r="14" fill="#d01a3b" />
      <circle cx="64" cy="72" r="14" fill="#d01a3b" />
    {:else if symbol === 8}
      <path d="M16 50c12-18 38-22 56-6l14-12v36L72 56c-18 16-44 12-56-6Z" fill="#2fd1a5" />
      <circle cx="32" cy="46" r="3.5" fill="#2a0c1d" stroke="none" />
    {:else if symbol === 9}
      <path d="M24 86V44a26 26 0 0 1 52 0v42l-9-8-8 8-9-8-9 8-8-8Z" fill="#fff3e6" />
      <circle cx="41" cy="44" r="4" fill="#2a0c1d" stroke="none" />
      <circle cx="59" cy="44" r="4" fill="#2a0c1d" stroke="none" />
    {:else if symbol === 10}
      <path d="M14 72 20 28l18 20 12-30 12 30 18-20 6 44Z" fill="#ffd23d" />
      <path d="M14 72h72v12H14Z" fill="#ff7a2e" />
    {:else if symbol === 11}
      <path d="M28 18h44l18 22-40 46-40-46Z" fill="#7ee8fa" />
      <path d="M10 40h80M36 18l-6 22 20 46M64 18l6 22-20 46" fill="none" stroke-width="3.5" />
    {:else if symbol === 12}
      <path d="M14 52a36 32 0 0 1 72 0Z" fill="#d01a3b" />
      <path d="M38 52h24l4 32H34Z" fill="#fff3e6" />
      <circle cx="34" cy="38" r="5" fill="#fff3e6" stroke-width="3" />
      <circle cx="60" cy="32" r="6" fill="#fff3e6" stroke-width="3" />
    {:else if symbol === 13}
      <path
        d="M42 88V22a8 8 0 0 1 16 0v66ZM42 58H30a8 8 0 0 1-8-8V36a5 5 0 0 1 10 0v12h10M58 50h10V32a5 5 0 0 1 10 0v18a8 8 0 0 1-8 8H58"
        fill="#19b48a"
      />
    {:else if symbol === 14}
      <circle cx="50" cy="50" r="34" fill="#e9b48e" />
      <path d="M20 46c4-20 56-26 62 0-4 6-8 2-12 8s-10-2-14 4-12-2-16 2-14-4-20-14Z" fill="#ff5c9d" />
      <circle cx="50" cy="50" r="10" fill="#ff5c9d" />
    {:else}
      <path d="M50 8c18 14 22 40 14 62H36C28 48 32 22 50 8Z" fill="#fff3e6" />
      <circle cx="50" cy="38" r="8" fill="#3b46ff" />
      <path d="M36 56 22 74l16-4M64 56l14 18-16-4" fill="#d01a3b" />
      <path d="M42 72l8 18 8-18" fill="#ff7a2e" />
    {/if}
  </g>
</svg>

<style>
  .symbol {
    display: block;
    overflow: visible;
  }
</style>
