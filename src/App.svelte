/**
 * App.svelte — uses vanilla DOM manipulation for routing because Svelte 5
 * reactivity appears broken in some browser environments. All views are
 * mounted at startup; we toggle their visibility with plain JS.
 */
<script lang="ts">
  import { onMount } from "svelte";
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

  // ─── Vanilla-DOM view switcher ──────────────────────────────────────
  // We don't rely on Svelte's $state / $derived / $effect at all here.
  // Just a plain JS function that toggles `display` on each view container.

  function readPath(): string {
    if (typeof window === "undefined") return "/";
    const h = (window.location.hash || "#/").slice(1);
    return h.startsWith("/") ? h : "/" + h;
  }

  function viewNameFromPath(p: string): string {
    // "/" -> "root", "/town" -> "town", "/dungeon" -> "dungeon"
    const stripped = p.replace(/^\//, "");
    return stripped === "" ? "root" : stripped;
  }

  function showView(path: string) {
    const want = viewNameFromPath(path);
    console.log("[App.svelte] showView:", want);
    const els = document.querySelectorAll<HTMLElement>("[data-view]");
    let shown = 0;
    els.forEach((el) => {
      const isMatch = el.getAttribute("data-view") === want;
      el.style.display = isMatch ? "" : "none";
      if (isMatch) shown++;
    });
    console.log("[App.svelte] shown views:", shown);
    // Update banner if present
    const banner = document.getElementById("__app_banner");
    if (banner) banner.textContent = `PATH=${path} VIEW=${want} SHOWN=${shown}`;
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  }

  // Expose for debug overlay / console use
  function navigateTo(p: string) {
    if (typeof window !== "undefined") {
      window.location.hash = p;
    }
  }

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
    // Set up vanilla JS hash routing
    const onHash = () => showView(readPath());
    window.addEventListener("hashchange", onHash);
    window.addEventListener("popstate", onHash);
    // Show initial view after the DOM is mounted
    setTimeout(onHash, 0);

    // Global test helpers
    (window as any).__showView = showView;
    (window as any).__navigateTo = navigateTo;
    (window as any).__readPath = readPath;

    boot();
  });
</script>

<svelte:head>
  <meta name="theme-color" content="#050507" />
</svelte:head>

<!-- Big diagnostic banner -->
<div
  id="__app_banner"
  style="position:fixed;top:0;left:0;right:0;background:#ff3c3c;color:#fff;padding:6px 12px;font-family:monospace;font-size:13px;z-index:99999;text-align:center;font-weight:bold;"
>
  PATH=... VIEW=... SHOWN=0
</div>

<!-- Direct test buttons that use vanilla DOM -->
<div style="position:fixed;top:36px;left:0;right:0;background:#0066cc;color:#fff;padding:6px 12px;font-family:monospace;font-size:12px;z-index:99999;text-align:center;display:flex;gap:6px;justify-content:center;flex-wrap:wrap;">
  <button onclick={() => (window as any).__showView("/town")} style="padding:4px 10px;background:#333;color:#fff;border:1px solid #fff;cursor:pointer;font-family:monospace;">→ TOWN (vanilla)</button>
  <button onclick={() => (window as any).__showView("/dungeon")} style="padding:4px 10px;background:#333;color:#fff;border:1px solid #fff;cursor:pointer;font-family:monospace;">→ DUNGEON (vanilla)</button>
  <button onclick={() => (window as any).__showView("/inventory")} style="padding:4px 10px;background:#333;color:#fff;border:1px solid #fff;cursor:pointer;font-family:monospace;">→ INVENTORY</button>
  <button onclick={() => (window as any).__showView("/settings")} style="padding:4px 10px;background:#333;color:#fff;border:1px solid #fff;cursor:pointer;font-family:monospace;">→ SETTINGS</button>
  <button onclick={() => (window as any).__showView("/")} style="padding:4px 10px;background:#333;color:#fff;border:1px solid #fff;cursor:pointer;font-family:monospace;">→ ROOT</button>
</div>

<!-- All views mounted at once, only one visible at a time. Vanilla DOM toggles. -->
<div class="game-frame">
  <ErrorBoundary>
    <div data-view="root" style="display:none;"><MainMenu /></div>
    <div data-view="create" style="display:none;"><CreateChar /></div>
    <div data-view="town"><Town /></div>
    <div data-view="dungeon" style="display:none;"><Dungeon /></div>
    <div data-view="inventory" style="display:none;"><Inventory /></div>
    <div data-view="settings" style="display:none;"><SettingsRoute /></div>
  </ErrorBoundary>
  <div bind:this={pixiHost} class="pixi-host"></div>
  <UpdatePrompt />
  <DebugOverlay />
</div>

<style>
  :global(body) {
    background: #000;
  }
</style>
