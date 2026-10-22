<script lang="ts">
  import type { Seats } from '../../room/protocol';
  import Blob from '../../ui/Blob.svelte';
  import WriteBox from '../../ui/WriteBox.svelte';
  import { other, type Slot } from '../types';
  import type { SweetPhone } from './logic';

  let { view, seats, act }: { view: SweetPhone; seats: Seats; me: Slot; act: (action: unknown) => void } = $props();
  const partner = $derived(seats[other(view.me)]?.name ?? 'l’autre');
</script>

<div class="sweet p{view.me}">
  {#if view.phase === 'book'}
    <div class="book">
      <Blob slot={view.me} size="4rem" mood="happy" bounce />
      <h2 class="pop">Votre carnet de mots doux</h2>
      <p>Il est sur la télé. Prenez le temps de tout relire.</p>
      <button class="btn primary block" onclick={() => act({ type: 'next' })}>Terminer</button>
    </div>
  {:else}
    <div class="head">
      <span>Mot doux {view.round + 1} / {view.rounds}</span>
      {#if view.letter}<span class="letter">Lettre {view.letter}</span>{/if}
    </div>

    <div class="prompt paper">
      <span class="for">Pour {partner}</span>
      <p>{view.prompt}</p>
    </div>

    {#if view.phase === 'write'}
      {#if view.letter && !view.written}<p class="lead">Ta réponse doit commencer par la lettre <b>{view.letter}</b>.</p>{/if}
      <WriteBox
        slot={view.me}
        sent={view.written}
        waiting={`Envoyé avec amour ! On attend ${partner}…`}
        placeholder="…"
        button="Envoyer mon mot doux"
        maxlength={140}
        multiline
        resetKey={view.round}
        onsend={(text) => act({ type: 'write', text })}
      />
    {:else if view.texts}
      <div class="notes">
        <div class="note"><span>Ton mot doux pour {partner}</span><b>{view.texts[view.me]}</b></div>
        <div class="note theirs"><span>Le mot doux de {partner} pour toi</span><b>{view.texts[other(view.me)]}</b></div>
      </div>
      <button class="btn primary block" onclick={() => act({ type: 'next' })}>{view.last ? 'Voir notre carnet' : 'Mot doux suivant'}</button
      >
    {/if}
  {/if}
</div>

<style>
  .sweet {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
  }

  .head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 800;
  }

  .letter {
    padding: 0.1rem 0.7rem;
    border-radius: 999px;
    border: 2px solid var(--ink);
    background: var(--butter);
  }

  .prompt {
    padding: 0.9rem 1rem;
    background: var(--blush);
    transform: rotate(-1deg);
  }

  .for {
    font-weight: 800;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .prompt p {
    margin: 0.3rem 0 0;
    font-family: var(--display);
    font-size: 1.5rem;
    line-height: 1.25;
  }

  .lead {
    font-weight: 700;
  }

  .notes {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .note {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    padding: 0.7rem 0.9rem;
    border-radius: 0.9rem;
    border: 2px solid var(--ink);
    background: var(--cream);
    box-shadow: 3px 4px 0 var(--ink);
  }

  .note.theirs {
    background: #ffe0ec;
  }

  .note span {
    font-weight: 800;
    font-size: 0.85rem;
  }

  .note b {
    font-family: var(--display);
    font-weight: 400;
    font-size: 1.3rem;
    line-height: 1.3;
    overflow-wrap: anywhere;
  }

  .book {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.9rem;
    text-align: center;
    font-weight: 700;
  }

  .book h2 {
    font-size: 2rem;
  }
</style>
