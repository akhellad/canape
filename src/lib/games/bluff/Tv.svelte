<script lang="ts">
  import { backOut } from 'svelte/easing';
  import { fly } from 'svelte/transition';
  import type { Seats } from '../../room/protocol';
  import Blob from '../../ui/Blob.svelte';
  import { slap } from '../../ui/motion';
  import Timer from '../../ui/Timer.svelte';
  import { SLOTS, type Slot } from '../types';
  import type { Author, BluffTv } from './logic';

  let { view, seats }: { view: BluffTv; seats: Seats } = $props();
  const name = (slot: Slot) => seats[slot]?.name ?? `Joueur ${slot + 1}`;
  const LETTERS = ['A', 'B', 'C', 'D', 'E'];

  function tag(author: Author | null): string {
    if (author === 'real') return 'La vraie définition';
    if (author === 'decoy') return 'Piège du jeu';
    return author === null ? '' : `Bluff de ${name(author)}`;
  }

  const status = (slot: Slot) => {
    if (view.phase === 'write') return view.ready[slot] ? 'a son bluff' : 'invente…';
    if (view.phase === 'vote') return view.ready[slot] ? 'a voté' : 'hésite…';
    return view.gained ? `+${view.gained[slot]}` : '';
  };
</script>

<section class="bluff">
  <header>
    <span class="sticker">Mot {view.round + 1} / {view.rounds}</span>
    {#key view.round}
      <div class="word" in:slap={{ rotate: -4 }}>
        <h2 class="pop">{view.word}</h2>
        <span>{view.nature}</span>
      </div>
    {/key}
  </header>

  {#if view.phase === 'write'}
    <div class="writing">
      {#if view.remaining !== null && view.total !== null}<Timer remaining={view.remaining} total={view.total} />{/if}
      <p class="tip">Inventez une définition crédible sur vos téléphones…</p>
    </div>
  {:else}
    <ol class="options">
      {#each view.options as option, index (index)}
        <li
          class="paper"
          class:real={option.author === 'real'}
          class:decoy={option.author === 'decoy'}
          in:fly={{ y: 40, duration: 450, delay: index * 120, easing: backOut }}
        >
          <span class="letter">{LETTERS[index]}</span>
          <p>{option.text}</p>
          {#if view.phase === 'reveal'}
            <div class="reveal" in:slap={{ delay: 300 + index * 150 }}>
              <em class:p0={option.author === 0} class:p1={option.author === 1}>{tag(option.author)}</em>
              {#each option.votes as voter (voter)}
                <span class="voter p{voter}"
                  ><Blob slot={voter} size="1.4em" mood={option.author === 'real' ? 'happy' : 'sad'} />{name(voter)}</span
                >
              {/each}
            </div>
          {/if}
        </li>
      {/each}
    </ol>
  {/if}

  <footer>
    {#each SLOTS as slot (slot)}
      <div class="player p{slot}" class:ok={view.ready[slot] || view.phase === 'reveal'}>
        <Blob {slot} size="1.8em" mood={view.ready[slot] ? 'happy' : 'wink'} />
        <span class="name">{name(slot)}</span>
        <b>{view.scores[slot]}</b>
        <span class="state">{status(slot)}</span>
      </div>
    {/each}
  </footer>
  {#if view.phase === 'reveal'}
    <p class="next sticker">Appuyez sur « {view.last ? 'Voir le résultat' : 'Mot suivant'} » quand vous voulez</p>
  {/if}
</section>

<style>
  .bluff {
    width: 100%;
    max-width: 90em;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.4em;
  }

  header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5em;
  }

  .word {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  h2 {
    font-size: 4.2em;
    text-align: center;
  }

  .word span {
    font-weight: 800;
    font-style: italic;
    font-size: 1.4em;
  }

  .writing {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1em;
  }

  .tip {
    font-weight: 700;
    font-size: 1.4em;
    color: var(--ink-2);
  }

  .options {
    list-style: none;
    margin: 0;
    padding: 0;
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.2em 1.6em;
  }

  .options li {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 0.8em;
    padding: 0.9em 1.2em;
    font-size: 1.3em;
    font-weight: 700;
    line-height: 1.35;
  }

  .options li.real {
    background: #c9f5e6;
    transform: rotate(-1deg) scale(1.02);
  }

  .options li.decoy {
    background: var(--paper-2);
  }

  .options p {
    flex: 1;
    min-width: 0;
    margin: 0;
  }

  .letter {
    flex-shrink: 0;
    width: 1.8em;
    height: 1.8em;
    display: grid;
    place-items: center;
    border-radius: 50%;
    border: 0.12em solid var(--ink);
    background: var(--tangerine);
    font-family: var(--display);
  }

  .reveal {
    flex-basis: 100%;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5em;
  }

  em {
    font-style: normal;
    font-weight: 900;
    padding: 0.1em 0.7em;
    border-radius: 999px;
    border: 0.1em solid var(--ink);
    background: var(--cream);
  }

  em.p0,
  em.p1 {
    background: var(--pc);
    color: var(--pc-ink);
  }

  .voter {
    display: inline-flex;
    align-items: center;
    gap: 0.3em;
    font-weight: 800;
  }

  footer {
    display: flex;
    gap: 2em;
  }

  .player {
    display: flex;
    align-items: center;
    gap: 0.6em;
    padding: 0.4em 1.2em 0.4em 0.6em;
    border-radius: 999px;
    border: 0.15em dashed var(--ink);
    font-weight: 800;
    font-size: 1.15em;
  }

  .player.ok {
    border-style: solid;
    background: var(--pc);
    color: var(--pc-ink);
    box-shadow: var(--shadow-sm);
  }

  .name {
    font-family: var(--display);
    font-weight: 400;
    font-size: 1.2em;
  }

  .player b {
    font-family: var(--display);
    font-weight: 400;
    font-size: 1.5em;
  }

  .next {
    background: var(--butter);
    text-transform: none;
    font-size: 1.1em;
    animation: wiggle 1.6s ease-in-out infinite;
  }
</style>
