/**
 * Auto-updater — checks GitHub Releases for a newer version on launch.
 *
 * Flow:
 *   1. On boot, query `https://api.github.com/repos/{owner}/{repo}/releases/latest`
 *   2. Compare semver of the latest tag with the installed version
 *   3. If newer, surface a modal in the UI with release notes
 *   4. On user confirmation, download the APK + open the system installer
 *
 * The user can "Skip this version" — we remember the skip in localStorage so
 * they never see that version again.
 */
import { writable, get, type Writable } from "svelte/store";
import { isNative } from "../core/state";

export interface GitHubRelease {
  tag: string;
  version: string;          // tag with leading "v" stripped
  name: string;
  body: string;
  htmlUrl: string;
  publishedAt: string;
  assetUrl: string | null;  // direct .apk download URL
  assetSize: number;
  assetName: string | null;
  prerelease: boolean;
}

export type UpdaterStatus =
  | "idle"
  | "checking"
  | "up-to-date"
  | "update-available"
  | "downloading"
  | "downloaded"
  | "installing"
  | "error";

export const updaterStatus: Writable<UpdaterStatus> = writable("idle");
export const updaterMessage: Writable<string> = writable("");
export const updaterDownloadProgress: Writable<number> = writable(0);  // 0..1
export const availableUpdate: Writable<GitHubRelease | null> = writable(null);
export const installedVersion: Writable<string> = writable("0.0.0");

// ─── Config ──────────────────────────────────────────────────────────────────

