/**
 * Focus management — keyboard / gamepad navigation through focusable elements.
 *
 * Usage:
 *   <button class="focusable">...</button>
 *
 * Focusable elements register themselves via actions / data-focusable attributes.
 * The manager tracks the current focused element and snaps focus on D-pad.
 */
import { get } from "svelte/store";
import { BTN } from "./gamepad";

let focusables: HTMLElement[] = [];
let currentIndex = -1;
let initialized = false;

const FOCUS_RING_ID = "global-focus-ring";

function ensureFocusRing(): HTMLDivElement {
  let ring = document.getElementById(FOCUS_RING_ID) as HTMLDivElement;
  if (!ring) {
    ring = document.createElement("div");
    ring.id = FOCUS_RING_ID;
    ring.style.cssText = `
      position: fixed;
      pointer-events: none;
      border: 3px solid var(--focus-ring);
      border-radius: 6px;
      box-shadow: 0 0 12px var(--focus-ring-glow), inset 0 0 8px rgba(255,215,0,0.3);
      z-index: 9999;
      transition: all 110ms cubic-bezier(0.2, 0.8, 0.2, 1);
      opacity: 0;
      mix-blend-mode: screen;
    `;
    document.body.appendChild(ring);
  }
  return ring;
}

export function initFocus() {
  if (initialized) return;
  initialized = true;
  ensureFocusRing();

  // Refresh focusable list when DOM changes
  const observer = new MutationObserver(() => refreshList());
  observer.observe(document.body, { childList: true, subtree: true });

  // Listen for gamepad / keyboard d-pad
  window.addEventListener("gamepad:dpad", (e: any) => {
    handleDirection(e.detail.dir);
  });
  window.addEventListener("gamepad:button", (e: any) => {
    if (e.detail.index === BTN.A) {
      const el = focusables[currentIndex];
      if (el) {
        el.click();
        // Haptic feedback
        triggerButtonHaptic();
      }
    } else if (e.detail.index === BTN.B) {
      // Back / cancel — dispatch ESC
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    }
  });

  refreshList();
}

export function refreshList() {
  focusables = Array.from(
    document.querySelectorAll<HTMLElement>(
      '.focusable:not([disabled]):not([tabindex="-1"]), button:not([disabled]), [role="button"]:not([disabled]), input:not([disabled]), select:not([disabled])'
    )
  ).filter((el) => isVisible(el));

  if (currentIndex < 0 || !focusables.includes(focusables[currentIndex])) {
    if (focusables.length > 0) {
      currentIndex = 0;
      setFocus(currentIndex);
    }
  } else {
    // Update ring to new positions
    setFocus(currentIndex);
  }
}

function isVisible(el: HTMLElement): boolean {
  if (!el.offsetParent && getComputedStyle(el).position !== "fixed") return false;
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return false;
  const style = getComputedStyle(el);
  if (style.visibility === "hidden" || style.display === "none" || style.opacity === "0") return false;
  return true;
}

function setFocus(idx: number) {
  if (idx < 0 || idx >= focusables.length) return;
  currentIndex = idx;
  const el = focusables[idx];
  const ring = ensureFocusRing();
  const rect = el.getBoundingClientRect();
  ring.style.left = `${rect.left - 4}px`;
  ring.style.top = `${rect.top - 4}px`;
  ring.style.width = `${rect.width + 8}px`;
  ring.style.height = `${rect.height + 8}px`;
  ring.style.opacity = el.offsetParent ? "1" : "0";
  // Add .focused class for any element-specific styling
  focusables.forEach((e) => e.classList.remove("focused"));
  el.classList.add("focused");
  // Scroll into view if needed
  if (el.scrollIntoView) {
    el.scrollIntoView({ block: "nearest", inline: "nearest" });
  }
}

function handleDirection(dir: "up" | "down" | "left" | "right") {
  if (focusables.length === 0) return;
  const cur = focusables[currentIndex];
  if (!cur) {
    setFocus(0);
    return;
  }
  const curRect = cur.getBoundingClientRect();
  const cx = curRect.left + curRect.width / 2;
  const cy = curRect.top + curRect.height / 2;

  let bestIdx = -1;
  let bestDist = Infinity;

  for (let i = 0; i < focusables.length; i++) {
    if (i === currentIndex) continue;
    const el = focusables[i];
    const r = el.getBoundingClientRect();
    const ex = r.left + r.width / 2;
    const ey = r.top + r.height / 2;
    const dx = ex - cx;
    const dy = ey - cy;
    if (dir === "up" && dy > -8) continue;
    if (dir === "down" && dy < 8) continue;
    if (dir === "left" && dx > -8) continue;
    if (dir === "right" && dx < 8) continue;
    const dist = Math.hypot(dx, dy);
    // Bias by primary axis distance
    const primary = dir === "up" || dir === "down" ? Math.abs(dy) : Math.abs(dx);
    const score = primary + dist * 0.3;
    if (score < bestDist) {
      bestDist = score;
      bestIdx = i;
    }
  }

  if (bestIdx >= 0) {
    setFocus(bestIdx);
  }
}

async function triggerButtonHaptic() {
  try {
    const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch (_) { /* not in native */ }
}

export function focusById(id: string) {
  const idx = focusables.findIndex((el) => el.id === id);
  if (idx >= 0) setFocus(idx);
}

export function focusFirst() {
  if (focusables.length > 0) setFocus(0);
}
