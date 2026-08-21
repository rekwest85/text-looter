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

  function readPath(): string {
    if (typeof window === "undefined") return "/";
    const hash = (window.location.hash || "#/").slice(1);
    return hash.startsWith("/") ? hash : `/${hash}`;
  }

  let currentPath: string = $state(readPath());

  function setPath(p: string) {
    console.log("[App.svelte] setPath:", p, "from:", currentPath);
    currentPath = p;
  }

  let pollTimer: any = null;

  onMount(() => {
    // Update once on mount in case hash changed before mount
    const initial = readPath();
    console.log("[App.svelte] mount, currentPath:", currentPath, "hash:", initial);
    if (initial !== currentPath) currentPath = initial;

    // Listen to hashchange
    const onHashChange = () => {
      const p = readPath();
      console.log("[App.svelte] hashchange ->", p);
      currentPath = p;
    };
    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("popstate", onHashChange);

    // Also poll every 200ms as fallback (in case hashchange doesn't fire)
    pollTimer = setInterval(() => {
      const p = readPath();
      if (p !== currentPath) {
        console.log("[App.svelte] poll detected path change ->", p);
        currentPath = p;
      }
    }, 200);

    return () => {
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("popstate", onHashChange);
      if (pollTimer) clearInterval(pollTimer);
    };
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
    {:else if currentPath === "/dungeon"}  Dungeon ← SHOULD RENDER
    {:else if currentPath === "/inventory"} Inventory
    {:else if currentPath === "/settings"}  SettingsRoute
    {:else}                       NONE
    {/if}
  </div>

  <!-- Direct test buttons that bypass everything -->
  <div style="position:fixed;top:48px;left:0;right:0;background:#0066cc;color:#fff;padding:6px 12px;font-family:monospace;font-size:12px;z-index:99999;text-align:center;display:flex;gap:8px;justify-content:center;">
    <button onclick={() => setPath("/town")} style="padding:4px 10px;background:#333;color:#fff;border:1px solid #fff;cursor:pointer;font-family:monospace;">→ TOWN</button>
    <button onclick={() => setPath("/dungeon")} style="padding:4px 10px;background:#333;color:#fff;border:1px solid #fff;cursor:pointer;font-family:monospace;">→ DUNGEON (DIRECT)</button>
    <button onclick={() => setPath("/inventory")} style="padding:4px 10px;background:#333;color:#fff;border:1px solid #fff;cursor:pointer;font-family:monospace;">→ INVENTORY</button>
    <span style="font-size:11px;color:#ffcc00;">↑ if THESE buttons don't change the banner, Svelte reactivity is broken in this build</span>
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
