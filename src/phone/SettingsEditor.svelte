<script lang="ts">
  import Plus from '@lucide/svelte/icons/plus';
  import Shuffle from '@lucide/svelte/icons/shuffle';
  import X from '@lucide/svelte/icons/x';
  import type { ListSetting, SettingDef, Settings, SettingValue } from '../lib/games/settings';
  import { normalize } from '../lib/text';

  let { defs, settings, onset }: { defs: readonly SettingDef[]; settings: Settings; onset: (key: string, value: SettingValue) => void } =
    $props();

  let drafts = $state<Record<string, string>>({});

  function items(def: ListSetting): string[] {
    const value = settings[def.id];
    return Array.isArray(value) ? value : [];
  }

  function has(def: ListSetting, item: string): boolean {
    return items(def).some((existing) => normalize(existing) === normalize(item));
  }

  function suggestions(def: ListSetting): string[] {
    // A stable handful that changes as the list changes, so the phone never shows the whole pool.
    const offset = items(def).join('').length;
    const free = def.pool.filter((item) => !has(def, item));
    return Array.from({ length: Math.min(8, free.length) }, (_, i) => free[(offset * 7 + i * 13) % free.length]).filter(
      (item, index, all) => all.indexOf(item) === index,
    );
  }

  function add(def: ListSetting, raw: string) {
    const item = raw.trim();
    if (!item || has(def, item) || items(def).length >= def.max) return;
    onset(def.id, [...items(def), item]);
  }

  function remove(def: ListSetting, item: string) {
    if (items(def).length <= def.min) return;
    onset(
      def.id,
      items(def).filter((existing) => existing !== item),
    );
  }

  function shuffle(def: ListSetting) {
    const pool = [...def.pool];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    onset(def.id, pool.slice(0, Math.max(def.min, Math.min(def.max, items(def).length || def.size))));
  }

  function submit(event: SubmitEvent, def: ListSetting) {
    event.preventDefault();
    add(def, drafts[def.id] ?? '');
    drafts[def.id] = '';
  }
</script>

<section class="settings">
  <h2>Réglages</h2>
  {#each defs as def (def.id)}
    {#if def.kind === 'choice'}
      <div class="choice">
        <span class="label">{def.label}</span>
        <div class="options" role="radiogroup" aria-label={def.label}>
          {#each def.options as option (option.value)}
            <button
              class="option"
              role="radio"
              aria-checked={settings[def.id] === option.value}
              class:active={settings[def.id] === option.value}
              onclick={() => onset(def.id, option.value)}>{option.label}</button
            >
          {/each}
        </div>
      </div>
    {:else}
      {@const list = items(def)}
      <div class="list">
        <div class="list-head">
          <span class="label">{def.label} <em>{list.length} / {def.max}</em></span>
          <button class="mini" onclick={() => shuffle(def)} aria-label="Tirer au hasard"><Shuffle size={18} /> Hasard</button>
        </div>
        <ul class="chips">
          {#each list as item (item)}
            <li>
              <span>{item}</span>
              <button class="remove" aria-label={`Retirer ${item}`} disabled={list.length <= def.min} onclick={() => remove(def, item)}
                ><X size={16} /></button
              >
            </li>
          {/each}
        </ul>
        {#if list.length < def.max}
          <div class="ideas">
            {#each suggestions(def) as idea (idea)}
              <button class="idea" onclick={() => add(def, idea)}><Plus size={14} /> {idea}</button>
            {/each}
          </div>
          <form class="add" onsubmit={(event) => submit(event, def)}>
            <input
              class="field"
              bind:value={drafts[def.id]}
              maxlength={def.maxLength}
              placeholder="Ta catégorie à toi"
              autocomplete="off"
              enterkeyhint="done"
            />
            <button class="btn primary" type="submit" disabled={!(drafts[def.id] ?? '').trim()}>Ajouter</button>
          </form>
        {/if}
      </div>
    {/if}
  {/each}
</section>

<style>
  .settings {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    padding: 0.9rem;
    border-radius: 1rem;
    border: 2px dashed var(--ink);
    background: rgba(255, 243, 230, 0.55);
  }

  h2 {
    margin: 0;
    font-family: var(--display);
    font-weight: 400;
    font-size: 1.3rem;
  }

  .label {
    font-weight: 800;
  }

  .label em {
    font-style: normal;
    color: var(--ink-2);
    font-size: 0.85em;
  }

  .choice,
  .list {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .options {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .option {
    min-height: 2.6rem;
    padding: 0.3rem 0.8rem;
    border-radius: 0.7rem;
    border: 2px solid var(--ink);
    background: var(--cream);
    color: var(--ink);
    font-weight: 800;
    box-shadow: 2px 3px 0 var(--ink);
  }

  .option.active {
    background: var(--butter);
    transform: translate(2px, 3px);
    box-shadow: none;
  }

  .list-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .mini {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    min-height: 2.4rem;
    padding: 0.2rem 0.7rem;
    border-radius: 999px;
    border: 2px solid var(--ink);
    background: var(--cream);
    color: var(--ink);
    font-weight: 800;
  }

  .chips {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .chips li {
    display: inline-flex;
    align-items: center;
    gap: 0.2rem;
    padding: 0.2rem 0.2rem 0.2rem 0.7rem;
    border-radius: 999px;
    border: 2px solid var(--ink);
    background: var(--butter);
    color: var(--ink);
    font-weight: 800;
  }

  .remove {
    width: 2rem;
    height: 2rem;
    display: grid;
    place-items: center;
    border-radius: 50%;
    color: var(--ink);
  }

  .remove:disabled {
    opacity: 0.3;
  }

  .ideas {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
  }

  .idea {
    display: inline-flex;
    align-items: center;
    gap: 0.2rem;
    min-height: 2.2rem;
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
    border: 2px dashed var(--ink);
    color: var(--ink);
    font-weight: 700;
    font-size: 0.9rem;
  }

  .add {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.5rem;
  }

  .add .field {
    padding: 0.55rem 0.8rem;
    font-size: 1rem;
  }
</style>
