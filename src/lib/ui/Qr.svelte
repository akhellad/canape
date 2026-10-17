<script lang="ts">
  import QRCode from 'qrcode';

  let { value, label }: { value: string; label: string } = $props();
  let svg = $state('');

  $effect(() => {
    let cancelled = false;
    QRCode.toString(value, { type: 'svg', margin: 0, errorCorrectionLevel: 'M', color: { dark: '#1d1612', light: '#fbf6ec' } })
      .then((markup) => {
        if (!cancelled) svg = markup;
      })
      .catch(() => {
        if (!cancelled) svg = '';
      });
    return () => {
      cancelled = true;
    };
  });
</script>

<div class="qr" role="img" aria-label={label}>
  {@html svg}
</div>

<style>
  .qr {
    width: 100%;
    aspect-ratio: 1;
  }

  .qr :global(svg) {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
