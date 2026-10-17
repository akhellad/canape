<script lang="ts">
  import Minus from '@lucide/svelte/icons/minus';
  import Plus from '@lucide/svelte/icons/plus';
  import type { Seats } from '../../room/protocol';
  import Icon from '../../ui/Icon.svelte';
  import { other, type Slot } from '../types';
  import type { AgentsPhone, KeyCell } from './logic';

  let { view, seats, act }: { view: AgentsPhone; seats: Seats; me: Slot; act: (action: unknown) => void } = $props();

  let clue = $state('');
  let count = $state(1);
  let peek = $state(false);

  const partner = $derived(seats[other(view.me)]?.name ?? 'l’autre');
  const giverSide = $derived<Slot>(view.role === 'guessing' ? other(view.me) : view.me);
  const showKey = $derived(view.role === 'cluing' || view.role === 'watching' || view.role === 'over' || peek);
  const myAgentsLeft = $derived(view.myKey.filter((cell, index) => cell === 'agent' && !view.tiles[index].found).length);
  const canPick = $derived(view.role === 'guessing' || view.role === 'sudden');

  function selectable(index: number): boolean {
    const tile = view.tiles[index];
    if (!canPick || tile.found || view.revealing) return false;
    if (view.role === 'guessing') return !tile.bystander[giverSide];
    return !tile.bystander[other(view.me)];
  }

  function tap(index: number) {
    if (!selectable(index)) return;
    act({ type: 'select', tile: index });
  }

  function sendClue(event: SubmitEvent) {
    event.preventDefault();
    if (!clue.trim()) return;
    act({ type: 'clue', word: clue.trim(), count });
  }

  $effect.pre(() => {
    if (view.role !== 'cluing') clue = '';
  });

  const keyLabel: Record<KeyCell, string> = { agent: 'agent', assassin: 'assassin', neutral: 'passant' };
</script>

