/**
 * Keyboard fallback for desktop development.
 * Maps WASD / arrows to D-pad direction, Enter to A, Esc to B, etc.
 */
import { lastInput } from "../core/state";

const KEY_TO_DIR: Record<string, "up" | "down" | "left" | "right"> = {
  ArrowUp: "up", KeyW: "up",
  ArrowDown: "down", KeyS: "down",
  ArrowLeft: "left", KeyA: "left",
  ArrowRight: "right", KeyD: "right",
};

const KEY_TO_BUTTON: Record<string, number> = {
  Enter: 0,      // A
  Space: 0,
  Escape: 1,     // B
  Backspace: 1,
  KeyE: 2,       // X
  KeyQ: 7,       // RT
  KeyR: 3,       // Y
  Tab: 6,        // LT
  KeyZ: 4,       // LB
  KeyX: 5,       // RB
  KeyM: 8,       // SELECT
  KeyP: 9,       // START
};

const heldKeys = new Set<string>();
let repeatTimer = 0;

export function initKeyboard() {
  window.addEventListener("keydown", (e) => {
    if (e.repeat) return;
    lastInput.set("keyboard");
    heldKeys.add(e.code);

    const dir = KEY_TO_DIR[e.code];
    if (dir) {
      window.dispatchEvent(new CustomEvent("gamepad:dpad", { detail: { dir } }));
      // Start auto-repeat
      clearTimeout(repeatTimer);
      repeatTimer = window.setTimeout(() => {
        const interval = window.setInterval(() => {
          if (heldKeys.has(e.code)) {
            const d = KEY_TO_DIR[e.code];
            if (d) window.dispatchEvent(new CustomEvent("gamepad:dpad", { detail: { dir: d } }));
          } else {
            clearInterval(interval);
          }
        }, 90);
      }, 280);
    }

    const btn = KEY_TO_BUTTON[e.code];
    if (btn !== undefined) {
      window.dispatchEvent(new CustomEvent("gamepad:button", { detail: { index: btn } }));
    }
  });

  window.addEventListener("keyup", (e) => {
    heldKeys.delete(e.code);
    clearTimeout(repeatTimer);
  });
}
