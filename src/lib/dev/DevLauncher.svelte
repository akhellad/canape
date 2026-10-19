<script lang="ts">
  import { launchDevPlayer } from './harness';
</script>

<button class="dev-launcher" onclick={launchDevPlayer} title="Ouvre une fenêtre de joueur connectée à cette télé (un clic par joueur)">
  🧪 + joueur de test
</button>

<style>
  .dev-launcher {
    position: fixed;
    right: 0.75rem;
    bottom: 0.75rem;
    z-index: 9999;
    padding: 0.5rem 0.85rem;
    border-radius: 0.6rem;
    border: 2px solid #111;
    background: #fef08a;
    color: #111;
    font-weight: 700;
    font-size: 0.85rem;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
  }

  .dev-launcher:hover {
    filter: brightness(0.95);
  }
</style>
