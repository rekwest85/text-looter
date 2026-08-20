<script lang="ts">
  import { onMount } from "svelte";

  let error: Error | null = null;
  let errorInfo = "";

  onMount(() => {
    function onError(e: ErrorEvent) {
      error = e.error ?? new Error(e.message || "Unknown error");
      errorInfo = (e.error as Error)?.stack ?? `${e.message}\n${e.filename}:${e.lineno}:${e.colno}`;
      console.error("[ErrorBoundary]", e.error);
    }
    function onRejection(e: PromiseRejectionEvent) {
      const err = e.reason instanceof Error ? e.reason : new Error(String(e.reason));
      error = err;
      errorInfo = err.stack ?? String(e.reason);
      console.error("[ErrorBoundary] unhandled rejection", err);
    }
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  });

  function reset() {
    error = null;
    errorInfo = "";
    window.location.hash = "/";
    location.reload();
  }
</script>

{#if error}
  <div class="boundary">
    <div class="card">
      <div class="badge">UNCAUGHT ERROR</div>
      <h2>{error.message || "Something went wrong"}</h2>
      <pre class="stack">{errorInfo}</pre>
      <button onclick={reset}>↻ Restart</button>
    </div>
  </div>
{:else}
  <slot />
{/if}

<style>
  .boundary {
    position: absolute;
    inset: 0;
    background: rgba(5, 5, 7, 0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 99999;
    padding: 20px;
  }

  .card {
    background: #14141c;
    border: 2px solid #ff3c3c;
    border-radius: 8px;
    padding: 24px;
    max-width: 600px;
    max-height: 80vh;
    overflow: auto;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .badge {
    font-family: monospace;
    font-size: 11px;
    color: #ff3c3c;
    letter-spacing: 0.2em;
  }

  h2 {
    font-family: var(--font-display);
    color: #ff3c3c;
    font-size: 22px;
  }

  .stack {
    background: #05050a;
    border: 1px solid #2a2a38;
    border-radius: 4px;
    padding: 10px;
    font-size: 11px;
    color: #c8c8d0;
    overflow: auto;
    max-height: 300px;
    white-space: pre-wrap;
    word-break: break-all;
  }

  button {
    background: #ff3c3c;
    color: #fff;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    align-self: flex-start;
  }
</style>
