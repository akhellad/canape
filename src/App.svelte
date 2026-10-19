<script lang="ts">
  import { roomParam } from './lib/config';
  import DevLauncher from './lib/dev/DevLauncher.svelte';
  import { isRoomCode } from './lib/random';
  import Home from './Home.svelte';
  import PhoneApp from './phone/PhoneApp.svelte';
  import TvApp from './tv/TvApp.svelte';

  const looksLikePhone = window.matchMedia('(max-width: 760px), (max-width: 950px) and (max-height: 480px)').matches;
  let forceTv = $state(false);
</script>

{#if roomParam !== null && isRoomCode(roomParam)}
  <PhoneApp code={roomParam} />
{:else if roomParam !== null && !forceTv}
  <Home invalid ontv={() => (forceTv = true)} />
{:else if looksLikePhone && !forceTv}
  <Home ontv={() => (forceTv = true)} />
{:else}
  <TvApp />
  {#if import.meta.env.DEV}
    <DevLauncher />
  {/if}
{/if}
