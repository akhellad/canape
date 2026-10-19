<script lang="ts">
  let { fast = false }: { fast?: boolean } = $props();
</script>

<div class="rays" class:fast aria-hidden="true"><div class="wheel"></div></div>

<style>
  .rays {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    z-index: 0;
    mask-image: radial-gradient(closest-side, #000 30%, transparent 100%);
  }

  .wheel {
    position: absolute;
    left: 50%;
    top: 55%;
    width: 220vmax;
    height: 220vmax;
    margin: -110vmax 0 0 -110vmax;
    background: repeating-conic-gradient(from 0deg, rgba(255, 196, 220, 0.38) 0deg 9deg, transparent 9deg 18deg);
    animation: spin 140s linear infinite;
    transition: opacity 0.6s ease;
  }

  .fast .wheel {
    animation-duration: 14s;
  }
</style>
