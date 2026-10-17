<script lang="ts">
  import { ICONS, type IconName } from '../icons/icons';

  let { name, size = '1em', label }: { name: IconName; size?: string; label?: string } = $props();
</script>

<svg
  class="icon"
  viewBox="0 0 32 32"
  width={size}
  height={size}
  role={label ? 'img' : undefined}
  aria-label={label}
  aria-hidden={label ? undefined : 'true'}
>
  {@html ICONS[name]}
</svg>

<style>
  .icon {
    display: inline-block;
    flex-shrink: 0;
    vertical-align: middle;
  }
</style>
