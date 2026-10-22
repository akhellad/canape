<script lang="ts">
  import { fly } from 'svelte/transition';
  import DrawingView from '../../draw/DrawingView.svelte';
  import DrawPad from '../../draw/DrawPad.svelte';
  import type { Seats } from '../../room/protocol';
  import Blob from '../../ui/Blob.svelte';
  import { other, type Slot } from '../types';
  import type { TelephonePhone } from './logic';

  let { view, seats, act }: { view: TelephonePhone; seats: Seats; me: Slot; act: (action: unknown) => void } = $props();
  const partner = $derived(seats[other(view.me)]?.name ?? 'l’autre');
  const owner = (slot: Slot) => (slot === view.me ? 'ton carnet' : `le carnet de ${partner}`);

  let text = $state('');
  let step = -1;

  $effect.pre(() => {
    if (view.step !== step) {
      step = view.step;
      text = '';
    }
  });

  function submit(event: SubmitEvent, type: 'start' | 'write') {
    event.preventDefault();
    const value = text.trim();
    if (value) act({ type, text: value });
  }
</script>

<div class="telephone p{view.me}">
  {#if view.task !== 'show'}
    <div class="head">
      <span>{view.step === 0 ? 'Mot de départ' : `Étape ${view.step} / ${view.steps}`}</span>
      {#if view.task === 'draw' && !view.done}<span class="time" class:urgent={view.remaining <= 10}>{view.remaining} s</span>{/if}
    </div>
  {/if}

  {#if view.done && view.task !== 'show'}
    <div class="wait" in:fly={{ y: 20, duration: 300 }}>
      <Blob slot={view.me} size="4rem" mood="happy" bounce />
      <p>{view.partnerDone ? 'C’est parti pour la suite…' : `C’est envoyé ! On attend ${partner}…`}</p>
    </div>
  {:else if view.task === 'start'}
    <p class="lead">Choisis le mot que tu vas dessiner :</p>
    <div class="choices">
      {#each view.suggestions as word, index (word)}
        <button class="choice paper" style:animation-delay={`${index * 80}ms`} onclick={() => act({ type: 'start', index })}>{word}</button>
      {/each}
    </div>
    <form class="write" onsubmit={(event) => submit(event, 'start')}>
      <input class="field" bind:value={text} maxlength="40" placeholder="…ou invente le tien" autocomplete="off" enterkeyhint="done" />
      <button class="btn go" type="submit" disabled={!text.trim()}>Valider</button>
    </form>
  {:else if view.task === 'draw'}
    <p class="lead">Dessine : <b class="target">{view.prompt}</b></p>
    <DrawPad {act} enabled={!view.done} resetKey={view.step}>
      {#snippet actions()}
        <button class="finish" onclick={() => act({ type: 'done' })}>J’ai fini</button>
      {/snippet}
    </DrawPad>
  {:else if view.task === 'write'}
    <p class="lead">Qu’a dessiné {partner} ?</p>
    <div class="drawing paper"><DrawingView strokes={view.drawing} rev={view.step} label={`Dessin de ${partner}`} /></div>
    <form class="write" onsubmit={(event) => submit(event, 'write')}>
      <input
        class="field"
        bind:value={text}
        maxlength="40"
        placeholder="Je crois que c’est…"
        autocomplete="off"
        autocapitalize="none"
        enterkeyhint="send"
      />
      <button class="btn go" type="submit" disabled={!text.trim()}>Envoyer</button>
    </form>
  {:else}
    <div class="show">
      <span class="sticker">{owner(view.chain)}</span>
      <h2 class="pop">Page {view.page + 1} / {view.length}</h2>
      <p>Regardez la télé, et prenez le temps d’en rire.</p>
      <button class="btn primary block" onclick={() => act({ type: 'next' })}>
        {view.last ? 'Terminer' : view.page === view.length - 1 ? 'Carnet suivant' : 'Page suivante'}
      </button>
    </div>
  {/if}
</div>

<style>
  .telephone {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }

  .head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 800;
  }

  .time {
    padding: 0.1rem 0.7rem;
    border-radius: 999px;
    border: 2px solid var(--ink);
    background: var(--cream);
  }

  .time.urgent {
    background: var(--cherry);
    color: var(--cream);
  }

  .lead {
    font-weight: 800;
    font-size: 1.1rem;
    line-height: 1.35;
  }

  .target {
    display: inline-block;
    font-family: var(--display);
    font-weight: 400;
    font-size: 1.5rem;
    padding: 0 0.4rem;
    border-radius: 0.4rem;
    background: var(--butter);
    border: 2px solid var(--ink);
    transform: rotate(-2deg);
  }

  .choices {
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
  }

  .choice {
    padding: 0.9rem 1rem;
    text-align: left;
    font-family: var(--display);
    font-size: 1.5rem;
    animation: drop-in 0.45s var(--snap) backwards;
  }

  .write {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.6rem;
  }

  .drawing {
    width: 100%;
    aspect-ratio: 1;
    overflow: hidden;
  }

  .finish {
    margin-left: auto;
    padding: 0.5rem 0.9rem;
    min-height: 2.75rem;
    border-radius: 0.7rem;
    border: 2px solid var(--ink);
    background: var(--mint);
    color: var(--ink);
    box-shadow: 2px 3px 0 var(--ink);
    font-weight: 800;
  }

  .wait,
  .show {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.8rem;
    text-align: center;
    font-weight: 800;
    font-size: 1.15rem;
  }

  .show h2 {
    font-size: 2.2rem;
  }

  .show p {
    color: var(--ink-2);
    font-size: 1rem;
  }
</style>
