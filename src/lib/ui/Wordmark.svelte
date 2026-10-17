<script lang="ts">
  let { size = '1em', lines = 1 }: { size?: string; lines?: 1 | 2 } = $props();

  const COLORS = ['#8b5a4a', '#4e9a6b', '#f08a2c', '#6f95d2', '#f7bc6e'];
  const TEXT = 'Les meme dans le canapé';

  function letters(text: string, start: number) {
    let index = start;
    return [...text].map((char) => {
      if (char === ' ') return { char, color: 'transparent' };
      const color = COLORS[index % COLORS.length];
      index += 1;
      return { char, color };
    });
  }

  const first = letters('Les meme', 0);
  const second = letters('dans le canapé', 7);
  const single = letters(TEXT, 0);
</script>

<span class="wordmark" style:font-size={size} aria-label={TEXT} role="img">
  {#if lines === 2}
    <span class="line"
      >{#each first as letter, i (i)}<span style:color={letter.color}>{letter.char}</span>{/each}</span
    >
    <span class="line small"
      >{#each second as letter, i (i)}<span style:color={letter.color}>{letter.char}</span>{/each}</span
    >
  {:else}
    <span class="line"
      >{#each single as letter, i (i)}<span style:color={letter.color}>{letter.char}</span>{/each}</span
    >
  {/if}
</span>

<style>
  .wordmark {
    display: inline-flex;
    flex-direction: column;
    font-family: var(--display);
    line-height: 1;
    letter-spacing: 0.02em;
  }

  .line {
    white-space: pre;
  }

  .line span {
    text-shadow:
      0.06em 0 0 var(--ink),
      -0.06em 0 0 var(--ink),
      0 0.06em 0 var(--ink),
      0 -0.06em 0 var(--ink),
      0.045em 0.045em 0 var(--ink),
      -0.045em 0.045em 0 var(--ink),
      0.045em -0.045em 0 var(--ink),
      -0.045em -0.045em 0 var(--ink),
      0 0.13em 0 var(--ink);
  }

  .small {
    font-size: 0.8em;
  }
</style>
