<script lang="ts">
  let { pattern, word = null }: { pattern: string; word?: string | null } = $props();
  const text = $derived(word ?? pattern);
  const words = $derived(text.split(' '));
</script>

<div class="pattern" class:revealed={word !== null} aria-label={word ?? `${pattern.replace(/[^_]/g, '').length} lettres à trouver`}>
  {#if word !== null}
    <span class="answer">{word.toLocaleUpperCase('fr-FR')}</span>
  {:else}
    {#each words as part, w (w)}
      <span class="word">
        {#each [...part] as char, index (index)}
          {#if char === '_'}
            <span class="slot"></span>
          {:else}
            <span class="char" class:punct={!/[a-zà-ÿœ]/i.test(char)}>{char.toLocaleUpperCase('fr-FR')}</span>
          {/if}
        {/each}
      </span>
    {/each}
  {/if}
</div>

<style>
  .pattern {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.4em 0.9em;
  }

  .word {
    display: flex;
    gap: 0.18em;
  }

  .slot,
  .char {
    width: 0.9em;
    height: 1.2em;
    display: grid;
    place-items: end center;
    font-family: var(--display);
  }

  .slot {
    border-bottom: 0.12em solid currentColor;
    opacity: 0.8;
  }

  .char {
    animation: pop-in 0.3s ease-out;
  }

  .char.punct {
    width: 0.4em;
  }

  .answer {
    font-family: var(--display);
    color: var(--yellow);
    letter-spacing: 0.04em;
    text-align: center;
    animation: pop-in 0.35s ease-out;
  }
</style>
