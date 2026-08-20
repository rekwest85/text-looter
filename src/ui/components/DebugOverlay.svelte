<script lang="ts">
  import { route } from "../../core/router";
  import { installedVersion, updaterStatus, updaterMessage, availableUpdate } from "../../platform/updater";
  import { isNative, gamepadConnected } from "../../core/state";

  let visible = false;

  // Show with Ctrl+Shift+D or backtick (`)
  function onKey(e: KeyboardEvent) {
    if ((e.ctrlKey && e.shiftKey && e.key === "D") || e.key === "`") {
      e.preventDefault();
      visible = !visible;
    }
  }
</script>

<svelte:window on:keydown={onKey} />

{#if visible}
  <div class="overlay">
    <div class="row"><b>Route</b> <code>{$route}</code></div>
    <div class="row"><b>Native</b> {$isNative ? "yes" : "no"}</div>
    <div class="row"><b>Gamepad</b> {$gamepadConnected ? "yes" : "no"}</div>
    <div class="row"><b>Version</b> {$installedVersion}</div>
    <div class="row"><b>Updater</b> {$updaterStatus} — {$updaterMessage}</div>
    {#if $availableUpdate}
      <div class="row"><b>Pending update</b> {$availableUpdate.version}</div>
    {/if}
    <div class="hint">Ctrl+Shift+D or ` to toggle</div>
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    bottom: 8px;
    right: 8px;
    background: rgba(5, 5, 7, 0.9);
    border: 1px solid #2a2a38;
    border-radius: 4px;
    padding: 10px 14px;
    font-family: monospace;
    font-size: 11px;
    color: #c8c8d0;
    z-index: 100000;
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 240px;
  }

  .row {
    display: flex;
    justify-content: space-between;
    gap: 12px;
  }

  b {
    color: #ffd700;
  }

  code {
    color: #88ffff;
  }

  .hint {
    margin-top: 6px;
    padding-top: 6px;
    border-top: 1px solid #2a2a38;
    color: #5a5a66;
    font-size: 10px;
  }
</style>
