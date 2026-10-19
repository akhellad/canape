<script lang="ts">
  let { size = '1em', lines = 1, animated = false }: { size?: string; lines?: 1 | 2; animated?: boolean } = $props();

  const COLORS = ['#fff3e6', '#ffd23d', '#fff3e6', '#ff7a2e', '#fff3e6', '#2fd1a5'];
  const TEXT = 'Les meme dans le canapé';

  function letters(text: string, start: number) {
    let index = start;
    return [...text].map((char) => {
      if (char === ' ') return { char, color: 'transparent', index: -1 };
      const color = COLORS[index % COLORS.length];
      index += 1;
      return { char, color, index };
    });
  }

  const rows = $derived(lines === 2 ? [letters('Les meme', 0), letters('dans le canapé', 7)] : [letters(TEXT, 0)]);
</script>

<span class="wordmark" class:animated style:font-size={size} aria-label={TEXT} role="img">
  {#each rows as row, r (r)}
    <span class="line" class:small={r === 1}
      >{#each row as letter, i (i)}<span style:color={letter.color} style:--i={letter.index}>{letter.char}</span>{/each}</span
    >
  {/each}
</span>

<style>
  .wordmark {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    font-family: var(--display);
    line-height: 1.08;
    letter-spacing: 0.01em;
  }

  .line {
    white-space: pre;
  }

  .line span {
    display: inline-block;
    -webkit-text-stroke: 0.07em var(--ink);
    paint-order: stroke fill;
    text-shadow:
      0.03em 0.04em 0 var(--ink),
      0.06em 0.08em 0 var(--ink);
  }

  .animated .line span {
    animation: letter 2.8s ease-in-out infinite;
    animation-delay: calc(var(--i) * 90ms);
  }

  .small {
    font-size: 0.78em;
  }

  @keyframes letter {
    0%,
    70%,
    100% {
      transform: translateY(0) rotate(0);
    }
    80% {
      transform: translateY(-0.12em) rotate(-4deg);
    }
    90% {
      transform: translateY(0.02em) rotate(2deg);
    }
  }
</style>
