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
    {:else if game === 'taboo'}
      <g class="tool">
        <path d="M14 20h72a6 6 0 0 1 6 6v36a6 6 0 0 1-6 6H40L24 82V68H14a6 6 0 0 1-6-6V26a6 6 0 0 1 6-6Z" fill="#fff3e6" />
        <path d="M28 44h44" stroke="#2a0c1d" stroke-width="5" />
        <path d="M30 34 70 56M70 34 30 56" stroke="#e8213f" stroke-width="7" />
      </g>
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
    {:else if game === 'reversi'}
      <rect x="8" y="8" width="84" height="84" rx="10" fill="#19b48a" />
      <path d="M50 8v84M8 50h84" stroke-width="3" />
      <circle cx="29" cy="29" r="13" fill="#3b46ff" stroke-width="4" />
      <circle cx="71" cy="71" r="13" fill="#3b46ff" stroke-width="4" />
      <circle cx="29" cy="71" r="13" fill="#ffd23d" stroke-width="4" />
      <g class="flip"><circle cx="71" cy="29" r="13" fill="#ffd23d" stroke-width="4" /></g>
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
    {:else if game === 'mastermind'}
      <rect x="8" y="22" width="84" height="56" rx="10" fill="#4a1534" />
      {#each ['#d01a3b', '#ffd23d', '#2fd1a5', '#3b46ff'] as color, index (color)}
        <circle
          class="tool"
          style:animation-delay={`${index * -0.3}s`}
          cx={22 + index * 16}
          cy="44"
          r="7"
          fill={color}
          stroke-width="3.5"
        />
      {/each}
      <circle cx="82" cy="38" r="3.5" fill="#fff3e6" stroke-width="2" />
      <circle cx="82" cy="50" r="3.5" fill="none" stroke="#fff3e6" stroke-width="2" />
      <path d="M18 64h64" stroke="#fff3e6" stroke-width="3" stroke-dasharray="6 6" />
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
    {:else if game === 'yams'}
      <g class="tool">
        <rect x="10" y="30" width="44" height="44" rx="10" fill="#fff3e6" transform="rotate(-12 32 52)" />
        <g transform="rotate(-12 32 52)" fill="#2a0c1d" stroke="none">
          <circle cx="22" cy="42" r="4.5" /><circle cx="32" cy="52" r="4.5" /><circle cx="42" cy="62" r="4.5" />
        </g>
      </g>
      <g class="tool late">
        <rect x="48" y="18" width="42" height="42" rx="10" fill="#ffd23d" transform="rotate(14 69 39)" />
        <g transform="rotate(14 69 39)" fill="#2a0c1d" stroke="none">
          <circle cx="59" cy="29" r="4.5" /><circle cx="79" cy="29" r="4.5" /><circle cx="59" cy="49" r="4.5" /><circle
            cx="79"
            cy="49"
            r="4.5"
          />
        </g>
      </g>
    {:else if game === 'memory'}
      <rect x="10" y="16" width="38" height="56" rx="7" fill="#ff5c9d" transform="rotate(-10 29 44)" />
      <path d={heart} transform="translate(28 44) rotate(-10) scale(0.8)" fill="#fff3e6" stroke-width="4" />
      <g class="flip">
        <rect x="52" y="24" width="38" height="56" rx="7" fill="#fff3e6" transform="rotate(8 71 52)" />
        <path d="M71 36l5 10 11 1-8 8 2 11-10-6-10 6 2-11-8-8 11-1Z" fill="#ffd23d" stroke-width="3.5" transform="rotate(8 71 52)" />
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

  .animated .flip {
    transform-box: fill-box;
    transform-origin: center;
    animation: art-flip 2.4s ease-in-out infinite;
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

  @keyframes art-flip {
    0%,
    40% {
      scale: 1 1;
    }
    50% {
      scale: 0.05 1;
    }
    60%,
    100% {
      scale: 1 1;
    }
  }
</style>