<div class="agents p{view.me}">
  <div class="head">
    <span class="tokens"><Icon name="hourglass-done" size="1.2em" />{view.tokens} jeton{view.tokens > 1 ? 's' : ''}</span>
    <span class="found"><Icon name="detective" size="1.2em" />{view.found} / {view.total}</span>
  </div>

  {#if view.role === 'cluing'}
    <p class="lead">À toi de donner un indice ! Tes agents sont en vert, évite les noirs.</p>
    <p class="sub">Encore {myAgentsLeft} agent{myAgentsLeft > 1 ? 's' : ''} à faire trouver à {partner}.</p>
  {:else if view.role === 'waiting'}
    <p class="lead">{partner} cherche un indice…</p>
  {:else if view.role === 'guessing' && view.clue}
    <div class="clue"><span>Indice</span><b>{view.clue.word}</b><em>{view.clue.count}</em></div>
  {:else if view.role === 'watching' && view.clue}
    <p class="lead">{partner} devine ton indice « {view.clue.word} »…</p>
  {:else if view.role === 'sudden'}
    <p class="lead danger">Mort subite ! Trouve un agent de {partner}, sans te tromper.</p>
  {:else if view.role === 'over'}
    <p class="lead">{view.won ? 'Mission accomplie !' : 'Mission échouée…'} Voici vos deux cartes.</p>
  {/if}

  <div class="grid">
    {#each view.tiles as tile, index (index)}
      {@const key = view.myKey[index]}
      <button
        class="tile {showKey ? `key-${key}` : ''}"
        class:long={tile.word.length >= 9}
        class:longer={tile.word.length >= 11}
        class:found={tile.found}
        class:faded={!tile.found && canPick && !selectable(index)}
        class:pending={view.pending === index}
        class:partner={view.partnerPending === index}
        class:revealing={view.revealing?.tile === index}
        aria-label={`${tile.word}${showKey ? `, ${keyLabel[key]}` : ''}`}
        onclick={() => tap(index)}
      >
        <span>{tile.word}</span>
        {#if view.partnerKey}
          <i class="partner-key key-{view.partnerKey[index]}"></i>
        {/if}
        {#if tile.bystander[0] || tile.bystander[1]}
          <i class="walker"><Icon name="person-walking" size="0.9rem" /></i>
        {/if}
      </button>
    {/each}
  </div>

  {#if view.role === 'cluing'}
    <form class="clue-form" onsubmit={sendClue}>
      <input
        bind:value={clue}
        maxlength="24"
        placeholder="Ton indice"
        autocomplete="off"
        autocapitalize="characters"
        spellcheck="false"
        enterkeyhint="send"
      />
      <div class="count">
        <button type="button" aria-label="Moins" onclick={() => (count = Math.max(0, count - 1))}><Minus size={20} /></button>
        <b>{count}</b>
        <button type="button" aria-label="Plus" onclick={() => (count = Math.min(9, count + 1))}><Plus size={20} /></button>
      </div>
      {#if view.error}<p class="error">{view.error}</p>{/if}
      <button class="btn go block" type="submit" disabled={!clue.trim()}>Envoyer l’indice</button>
    </form>
  {:else if canPick}
    <div class="actions">
      {#if view.pending !== null && !view.revealing}
        <button class="btn go block" onclick={() => act({ type: 'confirm', tile: view.pending })}
          >Valider « {view.tiles[view.pending].word} »</button
        >
      {:else if view.revealing}
        <p class="sub center">Révélation…</p>
      {:else}
        <p class="sub center">Touche un mot pour le choisir.</p>
      {/if}
      {#if view.canStop}
        <button class="btn ghost block" onclick={() => act({ type: 'stop' })}>On s’arrête là</button>
      {/if}
      {#if view.role === 'guessing'}
        <label class="peek"><input type="checkbox" bind:checked={peek} /> Voir ma propre carte</label>
      {/if}
    </div>
  {/if}
</div>

<style>
  .agents {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .head {
    display: flex;
    justify-content: space-between;
    font-weight: 800;
  }

  .head span {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
  }

  .lead {
    font-weight: 800;
    font-size: 1.1rem;
    line-height: 1.35;
  }

  .lead.danger {
    color: var(--peach);
  }

  .sub {
    color: var(--muted);
  }

  .center {
    text-align: center;
  }

  .clue {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.5rem 0.8rem;
    border-radius: 0.9rem;
    background: var(--plum-2);
    border: 2px solid var(--yellow);
  }

  .clue span {
    color: var(--muted);
    font-weight: 800;
  }

  .clue b {
    font-family: var(--display);
    font-size: 1.6rem;
    color: var(--yellow);
    letter-spacing: 0.04em;
  }

  .clue em {
    margin-left: auto;
    font-style: normal;
    font-family: var(--display);
    font-size: 1.6rem;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 0.35rem;
  }

  .tile {
    position: relative;
    min-height: 3.1rem;
    padding: 0.25rem 0.15rem;
    border-radius: 0.55rem;
    background: var(--cream);
    color: var(--ink);
    border: 2px solid var(--ink);
    font-size: clamp(0.5rem, 2.45vw, 0.78rem);
    font-weight: 900;
    line-height: 1.05;
    overflow-wrap: anywhere;
    transition:
      transform 0.12s ease,
      opacity 0.2s ease;
  }

  .tile.long {
    font-size: clamp(0.45rem, 2.05vw, 0.68rem);
  }

  .tile.longer {
    font-size: clamp(0.42rem, 1.8vw, 0.6rem);
  }

  .tile.key-agent {
    background: #8fd3a6;
  }

  .tile.key-assassin {
    background: var(--ink);
    color: var(--cream);
    border-color: var(--red);
  }

  .tile.key-neutral {
    background: var(--paper-2);
  }

  .tile.found {
    background: var(--green-dark);
    color: var(--cream);
    border-color: var(--ink);
  }

  .tile.faded {
    opacity: 0.45;
  }

  .tile.partner {
    box-shadow: 0 0 0 3px var(--yellow);
  }

  .tile.pending {
    background: var(--yellow);
    color: var(--ink);
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 0 0 3px var(--pc);
  }

  .tile.revealing {
    animation: wiggle 0.25s ease-in-out infinite;
  }

  .walker {
    position: absolute;
    right: -0.3rem;
    bottom: -0.3rem;
    width: 1.2rem;
    height: 1.2rem;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: var(--cream);
    border: 1.5px solid var(--ink);
  }

  .partner-key {
    position: absolute;
    left: 0.2rem;
    right: 0.2rem;
    bottom: 0.15rem;
    height: 0.3rem;
    border-radius: 999px;
    border: 1px solid var(--ink);
  }

  .partner-key.key-agent {
    background: var(--green);
  }

  .partner-key.key-assassin {
    background: var(--ink);
  }

  .partner-key.key-neutral {
    background: var(--paper-2);
  }

  .clue-form {
    margin-top: auto;
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.6rem;
  }

  .clue-form input {
    min-width: 0;
    padding: 0.8rem;
    border-radius: 0.9rem;
    border: 3px solid var(--ink);
    background: var(--cream);
    color: var(--ink);
    font-weight: 900;
    font-size: 1.15rem;
    text-transform: uppercase;
    outline: none;
  }

  .count {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0 0.3rem;
    border-radius: 0.9rem;
    background: var(--cream);
    color: var(--ink);
    border: 3px solid var(--ink);
  }

  .count button {
    width: 2.3rem;
    height: 2.3rem;
    display: grid;
    place-items: center;
  }

  .count b {
    font-family: var(--display);
    font-size: 1.6rem;
    min-width: 1.2rem;
    text-align: center;
  }

  .error {
    grid-column: span 2;
    color: var(--peach);
    font-weight: 800;
  }

  .clue-form .btn {
    grid-column: span 2;
  }

  .actions {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .peek {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    color: var(--muted);
    font-weight: 800;
    min-height: 2.75rem;
  }

  .peek input {
    width: 1.3rem;
    height: 1.3rem;
  }
</style>
