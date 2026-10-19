<script lang="ts">
  import { fly } from 'svelte/transition';
  import { backOut } from 'svelte/easing';
  import type { Seats } from '../../room/protocol';
  import Blob from '../../ui/Blob.svelte';
  import { slap } from '../../ui/motion';
  import Timer from '../../ui/Timer.svelte';
  import { other, type Slot } from '../types';
  import type { TabooTv } from './logic';

  let { view, seats }: { view: TabooTv; seats: Seats } = $props();
  const name = (slot: Slot) => seats[slot]?.name ?? `Joueur ${slot + 1}`;
  const STAMPS = { found: 'Trouvé', pass: 'Passé', buzz: 'Buzz !' };
  const progress = $derived(Math.min(1, view.score / view.goal));
</script>

<section class="taboo">
  <aside class="left">
    <span class="sticker round">Manche {view.turn + 1} / {view.turns}</span>
    <div class="duo">
      <div class="role p{view.describer}">
        <Blob slot={view.describer} size="3.6em" bounce={view.phase === 'play'} mood="wink" />
        <span><b class="name-tag">{name(view.describer)}</b> fait deviner</span>
      </div>
      <div class="role p{other(view.describer)}">
        <Blob slot={other(view.describer)} size="3.6em" mood={view.phase === 'play' ? 'wow' : 'happy'} />
        <span><b class="name-tag">{name(other(view.describer))}</b> devine</span>
      </div>
    </div>
    <div class="total paper">
      <span>Score d’équipe</span>
      {#key view.score}<b in:slap>{view.score}</b>{/key}
      <div class="bar"><span style:width={`${progress * 100}%`}></span></div>
      <span class="goal">Objectif : {view.goal} mots</span>
    </div>
  </aside>

  <div class="main">
    {#if view.phase === 'ready'}
      <div class="announce" in:slap>
        <h2 class="pop">À <span class="name-tag p{view.describer}">{name(view.describer)}</span> de faire deviner !</h2>
        <p class="sticker">Appuie sur « C’est parti » quand tu es prêt</p>
      </div>
    {:else}
      <div class="clock">
        <Timer remaining={view.remaining} total={view.total} />
        {#key view.turnFound}<span class="found" in:slap>{view.turnFound} trouvé{view.turnFound > 1 ? 's' : ''}</span>{/key}
      </div>
      {#if view.phase === 'summary'}
        <h2 class="pop over" in:slap>Temps écoulé !</h2>
      {/if}
      <ul class="pile">
        {#each [...view.resolved].reverse().slice(0, 8) as item, index (item.seq)}
          <li
            class="card {item.outcome}"
            style:--tilt={`${(item.seq % 5) - 2}deg`}
            style:opacity={1 - index * 0.05}
            in:fly={{ y: -80, duration: 450, easing: backOut }}
          >
            <span class="word">{item.word}</span>
            <span class="stamp">{STAMPS[item.outcome]}</span>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</section>

<style>
  .taboo {
    width: 100%;
    max-width: 84em;
    height: 100%;
    display: grid;
    grid-template-columns: 22em 1fr;
    gap: 3em;
    align-items: center;
  }

  .left {
    display: flex;
    flex-direction: column;
    gap: 1.6em;
    align-items: flex-start;
  }

  .round {
    background: var(--cream);
    font-size: 1em;
  }

  .duo {
    display: flex;
    flex-direction: column;
    gap: 1em;
  }

  .role {
    display: flex;
    align-items: center;
    gap: 0.8em;
    font-weight: 800;
    font-size: 1.3em;
  }

  .role b {
    font-family: var(--display);
    font-weight: 400;
    font-size: 1.2em;
  }

  .total {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.3em;
    padding: 1em 1.2em;
    transform: rotate(-1.5deg);
    font-weight: 800;
  }

  .total b {
    font-family: var(--display);
    font-weight: 400;
    font-size: 3.6em;
    line-height: 1;
  }

  .bar {
    height: 1em;
    border-radius: 999px;
    border: 0.12em solid var(--ink);
    background: var(--paper-2);
    overflow: hidden;
  }

  .bar span {
    display: block;
    height: 100%;
    background: var(--mint);
    border-right: 0.12em solid var(--ink);
    transition: width 0.5s var(--spring);
  }

  .goal {
    color: var(--ink-2);
    font-size: 0.9em;
  }

  .main {
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.6em;
  }

  .announce {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.2em;
    text-align: center;
  }

  .announce h2 {
    font-size: 4em;
  }

  .announce .sticker {
    font-size: 1.2em;
    background: var(--cream);
    animation: wiggle 1.2s ease-in-out infinite;
  }

  .clock {
    display: flex;
    align-items: center;
    gap: 1.4em;
    font-size: 1.5em;
  }

  .found {
    font-family: var(--display);
    font-size: 1.8em;
  }

  .over {
    font-size: 3.4em;
    --tilt: -3deg;
  }

  .pile {
    list-style: none;
    margin: 0;
    padding: 0;
    width: 100%;
    max-width: 40em;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1em 1.4em;
  }

  .card {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 4.2em;
    padding: 0.6em 1em;
    border-radius: 0.9em;
    border: 0.15em solid var(--ink);
    background: var(--cream);
    box-shadow: var(--shadow-sm);
    transform: rotate(var(--tilt));
    font-family: var(--display);
    font-size: 1.5em;
    text-align: center;
  }

  .card.found {
    background: var(--mint);
  }

  .card.buzz {
    background: var(--blush);
  }

  .card.pass .word {
    opacity: 0.6;
    text-decoration: line-through;
  }

  .stamp {
    position: absolute;
    top: -0.75em;
    right: -0.5em;
    padding: 0.05em 0.5em 0.1em;
    border-radius: 0.3em;
    border: 0.1em solid var(--ink);
    background: var(--ink);
    color: var(--cream);
    font-family: var(--body);
    font-weight: 800;
    font-size: 0.5em;
    text-transform: uppercase;
    transform: rotate(8deg);
  }

  .buzz .stamp {
    background: var(--cherry);
  }
</style>
