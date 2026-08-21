<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { saveSlots, settings } from "./core/state";
  import { initGamepad } from "./platform/gamepad";
  import { initKeyboard } from "./platform/keyboard";
  import { initTouch } from "./platform/touch";
  import { initFocus } from "./platform/focus";
  import { initCapacitor } from "./platform/capacitor";
  import { checkForUpdate } from "./platform/updater";
  import { loadSettings, listSaveSlots } from "./core/save";
  import { initPixi } from "./vfx/PixiApp";
  import { registerRoute } from "./core/router";
  import ErrorBoundary from "./ui/components/ErrorBoundary.svelte";
  import UpdatePrompt from "./ui/components/UpdatePrompt.svelte";
  import DebugOverlay from "./ui/components/DebugOverlay.svelte";

  import MainMenu from "./ui/routes/MainMenu.svelte";
  import Town from "./ui/routes/Town.svelte";
  import Dungeon from "./ui/routes/Dungeon.svelte";
  import CreateChar from "./ui/routes/CreateChar.svelte";
  import SettingsRoute from "./ui/routes/Settings.svelte";
  import Inventory from "./ui/routes/Inventory.svelte";

  registerRoute("/", MainMenu);
  registerRoute("/create", CreateChar);
  registerRoute("/town", Town);
  registerRoute("/dungeon", Dungeon);
  registerRoute("/inventory", Inventory);
  registerRoute("/settings", SettingsRoute);

  let pixiHost: HTMLDivElement;

  // Bypass the Svelte store entirely. Read window.location.hash directly into
  // $state. The hashchange listener calls updatePath() which mutates the
  // $state, which IS guaranteed to trigger a re-render in Svelte 5 runes mode.
  // The previous approach using `$route` (auto-subscription) wasn't reliably
  // re-rendering the template when the route changed.
  function readPath(): string {
    if (typeof window === "undefined") return "/";
    const hash = (window.location.hash || "#/").slice(1);
    return hash.startsWith("/") ? hash : `/${hash}`;
  }

  let currentPath: string = $state(readPath());

  function updatePath() {
    const p = readPath();
    console.log("[App.svelte] hashchange ->", p);
    currentPath = p;
  }

  onMount(() => {
    updatePath();
    window.addEventListener("hashchange", updatePath);
    window.addEventListener("popstate", updatePath);
  });

  onDestroy(() => {
    window.removeEventListener("hashchange", updatePath);
    window.removeEventListener("popstate", updatePath);
  });

  async function boot() {
    try { await initCapacitor(); } catch (e) { console.warn("capacitor init", e); }

    try {
      const saved = await loadSettings();
      if (saved) {
        settings.set({
          musicVolume: saved.musicVolume,
          sfxVolume: saved.sfxVolume,
          ambienceVolume: saved.ambienceVolume,
          particlesEnabled: saved.particlesEnabled,
          motionBlur: saved.motionBlur,
          reduceMotion: saved.reduceMotion,
          colorblindMode: saved.colorblindMode as any,
          textSize: saved.textSize as any,
          gamepadDeadzone: saved.gamepadDeadzone,
          showTouchOverlay: saved.showTouchOverlay,
        });
      }
      const slots = await listSaveSlots();
      saveSlots.set(slots);
    } catch (e) {
      console.warn("DB load failed", e);
    }

    try { initGamepad(); } catch (e) { console.warn("gamepad init", e); }
    try { initKeyboard(); } catch (e) { console.warn("keyboard init", e); }
    try { initTouch(); } catch (e) { console.warn("touch init", e); }
    try { initFocus(); } catch (e) { console.warn("focus init", e); }

    Promise.race([
      initPixi(pixiHost).catch((e) => console.warn("pixi init", e)),
      new Promise((res) => setTimeout(res, 3000)),
    ]);

    checkForUpdate().catch((e) => console.warn("update check", e));
  }

  onMount(() => {
    boot();
  });
</script>

<svelte:head>
  <meta name="theme-color" content="#050507" />
</svelte:head>

<div class="game-frame">
  <!-- Big visible indicator -->
  <div style="position:fixed;top:0;left:0;right:0;background:#ff3c3c;color:#fff;padding:6px 12px;font-family:monospace;font-size:14px;z-index:99999;text-align:center;font-weight:bold;">
    ROUTE=[{currentPath}] COMPONENT=
    {#if currentPath === "/"}      MainMenu
    {:else if currentPath === "/create"}   CreateChar
    {:else if currentPath === "/town"}     Town
    {:else if currentPath === "/dungeon"}  Dungeon ← CLICK SHOULD CHANGE THIS
    {:else if currentPath === "/inventory"} Inventory
    {:else if currentPath === "/settings"}  SettingsRoute
    {:else}                       NONE
    {/if}
  </div>
  <ErrorBoundary>
    {#if currentPath === "/"}
      <MainMenu />
    {:else if currentPath === "/create"}
      <CreateChar />
    {:else if currentPath === "/town"}
      <Town />
    {:else if currentPath === "/dungeon"}
      <Dungeon />
    {:else if currentPath === "/inventory"}
      <Inventory />
    {:else if currentPath === "/settings"}
      <SettingsRoute />
    {:else}
      <div class="error-fallback">
        <h2>Route not found: {currentPath}</h2>
        <button onclick={() => (window.location.hash = "/")}>Return Home</button>
      </div>
    {/if}
  </ErrorBoundary>
  <div bind:this={pixiHost} class="pixi-host"></div>
  <UpdatePrompt />
  <DebugOverlay />
</div>

<style>
  :global(body) {
    background: #000;
  }

  .error-fallback {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    color: #fff;
    background: #050507;
  }

  .error-fallback button {
    background: #ffd700;
    color: #050507;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
  }
</style>
