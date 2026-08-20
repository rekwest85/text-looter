# Releases

Downloadable APKs for sideloading onto Android handhelds. No Play Store, no signing service.

## v0.1.3 — ReferenceError fix

[Download APK](v0.1.3/text-looter-v0.1.3.apk) (3.42 MB)

**Critical fix:**
- `ReferenceError: focusable is not defined` in `Inventory.svelte` was throwing on every page load. The `class:focusable` Svelte directive (with no value) compiled to `class:focusable={focusable}` in Svelte 5, which references a non-existent variable. Fixed by including `focusable` in the class string instead. This was the actual root cause of the freeze — the Inventory page was crashing before it could render, and the error boundary was catching it as a fatal error that left the screen looking frozen.

This is the build to actually test the freeze fix on. v0.1.2 had a hidden ReferenceError that the error boundary was catching but rendering as a "freeze" because the red error modal looked the same to you as a stuck screen.

**Install:**
1. Tap the APK link above from the GitHub app → download → install (will auto-update from v0.1.1 or v0.1.2)
2. Launch "Text Looter RPG"
3. New Game → choose class → Town → tap **Enter Dungeon** → should load the dungeon
4. Tap **Inventory** → should load the 20-slot equipment grid

**Tested on:** AYN Thor (16:9), RG 477V (4:3)

## v0.1.2 — Freeze fixes + custom router

[Download APK](v0.1.2/text-looter-v0.1.2.apk) (3.42 MB)

**What's fixed (the freeze on Enter Dungeon / Inventory):**
- **Replaced svelte-spa-router with a tiny custom hash router** — the external router was the prime suspect for the "nothing happens" symptom. Our router is ~60 lines, fully owned, and has no async surprise.
- **Combat tick is now started in `Dungeon.svelte` `onMount`** — previously it was started in `Town.svelte` *before* navigation. The tick fired on a route that was about to unmount, so by the time the user got to the dungeon, combat was already stopped and the render loop was spinning on stale enemies. Moving it to the dungeon mount makes the lifecycle correct.
- **Fixed `location.zoneId` access bug** — in `Town.svelte` we were reading `.zoneId` off the Svelte store *object* instead of the value. The seed silently became `"undefined-floor1"`. Now using `get(location)` to read the value.
- **Added an ErrorBoundary** — any uncaught error (window.error + unhandledrejection) now pops a red modal with the stack trace and a Restart button, instead of silently freezing.
- **Added a DebugOverlay** — press <code>Ctrl+Shift+D</code> (or <code>\`</code>) in-game to see current route, native status, gamepad status, version, and updater state. Use this to triage any future freeze.
- **Wrapped the combat tick + render tick in try/catch** so a transient error in one frame doesn't kill the loop forever.
- **Made Pixi initialization non-blocking** with a 3s timeout, so if WebGL init hangs on a particular device, the game still plays.
- **Made boot() defensive** — every init step is wrapped in try/catch, so one failure can't take the whole app down.

**Auto-update test path:**
1. You should already have v0.1.1 installed (or v0.1.0 — both will see v0.1.2 as newer)
2. Launch the app
3. After ~1s the update prompt should appear with **v0.1.2 available**
4. Tap **Update Now** → APK downloads with progress bar → system installer opens → tap Install
5. Launch the new app — the prompt is gone (you're on latest)

**What's in the build (same as v0.1.1, plus the fixes above):**
- Main menu, character creation, town, procedural dungeons, combat tick, 20-tier loot, inventory (20 slots), gamepad/keyboard/touch input, particle VFX, save system, auto-updater

**Install:**
1. On your Android device, enable "Install from unknown sources" for your file manager
2. Tap the APK link above from the GitHub app → download → install
3. Launch "Text Looter RPG"

Or via ADB:
```bash
adb install -r text-looter-v0.1.2.apk
```

**Tested on:** AYN Thor (16:9), RG 477V (4:3)

## v0.1.1 — Auto-updater

[Download APK](v0.1.1/text-looter-v0.1.1.apk) (3.42 MB)

## v0.1.0 — Phase 0 skeleton

[Download APK](v0.1.0/text-looter-v0.1.0.apk) (3.25 MB)
