<script lang="ts">
  import { fly } from 'svelte/transition';
  import { backOut } from 'svelte/easing';
  import type { Seats } from '../../room/protocol';
  import Blob from '../../ui/Blob.svelte';
  import { flipIn, slap } from '../../ui/motion';
  import Timer from '../../ui/Timer.svelte';
  import { SLOTS, type Slot } from '../types';
  import type { PetitBacTv } from './logic';

  let { view, seats }: { view: PetitBacTv; seats: Seats } = $props();
  const name = (slot: Slot) => seats[slot]?.name ?? `Joueur ${slot + 1}`;
</script>

<section class="bac">
  <aside class="side">
    {#key `${view.round}-${view.letter}`}
      <div class="letter" in:flipIn={{ duration: 800 }}>{view.letter}</div>
    {/key}
    <span class="sticker">Manche {view.round + 1} / {view.rounds}</span>
    {#if view.phase === 'write'}
      <Timer remaining={view.remaining} total={view.total} />
    {/if}
    <div class="scores">
      {#each SLOTS as slot (slot)}
        <div class="score p{slot}">
          <Blob {slot} size="1.6em" mood={view.done[slot] ? 'happy' : 'wink'} />
          <span>{name(slot)}</span>
          {#key view.scores[slot]}<b in:slap>{view.scores[slot]}</b>{/key}
        </div>
      {/each}
    </div>
  </aside>

  <div class="main">
    {#if view.phase === 'review' && view.grid}
      <div class="table paper">
        <div class="head">
          <span></span>
          {#each SLOTS as slot (slot)}<span class="col p{slot}"><b class="name-tag">{name(slot)}</b>{view.done[slot] ? ' ✓' : ''}</span
            >{/each}
        </div>
        {#each view.categories as category, index (category)}
          <div class="line" in:fly={{ x: -60, duration: 400, delay: index * 120, easing: backOut }}>
            <span class="category">{category}</span>
            {#each SLOTS as slot (slot)}
              {@const cell = view.grid[slot][index]}
              <span class="answer" class:invalid={!cell.valid} class:shared={cell.points === 5}>
                <span class="text">{cell.text || '—'}</span>
                {#if cell.vetoed}<em class="stamp no">Refusé</em>{:else if cell.points}<em class="stamp">+{cell.points}</em>{/if}
              </span>
            {/each}
          </div>
        {/each}
        {#if view.roundPoints}
          <div class="line total">
            <span class="category">Cette manche</span>
            {#each SLOTS as slot (slot)}<span class="answer"><b>{view.roundPoints[slot]} pts</b></span>{/each}
          </div>
        {/if}
      </div>
      <p class="hint sticker">Refusez les réponses douteuses de l’autre sur vos téléphones, puis validez</p>
    {:else}
      <h2 class="pop">Des mots en <span class="name-tag letter-tag">{view.letter}</span> !</h2>
      <ol class="cats">
        {#each view.categories as category, index (category)}
          <li class="paper" style:--tilt={`${index % 2 ? 1 : -1}deg`} in:slap={{ delay: 200 + index * 90, rotate: index % 2 ? 8 : -8 }}>
            {category}
          </li>
        {/each}
      </ol>
      <div class="progress">
        {#each SLOTS as slot (slot)}
          <div class="bar p{slot}">
            <span>{name(slot)}</span>
            <div class="track"><span style:width={`${(view.filled[slot] / view.categories.length) * 100}%`}></span></div>
            <b>{view.filled[slot]}/{view.categories.length}</b>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  {#if view.phase === 'stop'}
    <div class="stop" in:slap={{ rotate: -16 }}>
      <b>STOP !</b>
      <span>{view.stopper === null ? 'Temps écoulé' : `${name(view.stopper)} a tout rempli`}</span>
    </div>
  {/if}
</section>

<style>
  .bac {
    position: relative;
    width: 100%;
    max-width: 86em;
    height: 100%;
    display: grid;
    grid-template-columns: 16em 1fr;
    gap: 3em;
    align-items: center;
  }

  .side {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.2em;
  }

  .letter {
    width: 2.2em;
    height: 2.2em;
    display: grid;
    place-items: center;
    border-radius: 0.3em;
    border: 0.06em solid var(--ink);
    background: var(--butter);
    box-shadow: 0.07em 0.09em 0 var(--ink);
    font-family: var(--display);
    font-size: 5.4em;
    line-height: 1;
    transform: rotate(-4deg);
  }

  .side .sticker {
    background: var(--cream);
  }

  .scores {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.6em;
  }

  .score {
    display: flex;
    align-items: center;
    gap: 0.5em;
    padding: 0.4em 0.9em 0.4em 0.5em;
    border-radius: 999px;
    border: 0.14em solid var(--ink);
    background: var(--pc);
    color: var(--pc-ink);
    font-weight: 800;
    box-shadow: var(--shadow-sm);
  }

  .score b {
    margin-left: auto;
    font-family: var(--display);
    font-weight: 400;
    font-size: 1.6em;
  }

  .main {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.4em;
  }

  h2 {
    font-size: 3.4em;
  }

  .letter-tag {
    background: var(--butter);
    color: var(--ink);
  }

  .cats {
    list-style: none;
    margin: 0;
    padding: 0;
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1em 1.4em;
  }

  .cats li {
    padding: 0.7em 1em;
    font-family: var(--display);
    font-size: 1.6em;
    transform: rotate(var(--tilt));
  }

  .progress {
    width: 100%;
    display: flex;
    gap: 2em;
  }

  .bar {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 0.6em;
    font-weight: 800;
  }

  .track {
    flex: 1;
    height: 1em;
    border-radius: 999px;
    border: 0.12em solid var(--ink);
    background: var(--cream);
    overflow: hidden;
  }

  .track span {
    display: block;
    height: 100%;
    background: var(--pc);
    transition: width 0.4s var(--spring);
  }

  .table {
    width: 100%;
    padding: 0.8em 1.2em;
    display: flex;
    flex-direction: column;
  }

  .head,
  .line {
    display: grid;
    grid-template-columns: 1.1fr 1fr 1fr;
    gap: 1em;
    align-items: center;
    padding: 0.45em 0;
  }

  .line {
    border-top: 0.1em dashed rgba(42, 12, 29, 0.25);
  }

  .head {
    font-size: 1.2em;
  }

  .category {
    font-weight: 800;
    font-size: 1.1em;
  }

  .answer {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.5em;
    font-family: var(--display);
    font-size: 1.4em;
  }

  .answer.invalid .text {
    text-decoration: line-through;
    text-decoration-color: var(--cherry);
    text-decoration-thickness: 0.12em;
    opacity: 0.65;
  }

  .stamp {
    padding: 0.05em 0.45em;
    border-radius: 0.3em;
    border: 0.08em solid var(--ink);
    background: var(--mint);
    font-family: var(--body);
    font-style: normal;
    font-weight: 800;
    font-size: 0.55em;
    transform: rotate(-4deg);
  }

  .shared .stamp {
    background: var(--butter);
  }

  .stamp.no {
    background: var(--cherry);
    color: var(--cream);
  }

  .total {
    border-top: 0.14em solid var(--ink);
  }

  .hint {
    background: var(--cream);
    font-size: 1em;
  }

  .stop {
    position: absolute;
    left: 50%;
    top: 50%;
    translate: -50% -50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.4em 1.2em 0.6em;
    border-radius: 0.5em;
    border: 0.2em solid var(--ink);
    background: var(--cherry);
    color: var(--cream);
    box-shadow: 0.4em 0.5em 0 var(--ink);
    rotate: -6deg;
    z-index: 3;
  }

  .stop b {
    font-family: var(--display);
    font-weight: 400;
    font-size: 6em;
    line-height: 1;
  }

  .stop span {
    font-weight: 800;
    font-size: 1.4em;
  }
</style>
