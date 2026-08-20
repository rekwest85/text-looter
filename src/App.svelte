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
  import { route, registerRoute, getComponent } from "./core/router";
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
  let CurrentComponent: any = null;

  $: CurrentComponent = getComponent($route);

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

    // Non-blocking Pixi init (with timeout safety)
    Promise.race([
      initPixi(pixiHost).catch((e) => console.warn("pixi init", e)),
      new Promise((res) => setTimeout(res, 3000)),
    ]);

    // Non-blocking update check
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
  <ErrorBoundary>
    {#if CurrentComponent}
      <svelte:component this={CurrentComponent} />
    {:else}
      <div class="error-fallback">
        <h2>Route not found: {$route}</h2>
        <button on:click={() => (window.location.hash = "/")}>Return Home</button>
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
