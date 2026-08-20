<script lang="ts">
  import { onMount } from "svelte";
  import {
    availableUpdate,
    installedVersion,
    updaterStatus,
    updaterMessage,
    updaterDownloadProgress,
    checkForUpdate,
    downloadAndInstall,
    dismissCurrent,
    clearUpdatePrompt,
  } from "../../platform/updater";

  let bodyHtml: string = "";
  let isBusy: boolean = false;

  $: release = $availableUpdate;
  $: status = $updaterStatus;
  $: message = $updaterMessage;
  $: progress = $updaterDownloadProgress;
  $: isBusy = status === "downloading" || status === "installing";

  // Render markdown-ish release notes (very lightweight: bold, lists, code)
  $: if (release?.body) {
    bodyHtml = renderMarkdown(release.body);
  }

  function renderMarkdown(s: string): string {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/^### (.*?)$/gm, "<h4>$1</h4>")
      .replace(/^## (.*?)$/gm, "<h3>$1</h3>")
      .replace(/^# (.*?)$/gm, "<h2>$1</h2>")
      .replace(/^\* (.*?)$/gm, "<li>$1</li>")
      .replace(/^- (.*?)$/gm, "<li>$1</li>")
      .replace(/(<li>(.|\n)*?<\/li>)/g, (m) => `<ul>${m}</ul>`)
      .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
      .replace(/`(.*?)`/g, "<code>$1</code>")
      .replace(/\n\n/g, "<br/><br/>")
      .replace(/\n/g, "<br/>");
  }

  async function onUpdate() {
    if (!release) return;
    await downloadAndInstall(release);
  }

  function onLater() {
    clearUpdatePrompt();
  }

  function onSkip() {
    dismissCurrent();
  }

  function onRefresh() {
    checkForUpdate({ force: true });
  }

  function fmtBytes(n: number): string {
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
    return `${(n / 1024 / 1024).toFixed(1)} MB`;
  }

  function fmtDate(s: string): string {
    try { return new Date(s).toLocaleDateString(); } catch { return s; }
  }
</script>

{#if release}
  <div class="backdrop" onclick={isBusy ? null : onLater}>
    <div class="modal" onclick={(e) => e.stopPropagation()}>
      <div class="header">
        <div class="badge">UPDATE AVAILABLE</div>
        <h2 class="title">v{release.version}</h2>
        <p class="sub">
          You have <b>v{$installedVersion}</b> · released {fmtDate(release.publishedAt)}
          {#if release.assetSize > 0}
            · {fmtBytes(release.assetSize)}
          {/if}
        </p>
      </div>

      <div class="body">
        <div class="notes">
          {#if release.body}
            {@html bodyHtml}
          {:else}
            <p class="empty">No release notes.</p>
          {/if}
        </div>
      </div>

      {#if isBusy}
        <div class="progress">
          <div class="status-line">{message}</div>
          <div class="bar">
            <div class="fill" style="width: {progress * 100}%"></div>
          </div>
          <div class="percent">{Math.round(progress * 100)}%</div>
        </div>
      {:else if status === "error"}
        <div class="progress error">
          <div class="status-line">⚠ {message}</div>
        </div>
      {/if}

      <div class="actions">
        {#if !isBusy}
          <button class="btn primary focusable" onclick={onUpdate} data-id="update">
            ⬇ Update Now
          </button>
          <button class="btn focusable" onclick={onLater} data-id="later">
            Later
          </button>
          <button class="btn focusable" onclick={onSkip} data-id="skip">
            Skip This Version
          </button>
        {:else}
          <button class="btn" disabled>Working…</button>
        {/if}
      </div>

      <div class="footer">
        <button class="link focusable" onclick={onRefresh}>↻ Re-check</button>
        <a class="link" href={release.htmlUrl} target="_blank" rel="noopener">
          View on GitHub ↗
        </a>
      </div>
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    padding: 20px;
  }

  .modal {
    background: linear-gradient(180deg, #14141c 0%, #05050a 100%);
    border: 2px solid var(--accent);
    border-radius: 10px;
    padding: 24px 28px;
    width: min(640px, 100%);
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    gap: 16px;
    box-shadow: 0 0 80px rgba(255, 215, 0, 0.4);
  }

  .header {
    text-align: center;
    padding-bottom: 14px;
    border-bottom: 1px solid var(--bg-3);
  }

  .badge {
    display: inline-block;
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.2em;
    color: var(--accent);
    background: rgba(255, 215, 0, 0.1);
    border: 1px solid var(--accent);
    padding: 3px 10px;
    border-radius: 2px;
    margin-bottom: 8px;
  }

  .title {
    font-family: var(--font-display);
    font-size: 36px;
    color: var(--accent);
    margin-bottom: 4px;
    text-shadow: 0 0 18px rgba(255, 215, 0, 0.5);
  }

  .sub {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--fg-2);
    letter-spacing: 0.05em;
  }

  .body {
    flex: 1;
    overflow: auto;
    background: var(--bg-1);
    border: 1px solid var(--bg-3);
    border-radius: 4px;
    padding: 16px;
    min-height: 120px;
    max-height: 40vh;
  }

  .notes {
    font-family: var(--font-mono);
    font-size: 13px;
    line-height: 1.6;
    color: var(--fg-1);
  }

  .notes :global(h2) { font-family: var(--font-display); color: var(--accent); font-size: 18px; margin: 12px 0 6px; }
  .notes :global(h3) { font-family: var(--font-display); color: var(--accent-soft); font-size: 15px; margin: 10px 0 4px; }
  .notes :global(h4) { color: var(--fg-0); font-size: 14px; margin: 8px 0 4px; }
  .notes :global(ul) { padding-left: 20px; margin: 6px 0; }
  .notes :global(li) { margin: 2px 0; }
  .notes :global(code) {
    background: var(--bg-2);
    padding: 1px 5px;
    border-radius: 2px;
    color: var(--success);
  }
  .notes :global(b) { color: var(--fg-0); }
  .notes :global(.empty) { color: var(--fg-3); font-style: italic; }

  .progress {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    background: var(--bg-1);
    border: 1px solid var(--bg-3);
    border-radius: 4px;
  }

  .progress.error {
    border-color: var(--danger);
    color: var(--danger);
  }

  .status-line {
    flex: 1;
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--fg-1);
  }

  .progress.error .status-line { color: var(--danger); }

  .bar {
    flex: 2;
    height: 6px;
    background: var(--bg-3);
    border-radius: 3px;
    overflow: hidden;
  }

  .fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent) 0%, var(--accent-soft) 100%);
    transition: width 100ms;
  }

  .percent {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--accent);
    width: 36px;
    text-align: right;
  }

  .actions {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    gap: 8px;
  }

  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 8px;
    border-top: 1px solid var(--bg-3);
  }

  .link {
    background: none;
    border: none;
    color: var(--fg-2);
    font-family: var(--font-mono);
    font-size: 11px;
    text-decoration: none;
    cursor: pointer;
    padding: 4px 8px;
  }

  .link:hover, .link:focus, .link.focused {
    color: var(--accent);
    text-decoration: underline;
  }
</style>