const REPO_OWNER = "rekwest85";
const REPO_NAME = "text-looter";
const API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest`;
const STORAGE_KEY_DISMISSED = "text-looter.dismissed-versions";
const STORAGE_KEY_LAST_CHECK = "text-looter.last-update-check";
const CHECK_THROTTLE_MS = 1000 * 60 * 60 * 4;  // 4 hours

// ─── Version helpers ─────────────────────────────────────────────────────────

/** Parse "v0.2.3" → [0, 2, 3]; "0.2" → [0, 2, 0]. */
function parseVersion(v: string): number[] {
  const s = v.replace(/^v/i, "").trim();
  const parts = s.split(/[.\-+]/).map((p) => parseInt(p, 10) || 0);
  while (parts.length < 3) parts.push(0);
  return parts.slice(0, 3);
}

export function compareVersions(a: string, b: string): number {
  const av = parseVersion(a);
  const bv = parseVersion(b);
  for (let i = 0; i < 3; i++) {
    if (av[i] !== bv[i]) return av[i] - bv[i];
  }
  return 0;
}

export function isNewer(latest: string, current: string): boolean {
  return compareVersions(latest, current) > 0;
}

// ─── Storage helpers ─────────────────────────────────────────────────────────

function getDismissed(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DISMISSED);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch { return []; }
}

function addDismissed(version: string) {
  const list = getDismissed();
  if (!list.includes(version)) {
    list.push(version);
    try { localStorage.setItem(STORAGE_KEY_DISMISSED, JSON.stringify(list)); } catch {}
  }
}

function shouldThrottle(): boolean {
  try {
    const last = parseInt(localStorage.getItem(STORAGE_KEY_LAST_CHECK) || "0", 10);
    return Date.now() - last < CHECK_THROTTLE_MS;
  } catch { return false; }
}

function markChecked() {
  try { localStorage.setItem(STORAGE_KEY_LAST_CHECK, String(Date.now())); } catch {}
}

// ─── Installed version ───────────────────────────────────────────────────────

async function getInstalledVersion(): Promise<string> {
  if (get(isNative)) {
    try {
      const { App } = await import("@capacitor/app");
      const info = await App.getInfo();
      if (info?.version) {
        installedVersion.set(info.version);
        return info.version;
      }
    } catch (e) { /* fall through */ }
  }
  // Fallback for browser / dev: Vite build-time env or package.json
  // @ts-ignore - injected by Vite
  const fromBuild = (import.meta as any).env?.VITE_APP_VERSION;
  if (fromBuild) {
    installedVersion.set(fromBuild);
    return fromBuild;
  }
  installedVersion.set("0.0.0");
  return "0.0.0";
}

// ─── GitHub API ──────────────────────────────────────────────────────────────

interface GhApiRelease {
  tag_name: string;
  name: string;
  body: string;
  html_url: string;
  published_at: string;
  prerelease: boolean;
  assets: Array<{
    name: string;
    browser_download_url: string;
    size: number;
    content_type: string;
  }>;
}

function findApkAsset(assets: GhApiRelease["assets"]): GhApiRelease["assets"][number] | null {
  return assets.find((a) => a.name.toLowerCase().endsWith(".apk")) || null;
}

async function fetchLatestRelease(): Promise<GitHubRelease | null> {
  try {
    const res = await fetch(API_URL, {
      headers: { "Accept": "application/vnd.github+json" },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as GhApiRelease;
    const apk = findApkAsset(data.assets);
    return {
      tag: data.tag_name,
      version: data.tag_name.replace(/^v/i, ""),
      name: data.name || data.tag_name,
      body: data.body || "",
      htmlUrl: data.html_url,
      publishedAt: data.published_at,
      assetUrl: apk?.browser_download_url ?? null,
      assetSize: apk?.size ?? 0,
      assetName: apk?.name ?? null,
      prerelease: data.prerelease,
    };
  } catch (e) {
    console.warn("update check failed", e);
    return null;
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Check the GitHub release. Returns the release if it's newer and not skipped,
 * otherwise null. Updates `availableUpdate` store.
 */
export async function checkForUpdate(opts: { force?: boolean } = {}): Promise<GitHubRelease | null> {
  if (!opts.force && shouldThrottle()) {
    return get(availableUpdate);
  }
  markChecked();

  updaterStatus.set("checking");
  updaterMessage.set("Checking for updates…");

  const current = await getInstalledVersion();
  const release = await fetchLatestRelease();
  if (!release) {
    updaterStatus.set("up-to-date");
    updaterMessage.set("");
    availableUpdate.set(null);
    return null;
  }
  if (release.prerelease) {
    updaterStatus.set("up-to-date");
    updaterMessage.set("Latest is a pre-release; skipping.");
    availableUpdate.set(null);
    return null;
  }

  const dismissed = getDismissed();
  if (dismissed.includes(release.version)) {
    updaterStatus.set("up-to-date");
    updaterMessage.set(`v${release.version} skipped.`);
    availableUpdate.set(null);
    return null;
  }

  if (!isNewer(release.version, current)) {
    updaterStatus.set("up-to-date");
    updaterMessage.set(`v${current} is up to date.`);
    availableUpdate.set(null);
    return null;
  }

  updaterStatus.set("update-available");
  updaterMessage.set(`v${release.version} available`);
  availableUpdate.set(release);
  return release;
}

export function dismissCurrent() {
  const rel = get(availableUpdate);
  if (rel) {
    addDismissed(rel.version);
    availableUpdate.set(null);
    updaterStatus.set("up-to-date");
    updaterMessage.set(`v${rel.version} dismissed for this device.`);
  }
}

export function clearUpdatePrompt() {
  availableUpdate.set(null);
  updaterStatus.set("up-to-date");
  updaterMessage.set("");
}

/**
 * Download the APK and open the system installer.
 * - On native Android: uses Capacitor Filesystem + file-opener
 * - On browser / dev: opens the release page in a new tab
 */
export async function downloadAndInstall(release: GitHubRelease): Promise<void> {
  if (!release.assetUrl) {
    updaterMessage.set("Release has no APK asset.");
    return;
  }

  if (!get(isNative)) {
    // Dev / browser fallback: open release page
    const { Browser } = await import("@capacitor/browser");
    await Browser.open({ url: release.htmlUrl });
    return;
  }

  updaterStatus.set("downloading");
  updaterMessage.set("Downloading update…");
  updaterDownloadProgress.set(0);

  try {
    const { Filesystem, Directory } = await import("@capacitor/filesystem");
    const { FileOpener } = await import("@capacitor-community/file-opener");

    // 1. Download with progress
    const response = await fetch(release.assetUrl);
    if (!response.ok) throw new Error(`Download failed: ${response.status}`);

    const contentLength = parseInt(response.headers.get("Content-Length") || "0", 10);
    const reader = response.body?.getReader();
    let received = 0;
    const chunks: Uint8Array[] = [];

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        if (contentLength > 0) {
          updaterDownloadProgress.set(received / contentLength);
        }
      }
    } else {
      const buf = await response.arrayBuffer();
      chunks.push(new Uint8Array(buf));
      received = buf.byteLength;
    }

    // 2. Combine into one buffer and convert to base64
    const total = chunks.reduce((a, c) => a + c.length, 0);
    const merged = new Uint8Array(total);
    let off = 0;
    for (const c of chunks) { merged.set(c, off); off += c.length; }

    let binary = "";
    for (let i = 0; i < merged.length; i++) binary += String.fromCharCode(merged[i]);
    const base64 = btoa(binary);

    // 3. Write to cache
    const filename = `text-looter-${release.version}.apk`;
    const writeResult = await Filesystem.writeFile({
      path: filename,
      data: base64,
      directory: Directory.Cache,
      recursive: true,
    });

    updaterStatus.set("installing");
    updaterMessage.set("Launching installer…");

    // 4. Open with system installer
    await FileOpener.open({
      filePath: writeResult.uri,
      contentType: "application/vnd.android.package-archive",
    });
  } catch (e: any) {
    console.error("update install failed", e);
    updaterStatus.set("error");
    updaterMessage.set(e?.message || "Update failed");
  }
}
