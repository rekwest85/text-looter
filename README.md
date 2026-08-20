# Text Looter RPG

A controller-first, heavy-loot, text-and-buttons ARPG for Android handhelds (RG 477V, AYN Thor, Odin Portal). Single APK, unsigned sideload, no Play Store.

## Stack
- **Svelte 5** + **TypeScript** + **Vite** for the UI
- **Pixi.js 8** for 2D WebGL particles / VFX / loot beams
- **svelte-spa-router** for hash-based routing
- **Dexie** (IndexedDB) for saves
- **Tone.js** for synthesized audio
- **Capacitor 8** for the Android wrapper (apksigner-signed, self-distributed)

## Quick start (dev)
```bash
npm install
npm run dev          # vite dev server
```

## Build APK
```bash
npm run android:apk  # full pipeline: vite build → cap sync → gradle assembleRelease
```
Output: `android/app/build/outputs/apk/release/app-release.apk`

## Install on device
```bash
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

## Project layout
```
src/
  core/        engine, state, RNG, save (Dexie), types
  data/        static game data (rarities, items, affixes, zones)
  systems/     combat, loot, procgen, spawns
  ui/
    routes/    full-screen pages (MainMenu, Town, Dungeon, Inventory, Settings, CreateChar)
    components/  reusable widgets (LootModal, CombatLog, ActionBar)
  vfx/         Pixi.js overlay (loot beams, screen FX)
  platform/    input layer (gamepad, keyboard, touch, focus mgmt) + Capacitor bridge
  audio/       synth audio (Tone.js)
android/       Capacitor-generated Android project
keystores/     self-signed keystore for sideload distribution
```

## Build prerequisites
- Node.js 18+
- Java JDK 21 (set `JAVA_HOME`)
- Android SDK (set `ANDROID_HOME`) with platform-tools and build-tools 35+

## Game design
See `GAME_DESIGN.md` for the full design document.
