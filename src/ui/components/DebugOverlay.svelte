<script lang="ts">
  import { onMount } from "svelte";
  import { route } from "../../core/router";
  import { installedVersion, updaterStatus, updaterMessage, availableUpdate } from "../../platform/updater";
  import { isNative, gamepadConnected } from "../../core/state";

  let visible = false;
  let lastClick = $state("(none yet)");
  let lastError = $state<string | null>(null);

  // Show with Ctrl+Shift+D or backtick (`)
  function onKey(e: KeyboardEvent) {
    if ((e.ctrlKey && e.shiftKey && e.key === "D") || e.key === "`") {
      e.preventDefault();
      visible = !visible;
    }
  }

  // Poll window.__lastClick so we can show it even if reactivity is broken
  onMount(() => {
    const id = setInterval(() => {
      if (typeof window !== "undefined") {
        const w = window as any;
        if (w.__lastClick !== undefined) lastClick = String(w.__lastClick);
        if (w.__lastError) {
          lastError = w.__lastError.message +
            (w.__lastError.stack ? "\n" + w.__lastError.stack.split("\n").slice(0, 3).join("\n") : "");
        } else {
          lastError = null;
        }
      }
    }, 300);
    return () => clearInterval(id);
  });
</script>

<svelte:window onkeydown={onKey} />

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
    <div class="section">
      <div class="section-title">Last click handler</div>
      <pre class="last-click">{lastClick}</pre>
    </div>
    {#if lastError}
      <div class="section err">
        <div class="section-title">Last error</div>
        <pre class="last-click">{lastError}</pre>
      </div>
    {/if}
    <div class="hint">Ctrl+Shift+D or ` to toggle</div>
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    bottom: 8px;
    right: 8px;
    background: rgba(5, 5, 7, 0.95);
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
    min-width: 280px;
    max-width: 400px;
    max-height: 80vh;
    overflow-y: auto;
  }

  .row {
    display: flex;
    justify-content: space-between;
    gap: 12px;
  }

  .section {
    margin-top: 6px;
    padding-top: 6px;
    border-top: 1px solid #2a2a38;
  }

  .section.err {
    border-top-color: #ff3c3c;
    color: #ff3c3c;
  }

  .section-title {
    color: var(--accent-soft, #b8960f);
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 4px;
  }

  .last-click {
    font-size: 10px;
    color: #88ffff;
    background: #05050a;
    border: 1px solid #2a2a38;
    border-radius: 2px;
    padding: 6px;
    white-space: pre-wrap;
    word-break: break-all;
    max-height: 200px;
    overflow-y: auto;
  }

  b { color: #ffd700; }
  code { color: #88ffff; }

  .hint {
    margin-top: 6px;
    padding-top: 6px;
    border-top: 1px solid #2a2a38;
    color: #5a5a66;
    font-size: 10px;
  }
</style>
