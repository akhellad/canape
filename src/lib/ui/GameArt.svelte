<script lang="ts">
  import type { GameId } from '../games/types';

  let { game, size = '4em', animated = false }: { game: GameId; size?: string; animated?: boolean } = $props();
  const heart = 'M0 12C-17 0 -19 -12 -11 -17C-5 -20 0 -15 0 -12C0 -15 5 -20 11 -17C19 -12 17 0 0 12Z';
</script>

<svg class="art" class:animated viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
  <g stroke="#2a0c1d" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
    {#if game === 'sketch'}
      <path class="squiggle" d="M14 74c8-14 16 6 24-8s14 4 22-8 12 2 18-6" fill="none" stroke="#e8213f" stroke-width="6" />
      <g class="tool" transform="rotate(38 58 44)">
        <rect x="50" y="8" width="18" height="58" rx="3" fill="#ffd23d" />
        <rect x="50" y="8" width="18" height="12" rx="3" fill="#ff5c9d" />
        <path d="M50 66 59 84 68 66Z" fill="#ffe9d6" />
        <path d="M56 78 59 84 62 78Z" fill="#2a0c1d" stroke-width="2" />
      </g>
    {:else if game === 'telephone'}
      <rect x="8" y="18" width="40" height="50" rx="5" fill="#fff3e6" transform="rotate(-8 28 43)" />
      <path d="M16 46c5-9 10 4 15-4s8 3 12-3" fill="none" stroke="#3b46ff" stroke-width="4" transform="rotate(-8 28 43)" />
      <rect x="52" y="30" width="40" height="50" rx="5" fill="#ffd23d" transform="rotate(7 72 55)" />
      <text
        x="72"
        y="64"
        text-anchor="middle"
        font-family="Shrikhand, serif"
        font-size="26"
        fill="#2a0c1d"
        stroke="none"
        transform="rotate(7 72 55)">?!</text
      >
      <path class="tool" d="M40 14q14-10 26 4" fill="none" stroke-width="4" />
      <path class="tool" d="M60 12l7 6-9 3" fill="none" stroke-width="4" />
    {:else if game === 'crossword'}
      <g transform="rotate(-6 50 50)">
        {#each [0, 1, 2, 3] as row (row)}
          {#each [0, 1, 2, 3] as col (col)}
            {@const black = [3, 6, 9, 12].includes(row * 4 + col)}
            <rect x={14 + col * 18} y={14 + row * 18} width="18" height="18" fill={black ? '#2a0c1d' : '#fff3e6'} stroke-width="3" />
          {/each}
        {/each}
        <text x="23" y="29" text-anchor="middle" font-family="Shrikhand, serif" font-size="13" fill="#3b46ff" stroke="none">A</text>
        <text x="41" y="47" text-anchor="middle" font-family="Shrikhand, serif" font-size="13" fill="#3b46ff" stroke="none">M</text>
        <text x="59" y="65" text-anchor="middle" font-family="Shrikhand, serif" font-size="13" fill="#3b46ff" stroke="none">I</text>
      </g>
      <g class="tool" transform="translate(4 -8) rotate(-40 74 60)">
        <rect x="68" y="30" width="12" height="44" rx="2" fill="#ff5c9d" stroke-width="4" />
        <path d="M68 74l6 12 6-12Z" fill="#ffe9d6" stroke-width="4" />
      </g>
    {:else if game === 'bluff'}
      <g class="tool">
        <path d="M16 18h60a8 8 0 0 1 8 8v34a8 8 0 0 1-8 8H44L28 82V68H16a8 8 0 0 1-8-8V26a8 8 0 0 1 8-8Z" fill="#fff3e6" />
        <path d="M22 34h44M22 46h34" stroke-width="4" />
      </g>
      <path class="tool late" d="M58 58q10-16 24-8q8 6 4 16q-4 10-18 8q-8-2-10-16Z" fill="#ff7a2e" />
      <path d="M64 62q4 4 10 2M68 56v0M78 58v0" fill="none" stroke-width="4" />
    {:else if game === 'heart'}
      <path class="tool" d={heart} transform="translate(50 52) scale(2.6)" fill="#e8213f" />
      <text
        x="50"
        y="60"
        text-anchor="middle"
        font-family="Shrikhand, serif"
        font-size="30"
        fill="#fff3e6"
        stroke="#2a0c1d"
        stroke-width="3"
        paint-order="stroke">?</text
      >
    {:else if game === 'memories'}
      <g transform="rotate(-8 50 50)">
        <rect x="18" y="12" width="56" height="66" rx="4" fill="#fff3e6" />
        <rect x="25" y="19" width="42" height="40" fill="#b9a6ff" stroke-width="3" />
        <path d="M25 52l12-12 10 9 8-7 12 11" fill="none" stroke-width="3" />
      </g>
      <path class="tool" d={heart} transform="translate(72 72) scale(1.1) rotate(12)" fill="#e8213f" />
    {:else if game === 'sweet'}
      <rect x="10" y="26" width="80" height="54" rx="6" fill="#fff3e6" />
      <path d="M10 30l40 28 40-28" fill="none" />
      <path class="tool" d={heart} transform="translate(50 30) scale(1.3)" fill="#ff5c9d" />
    {:else if game === 'wavelength'}
      <path d="M10 76A40 40 0 0 1 90 76Z" fill="#fff3e6" />
      <path d="M50 76L66 42A40 40 0 0 1 78 54Z" fill="#e8213f" stroke-width="3" />
      <path class="tool" d="M50 76L30 44" stroke-width="6" />
      <circle cx="50" cy="76" r="6" fill="#3b46ff" />
    {:else if game === 'quiz'}
      <g class="tool">
        <path d="M18 16h64a8 8 0 0 1 8 8v40a8 8 0 0 1-8 8H46L30 86V72H18a8 8 0 0 1-8-8V24a8 8 0 0 1 8-8Z" fill="#3b46ff" />
        <text
          x="50"
          y="62"
          text-anchor="middle"
          font-family="Shrikhand, serif"
          font-size="46"
          fill="#ffd23d"
          stroke="#2a0c1d"
          stroke-width="3"
          paint-order="stroke">?</text
        >
      </g>
    {:else if game === 'couple'}
      <path class="tool" d={heart} transform="translate(38 46) scale(1.7) rotate(-12)" fill="#3b46ff" />
      <path class="tool late" d={heart} transform="translate(62 56) scale(1.7) rotate(12)" fill="#ffd23d" />
    {:else if game === 'connect4'}
      <rect x="10" y="22" width="80" height="66" rx="8" fill="#3b46ff" />
      {#each [0, 1, 2] as row (row)}
        {#each [0, 1, 2] as col (col)}
          {@const filled = row * 3 + col}
          <circle
            cx={28 + col * 22}
            cy={40 + row * 20}
            r="7.5"
            fill={[0, 2, 4, 7].includes(filled) ? '#ffd23d' : [5, 6, 8].includes(filled) ? '#ff5c9d' : '#ffe9d6'}
            stroke-width="3.5"
          />
        {/each}
      {/each}
      <circle class="tool" cx="50" cy="11" r="8" fill="#ffd23d" stroke-width="3.5" />
    {:else if game === 'battleship'}
      <g class="tool">
        <path d="M24 30h10v16H24Z" fill="#ffe9d6" />
        <path d="M40 22h14v24H40Z" fill="#ffe9d6" />
        <path d="M58 34h10v12H58Z" fill="#ffe9d6" />
        <path d="M10 46h80l-10 20H22Z" fill="#e8213f" />
      </g>
      <path d="M6 76c8-6 14 6 22 0s14 6 22 0 14 6 22 0 14 6 22 0" fill="none" stroke="#3b46ff" stroke-width="6" />
      <path d="M14 88c8-6 14 6 22 0s14 6 22 0 14 6 22 0" fill="none" stroke="#3b46ff" stroke-width="5" />
    {:else if game === 'guesswho'}
      <rect x="14" y="10" width="56" height="74" rx="8" fill="#fff3e6" transform="rotate(-6 42 47)" />
      <g transform="rotate(-6 42 47)">
        <ellipse cx="42" cy="44" rx="15" ry="17" fill="#e9b48e" stroke-width="4" />
        <path d="M27 42q-2-20 15-20t15 20q-6-10-15-9t-15 9Z" fill="#6b3e26" stroke-width="4" />
        <path d="M24 84q0-16 18-16t18 16Z" fill="#3b46ff" stroke-width="4" />
      </g>
      <text
        class="tool"
        x="76"
        y="66"
        text-anchor="middle"
        font-family="Shrikhand, serif"
        font-size="44"
        fill="#ffd23d"
        stroke="#2a0c1d"
        stroke-width="3"
        paint-order="stroke">?</text
      >
    {:else if game === 'petitbac'}
      <rect x="16" y="8" width="62" height="80" rx="6" fill="#fff3e6" transform="rotate(5 47 48)" />
      <g transform="rotate(5 47 48)">
        <text x="30" y="46" font-family="Shrikhand, serif" font-size="34" fill="#d01a3b" stroke="none">B</text>
        <path d="M30 58h38M30 70h30" stroke-width="3.5" />
      </g>
      <g class="tool" transform="translate(0 -14) rotate(-40 74 60)">
        <rect x="68" y="30" width="12" height="44" rx="2" fill="#ff7a2e" stroke-width="4" />
        <path d="M68 74l6 12 6-12Z" fill="#ffe9d6" stroke-width="4" />
      </g>
    {/if}
  </g>
</svg>

<style>
  .art {
    display: block;
    flex-shrink: 0;
    overflow: visible;
  }

  .animated .tool {
    transform-box: fill-box;
    transform-origin: 50% 80%;
    animation: art-wobble 2.4s ease-in-out infinite;
  }

  .animated .late {
    animation-delay: -1.2s;
  }

  .animated .squiggle {
    stroke-dasharray: 120;
    animation: art-draw 2.4s ease-in-out infinite;
  }

  @keyframes art-wobble {
    0%,
    100% {
      translate: 0 0;
      rotate: 0deg;
    }
    50% {
      translate: 0 -4px;
      rotate: -5deg;
    }
  }

  @keyframes art-draw {
    from {
      stroke-dashoffset: 120;
    }
    60%,
    to {
      stroke-dashoffset: 0;
    }
  }
</style>
