<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { createHostTransport, displayUrl, joinUrl } from '../lib/config';
  import { keepAwake } from '../lib/fx/haptics';
  import { playFx, unlockAudio } from '../lib/fx/sound';
  import { CATALOG } from '../lib/games/catalog';
  import type { GameId, GameResult } from '../lib/games/types';
  import { VIEWS } from '../lib/games/views';
  import { isRoomCode, randomRoomCode } from '../lib/random';
  import { HostRoom } from '../lib/room/host-room';
  import { browserTimers } from '../lib/room/scheduler';
  import { readJson, readStorage, STORAGE_KEYS, writeJson, writeStorage } from '../lib/storage';
  import Countdown from './Countdown.svelte';
  import Header from './Header.svelte';
  import Lobby from './Lobby.svelte';
  import Menu from './Menu.svelte';
  import PauseOverlay from './PauseOverlay.svelte';
  import ResultOverlay from './ResultOverlay.svelte';
  import Rules from './Rules.svelte';
  import Toast from './Toast.svelte';

  const storedCode = readStorage(STORAGE_KEYS.room) ?? '';
  let code = $state(isRoomCode(storedCode) ? storedCode : randomRoomCode());
  let network = $state<'connecting' | 'ready' | 'error'>('connecting');
  let soundOn = $state(false);
  let version = $state(0);

  const room = new HostRoom({
    timers: browserTimers,
    catalog: CATALOG,
    onChange: () => version++,
    trophies: {
      load: (name) => readJson<Record<string, number>>(STORAGE_KEYS.trophies, {})[name.toLowerCase()] ?? 0,
      save: (name, count) => {
        const all = readJson<Record<string, number>>(STORAGE_KEYS.trophies, {});
        all[name.toLowerCase()] = count;
        writeJson(STORAGE_KEYS.trophies, all);
      },
    },
  });

  const snapshot = $derived.by(() => {
    void version;
    return room.tv();
  });
  const stage = $derived(snapshot.stage);
  const stageKey = $derived(
    stage.kind === 'playing' || stage.kind === 'result'
      ? `game-${stage.game}`
      : stage.kind === 'lobby' || stage.kind === 'menu'
        ? stage.kind
        : `${stage.kind}-${stage.game}`,
  );

  let lastFx = 0;
  $effect(() => {
    const events = snapshot.fx;
    for (const event of events) {
      if (event.seq > lastFx) playFx(event.kind);
    }
    lastFx = events[events.length - 1]?.seq ?? lastFx;
  });

  let record = $state<{ best: number; beaten: boolean } | null>(null);
  let recorded: GameResult | null = null;
  $effect(() => {
    if (stage.kind !== 'result' || stage.result === recorded) return;
    recorded = stage.result;
    record = updateRecord(stage.game, stage.result);
  });

  function updateRecord(game: GameId, result: GameResult): { best: number; beaten: boolean } | null {
    const score = result.coop?.score;
    if (game !== 'sketch' || score === undefined) return null;
    const all = readJson<Record<string, number>>(STORAGE_KEYS.records, {});
    const previous = all[game] ?? 0;
    const beaten = score > previous;
    if (beaten) {
      all[game] = score;
      writeJson(STORAGE_KEYS.records, all);
    }
    return { best: Math.max(previous, score), beaten };
  }

  onMount(() => {
    const transport = createHostTransport();
    let retry: ReturnType<typeof setTimeout> | undefined;
    let taken = 0;

    const listen = () => {
      network = 'connecting';
      transport.listen(code, {
        onReady: () => {
          network = 'ready';
          taken = 0;
          writeStorage(STORAGE_KEYS.room, code);
        },
        onLink: (link) => room.accept(link),
        onError: (error) => {
          network = 'error';
          if (error === 'taken' && ++taken >= 4) {
            code = randomRoomCode();
            taken = 0;
          }
          retry = setTimeout(listen, 2500);
        },
      });
    };
    listen();

    const unlock = async () => {
      soundOn = await unlockAudio();
    };
    window.addEventListener('keydown', unlock);
    window.addEventListener('pointerdown', unlock);
    let release: (() => void) | undefined;
    void keepAwake().then((stop) => (release = stop));

    return () => {
      clearTimeout(retry);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('pointerdown', unlock);
      release?.();
      transport.dispose();
      room.dispose();
    };
  });
</script>

<div class="tv">
  <Header seats={snapshot.seats} {code} {network} {soundOn} />
  <main>
    {#key stageKey}
      <div class="stage" in:fade={{ duration: 350, delay: 150 }} out:fade={{ duration: 150 }}>
        {#if stage.kind === 'lobby'}
          <Lobby seats={snapshot.seats} {code} url={joinUrl(code)} host={displayUrl()} ready={network === 'ready'} />
        {:else if stage.kind === 'menu'}
          <Menu />
        {:else if stage.kind === 'rules'}
          <Rules game={stage.game} ready={stage.ready} seats={snapshot.seats} />
        {:else if stage.kind === 'countdown'}
          <Countdown game={stage.game} until={stage.until} />
        {:else if stage.view}
          {@const GameTv = VIEWS[stage.game].Tv}
          <GameTv view={stage.view} seats={snapshot.seats} />
        {/if}
      </div>
    {/key}
    {#if stage.kind === 'playing' && (stage.waitingFor.length || stage.resumeAt)}
      <PauseOverlay waitingFor={stage.waitingFor} resumeAt={stage.resumeAt} />
    {/if}
    {#if stage.kind === 'result'}
      <ResultOverlay game={stage.game} result={stage.result} seats={snapshot.seats} {record} />
    {/if}
  </main>
  <Toast toast={snapshot.toast} />
</div>

<style>
  .tv {
    position: relative;
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    gap: 1.2em;
    padding: 1.6em 2.4em 1.8em;
    font-size: min(1.25vw, 2.25vh);
    overflow: hidden;
  }

  main {
    position: relative;
    flex: 1;
    min-height: 0;
    display: grid;
  }

  .stage {
    grid-area: 1 / 1;
    min-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
