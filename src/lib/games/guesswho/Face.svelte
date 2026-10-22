<script lang="ts">
  import type { Person } from './people';

  let { person, size = '100%' }: { person: Person; size?: string } = $props();

  const SKIN = ['#f9d7bd', '#e9b48e', '#c48a5e', '#8a5636'];
  const HAIR = {
    brun: '#6b3e26',
    blond: '#f5c84b',
    roux: '#d9622b',
    noir: '#2a0c1d',
    blanc: '#f3eee6',
    rose: '#ff8fc8',
    bleu: '#4fa3ff',
  };
  const SHIRT = {
    rose: '#ff5c9d',
    bleu: '#3b46ff',
    vert: '#2fd1a5',
    jaune: '#ffd23d',
    orange: '#ff7a2e',
    violet: '#b9a6ff',
    rouge: '#d01a3b',
    noir: '#3a3340',
  };

  const skin = $derived(SKIN[person.skin]);
  const hair = $derived(HAIR[person.hairColor]);
  const hatOn = $derived(person.hat !== 'aucun');
</script>

<svg class="face" viewBox="0 0 100 110" width={size} height={size} aria-hidden="true">
  <g stroke="#2a0c1d" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round">
    <path d="M12 112C12 86 30 78 50 78s38 8 38 34Z" fill={SHIRT[person.shirt]} />
    <path d="M42 72h16v10a8 8 0 0 1-16 0Z" fill={skin} />

    {#if person.hair === 'long'}
      <path d="M24 46Q24 18 50 18Q76 18 76 46L80 86Q50 94 20 86Z" fill={hair} />
    {:else if person.hair === 'afro'}
      <circle cx="50" cy="40" r="33" fill={hair} />
    {:else if person.hair === 'couettes'}
      <g fill={hair}>
        <ellipse cx="17" cy="56" rx="9" ry="14" transform="rotate(18 17 56)" />
        <ellipse cx="83" cy="56" rx="9" ry="14" transform="rotate(-18 83 56)" />
      </g>
      <circle cx="24" cy="44" r="3.5" fill="#ff5c9d" />
      <circle cx="76" cy="44" r="3.5" fill="#ff5c9d" />
    {/if}

    <ellipse cx="26" cy="54" rx="5" ry="7" fill={skin} />
    <ellipse cx="74" cy="54" rx="5" ry="7" fill={skin} />
    <ellipse cx="50" cy="50" rx="24" ry="27" fill={skin} />

    {#if person.earrings}
      <circle cx="25" cy="64" r="3.2" fill="#ffd23d" />
      <circle cx="75" cy="64" r="3.2" fill="#ffd23d" />
    {/if}

    {#if person.facial === 'barbe'}
      <path d="M26 52Q28 82 50 84Q72 82 74 52Q68 70 50 71Q32 70 26 52Z" fill={hair} />
    {/if}

    <circle cx="41" cy="51" r="2.6" fill="#2a0c1d" stroke="none" />
    <circle cx="59" cy="51" r="2.6" fill="#2a0c1d" stroke="none" />
    <ellipse cx="34" cy="61" rx="4" ry="2.4" fill="#ff5c9d" stroke="none" opacity="0.55" />
    <ellipse cx="66" cy="61" rx="4" ry="2.4" fill="#ff5c9d" stroke="none" opacity="0.55" />
    {#if person.freckles}
      <g fill="#9a4a24" stroke="none">
        <circle cx="31" cy="57" r="1.2" /><circle cx="35" cy="59" r="1.2" /><circle cx="33" cy="62" r="1.2" />
        <circle cx="69" cy="57" r="1.2" /><circle cx="65" cy="59" r="1.2" /><circle cx="67" cy="62" r="1.2" />
      </g>
    {/if}
    <path d="M43 66Q50 72 57 66" fill="none" />

    {#if person.facial === 'moustache'}
      <path d="M38 63Q44 57 50 61Q56 57 62 63Q56 67 50 64Q44 67 38 63Z" fill={hair} />
    {/if}

    {#if person.glasses}
      <g fill="rgba(255,255,255,0.35)">
        <circle cx="40" cy="51" r="7" />
        <circle cx="60" cy="51" r="7" />
      </g>
      <path d="M47 51h6M33 50l-6-2M67 50l6-2" fill="none" />
    {/if}

    {#if !hatOn || person.hair === 'long'}
      {#if person.hair === 'court' || person.hair === 'long' || person.hair === 'chignon' || person.hair === 'couettes'}
        <path d="M25 47Q22 20 50 20Q78 20 75 47Q70 34 56 33Q52 39 44 35Q32 35 25 47Z" fill={hair} />
      {:else if person.hair === 'bouclé'}
        <g fill={hair}>
          <circle cx="29" cy="38" r="8" />
          <circle cx="36" cy="27" r="9" />
          <circle cx="50" cy="23" r="10" />
          <circle cx="64" cy="27" r="9" />
          <circle cx="71" cy="38" r="8" />
        </g>
      {:else if person.hair === 'afro'}
        <path d="M26 46Q26 24 50 24Q74 24 74 46Q66 34 50 34Q34 34 26 46Z" fill={hair} />
      {:else if person.hair === 'crête'}
        <path d="M43 32L40 8L47 14L50 2L53 14L60 8L57 32Q50 28 43 32Z" fill={hair} />
      {:else if person.hair === 'chauve' && !hatOn}
        <path d="M40 30Q46 26 52 28" fill="none" stroke="#fff" stroke-width="3" opacity="0.7" />
      {/if}
      {#if person.hair === 'chignon' && !hatOn}
        <circle cx="50" cy="15" r="9" fill={hair} />
      {/if}
    {/if}

    {#if person.hat === 'casquette'}
      <path d="M25 40Q25 16 50 16Q75 16 75 40Z" fill="#3b46ff" />
      <path d="M50 38H88Q90 44 84 45H50Z" fill="#3b46ff" />
      <circle cx="50" cy="16" r="2.5" fill="#fff3e6" />
    {:else if person.hat === 'bonnet'}
      <path d="M25 42Q24 14 50 14Q76 14 75 42Z" fill="#ff7a2e" />
      <rect x="23" y="35" width="54" height="10" rx="5" fill="#ffd23d" />
      <circle cx="50" cy="11" r="6" fill="#fff3e6" />
    {:else if person.hat === 'chapeau'}
      <ellipse cx="50" cy="33" rx="35" ry="6.5" fill="#5b3a29" />
      <path d="M31 33Q30 10 50 10Q70 10 69 33Z" fill="#5b3a29" />
      <path d="M31 27Q50 31 69 27L69 32Q50 36 31 32Z" fill="#d01a3b" />
    {:else if person.hat === 'béret'}
      <ellipse cx="47" cy="26" rx="27" ry="9" fill="#8c1650" transform="rotate(-8 47 26)" />
      <path d="M49 16l2-5" fill="none" />
    {/if}
  </g>
</svg>

<style>
  .face {
    display: block;
    overflow: visible;
  }
</style>
