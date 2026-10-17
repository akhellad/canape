<script lang="ts">
  let { size = '100%', animated = false }: { size?: string; animated?: boolean } = $props();
  const arch = 'M20 360V120C20 -10 190 -20 200 90C210 -20 380 -10 380 120V360Z';
</script>

<svg class="scene" class:animated viewBox="20 20 360 340" width={size} height={size} aria-hidden="true">
  <rect x="0" y="0" width="400" height="400" fill="#fbf6ec" />
  <path d={arch} fill="#8b5a4a" transform="translate(200 380) scale(1.1) translate(-200 -360)" />
  <path d={arch} fill="#6f95d2" transform="translate(200 380) scale(.96) translate(-200 -360)" />
  <path d={arch} fill="#4e9a6b" transform="translate(200 380) scale(.82) translate(-200 -360)" />
  <path d={arch} fill="#f4db7c" transform="translate(200 380) scale(.68) translate(-200 -360)" />
  <g stroke="#1d1612" stroke-width="6" stroke-linejoin="round" stroke-linecap="round">
    <g class="heart">
      <path
        d="M0 10C-14 0 -16 -10 -9 -14C-4 -17 0 -13 0 -10C0 -13 4 -17 9 -14C16 -10 14 0 0 10Z"
        fill="#e9465a"
        stroke-width="3.5"
        transform="translate(200 112) scale(1.3)"
      />
    </g>
    <g transform="translate(0 15)">
      <rect x="70" y="210" width="260" height="100" rx="32" fill="#d2555a" />
      <rect x="46" y="246" width="54" height="84" rx="24" fill="#c0434f" />
      <rect x="300" y="246" width="54" height="84" rx="24" fill="#c0434f" />
      <g class="lean-left">
        <path d="M126 305V172C126 118 208 116 211 168V305Z" fill="#f08a2c" />
        <path d="M139 165q9 8 18 0M165 163q9 8 18 0" fill="none" stroke-width="4.5" />
        <ellipse cx="149" cy="182" rx="7" ry="4" fill="#e2574c" stroke="none" opacity=".55" />
      </g>
      <g class="lean-right">
        <path d="M189 305V178C190 126 279 124 281 176V305Z" fill="#f7bc6e" />
        <path d="M206 170q9 8 18 0M236 168q9 8 18 0" fill="none" stroke-width="4.5" />
        <ellipse cx="258" cy="186" rx="7" ry="4" fill="#e2574c" stroke="none" opacity=".55" />
      </g>
      <rect x="150" y="205" width="116" height="26" rx="13" fill="#f08a2c" />
      <rect x="256" y="198" width="28" height="40" rx="13" fill="#f08a2c" />
      <path d="M262 211h12M262 225h12" fill="none" stroke-width="4" />
      <rect x="134" y="238" width="128" height="26" rx="13" fill="#f7bc6e" />
      <rect x="116" y="231" width="28" height="40" rx="13" fill="#f7bc6e" />
      <path d="M126 244h12M126 258h12" fill="none" stroke-width="4" />
      <rect x="84" y="290" width="232" height="40" rx="14" fill="#e36d72" />
      <rect x="100" y="330" width="14" height="14" rx="3" fill="#5b3a2e" />
      <rect x="286" y="330" width="14" height="14" rx="3" fill="#5b3a2e" />
    </g>
  </g>
</svg>

<style>
  .scene {
    display: block;
  }

  .animated .heart {
    animation: beat 1.6s ease-in-out infinite;
    transform-origin: 200px 112px;
    transform-box: view-box;
  }

  @keyframes beat {
    0%,
    100% {
      transform: scale(1);
    }
    12% {
      transform: scale(1.25);
    }
    24% {
      transform: scale(1);
    }
    36% {
      transform: scale(1.18);
    }
    50% {
      transform: scale(1);
    }
  }
</style>
