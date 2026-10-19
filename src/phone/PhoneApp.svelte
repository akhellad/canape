<script lang="ts">
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import { createClientTransport } from '../lib/config';
  import { keepAwake, vibrate } from '../lib/fx/haptics';
  import { CATALOG } from '../lib/games/catalog';
  import { other, type GameId } from '../lib/games/types';
  import { VIEWS } from '../lib/games/views';
  import { randomId } from '../lib/random';
  import { PlayerClient } from '../lib/room/player-client';
  import type { RoomCommand } from '../lib/room/protocol';
  import { browserTimers } from '../lib/room/scheduler';
  import { readStorage, STORAGE_KEYS, writeStorage } from '../lib/storage';
  import { sanitizeName } from '../lib/text';
  import Blob from '../lib/ui/Blob.svelte';
  import GameArt from '../lib/ui/GameArt.svelte';
  import GameSheet from './GameSheet.svelte';
  import Join from './Join.svelte';
  import PhoneMenu from './PhoneMenu.svelte';
  import PhoneResult from './PhoneResult.svelte';
  import PhoneRules from './PhoneRules.svelte';
  import StatusScreen from './StatusScreen.svelte';
  import TopBar from './TopBar.svelte';

  const GUARD_MS = 350;

  let { code }: { code: string } = $props();

  let name = $state(readStorage(STORAGE_KEYS.name) ?? '');
  let client = $state.raw<PlayerClient | null>(null);
  let version = $state(0);
  let menuOpen = $state(false);
  let guarded = $state(false);
  let release: (() => void) | undefined;

  function clientId(): string {
    let id = readStorage(STORAGE_KEYS.clientId, 'session');
    if (!id || id.length < 8) {
      id = randomId();
      writeStorage(STORAGE_KEYS.clientId, id, 'session');
    }
    return id;
  }

  function join(value: string) {
    const clean = sanitizeName(value, '');
    if (!clean) return;
    name = clean;
    writeStorage(STORAGE_KEYS.name, clean);
    const instance = new PlayerClient({
      transport: createClientTransport(),
      timers: browserTimers,
      room: code,
      clientId: clientId(),
      name: clean,
      onChange: () => version++,
    });
    client = instance;
    instance.start();
    void keepAwake().then((stop) => (release = stop));
  }

  const status = $derived.by(() => {
    void version;
    return client?.status ?? 'connecting';
  });
  const screen = $derived.by(() => {
    void version;
    return client?.screen ?? null;
  });

  const guardKey = $derived.by(() => {
    if (!screen) return '';
    const game = 'game' in screen ? screen.game : '';
    const detail = screen.kind === 'playing' ? ((screen.view as { guard?: string } | null)?.guard ?? '') : '';
    return `${screen.kind}:${game}:${detail}`;
  });

  $effect(() => {
    void guardKey;
    guarded = true;
    const timer = setTimeout(() => (guarded = false), GUARD_MS);
    return () => clearTimeout(timer);
  });

  let lastFx = -1;
  $effect(() => {
    const events = screen?.fx ?? [];
    const latest = events[events.length - 1]?.seq ?? 0;
    if (lastFx >= 0) {
      const fresh = events.filter((event) => event.seq > lastFx);
      if (fresh.length) vibrate(fresh[fresh.length - 1].kind);
    }
    lastFx = Math.max(lastFx, latest);
  });

  $effect(() => {
    if (screen?.kind !== 'playing') menuOpen = false;
  });

  function command(cmd: RoomCommand) {
    client?.command(cmd);
  }

  function act(action: unknown) {
    client?.act(action);
  }

  onMount(() => {
    const wake = () => {
      if (document.visibilityState === 'visible') client?.wake();
    };
    document.addEventListener('visibilitychange', wake);
    window.addEventListener('online', wake);
    return () => {
      document.removeEventListener('visibilitychange', wake);
      window.removeEventListener('online', wake);
      release?.();
      client?.stop();
    };
  });

  const screenKey = $derived(
    screen ? (screen.kind === 'result' ? `playing-${screen.game}` : `${screen.kind}-${'game' in screen ? screen.game : ''}`) : '',
  );
