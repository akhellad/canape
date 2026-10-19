<script lang="ts">
  import type { Seats } from '../../room/protocol';
  import Blob from '../../ui/Blob.svelte';
  import { flipIn, slap } from '../../ui/motion';
  import PlayerPanel from '../../ui/PlayerPanel.svelte';
  import Timer from '../../ui/Timer.svelte';
  import { SLOTS, type Slot } from '../types';
  import type { QuizTv } from './logic';

  let { view, seats }: { view: QuizTv; seats: Seats } = $props();
  const name = (slot: Slot) => seats[slot]?.name ?? `Joueur ${slot + 1}`;
  const LETTERS = ['A', 'B', 'C', 'D'];
  const reveal = $derived(view.phase === 'reveal');
</script>

<section class="quiz">
  {#each SLOTS as slot (slot)}
    {@const pick = view.picks?.[slot] ?? null}
    <div class="side" style:order={slot === 0 ? 0 : 2}>
      <PlayerPanel
        {slot}
        name={name(slot)}
        active={false}
        mood={reveal ? (pick && pick.points > 0 ? 'happy' : 'sad') : view.locked[slot] ? 'wink' : 'wow'}
        crown={reveal && view.scores[slot] > view.scores[slot === 0 ? 1 : 0]}
      >
        {#key view.scores[slot]}<b class="score" in:slap>{view.scores[slot]}</b>{/key}
        {#if reveal}
          {#if pick && pick.points > 0}
            <span class="sticker gain" in:slap={{ delay: 300 }}>+{pick.points}</span>
          {:else}
            <span class="sticker miss" in:slap={{ delay: 300 }}>{pick ? 'Raté' : 'Trop tard'}</span>
          {/if}
        {:else}
          <span class="sticker lock" class:on={view.locked[slot]}>{view.locked[slot] ? 'A répondu' : 'réfléchit…'}</span>
        {/if}
      </PlayerPanel>
    </div>
  {/each}

  <div class="center" style:order={1}>
    <div class="meta">
      <span class="sticker count">Question {view.index + 1} / {view.count}</span>
      <span class="sticker category">{view.category}</span>
      {#if view.bonus}<span class="sticker bonus">Points × 2</span>{/if}
      {#if !reveal}<div class="timer"><Timer remaining={view.remaining} total={view.total} /></div>{/if}
    </div>

    {#key view.index}
      <h2 class="question paper" in:flipIn>{view.text}</h2>
      <div class="choices">
        {#each view.choices as choice, index (index)}
          <div
            class="choice c{index}"
            class:right={reveal && view.answer === index}
            class:wrong={reveal && view.answer !== index}
            in:slap={{ delay: 250 + index * 110, rotate: index % 2 ? 6 : -6 }}
          >
            <span class="letter">{LETTERS[index]}</span>
            <span class="label">{choice}</span>
            {#if reveal}
              <span class="who">
                {#each SLOTS as slot (slot)}
                  {#if view.picks?.[slot]?.choice === index}
                    <span in:slap={{ delay: 200 + slot * 120 }}
                      ><Blob {slot} size="1.7em" mood={view.answer === index ? 'happy' : 'sad'} /></span
                    >
                  {/if}
                {/each}
              </span>
            {/if}
          </div>
        {/each}
      </div>
    {/key}
  </div>
</section>

<style>
  .quiz {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2.6em;
  }

  .side {
    flex-shrink: 0;
  }

  .score {
    font-family: var(--display);
    font-weight: 400;
    font-size: 3em;
    line-height: 1;
  }

  .lock {
    background: var(--cream);
    opacity: 0.75;
  }

  .lock.on {
    background: var(--mint);
    opacity: 1;
    animation: wiggle 0.5s ease-in-out;
  }

  .gain {
    background: var(--mint);
    font-size: 1.2em;
  }

  .miss {
    background: var(--paper-2);
  }

  .center {
    flex: 1;
    max-width: 62em;
    display: flex;
    flex-direction: column;
    gap: 1.6em;
  }

  .meta {
    display: flex;
    align-items: center;
    gap: 0.8em;
  }

  .count {
    background: var(--cream);
    font-size: 1em;
  }

  .category {
    background: var(--lilac);
    transform: rotate(-2deg);
    font-size: 1em;
  }

  .bonus {
    background: var(--cherry);
    color: var(--cream);
    font-size: 1em;
    animation: wiggle 0.8s ease-in-out infinite;
  }

  .timer {
    margin-left: auto;
    font-size: 0.85em;
  }

  .question {
    padding: 1em 1.3em;
    font-size: 2.6em;
    line-height: 1.12;
    transform: rotate(-0.8deg);
  }

  .choices {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.1em 1.4em;
  }

  .choice {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.8em;
    min-height: 4.4em;
    padding: 0.6em 1em 0.6em 0.7em;
    border-radius: 1em;
    border: 0.16em solid var(--ink);
    background: var(--tone);
    color: var(--tone-ink, var(--ink));
    box-shadow: var(--shadow);
    font-weight: 800;
    font-size: 1.45em;
    line-height: 1.15;
    transition:
      transform 0.45s var(--spring),
      opacity 0.4s ease,
      filter 0.4s ease;
  }

  .c0 {
    --tone: var(--cobalt);
    --tone-ink: var(--cream);
  }

  .c1 {
    --tone: var(--butter);
  }

  .c2 {
    --tone: var(--mint);
  }

  .c3 {
    --tone: var(--tangerine);
  }

  .letter {
    flex-shrink: 0;
    width: 1.7em;
    height: 1.7em;
    display: grid;
    place-items: center;
    border-radius: 0.5em;
    background: var(--cream);
    color: var(--ink);
    border: 0.1em solid var(--ink);
    font-family: var(--display);
    font-weight: 400;
  }

  .right {
    transform: scale(1.06) rotate(-1.5deg);
    z-index: 1;
    animation: glow 0.6s ease-in-out 3 alternate;
  }

  .wrong {
    background: color-mix(in srgb, var(--tone) 30%, var(--cream));
    color: var(--ink);
    box-shadow: var(--shadow-sm);
    transform: scale(0.96);
  }

  .wrong .letter {
    opacity: 0.5;
  }

  .who {
    position: absolute;
    right: 0.4em;
    top: -1.1em;
    display: flex;
    gap: 0.2em;
    font-size: 0.75em;
  }

  @keyframes glow {
    to {
      box-shadow:
        var(--shadow),
        0 0 0 0.3em var(--cream);
    }
  }
</style>
