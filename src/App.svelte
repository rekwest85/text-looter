<script lang="ts">
  import { onMount } from "svelte";
  import Router from "svelte-spa-router";
  import { route, saveSlots, settings } from "./core/state";
  import { initGamepad } from "./platform/gamepad";
  import { initKeyboard } from "./platform/keyboard";
  import { initTouch } from "./platform/touch";
  import { initFocus } from "./platform/focus";
  import { initCapacitor } from "./platform/capacitor";
  import { checkForUpdate } from "./platform/updater";
  import { db, loadSettings, listSaveSlots } from "./core/save";
  import { initPixi } from "./vfx/PixiApp";
  import UpdatePrompt from "./ui/components/UpdatePrompt.svelte";

  import MainMenu from "./ui/routes/MainMenu.svelte";
  import Town from "./ui/routes/Town.svelte";
  import Dungeon from "./ui/routes/Dungeon.svelte";
  import CreateChar from "./ui/routes/CreateChar.svelte";
  import SettingsRoute from "./ui/routes/Settings.svelte";
  import Inventory from "./ui/routes/Inventory.svelte";

  const routes = {
    "/": MainMenu,
    "/create": CreateChar,
    "/town": Town,
    "/dungeon": Dungeon,
    "/inventory": Inventory,
    "/settings": SettingsRoute,
  };

  let pixiHost: HTMLDivElement;

  async function boot() {
    await initCapacitor();

    // Load saved settings + slots
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

    // Init input layer
    initGamepad();
    initKeyboard();
    initTouch();
    initFocus();

    // Init Pixi for VFX
    try {
      await initPixi(pixiHost);
    } catch (e) {
      console.warn("Pixi init failed", e);
    }

    // Check for updates (non-blocking — runs in the background, throttled to
    // 4 hours between calls; the modal will appear if a newer version is found)
    checkForUpdate().catch((e) => console.warn("update check failed", e));
  }

  onMount(() => {
    boot();
  });
</script>

<svelte:head>
  <meta name="theme-color" content="#050507" />
</svelte:head>

<div class="game-frame">
  <Router {routes} />
  <div bind:this={pixiHost} class="pixi-host"></div>
  <UpdatePrompt />
</div>

<style>
  :global(body) {
    background: #000;
  }
</style>