</script>

{#if !client}
  <Join {name} {code} onjoin={join} />
{:else if !screen || status === 'full' || status === 'outdated'}
  <StatusScreen {status} onretry={() => client?.retry()} />
{:else}
  <div class="phone p{screen.slot}" class:guarded={guarded || status !== 'online'}>
    <TopBar
      slot={screen.slot}
      name={screen.seats[screen.slot]?.name ?? name}
      onmenu={screen.kind === 'playing' ? () => (menuOpen = true) : undefined}
    />
    {#if status !== 'online'}
      <div class="banner">Reconnexion à la télé…</div>
    {/if}
    {#key screenKey}
      <main in:fly={{ y: 24, duration: 280, delay: 60 }}>
        {#if screen.kind === 'lobby'}
          <div class="center">
            <Blob slot={screen.slot} size="5rem" bounce />
            <h1 class="pop">Salut {screen.seats[screen.slot]?.name ?? name} !</h1>
            <p>
              On attend {screen.seats[other(screen.slot)]?.name ?? 'ton ou ta partenaire'}. Scannez le QR code de la télé avec l’autre
              téléphone.
            </p>
          </div>
        {:else if screen.kind === 'menu'}
          <PhoneMenu onpick={(game: GameId) => command({ op: 'pick', game })} />
        {:else if screen.kind === 'rules'}
          <PhoneRules
            game={screen.game}
            ready={screen.ready}
            slot={screen.slot}
            seats={screen.seats}
            onready={() => command({ op: 'ready' })}
            onback={() => command({ op: 'back' })}
          />
        {:else if screen.kind === 'countdown'}
          <div class="center">
            <div class="look" style:--accent={CATALOG[screen.game].accent}><GameArt game={screen.game} size="6rem" animated /></div>
            <h1 class="pop">Regarde la télé !</h1>
            <p>{CATALOG[screen.game].title} commence…</p>
          </div>
        {:else if screen.kind === 'playing'}
          {@const GamePhone = VIEWS[screen.game].Phone}
          <GamePhone view={screen.view} seats={screen.seats} me={screen.slot} {act} />
          {#if screen.paused}
            <div class="paused paper">Partie en pause : on attend que tout le monde soit connecté.</div>
          {/if}
        {:else if screen.kind === 'result'}
          <PhoneResult
            result={screen.result}
            slot={screen.slot}
            onagain={() => command({ op: 'again' })}
            onmenu={() => command({ op: 'menu' })}
          />
        {/if}
      </main>
    {/key}
    {#if menuOpen && screen.kind === 'playing'}
      <GameSheet game={screen.game} onclose={() => (menuOpen = false)} onquit={() => command({ op: 'quit' })} />
    {/if}
  </div>
{/if}

<style>
  .phone {
    min-height: 100vh;
    min-height: 100dvh;
    max-width: 34rem;
    margin: 0 auto;
    padding: 0.8rem 1rem calc(1rem + env(safe-area-inset-bottom));
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
  }

  main {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
    min-height: 0;
  }

  .banner {
    padding: 0.5rem 0.8rem;
    border-radius: 0.8rem;
    border: 2px solid var(--ink);
    background: var(--cherry);
    color: var(--cream);
    font-weight: 800;
    text-align: center;
  }

  .center {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    text-align: center;
  }

  .center h1 {
    font-size: 2.1rem;
  }

  .center p {
    color: var(--ink-2);
    font-weight: 600;
    line-height: 1.45;
    max-width: 22rem;
  }

  .look {
    padding: 1rem;
    border-radius: 1.4rem;
    border: 3px solid var(--ink);
    background: var(--accent, var(--butter));
    box-shadow: var(--shadow);
    animation: wiggle 0.8s ease-in-out infinite;
  }

  .paused {
    position: fixed;
    left: 1rem;
    right: 1rem;
    bottom: calc(1rem + env(safe-area-inset-bottom));
    padding: 0.9rem 1rem;
    text-align: center;
    font-weight: 800;
    z-index: 30;
  }
</style>
