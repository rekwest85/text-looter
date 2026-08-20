# Releases

Downloadable APKs for sideloading onto Android handhelds. No Play Store, no signing service.

## v0.1.1 — Auto-update + native plugins

[Download APK](v0.1.1/text-looter-v0.1.1.apk) (3.42 MB)

**New:**
- **Auto-updater** — on launch, the app calls the GitHub Releases API. If a newer version exists, you get a modal with the release notes and a one-tap "Update Now" button. It downloads the APK in the background with a progress bar, then opens the Android system installer. The app restarts into the new version.
- "Later" and "Skip This Version" buttons. Skipped versions are remembered per-device.
- Throttled to one check every 4 hours (no API spam).
- New Capacitor plugins bundled: filesystem, file-opener, browser (used by the updater).

**Bugs fixed (from v0.1.0):**
- Combat loop was never running (running flag was false on init) — fixed
- Town.svelte had a broken player-position lookup — fixed
- Layout was hardcoded 4:3 — now responsive, fills viewport at 16:9 and 4:3
- Dungeon canvas now auto-resizes to the screen

**What's in the build (same as v0.1.0 plus the above):**
- Main menu, character creation, town, procedural dungeons, combat tick, 20-tier loot, inventory (20 slots), gamepad/keyboard/touch input, particle VFX, save system

**Install:**
1. On your Android device, enable "Install from unknown sources" for your file manager
2. Tap the APK link above from the GitHub app → download → install
3. Launch "Text Looter RPG"

Or via ADB:
```bash
adb install -r text-looter-v0.1.1.apk
```

**Tested on:** AYN Thor (16:9), RG 477V (4:3)

## v0.1.0 — Phase 0 skeleton

[Download APK](v0.1.0/text-looter-v0.1.0.apk) (3.25 MB)
