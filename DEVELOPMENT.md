# Development Workflow

## Quick start: dev server in browser

```bash
# From the project root
npm install              # first time only
npm run dev              # starts Vite at http://localhost:5173
```

Then open **http://localhost:5173** in Chrome. Hot Module Replacement is enabled — save a file, browser auto-reloads.

For convenience, there's a one-shot launcher:
```bash
pwsh scripts/dev.ps1
```
This starts the server and opens the browser automatically.

## Chrome DevTools (the killer feature)

Press **F12** in Chrome to open DevTools. You get:

- **Console tab** — every `console.log()` from the game, plus warnings/errors. This is your #1 debugging tool.
- **Elements tab** — inspect the DOM, see what classes are applied, what's hidden.
- **Network tab** — see every GitHub API call, APK download, etc.
- **Sources tab** — set breakpoints in the actual TypeScript source, step through code.

The game throws everything at the console. Click "Enter Dungeon" and watch the logs stream in. You'll see exactly which step fails.

## Diagnostics built into the game

Three independent diagnostic channels, so at least one will work:

1. **DEBUG bar at the bottom of the Town screen**
   - Plain DOM element, updated via `setDomStatus()`
   - Bypasses Svelte reactivity entirely
   - Should always show the latest step on click

2. **DebugOverlay (top-right or bottom-right)**
   - Press **Ctrl+Shift+D** or **`** to toggle
   - Shows route, native status, gamepad, version, updater
   - Polls `window.__lastClick` and `window.__lastError` every 300ms

3. **Browser console (F12)**
   - Every step logs with `[goDungeon]` prefix
   - `[doc click]` shows what element was actually clicked (if any)
   - `[router]` logs every navigation

## Testing on the handheld

The dev server works on the handheld too, via USB + Capacitor's live reload:

```bash
# Terminal 1: start dev server
npm run dev

# Terminal 2: deploy to connected handheld (USB debugging enabled)
npx cap run android --target=<device-id>
```

For quick sideload testing without dev server:

```bash
npm run android:apk     # full build pipeline
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

## Build pipeline

```
src/*.svelte + .ts
  → vite build      (bundles, minifies, ~460 KB gzipped)
  → cap sync        (copies to android/app/src/main/assets/public)
  → gradle assembleRelease  (compiles to APK, signs with keystore)
  → android/app/build/outputs/apk/release/app-release.apk
```

Run `pwsh scripts/build-apk.ps1` to do all three steps in sequence.

## Releasing to GitHub

1. Bump version in `package.json` and `android/app/build.gradle`
2. Build the APK
3. Commit + push the new APK
4. Tag + push the tag
5. Create the GitHub Release with the APK as an asset (see `scripts/create-release.ps1`)

The in-game auto-updater will pick it up on the user's next launch.

## Folder layout

```
src/
  core/        engine, state, save, types, router
  data/        static data (rarities, items, affixes, classes)
  systems/     combat, loot, procgen, spawns
  ui/
    routes/    full-screen pages
    components/  reusable widgets
  vfx/         Pixi.js particles
  platform/    gamepad, keyboard, touch, focus, capacitor, updater
  audio/       (planned) Tone.js synth
android/       Capacitor-generated Android project
keystores/     self-signed keystore (gitignored)
releases/      downloadable APKs per version
scripts/       dev / build / release PowerShell scripts
```

## Common gotchas

- **Svelte 5 runes mode is on by default.** Local `let` variables are NOT reactive — use `let foo = $state("...")`. Stores (like `player`) are always reactive via the `$` prefix.
- **`on:click` syntax still works but `onclick` is preferred.** I just converted everything to the new syntax.
- **Capacitor uses `https://localhost` as the in-app origin** — that's the bundled assets being served via file://, not a dev server. Don't be confused by `localhost` in the URL bar.
