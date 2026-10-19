<script lang="ts">
  import Scene from './Scene.svelte';

  let { size = '12em', text = true, animated = false }: { size?: string; text?: boolean; animated?: boolean } = $props();
  const uid = `arc-${Math.random().toString(36).slice(2, 9)}`;
  const heart = 'M0 10C-14 0 -16 -10 -9 -14C-4 -17 0 -13 0 -10C0 -13 4 -17 9 -14C16 -10 14 0 0 10Z';
</script>

<svg class="pastille" viewBox="0 0 640 640" width={size} height={size} role="img" aria-label="Les meme dans le canapé">
  <defs>
    <clipPath id={`${uid}-clip`}><circle cx="320" cy="320" r={text ? 208 : 280} /></clipPath>
    <path id={uid} d="M72 320A248 248 0 0 1 568 320" />
  </defs>
  <circle cx="320" cy="320" r="292" fill="#f08a2c" stroke="#1d1612" stroke-width="10" />
  <g clip-path={`url(#${uid}-clip)`}>
    <g transform={text ? 'translate(112 112)' : 'translate(40 40)'}>
      <Scene size={text ? '416' : '560'} {animated} />
    </g>
  </g>
  <circle cx="320" cy="320" r={text ? 208 : 280} fill="none" stroke="#1d1612" stroke-width="9" />
  {#if text}
    <text
      font-family="Shrikhand, serif"
      font-size="50"
      fill="#fbf6ec"
      stroke="#1d1612"
      stroke-width="10"
      stroke-linejoin="round"
      paint-order="stroke"
      letter-spacing="2"
      text-anchor="middle"
    >
      <textPath href={`#${uid}`} startOffset="50%">Les meme dans le canapé</textPath>
    </text>
    <g stroke="#1d1612" stroke-width="3" stroke-linejoin="round">
      <path d={heart} fill="#fbf6ec" transform="translate(320 562) scale(1.5)" />
      <path d={heart} fill="#f4db7c" transform="translate(212 540) rotate(25) scale(1.1)" />
      <path d={heart} fill="#f4db7c" transform="translate(428 540) rotate(-25) scale(1.1)" />
    </g>
  {/if}
</svg>

<style>
  .pastille {
    display: block;
    flex-shrink: 0;
  }
</style>
